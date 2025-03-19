package nginx

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/audetic/godeploy/pkg/config"
	"github.com/yarlson/pin"
)

const (
	mainNginxConfTemplate = `user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    gzip  on;
    gzip_types text/plain application/xml application/javascript text/css;

    include /etc/nginx/conf.d/default.conf;
}
`

	defaultConfTemplate = `server {
    listen       80;
    server_name  localhost;

    # Set port for redirects when running locally
    set $port "";
    if ($http_host ~ "^[^:]+:(\d+)$") {
        set $port ":$1";
    }

    # Include app-specific configurations
    include /etc/nginx/conf.d/apps/*/*.conf;

    # Default caching behavior
    add_header Cache-Control "no-store, no-cache, must-revalidate";

    # App-specific configurations
    {{range .Apps}}
    {{if eq .Path "/"}}
    # Root path configuration
    location / {
        alias   /usr/share/nginx/html/{{.Name}}/;
        index index.html;
        try_files $uri /index.html;
    }
    {{else}}
	

    # Catch-all for subpaths (handles /dashboard/doesntexist)
    location ~ ^{{.Path}}/?(.*)$ {
        root /usr/share/nginx/html/;
        index index.html;
        try_files /{{.Name}}/$1.html /{{.Name}}/$1 /{{.Name}}/index.html;
    }
    {{end}}
    {{end}}
}
`
)

// AssetInfo holds information about a hashed asset file
type AssetInfo struct {
	AppName   string
	AppPath   string
	BaseName  string
	FileName  string
	Extension string
}

// GenerateNginxConfigs generates all Nginx configuration files
func GenerateNginxConfigs(ctx context.Context, spaConfig *config.SpaConfig, outputDir string) error {
	// Create output directories
	nginxDir := filepath.Join(outputDir, "etc", "nginx")
	confDir := filepath.Join(nginxDir, "conf.d")
	appsDir := filepath.Join(confDir, "apps")

	dirs := []string{nginxDir, confDir, appsDir}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	// Generate main nginx.conf
	if err := os.WriteFile(filepath.Join(nginxDir, "nginx.conf"), []byte(mainNginxConfTemplate), 0644); err != nil {
		return fmt.Errorf("failed to write nginx.conf: %w", err)
	}

	// Generate default.conf
	funcMap := template.FuncMap{
		"hasPrefix": strings.HasPrefix,
	}
	tmpl, err := template.New("default.conf").Funcs(funcMap).Parse(defaultConfTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse default.conf template: %w", err)
	}

	defaultConfFile, err := os.Create(filepath.Join(confDir, "default.conf"))
	if err != nil {
		return fmt.Errorf("failed to create default.conf: %w", err)
	}
	defer defaultConfFile.Close()

	data := struct {
		Apps []config.App
	}{
		Apps: spaConfig.GetEnabledApps(),
	}

	if err := tmpl.Execute(defaultConfFile, data); err != nil {
		return fmt.Errorf("failed to execute default.conf template: %w", err)
	}

	for _, app := range spaConfig.GetEnabledApps() {
		// Create a spinner for processing this app
		appSpinner := pin.New(fmt.Sprintf("Processing app '%s'...", app.Name),
			pin.WithSpinnerColor(pin.ColorMagenta),
			pin.WithTextColor(pin.ColorMagenta),
		)
		appCancel := appSpinner.Start(ctx)

		spaDir := app.SourceDir
		if !filepath.IsAbs(spaDir) {
			// If the source directory is relative, resolve it relative to the current directory
			spaDir = filepath.Join(".", spaDir)
		}

		// Check if the SPA directory exists
		if _, err := os.Stat(spaDir); os.IsNotExist(err) {
			appCancel()
			appSpinner.Fail(fmt.Sprintf("Directory '%s' not found", spaDir))
			return fmt.Errorf("SPA directory %s does not exist", spaDir)
		}

		// Process the SPA assets
		if err := ProcessSpaAssets(app, spaDir, outputDir); err != nil {
			appCancel()
			appSpinner.Fail(fmt.Sprintf("Failed to process '%s'", app.Name))
			return fmt.Errorf("failed to process SPA assets for %s: %w", app.Name, err)
		}
		appCancel()
		appSpinner.Stop(fmt.Sprintf("App '%s' processed", app.Name))
	}

	return nil
}

func normalizePath(path string) string {
	return strings.Trim(path, "/")
}

// ProcessSpaAssets processes the assets of a SPA and generates Nginx configurations
func ProcessSpaAssets(app config.App, spaDir, outputDir string) error {
	appDir := filepath.Join(outputDir, "usr", "share", "nginx", "html", app.Slug)
	appConfigDir := filepath.Join(outputDir, "etc", "nginx", "conf.d", "apps", app.Slug)

	// Create app directories
	dirs := []string{appDir, appConfigDir}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	// Copy SPA files to the app directory
	if err := copyDir(spaDir, appDir); err != nil {
		return fmt.Errorf("failed to copy SPA files: %w", err)
	}

	//TODO: do this for all html files
	// Fix base href in index.html
	indexPath := filepath.Join(appDir, "index.html")
	if _, err := os.Stat(indexPath); err == nil {
		baseHrefValue := "/"
		if app.Path != "/" {
			baseHrefValue = fmt.Sprintf("/%s/", normalizePath(app.Path))
		}

		if err := FixBaseHref(indexPath, baseHrefValue); err != nil {
			return fmt.Errorf("failed to fix base href: %w", err)
		}
	}

	// Generate a single dynamic locations.conf
	locationsConfPath := filepath.Join(appConfigDir, "locations.conf")
	if err := GenerateNginxLocations(app, appDir, locationsConfPath); err != nil {
		return fmt.Errorf("failed to generate dynamic locations.conf: %w", err)
	}

	return nil
}

// copyDir copies a directory recursively
func copyDir(src, dst string) error {
	// Create destination directory
	if err := os.MkdirAll(dst, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dst, err)
	}

	// Read source directory
	entries, err := os.ReadDir(src)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", src, err)
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			// Recursively copy subdirectory
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			// Copy file
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}

	return nil
}

// copyFile copies a file
func copyFile(src, dst string) error {
	// Read source file
	data, err := os.ReadFile(src)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %w", src, err)
	}

	// Write destination file
	if err := os.WriteFile(dst, data, 0644); err != nil {
		return fmt.Errorf("failed to write file %s: %w", dst, err)
	}

	return nil
}

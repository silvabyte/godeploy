package nginx

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"

	"github.com/audetic/godeploy/pkg/config"
)

// Templates for Nginx configuration
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

    include /etc/nginx/conf.d/*.conf;
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

    # Default fallback for all apps
    {{range .Apps}}
    {{if eq .Path "/"}}
    # Root path configuration
    location = / {
        alias   /usr/share/nginx/html/{{.Name}}/;
        try_files $uri $uri/ /{{.Name}}/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    location / {
        alias   /usr/share/nginx/html/{{.Name}}/;
        try_files $uri $uri/ /{{.Name}}/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    # Handle root favicon.ico
    location = /favicon.ico {
        alias   /usr/share/nginx/html/{{.Name}}/favicon.ico;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    {{else}}
    # Non-root path configuration
    {{$path := .Path}}
    {{if hasPrefix $path "/"}}
    location {{$path}}/ {
        alias   /usr/share/nginx/html/{{.Name}}/;
        try_files $uri $uri/ /{{.Name}}/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    {{else}}
    location /{{$path}}/ {
        alias   /usr/share/nginx/html/{{.Name}}/;
        try_files $uri $uri/ /{{.Name}}/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    {{end}}
    {{end}}
    {{end}}
}
`

	jsConfTemplate = `{{if eq .AppPath "/"}}
location ~* ^/assets/{{.BaseName}}.js([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /assets/{{.FileName}}$1;
}
location ~* ^/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]js(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
{{else}}
location ~* ^/{{.AppPath}}/assets/{{.BaseName}}.js([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /{{.AppPath}}/assets/{{.FileName}}$1;
}
location ~* ^/{{.AppPath}}/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]js(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
{{end}}
`

	cssConfTemplate = `{{if eq .AppPath "/"}}
location ~* ^/assets/{{.BaseName}}.css([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /assets/{{.FileName}}$1;
}
location ~* ^/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]css(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
{{else}}
location ~* ^/{{.AppPath}}/assets/{{.BaseName}}.css([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /{{.AppPath}}/assets/{{.FileName}}$1;
}
location ~* ^/{{.AppPath}}/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]css(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
{{end}}
`

	localesConfTemplate = `{{if eq .AppPath "/"}}
location ~* ^/locales/(.+)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/locales/$1;
    add_header Cache-Control "no-cache";
}
{{else}}
location ~* ^/{{.AppPath}}/locales/(.+)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/locales/$1;
    add_header Cache-Control "no-cache";
}
location ~* ^/locales/(.+)$ {
    return 301 $scheme://$host$port/{{.AppPath}}/locales/$1;
}
{{end}}
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
func GenerateNginxConfigs(spaConfig *config.SpaConfig, outputDir string) error {
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

	return nil
}

// ProcessSpaAssets processes the assets of a SPA and generates Nginx configurations
func ProcessSpaAssets(app config.App, spaDir, outputDir string) error {
	appDir := filepath.Join(outputDir, "usr", "share", "nginx", "html", app.Name)
	appConfigDir := filepath.Join(outputDir, "etc", "nginx", "conf.d", "apps", app.Name)

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

	// Fix base href in index.html
	indexPath := filepath.Join(appDir, "index.html")
	if _, err := os.Stat(indexPath); err == nil {
		content, err := os.ReadFile(indexPath)
		if err != nil {
			return fmt.Errorf("failed to read index.html: %w", err)
		}

		// Update base href
		contentStr := string(content)
		baseHrefRegex := regexp.MustCompile(`<base href="[^"]*"`)

		// Determine the base href value based on the path
		baseHrefValue := "/"
		if app.Path != "/" {
			baseHrefValue = fmt.Sprintf("/%s/", app.Path)
		}

		if baseHrefRegex.MatchString(contentStr) {
			contentStr = baseHrefRegex.ReplaceAllString(contentStr, fmt.Sprintf(`<base href="%s" />`, baseHrefValue))
		} else {
			// If base href doesn't exist, add it
			headRegex := regexp.MustCompile(`<head>`)
			contentStr = headRegex.ReplaceAllString(contentStr, fmt.Sprintf(`<head>
    <base href="%s" />`, baseHrefValue))
		}

		if err := os.WriteFile(indexPath, []byte(contentStr), 0644); err != nil {
			return fmt.Errorf("failed to write index.html: %w", err)
		}
	}

	// Find and process JS files
	jsFiles, err := findHashedFiles(filepath.Join(appDir, "assets"), ".js", app.Name)
	if err != nil {
		return fmt.Errorf("failed to find JS files: %w", err)
	}

	// Update the AppPath field for each JS file
	for i := range jsFiles {
		jsFiles[i].AppPath = app.Path
	}

	// Find and process CSS files
	cssFiles, err := findHashedFiles(filepath.Join(appDir, "assets"), ".css", app.Name)
	if err != nil {
		return fmt.Errorf("failed to find CSS files: %w", err)
	}

	// Update the AppPath field for each CSS file
	for i := range cssFiles {
		cssFiles[i].AppPath = app.Path
	}

	// Generate JS and CSS configurations
	if len(jsFiles) > 0 || len(cssFiles) > 0 {
		assetsConfPath := filepath.Join(appConfigDir, "assets.conf")
		assetsConfFile, err := os.Create(assetsConfPath)
		if err != nil {
			return fmt.Errorf("failed to create assets.conf: %w", err)
		}
		defer assetsConfFile.Close()

		// Process JS files
		for _, jsFile := range jsFiles {
			tmpl, err := template.New("js.conf").Parse(jsConfTemplate)
			if err != nil {
				return fmt.Errorf("failed to parse JS template: %w", err)
			}

			if err := tmpl.Execute(assetsConfFile, jsFile); err != nil {
				return fmt.Errorf("failed to execute JS template: %w", err)
			}
		}

		// Process CSS files
		for _, cssFile := range cssFiles {
			tmpl, err := template.New("css.conf").Parse(cssConfTemplate)
			if err != nil {
				return fmt.Errorf("failed to parse CSS template: %w", err)
			}

			if err := tmpl.Execute(assetsConfFile, cssFile); err != nil {
				return fmt.Errorf("failed to execute CSS template: %w", err)
			}
		}
	}

	// Check if locales directory exists
	localesDir := filepath.Join(appDir, "locales")
	if _, err := os.Stat(localesDir); err == nil {
		localesConfPath := filepath.Join(appConfigDir, "locales.conf")
		localesConfFile, err := os.Create(localesConfPath)
		if err != nil {
			return fmt.Errorf("failed to create locales.conf: %w", err)
		}
		defer localesConfFile.Close()

		// Create locales configuration
		tmpl, err := template.New("locales.conf").Parse(localesConfTemplate)
		if err != nil {
			return fmt.Errorf("failed to parse locales template: %w", err)
		}

		data := struct {
			AppName string
			AppPath string
		}{
			AppName: app.Name,
			AppPath: app.Path,
		}

		if err := tmpl.Execute(localesConfFile, data); err != nil {
			return fmt.Errorf("failed to execute locales template: %w", err)
		}
	}

	return nil
}

// findHashedFiles finds hashed files in a directory
func findHashedFiles(dir, ext string, appName string) ([]AssetInfo, error) {
	var assets []AssetInfo

	// Regular expression to match hashed filenames (e.g., index-CgbRfOA8.js)
	re := regexp.MustCompile(`^([a-zA-Z0-9_-]+)-([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)$`)

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			// If the directory doesn't exist, return an empty slice
			return assets, nil
		}
		return nil, fmt.Errorf("failed to read directory %s: %w", dir, err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		fileName := entry.Name()
		if !strings.HasSuffix(fileName, ext) {
			continue
		}

		matches := re.FindStringSubmatch(fileName)
		if len(matches) == 4 {
			baseName := matches[1]
			assets = append(assets, AssetInfo{
				AppName:   appName,
				AppPath:   "", // This will be set by the caller
				BaseName:  baseName,
				FileName:  fileName,
				Extension: ext,
			})
		}
	}

	return assets, nil
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

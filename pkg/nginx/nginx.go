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

    # Root redirect to default app
    location = / {
        return 301 /{{.DefaultApp}}/;
    }

    # Include app-specific configurations
    include /etc/nginx/conf.d/apps/*/*.conf;

    # Default fallback for all apps
    {{range .Apps}}
    location /{{.Name}}/ {
        alias   /usr/share/nginx/html/{{.Name}}/;
        try_files $uri $uri/ /{{.Name}}/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
    {{end}}
}
`

	jsConfTemplate = `location ~* ^/{{.AppName}}/assets/{{.BaseName}}.js([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /{{.AppName}}/assets/{{.FileName}}$1;
}
location ~* ^/{{.AppName}}/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]js(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
`

	cssConfTemplate = `location ~* ^/{{.AppName}}/assets/{{.BaseName}}.css([.]map)?$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /{{.AppName}}/assets/{{.FileName}}$1;
}
location ~* ^/{{.AppName}}/assets/({{.BaseName}}-[a-zA-Z0-9]*[.]css(?:[.]map)?)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/assets/$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
`

	localesConfTemplate = `location ~* ^/{{.AppName}}/locales/(.+)$ {
    alias   /usr/share/nginx/html/{{.AppName}}/locales/$1;
    add_header Cache-Control "no-cache";
}
location ~* ^/locales/(.+)$ {
    return 301 /{{.AppName}}/locales/$1;
}
`
)

// AssetInfo holds information about a hashed asset file
type AssetInfo struct {
	AppName   string
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
	tmpl, err := template.New("default.conf").Parse(defaultConfTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse default.conf template: %w", err)
	}

	defaultConfFile, err := os.Create(filepath.Join(confDir, "default.conf"))
	if err != nil {
		return fmt.Errorf("failed to create default.conf: %w", err)
	}
	defer defaultConfFile.Close()

	data := struct {
		DefaultApp string
		Apps       []config.App
	}{
		DefaultApp: spaConfig.DefaultApp,
		Apps:       spaConfig.GetEnabledApps(),
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
		if baseHrefRegex.MatchString(contentStr) {
			contentStr = baseHrefRegex.ReplaceAllString(contentStr, fmt.Sprintf(`<base href="/%s/"`, app.Name))
		} else {
			// If base href doesn't exist, add it
			headRegex := regexp.MustCompile(`<head>`)
			contentStr = headRegex.ReplaceAllString(contentStr, fmt.Sprintf(`<head>
    <base href="/%s/" />`, app.Name))
		}

		// Update asset paths
		contentStr = strings.ReplaceAll(contentStr, `src="/assets/`, fmt.Sprintf(`src="/%s/assets/`, app.Name))
		contentStr = strings.ReplaceAll(contentStr, `href="/assets/`, fmt.Sprintf(`href="/%s/assets/`, app.Name))

		if err := os.WriteFile(indexPath, []byte(contentStr), 0644); err != nil {
			return fmt.Errorf("failed to write updated index.html: %w", err)
		}
	}

	// Process assets directory
	assetsDir := filepath.Join(appDir, "assets")
	if _, err := os.Stat(assetsDir); err == nil {
		// Process JS files
		jsFiles, err := findHashedFiles(assetsDir, ".js", app.Name)
		if err != nil {
			return fmt.Errorf("failed to find JS files: %w", err)
		}

		if len(jsFiles) > 0 {
			jsConfPath := filepath.Join(appConfigDir, "js.conf")
			jsConfFile, err := os.Create(jsConfPath)
			if err != nil {
				return fmt.Errorf("failed to create js.conf: %w", err)
			}
			defer jsConfFile.Close()

			jsTmpl, err := template.New("js.conf").Parse(jsConfTemplate)
			if err != nil {
				return fmt.Errorf("failed to parse js.conf template: %w", err)
			}

			for _, asset := range jsFiles {
				if err := jsTmpl.Execute(jsConfFile, asset); err != nil {
					return fmt.Errorf("failed to execute js.conf template: %w", err)
				}
			}
		}

		// Process CSS files
		cssFiles, err := findHashedFiles(assetsDir, ".css", app.Name)
		if err != nil {
			return fmt.Errorf("failed to find CSS files: %w", err)
		}

		if len(cssFiles) > 0 {
			cssConfPath := filepath.Join(appConfigDir, "css.conf")
			cssConfFile, err := os.Create(cssConfPath)
			if err != nil {
				return fmt.Errorf("failed to create css.conf: %w", err)
			}
			defer cssConfFile.Close()

			cssTmpl, err := template.New("css.conf").Parse(cssConfTemplate)
			if err != nil {
				return fmt.Errorf("failed to parse css.conf template: %w", err)
			}

			for _, asset := range cssFiles {
				if err := cssTmpl.Execute(cssConfFile, asset); err != nil {
					return fmt.Errorf("failed to execute css.conf template: %w", err)
				}
			}
		}
	}

	// Process locales directory
	localesDir := filepath.Join(appDir, "locales")
	if _, err := os.Stat(localesDir); err == nil {
		localesConfPath := filepath.Join(appConfigDir, "locales.conf")
		localesConfFile, err := os.Create(localesConfPath)
		if err != nil {
			return fmt.Errorf("failed to create locales.conf: %w", err)
		}
		defer localesConfFile.Close()

		localesTmpl, err := template.New("locales.conf").Parse(localesConfTemplate)
		if err != nil {
			return fmt.Errorf("failed to parse locales.conf template: %w", err)
		}

		data := struct {
			AppName string
		}{
			AppName: app.Name,
		}

		if err := localesTmpl.Execute(localesConfFile, data); err != nil {
			return fmt.Errorf("failed to execute locales.conf template: %w", err)
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

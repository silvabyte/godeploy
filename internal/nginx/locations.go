package nginx

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/audetic/godeploy/internal/config"
)

// Location represents an Nginx location block.
type Location struct {
	Path  string
	Alias string
	Cache string
}

// GenerateNginxLocations generates Nginx location blocks from a source directory.
func GenerateNginxLocations(app config.App, srcDir, nginxConfPath string) error {
	var locations []string

	err := filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}

		relPath, err := filepath.Rel(srcDir, path)
		if err != nil {
			return err
		}

		webPath, alias := getPaths(app, relPath)

		locationBlock := createLocationBlock(info.Name(), webPath, alias, relPath)
		if locationBlock != "" {
			locations = append(locations, locationBlock)
		}

		return nil
	})

	if err != nil {
		return err
	}

	// Write the generated locations to the Nginx config file
	return os.WriteFile(nginxConfPath, []byte(strings.Join(locations, "\n")), 0644)
}

// getPaths constructs the web path and alias path.
func getPaths(app config.App, relPath string) (webPath, alias string) {
	webPath = "/" + strings.ReplaceAll(relPath, "\\", "/")
	if app.Path != "/" {
		webPath = app.Path + webPath
	}

	aliasRel := app.Slug + "/" + relPath
	alias = fmt.Sprintf("/usr/share/nginx/html/%s", aliasRel)
	return
}

// createLocationBlock generates the appropriate Nginx location block.
func createLocationBlock(fileName, webPath, alias string, relPath string) string {
	if strings.HasSuffix(fileName, ".html") {
		urlPath := strings.TrimSuffix(webPath, ".html")
		fileAlias := alias

		if strings.HasSuffix(relPath, "index.html") {
			// skip index.html files
			return ""
		}

		return fmt.Sprintf(`location = %s {
		alias %s;
		autoindex on;
		add_header Cache-Control "no-store, no-cache, must-revalidate";
	}`, urlPath, fileAlias)
	}

	// Default block for non-HTML files
	return fmt.Sprintf(`location = %s {
	alias %s;
	expires max;
	add_header Cache-Control "public; immutable";
}`, webPath, alias)
}

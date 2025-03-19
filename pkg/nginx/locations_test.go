package nginx_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/audetic/godeploy/pkg/config"
	"github.com/audetic/godeploy/pkg/nginx"
)

func TestGenerateNginxLocations(t *testing.T) {
	srcDir := t.TempDir()
	confPath := filepath.Join(srcDir, "nginx.conf")
	baseDir := "/tacos"

	// Setup mock files
	files := []struct {
		path    string
		content string
	}{
		{"index.html", "<html></html>"},
		{"about.html", "<html></html>"},
		{"style.css", "body {}"},
		{"script.js", "console.log('test');"},
	}

	for _, file := range files {
		filePath := filepath.Join(srcDir, file.path)
		if err := os.WriteFile(filePath, []byte(file.content), 0644); err != nil {
			t.Fatalf("Failed to create mock file %s: %v", file.path, err)
		}
	}

	err := nginx.GenerateNginxLocations(config.App{
		Name:    "Tacos Party",
		Path:    baseDir,
		Enabled: true,
	}, srcDir, confPath)
	if err != nil {
		t.Fatalf("GenerateNginxLocations failed: %v", err)
	}

	confContent, err := os.ReadFile(confPath)
	if err != nil {
		t.Fatalf("Failed to read nginx.conf: %v", err)
	}

	confStr := string(confContent)

	expectedSubstrings := []string{
		"location = /tacos/about {",
		"location = /tacos/style.css {",
		"location = /tacos/script.js {",
		"Cache-Control \"no-store, no-cache, must-revalidate\"",
		"Cache-Control \"public; immutable\"",
	}

	for _, substr := range expectedSubstrings {
		if !strings.Contains(confStr, substr) {
			t.Errorf("Expected substring %q not found in nginx.conf", substr)
		}
	}
}

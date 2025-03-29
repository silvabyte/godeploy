package nginx

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFixBaseHref(t *testing.T) {
	tests := []struct {
		name          string
		initialHTML   string
		baseHref      string
		expectedHTML  string
		expectingFail bool
	}{
		{
			name: "Existing base href replaced",
			initialHTML: `<html>
<head>
<base href="/old/" />
</head>
<body></body>
</html>`,
			baseHref: "/newpath/",
			expectedHTML: `<html>
<head>
<base href="/newpath/" />
</head>
<body></body>
</html>`,
		},
		{
			name: "No existing base href - add one",
			initialHTML: `<html>
<head>
<title>Test</title>
</head>
<body></body>
</html>`,
			baseHref: "/added/",
			expectedHTML: `<html>
<head>
    <base href="/added/" />
<title>Test</title>
</head>
<body></body>
</html>`,
		},
		{
			name: "No head tag - fail",
			initialHTML: `<html>
<body>No head tag</body>
</html>`,
			baseHref:      "/error/",
			expectedHTML:  "",
			expectingFail: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tmpDir := t.TempDir()
			htmlFilePath := filepath.Join(tmpDir, "index.html")

			if err := os.WriteFile(htmlFilePath, []byte(tt.initialHTML), 0644); err != nil {
				t.Fatalf("failed to write test file: %v", err)
			}

			err := FixBaseHref(htmlFilePath, tt.baseHref)
			if tt.expectingFail {
				if err == nil {
					t.Errorf("expected failure, got nil error")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			result, err := os.ReadFile(htmlFilePath)
			if err != nil {
				t.Fatalf("failed to read test file: %v", err)
			}

			resultStr := strings.TrimSpace(string(result))
			expectedStr := strings.TrimSpace(tt.expectedHTML)

			if resultStr != expectedStr {
				t.Errorf("content mismatch:\nExpected:\n%s\n\nGot:\n%s", expectedStr, resultStr)
			}
		})
	}
}

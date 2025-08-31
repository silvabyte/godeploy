package archive

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCreateAndReadZipFile(t *testing.T) {
	// Create a temporary directory for the test
	tempDir, err := os.MkdirTemp("", "godeploy-test-*")
	if err != nil {
		t.Fatalf("Failed to create temporary directory: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a source directory
	sourceDir := filepath.Join(tempDir, "source")
	if err := os.Mkdir(sourceDir, 0o755); err != nil {
		t.Fatalf("Failed to create source directory: %v", err)
	}

	// Create a test file in the source directory
	testFile := filepath.Join(sourceDir, "test.txt")
	testContent := []byte("This is a test file for the zip archive")
	if err := os.WriteFile(testFile, testContent, 0o644); err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// Create a subdirectory
	subDir := filepath.Join(sourceDir, "subdir")
	if err := os.Mkdir(subDir, 0o755); err != nil {
		t.Fatalf("Failed to create subdirectory: %v", err)
	}

	// Create a test file in the subdirectory
	subTestFile := filepath.Join(subDir, "subtest.txt")
	subTestContent := []byte("This is a test file in a subdirectory")
	if err := os.WriteFile(subTestFile, subTestContent, 0o644); err != nil {
		t.Fatalf("Failed to create test file in subdirectory: %v", err)
	}

	// Create the zip file
	zipFile := filepath.Join(tempDir, "test.zip")
	if err := CreateZipFromDirectory(sourceDir, zipFile); err != nil {
		t.Fatalf("Failed to create zip file: %v", err)
	}

	// Check if the zip file exists
	if _, err := os.Stat(zipFile); os.IsNotExist(err) {
		t.Fatalf("Zip file was not created")
	}

	// Read the zip file
	zipData, err := ReadZipFile(zipFile)
	if err != nil {
		t.Fatalf("Failed to read zip file: %v", err)
	}

	// Check if the zip data is not empty
	if len(zipData) == 0 {
		t.Fatalf("Zip data is empty")
	}
}

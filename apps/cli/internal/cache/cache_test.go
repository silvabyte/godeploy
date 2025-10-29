package cache

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/adrg/xdg"
)

// TestGetDeploymentCacheDir tests that deployment cache directories are created correctly
func TestGetDeploymentCacheDir(t *testing.T) {
	projectName := "test-project"

	cacheDir, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get deployment cache dir: %v", err)
	}

	// Verify the directory was created
	if _, err := os.Stat(cacheDir); os.IsNotExist(err) {
		t.Fatalf("Cache directory was not created: %s", cacheDir)
	}

	// Verify the path structure
	if !strings.Contains(cacheDir, "godeploy") {
		t.Fatalf("Cache dir should contain 'godeploy', got %s", cacheDir)
	}

	if !strings.Contains(cacheDir, "deploys") {
		t.Fatalf("Cache dir should contain 'deploys', got %s", cacheDir)
	}

	if !strings.Contains(cacheDir, projectName) {
		t.Fatalf("Cache dir should contain project name '%s', got %s", projectName, cacheDir)
	}

	// Verify it's under XDG cache home
	if !strings.HasPrefix(cacheDir, xdg.CacheHome) {
		t.Fatalf("Cache dir should be under XDG_CACHE_HOME (%s), got %s", xdg.CacheHome, cacheDir)
	}

	// Clean up
	if err := RemoveDeploymentCache(cacheDir); err != nil {
		t.Fatalf("Failed to remove cache directory: %v", err)
	}

	// Verify it was removed
	if _, err := os.Stat(cacheDir); !os.IsNotExist(err) {
		t.Fatalf("Cache directory should have been removed: %s", cacheDir)
	}
}

// TestGetDeploymentCacheDirUniqueness tests that each call creates a unique directory
func TestGetDeploymentCacheDirUniqueness(t *testing.T) {
	projectName := "test-project"

	// Create two cache directories with a small delay
	cacheDir1, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get first cache dir: %v", err)
	}
	defer RemoveDeploymentCache(cacheDir1)

	// Small delay to ensure different timestamp
	time.Sleep(time.Second)

	cacheDir2, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get second cache dir: %v", err)
	}
	defer RemoveDeploymentCache(cacheDir2)

	// Verify they are different
	if cacheDir1 == cacheDir2 {
		t.Fatalf("Cache directories should be unique, both are %s", cacheDir1)
	}

	// Verify both exist
	if _, err := os.Stat(cacheDir1); os.IsNotExist(err) {
		t.Fatalf("First cache directory should exist: %s", cacheDir1)
	}

	if _, err := os.Stat(cacheDir2); os.IsNotExist(err) {
		t.Fatalf("Second cache directory should exist: %s", cacheDir2)
	}
}

// TestRemoveDeploymentCache tests cache directory removal
func TestRemoveDeploymentCache(t *testing.T) {
	projectName := "test-project"

	// Create a cache directory
	cacheDir, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get cache dir: %v", err)
	}

	// Create a test file in the cache directory
	testFilePath := filepath.Join(cacheDir, "test.txt")
	if err := os.WriteFile(testFilePath, []byte("test"), 0o644); err != nil {
		t.Fatalf("Failed to write test file: %v", err)
	}

	// Verify file exists
	if _, err := os.Stat(testFilePath); os.IsNotExist(err) {
		t.Fatalf("Test file should exist: %s", testFilePath)
	}

	// Remove the cache directory
	if err := RemoveDeploymentCache(cacheDir); err != nil {
		t.Fatalf("Failed to remove cache directory: %v", err)
	}

	// Verify the entire directory is gone
	if _, err := os.Stat(cacheDir); !os.IsNotExist(err) {
		t.Fatalf("Cache directory should be removed: %s", cacheDir)
	}

	// Verify the file is gone too
	if _, err := os.Stat(testFilePath); !os.IsNotExist(err) {
		t.Fatalf("Test file should be removed: %s", testFilePath)
	}
}

// TestRemoveDeploymentCacheEmptyPath tests that removing empty path is safe
func TestRemoveDeploymentCacheEmptyPath(t *testing.T) {
	err := RemoveDeploymentCache("")
	if err != nil {
		t.Fatalf("Removing empty cache path should not error: %v", err)
	}
}

// TestCleanupOldCaches tests cleanup of old cache directories
func TestCleanupOldCaches(t *testing.T) {
	projectName := "test-project"

	// Create a cache directory
	cacheDir, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get cache dir: %v", err)
	}
	defer RemoveDeploymentCache(cacheDir)

	// Get the parent deploys directory
	deploysDir := filepath.Join(xdg.CacheHome, "godeploy", "deploys")

	// Create an "old" cache directory by manually creating one with an old timestamp
	oldTimestamp := time.Now().Add(-48 * time.Hour).Format("20060102-150405")
	oldCacheDir := filepath.Join(deploysDir, oldTimestamp+"-old-project")
	if err := os.MkdirAll(oldCacheDir, 0o755); err != nil {
		t.Fatalf("Failed to create old cache dir: %v", err)
	}

	// Modify the directory's mtime to make it appear old
	oldTime := time.Now().Add(-48 * time.Hour)
	if err := os.Chtimes(oldCacheDir, oldTime, oldTime); err != nil {
		t.Fatalf("Failed to set old time on directory: %v", err)
	}

	// Verify both directories exist
	if _, err := os.Stat(cacheDir); os.IsNotExist(err) {
		t.Fatalf("New cache directory should exist: %s", cacheDir)
	}
	if _, err := os.Stat(oldCacheDir); os.IsNotExist(err) {
		t.Fatalf("Old cache directory should exist: %s", oldCacheDir)
	}

	// Clean up caches older than 24 hours
	if err := CleanupOldCaches(24 * time.Hour); err != nil {
		t.Fatalf("Failed to cleanup old caches: %v", err)
	}

	// Verify the new cache still exists
	if _, err := os.Stat(cacheDir); os.IsNotExist(err) {
		t.Fatalf("New cache directory should still exist after cleanup: %s", cacheDir)
	}

	// Verify the old cache was removed
	if _, err := os.Stat(oldCacheDir); !os.IsNotExist(err) {
		t.Fatalf("Old cache directory should be removed after cleanup: %s", oldCacheDir)
	}
}

// TestCleanupOldCachesNoDeploysDir tests cleanup when deploys directory doesn't exist
func TestCleanupOldCachesNoDeploysDir(t *testing.T) {
	// Save original XDG_CACHE_HOME
	originalCacheHome := os.Getenv("XDG_CACHE_HOME")

	// Create a temporary directory
	tempDir := t.TempDir()

	// Set XDG_CACHE_HOME to a non-existent subdirectory
	nonExistentDir := filepath.Join(tempDir, "nonexistent")
	os.Setenv("XDG_CACHE_HOME", nonExistentDir)

	// Restore original XDG_CACHE_HOME after test
	defer os.Setenv("XDG_CACHE_HOME", originalCacheHome)

	// This should not error even if the directory doesn't exist
	err := CleanupOldCaches(24 * time.Hour)
	if err != nil {
		t.Fatalf("Cleanup should not error when deploys dir doesn't exist: %v", err)
	}
}

// TestCacheDirectoryStructure tests the overall cache directory structure
func TestCacheDirectoryStructure(t *testing.T) {
	projectName := "my-app"

	cacheDir, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get cache dir: %v", err)
	}
	defer RemoveDeploymentCache(cacheDir)

	// Verify the path structure follows XDG spec
	// Should be: $XDG_CACHE_HOME/godeploy/deploys/TIMESTAMP-PROJECTNAME/
	expectedPattern := filepath.Join(xdg.CacheHome, "godeploy", "deploys")
	if !strings.HasPrefix(cacheDir, expectedPattern) {
		t.Fatalf("Cache dir should follow pattern %s/*, got %s", expectedPattern, cacheDir)
	}

	// Verify directory name format (YYYYMMDD-HHMMSS-projectname)
	dirName := filepath.Base(cacheDir)
	parts := strings.Split(dirName, "-")
	if len(parts) < 3 {
		t.Fatalf("Cache dir name should be TIMESTAMP-PROJECT format, got %s", dirName)
	}

	// Verify timestamp portion looks reasonable (YYYYMMDD-HHMMSS)
	timestamp := parts[0] + "-" + parts[1]
	if len(timestamp) != len("20060102-150405") {
		t.Fatalf("Timestamp portion should be 15 chars (YYYYMMDD-HHMMSS), got %s (%d chars)", timestamp, len(timestamp))
	}

	// Verify project name is in the directory name
	if !strings.Contains(dirName, projectName) {
		t.Fatalf("Directory name should contain project name '%s', got %s", projectName, dirName)
	}
}

// TestCacheDirectoryPermissions tests that cache directories have correct permissions
func TestCacheDirectoryPermissions(t *testing.T) {
	if os.Getenv("SKIP_PERMISSION_TESTS") != "" {
		t.Skip("Skipping permission test (SKIP_PERMISSION_TESTS is set)")
	}

	projectName := "test-project"

	cacheDir, err := GetDeploymentCacheDir(projectName)
	if err != nil {
		t.Fatalf("Failed to get cache dir: %v", err)
	}
	defer RemoveDeploymentCache(cacheDir)

	// Check directory permissions
	info, err := os.Stat(cacheDir)
	if err != nil {
		t.Fatalf("Failed to stat cache directory: %v", err)
	}

	expectedPerm := os.FileMode(0o755)
	if info.Mode().Perm() != expectedPerm {
		t.Fatalf("Expected cache directory permissions %o, got %o", expectedPerm, info.Mode().Perm())
	}
}

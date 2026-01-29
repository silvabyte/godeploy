package cache

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/silvabyte/godeploy/internal/paths"
)

// GetDeploymentCacheDir returns the directory for deployment caches
// using XDG Base Directory specification via the paths package
func GetDeploymentCacheDir(projectName string) (string, error) {
	// Create a timestamped directory for this deployment
	timestamp := time.Now().Format("20060102-150405")
	cacheDir := filepath.Join(paths.DeployCacheDir(), fmt.Sprintf("%s-%s", timestamp, projectName))

	// Create the directory
	if err := os.MkdirAll(cacheDir, 0o755); err != nil {
		return "", fmt.Errorf("failed to create cache directory: %w", err)
	}

	return cacheDir, nil
}

// CleanupOldCaches removes deployment cache directories older than the specified duration
func CleanupOldCaches(olderThan time.Duration) error {
	deploysDir := paths.DeployCacheDir()

	// If the deploys directory doesn't exist, nothing to clean up
	if _, err := os.Stat(deploysDir); os.IsNotExist(err) {
		return nil
	}

	entries, err := os.ReadDir(deploysDir)
	if err != nil {
		return fmt.Errorf("failed to read deploys directory: %w", err)
	}

	cutoff := time.Now().Add(-olderThan)

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		// Remove directories older than cutoff
		if info.ModTime().Before(cutoff) {
			dirPath := filepath.Join(deploysDir, entry.Name())
			if err := os.RemoveAll(dirPath); err != nil {
				// Log error but continue cleaning
				fmt.Fprintf(os.Stderr, "Warning: failed to remove old cache directory %s: %v\n", dirPath, err)
			}
		}
	}

	return nil
}

// RemoveDeploymentCache removes a specific deployment cache directory
func RemoveDeploymentCache(cacheDir string) error {
	if cacheDir == "" {
		return nil
	}

	if err := os.RemoveAll(cacheDir); err != nil {
		return fmt.Errorf("failed to remove cache directory: %w", err)
	}

	return nil
}

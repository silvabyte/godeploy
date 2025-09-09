package archive

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ZipStats contains statistics about a zip operation
type ZipStats struct {
	FileCount        int           `json:"file_count"`
	TotalSize        int64         `json:"total_size"`
	CompressedSize   int64         `json:"compressed_size"`
	CompressionRatio float64       `json:"compression_ratio"`
	Duration         time.Duration `json:"duration"`
	SourceDir        string        `json:"source_dir"`
	OutputPath       string        `json:"output_path"`
}

// CreateZipFromDirectory creates a zip archive from a directory and returns statistics
func CreateZipFromDirectory(sourceDir, outputPath string) (*ZipStats, error) {
	startTime := time.Now()
	stats := &ZipStats{
		SourceDir:  sourceDir,
		OutputPath: outputPath,
	}
	zipFile, err := os.Create(outputPath)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = zipFile.Close()
	}()

	archive := zip.NewWriter(zipFile)

	walkErr := filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Update file count and total size
		stats.FileCount++
		stats.TotalSize += info.Size()

		// Create relative path for the file in the zip
		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}

		// Convert to forward slashes for zip compatibility
		relPath = strings.ReplaceAll(relPath, string(filepath.Separator), "/")

		// Create a zip file header
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = relPath
		header.Method = zip.Deflate

		// Create the file in the zip
		writer, err := archive.CreateHeader(header)
		if err != nil {
			return err
		}

		// Open the source file
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer func() {
			_ = file.Close()
		}()

		// Copy the file contents to the zip
		_, err = io.Copy(writer, file)
		return err
	})

	if walkErr != nil {
		return nil, walkErr
	}

	// Close the archive writer to finalize the zip
	if err := archive.Close(); err != nil {
		return nil, fmt.Errorf("failed to close archive: %w", err)
	}

	// Get final compressed size and calculate stats
	stats.Duration = time.Since(startTime)
	
	// Get the compressed size from the zip file
	if zipFileInfo, err := os.Stat(outputPath); err == nil {
		stats.CompressedSize = zipFileInfo.Size()
	}

	// Calculate compression ratio
	if stats.TotalSize > 0 {
		stats.CompressionRatio = float64(stats.CompressedSize) / float64(stats.TotalSize) * 100
	}

	return stats, nil
}

// ReadZipFile reads a zip file and returns its contents as a byte array
func ReadZipFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

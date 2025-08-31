package archive

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// CreateZipFromDirectory creates a zip archive from a directory
func CreateZipFromDirectory(sourceDir, outputPath string) error {
	zipFile, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

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
		defer file.Close()

		// Copy the file contents to the zip
		_, err = io.Copy(writer, file)
		return err
	})
}

// ReadZipFile reads a zip file and returns its contents as a byte array
func ReadZipFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

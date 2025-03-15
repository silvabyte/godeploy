import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import AdmZip from 'adm-zip';

/**
 * Utility functions for file operations
 */
export class FileUtils {
  /**
   * Save a file buffer to a temporary location
   * @param buffer File buffer
   * @param filename Filename
   */
  static async saveBufferToTemp(
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-'));
    const filePath = path.join(tempDir, filename);

    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Validate a SPA archive
   * @param archivePath Path to the SPA archive
   */
  static async validateSpaArchive(archivePath: string): Promise<boolean> {
    try {
      const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'godeploy-validate-')
      );

      try {
        // Extract the archive
        const zip = new AdmZip(archivePath);
        zip.extractAllTo(tempDir, true);

        // Check for index.html
        const indexPath = path.join(tempDir, 'index.html');
        await fs.access(indexPath);

        return true;
      } finally {
        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Read and parse a JSON file
   * @param filePath Path to the JSON file
   */
  static async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Clean up a temporary file
   * @param filePath Path to the file
   */
  static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      // If it's a file, remove it
      await fs.unlink(filePath);

      // Try to remove the parent directory if it's empty
      const dirPath = path.dirname(filePath);
      if (dirPath.includes('godeploy-')) {
        const files = await fs.readdir(dirPath);
        if (files.length === 0) {
          await fs.rmdir(dirPath);
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Error during cleanup:', error);
    }
  }

  /**
   * Generate a unique filename
   * @param originalName Original filename
   */
  static generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return `${baseName}-${timestamp}-${random}${ext}`;
  }
}

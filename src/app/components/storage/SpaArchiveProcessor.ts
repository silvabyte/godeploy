import { to } from 'await-to-js'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { Zip } from './Zip'

interface Result<T> {
  data: T | null
  error: string | null
}

/**
 * Handles SPA archive validation and temporary file management for deployments
 */
export class SpaArchiveProcessor {
  //TODO: convert to use streams
  /**
   * Save a file buffer to a temporary location
   * @param buffer File buffer
   * @param filename Filename
   * @returns Result containing the file path or error message
   */
  static async saveBufferToTemp(buffer: Buffer, filename: string): Promise<Result<string>> {
    const [mkdirErr, tempDir] = await to(fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-')))
    if (mkdirErr) {
      return {
        data: null,
        error: `Failed to create temp directory: ${mkdirErr.message}`,
      }
    }

    const filePath = path.join(tempDir, filename)
    const [writeErr] = await to(fs.writeFile(filePath, buffer))
    if (writeErr) {
      return {
        data: null,
        error: `Failed to write file: ${writeErr.message}`,
      }
    }

    return { data: filePath, error: null }
  }

  /**
   * Validate a SPA archive by extracting and checking its contents
   * @param archivePath Path to the SPA archive
   * @returns Result containing validation status and any error message
   */
  static async validateSpaArchive(archivePath: string): Promise<Result<boolean>> {
    const [mkdirErr, tempDir] = await to(fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-validate-')))
    if (mkdirErr) {
      return {
        data: false,
        error: `Failed to create validation directory: ${mkdirErr.message}`,
      }
    }

    try {
      // Extract the archive
      try {
        await Zip.extract(archivePath, tempDir)
      } catch (extractErr) {
        return {
          data: false,
          error: `Failed to extract archive: ${extractErr instanceof Error ? extractErr.message : 'Unknown zip error'}`,
        }
      }

      // Check if the archive contains any files
      const [readErr, files] = await to(fs.readdir(tempDir))
      if (readErr) {
        return {
          data: false,
          error: `Failed to read archive contents: ${readErr.message}`,
        }
      }

      if (files.length === 0) {
        return {
          data: false,
          error: 'Archive is empty',
        }
      }

      // Check if there are any valid static files
      const validResult = await SpaArchiveProcessor.hasValidStaticFiles(tempDir)
      if (validResult.error) {
        return {
          data: false,
          error: validResult.error,
        }
      }

      return {
        data: validResult.data ?? false,
        error: validResult.data ? null : 'No valid static files found in archive',
      }
    } finally {
      // Clean up
      await to(fs.rm(tempDir, { recursive: true, force: true }))
    }
  }

  /**
   * Check if a directory contains valid static files for SPA deployment
   * @param dirPath Path to the directory
   * @returns Result containing validation status and any error message
   */
  private static async hasValidStaticFiles(dirPath: string): Promise<Result<boolean>> {
    const [readErr, entries] = await to(fs.readdir(dirPath, { withFileTypes: true }))
    if (readErr) {
      return {
        data: false,
        error: `Failed to read directory: ${readErr.message}`,
      }
    }

    if (entries.length === 0) {
      return {
        data: false,
        error: 'Directory is empty',
      }
    }

    // Check for valid files
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Recursively check subdirectories
        const subdirResult = await SpaArchiveProcessor.hasValidStaticFiles(path.join(dirPath, entry.name))
        if (!subdirResult.error && subdirResult.data) {
          return { data: true, error: null }
        }
      } else if (entry.isFile()) {
        // Any file is considered valid
        return { data: true, error: null }
      }
    }

    return { data: false, error: 'No valid files found' }
  }

  /**
   * Read and parse a JSON configuration file
   * @param filePath Path to the JSON file
   * @returns Result containing parsed config or error message
   */
  static async readConfigFile<T>(filePath: string): Promise<Result<T>> {
    const [readErr, content] = await to(fs.readFile(filePath, 'utf-8'))
    if (readErr) {
      return {
        data: null,
        error: `Failed to read config file: ${readErr.message}`,
      }
    }

    try {
      return { data: JSON.parse(content) as T, error: null }
    } catch (parseErr) {
      return {
        data: null,
        error: `Failed to parse config file: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`,
      }
    }
  }

  /**
   * Clean up temporary files and directories created during processing
   * @param filePath Path to the file
   * @returns Result indicating success or failure
   */
  static async cleanupTempFile(filePath: string): Promise<Result<void>> {
    // If it's a file, remove it
    const [unlinkErr] = await to(fs.unlink(filePath))
    if (unlinkErr) {
      return {
        data: null,
        error: `Failed to remove file: ${unlinkErr.message}`,
      }
    }

    // Try to remove the parent directory if it's empty
    const dirPath = path.dirname(filePath)
    if (dirPath.includes('godeploy-')) {
      const [readErr, files] = await to(fs.readdir(dirPath))
      if (readErr) {
        return {
          data: null,
          error: `Failed to read directory: ${readErr.message}`,
        }
      }

      if (files.length === 0) {
        const [rmdirErr] = await to(fs.rmdir(dirPath))
        if (rmdirErr) {
          return {
            data: null,
            error: `Failed to remove directory: ${rmdirErr.message}`,
          }
        }
      }
    }

    return { data: null, error: null }
  }
}

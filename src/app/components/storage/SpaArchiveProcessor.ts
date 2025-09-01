import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { to } from 'await-to-js'
import { extractZip } from './Zip'

interface Result<T> {
  data: T | null
  error: string | null
}

//TODO: convert to use streams
/**
 * Save a file buffer to a temporary location
 * @param buffer File buffer
 * @param filename Filename
 * @returns Result containing the file path or error message
 */
export async function saveBufferToTemp(buffer: Buffer, filename: string): Promise<Result<string>> {
  const [mkdirErr, tempDir] = await to(fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-')))
  if (mkdirErr) {
    return {
      data: null,
      error: `Failed to create temp directory: ${mkdirErr.message}`,
    }
  }

  const filePath = path.join(tempDir, filename)
  const [writeErr] = await to(fs.writeFile(filePath, new Uint8Array(buffer)))
  if (writeErr) {
    return {
      data: null,
      error: `Failed to write file: ${writeErr.message}`,
    }
  }

  return { data: filePath, error: null }
}

/**
 * Validate a SPA archive file
 * Checks that the archive contains static files
 * @param archivePath Path to the archive file
 * @returns Result containing validation status
 */
export async function validateSpaArchive(archivePath: string): Promise<Result<boolean>> {
  try {
    // Create a temporary directory for extraction
    const [mkdirErr, tempDir] = await to(fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-validate-')))
    if (mkdirErr) {
      return {
        data: null,
        error: `Failed to create temp directory: ${mkdirErr.message}`,
      }
    }

    try {
      // Extract the archive
      await extractZip(archivePath, tempDir)

      // Just check if there are any files in the archive
      const entries = await fs.readdir(tempDir)

      if (entries.length === 0) {
        return {
          data: false,
          error: 'Archive is empty. Please ensure your static files are included.',
        }
      }

      // If there's a single directory, check if it has contents
      if (entries.length === 1 && entries[0]) {
        const firstEntry = path.join(tempDir, entries[0])
        const stats = await fs.stat(firstEntry)
        if (stats.isDirectory()) {
          const nestedEntries = await fs.readdir(firstEntry)
          if (nestedEntries.length === 0) {
            return {
              data: false,
              error: 'Archive directory is empty. Please ensure your static files are included.',
            }
          }
        }
      }

      // Archive has files, validation passes
      return { data: true, error: null }
    } finally {
      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {
        // Ignore cleanup errors
      })
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

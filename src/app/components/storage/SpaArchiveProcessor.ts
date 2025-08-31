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
 * Validate a SPA archive file
 * Checks for required index.html file
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

      // Check for index.html at various common locations
      const possiblePaths = [
        path.join(tempDir, 'index.html'),
        path.join(tempDir, 'dist', 'index.html'),
        path.join(tempDir, 'build', 'index.html'),
        path.join(tempDir, 'public', 'index.html'),
        path.join(tempDir, 'out', 'index.html'),
      ]

      for (const indexPath of possiblePaths) {
        try {
          await fs.access(indexPath)
          // Found index.html, archive is valid
          return { data: true, error: null }
        } catch {
          // Continue checking other paths
        }
      }

      // Also check if the first directory in the archive contains index.html
      // (common when archiving a built directory)
      const entries = await fs.readdir(tempDir)
      if (entries.length === 1) {
        const firstEntry = path.join(tempDir, entries[0])
        const stats = await fs.stat(firstEntry)
        if (stats.isDirectory()) {
          const nestedIndexPath = path.join(firstEntry, 'index.html')
          try {
            await fs.access(nestedIndexPath)
            return { data: true, error: null }
          } catch {
            // Not found in nested directory either
          }
        }
      }

      return {
        data: false,
        error: 'Archive does not contain index.html. Please ensure your SPA build is included.',
      }
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

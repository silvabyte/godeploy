import { createWriteStream } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { to } from 'await-to-js'
import unzipper from 'unzipper'

interface Result<T> {
  data: T | null
  error: string | null
}

/**
 * Save a readable stream to a temporary file
 * @param stream Readable stream
 * @param filename Filename to use in the temp directory
 */
export async function saveStreamToTemp(stream: NodeJS.ReadableStream, filename: string): Promise<Result<string>> {
  const [mkdirErr, tempDir] = await to(fs.mkdtemp(path.join(os.tmpdir(), 'godeploy-')))
  if (mkdirErr) {
    return {
      data: null,
      error: `Failed to create temp directory: ${mkdirErr.message}`,
    }
  }

  const filePath = path.join(tempDir, filename)
  const writeStream = createWriteStream(filePath)
  const [pipeErr] = await to(pipeline(stream, writeStream))
  if (pipeErr) {
    return {
      data: null,
      error: `Failed to write stream: ${pipeErr instanceof Error ? pipeErr.message : 'Unknown stream error'}`,
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
    // Inspect the zip without extracting to avoid disk and memory overhead
    const zip = await unzipper.Open.file(archivePath)
    // Consider non-directory entries as files
    const hasFiles = zip.files.some((f) => !f.path.endsWith('/') && f.type === 'File')

    if (!hasFiles) {
      return {
        data: false,
        error: 'Archive is empty. Please ensure your static files are included.',
      }
    }

    return { data: true, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

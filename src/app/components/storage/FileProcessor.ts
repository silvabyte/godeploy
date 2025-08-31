import type { MultipartFile } from '@fastify/multipart'
import { to } from 'await-to-js'
import type { ActionTelemetry } from '../../../logging/ActionTelemetry'
import { saveBufferToTemp, validateSpaArchive } from './SpaArchiveProcessor'

interface Result<T> {
  data: T | null
  error: string | null
}

interface ProcessedFiles {
  archivePath: string | null
  configPath: string | null
  error: string | null
}

export class FileProcessor {
  constructor(private measure: ActionTelemetry) {}

  /**
   * Process uploaded files for deployment
   * @param parts Iterator of multipart files
   * @returns Object containing paths to processed files and any error
   */
  async processDeployFiles(parts: AsyncIterableIterator<MultipartFile>): Promise<ProcessedFiles> {
    this.measure.add('validate_files')

    let archivePath: string | null = null
    let configPath: string | null = null
    const error: string | null = null

    try {
      // Process the uploaded files
      for await (const part of parts) {
        if (part.type === 'file') {
          const [bufferErr, buffer] = await to(part.toBuffer())
          if (bufferErr) {
            return {
              archivePath: null,
              configPath: null,
              error: `Failed to read file buffer: ${bufferErr.message}`,
            }
          }

          this.measure.add('process_file', {
            fieldname: part.fieldname,
            size: buffer.length,
          })

          if (part.fieldname === 'archive' || part.filename.includes('.zip')) {
            this.measure.add('save_archive')
            const result = await saveBufferToTemp(buffer, 'archive.zip')
            if (result.error) {
              return {
                archivePath: null,
                configPath,
                error: result.error,
              }
            }
            archivePath = result.data
            this.measure.add('archive_saved', { path: archivePath })
          } else if (part.fieldname === 'spa_config') {
            this.measure.add('save_config')
            const result = await saveBufferToTemp(buffer, 'spa-config.json')
            if (result.error) {
              return {
                archivePath,
                configPath: null,
                error: result.error,
              }
            }
            configPath = result.data
            this.measure.add('config_saved', { path: configPath })
          }
        }
      }

      return { archivePath, configPath, error }
    } catch (err) {
      return {
        archivePath: null,
        configPath: null,
        error: `Failed to process files: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Validate the archive file
   * @param archivePath Path to the archive file
   * @returns Result containing validation status and error message
   */
  async validateArchive(archivePath: string): Promise<Result<boolean>> {
    if (!archivePath) {
      return {
        data: false,
        error: 'Archive file is required',
      }
    }

    const result = await validateSpaArchive(archivePath)
    return result
  }
}

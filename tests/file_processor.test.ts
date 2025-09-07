import { describe, it, expect } from 'bun:test'
import type { MultipartFile } from '@fastify/multipart'
import { FileProcessor } from '../src/app/components/storage/FileProcessor'
import { ActionTelemetry } from '../src/logging/ActionTelemetry'
import { readFile } from 'node:fs/promises'

function makePart(opts: {
  fieldname: string
  filename: string
  content: string | Uint8Array
}): MultipartFile {
  const buf = typeof opts.content === 'string' ? new TextEncoder().encode(opts.content) : opts.content
  return {
    type: 'file',
    fieldname: opts.fieldname,
    filename: opts.filename,
    toBuffer: async () => Buffer.from(buf),
    // Unused fields for our test; provide minimal stubs
    file: undefined as any,
    mimetype: 'application/octet-stream',
    encoding: '7bit',
    fields: {},
  } as unknown as MultipartFile
}

async function* iterParts(parts: MultipartFile[]) {
  for (const p of parts) yield p
}

describe('FileProcessor.processDeployFiles', () => {
  it('saves archive and config files to temp paths', async () => {
    const measure = new ActionTelemetry({
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
      trace: () => {},
      fatal: () => {},
      silent: () => {},
      child: () => ({}) as any,
      level: 'info',
      setLevel: () => {},
      logRequest: () => {},
    } as any)

    const processor = new FileProcessor(measure)

    const archiveContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04]) // zip magic header minimal bytes
    const configContent = JSON.stringify({ spa: true })

    const parts = [
      makePart({ fieldname: 'archive', filename: 'site.zip', content: archiveContent }),
      makePart({ fieldname: 'spa_config', filename: 'spa-config.json', content: configContent }),
    ]

    const result = await processor.processDeployFiles(iterParts(parts) as any)
    expect(result.error).toBeNull()
    expect(result.archivePath).toBeTruthy()
    expect(result.configPath).toBeTruthy()

    // Verify contents were written
    const writtenConfig = await readFile(result.configPath!, 'utf8')
    expect(writtenConfig).toContain('spa')
  })
})


import { describe, expect, it } from 'bun:test'
import * as path from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises'

import { StorageService } from '../src/app/components/storage/StorageService'

describe('StorageService.uploadDirectory dir.close() robustness', () => {
  it('walks directory and closes Dir without throwing', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'godeploy-walk-'))
    const sub = path.join(root, 'assets')
    await mkdir(sub, { recursive: true })
    await writeFile(path.join(root, 'index.html'), '<!doctype html>')
    await writeFile(path.join(sub, 'app.js'), 'console.log(1)')

    const service = new StorageService()

    // Stub uploadFile to avoid network and always succeed
    const origUpload = (service as any).uploadFile
    ;(service as any).uploadFile = async () => ({ data: '', error: null })

    try {
      const res = await (service as any).uploadDirectory(root, 'test/base')
      expect(res.error).toBeNull()
    } finally {
      // Restore stubs and cleanup
      ;(service as any).uploadFile = origUpload
      await rm(root, { recursive: true, force: true })
    }
  })
})

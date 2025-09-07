import { createReadStream } from 'node:fs'
import unzipper from 'unzipper'

export async function extractZip(zipFile: string, to: string) {
  // Use a pure-JS unzip to avoid child_process instability in Bun
  return new Promise<void>((resolve, reject) => {
    const stream = createReadStream(zipFile)
      .pipe(unzipper.Extract({ path: to }))
      .on('close', () => resolve())
      .on('error', (err: unknown) => reject(err))

    // Propagate read stream errors as well
    stream.on('error', (err: unknown) => reject(err))
  })
}

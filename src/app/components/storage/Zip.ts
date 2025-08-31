import { execa } from 'execa'

export async function extractZip(zipFile: string, to: string) {
  return execa('unzip', [zipFile, '-d', to])
}

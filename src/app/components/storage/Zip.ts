import { execa } from 'execa'

export async function extractZip(zipFile: string, to: string) {
  return execa('unzip', [zipFile, '-d', to])
}

export async function createZip(dir: string, zipFile: string) {
  return execa('zip', ['-r', zipFile, dir], { cwd: dir })
}

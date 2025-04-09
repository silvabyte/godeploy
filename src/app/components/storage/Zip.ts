import { execa } from 'execa';

export class Zip {
  static async extract(zipFile: string, to: string) {
    return execa('unzip', [zipFile, '-d', to]);
  }

  static async create(dir: string, zipFile: string) {
    return execa('zip', ['-r', zipFile, dir], { cwd: dir });
  }
}

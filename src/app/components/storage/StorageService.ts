import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { to } from 'await-to-js';
import { constructCdnUrl, constructStorageKey } from '../../utils/url';
import { Zip } from './Zip';
//TODO: ensure we use streams for all file operations to avoid inevitable nodejs memory issues
// couple the above with plimit library to limit the number of concurrent file operations our server does at a time to avoid overloading the server

interface Result<T> {
  data: T | null;
  error: string | null;
}

// DigitalOcean Spaces configuration
const spacesEndpoint = process.env.DIGITAL_OCEAN_SPACES_ENDPOINT || '';
const bucketName = process.env.DIGITAL_OCEAN_SPACES_BUCKET || '';

// Create S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: `https://${spacesEndpoint}`,
  region: 'us-east-1', // DigitalOcean uses this region for API compatibility
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_KEY || '',
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET || '',
  },
});

/**
 * Storage service for handling file uploads to DigitalOcean Spaces
 */
export class StorageService {
  /**
   * Upload a file to DigitalOcean Spaces
   * @param fileStream ReadStream of the file to upload
   * @param key Path within the bucket where the file will be stored
   * @param contentType MIME type of the file
   * @param cacheControl Cache-Control header value
   * @returns Result containing the uploaded file URL or error message
   */
  async uploadFile(
    fileStream: ReadStream,
    key: string,
    contentType: string,
    cacheControl: string
  ): Promise<Result<string>> {
    try {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: fileStream,
          ContentType: contentType,
          CacheControl: cacheControl,
          ACL: 'public-read',
        },
      });

      const [uploadErr] = await to(upload.done());
      if (uploadErr) {
        return {
          data: null,
          error: `Failed to upload file: ${uploadErr.message}`,
        };
      }

      return {
        data: `https://${bucketName}.${spacesEndpoint}/${key}`,
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: `Failed to upload file: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      };
    }
  }

  /**
   * Process and upload a SPA archive to DigitalOcean Spaces
   * @param archivePath Path to the SPA zip archive
   * @param subdomain The unique subdomain for the project
   * @returns Result containing the CDN URL or error message
   */
  async processSpaArchive(
    archivePath: string,
    subdomain: string
  ): Promise<Result<string>> {
    // Create a temporary directory to extract the archive
    const [mkdirErr, tempDir] = await to(
      fs.mkdtemp(join(os.tmpdir(), 'godeploy-'))
    );
    if (mkdirErr) {
      return {
        data: null,
        error: `Failed to create temp directory: ${mkdirErr.message}`,
      };
    }

    try {
      // Extract the archive
      try {
        await Zip.extract(archivePath, tempDir);
      } catch (extractErr) {
        return {
          data: null,
          error: `Failed to extract archive: ${
            extractErr instanceof Error
              ? extractErr.message
              : 'Unknown zip error'
          }`,
        };
      }

      // Use the new storage key format
      const baseKey = constructStorageKey(subdomain);
      const cdnUrl = constructCdnUrl(subdomain);

      // Process all files recursively
      const uploadResult = await this.uploadDirectory(tempDir, baseKey);
      if (uploadResult.error) {
        return uploadResult;
      }

      return { data: cdnUrl, error: null };
    } finally {
      // Clean up temporary directory
      await to(fs.rm(tempDir, { recursive: true, force: true }));
    }
  }

  /**
   * Upload a directory recursively to DigitalOcean Spaces
   * @param dirPath Local directory path
   * @param baseKey Base key (path) in the bucket
   * @returns Result indicating success or error
   */
  private async uploadDirectory(
    dirPath: string,
    baseKey: string
  ): Promise<Result<string>> {
    const [readErr, entries] = await to(
      fs.readdir(dirPath, { withFileTypes: true })
    );
    if (readErr) {
      return {
        data: null,
        error: `Failed to read directory: ${readErr.message}`,
      };
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(dirPath, fullPath);
      const key = path.join(baseKey, relativePath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const uploadResult = await this.uploadDirectory(fullPath, key);
        if (uploadResult.error) {
          return uploadResult;
        }
      } else {
        // Determine content type based on file extension
        const contentType = this.getContentType(entry.name);

        // Set cache control based on file type
        const cacheControl = this.getCacheControl(entry.name);

        // Upload the file
        const fileStream = createReadStream(fullPath);
        const uploadResult = await this.uploadFile(
          fileStream,
          key,
          contentType,
          cacheControl
        );
        if (uploadResult.error) {
          return uploadResult;
        }
      }
    }

    return { data: '', error: null };
  }

  /**
   * Get the content type based on file extension
   * @param filename Filename
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

    const contentTypes: Record<string, string> = {
      // HTML
      '.html': 'text/html',
      '.htm': 'text/html',

      // Stylesheets
      '.css': 'text/css',

      // JavaScript
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',

      // JSON
      '.json': 'application/json',

      // Images
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',

      // Fonts
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'font/otf',

      // Documents
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Text
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.md': 'text/markdown',
      '.markdown': 'text/markdown',

      // Scripts
      '.sh': 'text/x-sh',
      '.bash': 'text/x-sh',
      '.zsh': 'text/x-sh',
      '.py': 'text/x-python',
      '.rb': 'text/x-ruby',
      '.pl': 'text/x-perl',
      '.php': 'text/x-php',

      // Archives
      '.zip': 'application/zip',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.rar': 'application/vnd.rar',
      '.7z': 'application/x-7z-compressed',

      // Audio
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.aac': 'audio/aac',

      // Video
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',

      // Other
      '.xml': 'application/xml',
      '.yaml': 'application/yaml',
      '.yml': 'application/yaml',
      '.toml': 'application/toml',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get the cache control header based on file type
   * @param filename Filename
   */
  private getCacheControl(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const basename = path.basename(filename).toLowerCase();

    // No cache for HTML files, config files, and executable scripts
    // This ensures users always get the latest version of these critical files
    if (
      ext === '.html' ||
      ext === '.htm' ||
      ext === '.sh' ||
      ext === '.bash' ||
      ext === '.py' ||
      ext === '.rb' ||
      ext === '.php' ||
      ext === '.pl' ||
      basename.includes('config') ||
      basename.includes('settings') ||
      basename === 'install' ||
      basename === 'setup' ||
      basename.startsWith('run-')
    ) {
      return 'no-cache';
    }

    // Long-term caching for hashed assets (containing a hash in the filename)
    if (
      /\.[a-f0-9]{8,}\./.test(filename) ||
      /[-_][a-f0-9]{8,}\./.test(filename)
    ) {
      return 'max-age=31536000, immutable';
    }

    // Medium-term caching for static assets
    const staticAssets = [
      '.css',
      '.js',
      '.mjs',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.webp',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
      '.otf',
      '.mp3',
      '.mp4',
      '.webm',
    ];
    if (staticAssets.includes(ext)) {
      return 'max-age=604800'; // 7 days
    }

    // Default cache control for other assets
    return 'max-age=86400'; // 1 day
  }
}

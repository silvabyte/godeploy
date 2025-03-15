import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import AdmZip from 'adm-zip';

// DigitalOcean Spaces configuration
const spacesEndpoint = 'nyc3.digitaloceanspaces.com'; // Change to your region
const bucketName = 'godeploy-spa-assets'; // Your bucket name

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
   */
  async uploadFile(
    fileStream: ReadStream,
    key: string,
    contentType: string,
    cacheControl: string
  ): Promise<string> {
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

      await upload.done();
      return `https://${bucketName}.${spacesEndpoint}/${key}`;
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Process and upload a SPA archive to DigitalOcean Spaces
   * @param archivePath Path to the SPA zip archive
   * @param tenantId Tenant ID
   * @param projectId Project ID
   * @param projectName Project name for the subdomain
   */
  async processSpaArchive(
    archivePath: string,
    tenantId: string,
    projectId: string,
    projectName: string
  ): Promise<string> {
    // Create a temporary directory to extract the archive
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'godeploy-'));

    try {
      // Extract the archive
      const zip = new AdmZip(archivePath);
      zip.extractAllTo(tempDir, true);

      // Validate the SPA structure (must have index.html)
      const indexPath = path.join(tempDir, 'index.html');
      try {
        await fs.access(indexPath);
      } catch (error) {
        throw new Error('Invalid SPA archive: index.html not found');
      }

      // Upload all files with appropriate cache headers
      const baseKey = `spa-projects/${tenantId}/${projectId}`;
      const cdnUrl = `https://${projectName}.godeploy.app`;

      // Process all files recursively
      await this.uploadDirectory(tempDir, baseKey);

      return cdnUrl;
    } finally {
      // Clean up temporary directory
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Upload a directory recursively to DigitalOcean Spaces
   * @param dirPath Local directory path
   * @param baseKey Base key (path) in the bucket
   */
  private async uploadDirectory(
    dirPath: string,
    baseKey: string
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(dirPath, fullPath);
      const key = path.join(baseKey, relativePath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        await this.uploadDirectory(fullPath, key);
      } else {
        // Determine content type based on file extension
        const contentType = this.getContentType(entry.name);

        // Set cache control based on file type
        const cacheControl = this.getCacheControl(entry.name);

        // Upload the file
        const fileStream = createReadStream(fullPath);
        await this.uploadFile(fileStream, key, contentType, cacheControl);
      }
    }
  }

  /**
   * Get the content type based on file extension
   * @param filename Filename
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'font/otf',
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

    // No cache for index.html and spa-config.json
    if (basename === 'index.html' || basename === 'spa-config.json') {
      return 'no-cache';
    }

    // Long-term caching for hashed assets (containing a hash in the filename)
    if (/\.[a-f0-9]{8,}\./.test(filename)) {
      return 'max-age=31536000, immutable';
    }

    // Default cache control for other assets
    return 'max-age=86400';
  }
}

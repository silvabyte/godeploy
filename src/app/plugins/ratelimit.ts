import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

const SUSPICIOUS_PATHS = [
  // Configuration Files
  '/.env',
  '/config.yml',
  '/config.yaml',
  '/config.json',
  '/cloud-config.yml',
  '/database.sql',
  '/config/database.php',
  '/config.php',
  '/config.yaml',
  '/config.json',

  // Backup Files
  '/backup.sql',
  '/backup.zip',
  '/backup.tar.gz',
  '/database-backup.sql',
  '/db-backup.sql',
  '/backup.tar',
  '/database.tar.gz',

  // Git and Version Control
  '/.git/HEAD',
  '/.git/config',
  '/.gitignore',
  '/.svn/entries',
  '/.svn/wc.db',

  // SSH and Keys
  '/.ssh/id_rsa',
  '/etc/ssl/private/server.key',
  '/.aws/credentials',

  // Server Status and Logs
  '/server-status',
  '/logs/access.log',
  '/logs/error.log',
  '/server-info',
  '/phpinfo',

  // CMS/Framework Default Paths
  '/wp-config.php',
  '/wp-admin',
  '/wp-login.php',
  '/wp-content/uploads',
  '/wp-content/plugins',
  '/joomla/administrator',
  '/drupal/admin',
  '/cms/admin',
  '/cms/config',

  // Others
  '/admin',
  '/login',
  '/phpmyadmin',
  '/phpMyAdmin',
  '/mysqladmin',
  '/api/v1/users',
  '/api/v1/admin',
  '/feed',
  '/sitemap.xml',
  '/robots.txt',
  '/default.aspx',
  '/index.php',
  '/test',
  '/test.php',
  '/debug',
];
const blockedIPs = new Set<string>();

/**
 * This plugins adds rate limit support
 *
 * @see https://github.com/fastify/fastify-rate-limit
 */
export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  });

  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 100,
        timeWindow: '1 minute',
      }),
    },
    (_request, reply) => {
      void reply.code(404).send({ message: 'Not Found' });
    }
  );

  // Global onRequest hook for spam detection
  fastify.addHook('onRequest', async (request, reply) => {
    const ip = request.ip;

    // Block already flagged IPs
    if (blockedIPs.has(ip)) {
      return reply.code(429).send({ message: 'Too Many Requests' });
    }

    // Check for suspicious paths
    if (SUSPICIOUS_PATHS.some((path) => request.url.includes(path))) {
      request.log.debug(
        `Suspicious request detected from IP: ${ip} - ${request.url}`
      );
      // Block IP after detection (optionally implement temporary blocking logic)
      blockedIPs.add(ip);

      return reply
        .code(429)
        .send({ message: 'Blocked due to suspicious activity' });
    }
  });
});

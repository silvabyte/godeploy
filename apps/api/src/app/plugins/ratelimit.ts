import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * This plugins adds minimal rate limit support
 *
 * @see https://github.com/fastify/fastify-rate-limit
 */
export default fp(async (fastify: FastifyInstance) => {
	// Register a very permissive global rate limit
	await fastify.register(rateLimit, {
		global: true,
		max: 1000, // Very high limit
		timeWindow: "1 minute",
	});

	// Only apply stricter rate limits to 404 routes to prevent scanning
	fastify.setNotFoundHandler(
		{
			preHandler: fastify.rateLimit({
				max: 200,
				timeWindow: "1 minute",
			}),
		},
		async (_request, reply) => {
			await reply.code(404).send({ message: "Not Found" });
		},
	);

	// // Keep minimal protection against obvious abuse attempts
	// fastify.addHook('onRequest', async (request, reply) => {
	//   const ip = request.ip;

	//   // Block already flagged IPs
	//   if (blockedIPs.has(ip)) {
	//     return reply.code(429).send({ message: 'Too Many Requests' });
	//   }

	//   // Only check for the most suspicious paths
	//   if (SUSPICIOUS_PATHS.some((path) => request.url.includes(path))) {
	//     request.log.debug(
	//       `Suspicious request detected from IP: ${ip} - ${request.url}`
	//     );
	//     // Block IP after detection
	//     blockedIPs.add(ip);

	//     return reply
	//       .code(429)
	//       .send({ message: 'Blocked due to suspicious activity' });
	//   }
	// });
});

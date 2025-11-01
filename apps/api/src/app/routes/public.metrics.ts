import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { zeroFillDailySeries } from "../utils/timeSeries";

const pageParamsSchema = z.object({ slug: z.string() });

const rangeQuerySchema = z.object({
	from: z.string().optional(),
	to: z.string().optional(),
	interval: z.enum(["day"]).default("day").optional(),
});

const pageResponseSchema = z.object({
	slug: z.string(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	projectIds: z.array(z.string()),
	isPublic: z.boolean(),
});

const frequencyResponseSchema = z.object({
	range: z.object({ from: z.string(), to: z.string(), interval: z.string() }),
	series: z.array(
		z.object({
			projectId: z.string(),
			data: z.array(z.object({ date: z.string(), count: z.number() })),
		}),
	),
	totals: z.object({ overall: z.number(), byProject: z.record(z.number()) }),
});

export default async function (fastify: FastifyInstance) {
	// Get public page metadata
	fastify.get("/api/public/metrics/:slug", {
		schema: {
			params: zodToJsonSchema(pageParamsSchema),
			response: {
				200: zodToJsonSchema(pageResponseSchema),
				404: zodToJsonSchema(z.object({ error: z.string() })),
			},
		},
		handler: async (
			request: FastifyRequest<{ Params: { slug: string } }>,
			reply: FastifyReply,
		) => {
			const { slug } = request.params;
			request.measure.start("public_metrics_page", { slug });

			const pageResult = await request.db.metricsPages.getBySlug(slug);
			if (
				pageResult.error ||
				!pageResult.data ||
				pageResult.data.is_public !== true
			) {
				request.measure.failure("Page not found or not public");
				return reply.code(404).send({ error: "Metrics page not found" });
			}

			const page = pageResult.data;
			request.measure.success();
			return reply.code(200).send({
				slug: page.slug,
				title: page.title ?? null,
				description: page.description ?? null,
				projectIds: page.project_ids,
				isPublic: page.is_public,
			});
		},
	});

	// Get daily deployment frequency
	fastify.get("/api/public/metrics/:slug/deploy-frequency", {
		schema: {
			params: zodToJsonSchema(pageParamsSchema),
			querystring: zodToJsonSchema(rangeQuerySchema),
			response: {
				200: zodToJsonSchema(frequencyResponseSchema),
				404: zodToJsonSchema(z.object({ error: z.string() })),
			},
		},
		handler: async (
			request: FastifyRequest<{
				Params: { slug: string };
				Querystring: { from?: string; to?: string; interval?: string };
			}>,
			reply: FastifyReply,
		) => {
			const { slug } = request.params;
			const now = new Date();
			const defaultFrom = new Date(now);
			defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
			const fromStr: string = request.query.from ?? defaultFrom.toISOString();
			const toStr: string = request.query.to ?? now.toISOString();

			request.measure.start("public_metrics_frequency", {
				slug,
				from: fromStr,
				to: toStr,
			});

			const pageResult = await request.db.metricsPages.getBySlug(slug);
			if (
				pageResult.error ||
				!pageResult.data ||
				pageResult.data.is_public !== true
			) {
				request.measure.failure("Page not found or not public");
				return reply.code(404).send({ error: "Metrics page not found" });
			}

			const projectIds = pageResult.data.project_ids;
			if (!projectIds.length) {
				request.measure.success();
				return reply.code(200).send({
					range: { from: fromStr, to: toStr, interval: "day" },
					series: [],
					totals: { overall: 0, byProject: {} },
				});
			}

			const deploysResult =
				await request.db.deploys.getSuccessfulDeploysInRange(
					projectIds,
					fromStr,
					toStr,
				);
			if (deploysResult.error || !deploysResult.data) {
				request.measure.failure(
					deploysResult.error || "Failed to fetch deploys",
				);
				return reply.code(500).send({ error: "Failed to fetch deploys" });
			}

			// Group by project and day
			const countsByProject: Record<string, Record<string, number>> = {};
			for (const d of deploysResult.data) {
				const day = new Date(d.created_at as string).toISOString().slice(0, 10);
				const pid = d.project_id as string;
				if (!countsByProject[pid]) countsByProject[pid] = {};
				const bucket = countsByProject[pid] as Record<string, number>;
				bucket[day] = (bucket[day] ?? 0) + 1;
			}

			const series = projectIds.map((pid) => ({
				projectId: pid,
				data: zeroFillDailySeries(
					fromStr.slice(0, 10),
					toStr.slice(0, 10),
					countsByProject[pid] ?? {},
				),
			}));

			const totalsByProject: Record<string, number> = {};
			let overall = 0;
			for (const s of series) {
				const total = s.data.reduce((acc, v) => acc + v.count, 0);
				totalsByProject[s.projectId] = total;
				overall += total;
			}

			request.measure.success();
			return reply.code(200).send({
				range: { from: fromStr, to: toStr, interval: "day" },
				series,
				totals: { overall, byProject: totalsByProject },
			});
		},
	});
}

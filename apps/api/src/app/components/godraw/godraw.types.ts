import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { commonResponseSchemas } from "../http/response.types";

// ============================================
// Excalidraw Types (subset of what we need)
// ============================================

// Simplified Excalidraw element type (actual type is much more complex)
export const excalidrawElementSchema = z.record(z.unknown());
export const excalidrawAppStateSchema = z.record(z.unknown());
export const excalidrawFilesSchema = z.record(z.unknown());

// ============================================
// GoDraw Project Schemas
// ============================================

export const godrawProjectSchema = z.object({
	id: z.string(),
	project_id: z.string(),
	tenant_id: z.string(),
	theme: z.enum(["light", "dark"]),
	home_page_id: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const createGodrawProjectSchema = z.object({
	name: z.string().min(3, "Project name must be at least 3 characters"),
	description: z.string().optional(),
	theme: z.enum(["light", "dark"]).optional().default("light"),
});

export const updateGodrawProjectSchema = z.object({
	theme: z.enum(["light", "dark"]).optional(),
	home_page_id: z.string().nullable().optional(),
});

// ============================================
// GoDraw Page Schemas
// ============================================

export const godrawPageSchema = z.object({
	id: z.string(),
	godraw_project_id: z.string(),
	tenant_id: z.string(),
	name: z.string(),
	slug: z.string(),
	elements: z.array(excalidrawElementSchema),
	app_state: excalidrawAppStateSchema,
	files: excalidrawFilesSchema,
	order_index: z.number(),
	is_published: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const createGodrawPageSchema = z.object({
	name: z.string().min(1, "Page name is required"),
	slug: z
		.string()
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must be lowercase alphanumeric with hyphens",
		)
		.optional(),
	elements: z.array(excalidrawElementSchema).optional().default([]),
	app_state: excalidrawAppStateSchema.optional().default({}),
	files: excalidrawFilesSchema.optional().default({}),
	order_index: z.number().optional(),
	is_published: z.boolean().optional().default(true),
});

export const updateGodrawPageSchema = z.object({
	name: z.string().min(1).optional(),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
	elements: z.array(excalidrawElementSchema).optional(),
	app_state: excalidrawAppStateSchema.optional(),
	files: excalidrawFilesSchema.optional(),
	order_index: z.number().optional(),
	is_published: z.boolean().optional(),
});

export const reorderPagesSchema = z.object({
	page_ids: z.array(z.string()).min(1, "At least one page ID is required"),
});

// ============================================
// Response Schemas
// ============================================

export const createGodrawProjectResponseSchema = z.object({
	project: z.object({
		id: z.string(),
		name: z.string(),
		subdomain: z.string(),
		project_type: z.string(),
	}),
	godraw_project: godrawProjectSchema,
	default_page: godrawPageSchema,
});

export const godrawProjectWithPagesSchema = z.object({
	godraw_project: godrawProjectSchema,
	pages: z.array(godrawPageSchema),
});

// ============================================
// JSON Schema Generation for OpenAPI
// ============================================

export const godrawProjectJsonSchema = zodToJsonSchema(godrawProjectSchema);
export const createGodrawProjectJsonSchema = zodToJsonSchema(
	createGodrawProjectSchema,
);
export const updateGodrawProjectJsonSchema = zodToJsonSchema(
	updateGodrawProjectSchema,
);

export const godrawPageJsonSchema = zodToJsonSchema(godrawPageSchema);
export const createGodrawPageJsonSchema = zodToJsonSchema(
	createGodrawPageSchema,
);
export const updateGodrawPageJsonSchema = zodToJsonSchema(
	updateGodrawPageSchema,
);
export const reorderPagesJsonSchema = zodToJsonSchema(reorderPagesSchema);

export const createGodrawProjectResponseJsonSchema = zodToJsonSchema(
	createGodrawProjectResponseSchema,
);
export const godrawProjectWithPagesJsonSchema = zodToJsonSchema(
	godrawProjectWithPagesSchema,
);

// ============================================
// Route Schemas for Fastify
// ============================================

export const routeSchemas = {
	createGodrawProject: {
		schema: {
			security: [{ bearerAuth: [] }],
			body: createGodrawProjectJsonSchema,
			response: {
				201: createGodrawProjectResponseJsonSchema,
				400: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	getGodrawProject: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(z.object({ projectId: z.string() })),
			response: {
				200: godrawProjectWithPagesJsonSchema,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	updateGodrawProject: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(z.object({ projectId: z.string() })),
			body: updateGodrawProjectJsonSchema,
			response: {
				200: godrawProjectJsonSchema,
				400: commonResponseSchemas.error,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	createPage: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(z.object({ projectId: z.string() })),
			body: createGodrawPageJsonSchema,
			response: {
				201: godrawPageJsonSchema,
				400: commonResponseSchemas.error,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	listPages: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(z.object({ projectId: z.string() })),
			querystring: zodToJsonSchema(
				z.object({
					includeUnpublished: z.string().optional(),
				}),
			),
			response: {
				200: zodToJsonSchema(z.object({ pages: z.array(godrawPageSchema) })),
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	getPage: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(
				z.object({
					projectId: z.string(),
					pageId: z.string(),
				}),
			),
			response: {
				200: godrawPageJsonSchema,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	updatePage: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(
				z.object({
					projectId: z.string(),
					pageId: z.string(),
				}),
			),
			body: updateGodrawPageJsonSchema,
			response: {
				200: godrawPageJsonSchema,
				400: commonResponseSchemas.error,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	deletePage: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(
				z.object({
					projectId: z.string(),
					pageId: z.string(),
				}),
			),
			response: {
				204: z.void(),
				400: commonResponseSchemas.error,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
	reorderPages: {
		schema: {
			security: [{ bearerAuth: [] }],
			params: zodToJsonSchema(z.object({ projectId: z.string() })),
			body: reorderPagesJsonSchema,
			response: {
				200: zodToJsonSchema(z.object({ success: z.boolean() })),
				400: commonResponseSchemas.error,
				404: commonResponseSchemas.error,
				500: commonResponseSchemas.error,
			},
		},
	},
};

// ============================================
// Type Exports
// ============================================

export type GodrawProject = z.infer<typeof godrawProjectSchema>;
export type CreateGodrawProject = z.infer<typeof createGodrawProjectSchema>;
export type UpdateGodrawProject = z.infer<typeof updateGodrawProjectSchema>;

export type GodrawPage = z.infer<typeof godrawPageSchema>;
export type CreateGodrawPage = z.infer<typeof createGodrawPageSchema>;
export type UpdateGodrawPage = z.infer<typeof updateGodrawPageSchema>;
export type ReorderPages = z.infer<typeof reorderPagesSchema>;

export type CreateGodrawProjectResponse = z.infer<
	typeof createGodrawProjectResponseSchema
>;
export type GodrawProjectWithPages = z.infer<
	typeof godrawProjectWithPagesSchema
>;

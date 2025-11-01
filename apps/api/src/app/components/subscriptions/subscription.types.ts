import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
	commonResponseSchemas,
	errorResponseJsonSchema,
	notFoundResponseJsonSchema,
	successResponseJsonSchema,
} from "../http/response.types";

// Define Zod schemas
export const subscriptionSchema = z.object({
	id: z.string(),
	tenant_id: z.string(),
	plan_name: z.string(),
	price_cents: z.number(),
	currency: z.string(),
	interval: z.string(),
	status: z.enum(["active", "canceled", "expired"]),
	trial_ends_at: z.string().nullable(),
	current_period_start: z.string(),
	current_period_end: z.string().nullable(),
	stripe_subscription_id: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const createSubscriptionSchema = z.object({
	plan_name: z.string(),
	price_cents: z.number(),
	currency: z.string().default("usd"),
	interval: z.string().default("monthly"),
	trial_ends_at: z.string().optional(),
	current_period_end: z.string().optional(),
	stripe_subscription_id: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
	plan_name: z.string().optional(),
	price_cents: z.number().optional(),
	currency: z.string().optional(),
	interval: z.string().optional(),
	status: z.enum(["active", "canceled", "expired"]).optional(),
	trial_ends_at: z.string().optional(),
	current_period_end: z.string().optional(),
	stripe_subscription_id: z.string().optional(),
});

// Generate JSON schemas
export const subscriptionJsonSchema = zodToJsonSchema(subscriptionSchema);
export const createSubscriptionJsonSchema = zodToJsonSchema(
	createSubscriptionSchema,
);
export const updateSubscriptionJsonSchema = zodToJsonSchema(
	updateSubscriptionSchema,
);

// Define types from Zod schemas
export type Subscription = z.infer<typeof subscriptionSchema>;
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;

// Define route schemas
export const routeSchemas = {
	getCurrent: {
		schema: {
			security: [{ bearerAuth: [] }],
			response: {
				200: subscriptionJsonSchema,
				404: notFoundResponseJsonSchema,
				500: errorResponseJsonSchema,
			},
		},
	},
	create: {
		schema: {
			security: [{ bearerAuth: [] }],
			body: createSubscriptionJsonSchema,
			response: {
				201: subscriptionJsonSchema,
				400: commonResponseSchemas.error,
				500: errorResponseJsonSchema,
			},
		},
	},
	update: {
		schema: {
			security: [{ bearerAuth: [] }],
			body: updateSubscriptionJsonSchema,
			response: {
				200: subscriptionJsonSchema,
				404: notFoundResponseJsonSchema,
				500: errorResponseJsonSchema,
			},
		},
	},
	cancel: {
		schema: {
			security: [{ bearerAuth: [] }],
			response: {
				200: successResponseJsonSchema,
				404: notFoundResponseJsonSchema,
				500: errorResponseJsonSchema,
			},
		},
	},
};

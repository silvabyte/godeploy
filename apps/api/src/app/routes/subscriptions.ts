import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
	type CreateSubscription,
	routeSchemas,
	type UpdateSubscription,
} from "../components/subscriptions/subscription.types";

export default async function (fastify: FastifyInstance) {
	// Get current subscription
	fastify.get("/api/subscriptions/current", {
		...routeSchemas.getCurrent,
		handler: async (request: FastifyRequest, reply: FastifyReply) => {
			const { tenant_id } = request.user;
			request.measure.start("get_current_subscription", { tenant_id });

			const subscriptionResult =
				await request.db.subscriptions.getSubscription(tenant_id);

			if (subscriptionResult.error) {
				request.measure.failure(subscriptionResult.error);
				return reply.code(500).send({
					error: "Failed to fetch subscription",
					message: subscriptionResult.error,
				});
			}

			if (!subscriptionResult.data) {
				request.measure.failure("No active subscription found");
				return reply.code(404).send({
					error: "No active subscription found",
				});
			}

			request.measure.success({ subscription_id: subscriptionResult.data.id });
			return reply.code(200).send(subscriptionResult.data);
		},
	});

	// Create a new subscription
	fastify.post("/api/subscriptions", {
		...routeSchemas.create,
		handler: async (
			request: FastifyRequest<{
				Body: CreateSubscription;
			}>,
			reply: FastifyReply,
		) => {
			const { tenant_id } = request.user;
			request.measure.start("create_subscription", {
				tenant_id,
				...request.body,
			});

			const subscriptionData = {
				...request.body,
				tenant_id,
				status: "active" as const,
				current_period_start: new Date().toISOString(),
				current_period_end: request.body.current_period_end || null,
				trial_ends_at: request.body.trial_ends_at || null,
				stripe_subscription_id: request.body.stripe_subscription_id || null,
				currency: request.body.currency || "usd",
				interval: request.body.interval || "monthly",
			};

			const subscriptionResult =
				await request.db.subscriptions.createSubscription(subscriptionData);

			if (subscriptionResult.error || !subscriptionResult.data) {
				request.measure.failure(
					subscriptionResult.error || "Failed to create subscription",
				);
				return reply.code(500).send({
					error: "Failed to create subscription",
					message: subscriptionResult.error,
				});
			}

			request.measure.success({ subscription_id: subscriptionResult.data.id });
			return reply.code(201).send(subscriptionResult.data);
		},
	});

	// Update a subscription
	fastify.patch("/api/subscriptions/:id", {
		...routeSchemas.update,
		handler: async (
			request: FastifyRequest<{
				Body: UpdateSubscription;
				Params: { id: string };
			}>,
			reply: FastifyReply,
		) => {
			const { tenant_id } = request.user;
			request.measure.start("update_subscription", {
				tenant_id,
				subscription_id: request.params.id,
				...request.body,
			});

			const subscriptionResult =
				await request.db.subscriptions.updateSubscription(
					request.params.id,
					request.body,
				);

			if (subscriptionResult.error || !subscriptionResult.data) {
				request.measure.failure(
					subscriptionResult.error || "Failed to update subscription",
				);
				return reply.code(500).send({
					error: "Failed to update subscription",
					message: subscriptionResult.error,
				});
			}

			request.measure.success({ subscription_id: subscriptionResult.data.id });
			return reply.code(200).send(subscriptionResult.data);
		},
	});

	// Cancel a subscription
	fastify.post("/api/subscriptions/:id/cancel", {
		...routeSchemas.cancel,
		handler: async (
			request: FastifyRequest<{
				Params: { id: string };
			}>,
			reply: FastifyReply,
		) => {
			const { tenant_id } = request.user;
			request.measure.start("cancel_subscription", {
				tenant_id,
				subscription_id: request.params.id,
			});

			const cancelResult = await request.db.subscriptions.cancelSubscription(
				request.params.id,
			);

			if (cancelResult.error) {
				request.measure.failure(cancelResult.error);
				return reply.code(500).send({
					error: "Failed to cancel subscription",
					message: cancelResult.error,
				});
			}

			request.measure.success({ subscription_id: request.params.id });
			return reply.code(200).send({ success: true });
		},
	});
}

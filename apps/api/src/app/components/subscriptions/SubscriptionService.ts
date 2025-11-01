import type { Result } from "../../types/result.types";
import { BaseService } from "../services/BaseService";
import type { Subscription } from "./subscription.types";

/**
 * Service for managing subscriptions
 */
export class SubscriptionService extends BaseService {
	constructor() {
		super("subscriptions");
	}

	/**
	 * Get subscription for a tenant
	 * @param tenantId Tenant ID
	 * @returns Result containing the subscription or error message
	 */
	async getSubscription(tenantId: string): Promise<Result<Subscription>> {
		return this.getOneByFilters<Subscription>({
			tenant_id: tenantId,
			status: "active",
		});
	}

	/**
	 * Create a new subscription
	 * @param subscription Subscription data
	 * @returns Result containing the created subscription or error message
	 */
	async createSubscription(
		subscription: Omit<Subscription, "id" | "created_at" | "updated_at">,
	): Promise<Result<Subscription>> {
		return this.create<Subscription>(subscription);
	}

	/**
	 * Update a subscription
	 * @param subscriptionId Subscription ID
	 * @param updates Partial subscription data to update
	 * @returns Result containing the updated subscription or error message
	 */
	async updateSubscription(
		subscriptionId: string,
		updates: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>,
	): Promise<Result<Subscription>> {
		return this.update<Subscription>(subscriptionId, updates);
	}

	/**
	 * Cancel a subscription
	 * @param subscriptionId Subscription ID
	 * @returns Result indicating success or error message
	 */
	async cancelSubscription(subscriptionId: string): Promise<Result<true>> {
		const result = await this.update<Subscription>(subscriptionId, {
			status: "canceled",
		});
		if (result.error) {
			return { data: null, error: result.error };
		}
		return { data: true, error: null };
	}
}

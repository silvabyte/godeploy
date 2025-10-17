import type { SupabaseClient } from "@supabase/supabase-js";
import { setGlobalAttributes } from "../telemetry/telemetry";
import { debug } from "../utils/debug";
import type { AuthService } from "./auth/AuthService";
import type { Database } from "./database.types";
import type { Results, User } from "./types";

export interface Subscription {
	id: string;
	tenant_id: string;
	plan_name: string;
	price_cents: number;
	currency: string;
	interval: string;
	status: string;
	trial_ends_at?: string;
	current_period_start: string;
	current_period_end: string;
	stripe_subscription_id?: string;
	created_at: string;
	updated_at: string;
}

export type UpdateSubscriptionParams = Omit<
	Subscription,
	"id" | "created_at" | "updated_at"
>;

export class UserService {
	private user: User | null = null;

	constructor(
		private readonly supabase: SupabaseClient<Database>,
		private readonly authService: AuthService,
	) {}

	async getCurrentUser(jwt?: string): Promise<Results<User>> {
		if (this.user) {
			return [null, this.user] as unknown as Results<User>;
		}
		// Get authenticated user from auth service
		const [authError, authUser] = await this.authService.getCurrentUser(jwt);
		if (authError || !authUser) {
			return [
				authError || new Error("User not found"),
			] as unknown as Results<User>;
		}

		// Get user data from database
		const [dbError, userData] = await this.getUser(authUser.id);
		if (dbError || !userData) {
			return [
				dbError || new Error("User data not found"),
			] as unknown as Results<User>;
		}

		this.user = userData;
		setGlobalAttributes(userData);

		// Combine auth user and database user data
		return [null, { ...userData, meta: authUser }] as unknown as Results<User>;
	}

	async getUser(id: string): Promise<Results<User>> {
		const { data, error } = await this.supabase
			.from("users")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			debug.error(error);
			return [error] as unknown as Results<User>;
		}

		return [null, data] as unknown as Results<User>;
	}

	async getCurrentSubscription(): Promise<Results<Subscription | null>> {
		const [error, user] = await this.getCurrentUser();
		if (error || !user) {
			return [error] as unknown as Results<Subscription | null>;
		}

		//TODO: fix tenant user relationship with tenant users table and then use that to do rls on this query
		const { data, error: subscriptionError } = await this.supabase
			.from("subscriptions")
			.select("*")
			.eq("tenant_id", user.tenant_id)
			.single();

		if (subscriptionError) {
			debug.error(subscriptionError);
			return [subscriptionError] as unknown as Results<Subscription | null>;
		}

		return [null, data] as unknown as Results<Subscription | null>;
	}

	async updateSubscription(
		params: UpdateSubscriptionParams,
	): Promise<Results<Subscription>> {
		const [error, user] = await this.getCurrentUser();
		if (error || !user) {
			return [error] as unknown as Results<Subscription>;
		}

		const trial_ends_at = params.trial_ends_at
			? params.trial_ends_at
			: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

		const { data, error: subscriptionError } = await this.supabase
			.from("subscriptions")
			.upsert({
				...params,
				tenant_id: user.tenant_id,
				status: "active",
				currency: "USD",
				trial_ends_at: trial_ends_at,
				current_period_start: new Date().toISOString(),
				current_period_end: new Date(
					Date.now() + 365 * 24 * 60 * 60 * 1000,
				).toISOString(), // 1 year from now
			})
			.select()
			.single();

		if (subscriptionError) {
			debug.error(subscriptionError);
			return [subscriptionError] as unknown as Results<Subscription>;
		}

		return [null, data] as unknown as Results<Subscription>;
	}

	async createSubscription(
		tenantId: string,
		subscription: Omit<
			Subscription,
			"id" | "created_at" | "updated_at" | "tenant_id"
		>,
	): Promise<Results<Subscription>> {
		const { data, error } = await this.supabase
			.from("subscriptions")
			.insert({
				tenant_id: tenantId,
				...subscription,
			})
			.select()
			.single();

		if (error) {
			debug.error(error);
			return [error] as unknown as Results<Subscription>;
		}

		return [null, data] as unknown as Results<Subscription>;
	}
}

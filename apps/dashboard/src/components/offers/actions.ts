import { type ActionFunctionArgs, redirect } from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";
import { debug } from "../../utils/debug";

export async function claimOfferAction(
	_args: ActionFunctionArgs,
	services: Services,
) {
	try {
		const [error, user] = await services.userService.getCurrentUser();
		if (error || !user) {
			debug.error(error || new Error("User not found"));
			return { error: "User not found" };
		}

		// Get the tenant_id for the current user
		const [userError, userData] = await services.userService.getUser(user.id);
		if (userError || !userData) {
			debug.error("Failed to get user data:", userError);
			return { error: "Failed to get user data" };
		}

		// Create the subscription
		const [subError] = await services.userService.createSubscription(
			userData.tenant_id,
			{
				plan_name: "Unlimited",
				price_cents: 4900, // $49.00
				currency: "usd",
				interval: "annual",
				status: "active",
				current_period_start: new Date().toISOString(),
				current_period_end: new Date(
					Date.now() + 365 * 24 * 60 * 60 * 1000,
				).toISOString(), // 1 year from now
			},
		);

		if (subError) {
			debug.error("Failed to create subscription:", subError);
			return { error: "Failed to create subscription" };
		}

		// Redirect to deployments page on success
		return redirect("/deployments");
	} catch (error) {
		debug.error("Error claiming offer:", error);
		return { error: "Failed to claim offer" };
	}
}

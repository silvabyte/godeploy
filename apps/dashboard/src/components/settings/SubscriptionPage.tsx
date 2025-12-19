import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
} from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";
import type {
	Subscription,
	UpdateSubscriptionParams,
} from "../../services/UserService";
import { trackEvent } from "../../telemetry/telemetry";
import { DowngradeConfirmationDialog } from "./DowngradeConfirmationDialog";
import { TrialConfirmationDialog } from "./TrialConfirmationDialog";

interface LoaderData {
	subscription: Subscription | null;
}

/**
 * Calculate the number of days remaining in a trial
 */
function getTrialDaysRemaining(trialEndsAt: string | undefined): number | null {
	if (!trialEndsAt) return null;
	const trialEnd = new Date(trialEndsAt);
	const now = new Date();
	const diffMs = trialEnd.getTime() - now.getTime();
	if (diffMs <= 0) return null;
	return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if user is currently on a trial
 */
function isOnTrial(subscription: Subscription | null): boolean {
	if (!subscription?.trial_ends_at) return false;
	const trialEnd = new Date(subscription.trial_ends_at);
	return trialEnd.getTime() > Date.now();
}

/**
 * Check if user has ever had a trial (used or expired)
 */
function hasUsedTrial(subscription: Subscription | null): boolean {
	return !!subscription?.trial_ends_at;
}

interface Tier {
	name: string;
	id: string;
	href: string;
	price: string;
	price_cents: number;
	description: string;
	features: string[];
	mostPopular: boolean;
	cta: string;
}

const tiers: Tier[] = [
	{
		name: "Free Tier",
		id: "tier-free",
		href: "#",
		price: "$0",
		price_cents: 0,
		description: "Perfect for side projects and experiments.",
		features: [
			"Deploy up to 5 apps with our CLI",
			"Automatic subdomains",
			"Docker + Nginx packaging",
			"See if it fits your workflow",
		],
		mostPopular: false,
		cta: "Get Started",
	},
	{
		name: "Unlimited",
		id: "tier-unlimited",
		href: "#",
		price: "$49",
		price_cents: 4900,
		description: "For builders who want to ship everything.",
		features: [
			"Unlimited app deployments",
			"Custom domains with automatic HTTPS",
			"Global CDN distribution",
			"Deployment insights and analytics",
		],
		mostPopular: true,
		cta: "Try Unlimited",
	},
];

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export async function subscriptionLoader(
	_args: LoaderFunctionArgs,
	services: Services,
) {
	const [error, subscription] =
		await services.userService.getCurrentSubscription();
	if (error) {
	}
	if (!subscription) {
		return {
			subscription: {
				plan_name: "Free",
				price_cents: 0,
				interval: "year",
				status: "active",
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		};
	}
	return { subscription };
}

export async function subscriptionAction(
	args: ActionFunctionArgs,
	services: Services,
) {
	const formData = await args.request.formData();
	const tierId = formData.get("tierId") as string;
	const isDowngrade = formData.get("isDowngrade") === "true";

	const [currentUserError, user] = await services.userService.getCurrentUser();
	if (currentUserError) {
		return { error: currentUserError.message };
	}
	if (!user) {
		return { error: "User not found" };
	}

	const tier = tiers.find((t) => t.id === tierId);
	if (!tier) {
		return { error: "Invalid tier selected" };
	}

	// Get current subscription to check trial status
	const [, currentSubscription] =
		await services.userService.getCurrentSubscription();

	const now = new Date();
	const nextYear = new Date(
		now.getFullYear() + 1,
		now.getMonth(),
		now.getDate(),
	);

	// Build payload based on upgrade vs downgrade
	const payload: UpdateSubscriptionParams = {
		tenant_id: user.tenant_id,
		plan_name: tier.name,
		price_cents: tier.price_cents,
		interval: "year",
		currency: "USD",
		status: "active",
		current_period_start: now.toISOString(),
		current_period_end: nextYear.toISOString(),
	};

	// Handle trial logic
	if (isDowngrade || tier.price_cents === 0) {
		// Downgrading to free tier - preserve trial_ends_at as historical record
		// that user has used their trial (prevents re-trialing)
		payload.trial_ends_at = currentSubscription?.trial_ends_at;
	} else if (!hasUsedTrial(currentSubscription)) {
		// Upgrading to paid tier and never had a trial - start 14-day trial
		const trial_ends_at = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
		payload.trial_ends_at = trial_ends_at.toISOString();
	} else {
		// Has used trial before - keep existing trial_ends_at as record
		payload.trial_ends_at = currentSubscription?.trial_ends_at;
	}

	const [error] = await services.userService.updateSubscription(payload);

	trackEvent("Subscription-Updated", {
		tier: tier.name,
		price_cents: tier.price_cents,
		interval: "year",
		isDowngrade,
	});

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

export function SubscriptionPage() {
	const { subscription } = useLoaderData() as LoaderData;
	const actionData = useActionData() as
		| { success?: boolean; error?: string }
		| undefined;
	const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
	const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);

	const trialDaysRemaining = getTrialDaysRemaining(subscription?.trial_ends_at);
	const userIsOnTrial = isOnTrial(subscription);

	// Close dialogs on successful action
	useEffect(() => {
		if (actionData?.success) {
			setSelectedTier(null);
			setShowDowngradeDialog(false);
		}
	}, [actionData]);

	// Find current tier based on subscription
	const currentTier = tiers.find((t) => t.name === subscription?.plan_name);
	const unlimitedTier = tiers.find((t) => t.id === "tier-unlimited");

	const handleTierSelect = (tier: Tier) => {
		// Check if this is a downgrade (going from paid to free)
		const currentPriceCents = subscription?.price_cents ?? 0;
		const isDowngrade = tier.price_cents < currentPriceCents;

		if (isDowngrade) {
			setSelectedTier(tier);
			setShowDowngradeDialog(true);
		} else {
			setSelectedTier(tier);
			setShowDowngradeDialog(false);
		}
	};

	const handleCloseDialog = () => {
		setSelectedTier(null);
		setShowDowngradeDialog(false);
	};

	return (
		<div className="bg-white py-12 sm:py-12">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-base/7 font-mono font-semibold text-green-500">
						Pricing
					</h2>
					<p className="mt-2 font-mono text-5xl font-bold tracking-tight text-balance text-slate-900 sm:text-6xl [text-wrap:balance] leading-[1.1]">
						Simple, straightforward pricing
					</p>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-center font-mono text-lg/8 text-pretty text-slate-600">
					Try unlimited for 14 days • No credit card required • Automatic
					fallback free tier
				</p>

				<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
					{tiers.map((tier) => {
						const isCurrentPlan = subscription?.plan_name === tier.name;
						const showTrialStatus = isCurrentPlan && userIsOnTrial;

						return (
							<div
								key={tier.id}
								className={classNames(
									tier.mostPopular
										? "ring-2 ring-green-500"
										: "ring-1 ring-slate-200",
									"rounded-3xl p-8 bg-white shadow-sm",
								)}
							>
								<h3
									id={tier.id}
									className={classNames(
										tier.mostPopular ? "text-green-500" : "text-slate-900",
										"text-lg/8 font-mono font-bold flex items-center gap-x-2",
									)}
								>
									{tier.name}
									{tier.mostPopular && (
										<span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
											Popular
										</span>
									)}
								</h3>
								<p className="mt-4 text-sm/6 font-mono text-slate-600">
									{tier.description}
								</p>
								<p className="mt-6 flex items-baseline gap-x-1">
									<span className="text-4xl font-mono font-bold tracking-tight text-slate-900">
										{tier.price}
									</span>
									{tier.price !== "$0" && (
										<span className="text-sm/6 font-mono font-semibold text-slate-600">
											/year
										</span>
									)}
								</p>
								<button
									type="button"
									onClick={() => handleTierSelect(tier)}
									className={classNames(
										tier.mostPopular
											? "bg-green-500 text-white shadow-sm hover:bg-green-600 active:bg-green-700"
											: "text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
										isCurrentPlan ? "cursor-default" : "cursor-pointer",
										"mt-6 block w-full rounded-full px-4 py-2.5 text-center text-sm/6 font-mono font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
									)}
									disabled={isCurrentPlan}
								>
									{isCurrentPlan ? (
										<span className="flex flex-col items-center justify-center gap-y-1">
											<span className="flex items-center gap-x-2">
												<span className="inline-block w-2 h-2 rounded-full bg-green-300" />
												Current Plan
											</span>
											{showTrialStatus && trialDaysRemaining !== null && (
												<span className="text-xs opacity-80">
													Trial ends in {trialDaysRemaining} day
													{trialDaysRemaining !== 1 ? "s" : ""}
												</span>
											)}
										</span>
									) : (
										"Select Plan"
									)}
								</button>
								<ul className="mt-8 space-y-3 text-sm/6 font-mono text-slate-600">
									{tier.features.map((feature) => (
										<li key={feature} className="flex gap-x-3">
											<CheckIcon
												aria-hidden="true"
												className="h-6 w-5 flex-none text-green-500"
											/>
											{feature}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</div>

			{/* Upgrade/Trial Dialog */}
			{selectedTier && !showDowngradeDialog && (
				<TrialConfirmationDialog
					open={!!selectedTier}
					onClose={handleCloseDialog}
					tier={selectedTier}
				/>
			)}

			{/* Downgrade Confirmation Dialog */}
			{selectedTier && showDowngradeDialog && unlimitedTier && (
				<DowngradeConfirmationDialog
					open={showDowngradeDialog}
					onClose={handleCloseDialog}
					fromTier={{
						name: currentTier?.name ?? "Unlimited",
						features: currentTier?.features ?? unlimitedTier.features,
					}}
					toTier={{
						id: selectedTier.id,
						name: selectedTier.name,
					}}
					isOnTrial={userIsOnTrial}
				/>
			)}
		</div>
	);
}

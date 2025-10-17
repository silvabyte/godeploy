import { CheckIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useLoaderData,
} from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";
import type {
	Subscription,
	UpdateSubscriptionParams,
} from "../../services/UserService";
import { trackEvent } from "../../telemetry/telemetry";
import { TrialConfirmationDialog } from "./TrialConfirmationDialog";

interface LoaderData {
	subscription: Subscription | null;
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

	//TODO: move this to the backed once we have firmed up pricing models
	const now = new Date();
	const nextYear = new Date(
		now.getFullYear() + 1,
		now.getMonth(),
		now.getDate(),
	);
	//14 days from now
	const trial_ends_at = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

	const payload: UpdateSubscriptionParams = {
		tenant_id: user.tenant_id,
		plan_name: tier.name,
		price_cents: tier.price_cents,
		interval: "year",
		currency: "USD",
		status: "active",
		trial_ends_at: trial_ends_at.toISOString(),
		current_period_start: now.toISOString(),
		current_period_end: nextYear.toISOString(),
	};

	const [error] = await services.userService.updateSubscription(payload);

	trackEvent("Subscription-Updated", {
		tier: tier.name,
		price_cents: tier.price_cents,
		interval: "year",
	});

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

export function SubscriptionPage() {
	const { subscription } = useLoaderData() as LoaderData;
	const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

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
					{tiers.map((tier) => (
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
								onClick={() => setSelectedTier(tier)}
								className={classNames(
									tier.mostPopular
										? "bg-green-500 text-white shadow-sm hover:bg-green-600 active:bg-green-700"
										: "text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
									subscription?.plan_name === tier.name
										? "cursor-default"
										: "cursor-pointer",
									"mt-6 block w-full rounded-full px-4 py-2.5 text-center text-sm/6 font-mono font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
								)}
								disabled={subscription?.plan_name === tier.name}
							>
								{subscription?.plan_name === tier.name ? (
									<span className="flex items-center justify-center gap-x-2">
										<span className="inline-block w-2 h-2 rounded-full bg-green-300" />
										Current Plan
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
					))}
				</div>
			</div>

			{selectedTier && (
				<TrialConfirmationDialog
					open={!!selectedTier}
					onClose={() => setSelectedTier(null)}
					tier={selectedTier}
				/>
			)}
		</div>
	);
}

"use client";

import { Container } from "@/components/Container";
import {
	CloudArrowUpIcon,
	GlobeAltIcon,
	ShieldCheckIcon,
	ArrowPathIcon,
	ChartBarIcon,
	LinkIcon,
} from "@heroicons/react/24/outline";

const features = [
	{
		name: "Zero‑Config Deploys",
		description:
			"Run one command and go live. No YAML files, no configuration hell, no Docker expertise required.",
		icon: CloudArrowUpIcon,
	},
	{
		name: "Lightning Fast Global CDN",
		description:
			"Sub-100ms response times worldwide. Your users get instant loads, you get happy customers.",
		icon: GlobeAltIcon,
	},
	{
		name: "Custom Domains Made Easy",
		description:
			"Point your domain, we handle the rest. Automatic SSL provisioning and renewal included.",
		icon: LinkIcon,
	},
	{
		name: "Smart Caching Built-In",
		description:
			"Optimized cache headers for hashed assets. Maximum performance, zero configuration.",
		icon: ShieldCheckIcon,
	},
	{
		name: "Deploy with Confidence",
		description:
			"Instant rollbacks to any previous version. Preview deployments before going live.",
		icon: ArrowPathIcon,
	},
	{
		name: "Know What's Happening",
		description:
			"Real-time deployment status, success rates, and performance metrics at your fingertips.",
		icon: ChartBarIcon,
	},
];

export function SecondaryFeatures() {
	return (
		<Container>
			<div className="mx-auto max-w-4xl text-center">
				<h2 className="text-base leading-7 font-semibold text-green-600 uppercase tracking-wider">
					Features that actually matter
				</h2>
				<p
					id="features-heading"
					className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
				>
					Built for Developers Who
					<span className="block text-green-600">Ship Fast</span>
				</p>
				<p className="mt-6 text-xl leading-8 text-slate-700">
					Everything you need to deploy SPAs globally. Nothing you don't. Fast,
					reliable hosting with sensible defaults and zero configuration.
				</p>
			</div>

			<div className="mt-16">
				<div className="mx-auto max-w-4xl">
					<div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<div key={feature.name} className="flex flex-col">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
									<feature.icon
										className="h-6 w-6 text-green-500"
										aria-hidden="true"
									/>
								</div>
								<h3 className="mt-6 text-lg font-semibold text-slate-900">
									{feature.name}
								</h3>
								<p className="mt-2 flex-auto text-base leading-7 text-slate-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</Container>
	);
}

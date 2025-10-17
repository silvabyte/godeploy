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
		description: "Push your build, go live — no servers to manage.",
		icon: CloudArrowUpIcon,
	},
	{
		name: "Global CDN + HTTPS",
		description: "Instant certificates and edge caching worldwide.",
		icon: GlobeAltIcon,
	},
	{
		name: "Custom Domains",
		description: "Bring your domain; we provision SSL automatically.",
		icon: LinkIcon,
	},
	{
		name: "Cache Busting",
		description: "Asset hashing and smart cache control out of the box.",
		icon: ShieldCheckIcon,
	},
	{
		name: "Rollbacks & Previews",
		description: "Ship confidently with instant rollbacks and previews.",
		icon: ArrowPathIcon,
	},
	{
		name: "Deployment Insights",
		description: "Track deploys and performance at a glance.",
		icon: ChartBarIcon,
	},
];

export function SecondaryFeatures() {
	return (
		<Container>
			<div className="mx-auto max-w-4xl text-center">
				<h2 className="text-base leading-7 font-semibold text-green-500">
					FEATURES
				</h2>
				<p
					id="features-heading"
					className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
				>
					Built for Frontend Teams
				</p>
				<p className="mt-6 text-lg leading-8 text-slate-700">
					GoDeploy delivers fast, reliable static hosting for SPAs — with zero
					configuration and sensible defaults.
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

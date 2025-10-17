"use client";
import clsx from "clsx";
import { useState } from "react";
import {
	BeakerIcon,
	LightBulbIcon,
	BriefcaseIcon,
	RocketLaunchIcon,
	SparklesIcon,
	CommandLineIcon,
	CpuChipIcon,
	Square2StackIcon,
	Square3Stack3DIcon,
	Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { trackEvent } from "@/app/telemetry/telemetry";

function SwirlyDoodle(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 281 40"
			preserveAspectRatio="none"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M240.172 22.994c-8.007 1.246-15.477 2.23-31.26 4.114-18.506 2.21-26.323 2.977-34.487 3.386-2.971.149-3.727.324-6.566 1.523-15.124 6.388-43.775 9.404-69.425 7.31-26.207-2.14-50.986-7.103-78-15.624C10.912 20.7.988 16.143.734 14.657c-.066-.381.043-.344 1.324.456 10.423 6.506 49.649 16.322 77.8 19.468 23.708 2.65 38.249 2.95 55.821 1.156 9.407-.962 24.451-3.773 25.101-4.692.074-.104.053-.155-.058-.135-1.062.195-13.863-.271-18.848-.687-16.681-1.389-28.722-4.345-38.142-9.364-15.294-8.15-7.298-19.232 14.802-20.514 16.095-.934 32.793 1.517 47.423 6.96 13.524 5.033 17.942 12.326 11.463 18.922l-.859.874.697-.006c2.681-.026 15.304-1.302 29.208-2.953 25.845-3.07 35.659-4.519 54.027-7.978 9.863-1.858 11.021-2.048 13.055-2.145a61.901 61.901 0 0 0 4.506-.417c1.891-.259 2.151-.267 1.543-.047-.402.145-2.33.913-4.285 1.707-4.635 1.882-5.202 2.07-8.736 2.903-3.414.805-19.773 3.797-26.404 4.829Zm40.321-9.93c.1-.066.231-.085.29-.041.059.043-.024.096-.183.119-.177.024-.219-.007-.107-.079ZM172.299 26.22c9.364-6.058 5.161-12.039-12.304-17.51-11.656-3.653-23.145-5.47-35.243-5.576-22.552-.198-33.577 7.462-21.321 14.814 12.012 7.205 32.994 10.557 61.531 9.831 4.563-.116 5.372-.288 7.337-1.559Z"
			/>
		</svg>
	);
}

function CheckIcon({
	className,
	...props
}: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg
			aria-hidden="true"
			className={clsx(
				"h-6 w-6 flex-none fill-current stroke-current",
				className,
			)}
			{...props}
		>
			<path
				d="M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z"
				strokeWidth={0}
			/>
			<circle
				cx={12}
				cy={12}
				r={8.25}
				fill="none"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function RoiTag({ children }: { children: React.ReactNode }) {
	return (
		<span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
			{children}
		</span>
	);
}

function Plan({
	name,
	price,
	description,
	href,
	features,
	featured = false,
	buttonText = "Select Plan",
	onClick,
	roiMetrics = [],
	btnDisclaimer = "",
	icon: Icon,
}: {
	name: string;
	price: string;
	description: string;
	href: string;
	features: Array<string>;
	featured?: boolean;
	buttonText?: string;
	onClick?: () => void;
	roiMetrics?: Array<string>;
	btnDisclaimer?: string;
	icon: ForwardRefExoticComponent<
		Omit<SVGProps<SVGSVGElement>, "ref"> & {
			title?: string;
			titleId?: string;
		} & RefAttributes<SVGSVGElement>
	>;
}) {
	const trackPricingClick = () => {
		trackEvent("pricing_plan_click", {
			plan: name,
		});
	};

	return (
		<section
			className={clsx(
				"flex flex-col rounded-3xl px-6 sm:px-8",
				featured ? "order-first bg-indigo-600 py-8 lg:order-none" : "lg:py-8",
			)}
			data-pricing-tier={name.toLowerCase().replace(/\s+/g, "-")}
		>
			<div className="mt-5 flex items-center justify-start gap-3">
				<Icon
					className={clsx(
						"h-6 w-6",
						featured ? "text-white" : "text-indigo-400",
					)}
				/>
				<h3 className="display text-lg text-white">{name}</h3>
			</div>
			<p
				className={clsx(
					"mt-2 text-base",
					featured ? "text-white" : "text-slate-400",
				)}
			>
				{description}
			</p>
			<p className="order-first font-display text-5xl font-light tracking-tight text-white">
				{price}
			</p>

			{roiMetrics.length > 0 && (
				<div
					className={clsx(
						"mt-3 rounded-lg px-3 py-2",
						featured
							? "bg-indigo-500/50 text-white"
							: "bg-slate-800/50 text-slate-200",
					)}
				>
					<p className="text-xs font-semibold tracking-wider uppercase">
						ROI Impact
					</p>
					<ul className="mt-1 text-sm">
						{roiMetrics.map((metric) => (
							<li key={metric} className="flex items-center">
								<span className="mr-1">📈</span> {metric}
							</li>
						))}
					</ul>
				</div>
			)}

			<ul
				role="list"
				className={clsx(
					"order-last mt-10 flex flex-col gap-y-3 text-sm",
					featured ? "text-white" : "text-slate-200",
				)}
			>
				{features.map((feature) => (
					<li key={feature} className="flex">
						<CheckIcon className={featured ? "text-white" : "text-slate-400"} />
						<span className="ml-4">{feature}</span>
					</li>
				))}
			</ul>
			<Button
				href={href}
				variant={featured ? "solid" : "outline"}
				color="white"
				className="mt-8"
				aria-label={`Get started with the ${name} plan for ${price}`}
				onClick={trackPricingClick}
				data-pricing-cta={name.toLowerCase().replace(/\s+/g, "-")}
			>
				{buttonText}
			</Button>
			{btnDisclaimer && (
				<p className="mt-2 text-center text-xs text-slate-200">
					{btnDisclaimer}
				</p>
			)}
		</section>
	);
}

export function Pricing() {
	const [pricingVariant, setPricingVariant] = useState<"yearly" | "monthly">(
		"yearly",
	);
	const [headlineVariant, setHeadlineVariant] = useState<"value" | "pain">(
		"value",
	);

	return (
		<section
			id="pricing"
			aria-label="Pricing"
			className="bg-slate-900 py-20 sm:py-32"
		>
			<Container>
				<div className="md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
						<span className="relative whitespace-nowrap">
							<SwirlyDoodle className="absolute top-1/2 left-0 h-[1em] w-full fill-indigo-400" />
							<span className="relative">
								Plans for builders who just want to ship
							</span>
						</span>
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-400">
						From first deploys to serious side projects, GoDeploy scales with
						you. No DevOps, no stress — just fast, secure hosting for whatever
						you build.
					</p>
					<p className="mt-4 text-lg tracking-tight text-slate-400">
						Trial free for 14 days. No credit card required.
					</p>
				</div>
				<div className="-mx-4 mt-16 grid max-w-2xl grid-cols-1 gap-y-10 sm:mx-auto lg:-mx-8 lg:max-w-none lg:grid-cols-4 xl:mx-0 xl:gap-x-8">
					<Plan
						name="Free"
						price="$0"
						description="Just deploy it."
						href="https://auth.godeploy.app"
						buttonText="Get Started"
						icon={BeakerIcon}
						features={[
							"1 Project",
							"Ship in seconds — no config needed",
							"Auto-generated Subdomain",
							"HTTPS + Global CDN",
							"SPA Routing Support",
							"Static Site Support",
							"No credit card required",
							"GoDeploy Branding",
						]}
					/>
					<Plan
						name="GoDeploy Starter"
						price="$9"
						description="Your first real project, done right."
						href="https://auth.godeploy.app"
						buttonText="Get Started"
						icon={LightBulbIcon}
						features={[
							"1 Project",
							"Custom Domain Support",
							"No GoDeploy Branding",
							"HTTPS + Global CDN",
							"SPA + Static Site Support",
							"Ideal for first products",
							"Perfect for landing pages",
							"Great for internal tools",
						]}
					/>
					<Plan
						name="GoDeploy Pro"
						price="$29"
						description="When one project isn't enough."
						href="https://auth.godeploy.app"
						buttonText="Get Started"
						icon={BriefcaseIcon}
						features={[
							"Up to 5 Projects",
							"Custom Domain Support",
							"No GoDeploy Branding",
							"Deploy Analytics (7 Days):",
							"  • Daily Deploy Count",
							"  • Total Deploys",
							"Perfect for side projects",
							"Great for client work",
							"Ideal for small teams",
						]}
					/>
					<Plan
						featured
						name="GoDeploy Unlimited"
						price="$49"
						description="Unlimited ideas, shipped fast."
						href="https://auth.godeploy.app"
						buttonText="Get Started"
						icon={RocketLaunchIcon}
						features={[
							"Unlimited Projects",
							"Custom Domain Support",
							"Dev + Staging Environments",
							"Rollback Support",
							"Deploy Analytics (1 Year)",
							"API Access for Automation",
							"Perfect for indie hackers",
							"Great for serious builders",
							"Ideal for growing teams",
						]}
					/>
				</div>
			</Container>
		</section>
	);
}

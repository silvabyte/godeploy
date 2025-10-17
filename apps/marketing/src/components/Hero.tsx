"use client";

import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
// Simplified TS interface for global Mixpanel
declare global {
	interface Window {
		mixpanel: any;
		MIXPANEL_EVENTS: {
			CTA_CLICK: string;
			[key: string]: string;
		};
	}
}

// (Framework badges removed — SaaS-focused hero)

export function Hero() {
	return (
		<Container className="relative overflow-hidden pt-16 pb-16">
			<div className="flex flex-col items-center justify-between md:flex-row">
				<div className="max-w-2xl">
					<h1
						id="hero-heading"
						className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl"
					>
						Deploy SPAs Globally in Seconds
					</h1>

					<p className="mt-6 text-lg leading-8 text-slate-700">
						Zero‑config static hosting for modern frontends. Sign up and deploy
						via CLI to get instant HTTPS with a global CDN — without SSR or
						pipelines.
					</p>

					<div className="mt-4 flex items-center">
						<span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
							<span className="mr-1.5 flex h-1.5 w-1.5 rounded-full bg-green-600"></span>
							Deploy SPAs, static sites, and client-side apps exactly as they
							are
						</span>
					</div>

					<div className="mt-10 flex gap-4">
						<Button href="https://auth.godeploy.app" color="green">
							Get Started
						</Button>
						<Button href="#pricing" variant="outline">
							View Pricing
						</Button>
					</div>

					<div className="mt-12">
						<h3 className="mb-3 text-lg font-semibold text-slate-800">
							Why GoDeploy
						</h3>
						<div className="flex flex-wrap gap-2">
							{[
								"Instant HTTPS",
								"Global CDN",
								"Custom Domains",
								"Rollbacks",
							].map((chip) => (
								<span
									key={chip}
									className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800"
								>
									{chip}
								</span>
							))}
						</div>
						<div className="mt-6">
							<Button href="#how-it-works" variant="outline">
								See How It Works
							</Button>
						</div>
					</div>
				</div>

				<div className="relative mt-10 md:mt-0 md:ml-16 w-full max-w-2xl lg:max-w-3xl">
					<div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10">
						<Image
							src="/images/projects.png"
							alt="GoDeploy projects overview with activity metrics"
							width={1200}
							height={800}
							className="h-auto w-full"
							priority
						/>
					</div>
				</div>
			</div>
		</Container>
	);
}

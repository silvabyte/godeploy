"use client";

import Image from "next/image";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Potatosaur } from "@/components/Potatosaur";
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
						Ship Your Frontend
						<span className="block text-green-600">
							Without the DevOps Drama
						</span>
					</h1>

					<p className="mt-6 text-xl leading-8 text-slate-700">
						Deploy React, Vue, Angular, or any SPA in seconds. No AWS
						configuration, no pipeline setup, no framework lock-in. Just build
						and ship.
					</p>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
						<span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
							<span className="mr-2 flex h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
							Zero-config • Global CDN • Instant HTTPS
						</span>
						<span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
							💸 No bandwidth fees ever
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
						<h3 className="mb-4 text-base font-semibold uppercase tracking-wide text-slate-500">
							Everything you need, nothing you don't
						</h3>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							{[
								{ icon: "⚡", label: "Instant HTTPS" },
								{ icon: "🌍", label: "Global CDN" },
								{ icon: "🔗", label: "Custom Domains" },
								{ icon: "↩️", label: "One-Click Rollbacks" },
							].map((feature) => (
								<div
									key={feature.label}
									className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-3 hover:border-green-300 hover:shadow-sm transition-all"
								>
									<span className="text-2xl mb-1">{feature.icon}</span>
									<span className="text-sm font-medium text-slate-700">
										{feature.label}
									</span>
								</div>
							))}
						</div>
						<div className="mt-8">
							<Button href="#how-it-works" variant="outline">
								See How It Works →
							</Button>
						</div>
					</div>
				</div>

				<div className="relative mt-10 md:mt-0 md:ml-8 w-full max-w-xl lg:max-w-2xl">
					{/* Potatosaur mascot */}
					<div className="absolute -top-12 right-2 w-24 rotate-12 z-10">
						<Potatosaur />
					</div>
					
					{/* Modern browser mockup */}
					<div className="relative">
						{/* Browser chrome */}
						<div className="overflow-hidden rounded-t-xl bg-slate-800 px-4 py-3">
							<div className="flex items-center gap-2">
								<div className="flex gap-1.5">
									<div className="h-3 w-3 rounded-full bg-red-500"></div>
									<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
									<div className="h-3 w-3 rounded-full bg-green-500"></div>
								</div>
								<div className="ml-4 flex-1 rounded bg-slate-700 px-3 py-1 text-xs text-slate-400">
									dashboard.godeploy.app
								</div>
							</div>
						</div>
						{/* Screenshot */}
						<div className="overflow-hidden rounded-b-xl shadow-2xl ring-1 ring-black/10">
							<Image
								src="/images/projects.png"
								alt="GoDeploy projects overview with activity metrics"
								width={1200}
								height={800}
								className="h-auto w-full"
								priority
							/>
						</div>
						{/* Floating badge */}
						<div className="absolute -bottom-4 -left-4 rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
							⚡ Live in 60s
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}

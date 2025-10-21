"use client";

import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Logo, LogoIcon } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";

export function ComponentExamples() {
	return (
		<div className="space-y-24 py-16">
			<BrandLogo />
			<ColorPalette />
			<Typography />
			<Buttons />
			<Cards />
			<Navigation />
			<FaqExample />
		</div>
	);
}

function BrandLogo() {
	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				BRAND
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Logo Guidelines
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Our logo represents simplicity, reliability, and developer-friendliness
				with a clean, minimal design.
			</p>

			<div className="mt-12">
				<h3 className="text-xl font-semibold text-slate-900">Primary Logo</h3>
				<div className="mt-6 flex flex-col items-center gap-12 rounded-lg border border-slate-200 bg-white p-12 sm:flex-row">
					<div className="flex items-center">
						{/* Actual Logo Component */}
						<Logo className="h-12 w-auto" />
					</div>

					{/* Specifications */}
					<div className="space-y-3 text-left text-sm text-slate-700 sm:ml-8">
						<p>• Black square with rounded corners (2px radius)</p>
						<p>• Green triangle pointing downward</p>
						<p>• System font, semibold weight (600)</p>
						<p>• Title case with no space between "Go" and "Deploy"</p>
					</div>
				</div>
			</div>

			<div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
				<div>
					<h3 className="text-xl font-semibold text-slate-900">
						Color Variations
					</h3>
					<div className="mt-6 space-y-8">
						{/* Standard */}
						<div className="rounded-lg border border-slate-200 bg-white p-6">
							<p className="mb-4 text-sm font-medium text-slate-700">
								Standard
							</p>
							<Logo className="h-10 w-auto" />
						</div>

						{/* Reversed */}
						<div className="rounded-lg border border-slate-200 bg-slate-900 p-6">
							<p className="mb-4 text-sm font-medium text-slate-300">
								Reversed
							</p>
							<div className="text-white">
								<svg
									viewBox="0 0 200 50"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									className="h-10 w-auto"
								>
									<defs>
										<linearGradient
											id="godeploy-grad-rev"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop
												offset="0%"
												style={{ stopColor: "#1F9D55", stopOpacity: 1 }}
											/>
											<stop
												offset="100%"
												style={{ stopColor: "#4ADE80", stopOpacity: 1 }}
											/>
										</linearGradient>
									</defs>

									{/* Central shape - simplified deployment icon */}
									<rect
										x="20"
										y="15"
										width="20"
										height="20"
										rx="2"
										fill="#FFFFFF"
									/>
									<path
										d="M25 22 L35 22 L30 30 Z"
										fill="#4ADE80"
										stroke="none"
									/>

									{/* Text with clean typography */}
									<text
										x="50"
										y="32"
										fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
										fontSize="20"
										fontWeight="600"
										letterSpacing="-0.02em"
										fill="#FFFFFF"
									>
										GoDeploy
									</text>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-xl font-semibold text-slate-900">Logo Icon</h3>
					<div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
						<div className="mb-6">
							<p className="mb-4 text-sm font-medium text-slate-700">
								Icon Only
							</p>
							<div className="flex items-center space-x-8">
								<LogoIcon />
								<div className="relative h-20 w-20 rounded bg-slate-100 p-3">
									<LogoIcon />
								</div>
							</div>
						</div>

						<div>
							<p className="mb-2 text-sm font-medium text-slate-700">
								Clear Space & Sizing
							</p>
							<div className="relative inline-block border-2 border-dashed border-slate-300 p-8">
								<Logo className="h-10 w-auto" />
							</div>
							<p className="mt-2 text-xs text-slate-600">
								Maintain clear space around the logo equal to the height of the
								capital "G"
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-12">
				<h3 className="text-xl font-semibold text-slate-900">Improper Usage</h3>
				<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Stretched */}
					<div className="rounded-lg border border-slate-200 bg-white p-6">
						<div className="flex h-24 items-center justify-center">
							<div className="scale-x-150 transform">
								<Logo className="h-10 w-auto" />
							</div>
						</div>
						<p className="mt-2 text-center text-sm text-red-600">
							❌ Do not stretch or distort
						</p>
					</div>

					{/* Wrong colors */}
					<div className="rounded-lg border border-slate-200 bg-white p-6">
						<div className="flex h-24 items-center justify-center">
							<svg
								viewBox="0 0 200 50"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								className="h-10 w-auto"
							>
								<rect
									x="20"
									y="15"
									width="20"
									height="20"
									rx="2"
									fill="#9333EA"
								/>
								<path d="M25 22 L35 22 L30 30 Z" fill="#F59E0B" stroke="none" />
								<text
									x="50"
									y="32"
									fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
									fontSize="20"
									fontWeight="600"
									letterSpacing="-0.02em"
									fill="#9333EA"
								>
									GoDeploy
								</text>
							</svg>
						</div>
						<p className="mt-2 text-center text-sm text-red-600">
							❌ Do not change colors
						</p>
					</div>

					{/* Rotated */}
					<div className="rounded-lg border border-slate-200 bg-white p-6">
						<div className="flex h-24 items-center justify-center">
							<div className="rotate-45 transform">
								<Logo className="h-10 w-auto" />
							</div>
						</div>
						<p className="mt-2 text-center text-sm text-red-600">
							❌ Do not rotate
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}


function ColorPalette() {
	const primaryColors = [
		{ name: "Black", color: "#000000", className: "bg-black text-white" },
		{
			name: "Green 500",
			color: "#4ADE80",
			className: "bg-green-500 text-white",
		},
		{
			name: "Green 600",
			color: "#22C55E",
			className: "bg-green-600 text-white",
		},
		{
			name: "Green 700",
			color: "#16A34A",
			className: "bg-green-700 text-white",
		},
		{
			name: "Green 50",
			color: "#F0FDF4",
			className: "bg-green-50 text-slate-900",
		},
	];

	const neutralColors = [
		{
			name: "White",
			color: "#FFFFFF",
			className: "bg-white text-slate-900 border border-slate-200",
		},
		{
			name: "Slate 50",
			color: "#F8FAFC",
			className: "bg-slate-50 text-slate-900",
		},
		{
			name: "Slate 100",
			color: "#F1F5F9",
			className: "bg-slate-100 text-slate-900",
		},
		{
			name: "Slate 200",
			color: "#E2E8F0",
			className: "bg-slate-200 text-slate-900",
		},
		{
			name: "Slate 500",
			color: "#64748B",
			className: "bg-slate-500 text-white",
		},
		{
			name: "Slate 600",
			color: "#475569",
			className: "bg-slate-600 text-white",
		},
		{
			name: "Slate 700",
			color: "#334155",
			className: "bg-slate-700 text-white",
		},
		{
			name: "Slate 800",
			color: "#1E293B",
			className: "bg-slate-800 text-white",
		},
		{
			name: "Slate 900",
			color: "#0F172A",
			className: "bg-slate-900 text-white",
		},
	];

	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				COLORS
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Brand Color Palette
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Our color palette is a clean and modern design approach, with green as
				our primary accent color.
			</p>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">Primary Colors</h3>
				<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
					{primaryColors.map(({ name, color, className }) => (
						<div
							key={name}
							className="flex flex-col overflow-hidden rounded-lg"
						>
							<div className={clsx(className, "flex h-24 items-end p-4")}>
								<span className="text-xs opacity-80">{color}</span>
							</div>
							<div className="bg-white p-4">
								<div className="font-medium">{name}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">Neutral Colors</h3>
				<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
					{neutralColors.map(({ name, color, className }) => (
						<div
							key={name}
							className="flex flex-col overflow-hidden rounded-lg"
						>
							<div className={clsx(className, "flex h-24 items-end p-4")}>
								<span className="text-xs opacity-80">{color}</span>
							</div>
							<div className="bg-white p-4">
								<div className="font-medium">{name}</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Typography() {
	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				TYPOGRAPHY
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Typography System
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Our typography system uses a clean, modern system font stack that looks
				great on all platforms.
			</p>

			<div className="mt-10 space-y-8">
				<div>
					<div className="text-sm font-medium text-slate-500">Display/Hero</div>
					<p className="text-5xl font-bold tracking-tight text-slate-900">
						Single Page App Deployment
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Heading 1</div>
					<p className="text-4xl font-bold text-slate-900">
						Native TypeScript support
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Heading 2</div>
					<p className="text-3xl font-bold text-slate-900">
						Built on web standards
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Heading 3</div>
					<p className="text-2xl font-semibold text-slate-900">
						Consistent code everywhere
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Heading 4</div>
					<p className="text-xl font-semibold text-slate-900">
						Framework agnostic
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Body</div>
					<p className="text-base text-slate-700">
						GoDeploy natively supports TypeScript, JSX, and modern JavaScript
						with zero configuration. Deploy your web apps exactly as they are
						without complex build processes.
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Small</div>
					<p className="text-sm text-slate-600">
						No credit card required • Free tier available
					</p>
				</div>

				<div>
					<div className="text-sm font-medium text-slate-500">Monospace</div>
					<pre className="mt-2 rounded-lg bg-slate-900 p-4">
						<code className="font-mono text-sm text-white">
							curl -fsSL https://install.godeploy.app/now.sh | sh
						</code>
					</pre>
				</div>
			</div>
		</section>
	);
}

function Buttons() {
	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				BUTTONS
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Button Components
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Our button system uses rounded corners and clear visual hierarchy to
				guide users through actions.
			</p>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">
					Primary Buttons
				</h3>
				<div className="mt-4 flex flex-wrap gap-4">
					<Button color="green">Get Started</Button>
					<Button color="slate">Learn More</Button>
					<Button disabled color="green">
						Disabled
					</Button>
				</div>
			</div>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">
					Secondary Buttons
				</h3>
				<div className="mt-4 flex flex-wrap gap-4">
					<Button variant="outline" color="slate">
						<svg
							className="mr-2 h-4 w-4 fill-current"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
						</svg>
						GitHub
					</Button>
					<Button variant="outline" color="slate">
						Documentation
					</Button>
					<Button variant="outline" disabled color="slate">
						Disabled
					</Button>
				</div>
			</div>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">Button Sizes</h3>
				<div className="mt-4 flex flex-wrap items-center gap-4">
					<Button color="green" className="px-3 py-1 text-xs">
						Small
					</Button>
					<Button color="green">Default</Button>
					<Button color="green" className="px-5 py-3 text-base">
						Large
					</Button>
				</div>
			</div>
		</section>
	);
}

function Cards() {
	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				CARDS
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Card Components
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Cards provide a clean, contained way to present related content and
				actions.
			</p>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">Feature Cards</h3>
				<div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div className="flex flex-col">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
							<svg
								className="h-6 w-6 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h3 className="mt-6 text-lg font-semibold text-slate-900">
							Native TypeScript support
						</h3>
						<p className="mt-2 flex-auto text-base leading-7 text-slate-600">
							GoDeploy natively supports TypeScript, JSX, and modern JavaScript
							features with zero configuration.
						</p>
					</div>

					<div className="flex flex-col">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
							<svg
								className="h-6 w-6 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
								/>
							</svg>
						</div>
						<h3 className="mt-6 text-lg font-semibold text-slate-900">
							Built on web standards
						</h3>
						<p className="mt-2 flex-auto text-base leading-7 text-slate-600">
							Uses modern web APIs and follows browser standards for maximum
							compatibility and performance.
						</p>
					</div>

					<div className="flex flex-col">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
							<svg
								className="h-6 w-6 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								/>
							</svg>
						</div>
						<h3 className="mt-6 text-lg font-semibold text-slate-900">
							Framework agnostic
						</h3>
						<p className="mt-2 flex-auto text-base leading-7 text-slate-600">
							Deploy apps built with React, Vue, Angular, Svelte, or any other
							JavaScript framework.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-16">
				<h3 className="text-xl font-semibold text-slate-900">
					Installation Card
				</h3>
				<div className="mt-4 max-w-3xl">
					<div className="overflow-hidden rounded-lg bg-white shadow-xl">
						<div className="px-8 py-10">
							<h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900">
								Install GoDeploy
							</h2>

							<div className="mt-6 rounded-lg bg-slate-100 p-4">
								<code className="flex items-center justify-between">
									<span className="font-mono text-sm">
										curl -fsSL https://install.godeploy.app/now.sh | sh
									</span>
									<button
										className="rounded bg-slate-200 p-2 hover:bg-slate-300 focus:ring-2 focus:ring-slate-500 focus:outline-none"
										aria-label="Copy to clipboard"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-slate-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
											/>
										</svg>
									</button>
								</code>
							</div>

							<div className="mt-10 text-center">
								<Button href="#" color="green" className="w-full sm:w-auto">
									Get Started for Free
								</Button>
								<p className="mt-4 text-sm text-slate-500">
									No credit card required • Free tier available
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Navigation() {
	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				NAVIGATION
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				Navigation Components
			</p>
			<p className="mt-6 text-lg text-slate-700">
				Navigation components provide clear, accessible ways for users to move
				through the application.
			</p>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">NavLinks</h3>
				<div className="mt-4 flex flex-wrap gap-6 rounded-lg border border-slate-200 bg-white p-6">
					<NavLink href="#">Features</NavLink>
					<NavLink href="#">Documentation</NavLink>
					<NavLink href="#">Pricing</NavLink>
					<NavLink href="#">GitHub</NavLink>
					<NavLink href="#">Blog</NavLink>
				</div>
			</div>

			<div className="mt-10">
				<h3 className="text-xl font-semibold text-slate-900">
					Mobile Menu (Expanded)
				</h3>
				<div className="mt-4 max-w-xs rounded-lg bg-white p-4 shadow-lg">
					<div className="space-y-2">
						<button className="block w-full rounded-md p-2 text-left hover:bg-slate-50">
							Features
						</button>
						<hr className="border-slate-100" />
						<button className="block w-full rounded-md p-2 text-left hover:bg-slate-50">
							FAQ
						</button>
						<button className="block w-full rounded-md p-2 text-left hover:bg-slate-50">
							Blog
						</button>
						<hr className="border-slate-100" />
						<button className="block w-full rounded-md p-2 text-left hover:bg-slate-50">
							GitHub
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

function FaqExample() {
	const [openIndex, setOpenIndex] = useState(0);

	const faqs = [
		{
			question: "How does GoDeploy handle HTTPS?",
			answer:
				"GoDeploy automatically provisions HTTPS certificates through Let's Encrypt, ensuring your app is secure by default without any manual configuration. This applies to both custom domains and the automatically generated subdomains.",
		},
		{
			question: "Can I host GoDeploy on my own infrastructure?",
			answer:
				"Yes. Use the open-source CLI to package your app as a Docker container that you can deploy to any infrastructure that supports Docker, including your own servers, AWS, GCP, or Azure.",
		},
	];

	return (
		<section>
			<h2 className="text-base leading-7 font-semibold text-green-500">
				ACCORDION
			</h2>
			<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				FAQ Component
			</p>
			<p className="mt-6 text-lg text-slate-700">
				The FAQ component uses an accordion pattern for efficient information
				display.
			</p>

			<div className="mt-10 max-w-3xl">
				{faqs.map((faq, index) => (
					<div key={index} className="border-b border-slate-200 py-6">
						<button
							className="flex w-full items-start justify-between text-left"
							onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
						>
							<span className="text-base leading-7 font-semibold text-slate-900">
								{faq.question}
							</span>
							<span className="ml-6 flex h-7 items-center">
								<ChevronDownIcon
									className={clsx(
										"h-6 w-6 transform text-slate-600 transition duration-200",
										index === openIndex ? "rotate-180" : "",
									)}
								/>
							</span>
						</button>
						{index === openIndex && (
							<div className="mt-2 pr-12">
								<p className="text-base leading-7 text-slate-600">
									{faq.answer}
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}

export default ComponentExamples;

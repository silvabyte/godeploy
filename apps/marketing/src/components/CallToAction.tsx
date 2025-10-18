import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { CheckIcon } from "@heroicons/react/24/outline";

export function CallToAction() {
	return (
		<section className="bg-slate-900 py-16">
			<Container>
				<div className="mx-auto max-w-4xl text-center">
					<h2
						id="pricing-heading"
						className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
					>
						Pricing That Makes Sense
					</h2>
					<p className="mt-6 text-xl leading-8 text-slate-300">
						Start free, scale when you need to. No surprise bills, no bandwidth
						charges, ever.
					</p>
				</div>

				<div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Free */}
					<div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
						<h3 className="text-2xl font-bold text-slate-900">Free</h3>
						<p className="mt-2 text-base text-slate-600">
							Perfect for side projects and trying things out.
						</p>
						<div className="mt-6">
							<span className="text-5xl font-bold tracking-tight text-slate-900">
								$0
							</span>
							<span className="ml-2 text-lg font-normal text-slate-600">
								forever
							</span>
						</div>

						<ul className="mt-8 space-y-4 text-sm text-slate-700">
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />3 projects
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />1 custom
								domain included
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								GoDeploy subdomain
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Global CDN + HTTPS (no bandwidth fees)
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								100 MB max upload per project
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />2 GB total
								storage included
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Retention: last 5 deploys/project
							</li>
						</ul>

						<div className="mt-8">
							<Button
								href="https://auth.godeploy.app"
								color="green"
								className="w-full"
							>
								Get Started Free →
							</Button>
						</div>
					</div>

					{/* Pro */}
					<div className="rounded-2xl bg-white p-8 ring-2 shadow-lg ring-green-500 hover:shadow-2xl transition-shadow relative">
						<div className="absolute -top-4 left-1/2 -translate-x-1/2">
							<span className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wide shadow-lg">
								Most Popular
							</span>
						</div>
						<h3 className="text-2xl font-bold text-slate-900 mt-2">Pro</h3>
						<p className="mt-2 text-base text-slate-600">
							For professionals and teams shipping production apps.
						</p>
						<div className="mt-6">
							<span className="text-5xl font-bold tracking-tight text-slate-900">
								$49
							</span>
							<span className="text-lg font-normal text-slate-600">/year</span>
						</div>
						<p className="mt-2 text-sm text-green-600 font-medium">
							That's just $4.08/month — less than a coffee ☕
						</p>

						<ul className="mt-8 space-y-4 text-sm text-slate-700">
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								<strong>Unlimited</strong>
								<span className="ml-2">projects</span>
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								<strong>Unlimited</strong>
								<span className="ml-2">custom domains</span>
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Global CDN + HTTPS (no bandwidth fees)
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Previews + instant rollbacks
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Analytics (90‑day)
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Team members (invite users to your team)
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								100 MB max upload per project
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								10 GB total storage included
							</li>
							<li className="flex items-center">
								<CheckIcon className="mr-3 h-5 w-5 text-green-500" />
								Storage overage: $0.20/GB‑month
							</li>
						</ul>

						<div className="mt-8">
							<Button
								href="https://auth.godeploy.app"
								color="green"
								className="w-full"
							>
								Start with Pro →
							</Button>
							<p className="mt-3 text-center text-xs text-slate-500">
								💳 Cancel anytime • 🚫 No bandwidth fees • 📦 Includes storage
								for deploys + previews
							</p>
						</div>
					</div>
				</div>

				<div className="mx-auto mt-8 max-w-4xl text-center">
					<p className="text-xs text-slate-400">
						We never bill for bandwidth on static sites. Storage includes active
						deploys and previews.
					</p>
				</div>
			</Container>
		</section>
	);
}

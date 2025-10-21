import { Container } from "@/components/Container";
import { Potatosaur } from "@/components/Potatosaur";
import { Terminal } from "@/components/Terminal";
import { TerminalLine } from "@/components/TerminalLines";

export function HowItWorks() {
	// CLI-only instructions

	return (
		<section className="bg-white py-24">
			<Container>
				<div className="mx-auto max-w-4xl text-center">
					<div className="flex justify-center flex-col items-center gap-y-8">
						<Potatosaur />
						<h2 className="text-base leading-7 font-semibold text-green-600 uppercase tracking-wider">
							Get started in minutes
						</h2>
					</div>
					<p
						id="how-it-works-heading"
						className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
					>
						From Zero to Deployed
						<span className="block text-green-600">In 5 Commands</span>
					</p>
					<p className="mt-6 text-xl leading-8 text-slate-700">
						Install the CLI, authenticate, and deploy. That's it. Your app will
						be live with HTTPS and global CDN in under 60 seconds.
					</p>
				</div>

				<div className="relative mx-auto mt-16 max-w-4xl">
					<Terminal className="mt-6 h-48" title="CLI Quickstart">
						<TerminalLine
							prompt="$"
							command="curl -sSL https://install.spa.godeploy.app/now.sh | bash"
						/>
						<TerminalLine prompt="$" command="godeploy auth sign-up" />
						<TerminalLine prompt="$" command="godeploy init" />
						<TerminalLine prompt="$" command="npm run build" />
						<TerminalLine prompt="$" command="godeploy deploy" />
					</Terminal>
				</div>

				<div className="mx-auto mt-12 max-w-6xl">
					{/* Compact 2-column grid with modern cards */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Main large card */}
						<div className="md:col-span-2">
							<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-1 shadow-lg transition-all hover:shadow-xl">
								<div className="overflow-hidden rounded-lg bg-white">
									{/* Mini browser chrome */}
									<div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
										<div className="flex gap-1">
											<div className="h-2 w-2 rounded-full bg-slate-300"></div>
											<div className="h-2 w-2 rounded-full bg-slate-300"></div>
											<div className="h-2 w-2 rounded-full bg-slate-300"></div>
										</div>
										<div className="text-xs text-slate-500">
											dashboard.godeploy.app/projects
										</div>
									</div>
									<img
										src="/images/projects.png"
										alt="Projects overview with status and project metrics"
										className="h-auto w-full"
										loading="lazy"
									/>
								</div>
								<div className="absolute top-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
									Projects Dashboard
								</div>
							</div>
						</div>

						{/* Two smaller cards side by side */}
						<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-1 shadow-lg transition-all hover:shadow-xl">
							<div className="overflow-hidden rounded-lg bg-white">
								<div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
									<div className="flex gap-1">
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
									</div>
									<div className="text-xs text-slate-500">deployments</div>
								</div>
								<img
									src="/images/deployments.png"
									alt="Deployments list showing recent deploys and metrics"
									className="h-auto w-full"
									loading="lazy"
								/>
							</div>
							<div className="absolute top-3 right-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
								Deploy History
							</div>
						</div>

						<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-1 shadow-lg transition-all hover:shadow-xl">
							<div className="overflow-hidden rounded-lg bg-white">
								<div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
									<div className="flex gap-1">
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
										<div className="h-2 w-2 rounded-full bg-slate-300"></div>
									</div>
									<div className="text-xs text-slate-500">project/details</div>
								</div>
								<img
									src="/images/project_details.png"
									alt="Project details with latest deploys, success rate, and averages"
									className="h-auto w-full"
									loading="lazy"
								/>
							</div>
							<div className="absolute top-3 right-3 rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
								Analytics
							</div>
						</div>
					</div>

					<div className="mt-8 text-center">
						<p className="text-sm text-slate-500">
							Clean, intuitive dashboard • Real-time updates • No clutter
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}

import { Container } from "@/components/Container";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const problems = [
	{
		pain: "Spending hours configuring AWS, Cloudflare, or complex CI/CD pipelines",
		solution: "One command to deploy. Zero configuration needed.",
	},
	{
		pain: "Being forced to rewrite apps in Next.js or Remix just to deploy them",
		solution:
			"Deploy React, Vue, Angular, or any SPA as-is. No framework lock-in.",
	},
	{
		pain: "Paying for bandwidth on top of hosting costs",
		solution: "No bandwidth fees, ever. Global CDN included on all plans.",
	},
	{
		pain: "Wrestling with Docker, Kubernetes, and DevOps just to host a simple SPA",
		solution: "We handle all the infrastructure. You focus on building.",
	},
];

export function Benefits() {
	return (
		<section className="bg-white py-24">
			<Container>
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-base leading-7 font-semibold text-green-600 uppercase tracking-wider">
						Stop fighting with deployment
					</h2>
					<p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
						Deployment Shouldn't Be
						<span className="block text-red-600">Harder Than Building</span>
					</p>
					<p className="mt-6 text-xl leading-8 text-slate-700">
						You built a great frontend. Why should deploying it take longer than
						building it?
					</p>
				</div>

				<div className="mx-auto mt-16 max-w-5xl">
					<div className="space-y-8">
						{problems.map((item, index) => (
							<div
								key={index}
								className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center"
							>
								{/* Pain Point */}
								<div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
									<div className="flex items-start">
										<XMarkIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
										<div className="ml-4">
											<p className="text-lg font-medium text-red-900">
												The Old Way
											</p>
											<p className="mt-2 text-base text-red-700">{item.pain}</p>
										</div>
									</div>
								</div>

								{/* Solution */}
								<div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
									<div className="flex items-start">
										<CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
										<div className="ml-4">
											<p className="text-lg font-medium text-green-900">
												With GoDeploy
											</p>
											<p className="mt-2 text-base text-green-700">
												{item.solution}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mx-auto mt-16 max-w-2xl text-center">
					<p className="text-2xl font-bold text-slate-900">
						Ready to simplify your deployments?
					</p>
					<div className="mt-6">
						<a
							href="https://auth.godeploy.app"
							className="inline-flex items-center rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-green-700 transition-colors"
						>
							Start Deploying in 60 Seconds →
						</a>
					</div>
				</div>
			</Container>
		</section>
	);
}

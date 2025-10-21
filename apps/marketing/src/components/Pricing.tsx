import Link from "next/link";
import { Container } from "@/components/Container";

export function Pricing() {
	return (
		<section
			id="pricing"
			aria-label="Pricing"
			className="border-t border-slate-100 bg-white py-32 md:py-40"
		>
			<Container>
				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-16 md:grid-cols-2">
					<div className="flex flex-col items-start">
						<p className="text-4xl font-light text-slate-900 md:text-5xl">
							Free
						</p>
						<p className="mt-4 text-lg font-light text-slate-500">Try it</p>
						<Link
							href="https://auth.godeploy.app"
							className="mt-8 text-sm font-medium text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4 transition hover:text-slate-600"
						>
							Get started
						</Link>
					</div>

					<div className="flex flex-col items-start">
						<p className="text-4xl font-light text-slate-900 md:text-5xl">
							$49
							<span className="text-2xl text-slate-400">/year</span>
						</p>
						<p className="mt-4 text-lg font-light text-slate-500">
							Unlimited projects
						</p>
						<Link
							href="https://auth.godeploy.app"
							className="mt-8 text-sm font-medium text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600"
						>
							Get started
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}

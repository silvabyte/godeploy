"use client";

import Link from "next/link";
import { Container } from "@/components/Container";

export function Hero() {
	return (
	<Container className="relative">
		<div className="flex min-h-[85vh] flex-col items-center justify-center py-32 md:py-40">
			{/* biome-ignore lint/correctness/useUniqueElementIds: Static ID used for CSS targeting and animations */}
			<h1
				id="hero-heading"
				className="font-display text-center text-7xl font-light tracking-tight text-slate-900 sm:text-8xl md:text-9xl"
			>
				Deploy.
			</h1>

				<p className="mt-16 text-center text-lg font-light tracking-wide text-slate-500 sm:text-xl">
					One command. Everything else is noise.
				</p>

				<div className="mt-12">
					<code className="inline-block rounded-none border border-slate-200 bg-slate-50 px-6 py-3 font-mono text-sm text-slate-900">
						godeploy deploy
					</code>
				</div>

				<div className="mt-16">
					<Link
						href="https://auth.godeploy.app"
						className="text-sm font-medium text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600"
					>
						Get started
					</Link>
				</div>
			</div>
		</Container>
	);
}

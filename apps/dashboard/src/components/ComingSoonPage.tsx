import type { ReactNode } from "react";
import { Badge, type BadgeStatus } from "./Badge";

interface ComingSoonPageProps {
	title: ReactNode;
	description: string;
	status: BadgeStatus;
	backLink?: string;
}

export function ComingSoonPage({
	title,
	description,
	status,
	backLink = "/",
}: ComingSoonPageProps) {
	return (
		<div className="relative isolate flex h-[calc(100vh-65px)] items-center overflow-hidden bg-white">
			<div className="w-full px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<div className="relative mb-4">
						<h2 className="font-mono text-5xl font-bold tracking-tight text-balance text-slate-900 sm:text-6xl [text-wrap:balance] leading-[1.1]">
							{title}
						</h2>
						<Badge
							status={status}
							className="text-sm absolute -top-1 -right-16"
						/>
					</div>
					<p className="font-mono mx-auto mt-8 max-w-xl text-lg/8 text-pretty text-slate-600">
						{description}
					</p>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<a
							href={backLink}
							className="rounded-full bg-green-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 active:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
						>
							Back to Deployments
						</a>
					</div>
				</div>
			</div>
			<svg
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 -z-10 size-[96rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
			>
				<defs>
					<radialGradient
						id={`gradient-green-${Math.random().toString(36).substr(2, 9)}`}
						cx="50%"
						cy="50%"
						r="70%"
						fx="50%"
						fy="50%"
					>
						<stop
							offset="0%"
							style={{ stopColor: "#4ADE80", stopOpacity: 0.8 }}
						/>
						<stop
							offset="45%"
							style={{ stopColor: "#22C55E", stopOpacity: 0.6 }}
						/>
						<stop
							offset="75%"
							style={{ stopColor: "#16A34A", stopOpacity: 0.3 }}
						/>
						<stop
							offset="100%"
							style={{ stopColor: "#15803D", stopOpacity: 0.1 }}
						/>
					</radialGradient>
				</defs>
				<circle
					r={768}
					cx={512}
					cy={512}
					fill="url(#gradient-green)"
					className="opacity-80"
				/>
			</svg>
		</div>
	);
}

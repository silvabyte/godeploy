import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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
		<div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-32 lg:px-8">
			<div className="mx-auto max-w-2xl text-center space-y-16">
				<div>
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						{title}
					</h1>
					<div className="mt-8 flex items-center justify-center">
						<Badge status={status} className="font-light" />
					</div>
				</div>

				<p className="text-lg font-light text-slate-500">
					{description}
				</p>

				<Link
					to={backLink}
					className="inline-block text-sm font-medium text-slate-900 underline decoration-green-500 decoration-2 underline-offset-4 transition hover:text-green-600"
				>
					Back to Deployments
				</Link>
			</div>
		</div>
	);
}

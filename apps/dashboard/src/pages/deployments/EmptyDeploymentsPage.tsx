import { t } from "@matsilva/xtranslate";
import React from "react";
import { Terminal } from "../../components/terminal/Terminal";
import { TerminalLine } from "../../components/terminal/TerminalLines";
import type { User } from "../../services/types";

export function EmptyDeploymentsPage({ user }: { user: User }) {
	const gradientId = React.useId();
	return (
		<div className="relative isolate flex h-[calc(100vh-65px)] items-center overflow-hidden bg-gray-900">
			<div className="w-full px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
						{t("deployments.empty.title")}
					</h2>
					<p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
						{t("deployments.empty.description")}
					</p>
					<div className="mt-10 text-left">
						<Terminal title="GoDeploy CLI">
							<TerminalLine
								comment="# 1. Install the GoDeploy CLI"
								prompt="$"
								command="curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash"
								delay={0}
							/>
							<TerminalLine
								comment="# 2. Log in to your GoDeploy account"
								prompt="$"
								command={`godeploy auth login --email=${user.email}`}
								delay={500}
							/>
							<TerminalLine
								comment="# 3. Initialize your project"
								prompt="$"
								command="godeploy init"
								delay={1000}
							/>
							<TerminalLine
								comment="# 4. Build your application"
								prompt="$"
								command="npm run build"
								delay={1500}
							/>
							<TerminalLine
								comment="# 5. Deploy your application"
								prompt="$"
								command="godeploy deploy"
								delay={2000}
								output="> Your application is now live at https://your-example-app.godeploy.app 🚀"
							/>
							<TerminalLine
								comment="# 6. Your deployments will appear on this page"
								delay={500}
							/>
						</Terminal>
					</div>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<a
							href="https://github.com/matsilva/godeploy/blob/main/docs/deploy.md"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							{t("deployments.empty.viewDocs")}
						</a>
					</div>
				</div>
			</div>
			<svg
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
			>
				<circle
					r={512}
					cx={512}
					cy={512}
					fill={`url(#${gradientId})`}
					fillOpacity="0.7"
				/>
				<defs>
					<radialGradient id={gradientId}>
						<stop stopColor="#6366f1" />
						<stop offset={1} stopColor="#4f46e5" />
					</radialGradient>
				</defs>
			</svg>
		</div>
	);
}

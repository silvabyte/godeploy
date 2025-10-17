"use client";

import { type Metadata } from "next";
import Link from "next/link";
import { TerminalLine } from "@/components/TerminalLines";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { SlimLayout } from "@/components/SlimLayout";

export default function Login() {
	return (
		<SlimLayout>
			<Link href="/" aria-label="Home">
				<Logo className="h-w24 -ml-11" />
			</Link>
			<h2 className="mt-8 text-2xl font-bold text-gray-900">
				Login with GoDeploy CLI
			</h2>
			<p className="mt-2 text-sm text-gray-700">
				Deploy your SPAs with one command. No DevOps. No SSR. Just static.
			</p>

			<div className="mt-6 h-54 overflow-hidden rounded-lg bg-gray-900 p-4 text-white lg:-mx-12">
				<div className="mb-3 flex items-center">
					<div className="flex space-x-2">
						<div className="h-3 w-3 rounded-full bg-red-500"></div>
						<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
						<div className="h-3 w-3 rounded-full bg-green-500"></div>
					</div>
					<div className="ml-2 text-xs text-gray-400">Terminal</div>
				</div>

				<div className="space-y-2">
					<TerminalLine output="# Install godeploy if you haven't already" />
					<TerminalLine
						prompt="$"
						command="curl -sSL https://install.godeploy.app | bash"
						delay={800}
					/>
					<TerminalLine
						output="✓ Installed godeploy, login to deploy your app"
						delay={1600}
					/>

					<TerminalLine
						prompt="$"
						command="godeploy auth login --email your@email.com"
						delay={2000}
					/>
					<TerminalLine output="✓ Logged in as: your@email.com" delay={2400} />
				</div>
			</div>

			<div className="mt-6 flex flex-col items-center">
				<Button
					href="https://github.com/matsilva/godeploy/blob/main/docs/deploy.md"
					variant="outline"
					color="slate"
					className="w-full"
				>
					<span className="flex items-center justify-center">
						<svg
							className="mr-2 h-5 w-5"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								clipRule="evenodd"
							/>
						</svg>
						View on GitHub
					</span>
				</Button>

				<p className="mt-6 text-sm text-gray-700">
					Don't have an account?{" "}
					<a
						href="https://auth.godeploy.app"
						className="font-medium text-indigo-600 hover:underline"
					>
						Sign up
					</a>{" "}
					for early access.
				</p>
			</div>
		</SlimLayout>
	);
}

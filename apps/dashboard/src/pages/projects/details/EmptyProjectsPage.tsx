import type { User } from "../../../services/types";

export function EmptyProjectsPage({ user }: { user: User }) {
	return (
		<div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-32 lg:px-8">
			<div className="mx-auto max-w-2xl text-center space-y-16">
				<div>
					<h1 className="text-6xl font-light tracking-tight text-slate-900 sm:text-7xl md:text-8xl">
						Create.
					</h1>
					<p className="mt-8 text-lg font-light text-slate-500">
						Your first project starts here.
					</p>
				</div>

				<div className="space-y-6">
					<div className="border border-slate-100 bg-slate-50 p-6 text-left">
						<code className="block font-mono text-sm text-slate-900 space-y-2">
							<div className="text-slate-500"># Install CLI</div>
							<div>curl -sSL https://install.godeploy.app/now.sh | bash</div>
							<div className="pt-4 text-slate-500"># Login</div>
							<div>godeploy auth login --email={user.email}</div>
							<div className="pt-4 text-slate-500"># Initialize</div>
							<div>godeploy init</div>
						</code>
					</div>
				</div>
			</div>
		</div>
	);
}

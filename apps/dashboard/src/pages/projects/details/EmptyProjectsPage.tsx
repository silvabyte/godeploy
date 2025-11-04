import { t } from "@matsilva/xtranslate";
import { useState } from "react";
import { Button } from "../../../components/Button";
import type { User } from "../../../services/types";
import { NewGodrawProjectDialog } from "../NewGodrawProjectDialog";

export function EmptyProjectsPage({ user }: { user: User }) {
	const [showNewGodrawDialog, setShowNewGodrawDialog] = useState(false);

	return (
		<>
			<NewGodrawProjectDialog
				isOpen={showNewGodrawDialog}
				onClose={() => setShowNewGodrawDialog(false)}
			/>
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

					<div className="space-y-8">
						{/* Visual Site Builder Option */}
						<div className="border border-slate-200 bg-white p-8">
							<h2 className="text-xl font-light text-slate-900 mb-3">
								{t("projects.empty.godraw.title")}
							</h2>
							<p className="text-sm font-light text-slate-500 mb-6">
								{t("projects.empty.godraw.description")}
							</p>
							<Button
								variant="primary"
								color="green"
								onClick={() => setShowNewGodrawDialog(true)}
							>
								{t("projects.newGodrawProject")}
							</Button>
						</div>

						{/* CLI Option */}
						<div className="border border-slate-100 bg-slate-50 p-6">
							<h2 className="text-base font-light text-slate-700 mb-4 text-left">
								{t("projects.empty.cli.title")}
							</h2>
							<code className="block font-mono text-sm text-slate-900 space-y-2 text-left">
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
		</>
	);
}

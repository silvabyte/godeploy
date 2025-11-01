import { Form } from "react-router-dom";
import { Heading } from "../../../../components/typography/Heading";
import { FeatureFlags, FLAGS } from "../../../../featureflags/ff";
import type { Project } from "../../project.types";
import { ComingSoonCardOverlay } from "./ComingSoonCardOverlay";

interface DeleteProjectProps {
	project: Project;
}

export function DeleteProject({ project }: DeleteProjectProps) {
	return (
		<div>
			<Heading level={2} className="text-lg font-medium text-slate-900 mb-6">
				Danger Zone
			</Heading>

			<div className="bg-white shadow sm:rounded-lg relative">
				<ComingSoonCardOverlay
					show={
						!FeatureFlags.getInstance().isEnabled(FLAGS.ENABLE_DELETE_PROJECTS)
					}
				/>
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-base font-semibold leading-6 text-slate-900">
						Delete this project
					</h3>
					<div className="mt-2 max-w-xl text-sm text-slate-500">
						<p>
							Once you delete a project, there is no going back. Please be
							certain.
						</p>
					</div>
					<div className="mt-5">
						<Form
							action={`/projects/${project.id}`}
							method="DELETE"
							onSubmit={(e) => {
								if (
									!FeatureFlags.getInstance().isEnabled(
										FLAGS.ENABLE_DELETE_PROJECTS,
									)
								) {
									e.preventDefault();
								}
							}}
						>
							<button
								type="submit"
								className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
							>
								Delete project
							</button>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}

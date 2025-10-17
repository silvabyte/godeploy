import React from "react";
import { Form, useNavigation } from "react-router-dom";
import { Button } from "../../../../components/Button";
import { Heading } from "../../../../components/typography/Heading";
import type { Project } from "../../project.types";

interface GeneralProjectSettings {
	project: Project;
}
export const GeneralProjectSettings = ({ project }: GeneralProjectSettings) => {
	const nav = useNavigation();
	const nameInputId = React.useId();
	const descriptionInputId = React.useId();
	return (
		<div>
			<Heading level={2} className="text-lg font-medium text-slate-900 mb-6">
				General Settings
			</Heading>
			<div className="bg-white shadow sm:rounded-lg">
				<Form action={`/projects/${project.id}`} method="PATCH">
					<div className="px-4 py-5 sm:p-6">
						<div className="space-y-6">
							<div>
								<label
									htmlFor={nameInputId}
									className="block text-sm font-medium text-slate-700"
								>
									Project name
								</label>
								<div className="mt-1">
									<input
										type="text"
										name="name"
										id={nameInputId}
										defaultValue={project.name}
										minLength={3}
										className="block w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-slate-900 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor={descriptionInputId}
									className="block text-sm font-medium text-slate-700"
								>
									Description
								</label>
								<div className="mt-1">
									<textarea
										id={descriptionInputId}
										name="description"
										defaultValue={project.description ?? ""}
										rows={3}
										minLength={3}
										className="block w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-slate-900 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm"
									/>
								</div>
								<p className="mt-2 text-sm text-slate-500">
									Brief description of your project. This will be displayed in
									the project list.
								</p>
							</div>
						</div>
					</div>
					<div className="px-4 py-3 text-right sm:px-6 border-t border-slate-200">
						<Button
							type="submit"
							disabled={nav.state === "submitting"}
							variant="primary"
							color="green"
						>
							{nav.state === "submitting" ? "Saving..." : "Save"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};

import type { Project } from "../../project.types.ts";
import { DeleteProject } from "./DeleteProject.tsx";
import { GeneralProjectSettings } from "./GeneralProjectSettings.tsx";
import { ProjectDomainSettings } from "./ProjectDomainSettings.tsx";

interface ProjectSettingsProps {
	project: Project;
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
	return (
		<div className="space-y-10">
			{/* General Settings */}
			<GeneralProjectSettings project={project} />

			{/* Domain Settings */}
			<ProjectDomainSettings project={project} />

			{/* Danger Zone */}
			<DeleteProject project={project} />
		</div>
	);
}

import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import type { User } from "../../services/types";
import { trackEvent } from "../../telemetry/telemetry";
import { EmptyProjectsPage } from "./details/EmptyProjectsPage";
import { ProjectList } from "./ProjectList";
import { ProjectStats } from "./ProjectStats";
import type { Project } from "./project.types";

export function ProjectsPage() {
	const { projects, user } = useLoaderData() as {
		projects: Project[];
		user: User;
	};

	useEffect(() => {
		trackEvent("page_view", { page: "projects" });
	}, []);

	if (!projects?.length) {
		return <EmptyProjectsPage user={user} />;
	}

	return (
		<>
			<ProjectList projects={projects} />
			<ProjectStats projects={projects} />
		</>
	);
}

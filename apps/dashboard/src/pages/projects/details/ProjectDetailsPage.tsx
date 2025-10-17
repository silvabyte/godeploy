import { useEffect } from "react";
import {
	Link,
	useLoaderData,
	useNavigate,
	useNavigation,
	useParams,
} from "react-router-dom";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { StatusDot } from "../../../components/StatusDot";
import { trackEvent } from "../../../telemetry/telemetry";
import type { Deployment } from "../../deployments/deployment.types";
import type { Project } from "../project.types";
import { ProjectDetailsTabs } from "./ProjectDetailsTabs";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectSettings } from "./settings/ProjectSettings";

type TabType = "overview" | "settings";

export function ProjectDetailsPage() {
	const navigate = useNavigate();
	const nav = useNavigation();
	const { tab } = useParams<{ tab?: string }>();
	const activeTab: TabType = tab === "settings" ? "settings" : "overview";

	const { project, deployments } = useLoaderData() as {
		project: Project;
		deployments: Deployment[];
	};

	useEffect(() => {
		trackEvent("page_view", { page: "project_details" });
	}, []);

	if (nav.state === "loading") {
		return (
			<div className="animate-pulse p-6">
				<div className="h-8 w-64 bg-slate-200 rounded mb-6"></div>
				<div className="h-24 bg-slate-200 rounded"></div>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<h2 className="text-xl font-semibold text-slate-900 mb-2">
						Project not found
					</h2>
					<p className="text-slate-600 mb-6">
						The project you're looking for doesn't exist or you don't have
						access to it.
					</p>
					<Button
						onClick={() => navigate("/projects")}
						variant="primary"
						color="green"
					>
						Back to Projects
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Project header */}
			<div className="bg-white border-b border-slate-200">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Tabs */}
					<ProjectDetailsTabs
						activeTab={activeTab}
						onChange={(tab: TabType) => {
							// Navigate to the appropriate URL based on the tab
							if (tab === "overview") {
								navigate(`/projects/${project.id}`);
							} else {
								navigate(`/projects/${project.id}/${tab}`);
							}
						}}
					/>

					{/* Project title and info */}
					<div className="py-6">
						<div className="flex items-center gap-2 mb-1">
							<StatusDot status="success" />
							<div className="flex items-center gap-2 text-lg font-medium">
								<Link
									to="/projects"
									className="text-slate-600 hover:text-slate-900"
								>
									Projects
								</Link>
								<span className="text-slate-400">/</span>
								<span className="text-slate-900">{project.name}</span>
							</div>
							<Badge status="production" className="ml-3">
								Production
							</Badge>
						</div>
						<p className="text-slate-500 text-sm">
							{project.description ||
								`Created ${new Date(project.created_at).toLocaleDateString()}`}
							{project.domain && ` • ${project.domain}`}
							{deployments.length > 0 &&
								deployments.some((d) => d.status === "success") &&
								(() => {
									const lastSuccessfulDeploy = [...deployments]
										.filter((d) => d.status === "success")
										.sort(
											(a, b) =>
												new Date(b.created_at).getTime() -
												new Date(a.created_at).getTime(),
										)[0];
									return ` • Last successful deploy: ${new Date(lastSuccessfulDeploy.created_at).toLocaleDateString()}`;
								})()}
						</p>
					</div>
				</div>
			</div>

			{/* Tab content */}
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{activeTab === "overview" && (
					<ProjectOverview
						project={project}
						deployments={deployments}
						status={nav.state}
					/>
				)}
				{activeTab === "settings" && <ProjectSettings project={project} />}
			</div>
		</div>
	);
}

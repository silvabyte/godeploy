import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { StatusDot } from "../../../components/StatusDot";
import { Heading } from "../../../components/typography/Heading";
import { formatDuration } from "../../../utils/timeUtils";
import type { Deployment } from "../../deployments/deployment.types";
import { calculateDeploymentMetrics } from "../../deployments/metricCalculators";
import type { Project } from "../project.types";

interface ProjectOverviewProps {
	project: Project;
	deployments: Deployment[];
	status: "loading" | "idle" | "submitting";
}

//TODO: collect git data from godeploy-cli
// and add it do the deploy schema
interface DeploymentActivity {
	id: string;
	projectName: string;
	environment: string;
	status: string;
	statusText: string;
	url: string;
	duration: string;
	deployedAt: string;
}

export function ProjectOverview({ deployments, status }: ProjectOverviewProps) {
	// Calculate metrics from deployments
	const metrics = calculateDeploymentMetrics(deployments);

	// Stats derived from metrics
	const stats = {
		deployCount: metrics.totalDeploys,
		avgDeployTime: formatDuration(metrics.averageDeployTime),
		lastUpdated:
			deployments.length > 0
				? formatDistanceToNow(new Date(deployments[0].created_at), {
						addSuffix: true,
					})
				: "N/A",
		successRate: metrics.successRate,
	};

	const recentActivity: DeploymentActivity[] = useMemo(() => {
		// Convert deployments to activity items
		return deployments
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			)
			.slice(0, 5) // Take the 5 most recent
			.map((deployment) => {
				return {
					id: deployment.id,
					projectName: deployment.projectName,
					environment: deployment.environment || "production",
					status: deployment.status,
					statusText:
						deployment.statusText ||
						(deployment.status === "success" ? "Completed" : "Failed"),
					url: deployment.url,
					duration: formatDuration(deployment.duration || 0),
					deployedAt: deployment.created_at
						? formatDistanceToNow(new Date(deployment.created_at), {
								addSuffix: true,
							})
						: "Unknown",
				};
			});
	}, [deployments]);

	if (status === "loading") {
		return (
			<div className="animate-pulse">
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{["stat-1", "stat-2", "stat-3", "stat-4"].map((id) => (
						<div key={id} className="bg-white rounded-lg p-6 shadow-sm">
							<div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
							<div className="h-8 bg-slate-200 rounded w-16"></div>
						</div>
					))}
				</div>
				<div className="mt-8">
					<div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
					<div className="space-y-4">
						{["list-1", "list-2", "list-3", "list-4"].map((id) => (
							<div key={id} className="bg-white rounded-lg p-4 shadow-sm">
								<div className="flex items-center">
									<div className="h-10 w-10 rounded-full bg-slate-200 mr-3"></div>
									<div className="flex-1">
										<div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
										<div className="h-3 bg-slate-200 rounded w-24"></div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Stats grid */}
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<div className="overflow-hidden rounded-lg bg-white shadow">
					<div className="p-5">
						<div className="text-sm font-medium text-slate-500">
							Number of deploys
						</div>
						<div className="mt-1 text-4xl font-semibold text-slate-900">
							{stats.deployCount}
						</div>
					</div>
				</div>
				<div className="overflow-hidden rounded-lg bg-white shadow">
					<div className="p-5">
						<div className="text-sm font-medium text-slate-500">
							Average deploy time
						</div>
						<div className="mt-1 text-4xl font-semibold text-slate-900">
							{stats.avgDeployTime}
						</div>
					</div>
				</div>
				<div className="overflow-hidden rounded-lg bg-white shadow">
					<div className="p-5">
						<div className="text-sm font-medium text-slate-500">
							Last updated
						</div>
						<div className="mt-1 text-4xl font-semibold text-slate-900">
							{stats.lastUpdated}
						</div>
					</div>
				</div>
				<div className="overflow-hidden rounded-lg bg-white shadow">
					<div className="p-5">
						<div className="text-sm font-medium text-slate-500">
							Success rate
						</div>
						<div className="mt-1 text-4xl font-semibold text-slate-900">
							{stats.successRate}%
						</div>
					</div>
				</div>
			</div>

			{/* Latest deploys */}
			<div className="mt-8">
				<Heading level={2} className="text-lg font-medium text-slate-900 mb-4">
					Latest deploys
				</Heading>
				<div className="overflow-hidden bg-white shadow sm:rounded-md">
					<div className="px-4 py-3 sm:px-6 border-b border-slate-200">
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-3">
								<div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Project
								</div>
							</div>
							<div className="col-span-4">
								<div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									URL
								</div>
							</div>
							<div className="col-span-2">
								<div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Status
								</div>
							</div>
							<div className="col-span-1">
								<div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Duration
								</div>
							</div>
							<div className="col-span-2 text-right">
								<div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Deployed at
								</div>
							</div>
						</div>
					</div>
					<ul className="divide-y divide-slate-200">
						{recentActivity.map((activity) => (
							<li key={activity.id}>
								<div className="px-4 py-4 sm:px-6">
									<div className="grid grid-cols-12 gap-4">
										<div className="col-span-3 flex items-center">
											<div className="text-sm font-medium text-slate-900">
												{activity.projectName}
											</div>
											<span className="ml-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
												{activity.environment}
											</span>
										</div>
										<div className="col-span-4 flex items-center">
											<div className="flex items-center text-sm text-slate-500">
												<a
													href={activity.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-emerald-600 hover:text-emerald-500"
												>
													{new URL(activity.url).hostname}
												</a>
											</div>
										</div>
										<div className="col-span-2 flex items-center">
											<StatusDot
												status={
													activity.status === "success" ? "success" : "failed"
												}
												className="mr-2"
											/>
											<span className="text-sm text-slate-700">
												{activity.statusText}
											</span>
										</div>
										<div className="col-span-1 flex items-center">
											<span className="text-sm text-slate-500">
												{activity.duration}
											</span>
										</div>
										<div className="col-span-2 flex items-center justify-end">
											<div className="text-sm text-slate-500">
												{activity.deployedAt}
											</div>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

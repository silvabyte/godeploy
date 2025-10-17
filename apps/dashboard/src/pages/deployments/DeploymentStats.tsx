import {
	ArrowTrendingUpIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";
import { t } from "@matsilva/xtranslate";
import { StatusDot, type StatusType } from "../../components/StatusDot";
import { Tooltip } from "../../components/Tooltip";
import { Heading } from "../../components/typography/Heading";
import { Text } from "../../components/typography/Text";
import { formatCompactNumber } from "../../utils/numberFormatters";
import { formatDuration } from "../../utils/timeUtils";
import { DeploymentBarChart } from "./charts/DeploymentBarChart";
import DeploymentSuccessPie from "./charts/DeploymentSuccessPie";
import type { Deployment } from "./deployment.types";
import {
	calculateDeploymentMetrics,
	getLatestDeploymentsByProject,
} from "./metricCalculators";

export function DeploymentStats({
	deployments,
}: {
	deployments: Deployment[];
}) {
	const metrics = calculateDeploymentMetrics(deployments);
	const latestProjectDeployments = getLatestDeploymentsByProject(deployments);

	const stats = [
		{
			name: t("deployments.stats.metrics.totalDeploys.label"),
			value: formatCompactNumber(metrics.totalDeploys),
			icon: ChartBarIcon,
			tooltip: t("deployments.stats.metrics.totalDeploys.tooltip"),
		},
		{
			name: t("deployments.stats.metrics.avgPerDay.label"),
			value: metrics.averageDeploysPerDay.toFixed(1),
			icon: ArrowTrendingUpIcon,
			tooltip: t("deployments.stats.metrics.avgPerDay.tooltip"),
		},
		{
			name: t("deployments.stats.metrics.successRate.label"),
			value: `${metrics.successRate.toFixed(1)}%`,
			icon: CheckCircleIcon,
			tooltip: t("deployments.stats.metrics.successRate.tooltip"),
		},
		{
			name: t("deployments.stats.metrics.avgTime.label"),
			value: formatDuration(metrics.averageDeployTime),
			icon: ClockIcon,
			tooltip: t("deployments.stats.metrics.avgTime.tooltip"),
		},
	];

	return (
		<aside className="bg-white lg:fixed lg:top-16 lg:right-0 lg:bottom-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-slate-200">
			<header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
				<div>
					<Heading level={2} className="text-lg font-semibold">
						{t("deployments.stats.title")}
					</Heading>
					<Text variant="small" className="text-slate-500">
						{t("deployments.stats.timeframe")}
					</Text>
				</div>
				<div className="w-26 h-26 rounded-lg bg-slate-50 transition-colors hover:bg-slate-100">
					<DeploymentSuccessPie deployments={deployments} />
				</div>
			</header>

			<div className="space-y-6 p-6">
				{/* Charts Section */}
				<div className="rounded-lg bg-slate-50 p-4">
					<Heading level={3} className="mb-4 text-sm font-medium">
						{t("deployments.stats.charts.daily")}
					</Heading>
					<DeploymentBarChart deployments={deployments} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					{stats.map((stat) => (
						<div
							key={stat.name}
							className="relative rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100"
						>
							<Tooltip content={stat.tooltip}>
								<div className="flex items-start space-x-3">
									<stat.icon className="h-5 w-5 text-emerald-600" />
									<div>
										<Text
											variant="body"
											size="sm"
											className="font-medium text-slate-500"
										>
											{stat.name}
										</Text>
										<Text
											variant="body"
											size="2xl"
											className="mt-1 font-semibold tracking-tight text-slate-900"
										>
											{stat.value}
										</Text>
									</div>
								</div>
							</Tooltip>
						</div>
					))}
				</div>

				{/* Latest Project Deployments */}
				<div className="rounded-lg bg-slate-50">
					<Heading
						level={3}
						className="border-b border-slate-200 px-4 py-3 text-sm font-medium"
					>
						{t("deployments.stats.latestProjects.title")}
					</Heading>
					<ul className="divide-y divide-slate-200">
						{latestProjectDeployments.map((deployment) => (
							<li
								key={deployment.id}
								className="group px-4 py-3 transition-colors hover:bg-slate-100"
							>
								<div className="flex items-center gap-x-3">
									<StatusDot status={deployment.status as StatusType} />
									<Text
										variant="body"
										className="flex-auto truncate font-medium"
									>
										{deployment.projectName}
									</Text>
									<time
										dateTime={deployment.created_at}
										className="flex-none text-xs text-slate-500"
									>
										{new Date(deployment.created_at).toLocaleDateString()}
									</time>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</aside>
	);
}

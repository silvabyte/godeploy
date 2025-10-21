import { t } from "@matsilva/xtranslate";
import { Badge } from "../../components/Badge";
import { StatusDot, type StatusType } from "../../components/StatusDot";
import { Text } from "../../components/typography/Text";
import type { Deployment } from "./deployment.types";

interface DeploymentItemProps {
	deployment: Deployment;
}

function DeployDateText({ deployment }: { deployment: Deployment }) {
	const dateFormatter = new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	});

	const relativeFormatter = new Intl.RelativeTimeFormat("en-US", {
		numeric: "auto",
		style: "long",
	});

	const date = new Date(deployment.created_at);
	const now = new Date();
	const diff = date.getTime() - now.getTime();

	// Convert to the largest appropriate unit
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	return (
		<Text variant="small" className="whitespace-nowrap">
			{`${t(`deployments.whenStatus.${deployment.status}`)} `}
			{Math.abs(days) < 30
				? days < -1
					? relativeFormatter.format(days, "day")
					: hours < -1
						? relativeFormatter.format(hours, "hour")
						: minutes < -1
							? relativeFormatter.format(minutes, "minute")
							: relativeFormatter.format(seconds, "second")
				: dateFormatter.format(date)}
		</Text>
	);
}

export function DeploymentItem({ deployment }: DeploymentItemProps) {
	return (
		<li className="group relative flex items-center space-x-4 px-6 py-6 transition-colors sm:px-8 lg:px-12">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<StatusDot status={deployment.status as StatusType} />
					<Text variant="body" className="min-w-0 font-light flex gap-x-2">
						<span className="whitespace-nowrap">{deployment.projectName}</span>
						<span className="text-slate-300">
							{t("deployments.list.teamSeparator")}
						</span>
						<span className="truncate">
							{deployment.description || deployment.projectName}
						</span>
					</Text>
				</div>
				<div className="mt-2 flex items-center gap-x-2.5 text-xs font-light">
					<DeployDateText deployment={deployment} />
					<svg
						aria-hidden="true"
						viewBox="0 0 2 2"
						className="size-0.5 flex-none fill-slate-300"
					>
						<circle r={1} cx={1} cy={1} />
					</svg>
					<a
						href={deployment.url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-600 hover:text-green-700 cursor-pointer transition"
						title={t("deployments.list.visitSite")}
					>
						{deployment.url}
					</a>
				</div>
			</div>
			<Badge
				status={deployment.environment as "preview" | "production"}
				className="flex-none capitalize font-light"
			>
				{deployment.environment}
			</Badge>
		</li>
	);
}

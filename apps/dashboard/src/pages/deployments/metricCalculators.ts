import { format, isWithinInterval, subDays } from "date-fns";
import memoize from "fast-memoize";
import { debug } from "../../utils/debug";
import type { Deployment } from "./deployment.types";

interface DeploymentMetrics {
	totalDeploys: number;
	averageDeploysPerDay: number;
	successRate: number;
	averageDeployTime: number;
	deploysByDate: Record<string, number>;
}

export const calculateDeploymentMetrics = memoize(
	(deployments: Deployment[], now: Date = new Date()): DeploymentMetrics => {
		const thirtyDaysAgo = subDays(now, 30);
		const recentDeployments = deployments.filter((deployment) =>
			isWithinInterval(new Date(deployment.created_at), {
				start: thirtyDaysAgo,
				end: now,
			}),
		);

		const totalDeploys = recentDeployments.length;
		const successfulDeploys = recentDeployments.filter(
			(d) => d.status === "success",
		).length;
		const successRate = totalDeploys
			? Number(((successfulDeploys / totalDeploys) * 100).toFixed(2))
			: 0;

		const deploysWithDuration = recentDeployments.filter(
			(d) => d.duration != null,
		);
		const totalDuration = deploysWithDuration.reduce(
			(sum, d) => sum + (d.duration || 0),
			0,
		);
		const averageDeployTime = deploysWithDuration.length
			? totalDuration / deploysWithDuration.length
			: 0;

		const deploysByDate = generateEmptyDateRange(thirtyDaysAgo, now);
		recentDeployments.forEach((deployment) => {
			const dateKey = format(new Date(deployment.created_at), "yyyy-MM-dd");
			deploysByDate[dateKey] = (deploysByDate[dateKey] || 0) + 1;
		});

		return {
			totalDeploys,
			averageDeploysPerDay: totalDeploys / 30,
			successRate,
			averageDeployTime,
			deploysByDate,
		};
	},
);

export const getLatestDeploymentsByProject = memoize(
	(deployments: Deployment[], limit?: number): Deployment[] => {
		const l = limit ?? 5;
		// Then take the most recent deployment for each project up to the limit
		const projectMap = new Map<string, Deployment>();
		for (const deployment of deployments) {
			if (projectMap.size >= l) {
				break;
			}
			if (!projectMap.has(deployment.projectName)) {
				projectMap.set(deployment.projectName, deployment);
			}
		}

		const arr = Array.from(projectMap.values());
		debug.log("[getLatestDeploymentsByProject] arr", { arr, limit: l });
		return arr;
	},
);

export const generateEmptyDateRange = memoize(
	(start: Date, end: Date): Record<string, number> => {
		const dateRange: Record<string, number> = {};
		let currentDate = new Date(start);

		// Set time to noon UTC to avoid timezone issues
		currentDate.setUTCHours(12, 0, 0, 0);
		const endDate = new Date(end);
		endDate.setUTCHours(12, 0, 0, 0);

		while (currentDate <= endDate) {
			const formattedDate = format(currentDate, "yyyy-MM-dd");
			dateRange[formattedDate] = 0;
			currentDate = new Date(currentDate);
			currentDate.setUTCDate(currentDate.getUTCDate() + 1);
		}

		return dateRange;
	},
);

import { format, parseISO } from "date-fns";
import memoize from "fast-memoize";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";
import type {
	NameType,
	ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { Deployment } from "../deployment.types";

const AggregateDeployments = memoize((deployments: Deployment[]) => {
	const data = deployments.reduce(
		(acc, deployment) => {
			const date = format(new Date(deployment.created_at), "yyyy-MM-dd");
			const entry = acc[date] || { name: date, deploys: 0 };
			entry.deploys++;
			acc[date] = entry;
			return acc;
		},
		{} as Record<string, { name: string; deploys: number }>,
	);
	return Object.values(data).sort(
		(a, b) => parseISO(a.name).getTime() - parseISO(b.name).getTime(),
	);
});

const CustomTooltip = ({
	active,
	payload,
}: TooltipProps<ValueType, NameType>) => {
	if (active && payload && payload.length) {
		const data = payload[0];
		if (!data) return null;
		const date = parseISO(data.payload.name);
		return (
			<div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
				<p className="text-sm font-medium text-slate-900">
					{format(date, "MMM d, yyyy")}
				</p>
				<p className="text-sm text-slate-500">
					Deploys:{" "}
					<span className="text-green-600 font-medium">{data.value}</span>
				</p>
			</div>
		);
	}
	return null;
};

export const DeploymentBarChart = ({
	deployments,
}: {
	deployments: Deployment[];
}) => {
	const data = AggregateDeployments(deployments);
	return (
		<div className="w-full h-[150px]">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart width={150} height={40} data={data}>
					<Tooltip
						content={<CustomTooltip />}
						cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
						wrapperStyle={{ outline: "none" }}
					/>
					<Bar
						dataKey="deploys"
						fill="#4ADE80"
						radius={[4, 4, 0, 0]}
						className="hover:fill-green-400 transition-colors"
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

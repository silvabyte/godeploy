import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Deployment } from "../deployment.types";

const COLORS = {
	success: "#4ADE80", // green-400
	failed: "#F87171", // red-400
	pending: "#FBBF24", // amber-400
};

interface DeploymentData {
	name: string;
	value: number;
	color: string;
	total?: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		name: string;
		value: number;
		payload: DeploymentData;
	}>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="absolute right-full top-full mr-2 bg-white border border-slate-200 rounded-lg p-3 shadow-lg w-48">
				<p className="text-sm font-medium text-slate-900">{payload[0].name}</p>
				<p className="text-sm text-slate-500">
					Count:{" "}
					<span className="text-green-600 font-medium">{payload[0].value}</span>
				</p>
				<p className="text-sm text-slate-500">
					Percentage:{" "}
					<span className="text-green-600 font-medium">
						{((payload[0].value / payload[0].payload.total!) * 100).toFixed(1)}%
					</span>
				</p>
			</div>
		);
	}
	return null;
};

export default function DeploymentSuccessPie({
	deployments,
}: {
	deployments: Deployment[];
}) {
	const total = deployments.length;
	const data: DeploymentData[] = [
		{
			name: "Successful",
			value: deployments.filter((d) => d.status === "success").length,
			color: COLORS.success,
		},
		{
			name: "Failed",
			value: deployments.filter((d) => d.status === "failed").length,
			color: COLORS.failed,
		},
		{
			name: "Pending",
			value: deployments.filter((d) => d.status === "pending").length,
			color: COLORS.pending,
		},
	].filter((item) => item.value > 0);

	const dataWithTotal = data.map((item) => ({ ...item, total }));

	return (
		<div className="w-full h-full relative">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={dataWithTotal}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={25}
						outerRadius={35}
						paddingAngle={2}
						animationDuration={750}
						animationBegin={0}
						legendType="none"
					>
						{data.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={entry.color}
								strokeWidth={2}
								stroke="#FFFFFF"
							/>
						))}
					</Pie>
					<Pie
						data={dataWithTotal}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={38}
						outerRadius={40}
						paddingAngle={2}
						animationDuration={750}
						animationBegin={0}
						legendType="none"
					>
						{data.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={entry.color}
								strokeWidth={2}
								stroke="#FFFFFF"
							/>
						))}
					</Pie>
					<Tooltip
						content={<CustomTooltip />}
						position={{ x: 0, y: 0 }}
						allowEscapeViewBox={{ x: true, y: true }}
						wrapperStyle={{ outline: "none" }}
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}

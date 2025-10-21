import { format, isWithinInterval, startOfDay, subDays } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Project } from "../project.types";

interface ChartData {
	date: string;
	projects: number;
}

// Function to aggregate projects by day
const AggregateProjects = (projects: Project[]): ChartData[] => {
	const now = new Date();
	const thirtyDaysAgo = subDays(now, 30);

	// Initialize data array with the last 30 days
	const data: ChartData[] = [];
	for (let i = 29; i >= 0; i--) {
		const date = subDays(now, i);
		data.push({
			date: format(date, "MMM d"),
			projects: 0,
		});
	}

	// Count projects created on each day
	projects.forEach((project) => {
		const createdAt = new Date(project.created_at || "");
		const createdAtDay = startOfDay(createdAt);

		if (isWithinInterval(createdAtDay, { start: thirtyDaysAgo, end: now })) {
			const dayIndex = Math.floor(
				(now.getTime() - createdAtDay.getTime()) / (1000 * 60 * 60 * 24),
			);
			if (dayIndex >= 0 && dayIndex < 30) {
				const targetDay = data[29 - dayIndex];
				if (targetDay) {
					targetDay.projects += 1;
				}
			}
		}
	});

	return data;
};

// Custom tooltip component
interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ value: number }>;
	label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0];
		if (!data) return null;
		return (
			<div className="rounded bg-slate-800 p-2 text-xs shadow-lg">
				<p className="font-medium text-white">{label}</p>
				<p className="text-emerald-400">{`Projects: ${data.value}`}</p>
			</div>
		);
	}
	return null;
};

export const ProjectBarChart = ({ projects }: { projects: Project[] }) => {
	const data = AggregateProjects(projects);

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
						dataKey="projects"
						fill="#4ADE80"
						radius={[4, 4, 0, 0]}
						className="hover:fill-green-400 transition-colors"
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

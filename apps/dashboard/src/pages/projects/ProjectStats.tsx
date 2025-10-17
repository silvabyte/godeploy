import {
	CalendarIcon,
	ClockIcon,
	CodeBracketIcon,
	DocumentIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { Heading } from "../../components/typography/Heading";
import { Text } from "../../components/typography/Text";
import { formatCompactNumber } from "../../utils/numberFormatters";
import { ProjectBarChart } from "./charts/ProjectBarChart";
import type { Project } from "./project.types";

export function ProjectStats({ projects }: { projects: Project[] }) {
	// Sort projects by creation date (newest first)
	const sortedProjects = [...projects].sort((a, b) => {
		return (
			new Date(b.created_at || "").getTime() -
			new Date(a.created_at || "").getTime()
		);
	});

	// Calculate some basic metrics
	const totalProjects = projects.length;
	const avgProjectAge =
		projects.reduce((sum, project) => {
			const createdDate = new Date(project.created_at || "");
			const now = new Date();
			return (
				sum + (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
			);
		}, 0) / Math.max(projects.length, 1);

	const stats = [
		{
			name: "Total Projects",
			value: formatCompactNumber(totalProjects),
			icon: DocumentIcon,
			tooltip: "Total number of projects",
		},
		{
			name: "Avg. Age",
			value: `${Math.round(avgProjectAge)} days`,
			icon: CalendarIcon,
			tooltip: "Average age of projects",
		},
		{
			name: "Last Created",
			value:
				sortedProjects.length > 0
					? formatDistanceToNow(new Date(sortedProjects[0].created_at || ""), {
							addSuffix: true,
						})
					: "N/A",
			icon: ClockIcon,
			tooltip: "Time since last project was created",
		},
		{
			name: "Active Projects",
			value: formatCompactNumber(totalProjects),
			icon: CodeBracketIcon,
			tooltip: "Number of active projects",
		},
	];

	return (
		<aside className="bg-white lg:fixed lg:top-16 lg:right-0 lg:bottom-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-slate-200">
			<header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
				<div>
					<Heading level={2} className="text-lg font-semibold">
						Project Metrics
					</Heading>
					<Text variant="small" className="text-slate-500">
						Last 30 days
					</Text>
				</div>
			</header>

			<div className="space-y-6 p-6">
				{/* Charts Section */}
				<div className="rounded-lg bg-slate-50 p-4">
					<Heading level={3} className="mb-4 text-sm font-medium">
						Project Activity
					</Heading>
					<ProjectBarChart projects={projects} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-4">
					{stats.map((stat) => (
						<div
							key={stat.name}
							className="relative rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100"
						>
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
						</div>
					))}
				</div>
			</div>
		</aside>
	);
}

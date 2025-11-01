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
				sortedProjects.length > 0 && sortedProjects[0]
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
		<aside className="bg-white lg:fixed lg:top-20 lg:right-0 lg:bottom-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-slate-100">
			<header className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
				<div>
					<Heading level={2} className="text-lg font-light">
						Project Metrics
					</Heading>
					<Text variant="small" className="text-slate-500 font-light">
						Last 30 days
					</Text>
				</div>
			</header>

			<div className="space-y-8 p-8">
				{/* Charts Section */}
				<div className="border border-slate-100 p-6">
					<Heading level={3} className="mb-6 text-sm font-light">
						Project Activity
					</Heading>
					<ProjectBarChart projects={projects} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-4">
					{stats.map((stat) => (
						<div
							key={stat.name}
							className="relative border border-slate-100 p-4 transition"
						>
							<div className="flex items-start space-x-2">
								<stat.icon className="h-4 w-4 text-green-500" />
								<div>
									<Text
										variant="body"
										size="sm"
										className="font-light text-slate-500"
									>
										{stat.name}
									</Text>
									<Text
										variant="body"
										size="2xl"
										className="mt-1 font-light tracking-tight text-slate-900"
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

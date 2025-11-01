import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { t } from "@matsilva/xtranslate";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../components/Badge";
import { StatusDot } from "../../components/StatusDot";
import { Text } from "../../components/typography/Text";
import { formatRelativeDate } from "../../utils/timeUtils";
import { ProjectDomain } from "../../utils/url";
import type { Project } from "./project.types";

interface ProjectItemProps {
	project: Project;
}

export function ProjectItem({ project }: ProjectItemProps) {
	const url = ProjectDomain.from(project).determine();
	const navigate = useNavigate();

	return (
		<li className="group relative flex items-center space-x-4 px-6 py-6 transition-colors sm:px-8 lg:px-12">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<StatusDot status="success" />
					<Text variant="body" className="min-w-0 font-light">
						<Link
							to={`/projects/${project.id}`}
							className="whitespace-nowrap hover:text-green-600 transition-colors"
						>
							{project.name}
						</Link>
					</Text>
				</div>
				<div className="mt-2 flex items-center gap-x-2.5 text-xs font-light">
					<time dateTime={project.created_at || ""} className="text-slate-500">
						{formatRelativeDate(project.created_at || "")}
					</time>
					<svg
						aria-hidden="true"
						viewBox="0 0 2 2"
						className="size-0.5 flex-none fill-slate-300"
					>
						<circle r={1} cx={1} cy={1} />
					</svg>
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-600 hover:text-green-700 cursor-pointer transition"
						title={t("projects.item.visitSite")}
					>
						{url}
					</a>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Badge status="production" className="flex-none capitalize font-light">
					{t("projects.item.status.active")}
				</Badge>
				<Menu as="div" className="relative">
					<MenuButton className="flex items-center p-1.5 text-slate-400 hover:text-slate-900 focus:outline-none transition">
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
						</svg>
					</MenuButton>
					<MenuItems
						transition
						className="absolute right-0 z-10 mt-2 w-48 origin-top-right border border-slate-100 bg-white py-1 focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
					>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-4 py-2 text-left text-sm font-light text-slate-700 hover:text-slate-900 transition"
									onClick={() => {
										navigate(`/projects/${project.id}/settings`);
										close();
									}}
								>
									{t("projects.item.actions.settings")}
								</button>
							)}
						</MenuItem>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-4 py-2 text-left text-sm font-light text-slate-700 hover:text-slate-900 transition"
									onClick={() => {
										navigate(`/projects/${project.id}`);
										close();
									}}
								>
									{t("projects.item.actions.viewDetails")}
								</button>
							)}
						</MenuItem>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-4 py-2 text-left text-sm font-light text-red-600 hover:text-red-700 transition"
									onClick={() => close()}
								>
									{t("projects.item.actions.delete")}
								</button>
							)}
						</MenuItem>
					</MenuItems>
				</Menu>
			</div>
		</li>
	);
}

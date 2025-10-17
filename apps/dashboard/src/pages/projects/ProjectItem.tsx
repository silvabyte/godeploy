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
		<li className="group relative flex items-center space-x-4 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-6">
			<div className="min-w-0 flex-auto">
				<div className="flex items-center gap-x-3">
					<StatusDot status="success" />
					<Text variant="body" className="min-w-0 font-medium">
						<Link
							to={`/projects/${project.id}`}
							className="whitespace-nowrap hover:text-emerald-600 transition-colors"
						>
							{project.name}
						</Link>
					</Text>
				</div>
				<div className="mt-2 flex items-center gap-x-2.5 text-xs">
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
						className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
						title={t("projects.item.visitSite")}
					>
						{url}
					</a>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Badge status="production" className="flex-none capitalize">
					{t("projects.item.status.active")}
				</Badge>
				<Menu as="div" className="relative">
					<MenuButton className="flex items-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none">
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
						className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-slate-200 focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
					>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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
									className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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
									className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 hover:text-red-700"
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

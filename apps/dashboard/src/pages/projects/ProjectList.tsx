import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { t } from "@matsilva/xtranslate";
import { useNavigate, useNavigation } from "react-router-dom";
import { Button } from "../../components/Button";
import { Heading } from "../../components/typography/Heading";
import { FeatureFlags, FLAGS } from "../../featureflags/ff";
import { pushQueryParam } from "../../utils/navigate";
import { ProjectItem } from "./ProjectItem";
import { ProjectSkeletonItem } from "./ProjectSkeletonItem";
import type { Project } from "./project.types";

export function ProjectList({ projects }: { projects: Project[] }) {
	const navigate = useNavigate();
	const nav = useNavigation();

	return (
		<main className="lg:pr-96">
			<header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
				<Heading level={1} className="text-base/7 font-semibold">
					{t("projects.title")}
				</Heading>

				{/* Sort dropdown */}
				<div className="flex items-center gap-4">
					<Menu as="div" className="relative">
						<MenuButton className="flex items-center gap-x-1 text-sm/6 font-medium text-slate-700 hover:text-slate-900">
							{t("projects.sort.label")}
							<ChevronUpDownIcon
								aria-hidden="true"
								className="size-5 text-slate-400"
							/>
						</MenuButton>
						<MenuItems
							transition
							className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-slate-200 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
						>
							<MenuItem>
								{({ close }) => (
									<button
										type="button"
										className="block w-full px-3 py-1 text-left text-sm/6 text-slate-700 hover:bg-slate-50 hover:text-slate-900 data-focus:bg-slate-50 data-focus:outline-hidden"
										onClick={(e) => {
											e.preventDefault();
											navigate(pushQueryParam("sort[created_at]", "desc"));
											close();
										}}
									>
										{t("projects.sort.options.newestFirst")}
									</button>
								)}
							</MenuItem>
							<MenuItem>
								{({ close }) => (
									<button
										type="button"
										className="block w-full px-3 py-1 text-left text-sm/6 text-slate-700 hover:bg-slate-50 hover:text-slate-900 data-focus:bg-slate-50 data-focus:outline-hidden"
										onClick={(e) => {
											e.preventDefault();
											navigate(pushQueryParam("sort[created_at]", "asc"));
											close();
										}}
									>
										{t("projects.sort.options.oldestFirst")}
									</button>
								)}
							</MenuItem>
							<MenuItem>
								{({ close }) => (
									<button
										type="button"
										className="block w-full px-3 py-1 text-left text-sm/6 text-slate-700 hover:bg-slate-50 hover:text-slate-900 data-focus:bg-slate-50 data-focus:outline-hidden"
										onClick={(e) => {
											e.preventDefault();
											navigate(pushQueryParam("sort[name]", "asc"));
											close();
										}}
									>
										{t("projects.sort.options.nameAZ")}
									</button>
								)}
							</MenuItem>
						</MenuItems>
					</Menu>

					{FeatureFlags.getInstance().isEnabled(
						FLAGS.ENABLE_CREATE_PROJECT,
					) && (
						<Button variant="primary" color="green">
							{t("projects.newProject")}
						</Button>
					)}
				</div>
			</header>

			{/* Project list */}
			<ul className="divide-y divide-slate-200">
				{projects.length === 0 && (
					<li className="p-4 text-center text-sm/6 text-slate-500">
						{t("projects.noProjects")}
					</li>
				)}
				{nav.state === "loading" &&
					projects.length > 0 &&
					Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((id) => (
						<ProjectSkeletonItem key={id} />
					))}
				{projects.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</ul>
		</main>
	);
}

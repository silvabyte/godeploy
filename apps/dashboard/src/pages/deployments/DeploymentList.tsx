import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { t } from "@matsilva/xtranslate";
import { useNavigate, useNavigation } from "react-router-dom";
import { Heading } from "../../components/typography/Heading";
import { pushQueryParam } from "../../utils/navigate";
import { DeploymentItem } from "./DeploymentItem";
import { DeploymentSkeletonItem } from "./DeploymentSkeletonItem";
import type { Deployment } from "./deployment.types";

export function DeploymentList({ deployments }: { deployments: Deployment[] }) {
	const navigate = useNavigate();
	const nav = useNavigation();

	return (
		<main className="lg:pr-96">
			<header className="flex items-center justify-between border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-8 lg:px-12">
				<Heading level={1} className="text-lg font-light text-slate-900">
					{t("deployments.title")}
				</Heading>

				{/* Sort dropdown */}
				<Menu as="div" className="relative">
					<MenuButton className="flex items-center gap-x-1 text-sm font-light text-slate-500 hover:text-slate-900 transition">
						{t("deployments.list.sort.label")}
						<ChevronUpDownIcon
							aria-hidden="true"
							className="size-4 text-slate-400"
						/>
					</MenuButton>
					<MenuItems
						transition
						className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right border border-slate-100 bg-white py-1 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
					>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-3 py-2 text-left text-sm font-light text-slate-700 hover:text-slate-900 data-focus:text-slate-900 data-focus:outline-hidden transition"
									onClick={(e) => {
										e.preventDefault();
										navigate(pushQueryParam("sort[created_at]", "desc"));
										close();
									}}
								>
									{t("deployments.list.sort.options.dateDesc")}
								</button>
							)}
						</MenuItem>
						<MenuItem>
							{({ close }) => (
								<button
									type="button"
									className="block w-full px-3 py-2 text-left text-sm font-light text-slate-700 hover:text-slate-900 data-focus:text-slate-900 data-focus:outline-hidden transition"
									onClick={(e) => {
										e.preventDefault();
										navigate(pushQueryParam("sort[created_at]", "asc"));
										close();
									}}
								>
									{t("deployments.list.sort.options.dateAsc")}
								</button>
							)}
						</MenuItem>
					</MenuItems>
				</Menu>
			</header>

			{/* Deployment list */}
			<ul className="divide-y divide-slate-100">
				{deployments.length === 0 && (
					<li className="p-6 text-center text-sm font-light text-slate-500">
						No deployments found
					</li>
				)}
				{nav.state === "loading" &&
					deployments.length > 0 &&
					Array.from({ length: 20 }, (_, i) => `skeleton-${i}`).map((id) => (
						<DeploymentSkeletonItem key={id} />
					))}
				{deployments.map((deployment) => (
					<DeploymentItem key={deployment.id} deployment={deployment} />
				))}
			</ul>
		</main>
	);
}

import {
	ChartBarSquareIcon,
	Cog6ToothIcon,
	FolderIcon,
	GlobeAltIcon,
	ServerIcon,
	// SignalIcon,
} from "@heroicons/react/24/outline";
import { t } from "@matsilva/xtranslate";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "../Badge";

const navigation = [
	{
		name: "nav.items.deployments",
		href: "/",
		icon: ServerIcon,
		status: "beta" as const,
	},
	{
		name: "nav.items.projects",
		href: "/projects",
		icon: FolderIcon,
		status: "beta" as const,
	},
	// {
	//   name: 'nav.items.activity',
	//   href: '/activity',
	//   icon: SignalIcon,
	//   current: false
	// },
	{
		name: "nav.items.domains",
		href: "/domains",
		icon: GlobeAltIcon,
		status: "beta" as const,
	},
	{
		name: "nav.items.usage",
		href: "/analytics",
		icon: ChartBarSquareIcon,
		status: "planned" as const,
	},
	{
		name: "nav.items.settings",
		href: "/settings",
		icon: Cog6ToothIcon,
		status: "planned" as const,
	},
];

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export function NavigationList() {
	const { pathname } = useLocation();

	return (
		<ul className="space-y-2">
			{navigation.map((item) => (
				<li key={item.name}>
					<Link
						to={item.href}
						className={classNames(
							pathname === item.href
								? "text-slate-900 font-medium"
								: "text-slate-500 hover:text-slate-900",
							"group flex items-center justify-between gap-x-3 py-2 text-sm font-light transition",
						)}
					>
						<div className="flex items-center gap-x-3">
							<item.icon
								aria-hidden="true"
								className={classNames(
									pathname === item.href
										? "text-green-500"
										: "text-slate-400 group-hover:text-slate-600",
									"size-5 shrink-0 transition",
								)}
							/>
							{t(item.name)}
						</div>
						{item.status !== "beta" && <Badge status={item.status} />}
					</Link>
				</li>
			))}
		</ul>
	);
}

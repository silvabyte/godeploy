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
		<ul className="-mx-2 space-y-1">
			{navigation.map((item) => (
				<li key={item.name}>
					<Link
						to={item.href}
						className={classNames(
							pathname === item.href
								? "bg-green-50 text-green-700"
								: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
							"group flex items-center justify-between gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
						)}
					>
						<div className="flex items-center gap-x-3">
							<item.icon
								aria-hidden="true"
								className={classNames(
									pathname === item.href
										? "text-green-500"
										: "text-slate-500 group-hover:text-slate-700",
									"size-6 shrink-0",
								)}
							/>
							{t(item.name)}
						</div>
						<Badge status={item.status} />
					</Link>
				</li>
			))}
		</ul>
	);
}

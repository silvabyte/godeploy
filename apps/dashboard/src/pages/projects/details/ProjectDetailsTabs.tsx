import clsx from "clsx";

type TabType = "overview" | "settings";

interface ProjectDetailsTabsProps {
	activeTab: TabType;
	onChange: (tab: TabType) => void;
}

export function ProjectDetailsTabs({
	activeTab,
	onChange,
}: ProjectDetailsTabsProps) {
	const tabs = [
		{ id: "overview", label: "Overview" },
		{ id: "settings", label: "Settings" },
	];

	return (
		<div className="border-b border-slate-100">
			<nav className="-mb-px flex space-x-8">
				{tabs.map((tab) => (
					<button
						type="button"
						key={tab.id}
						onClick={() => onChange(tab.id as TabType)}
						className={clsx(
							tab.id === activeTab
								? "border-green-500 text-slate-900"
								: "border-transparent text-slate-500 hover:text-slate-900",
							"whitespace-nowrap border-b-2 py-4 px-1 text-sm font-light cursor-pointer transition",
						)}
					>
						{tab.label}
					</button>
				))}
			</nav>
		</div>
	);
}

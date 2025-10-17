import clsx from "clsx";
import type React from "react";

export type BadgeStatus =
	| "beta"
	| "planned"
	| "development"
	| "preview"
	| "production";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	status: BadgeStatus;
	className?: string;
}

const statusStyles = {
	beta: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
	planned: "bg-slate-50 text-slate-600 ring-slate-500/20",
	development: "bg-amber-50 text-amber-700 ring-amber-600/20",
	preview: "bg-blue-50 text-blue-700 ring-blue-600/20",
	production: "bg-emerald-100 text-emerald-700 ring-emerald-700/30",
};

export function Badge({ status, className, children, ...props }: BadgeProps) {
	return (
		<span
			className={clsx(
				"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
				statusStyles[status],
				className,
			)}
			{...props}
		>
			{children || status}
		</span>
	);
}

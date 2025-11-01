import clsx from "clsx";
import type React from "react";

export type StatusType = "pending" | "success" | "failed";

const statusStyles = {
	pending: "text-yellow-400 bg-yellow-50 ring-yellow-400/30",
	success: "text-emerald-500 bg-emerald-50 ring-emerald-500/30",
	failed: "text-rose-500 bg-rose-50 ring-rose-500/30",
};

interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * The status to display
	 */
	status: StatusType;
	/**
	 * Additional classes to apply to the container
	 */
	className?: string;
}

/**
 * A status indicator dot that shows different colors based on the status.
 * Used to provide visual feedback about the state of an item.
 */
export function StatusDot({ status, className, ...props }: StatusDotProps) {
	return (
		<div
			className={clsx(
				statusStyles[status],
				"flex-none rounded-full p-1 transition-all group-hover:ring-2",
				className,
			)}
			{...props}
		>
			<div className="size-2 rounded-full bg-current" />
		</div>
	);
}

import clsx from "clsx";
import type { ReactNode } from "react";

interface TerminalProps {
	children?: ReactNode;
	className?: string;
	title?: string;
}

export function Terminal({
	children,
	className,
	title = "Terminal",
}: TerminalProps) {
	return (
		<div
			className={clsx(
				"overflow-hidden rounded-xl bg-slate-900 shadow-xl",
				className,
			)}
		>
			{/* Terminal header */}
			<div className="flex items-center justify-between bg-slate-800 px-4 py-2">
				<div className="flex space-x-2">
					<div className="h-3 w-3 rounded-full bg-red-500"></div>
					<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
					<div className="h-3 w-3 rounded-full bg-green-500"></div>
				</div>
				<div className="text-xs font-medium text-slate-400">{title}</div>
				<div className="w-16"></div> {/* Spacer for balance */}
			</div>

			{/* Terminal content */}
			<div className="max-h-[400px] min-h-[300px] overflow-auto p-4 font-mono text-sm text-slate-300 sm:min-h-[350px] md:min-h-[400px]">
				<div className="space-y-4">{children}</div>
			</div>
		</div>
	);
}

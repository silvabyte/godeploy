import { type ReactNode, useState } from "react";

interface TooltipProps {
	children: ReactNode;
	content: string;
	position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	const positionClasses = {
		top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
		bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
		left: "-left-2 top-1/2 -translate-x-full -translate-y-1/2",
		right: "-right-2 top-1/2 translate-x-full -translate-y-1/2",
	};

	return (
		<button
			type="button"
			className="relative inline-block"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
		>
			{children}
			{isVisible && (
				<div
					role="tooltip"
					className={`pointer-events-none absolute z-10 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg ${positionClasses[position]}`}
				>
					<div
						className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900
              ${position === "top" ? "bottom-0 translate-y-1/2" : ""}
              ${position === "bottom" ? "top-0 -translate-y-1/2" : ""}
              ${position === "left" ? "right-0 translate-x-1/2" : ""}
              ${position === "right" ? "left-0 -translate-x-1/2" : ""}`}
					/>
					{content}
				</div>
			)}
		</button>
	);
}

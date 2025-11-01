import { useId } from "react";

export function Logo(props: React.ComponentPropsWithoutRef<"svg">) {
	const gradientId = useId();

	return (
		<svg
			viewBox="0 0 200 50"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style={{ stopColor: "#1F9D55", stopOpacity: 1 }} />
					<stop
						offset="100%"
						style={{ stopColor: "#4ADE80", stopOpacity: 1 }}
					/>
				</linearGradient>
			</defs>

			{/* Central shape - simplified deployment icon */}
			<rect x="20" y="15" width="20" height="20" rx="2" fill="#000" />
			<path d="M25 22 L35 22 L30 30 Z" fill="#4ADE80" stroke="none" />

			{/* Text with clean typography */}
			<text
				x="50"
				y="32"
				fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
				fontSize="20"
				fontWeight="600"
				letterSpacing="-0.02em"
				fill="#000"
			>
				GoDeploy
			</text>
		</svg>
	);
}

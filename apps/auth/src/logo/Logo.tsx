import React from "react";

type LogoProps = React.ComponentPropsWithoutRef<"svg"> & {
	/**
	 * When true, the logo will use the reversed color scheme for dark backgrounds
	 */
	reversed?: boolean;
};

/**
 * The GoDeploy logo represents our brand's core values of simplicity, reliability, and developer-friendliness.
 * It consists of a minimal geometric design with a black square, green triangle, and clean typography.
 */
export function Logo({ reversed = false, ...props }: LogoProps) {
	const primaryColor = reversed ? "#FFFFFF" : "#000000";
	const accentColor = "#4ADE80"; // Green 500 - consistent in both variants
	const gradientId = React.useId();

	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 200 50"
			xmlns="http://www.w3.org/2000/svg"
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
			<rect x="20" y="15" width="20" height="20" rx="2" fill={primaryColor} />
			<path d="M25 22 L35 22 L30 30 Z" fill={accentColor} stroke="none" />

			{/* Text with clean typography */}
			<text
				x="50"
				y="32"
				fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
				fontSize="20"
				fontWeight="600"
				letterSpacing="-0.02em"
				fill={primaryColor}
			>
				GoDeploy
			</text>
		</svg>
	);
}

export const LogoIcon = ({ reversed = false, ...props }: LogoProps) => {
	const primaryColor = reversed ? "#FFFFFF" : "#000000";
	const accentColor = "#4ADE80"; // Green 500
	const gradientId = React.useId();

	return (
		<svg
			width="50"
			height="50"
			viewBox="10 10 30 30"
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
			<rect x="15" y="20" width="20" height="20" rx="2" fill={primaryColor} />
			<path d="M20 27 L30 27 L25 35 Z" fill={accentColor} stroke="none" />
		</svg>
	);
};

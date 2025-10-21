import clsx from "clsx";
import type React from "react";
import { typography } from "../../styles/typography";

type TextSize =
	| "xs"
	| "sm"
	| "base"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl"
	| "5xl";

const sizeClasses: Record<TextSize, string> = {
	xs: "text-xs",
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
	"3xl": "text-3xl",
	"4xl": "text-4xl",
	"5xl": "text-5xl",
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
	variant?: "body" | "bodyLarge" | "small" | "xsmall";
	size?: TextSize;
	className?: string;
	children: React.ReactNode;
}

/**
 * Text component that follows the GoDeploy design system.
 * Renders paragraph tags with the appropriate typography styles.
 *
 * @param variant - Semantic variant that includes preset styles
 * @param size - Optional Tailwind text size override (xs through 5xl)
 */
export function Text({
	variant = "body",
	size,
	className,
	children,
	...props
}: TextProps) {
	// Get base styles without the text size class
	const variantStyles = typography[variant].className.replace(
		/\btext-\w+\b/,
		"",
	);
	const sizeClass = size ? sizeClasses[size] : "";

	return (
		<p className={clsx(variantStyles, sizeClass, className)} {...props}>
			{children}
		</p>
	);
}

/**
 * Code component for inline code snippets
 */
function Code({
	className,
	children,
	...props
}: Omit<React.HTMLAttributes<HTMLElement>, "color">) {
	const styles = typography.code.className;

	return (
		<code className={clsx(styles, className)} {...props}>
			{children}
		</code>
	);
}

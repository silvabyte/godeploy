import clsx from "clsx";
import type React from "react";
import { typography } from "../../styles/typography";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
	level: 1 | 2 | 3 | 4;
	className?: string;
	children: React.ReactNode;
}

/**
 * Heading component that follows the GoDeploy design system.
 * Renders h1-h4 tags with the appropriate typography styles.
 */
export function Heading({
	level,
	className,
	children,
	...props
}: HeadingProps) {
	const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
	const styles = typography[`h${level}` as keyof typeof typography].className;

	return (
		<Tag className={clsx(styles, className)} {...props}>
			{children}
		</Tag>
	);
}

/**
 * Display heading component for hero sections.
 */
export function DisplayHeading({
	className,
	children,
	...props
}: Omit<HeadingProps, "level">) {
	const styles = typography.display.className;

	return (
		<h1 className={clsx(styles, className)} {...props}>
			{children}
		</h1>
	);
}

/**
 * Section kicker text (small heading above main heading)
 */
export function Kicker({
	className,
	children,
	...props
}: Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">) {
	const styles = typography.kicker.className;

	return (
		<p className={clsx(styles, className)} {...props}>
			{children}
		</p>
	);
}

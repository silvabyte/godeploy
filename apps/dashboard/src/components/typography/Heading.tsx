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

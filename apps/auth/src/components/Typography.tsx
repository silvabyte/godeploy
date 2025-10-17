import clsx from "clsx";
import React, { forwardRef } from "react";
import { typography } from "../styles/typography";

type TypographyVariant = keyof typeof typography;

interface TypographyProps extends React.ComponentPropsWithoutRef<"div"> {
	/**
	 * Typography variant to apply
	 */
	variant: TypographyVariant;

	/**
	 * HTML element to render as
	 */
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

/**
 * Typography component that applies consistent text styles from the design system
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
	function Typography(
		{ variant, as = "div", className, children, ...props },
		ref,
	) {
		const Component = as as React.ElementType;
		const variantStyles = typography[variant];

		return React.createElement(
			Component,
			{
				ref,
				className: clsx(variantStyles.className, className),
				...props,
			},
			children,
		);
	},
);

/**
 * Pre-configured heading components
 */
export const Heading1 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, "variant" | "as">
>(function Heading1(props, ref) {
	return <Typography ref={ref} variant="h1" as="h1" {...props} />;
});

export const Heading2 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, "variant" | "as">
>(function Heading2(props, ref) {
	return <Typography ref={ref} variant="h2" as="h2" {...props} />;
});

export const Heading3 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, "variant" | "as">
>(function Heading3(props, ref) {
	return <Typography ref={ref} variant="h3" as="h3" {...props} />;
});

export const Heading4 = forwardRef<
	HTMLHeadingElement,
	Omit<TypographyProps, "variant" | "as">
>(function Heading4(props, ref) {
	return <Typography ref={ref} variant="h4" as="h4" {...props} />;
});

/**
 * Body text component
 */
export const Text = forwardRef<
	HTMLParagraphElement,
	Omit<TypographyProps, "variant" | "as">
>(function Text(props, ref) {
	return <Typography ref={ref} variant="body" as="p" {...props} />;
});

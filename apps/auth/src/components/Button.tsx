import clsx from "clsx";
import type React from "react";
import { forwardRef } from "react";
import { buttonColors } from "../styles/colors";

/**
 * Button variants as defined in the design system
 */
type ButtonVariant = "primary" | "secondary";

/**
 * Color schemes available for buttons
 */
type ButtonColor = "green" | "slate";

/**
 * Button sizes as defined in the design system
 */
type ButtonSize = "small" | "default" | "large";

/**
 * Props shared between button and link variants
 */
interface BaseButtonProps {
	/**
	 * The visual style variant of the button
	 * @default 'primary'
	 */
	variant?: ButtonVariant;

	/**
	 * The color scheme of the button
	 * @default 'green'
	 */
	color?: ButtonColor;

	/**
	 * The size of the button
	 * @default 'default'
	 */
	size?: ButtonSize;

	/**
	 * Whether the button is disabled
	 */
	disabled?: boolean;

	/**
	 * Optional CSS class names to add to the button
	 */
	className?: string;
}

/**
 * Props for the button variant
 */
type ButtonButtonProps = BaseButtonProps &
	React.ComponentPropsWithoutRef<"button">;

/**
 * Combined props type for the Button component
 */
type ButtonProps = ButtonButtonProps;

/**
 * Button component that follows the GoDeploy design system.
 *
 * The button has two variants: primary and secondary, three sizes: small, default, and large,
 * and two color schemes: green and slate.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(props, ref) {
		const {
			variant = "primary",
			color = "green",
			size = "default",
			className,
			disabled,
			...rest
		} = props;

		// Base classes for all buttons
		let baseClasses =
			"inline-flex items-center justify-center font-medium focus:outline-none transition-colors";

		// Size classes
		const sizeClasses = {
			small: "rounded-full py-1 px-3 text-xs",
			default: "rounded-full py-2 px-4 text-sm",
			large: "rounded-full py-2.5 px-5 text-base",
		};

		baseClasses = `${baseClasses} ${sizeClasses[size]}`;

		// Map our variant names to the color styles
		const variantMapping: Record<ButtonVariant, keyof typeof buttonColors> = {
			primary: "solid",
			secondary: "outline",
		};

		const mappedVariant = variantMapping[variant];
		const colorClasses = buttonColors[mappedVariant][color];

		// Focus ring classes
		const focusRingClasses = "focus-visible:ring-2 focus-visible:ring-offset-2";

		// Disabled classes
		const disabledClasses =
			variant === "primary"
				? "opacity-50 cursor-not-allowed"
				: "border-slate-300 text-slate-300 cursor-not-allowed hover:bg-transparent hover:text-slate-300";

		const classes = clsx(
			baseClasses,
			colorClasses.default,
			!disabled && colorClasses.hover,
			!disabled && colorClasses.active,
			!disabled && `${focusRingClasses} ${colorClasses.focus}`,
			disabled && disabledClasses,
			className,
		);

		return (
			<button
				type="button"
				ref={ref}
				className={classes}
				disabled={disabled}
				{...rest}
			/>
		);
	},
);

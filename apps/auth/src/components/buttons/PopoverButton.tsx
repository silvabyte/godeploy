import { Popover } from "@headlessui/react";
import type React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { SpinLoaderButtonContent } from "./SpinLoaderButtonContent"; // Import your SpinLoader component
import "./AppButton.css";
import { type ButtonState, type ButtonTheme, useButtonClasses } from "./button";

interface PopoverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	theme?: ButtonTheme;
	buttonState?: ButtonState;
	children?: ReactNode;
}

export const PopoverButton: React.FC<PopoverButtonProps> = ({
	theme = "primary",
	buttonState = "",
	children,
}) => {
	const classes = useButtonClasses(theme, buttonState);

	return (
		<Popover.Button className={classes}>
			{buttonState === "loading" ? (
				<SpinLoaderButtonContent />
			) : (
				children || "Submit"
			)}
		</Popover.Button>
	);
};

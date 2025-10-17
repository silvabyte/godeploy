import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { SpinLoaderButtonContent } from "./SpinLoaderButtonContent"; // Import your SpinLoader component
import { Popover } from "@headlessui/react";
import "./AppButton.css";
import { ButtonState, ButtonTheme, useButtonClasses } from "./button";

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

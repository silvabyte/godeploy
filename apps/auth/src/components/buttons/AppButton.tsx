import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { SpinLoaderButtonContent } from "./SpinLoaderButtonContent"; // Import your SpinLoader component
import "./AppButton.css";
import { ButtonState, ButtonTheme, useButtonClasses } from "./button";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	type?: "button" | "submit" | "reset";
	theme?: ButtonTheme;
	buttonState?: ButtonState;
	children?: ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
	theme = "primary",
	type = "button",
	buttonState = "",
	className = "",
	children,
	...props
}) => {
	const classes = useButtonClasses(theme, buttonState, className);

	const showSpinner = buttonState === "loading" || buttonState === "submitting";
	return (
		<button type={type} className={classes} {...props}>
			{showSpinner ? (
				<SpinLoaderButtonContent theme={theme} />
			) : (
				children || "Submit"
			)}
		</button>
	);
};

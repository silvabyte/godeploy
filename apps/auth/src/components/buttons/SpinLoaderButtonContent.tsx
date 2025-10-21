import { t } from "@matsilva/xtranslate";
import { useMemo } from "react";
import { classNames } from "../css";
import type { ButtonTheme } from "./button";

type SpinLoaderTheme = ButtonTheme;

interface SpinLoaderProps {
	theme?: SpinLoaderTheme;
	text?: string;
}
export const SpinLoaderButtonContent = ({
	theme = "primary",
	text = t("common.actions.processing"),
}: SpinLoaderProps) => {
	const classes = useMemo(() => {
		return classNames(
			"animate-spin -ml-1 mr-3 h-5 w-5",
			theme === "brand" ? "text-white" : "",
			theme === "brand_outline" ? "text-black" : "",
			theme === "primary_outline" ? "text-black" : "",
			theme === "link" ? "text-black" : "",
		);
	}, [theme]);
	return (
		<>
			<svg
				className={classes}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				></circle>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			{text}
		</>
	);
};

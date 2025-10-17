import { useMemo } from "react";
import { classNames } from "../css";

export type ButtonState = "loading" | "idle" | "submitting" | "disabled" | "";
export type ButtonTheme =
	| "brand"
	| "brand_outline"
	| "primary"
	| "primary_outline"
	| "link";

export function useButtonClasses(
	theme: string,
	buttonState: string,
	customClasses = "",
) {
	return useMemo(() => {
		return classNames(
			"transition-colors ease-in-out flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600",
			theme === "brand" ? "text-white brand" : "",
			theme === "brand_outline" ? "text-white brand-outline" : "",
			theme === "primary"
				? "text-white bg-black hover:bg-gray-800 border-2 border-black focus-visible:outline-gray-600"
				: "",
			theme === "primary_outline"
				? "text-black border-2 border-black focus-visible:outline-gray-600"
				: "",
			theme === "link" ? "text-black border-0 shadow-none" : "",
			buttonState === "loading" ? "opacity-50 pointer-events-none" : "",
			buttonState === "disabled" ? "opacity-50 pointer-events-none" : "",
			customClasses,
		);
	}, [buttonState, theme, customClasses]);
}

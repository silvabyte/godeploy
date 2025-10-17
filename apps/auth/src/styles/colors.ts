/**
 * GoDeploy Brand Color Palette
 * Based on the official styleguide
 */

// Color palette is defined inline in the buttonColors object below
// and in the Tailwind config for consistent usage

// Button colors by variant and state
export const buttonColors = {
	solid: {
		green: {
			default: "bg-green-500 text-white",
			hover: "hover:bg-green-600",
			active: "active:bg-green-700",
			focus: "focus-visible:ring-green-600",
		},
		slate: {
			default: "bg-slate-900 text-white",
			hover: "hover:bg-slate-800",
			active: "active:bg-slate-700",
			focus: "focus-visible:ring-slate-600",
		},
	},
	outline: {
		green: {
			default: "border border-green-500 text-green-500",
			hover: "hover:bg-green-500 hover:text-white",
			active: "active:bg-green-600 active:border-green-600",
			focus: "focus-visible:ring-green-500",
		},
		slate: {
			default: "border border-slate-900 text-slate-900",
			hover: "hover:bg-slate-900 hover:text-white",
			active: "active:bg-slate-800 active:border-slate-800",
			focus: "focus-visible:ring-slate-900",
		},
	},
};

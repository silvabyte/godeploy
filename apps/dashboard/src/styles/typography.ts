/**
 * GoDeploy Typography System
 * Based on the official styleguide
 */

const fontFamily = {
	sans: '"Lexend", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
	mono: '"Fira Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const typography = {
	// Heading styles
	display: {
		className: "text-4xl md:text-5xl font-bold tracking-tight text-slate-900",
		styles: {
			fontFamily: fontFamily.sans,
			fontSize: ["3rem", "3.75rem"], // mobile, desktop
			fontWeight: 700,
			lineHeight: 1.2,
			letterSpacing: "-0.02em",
			color: "#0F172A", // slate-900
		},
	},
	h1: {
		className: "text-3xl md:text-4xl font-bold text-slate-900",
		styles: {
			fontFamily: fontFamily.sans,
			fontSize: ["2.25rem", "3rem"], // mobile, desktop
			fontWeight: 700,
			lineHeight: 1.2,
			color: "#0F172A", // slate-900
		},
	},
	h2: {
		className: "text-2xl md:text-3xl font-bold text-slate-900",
		styles: {
			fontFamily: fontFamily.sans,
			fontSize: ["1.875rem", "2.25rem"], // mobile, desktop
			fontWeight: 700,
			lineHeight: 1.375, // snug
			color: "#0F172A", // slate-900
		},
	},
	h3: {
		className: "text-xl md:text-2xl font-semibold text-slate-900",
		styles: {
			fontFamily: fontFamily.sans,
			fontSize: ["1.5rem", "1.875rem"], // mobile, desktop
			fontWeight: 600,
			lineHeight: 1.375, // snug
			color: "#0F172A", // slate-900
		},
	},
	h4: {
		className: "text-lg md:text-xl font-semibold text-slate-900",
		styles: {
			fontFamily: fontFamily.sans,
			fontSize: ["1.25rem", "1.5rem"], // mobile, desktop
			fontWeight: 600,
			lineHeight: 1.5, // normal
			color: "#0F172A", // slate-900
		},
	},

	// Body text styles
	body: {
		className: "text-base text-slate-700",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "1rem",
			fontWeight: 400,
			lineHeight: 1.5, // normal
			color: "#334155", // slate-700
		},
	},
	bodyLarge: {
		className: "text-lg text-slate-700",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "1.125rem",
			fontWeight: 400,
			lineHeight: 1.625, // relaxed
			color: "#334155", // slate-700
		},
	},
	small: {
		className: "text-sm text-slate-600",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "0.875rem",
			fontWeight: 400,
			lineHeight: 1.5, // normal
			color: "#475569", // slate-600
		},
	},
	xsmall: {
		className: "text-xs text-slate-500",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "0.75rem",
			fontWeight: 400,
			lineHeight: 1.5, // normal
			color: "#64748B", // slate-500
		},
	},

	// Special text styles
	kicker: {
		className: "text-base font-semibold leading-7 text-green-500 uppercase",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "1rem",
			fontWeight: 600,
			lineHeight: 1.75,
			letterSpacing: "0.05em",
			textTransform: "uppercase",
			color: "#4ADE80", // green-500
		},
	},
	code: {
		className:
			"font-mono text-sm text-slate-900 bg-slate-100 rounded px-1.5 py-0.5",
		styles: {
			fontFamily: fontFamily.mono,
			fontSize: "0.875rem",
			padding: "0.125rem 0.375rem",
			borderRadius: "0.25rem",
			backgroundColor: "#F1F5F9", // slate-100
			color: "#0F172A", // slate-900
		},
	},
};

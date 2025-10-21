const plugin = require("tailwindcss/plugin");

/**
 * GoDeploy Tailwind Plugin
 *
 * This plugin adds the GoDeploy brand colors and components to your Tailwind configuration.
 * Import it in your tailwind.config.js file.
 */
module.exports = plugin(
	({ addComponents, theme }) => {
		// Add custom components
		addComponents({
			".godeploy-button-primary": {
				backgroundColor: theme("colors.green.500"),
				color: theme("colors.white"),
				borderRadius: "9999px",
				padding: "0.5rem 1rem",
				fontWeight: "500",
				fontSize: "0.875rem",
				lineHeight: "1.25rem",
				transition: "background-color 150ms",
				"&:hover": {
					backgroundColor: theme("colors.green.600"),
				},
				"&:active": {
					backgroundColor: theme("colors.green.700"),
				},
			},
			".godeploy-button-secondary": {
				backgroundColor: "transparent",
				color: theme("colors.slate.900"),
				borderRadius: "9999px",
				padding: "0.5rem 1rem",
				fontWeight: "500",
				fontSize: "0.875rem",
				lineHeight: "1.25rem",
				border: `1px solid ${theme("colors.slate.900")}`,
				transition: "all 150ms",
				"&:hover": {
					backgroundColor: theme("colors.slate.900"),
					color: theme("colors.white"),
				},
				"&:active": {
					backgroundColor: theme("colors.slate.800"),
					color: theme("colors.white"),
				},
			},
			".godeploy-card": {
				backgroundColor: theme("colors.white"),
				borderRadius: theme("borderRadius.lg"),
				border: `1px solid ${theme("colors.slate.200")}`,
				boxShadow: theme("boxShadow.sm"),
				padding: "2rem",
			},
			".godeploy-section-header": {
				"& .kicker": {
					fontSize: theme("fontSize.base"),
					fontWeight: theme("fontWeight.semibold"),
					lineHeight: theme("lineHeight.7"),
					color: theme("colors.green.500"),
					textTransform: "uppercase",
				},
				"& .heading": {
					marginTop: "0.5rem",
					fontSize: theme("fontSize.4xl"),
					fontWeight: theme("fontWeight.bold"),
					letterSpacing: theme("letterSpacing.tight"),
					lineHeight: theme("lineHeight.tight"),
					color: theme("colors.slate.900"),
				},
				"& .description": {
					marginTop: "1.5rem",
					fontSize: theme("fontSize.lg"),
					lineHeight: "2rem",
					color: theme("colors.slate.700"),
				},
			},
			".godeploy-feature-icon": {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "3rem",
				width: "3rem",
				borderRadius: theme("borderRadius.lg"),
				backgroundColor: theme("colors.green.50"),
				"& svg": {
					height: "1.5rem",
					width: "1.5rem",
					color: theme("colors.green.500"),
				},
			},
		});
	},
	{
		theme: {
			extend: {
				colors: {
					godeploy: {
						green: {
							50: "#F0FDF4",
							500: "#4ADE80",
							600: "#22C55E",
							700: "#16A34A",
						},
					},
				},
				fontFamily: {
					sans: [
						"system-ui",
						"-apple-system",
						'"Segoe UI"',
						"Roboto",
						"sans-serif",
					],
					mono: [
						"ui-monospace",
						'"Cascadia Mono"',
						'"Segoe UI Mono"',
						'"Ubuntu Mono"',
						'"Roboto Mono"',
						"Menlo",
						"Monaco",
						"Consolas",
						"monospace",
					],
				},
				fontSize: {
					display: ["3rem", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
					"display-sm": [
						"2.25rem",
						{ lineHeight: "1.2", letterSpacing: "-0.025em" },
					],
				},
				animation: {
					"fade-in": "fade-in 300ms ease-out",
					"slide-down": "slide-down 300ms ease-out",
				},
				keyframes: {
					"fade-in": {
						"0%": { opacity: "0" },
						"100%": { opacity: "1" },
					},
					"slide-down": {
						"0%": { transform: "translateY(-10px)", opacity: "0" },
						"100%": { transform: "translateY(0)", opacity: "1" },
					},
				},
			},
		},
	},
);

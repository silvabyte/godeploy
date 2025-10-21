import clsx from "clsx";
import type { Metadata } from "next";
import { Fira_Mono, Inter, Lexend } from "next/font/google";
import Script from "next/script";

import "@/styles/tailwind.css";

export const metadata: Metadata = {
	title: "GoDeploy — Zero‑Config Static Hosting for SPAs",
	description:
		"Deploy React, Vue, Svelte, Angular and static apps with instant HTTPS and a global CDN. No SSR. No pipelines. Just ship.",
	openGraph: {
		title: "GoDeploy — Zero‑Config Static Hosting for SPAs",
		description:
			"Deploy React, Vue, Svelte, Angular and static apps with instant HTTPS and a global CDN. No SSR. No pipelines. Just ship.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "GoDeploy — Zero‑Config Static Hosting for SPAs",
		description:
			"Deploy React, Vue, Svelte, Angular and static apps with instant HTTPS and a global CDN. No SSR. No pipelines. Just ship.",
	},
};

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const lexend = Lexend({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-lexend",
});

const firaMono = Fira_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	display: "swap",
	variable: "--font-fira-mono",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={clsx(
				"h-full scroll-smooth bg-white antialiased",
				inter.variable,
				lexend.variable,
				firaMono.variable,
			)}
		>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
			</head>
			<body className="flex h-full flex-col font-mono">{children}</body>
		</html>
	);
}

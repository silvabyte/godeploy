import clsx from "clsx";
import type { Metadata } from "next";
import { Fira_Mono, Inter, Lexend } from "next/font/google";
import Script from "next/script";

import "@/styles/tailwind.css";

export const metadata: Metadata = {
	title: "GoDeploy — Deploy. One command. Everything else is noise.",
	description:
		"Deploy your frontend. No pipelines. No edge functions. No framework lock-in. Just shipping.",
	openGraph: {
		title: "GoDeploy — Deploy. One command. Everything else is noise.",
		description:
			"Deploy your frontend. No pipelines. No edge functions. No framework lock-in. Just shipping.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "GoDeploy — Deploy. One command. Everything else is noise.",
		description:
			"Deploy your frontend. No pipelines. No edge functions. No framework lock-in. Just shipping.",
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
			<body className="flex h-full flex-col">{children}</body>
		</html>
	);
}

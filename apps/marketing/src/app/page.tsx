"use client";
import { useEffect } from "react";
import { initTelemetry, trackEvent } from "@/app/telemetry/telemetry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Philosophy } from "@/components/Philosophy";
import { Pricing } from "@/components/Pricing";

export default function Home() {
	useEffect(() => {
		initTelemetry();
		trackEvent("page_view", {
			page: "/",
		});
	}, []);

	return (
		<div className="bg-white">
			<Header />
			<main>
				<Hero />
				<Philosophy />
				<Pricing />
			</main>
			<Footer />
		</div>
	);
}

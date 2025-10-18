"use client";
import { initTelemetry, trackEvent } from "@/app/telemetry/telemetry";
import { CallToAction } from "@/components/CallToAction";
import { Faqs } from "@/components/Faqs";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SecondaryFeatures } from "@/components/SecondaryFeatures";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Benefits } from "@/components/Benefits";
import { TrustSignals } from "@/components/TrustSignals";
import { useEffect } from "react";

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
				<section aria-labelledby="hero-heading" className="bg-white">
					<Hero />
				</section>

				<section aria-labelledby="trust-signals" className="bg-slate-900">
					<TrustSignals />
				</section>

				<section
					aria-labelledby="features-heading"
					className="bg-slate-50 py-24"
					id="features"
				>
					<SecondaryFeatures />
				</section>

				<section aria-labelledby="testimonials-heading" className="bg-slate-50">
					<Testimonials />
				</section>

				<section aria-labelledby="benefits-heading" className="bg-white">
					<Benefits />
				</section>

				<section
					aria-labelledby="how-it-works-heading"
					className="bg-white"
					id="how-it-works"
				>
					<HowItWorks />
				</section>

				<section
					aria-labelledby="pricing-heading"
					className="bg-slate-900 py-16"
					id="pricing"
				>
					<CallToAction />
				</section>

				<section
					aria-labelledby="faq-heading"
					className="bg-white py-24"
					id="faq"
				>
					<Faqs />
				</section>
			</main>
			<Footer />
		</div>
	);
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { initTelemetry, trackEvent } from "@/app/telemetry/telemetry";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function PrivacyPolicy() {
	useEffect(() => {
		initTelemetry();
		trackEvent("page_view", {
			page: "/privacy",
		});
	}, []);

	return (
		<div className="bg-white">
			<Header />
			<main>
				<section className="bg-white py-16">
					<Container>
						<div className="mx-auto max-w-3xl">
							<h1 className="font-display text-4xl font-bold tracking-tight text-slate-900">
								Privacy Policy
							</h1>
							<p className="mt-4 text-lg text-slate-600">
								Last updated:{" "}
								{new Date().toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</p>

							<div className="mt-8 space-y-8 text-base leading-7 text-slate-700">
								<p>
									At GoDeploy, we take your privacy seriously. This Privacy
									Policy explains how we collect, use, disclose, and safeguard
									your information when you use our website and deployment
									services.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Information We Collect
								</h2>
								<p>
									We collect information that you provide directly to us when
									you:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>Create an account</li>
									<li>Deploy applications</li>
									<li>Contact our support team</li>
									<li>Subscribe to our newsletter</li>
									<li>Participate in surveys or promotions</li>
								</ul>
								<p>
									This information may include your name, email address, payment
									information, and any other information you choose to provide.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Information Collected Automatically
								</h2>
								<p>
									When you use our services, we automatically collect certain
									information about your device and usage patterns. This may
									include:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>Log data (IP address, browser type, pages visited)</li>
									<li>Device information</li>
									<li>Usage statistics</li>
									<li>Cookies and similar technologies</li>
									<li>Application debug logs and error reports</li>
								</ul>

								<h2 className="text-xl font-semibold text-slate-900">
									How We Use Your Information
								</h2>
								<p>We use the information we collect to:</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>Provide, maintain, and improve our services</li>
									<li>Process transactions and send related information</li>
									<li>Send technical notices, updates, and support messages</li>
									<li>Respond to your comments and questions</li>
									<li>Monitor and analyze trends and usage</li>
									<li>
										Detect, investigate, and prevent fraudulent or unauthorized
										activities
									</li>
									<li>Personalize and improve your experience</li>
								</ul>

								<h2 className="text-xl font-semibold text-slate-900">
									Sharing of Information
								</h2>
								<p>We may share your information with:</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>
										Third-party vendors and service providers who perform
										services on our behalf
									</li>
									<li>
										Professional advisors, such as lawyers and accountants
									</li>
									<li>In response to legal process or when required by law</li>
									<li>
										In connection with a merger, acquisition, or sale of assets
									</li>
									<li>
										HyperDX.io for application debug logs and troubleshooting,
										which may include user identifiers like email addresses and
										user IDs
									</li>
								</ul>

								<h2 className="text-xl font-semibold text-slate-900">
									Application Monitoring and Debugging
								</h2>
								<p>
									We use HyperDX.io to collect and analyze application debug
									logs, which helps us diagnose and fix issues with our
									services. These logs may include:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>User identifiers such as user IDs and email addresses</li>
									<li>Actions performed within the application</li>
									<li>Error messages and application state information</li>
									<li>Timestamps of user interactions</li>
								</ul>
								<p>
									This information is used specifically for the purpose of
									troubleshooting user issues, improving application
									performance, and resolving errors. We limit the data shared to
									what is necessary for these purposes and maintain appropriate
									safeguards with our debugging service provider.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Third-Party Service Providers
								</h2>
								<p>
									We use the following third-party services to provide and
									support our platform:
								</p>
								<ul className="list-disc space-y-4 pl-6">
									<li>
										<span className="font-medium">Digital Ocean:</span> We use
										Digital Ocean for cloud infrastructure and hosting services.
										Information processed on Digital Ocean includes:
										<ul className="mt-2 ml-6 list-disc space-y-1">
											<li>Application and website hosting data</li>
											<li>Deployment configurations and server logs</li>
											<li>User session data and IP addresses</li>
											<li>Application files and databases</li>
										</ul>
										<p className="mt-2 text-sm">
											You can learn more about Digital Ocean's security
											practices at{" "}
											<a
												href="https://www.digitalocean.com/security"
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-600 underline hover:text-green-500"
											>
												https://www.digitalocean.com/security
											</a>
										</p>
									</li>
									<li>
										<span className="font-medium">Supabase:</span> We use
										Supabase for authentication, database storage, and user
										management. Information shared with Supabase includes:
										<ul className="mt-2 ml-6 list-disc space-y-1">
											<li>User email addresses and authentication data</li>
											<li>User profile information</li>
											<li>Application data</li>
											<li>Usage analytics</li>
										</ul>
										<p className="mt-2 text-sm">
											You can learn more about Supabase's security practices at{" "}
											<a
												href="https://supabase.com/security"
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-600 underline hover:text-green-500"
											>
												https://supabase.com/security
											</a>
										</p>
									</li>
									<li>
										<span className="font-medium">HyperDX:</span> As mentioned
										in our Application Monitoring section, we use HyperDX for
										application monitoring, error tracking, and performance
										analysis. Information shared with HyperDX includes:
										<ul className="mt-2 ml-6 list-disc space-y-1">
											<li>User identifiers (user IDs, email addresses)</li>
											<li>Application logs and error reports</li>
											<li>Performance metrics</li>
											<li>User session data</li>
										</ul>
										<p className="mt-2 text-sm">
											You can learn more about HyperDX's security practices at{" "}
											<a
												href="https://www.hyperdx.io/terms/security"
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-600 underline hover:text-green-500"
											>
												https://www.hyperdx.io/terms/security
											</a>
										</p>
									</li>
								</ul>
								<p className="mt-4">
									Each of these third-party services has their own privacy
									policies and security practices. We carefully select partners
									that maintain high standards of data protection and comply
									with applicable privacy laws. We ensure that our agreements
									with these providers include appropriate data protection
									clauses.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Data Security
								</h2>
								<p>
									We implement appropriate technical and organizational measures
									designed to protect your information against unauthorized or
									unlawful processing, accidental loss, destruction, or damage.
									Our security infrastructure includes:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>
										<span className="font-medium">
											Transport Layer Security (TLS):
										</span>{" "}
										All data in transit is encrypted using industry-standard TLS
										protocols
									</li>
									<li>
										<span className="font-medium">AES-256 Encryption:</span>{" "}
										Data at rest is secured with AES-256 encryption
									</li>
									<li>
										<span className="font-medium">
											Row-Level Security (RLS):
										</span>{" "}
										We implement database-level isolation between tenants and
										users to prevent unauthorized access
									</li>
									<li>
										<span className="font-medium">
											Authentication & Authorization:
										</span>{" "}
										Strict access controls ensure only authorized personnel can
										access your data
									</li>
								</ul>
								<p className="mt-4">
									However, no method of transmission over the Internet or
									electronic storage is 100% secure, so we cannot guarantee
									absolute security. We regularly review and update our security
									practices to maintain the integrity and security of your
									information.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Your Rights
								</h2>
								<p>
									Depending on your location, you may have certain rights
									regarding your personal information, including:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>Access to your personal data</li>
									<li>Correction of inaccurate data</li>
									<li>Deletion of your data</li>
									<li>Restriction or objection to processing</li>
									<li>Data portability</li>
								</ul>
								<p>
									To exercise these rights, please contact us at
									support@silvabyte.com
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Cookies
								</h2>
								<p>
									We use cookies and similar technologies to collect information
									about your browsing activities and to distinguish you from
									other users of our website. This helps us provide you with a
									good experience when you browse our website and allows us to
									improve our site.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Changes to This Privacy Policy
								</h2>
								<p>
									We may update this Privacy Policy from time to time. We will
									notify you of any changes by posting the new Privacy Policy on
									this page and updating the "Last updated" date. You are
									advised to review this Privacy Policy periodically for any
									changes.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									Contact Us
								</h2>
								<p>
									If you have any questions about this Privacy Policy, please
									contact us at:
								</p>
								<p className="mt-2">
									<span className="font-medium">Email:</span>{" "}
									support@silvabyte.com
								</p>

								<div className="mt-12 border-t border-slate-200 pt-8">
									<Link
										href="/"
										className="text-sm font-medium text-green-600 hover:text-green-500"
									>
										← Back to home
									</Link>
								</div>
							</div>
						</div>
					</Container>
				</section>
			</main>
			<Footer />
		</div>
	);
}

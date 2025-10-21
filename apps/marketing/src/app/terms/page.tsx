"use client";

import Link from "next/link";
import { useEffect } from "react";
import { initTelemetry, trackEvent } from "@/app/telemetry/telemetry";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function TermsOfService() {
	useEffect(() => {
		initTelemetry();
		trackEvent("page_view", {
			page: "/terms",
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
								Terms of Service
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
									Welcome to GoDeploy, a product offered by SilvaByte LLC
									("SilvaByte", "we", "our", or "us"). For all legal and
									financial matters, including invoicing and contracting,
									SilvaByte LLC is the official entity. While GoDeploy is the
									public-facing brand, all business operations and transactions
									are conducted under the legal name SilvaByte LLC. Please read
									these Terms of Service ("Terms") carefully as they contain
									important information about your legal rights, remedies, and
									obligations. By accessing or using the GoDeploy website or
									services, you agree to comply with and be bound by these
									Terms.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									1. Acceptance of Terms
								</h2>
								<p>
									By accessing or using our services, you acknowledge that you
									have read, understood, and agree to be bound by these Terms.
									If you do not agree to these Terms, you may not access or use
									our services.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									2. Description of Services
								</h2>
								<p>
									GoDeploy provides web application deployment services that
									allow users to deploy browser-based applications quickly and
									efficiently. Our services include hosting, deployment tools,
									and related features as described on our website.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									3. Account Registration
								</h2>
								<p>
									To use certain features of our services, you may need to
									register for an account. You agree to provide accurate,
									current, and complete information during the registration
									process and to update such information to keep it accurate,
									current, and complete.
								</p>
								<p>
									You are responsible for safeguarding your account credentials
									and for all activities that occur under your account. You
									agree to notify us immediately of any unauthorized use of your
									account.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									4. User Conduct
								</h2>
								<p>You agree not to use our services to:</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>Violate any applicable laws or regulations</li>
									<li>Infringe the intellectual property rights of others</li>
									<li>Transmit malware, viruses, or other harmful code</li>
									<li>Interfere with or disrupt our services or servers</li>
									<li>
										Engage in unauthorized penetration testing or vulnerability
										scanning
									</li>
									<li>
										Deploy applications that engage in illegal activities or
										violate our Acceptable Use Policy
									</li>
								</ul>

								<h2 className="text-xl font-semibold text-slate-900">
									5. Right to Refuse Service
								</h2>
								<p>
									SilvaByte LLC reserves the right to refuse service to anyone,
									at any time, for any reason, at our sole discretion. This
									includes, but is not limited to, users who:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>
										Deploy content that we deem to be extremist, hateful, or
										promoting violence
									</li>
									<li>Deploy adult-oriented or pornographic content</li>
									<li>
										Use our services to distribute content that violates laws or
										regulations
									</li>
									<li>
										Engage in activities that pose security risks to our
										infrastructure
									</li>
									<li>
										Abuse our resources or services in ways that negatively
										impact other users
									</li>
								</ul>
								<p className="mt-4">
									We may terminate accounts or refuse deployments without prior
									notice if we determine, in our sole discretion, that the
									content or use violates these Terms or is otherwise
									inappropriate for our platform. We are not obligated to
									provide reasons for refusal of service, though we may choose
									to do so at our discretion.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									6. Payment and Subscription
								</h2>
								<p>
									We offer both free and paid subscription plans. By selecting a
									paid plan, you agree to pay all fees in accordance with the
									pricing and payment terms presented to you at the time of
									purchase. Subscription fees are billed in advance on a
									recurring basis.
								</p>
								<p>
									All payments are non-refundable unless otherwise specified or
									required by law. You are responsible for all applicable taxes.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									7. Fair Use Policy
								</h2>
								<p>
									While we offer unlimited deployments with certain plans, our
									services are subject to fair use limitations. Our unlimited
									offerings are designed for reasonable and typical usage by
									businesses and individual developers, not for extreme or
									abusive use cases that may negatively impact our
									infrastructure or other customers.
								</p>
								<p>SilvaByte LLC reserves the right to:</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>
										Monitor usage patterns to identify unusual or excessive
										resource consumption
									</li>
									<li>
										Contact customers whose usage patterns suggest abuse or
										misuse of our unlimited offerings
									</li>
									<li>
										Limit, throttle, or suspend service for accounts that
										consistently exceed what we determine to be reasonable usage
									</li>
									<li>
										Implement technical measures to prevent abuse of unlimited
										resources
									</li>
									<li>
										Terminate accounts that we determine, in our sole
										discretion, are being used to circumvent our fair use
										limitations
									</li>
								</ul>
								<p className="mt-4">
									Examples of usage that may violate our fair use policy
									include, but are not limited to:
								</p>
								<ul className="list-disc space-y-2 pl-6">
									<li>
										Automated deployment systems that generate excessive
										deployments per hour
									</li>
									<li>
										Using our platform for cryptocurrency mining or other
										high-compute operations
									</li>
									<li>
										Using deployments for data storage beyond reasonable
										application needs
									</li>
									<li>
										Sharing account access to allow multiple organizations to
										use a single unlimited account
									</li>
									<li>
										Any activity that places excessive load on our systems or
										impacts service performance for other customers
									</li>
								</ul>
								<p className="mt-4">
									We will make reasonable efforts to contact customers before
									taking action under this policy, but reserve the right to take
									immediate action in cases where system integrity or service to
									other customers may be at risk.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									8. Intellectual Property
								</h2>
								<p>
									Our services and all related content, features, and
									functionality are owned by SilvaByte LLC or its licensors and
									are protected by intellectual property laws. Nothing in these
									Terms grants you a right or license to use any SilvaByte LLC
									or GoDeploy trademark, logo, or other proprietary information.
								</p>
								<p>
									You retain all rights to your content. By uploading or sharing
									content through our services, you grant us a worldwide,
									non-exclusive, royalty-free license to use, reproduce, modify,
									and distribute your content solely for the purpose of
									providing and improving our services.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									9. Termination
								</h2>
								<p>
									We may terminate or suspend your access to our services
									immediately, without prior notice or liability, for any
									reason, including if you breach these Terms. Upon termination,
									your right to use our services will cease immediately.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									10. Disclaimers
								</h2>
								<p>
									Our services are provided "as is" and "as available" without
									any warranties of any kind, either express or implied. We do
									not guarantee that our services will be uninterrupted, secure,
									or error-free.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									11. Limitation of Liability
								</h2>
								<p>
									To the maximum extent permitted by law, SilvaByte LLC shall
									not be liable for any indirect, incidental, special,
									consequential, or punitive damages resulting from your use of
									or inability to use our services.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									12. Indemnification
								</h2>
								<p>
									You agree to indemnify and hold harmless SilvaByte LLC and its
									officers, directors, employees, and agents from and against
									any claims, disputes, demands, liabilities, damages, losses,
									and expenses, including reasonable legal and accounting fees,
									arising out of or in any way connected with your access to or
									use of our services or your violation of these Terms.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									13. Modifications to Terms
								</h2>
								<p>
									We reserve the right to modify these Terms at any time. If we
									make material changes to these Terms, we will provide notice
									through our services or by other means. Your continued use of
									our services after the changes take effect constitutes your
									acceptance of the revised Terms.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									14. Governing Law
								</h2>
								<p>
									These Terms shall be governed by and construed in accordance
									with the laws of the State of California, without regard to
									its conflict of law provisions. SilvaByte LLC is registered in
									the State of California, and any disputes shall be subject to
									the exclusive jurisdiction of the courts in California.
								</p>

								<h2 className="text-xl font-semibold text-slate-900">
									15. Contact Us
								</h2>
								<p>
									If you have any questions about these Terms, please contact us
									at:
								</p>
								<div className="mt-2 space-y-2">
									<p>
										<span className="font-medium">Company:</span> SilvaByte LLC
									</p>
									<p>
										<span className="font-medium">Product:</span> GoDeploy
									</p>
									<p>
										<span className="font-medium">Email:</span>{" "}
										support@silvabyte.com
									</p>
									<p className="mt-3 text-sm text-slate-600">
										If you have any questions or concerns regarding the legal
										entity behind GoDeploy, please contact us at
										support@silvabyte.com
									</p>
								</div>

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

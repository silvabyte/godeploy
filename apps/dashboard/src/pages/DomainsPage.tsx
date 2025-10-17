import React, { useEffect, useState } from "react";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from "react-router-dom";
import { Alert } from "../components/alerts/Alert";
import { Button } from "../components/Button";
import { StatusDot } from "../components/StatusDot";
import { Tooltip } from "../components/Tooltip";
import { Heading } from "../components/typography/Heading";
import { trackEvent } from "../telemetry/telemetry";

export function DomainsPage() {
	const data = useLoaderData() as {
		cnameTarget: string;
		domains?: {
			projectId: string;
			projectName: string;
			domain: string;
			verified: boolean;
		}[];
	};
	const nav = useNavigation();
	const actionData = useActionData() as
		| {
				success?: string;
				error?: string;
				cnameValid?: boolean;
				cnameRecord?: string;
		  }
		| undefined;
	const domainInputId = React.useId();
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		trackEvent("page_view", {
			page: "domains",
		});
	}, []);
	return (
		<div className="max-w-4xl mx-auto p-6">
			<Heading level={2} className="text-lg font-medium text-slate-900 mb-6">
				Domains
			</Heading>

			{/* CNAME Target */}
			<div className="bg-white shadow sm:rounded-lg mb-8">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-base font-semibold leading-6 text-slate-900">
						CNAME target
					</h3>
					<p className="mt-2 text-sm text-slate-500">
						Point your domain's CNAME record to the following target:
					</p>
					<div className="mt-3 flex items-center gap-3">
						<code className="bg-slate-100 text-slate-800 px-3 py-2 rounded">
							{data.cnameTarget}
						</code>
						<Button
							variant="secondary"
							color="slate"
							size="small"
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(data.cnameTarget);
									setCopied(true);
									setTimeout(() => setCopied(false), 1500);
								} catch {
									// no-op
								}
							}}
						>
							{copied ? "Copied" : "Copy"}
						</Button>
					</div>
					<p className="mt-4 text-sm text-slate-500">
						After updating DNS, use the validator below to confirm
						configuration. Assign the domain to a project from the project
						settings page.
					</p>
				</div>
			</div>

			{/* Validation */}
			<div className="bg-white shadow sm:rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-base font-semibold leading-6 text-slate-900">
						Validate domain
					</h3>
					<p className="mt-2 text-sm text-slate-500">
						Check if your domain's CNAME is correctly configured and available.
					</p>

					{actionData?.error && (
						<Alert type="danger" title={actionData.error} />
					)}
					{actionData?.success && (
						<Alert type="success" title={actionData.success} />
					)}

					<Form method="post" className="mt-3 sm:flex sm:items-end">
						<div className="w-full sm:max-w-xs">
							<label htmlFor={domainInputId} className="sr-only">
								Domain to validate
							</label>
							<input
								type="text"
								name="domain"
								id={domainInputId}
								placeholder="www.example.com"
								className="block w-full rounded-md border-slate-200 bg-slate-50 py-2 px-3 text-slate-900 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm"
							/>
						</div>
						<Button
							type="submit"
							disabled={nav.state === "submitting"}
							variant="primary"
							color="green"
							className="mt-3 sm:ml-3 sm:mt-0"
						>
							{nav.state === "submitting" ? "Validating..." : "Validate"}
						</Button>
					</Form>
				</div>
			</div>

			{/* Domains per project */}
			{data.domains && data.domains.length > 0 && (
				<div className="bg-white shadow sm:rounded-lg mt-8">
					<div className="px-4 py-5 sm:p-6">
						<h3 className="text-base font-semibold leading-6 text-slate-900">
							Project domains
						</h3>
						<p className="mt-2 text-sm text-slate-500">
							Current domains configured across your projects and their DNS
							verification status.
						</p>
						<div className="mt-4 divide-y divide-slate-200">
							{data.domains.map((d) => (
								<div key={d.projectId} className="py-3 flex items-center">
									<div className="w-1/3 text-sm text-slate-900">
										{d.projectName}
									</div>
									<div className="w-1/3 text-sm text-slate-700">{d.domain}</div>
									<div className="w-1/3 flex items-center gap-2">
										<StatusDot status={d.verified ? "success" : "failed"} />
										<span className="text-sm text-slate-700">
											{d.verified ? "Verified" : "Not verified"}
										</span>
										<Tooltip
											content={`CNAME must point to ${data.cnameTarget}`}
										>
											<span
												role="img"
												className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs"
											>
												i
											</span>
										</Tooltip>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

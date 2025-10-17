import React from "react";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from "react-router-dom";
import { Alert } from "../../../../components/alerts/Alert";
import { Button } from "../../../../components/Button";
import { StatusDot } from "../../../../components/StatusDot";
import { Heading } from "../../../../components/typography/Heading";
import { ProjectDomain } from "../../../../utils/url";
import type { Project } from "../../project.types";

interface ProjectDomainSettingsProps {
	project: Project;
}

export function ProjectDomainSettings({ project }: ProjectDomainSettingsProps) {
	const projectUrl = ProjectDomain.from(project).determine();
	const nav = useNavigation();
	const domainInputId = React.useId();
	const actionData = useActionData() as
		| { error?: string; success?: string; warning?: string }
		| undefined;
	const loaderData = useLoaderData() as {
		domain?: {
			cnameTarget?: string;
			validation?: { isValid: boolean; cnameRecord?: string } | null;
		};
	};
	const cnameTarget = loaderData?.domain?.cnameTarget;
	const validation = loaderData?.domain?.validation;
	const [copied, setCopied] = React.useState(false);
	return (
		<div>
			<Heading level={2} className="text-lg font-medium text-slate-900 mb-6">
				Domain Settings
			</Heading>

			<div className="bg-white shadow sm:rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-base font-semibold leading-6 text-slate-900">
						Project URL
					</h3>
					<div className="mt-2 max-w-xl text-sm text-slate-500">
						<p>Your project is currently available at:</p>
					</div>
					<div className="mt-3">
						<a
							href={projectUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-emerald-600 hover:text-emerald-500 font-medium"
						>
							{projectUrl}
						</a>
					</div>

					<div className="mt-6 border-t border-slate-100 pt-6 relative">
						<h3 className="text-base font-semibold leading-6 text-slate-900">
							Custom domain
						</h3>
						<div className="mt-2 max-w-xl text-sm text-slate-500">
							<p>You can set up a custom domain for your project.</p>
							{cnameTarget && (
								<>
									<p className="mt-2">Create a CNAME record pointing to:</p>
									<div className="mt-2 inline-flex items-center gap-2">
										<code className="bg-slate-100 text-slate-800 px-2 py-1 rounded">
											{cnameTarget}
										</code>
										<Button
											variant="secondary"
											color="slate"
											size="small"
											onClick={async () => {
												try {
													await navigator.clipboard.writeText(cnameTarget);
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
								</>
							)}
						</div>
						{project.domain && (
							<div className="mt-4 flex items-center gap-2">
								<StatusDot
									status={validation?.isValid ? "success" : "failed"}
								/>
								<span className="text-sm text-slate-700">
									{validation?.isValid
										? "DNS verified"
										: validation?.cnameRecord
											? `CNAME currently points to ${validation.cnameRecord}`
											: "DNS not verified yet"}
								</span>
							</div>
						)}
						{actionData?.error && (
							<div className="mt-3">
								<Alert type="danger" title={actionData.error} />
							</div>
						)}
						{actionData?.warning && (
							<div className="mt-3">
								<Alert type="warning" title={actionData.warning} />
							</div>
						)}
						{actionData?.success && (
							<div className="mt-3">
								<Alert type="success" title={actionData.success} />
							</div>
						)}
						<Form
							className="mt-3 sm:flex sm:items-end"
							action={`/projects/${project.id}`}
							method="PATCH"
						>
							<div className="w-full sm:max-w-xs">
								<label htmlFor={domainInputId} className="sr-only">
									Custom domain
								</label>
								<input
									type="text"
									name="domain"
									id={domainInputId}
									key={project.domain ?? ""}
									defaultValue={project.domain ?? ""}
									placeholder="example.com"
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
								{nav.state === "submitting" ? "Saving..." : "Save"}
							</Button>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}

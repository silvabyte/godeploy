import type { ActionFunctionArgs } from "react-router-dom";
import type { Services } from "../../../services/serviceInitialization";
import { debug } from "../../../utils/debug";
import { ProjectDomain } from "../../../utils/url";
import type { Project } from "../project.types";

const sanitizeDomain = (domain: string) => {
	try {
		return ProjectDomain.from({ domain } as Project).domain.host;
	} catch {
		return null;
	}
};

export const updateProjectAction = async (
	args: ActionFunctionArgs,
	services: Services,
) => {
	const { projectId } = args.params;

	if (!projectId) {
		throw new Error("Project ID is required");
	}

	const updates = await args.request.formData();
	// If the form includes a domain field, route through validation and save
	if (updates.has("domain")) {
		const raw = (updates.get("domain") as string | null) ?? "";
		const cleaned = raw?.trim();

		// Remove domain if empty
		if (!cleaned) {
			const project = await services.domainService.assignDomain(
				projectId,
				null,
			);
			debug.log("[updateProjectAction] removed custom domain via API", {
				project,
			});
			return { project, success: "Custom domain removed" };
		}

		const sanitizedDomain = sanitizeDomain(cleaned);
		if (!sanitizedDomain) {
			return { error: "Invalid domain format" };
		}

		// Run checks but don't block save on DNS issues; only block if in use
		let warning: string | undefined;
		try {
			const availability = await services.domainService.checkAvailability(
				sanitizedDomain,
				projectId,
			);
			if (!availability.available) {
				if (availability.reason?.toLowerCase().includes("already in use")) {
					return { error: availability.reason };
				}
				// DNS-related issues should not block saving
				warning = availability.reason || "DNS configuration not verified yet";
			}
		} catch (e) {
			// Network or API errors shouldn't block saving the domain
			warning = (e as Error)?.message || "Unable to verify DNS at this time";
		}

		// Try API assignment first; if it fails (e.g., API enforces DNS), fallback to DB update
		try {
			const project = await services.domainService.assignDomain(
				projectId,
				sanitizedDomain,
			);
			debug.log("[updateProjectAction] assigned custom domain via API", {
				project,
			});
			return { project, success: "Custom domain saved", warning };
		} catch (e) {
			debug.log(
				"[updateProjectAction] assignDomain failed, falling back to DB update",
				{
					error: e,
				},
			);
			const [p_err, project] = await services.projectService.updateProject(
				projectId,
				{
					domain: sanitizedDomain,
				} as Partial<Project>,
			);
			if (p_err) {
				throw p_err;
			}
			return { project, success: "Custom domain saved", warning };
		}
	}

	// Fallback: other project fields update directly in Supabase
	const data = Object.fromEntries(updates);
	const [p_err, project] = await services.projectService.updateProject(
		projectId,
		data as Partial<Project>,
	);
	debug.log("[updateProjectAction] updateProject", { p_err, project });
	if (p_err) {
		throw p_err;
	}
	return { project, success: "Project updated" };
};

export const deleteProjectAction = async (
	args: ActionFunctionArgs,
	services: Services,
) => {
	const { projectId } = args.params;

	if (!projectId) {
		throw new Error("Project ID is required");
	}
	const [p_err] = await services.projectService.deleteProject(projectId);
	debug.log("[deleteProjectAction] deleteProject", { p_err });
	if (p_err) {
		throw p_err;
	}
};

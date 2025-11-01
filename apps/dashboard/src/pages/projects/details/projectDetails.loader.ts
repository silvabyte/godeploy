import { differenceInMilliseconds, parseISO } from "date-fns";
import type { LoaderFunctionArgs } from "react-router-dom";
import type { Services } from "../../../services/serviceInitialization";
import { debug } from "../../../utils/debug";
import type { Deployment } from "../../deployments/deployment.types";

export const projectDetailsLoader = async (
	args: LoaderFunctionArgs,
	services: Services,
) => {
	const { projectId } = args.params;

	if (!projectId) {
		throw new Error("Project ID is required");
	}

	const [error, user] = await services.userService.getCurrentUser();
	debug.log("[projectDetailsLoader] getCurrentUser", { error, user });
	if (error) {
		throw error;
	}

	const tenantId = user?.tenant_id;
	if (!tenantId) {
		throw new Error("Tenant ID not found");
	}

	// For now, we'll just return the user since we don't have a getProjectById method
	// In a real implementation, you would fetch the project details here
	const [p_err, project] = await services.projectService.getProject(projectId);
	debug.log("[projectDetailsLoader] getProject", { p_err, project });
	if (p_err) {
		throw p_err;
	}

	const [d_err, deploys] =
		await services.deployService.getDeploymentsByProject(projectId);
	debug.log("[projectDetailsLoader] getDeploymentsByProject", {
		d_err,
		deploys,
	});
	if (d_err) {
		throw d_err;
	}

	const deployments: Deployment[] =
		deploys?.map((deploy) => {
			return {
				id: deploy.id,
				href: `/deployments/${deploy.id}`,
				projectName: project.name,
				teamName: project.owner_id,
				owner_id: project.owner_id,
				status: deploy.status,
				statusText: deploy.status,
				description: project.description || "",
				environment: "production",
				url: deploy.url,
				created_at: deploy.created_at ?? "",
				updated_at: deploy.updated_at ?? "",
				duration:
					deploy.updated_at && deploy.created_at
						? differenceInMilliseconds(
								parseISO(deploy.updated_at),
								parseISO(deploy.created_at),
							)
						: 0,
			};
		}) ?? [];

	// Domain meta: cname target and validation status for this project's domain
	let cnameTarget = "";
	let domainValidation: {
		isValid: boolean;
		cnameRecord?: string;
		error?: string;
	} | null = null;
	try {
		const cname = await services.domainService.getCnameTarget();
		cnameTarget = cname.target;
		if (project.domain) {
			const validation = await services.domainService.validateDomain(
				project.domain,
			);
			domainValidation = validation;
		}
	} catch (e) {
		debug.error(e as Error);
	}

	return {
		project,
		deployments,
		user,
		domain: { cnameTarget, validation: domainValidation },
	};
};

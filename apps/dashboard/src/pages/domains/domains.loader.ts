import type { LoaderFunctionArgs } from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";

export const domainsLoader = async (
	_args: LoaderFunctionArgs,
	services: Services,
) => {
	const [userErr, user] = await services.userService.getCurrentUser();
	if (userErr || !user) {
		throw userErr || new Error("Unauthorized");
	}

	const cname = await services.domainService.getCnameTarget();

	// Fetch projects and build domain list with validation
	const [pErr, projects] = await services.projectService.getProjects(
		user.id,
		user.tenant_id,
		{
			limit: 100,
			offset: 0,
			orderBy: "created_at",
			order: "desc",
		},
	);
	if (pErr) {
		throw pErr;
	}

	const domains = await Promise.all(
		(projects ?? [])
			.filter((p) => !!p.domain)
			.map(async (p) => {
				try {
					const res = await services.domainService.validateDomain(
						p.domain as string,
					);
					return {
						projectId: p.id,
						projectName: p.name,
						domain: p.domain as string,
						verified: !!res.isValid,
						cnameRecord: res.cnameRecord,
					};
				} catch {
					return {
						projectId: p.id,
						projectName: p.name,
						domain: p.domain as string,
						verified: false,
					};
				}
			}),
	);

	return { cnameTarget: cname.target, domains };
};

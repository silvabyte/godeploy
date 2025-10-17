import { differenceInMilliseconds, parseISO } from "date-fns";
import type { LoaderFunctionArgs } from "react-router-dom";
import { DEPLOY_SORT_QUERY_PARAMS } from "../../services/BaseService";
import type { Services } from "../../services/serviceInitialization";
import type { SearchOptions } from "../../services/types";
import { debug } from "../../utils/debug";
import { getSearchParamsFromUrl } from "../../utils/search";
import { getSortFromSearchParams } from "../../utils/sort";
import type { Deployment } from "./deployment.types.ts";

export const deploymentsLoader = async (
	args: LoaderFunctionArgs,
	services: Services,
) => {
	const url = new URL(args.request.url);
	const searchParams = getSearchParamsFromUrl(url);
	const { sortField, sortOrder } = getSortFromSearchParams(
		url,
		DEPLOY_SORT_QUERY_PARAMS,
		"created_at",
		"desc",
	);

	const [error, user] = await services.userService.getCurrentUser();
	debug.log("[deploymentsLoader] getCurrentUser", { error, user });
	if (error) {
		throw error;
	}
	const tenantId = user?.tenant_id;
	if (!tenantId) {
		throw new Error("Tenant ID not found");
	}

	const search: SearchOptions | undefined = searchParams.search
		? {
				referenceTables: [
					{
						table: "projects",
						fields: [{ field: "name", value: searchParams.search }],
					},
				],
			}
		: undefined;

	const [deploysError, deploys] =
		await services.deployService.getDeploymentsWithProjects({
			userId: user?.id,
			tenantId,
			pagination: {
				orderBy: sortField,
				order: sortOrder,
			},
			search,
		});
	debug.log("[deploymentsLoader] getDeploymentsWithProjects", {
		deploysError,
		deploys,
	});
	if (deploysError) {
		throw deploysError;
	}

	const deployments: Deployment[] =
		deploys?.map((deploy) => {
			const project = deploy.projects;

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

	const [deploysForChartError, deploysForChart] =
		await services.deployService.getDeploymentsWithProjects({
			userId: user?.id,
			tenantId,
			pagination: {
				orderBy: "created_at",
				order: "desc",
				limit: 1000,
			},
			gtFilters: {
				created_at: new Date(
					Date.now() - 1000 * 60 * 60 * 24 * 30,
				).toISOString(),
			},
		});
	debug.log("[deploymentsLoader] deploysForChart", {
		deploysForChartError,
		deploysForChart,
	});
	if (deploysForChartError) {
		throw deploysForChartError;
	}

	const deploymentsForChart: Deployment[] =
		deploysForChart?.map((deploy) => {
			const project = deploy.projects;

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

	return { deployments, deploymentsForChart, user };
};

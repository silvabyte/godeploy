import type { LoaderFunctionArgs } from "react-router-dom";
import type { Services } from "../../services/serviceInitialization";
import { debug } from "../../utils/debug";
import { getSortFromSearchParams } from "../../utils/sort";

const PROJECT_SORT_QUERY_PARAMS = {
	"sort[created_at]": "created_at",
	"sort[name]": "name",
} as const;

export const projectsLoader = async (
	args: LoaderFunctionArgs,
	services: Services,
) => {
	const url = new URL(args.request.url);
	const { sortField, sortOrder } = getSortFromSearchParams(
		url,
		PROJECT_SORT_QUERY_PARAMS,
		"created_at",
		"desc",
	);

	const [error, user] = await services.userService.getCurrentUser();
	debug.log("[projectsLoader] getCurrentUser", { error, user });
	if (error) {
		throw error;
	}
	const tenantId = user?.tenant_id;
	if (!tenantId) {
		throw new Error("Tenant ID not found");
	}

	const pagination = {
		orderBy: sortField,
		order: sortOrder,
		limit: 20,
		offset: 0,
	};

	const [p_err, projects] = await services.projectService.getProjects(
		user.id,
		tenantId,
		pagination,
	);

	if (p_err) {
		throw p_err;
	}

	return { projects, user };
};

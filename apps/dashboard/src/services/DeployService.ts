import {
	BaseService,
	type PaginateQueryOptionsWithTenant,
	type PaginationOptions,
} from "./BaseService";
import type {
	Deploy,
	DeployWithProject,
	Results,
	SearchOptions,
} from "./types";

interface GetDeploymentsWithProjectsOptions
	extends Omit<PaginateQueryOptionsWithTenant, "tableName"> {
	search?: SearchOptions;
}

export class DeployService extends BaseService {
	async getDeploymentsByProject(projectId: string): Promise<Results<Deploy[]>> {
		return this.paginateQuery<Deploy>(
			"deploys",
			{
				project_id: projectId,
			},
			{
				orderBy: "created_at",
				order: "desc",
			},
		);
	}

	async getDeployments(
		userId: string,
		tenantId: string,
		pagination?: PaginationOptions,
	): Promise<Results<Deploy[]>> {
		return this.paginateQuery<Deploy>(
			"deploys",
			{
				user_id: userId,
				tenant_id: tenantId,
			},
			pagination,
		);
	}

	async getDeploymentsWithProjects({
		userId,
		tenantId,
		pagination,
		eqFilters,
		gtFilters,
		search,
	}: GetDeploymentsWithProjectsOptions): Promise<Results<DeployWithProject[]>> {
		return this.paginateQueryV2<DeployWithProject>({
			tableName: "deploys",
			eqFilters: {
				...eqFilters,
				user_id: userId,
				tenant_id: tenantId,
			},
			gtFilters,
			pagination,
			tableReferences: {
				projects: ["id", "name", "owner_id", "description"],
			},
			search,
		});
	}
}

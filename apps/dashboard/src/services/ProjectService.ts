import { BaseService, type PaginationOptions } from "./BaseService";
import type { Project, Results } from "./types";

export class ProjectService extends BaseService {
	async getProjects(
		userId: string,
		tenantId: string,
		pagination?: PaginationOptions,
	): Promise<Results<Project[]>> {
		return this.paginateQuery<Project>(
			"projects",
			{
				owner_id: userId,
				tenant_id: tenantId,
			},
			pagination,
		);
	}

	async getProject(projectId: string): Promise<Results<Project>> {
		return this.get("projects", projectId);
	}

	async updateProject(
		projectId: string,
		project: Partial<Project>,
	): Promise<Results<Project>> {
		return this.update("projects", projectId, project as Project);
	}
	async deleteProject(projectId: string): Promise<Results<null>> {
		return this.delete("projects", projectId);
	}
}

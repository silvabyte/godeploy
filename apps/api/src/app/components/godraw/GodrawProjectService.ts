import type { Result } from "../../types/result.types";
import { BaseService } from "../services/BaseService";
import type { GodrawProject, UpdateGodrawProject } from "./godraw.types";

/**
 * Service for managing GoDraw projects
 */
export class GodrawProjectService extends BaseService {
	constructor() {
		super("godraw_projects");
	}

	/**
	 * Create a new GoDraw project
	 * @param godrawProject GoDraw project data
	 * @returns Result containing the created project or error message
	 */
	async createGodrawProject(
		godrawProject: Omit<GodrawProject, "id" | "created_at" | "updated_at">,
	): Promise<Result<GodrawProject>> {
		return this.create<GodrawProject>(godrawProject);
	}

	/**
	 * Get a GoDraw project by project_id
	 * @param projectId Regular project ID
	 * @returns Result containing the GoDraw project or error message
	 */
	async getByProjectId(projectId: string): Promise<Result<GodrawProject>> {
		return this.getOneByFilters<GodrawProject>({ project_id: projectId });
	}

	/**
	 * Get a GoDraw project by its ID
	 * @param godrawProjectId GoDraw project ID
	 * @returns Result containing the GoDraw project or error message
	 */
	async getGodrawProjectById(
		godrawProjectId: string,
	): Promise<Result<GodrawProject>> {
		return this.getById<GodrawProject>(godrawProjectId);
	}

	/**
	 * Update a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @param updates Updates to apply
	 * @returns Result containing the updated project or error message
	 */
	async updateGodrawProject(
		godrawProjectId: string,
		updates: UpdateGodrawProject,
	): Promise<Result<GodrawProject>> {
		return this.update<GodrawProject>(godrawProjectId, updates);
	}

	/**
	 * Set the home page for a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @param pageId Page ID to set as home
	 * @returns Result containing the updated project or error message
	 */
	async setHomePage(
		godrawProjectId: string,
		pageId: string,
	): Promise<Result<GodrawProject>> {
		return this.update<GodrawProject>(godrawProjectId, {
			home_page_id: pageId,
		});
	}

	/**
	 * Delete a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @returns Result indicating success or error message
	 */
	async deleteGodrawProject(godrawProjectId: string): Promise<Result<boolean>> {
		const { error } = await this.supabase
			.from(this.tableName)
			.delete()
			.eq("id", godrawProjectId);

		if (error) {
			return { data: null, error: error.message };
		}
		return { data: true, error: null };
	}
}

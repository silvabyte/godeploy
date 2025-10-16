import type { Result } from "../../types/result.types";
import { BaseService } from "../services/BaseService";
import type { Project } from "./projects.types";

/**
 * Service for managing projects
 */
export class ProjectService extends BaseService {
	constructor() {
		super("projects");
	}

	/**
	 * Get a project by ID
	 * @param projectId Project ID
	 * @returns Result containing the project or error message
	 */
	async getProjectById(projectId: string): Promise<Result<Project>> {
		return this.getById<Project>(projectId);
	}

	/**
	 * Get a project by name and tenant ID
	 * @param projectName Project name
	 * @param tenantId Tenant ID
	 * @returns Result containing the project or error message
	 */
	async getProjectByName(
		projectName: string,
		tenantId: string,
	): Promise<Result<Project>> {
		return this.getOneByFilters<Project>({
			name: projectName,
			tenant_id: tenantId,
		});
	}

	/**
	 * Get a project by subdomain
	 * @param subdomain Project subdomain
	 * @returns Result containing the project or error message
	 */
	async getProjectBySubdomain(subdomain: string): Promise<Result<Project>> {
		return this.getOneByFilters<Project>({ subdomain });
	}

	/**
	 * Create a new project
	 * @param project Project data
	 * @returns Result containing the created project or error message
	 */
	async createProject(
		project: Omit<Project, "id" | "created_at" | "updated_at">,
	): Promise<Result<Project>> {
		return this.create<Project>(project);
	}

	/**
	 * Get all projects for a tenant
	 * @param tenantId Tenant ID
	 * @returns Result containing the projects or error message
	 */
	async getProjects(tenantId: string): Promise<Result<Project[]>> {
		const result = await this.list<Project>({
			eqFilters: { tenant_id: tenantId },
			pagination: {
				orderBy: "created_at",
				order: "desc",
			},
			tenantId,
			userId: "", // Not needed for this query
			tableName: this.tableName,
		});

		if (result.error || !result.data) {
			return { data: null, error: result.error };
		}

		return { data: result.data.data, error: null };
	}

	/**
	 * Update a project's custom domain
	 * @param projectId Project ID
	 * @param domain Custom domain (null to remove)
	 * @returns Result containing the updated project or error message
	 */
	async updateProjectDomain(
		projectId: string,
		domain: string | null,
	): Promise<Result<Project>> {
		return this.update<Project>(projectId, { domain });
	}

	/**
	 * Get a project by custom domain
	 * @param domain Custom domain
	 * @returns Result containing the project or error message
	 */
	async getProjectByDomain(domain: string): Promise<Result<Project>> {
		return this.getOneByFilters<Project>({ domain });
	}

	/**
	 * Check if a domain is already in use by another project
	 * @param domain Domain to check
	 * @param excludeProjectId Optional project ID to exclude from check (for updates)
	 * @returns Result containing boolean indicating if domain is available
	 */
	async isDomainAvailable(
		domain: string,
		excludeProjectId?: string,
	): Promise<Result<boolean>> {
		const result = await this.getProjectByDomain(domain);

		// If no project is found and no error, the domain is available
		if (!result.data && !result.error) {
			return { data: true, error: null };
		}

		// Propagate unexpected errors
		if (result.error) {
			return { data: null, error: result.error };
		}

		// If the found project is the one we're updating, the domain is effectively available
		if (
			result.data &&
			excludeProjectId &&
			result.data.id === excludeProjectId
		) {
			return { data: true, error: null };
		}

		// Otherwise, domain is in use by another project
		return { data: false, error: null };
	}
}

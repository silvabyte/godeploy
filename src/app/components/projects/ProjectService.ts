import { BaseService } from '../services/BaseService';
import type { Project } from './projects.types';
import type { Result } from '../../types/result.types';

/**
 * Service for managing projects
 */
export class ProjectService extends BaseService {
  constructor() {
    super('projects');
  }

  /**
   * Get a project by name and tenant ID
   * @param projectName Project name
   * @param tenantId Tenant ID
   * @returns Result containing the project or error message
   */
  async getProjectByName(
    projectName: string,
    tenantId: string
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
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
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
        orderBy: 'created_at',
        order: 'desc',
      },
      tenantId,
      userId: '', // Not needed for this query
      tableName: this.tableName,
    });

    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    return { data: result.data.data, error: null };
  }
}

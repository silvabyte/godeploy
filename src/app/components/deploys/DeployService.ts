import { BaseService } from '../services/BaseService';
import type { Deploy } from './deploys.types';
import type { Result } from '../../types/result.types';
//TODO: include commit metadata to the dp
// commit_hash: '34567890',
// branch: 'main',
// commit_message: 'Test deployment',
// link to the commit: https://github.com/godeploy/godeploy/commit/34567890

/**
 * Service for managing deployments
 */
export class DeployService extends BaseService {
  constructor() {
    super('deploys');
  }

  /**
   * Record a new deployment
   * @param deploy Deploy data
   * @returns Result containing the created deployment or error message
   */
  async recordDeploy(
    deploy: Omit<Deploy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Result<Deploy>> {
    return this.create<Deploy>(deploy);
  }

  /**
   * Update a deployment status
   * @param deployId Deploy ID
   * @param status New status
   * @returns Result indicating success or error message
   */
  async updateDeployStatus(
    deployId: string,
    status: 'pending' | 'success' | 'failed'
  ): Promise<Result<true>> {
    const result = await this.update<Deploy>(deployId, { status });
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: true, error: null };
  }

  /**
   * Get recent deploys for a project
   * @param projectId Project ID
   * @param limit Number of deploys to return
   * @returns Result containing the deploys or error message
   */
  async getProjectDeploys(
    projectId: string,
    limit = 10
  ): Promise<Result<Deploy[]>> {
    const result = await this.list<Deploy>({
      eqFilters: { project_id: projectId },
      pagination: {
        limit,
        orderBy: 'created_at',
        order: 'desc',
      },
      tenantId: '', // Not needed for this query
      userId: '', // Not needed for this query
      tableName: this.tableName,
    });

    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    return { data: result.data.data, error: null };
  }

  async getDeployById(id: string): Promise<Result<Deploy>> {
    return this.getById<Deploy>(id);
  }
}

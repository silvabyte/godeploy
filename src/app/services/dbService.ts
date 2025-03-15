import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for database entities
export interface Project {
  id: string;
  tenant_id: string;
  owner_id: string;
  name: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
}

export interface Deploy {
  id?: string;
  tenant_id: string;
  project_id: string;
  user_id: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  created_at?: string;
  updated_at?: string;
}

/**
 * Database service for interacting with Supabase
 */
export class DbService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_API_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get a project by name and tenant ID
   * @param projectName Project name
   * @param tenantId Tenant ID
   */
  async getProjectByName(
    projectName: string,
    tenantId: string
  ): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('name', projectName)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        return null;
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Create a new project
   * @param project Project data
   */
  async createProject(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data as Project;
  }

  /**
   * Record a new deployment
   * @param deploy Deploy data
   */
  async recordDeploy(
    deploy: Omit<Deploy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Deploy> {
    const { data, error } = await this.supabase
      .from('deploys')
      .insert([deploy])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record deploy: ${error.message}`);
    }

    return data as Deploy;
  }

  /**
   * Update a deployment status
   * @param deployId Deploy ID
   * @param status New status
   */
  async updateDeployStatus(
    deployId: string,
    status: 'pending' | 'success' | 'failed'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('deploys')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', deployId);

    if (error) {
      throw new Error(`Failed to update deploy status: ${error.message}`);
    }
  }

  /**
   * Get all projects for a tenant
   * @param tenantId Tenant ID
   */
  async getProjects(tenantId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }

    return data as Project[];
  }

  /**
   * Get recent deploys for a project
   * @param projectId Project ID
   * @param limit Number of deploys to return
   */
  async getProjectDeploys(projectId: string, limit = 10): Promise<Deploy[]> {
    const { data, error } = await this.supabase
      .from('deploys')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get project deploys: ${error.message}`);
    }

    return data as Deploy[];
  }
}

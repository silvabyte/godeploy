import { ProjectService } from '../projects/ProjectService';
import { DeployService } from '../deploys/DeployService';
import { SubscriptionService } from '../subscriptions/SubscriptionService';
import { AuthService } from '../auth/AuthService';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database service for interacting with Supabase
 * Acts as a facade to access domain-specific services
 */
export class DatabaseService {
  readonly projects: ProjectService;
  readonly deploys: DeployService;
  readonly subscriptions: SubscriptionService;
  readonly auth: AuthService;

  constructor(supabase: SupabaseClient) {
    this.projects = new ProjectService();
    this.deploys = new DeployService();
    this.subscriptions = new SubscriptionService();
    this.auth = new AuthService(supabase);
  }
}

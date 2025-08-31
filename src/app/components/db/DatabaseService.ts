import type { SupabaseClient } from '@supabase/supabase-js'
import { AuthService } from '../auth/AuthService'
import { DeployService } from '../deploys/DeployService'
import { ProjectService } from '../projects/ProjectService'
import { SubscriptionService } from '../subscriptions/SubscriptionService'

/**
 * Database service for interacting with Supabase
 * Acts as a facade to access domain-specific services
 */
export class DatabaseService {
  readonly projects: ProjectService
  readonly deploys: DeployService
  readonly subscriptions: SubscriptionService
  readonly auth: AuthService
  readonly supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.projects = new ProjectService()
    this.deploys = new DeployService()
    this.subscriptions = new SubscriptionService()
    this.auth = new AuthService(supabase)
  }
}

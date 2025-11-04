import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "../auth/AuthService";
import { DeployService } from "../deploys/DeployService";
import { GodrawPageService } from "../godraw/GodrawPageService";
import { GodrawProjectService } from "../godraw/GodrawProjectService";
import { MetricsPageService } from "../metrics/MetricsPageService";
import { ProjectService } from "../projects/ProjectService";
import { SubscriptionService } from "../subscriptions/SubscriptionService";

/**
 * Database service for interacting with Supabase
 * Acts as a facade to access domain-specific services
 */
export class DatabaseService {
	readonly projects: ProjectService;
	readonly deploys: DeployService;
	readonly subscriptions: SubscriptionService;
	readonly metricsPages: MetricsPageService;
	readonly auth: AuthService;
	readonly godrawProjects: GodrawProjectService;
	readonly godrawPages: GodrawPageService;
	readonly supabase: SupabaseClient;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
		this.projects = new ProjectService();
		this.deploys = new DeployService();
		this.subscriptions = new SubscriptionService();
		this.metricsPages = new MetricsPageService();
		this.auth = new AuthService(supabase);
		this.godrawProjects = new GodrawProjectService();
		this.godrawPages = new GodrawPageService();
	}
}

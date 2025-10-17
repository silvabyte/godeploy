import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "./auth/AuthService";
import { DeployService } from "./DeployService";
import { DomainService } from "./DomainService";
import type { Database } from "./database.types";
import { ProjectService } from "./ProjectService";
import { UserService } from "./UserService";

export interface Services {
	authService: AuthService;
	userService: UserService;
	deployService: DeployService;
	projectService: ProjectService;
	domainService: DomainService;
}

export function createServices(client: SupabaseClient<Database>): Services {
	const authService = new AuthService(client);
	const userService = new UserService(client, authService);
	const deployService = new DeployService(client);
	const projectService = new ProjectService(client);
	const domainService = new DomainService();
	return {
		authService,
		userService,
		deployService,
		projectService,
		domainService,
	};
}

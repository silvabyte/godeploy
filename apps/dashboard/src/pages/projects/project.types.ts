export interface Project {
	id: string;
	tenant_id: string;
	owner_id: string;
	name: string;
	subdomain: string;
	domain: string | null;
	description?: string;
	project_type: "spa" | "godraw";
	created_at: string;
	updated_at: string;
}

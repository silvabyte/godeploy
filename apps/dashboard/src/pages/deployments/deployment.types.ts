export interface Deployment {
	id: string;
	href: string;
	projectName: string;
	teamName: string;
	owner_id: string;
	status: string;
	statusText: string;
	description: string;
	environment: string;
	url: string;
	created_at: string;
	updated_at?: string;
	duration?: number;
}

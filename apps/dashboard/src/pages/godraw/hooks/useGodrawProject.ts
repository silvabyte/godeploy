import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export interface GodrawProject {
	id: string;
	project_id: string;
	tenant_id: string;
	theme: "light" | "dark";
	home_page_id: string | null;
	created_at: string;
	updated_at: string;
}

export interface GodrawPage {
	id: string;
	godraw_project_id: string;
	tenant_id: string;
	name: string;
	slug: string;
	elements: unknown[];
	app_state: Record<string, unknown>;
	files: Record<string, unknown>;
	order_index: number;
	is_published: boolean;
	created_at: string;
	updated_at: string;
}

export interface GodrawProjectWithPages {
	godraw_project: GodrawProject;
	pages: GodrawPage[];
}

/**
 * Hook to fetch GoDraw project data with pages
 */
export function useGodrawProject(projectId: string) {
	return useQuery<GodrawProjectWithPages>({
		queryKey: ["godraw", "project", projectId],
		queryFn: async () => {
			const response = await api.get(`/projects/${projectId}/godraw`);
			return response.data;
		},
		enabled: !!projectId,
	});
}

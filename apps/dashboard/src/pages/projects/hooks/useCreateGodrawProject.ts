import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

interface CreateGodrawProjectData {
	name: string;
	description?: string;
	theme?: "light" | "dark";
}

interface CreateGodrawProjectResponse {
	project: {
		id: string;
		name: string;
		subdomain: string;
		project_type: string;
	};
	godraw_project: {
		id: string;
		project_id: string;
		tenant_id: string;
		theme: string;
		home_page_id: string;
		created_at: string;
		updated_at: string;
	};
	default_page: {
		id: string;
		name: string;
		slug: string;
	};
}

/**
 * Hook to create a new GoDraw project
 */
export function useCreateGodrawProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateGodrawProjectData) => {
			const response = await api.post<CreateGodrawProjectResponse>(
				"/projects/godraw",
				data,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate projects query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
	});
}

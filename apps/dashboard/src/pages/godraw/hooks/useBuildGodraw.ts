import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export interface BuildResult {
	deploy_id: string;
	project_id: string;
	status: string;
	build_info: {
		page_count: number;
		build_time_ms: number;
	};
	urls: {
		site: string;
		subdomain: string;
	};
}

export function useBuildGodraw(projectId: string) {
	return useMutation({
		mutationFn: async (): Promise<BuildResult> => {
			const response = await api.post(`/projects/${projectId}/godraw/build`);
			return response.data;
		},
	});
}

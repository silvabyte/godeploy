import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

interface CreatePageData {
	name: string;
	slug?: string;
	elements?: unknown[];
	app_state?: Record<string, unknown>;
	files?: Record<string, unknown>;
}

interface UpdatePageData {
	name?: string;
	slug?: string;
	elements?: unknown[];
	app_state?: Record<string, unknown>;
	files?: Record<string, unknown>;
	is_published?: boolean;
}

/**
 * Hook to create a new page
 */
export function useCreatePage(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePageData) => {
			const response = await api.post(
				`/projects/${projectId}/godraw/pages`,
				data,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate pages query to refetch
			queryClient.invalidateQueries({
				queryKey: ["godraw", "pages", projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["godraw", "project", projectId],
			});
		},
	});
}

/**
 * Hook to update a page
 */
export function useUpdatePage(projectId: string, pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdatePageData) => {
			const response = await api.patch(
				`/projects/${projectId}/godraw/pages/${pageId}`,
				data,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate queries
			queryClient.invalidateQueries({
				queryKey: ["godraw", "pages", projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["godraw", "project", projectId],
			});
		},
	});
}

/**
 * Hook to update any page (generic)
 */
export function useUpdateAnyPage(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pageId,
			data,
		}: {
			pageId: string;
			data: UpdatePageData;
		}) => {
			const response = await api.patch(
				`/projects/${projectId}/godraw/pages/${pageId}`,
				data,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate queries
			queryClient.invalidateQueries({
				queryKey: ["godraw", "pages", projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["godraw", "project", projectId],
			});
		},
	});
}

/**
 * Hook to delete a page
 */
export function useDeletePage(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pageId: string) => {
			await api.delete(`/projects/${projectId}/godraw/pages/${pageId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["godraw", "pages", projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["godraw", "project", projectId],
			});
		},
	});
}

/**
 * Hook to reorder pages
 */
export function useReorderPages(projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pageIds: string[]) => {
			const response = await api.patch(
				`/projects/${projectId}/godraw/pages/reorder`,
				{ page_ids: pageIds },
			);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["godraw", "pages", projectId],
			});
			queryClient.invalidateQueries({
				queryKey: ["godraw", "project", projectId],
			});
		},
	});
}

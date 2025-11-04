import type { Result } from "../../types/result.types";
import { BaseService } from "../services/BaseService";
import type { GodrawPage, UpdateGodrawPage } from "./godraw.types";

/**
 * Service for managing GoDraw pages
 */
export class GodrawPageService extends BaseService {
	constructor() {
		super("godraw_pages");
	}

	/**
	 * Create a new page
	 * @param page Page data
	 * @returns Result containing the created page or error message
	 */
	async createPage(
		page: Omit<GodrawPage, "id" | "created_at" | "updated_at">,
	): Promise<Result<GodrawPage>> {
		return this.create<GodrawPage>(page);
	}

	/**
	 * Get a page by ID
	 * @param pageId Page ID
	 * @returns Result containing the page or error message
	 */
	async getPageById(pageId: string): Promise<Result<GodrawPage>> {
		return this.getById<GodrawPage>(pageId);
	}

	/**
	 * Get all pages for a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @param includeUnpublished Whether to include unpublished pages
	 * @returns Result containing the pages or error message
	 */
	async getPagesByProjectId(
		godrawProjectId: string,
		includeUnpublished = false,
	): Promise<Result<GodrawPage[]>> {
		const filters: Record<string, string | boolean> = {
			godraw_project_id: godrawProjectId,
		};

		if (!includeUnpublished) {
			filters.is_published = true;
		}

		const result = await this.list<GodrawPage>({
			eqFilters: filters,
			pagination: {
				orderBy: "order_index",
				order: "asc",
			},
			tenantId: "", // Not needed for this query
			userId: "", // Not needed for this query
			tableName: this.tableName,
		});

		if (result.error || !result.data) {
			return { data: null, error: result.error };
		}

		return { data: result.data.data, error: null };
	}

	/**
	 * Get a page by slug within a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @param slug Page slug
	 * @returns Result containing the page or error message
	 */
	async getPageBySlug(
		godrawProjectId: string,
		slug: string,
	): Promise<Result<GodrawPage>> {
		return this.getOneByFilters<GodrawPage>({
			godraw_project_id: godrawProjectId,
			slug,
		});
	}

	/**
	 * Update a page
	 * @param pageId Page ID
	 * @param updates Updates to apply
	 * @returns Result containing the updated page or error message
	 */
	async updatePage(
		pageId: string,
		updates: UpdateGodrawPage,
	): Promise<Result<GodrawPage>> {
		return this.update<GodrawPage>(pageId, updates);
	}

	/**
	 * Delete a page
	 * @param pageId Page ID
	 * @returns Result indicating success or error message
	 */
	async deletePage(pageId: string): Promise<Result<boolean>> {
		const { error } = await this.supabase
			.from(this.tableName)
			.delete()
			.eq("id", pageId);

		if (error) {
			return { data: null, error: error.message };
		}
		return { data: true, error: null };
	}

	/**
	 * Reorder pages by updating their order_index
	 * @param pageIds Array of page IDs in desired order
	 * @returns Result indicating success or error message
	 */
	async reorderPages(pageIds: string[]): Promise<Result<boolean>> {
		// Update each page's order_index based on its position in the array
		const updates = pageIds.map((pageId, index) => {
			return this.supabase
				.from(this.tableName)
				.update({ order_index: index })
				.eq("id", pageId);
		});

		try {
			const results = await Promise.all(updates);
			const errors = results.filter((r) => r.error);

			if (errors.length > 0) {
				return {
					data: null,
					error: `Failed to reorder ${errors.length} page(s)`,
				};
			}

			return { data: true, error: null };
		} catch (error) {
			return {
				data: null,
				error: `Failed to reorder pages: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Count pages in a GoDraw project
	 * @param godrawProjectId GoDraw project ID
	 * @returns Result containing the count or error message
	 */
	async countPages(godrawProjectId: string): Promise<Result<number>> {
		const { count, error } = await this.supabase
			.from(this.tableName)
			.select("*", { count: "exact", head: true })
			.eq("godraw_project_id", godrawProjectId);

		if (error) {
			return { data: null, error: error.message };
		}

		return { data: count ?? 0, error: null };
	}
}

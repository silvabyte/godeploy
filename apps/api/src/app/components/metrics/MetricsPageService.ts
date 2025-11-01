import type { Result } from "../../types/result.types";
import { BaseService } from "../services/BaseService";
import type { MetricsPage } from "./metricsPages.types";

export class MetricsPageService extends BaseService {
	constructor() {
		super("metrics_pages");
	}

	async getBySlug(slug: string): Promise<Result<MetricsPage>> {
		return this.getOneByFilters<MetricsPage>({ slug });
	}

	async createPage(
		page: Omit<MetricsPage, "id" | "created_at" | "updated_at">,
	): Promise<Result<MetricsPage>> {
		return this.create<MetricsPage>(page);
	}

	async updatePage(
		id: string,
		data: Partial<MetricsPage>,
	): Promise<Result<MetricsPage>> {
		return this.update<MetricsPage>(id, data);
	}

	async listPages(tenantId: string): Promise<Result<MetricsPage[]>> {
		const result = await this.list<MetricsPage>({
			eqFilters: {},
			pagination: {
				orderBy: "created_at",
				order: "desc",
			},
			tenantId,
			userId: "",
			tableName: this.tableName,
		});

		if (result.error || !result.data)
			return { data: null, error: result.error };
		return { data: result.data.data, error: null };
	}

	async getByIdPublic(id: string): Promise<Result<MetricsPage>> {
		return super.getById<MetricsPage>(id);
	}

	async deletePage(id: string) {
		return super.delete(id);
	}
}

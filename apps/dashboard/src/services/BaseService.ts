import type { SupabaseClient } from "@supabase/supabase-js";
import type { Results } from "./types";

export interface PaginationOptions {
	limit: number;
	offset: number;
	orderBy: string;
	order: "asc" | "desc";
}

const DEFAULT_PAGINATION: PaginationOptions = {
	limit: 20,
	offset: 0,
	orderBy: "created_at",
	order: "desc",
};

const GENERIC_SORT_QUERY_PARAMS = {
	"sort[created_at]": "created_at",
	"sort[updated_at]": "updated_at",
} as const;
export const DEPLOY_SORT_QUERY_PARAMS = {
	...GENERIC_SORT_QUERY_PARAMS,
	"sort[status]": "status",
} as const;

export type Order = "asc" | "desc";

type FilterValue = string | number | boolean | null;

//querys
//.overlaps('tags', ['is:closed', 'severity:high'])
// (1, 'Cache invalidation is not working', array['is:open', 'severity:high', 'priority:low']),
// (2, 'Use better names', array['is:open', 'severity:low', 'priority:medium']);

//TODO: enable https://supabase.com/docs/guides/database/full-text-search

type Filter = Record<string, FilterValue>;

interface SearchField {
	field: string;
	value: string;
}

interface TableSearch {
	table: string;
	fields: SearchField[];
}

interface SearchOptions {
	directFields?: Record<string, string>; // Direct column searches
	referenceTables?: TableSearch[]; // Searches in referenced tables
}

interface PaginateQueryOptions {
	tableName: string;
	eqFilters?: Filter;
	gtFilters?: Filter;
	pagination?: Partial<PaginationOptions>;
	tableReferences?: Record<string, string[]>;
	search?: SearchOptions;
}

export interface PaginateQueryOptionsWithTenant extends PaginateQueryOptions {
	userId: string;
	tenantId: string;
}

export abstract class BaseService {
	constructor(protected readonly supabase: SupabaseClient) {}

	protected async get<T>(tableName: string, id: string): Promise<Results<T>> {
		const { data, error } = await this.supabase
			.from(tableName)
			.select("*")
			.eq("id", id);
		if (error) {
			return [error, null as unknown as T];
		}
		return [null as unknown as Error, data[0] as T];
	}

	protected async update<T>(
		tableName: string,
		id: string,
		updates: T,
	): Promise<Results<T>> {
		const { data, error } = await this.supabase
			.from(tableName)
			.update(updates)
			.eq("id", id)
			.select();
		if (error) {
			return [error, null as unknown as T];
		}
		if (data?.length === 0) {
			return [new Error("No data returned"), null as unknown as T];
		}
		return [null as unknown as Error, data[0] as T];
	}

	protected async delete(
		tableName: string,
		id: string,
	): Promise<Results<null>> {
		const { error } = await this.supabase.from(tableName).delete().eq("id", id);
		if (error) {
			return [error, null];
		}
		return [null as unknown as Error, null];
	}

	protected async paginateQuery<T>(
		tableName: string,
		filters: Record<string, FilterValue> = {},
		pagination: Partial<PaginationOptions> = DEFAULT_PAGINATION,
		tableReferences: Record<string, string[]> = {}, //table name -> foreign keys
		search: string = "",
	): Promise<Results<T[]>> {
		const {
			limit = DEFAULT_PAGINATION.limit,
			offset = DEFAULT_PAGINATION.offset,
			orderBy = DEFAULT_PAGINATION.orderBy,
			order = DEFAULT_PAGINATION.order,
		} = pagination;
		let select = "*";

		if (tableReferences) {
			Object.entries(tableReferences).forEach(([table, foreignKeys]) => {
				select += `, ${table} ( ${foreignKeys.join(", ")} )`;
			});
		}

		let query = this.supabase.from(tableName).select(select);

		// Apply filters
		Object.entries(filters).forEach(([key, value]) => {
			query = query.eq(key, value);
		});

		if (search) {
			query = query.ilike("search", `%${search}%`);
		}

		const { data, error } = await query
			.order(orderBy, { ascending: order === "asc" })
			.range(offset, offset + (limit - 1));

		if (error) {
			return [error, null as unknown as T[]];
		}
		return [null as unknown as Error, data as T[]];
	}
	protected async paginateQueryV2<T>({
		tableName,
		eqFilters,
		gtFilters,
		pagination,
		tableReferences,
		search,
	}: PaginateQueryOptions): Promise<Results<T[]>> {
		const {
			limit = DEFAULT_PAGINATION.limit,
			offset = DEFAULT_PAGINATION.offset,
			orderBy = DEFAULT_PAGINATION.orderBy,
			order = DEFAULT_PAGINATION.order,
		} = pagination ?? DEFAULT_PAGINATION;

		let select = "*";

		if (tableReferences) {
			Object.entries(tableReferences).forEach(([table, foreignKeys]) => {
				select += `, ${table}!inner( ${foreignKeys.join(", ")} )`;
			});
		}

		let query = this.supabase.from(tableName).select(select);

		// Apply filters
		if (eqFilters) {
			Object.entries(eqFilters).forEach(([key, value]) => {
				query = query.eq(key, value);
			});
		}

		if (gtFilters) {
			Object.entries(gtFilters).forEach(([key, value]) => {
				query = query.gt(key, value);
			});
		}

		// Apply direct field searches
		if (search?.directFields) {
			Object.entries(search.directFields).forEach(([key, value]) => {
				query = query.ilike(key, `%${value}%`);
			});
		}

		// Apply reference table searches
		if (search?.referenceTables) {
			search.referenceTables.forEach(({ table, fields }) => {
				fields.forEach(({ field, value }) => {
					query = query.filter(`${table}.${field}`, "ilike", `%${value}%`);
				});
			});
		}

		const { data, error } = await query
			.order(orderBy ?? DEFAULT_PAGINATION.orderBy, {
				ascending: order === "asc",
			})
			.range(offset ?? DEFAULT_PAGINATION.offset, offset + (limit - 1));

		if (error) {
			return [error, null as unknown as T[]];
		}
		return [null as unknown as Error, data as T[]];
	}
}

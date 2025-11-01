export interface PaginationOptions {
	limit: number;
	offset: number;
	orderBy: string;
	order: "asc" | "desc";
}

export const DEFAULT_PAGINATION: PaginationOptions = {
	limit: 20,
	offset: 0,
	orderBy: "created_at",
	order: "desc",
};

export type FilterValue = string | number | boolean | null;
export type Filter = Record<string, FilterValue>;

export interface SearchField {
	field: string;
	value: string;
}

export interface TableSearch {
	table: string;
	fields: SearchField[];
}

export interface SearchOptions {
	directFields?: Record<string, string>; // Direct column searches
	referenceTables?: TableSearch[]; // Searches in referenced tables
}

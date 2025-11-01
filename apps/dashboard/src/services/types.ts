import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Tables } from "./database.types";

export type Deploy = Tables<"deploys">;
export type DeployWithProject = Deploy & { projects: Project };

export type Project = Tables<"projects">;
export type User = Tables<"users"> & { meta: SupabaseUser };

export type Results<T> = [Error, T];

interface SearchField {
	field: string;
	value: string;
}

interface TableSearch {
	table: string;
	fields: SearchField[];
}

export interface SearchOptions {
	directFields?: Record<string, string>; // Direct column searches
	referenceTables?: TableSearch[]; // Searches in referenced tables
}

import type { Filter, SearchOptions } from './filter.types';

export interface PaginationOptions {
  limit: number;
  offset: number;
  orderBy: string;
  order: 'asc' | 'desc';
}

export const DEFAULT_PAGINATION: PaginationOptions = {
  limit: 20,
  offset: 0,
  orderBy: 'created_at',
  order: 'desc',
};

export interface PaginateQueryOptions {
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

export type Order = 'asc' | 'desc';

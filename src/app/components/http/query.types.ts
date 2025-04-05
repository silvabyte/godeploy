import type { PaginationOptions } from './pagination.types';
import type { Filter, SearchOptions } from './filter.types';

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

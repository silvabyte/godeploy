import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Filter } from '../http/filter.types'
import { DEFAULT_PAGINATION } from '../http/pagination.types'
import type { PaginateQueryOptions, PaginateQueryOptionsWithTenant } from '../http/query.types'

interface Result<T> {
  data: T | null
  error: string | null
}

export abstract class BaseService {
  protected supabase: SupabaseClient
  protected tableName: string

  constructor(tableName: string) {
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_API_KEY || ''
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.tableName = tableName
  }

  /**
   * Get a single record by ID
   * @param id Record ID
   * @returns Result containing the record or error message
   */
  protected async getById<T>(id: string): Promise<Result<T>> {
    const { data, error } = await this.supabase.from(this.tableName).select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      return {
        data: null,
        error: `Failed to get ${this.tableName}: ${error.message}`,
      }
    }

    return { data: data as T, error: null }
  }

  /**
   * Get a single record by filters
   * @param filters Record filters
   * @returns Result containing the record or error message
   */
  protected async getOneByFilters<T>(filters: Filter): Promise<Result<T>> {
    let query = this.supabase.from(this.tableName).select('*')

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      return {
        data: null,
        error: `Failed to get ${this.tableName}: ${error.message}`,
      }
    }

    return { data: data as T, error: null }
  }

  /**
   * Execute a paginated query with filters and search
   * @param options Query options
   * @returns Result containing the records or error message
   */
  protected async paginateQuery<T>({
    tableName,
    eqFilters,
    gtFilters,
    pagination,
    tableReferences,
    search,
  }: PaginateQueryOptions): Promise<Result<T[]>> {
    const {
      limit = DEFAULT_PAGINATION.limit,
      offset = DEFAULT_PAGINATION.offset,
      orderBy = DEFAULT_PAGINATION.orderBy,
      order = DEFAULT_PAGINATION.order,
    } = pagination ?? DEFAULT_PAGINATION

    let select = '*'

    if (tableReferences) {
      Object.entries(tableReferences).forEach(([table, foreignKeys]) => {
        select += `, ${table}!inner( ${foreignKeys.join(', ')} )`
      })
    }

    let query = this.supabase.from(tableName).select(select)

    // Apply filters
    if (eqFilters) {
      Object.entries(eqFilters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (gtFilters) {
      Object.entries(gtFilters).forEach(([key, value]) => {
        query = query.gt(key, value)
      })
    }

    // Apply direct field searches
    if (search?.directFields) {
      Object.entries(search.directFields).forEach(([key, value]) => {
        query = query.ilike(key, `%${value}%`)
      })
    }

    // Apply reference table searches
    if (search?.referenceTables) {
      search.referenceTables.forEach(({ table, fields }) => {
        fields.forEach(({ field, value }) => {
          query = query.filter(`${table}.${field}`, 'ilike', `%${value}%`)
        })
      })
    }

    const { data, error } = await query
      .order(orderBy ?? DEFAULT_PAGINATION.orderBy, {
        ascending: order === 'asc',
      })
      .range(offset ?? DEFAULT_PAGINATION.offset, offset + (limit - 1))

    if (error) {
      return {
        data: null,
        error: `Failed to get ${this.tableName}: ${error.message}`,
      }
    }

    return { data: data as T[], error: null }
  }

  /**
   * Get multiple records with pagination and filters
   * @param options Query options
   * @returns Result containing the records and total count or error message
   */
  protected async list<T>(options: PaginateQueryOptionsWithTenant): Promise<Result<{ data: T[]; total: number }>> {
    const {
      eqFilters = {},
      gtFilters = {},
      pagination = DEFAULT_PAGINATION,
      tableReferences = {},
      search,
      tenantId,
    } = options

    // Add tenant filter if provided
    const filters = tenantId ? { ...eqFilters, tenant_id: tenantId } : eqFilters

    const paginateResult = await this.paginateQuery<T>({
      tableName: this.tableName,
      eqFilters: filters,
      gtFilters,
      pagination,
      tableReferences,
      search,
    })

    if (paginateResult.error || !paginateResult.data) {
      return {
        data: null,
        error: paginateResult.error || 'Failed to get paginated results',
      }
    }

    // Get total count
    let countQuery = this.supabase.from(this.tableName).select('*', { count: 'exact' })

    // Apply tenant filter
    if (tenantId) {
      countQuery = countQuery.eq('tenant_id', tenantId)
    }

    // Apply equality filters
    for (const [key, value] of Object.entries(eqFilters)) {
      if (value !== undefined && value !== null) {
        countQuery = countQuery.eq(key, value)
      }
    }

    // Apply greater than filters
    for (const [key, value] of Object.entries(gtFilters)) {
      if (value !== undefined && value !== null) {
        countQuery = countQuery.gt(key, value)
      }
    }

    const { count, error } = await countQuery

    if (error) {
      return {
        data: null,
        error: `Failed to get ${this.tableName} count: ${error.message}`,
      }
    }

    return {
      data: {
        data: paginateResult.data,
        total: count || 0,
      },
      error: null,
    }
  }

  /**
   * Create a new record
   * @param data Record data
   * @returns Result containing the created record or error message
   */
  protected async create<T>(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<Result<T>> {
    const { data: result, error } = await this.supabase.from(this.tableName).insert([data]).select().single()

    if (error) {
      return {
        data: null,
        error: `Failed to create ${this.tableName}: ${error.message}`,
      }
    }

    return { data: result as T, error: null }
  }

  /**
   * Update a record
   * @param id Record ID
   * @param data Update data
   * @returns Result containing the updated record or error message
   */
  protected async update<T>(id: string, data: Partial<T>): Promise<Result<T>> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: `Failed to update ${this.tableName}: ${error.message}`,
      }
    }

    return { data: result as T, error: null }
  }

  /**
   * Delete a record
   * @param id Record ID
   * @returns Result indicating success or error message
   */
  protected async delete(id: string): Promise<Result<true>> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id)

    if (error) {
      return {
        data: null,
        error: `Failed to delete ${this.tableName}: ${error.message}`,
      }
    }

    return { data: true, error: null }
  }
}

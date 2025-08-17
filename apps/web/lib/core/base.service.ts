import { SupabaseClient } from '@supabase/supabase-js'

export interface BaseEntity {
  id: string
  tenant_id: string
  created_at: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export abstract class BaseService<T extends BaseEntity> {
  protected supabase: SupabaseClient
  protected tableName: string

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase
    this.tableName = tableName
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    await this.createAuditLog('create', result.id, data)
    return result as T
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    await this.createAuditLog('update', id, data)
    return result as T
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw new AppError(error.message, error.code)

    await this.createAuditLog('delete', id)
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new AppError(error.message, error.code)
    }

    return data as T
  }

  async list(
    filters: Record<string, any> = {},
    page = 1,
    limit = 20,
    orderBy = 'created_at',
    ascending = false
  ): Promise<PaginationResult<T>> {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    query = query.order(orderBy, { ascending })

    // Apply pagination
    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw new AppError(error.message, error.code)

    return {
      data: data as T[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  async paginate(
    offset: number,
    limit: number,
    filters?: Record<string, any>
  ): Promise<{ items: T[]; hasMore: boolean }> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit)

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query

    if (error) throw new AppError(error.message, error.code)

    return {
      items: data as T[],
      hasMore: data?.length === limit + 1
    }
  }

  protected async createAuditLog(
    action: string,
    resourceId: string,
    data?: any
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        resource_type: this.tableName,
        resource_id: resourceId,
        action,
        details: data
      })
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create audit log:', error)
    }
  }

  async search(
    searchTerm: string,
    searchFields: string[],
    limit = 20
  ): Promise<T[]> {
    const orConditions = searchFields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(',')

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .or(orConditions)
      .limit(limit)

    if (error) throw new AppError(error.message, error.code)

    return data as T[]
  }

  async batchCreate(items: Partial<T>[]): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(items)
      .select()

    if (error) throw new AppError(error.message, error.code)

    // Create audit logs for all items
    await Promise.all(
      data.map(item => this.createAuditLog('create', item.id, item))
    )

    return data as T[]
  }

  async batchUpdate(
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<T[]> {
    const results: T[] = []

    // Process in batches to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      const promises = batch.map(({ id, data }) => this.update(id, data))
      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
    }

    return results
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    const { count, error } = await query

    if (error) throw new AppError(error.message, error.code)

    return count || 0
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, error.code)
    }

    return !!data
  }
}
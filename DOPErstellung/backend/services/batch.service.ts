import { BaseService, BaseEntity } from '@/lib/core/base.service'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// QC data schema
export const qcDataSchema = z.object({
  compressive_strength_28d: z.number().optional(),
  flexural_strength_28d: z.number().optional(),
  flow_diameter: z.number().optional(),
  density: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  test_date: z.string().datetime().optional(),
  tested_by: z.string().optional(),
  w_c_ratio: z.number().optional(),
  air_content: z.number().optional(),
  setting_time_initial: z.number().optional(),
  setting_time_final: z.number().optional()
})

export const batchSchema = z.object({
  recipe_id: z.string().uuid(),
  batch_number: z.string().min(1),
  production_date: z.string().datetime(),
  quantity_tons: z.number().positive().optional(),
  production_site: z.string().optional(),
  qc_data: qcDataSchema.default({}),
  deviation_notes: z.string().optional(),
  status: z.enum(['produced', 'released', 'blocked', 'consumed']).default('produced')
})

export interface Batch extends BaseEntity {
  recipe_id: string
  batch_number: string
  production_date: string
  quantity_tons?: number
  production_site?: string
  qc_data: z.infer<typeof qcDataSchema>
  deviation_notes?: string
  status: 'produced' | 'released' | 'blocked' | 'consumed'
}

export class BatchService extends BaseService<Batch> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'en13813_batches')
  }

  async create(data: z.infer<typeof batchSchema>): Promise<Batch> {
    // Validate input
    const validated = batchSchema.parse(data)

    // Check for duplicate batch number
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('batch_number', validated.batch_number)
      .single()

    if (existing) {
      throw new Error(`Batch number ${validated.batch_number} already exists`)
    }

    // Create batch
    const batch = await super.create(validated)

    // Check QC data against recipe specifications
    await this.validateQCData(batch)

    return batch
  }

  async generateBatchNumber(recipeId: string): Promise<string> {
    // Get recipe info
    const { data: recipe } = await this.supabase
      .from('en13813_recipes')
      .select('recipe_code')
      .eq('id', recipeId)
      .single()

    if (!recipe) throw new Error('Recipe not found')

    // Generate batch number: YYYYMMDD-RecipeCode-XXX
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
    
    // Count today's batches for this recipe
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const { count } = await this.supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId)
      .gte('production_date', startOfDay.toISOString())

    const sequence = String((count || 0) + 1).padStart(3, '0')
    
    return `${date}-${recipe.recipe_code}-${sequence}`
  }

  async updateQCData(batchId: string, qcData: Partial<z.infer<typeof qcDataSchema>>) {
    const batch = await this.getById(batchId)
    if (!batch) throw new Error('Batch not found')

    const updatedQcData = {
      ...batch.qc_data,
      ...qcData,
      test_date: new Date().toISOString()
    }

    const updated = await this.update(batchId, { qc_data: updatedQcData })
    
    // Re-validate QC data
    await this.validateQCData(updated)

    return updated
  }

  async releaseBatch(batchId: string, releasedBy: string) {
    const batch = await this.getById(batchId)
    if (!batch) throw new Error('Batch not found')

    if (batch.status !== 'produced') {
      throw new Error(`Batch cannot be released from status: ${batch.status}`)
    }

    // Validate QC data is complete
    const validation = await this.validateQCData(batch)
    if (!validation.valid) {
      throw new Error(`Batch cannot be released: ${validation.issues.join(', ')}`)
    }

    return this.update(batchId, {
      status: 'released',
      updated_by: releasedBy
    })
  }

  async blockBatch(batchId: string, reason: string, blockedBy: string) {
    const batch = await this.getById(batchId)
    if (!batch) throw new Error('Batch not found')

    if (batch.status === 'consumed') {
      throw new Error('Cannot block a consumed batch')
    }

    await this.update(batchId, {
      status: 'blocked',
      deviation_notes: reason,
      updated_by: blockedBy
    })

    // Create notification
    await this.createBlockNotification(batch, reason)

    return batch
  }

  async getBatchesByRecipe(recipeId: string, status?: Batch['status']) {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('recipe_id', recipeId)
      .order('production_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Batch[]
  }

  async getBatchStatistics(startDate?: string, endDate?: string) {
    let query = this.supabase
      .from(this.tableName)
      .select('*')

    if (startDate) {
      query = query.gte('production_date', startDate)
    }
    if (endDate) {
      query = query.lte('production_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const stats = {
      total_batches: data.length,
      total_quantity: data.reduce((sum, b) => sum + (b.quantity_tons || 0), 0),
      by_status: {} as Record<string, number>,
      by_recipe: {} as Record<string, number>,
      average_strength: {
        compressive: 0,
        flexural: 0
      }
    }

    let strengthCount = 0
    data.forEach(batch => {
      // Status counts
      stats.by_status[batch.status] = (stats.by_status[batch.status] || 0) + 1
      
      // Recipe counts
      stats.by_recipe[batch.recipe_id] = (stats.by_recipe[batch.recipe_id] || 0) + 1
      
      // Average strengths
      if (batch.qc_data?.compressive_strength_28d) {
        stats.average_strength.compressive += batch.qc_data.compressive_strength_28d
        strengthCount++
      }
      if (batch.qc_data?.flexural_strength_28d) {
        stats.average_strength.flexural += batch.qc_data.flexural_strength_28d
      }
    })

    if (strengthCount > 0) {
      stats.average_strength.compressive /= strengthCount
      stats.average_strength.flexural /= strengthCount
    }

    return stats
  }

  async getQCTrend(recipeId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('production_date, qc_data')
      .eq('recipe_id', recipeId)
      .gte('production_date', startDate.toISOString())
      .order('production_date')

    if (error) throw error

    return data.map(batch => ({
      date: batch.production_date,
      compressive_strength: batch.qc_data?.compressive_strength_28d || null,
      flexural_strength: batch.qc_data?.flexural_strength_28d || null,
      flow_diameter: batch.qc_data?.flow_diameter || null
    }))
  }

  private async validateQCData(batch: Batch): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []

    // Get recipe specifications
    const { data: recipe } = await this.supabase
      .from('en13813_recipes')
      .select('compressive_strength_class, flexural_strength_class')
      .eq('id', batch.recipe_id)
      .single()

    if (!recipe) {
      return { valid: false, issues: ['Recipe not found'] }
    }

    // Extract minimum values from strength classes
    const minCompressive = parseInt(recipe.compressive_strength_class.replace('C', ''))
    const minFlexural = parseInt(recipe.flexural_strength_class.replace('F', ''))

    // Check compressive strength
    if (batch.qc_data.compressive_strength_28d !== undefined) {
      if (batch.qc_data.compressive_strength_28d < minCompressive) {
        issues.push(`Compressive strength (${batch.qc_data.compressive_strength_28d}) below minimum (${minCompressive})`)
      }
    } else if (batch.status === 'released') {
      issues.push('Compressive strength test required for release')
    }

    // Check flexural strength
    if (batch.qc_data.flexural_strength_28d !== undefined) {
      if (batch.qc_data.flexural_strength_28d < minFlexural) {
        issues.push(`Flexural strength (${batch.qc_data.flexural_strength_28d}) below minimum (${minFlexural})`)
      }
    } else if (batch.status === 'released') {
      issues.push('Flexural strength test required for release')
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  private async createBlockNotification(batch: Batch, reason: string) {
    await this.supabase.from('notifications').insert({
      type: 'batch_blocked',
      title: 'Batch Blocked',
      message: `Batch ${batch.batch_number} has been blocked: ${reason}`,
      resource_type: 'batch',
      resource_id: batch.id,
      priority: 'high'
    })
  }
}
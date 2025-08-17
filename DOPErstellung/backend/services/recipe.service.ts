import { BaseService } from '@/lib/core/base.service'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schemas
export const recipeSchema = z.object({
  recipe_code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),
  compressive_strength_class: z.string().regex(/^C\d{1,2}$/),
  flexural_strength_class: z.string().regex(/^F\d{1,2}$/),
  wear_resistance_class: z.string().regex(/^(A\d{1,2}|AR\d+\.?\d*)$/).optional(),
  fire_class: z.string().default('A1fl'),
  additives: z.array(z.object({
    name: z.string(),
    percentage: z.number().min(0).max(100),
    function: z.string()
  })).default([]),
  special_properties: z.record(z.any()).default({}),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional()
})

export type Recipe = z.infer<typeof recipeSchema> & {
  id: string
  tenant_id: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface RecipeFilter {
  type?: string
  status?: string
  search?: string
  strength_class?: string
}

export class RecipeService extends BaseService<Recipe> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'en13813_recipes')
  }

  async create(data: z.infer<typeof recipeSchema>): Promise<Recipe> {
    // Validate input
    const validated = recipeSchema.parse(data)
    
    // Check for duplicate recipe code
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('recipe_code', validated.recipe_code)
      .single()
    
    if (existing) {
      throw new Error(`Recipe code ${validated.recipe_code} already exists`)
    }
    
    return super.create(validated)
  }

  async update(id: string, data: Partial<z.infer<typeof recipeSchema>>): Promise<Recipe> {
    const validated = recipeSchema.partial().parse(data)
    
    // If updating recipe code, check for duplicates
    if (validated.recipe_code) {
      const { data: existing } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('recipe_code', validated.recipe_code)
        .neq('id', id)
        .single()
      
      if (existing) {
        throw new Error(`Recipe code ${validated.recipe_code} already exists`)
      }
    }
    
    return super.update(id, validated)
  }

  async list(filter: RecipeFilter = {}, page = 1, limit = 20) {
    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filter.type) {
      query = query.eq('type', filter.type)
    }

    if (filter.status) {
      query = query.eq('status', filter.status)
    }

    if (filter.search) {
      query = query.or(`recipe_code.ilike.%${filter.search}%,name.ilike.%${filter.search}%`)
    }

    if (filter.strength_class) {
      query = query.or(
        `compressive_strength_class.eq.${filter.strength_class},flexural_strength_class.eq.${filter.strength_class}`
      )
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return {
      data: data as Recipe[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  async getActiveRecipes() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'active')
      .order('recipe_code')

    if (error) throw error
    return data as Recipe[]
  }

  async cloneRecipe(id: string, newCode: string): Promise<Recipe> {
    // Get original recipe
    const { data: original, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !original) {
      throw new Error('Recipe not found')
    }

    // Remove unique fields
    const { id: _, recipe_code, created_at, updated_at, created_by, updated_by, ...recipeData } = original

    // Create new recipe
    return this.create({
      ...recipeData,
      recipe_code: newCode,
      name: `${original.name} (Kopie)`,
      status: 'draft'
    })
  }

  async getRecipeWithRelations(id: string) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        test_reports:en13813_test_reports(
          id,
          report_number,
          test_date,
          test_type,
          status,
          valid_until
        ),
        batches:en13813_batches(
          id,
          batch_number,
          production_date,
          quantity_tons,
          status
        ),
        dops:en13813_dops(
          id,
          dop_number,
          version,
          status,
          issued_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getRecipeStatistics(id: string) {
    const { data: recipe } = await this.getById(id)
    if (!recipe) throw new Error('Recipe not found')

    // Get counts
    const [batchCount, dopCount, activeTestCount] = await Promise.all([
      this.supabase
        .from('en13813_batches')
        .select('id', { count: 'exact', head: true })
        .eq('recipe_id', id),
      
      this.supabase
        .from('en13813_dops')
        .select('id', { count: 'exact', head: true })
        .eq('recipe_id', id)
        .eq('status', 'published'),
      
      this.supabase
        .from('en13813_test_reports')
        .select('id', { count: 'exact', head: true })
        .eq('recipe_id', id)
        .eq('status', 'valid')
    ])

    return {
      recipe,
      statistics: {
        total_batches: batchCount.count || 0,
        published_dops: dopCount.count || 0,
        active_tests: activeTestCount.count || 0
      }
    }
  }

  async validateRecipeForDoP(id: string): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []
    
    const recipe = await this.getRecipeWithRelations(id)
    if (!recipe) {
      return { valid: false, issues: ['Recipe not found'] }
    }

    // Check if recipe is active
    if (recipe.status !== 'active') {
      issues.push('Recipe must be active')
    }

    // Check for valid test reports
    const validTests = recipe.test_reports?.filter((t: any) => 
      t.status === 'valid' && 
      (!t.valid_until || new Date(t.valid_until) > new Date())
    ) || []

    if (validTests.length === 0) {
      issues.push('No valid test reports found')
    }

    // Check for required test types
    const requiredTestTypes = ['initial_type_test']
    const testTypes = new Set(recipe.test_reports?.map((t: any) => t.test_type) || [])
    
    requiredTestTypes.forEach(type => {
      if (!testTypes.has(type)) {
        issues.push(`Missing required test type: ${type}`)
      }
    })

    return {
      valid: issues.length === 0,
      issues
    }
  }
}
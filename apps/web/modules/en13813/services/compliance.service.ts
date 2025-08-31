import { SupabaseClient } from '@supabase/supabase-js'
import * as z from 'zod'

// Schemas
export const complianceTaskSchema = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
  recipe_id: z.string().uuid().optional().nullable(),
  
  task_type: z.enum([
    'itt_testing',
    'recipe_validation', 
    'dop_creation',
    'fpc_audit',
    'calibration',
    'retest_required'
  ]),
  
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().optional(),
  completed_at: z.string().optional().nullable(),
  completed_by: z.string().uuid().optional().nullable(),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export const ittTestPlanSchema = z.object({
  id: z.string().uuid().optional(),
  recipe_id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  
  required_tests: z.array(z.object({
    property: z.string(),
    norm: z.string(),
    test_age_days: z.number().optional(),
    target_class: z.string().optional()
  })).default([]),
  
  optional_tests: z.array(z.object({
    property: z.string(),
    norm: z.string(),
    reason: z.string().optional()
  })).default([]),
  
  test_status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  test_results: z.record(z.any()).default({}),
  
  last_validated_at: z.string().optional().nullable(),
  validation_notes: z.string().optional().nullable()
})

export const fpcControlPlanSchema = z.object({
  id: z.string().uuid().optional(),
  recipe_id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  
  incoming_inspection: z.object({
    binder: z.object({
      frequency: z.string(),
      tests: z.array(z.string()),
      tolerance: z.string()
    }),
    aggregates: z.object({
      frequency: z.string(),
      tests: z.array(z.string()),
      tolerance: z.string()
    })
  }),
  
  production_control: z.object({
    fresh_mortar: z.object({
      frequency: z.string(),
      tests: z.array(z.string()),
      limits: z.record(z.any())
    }),
    hardened_mortar: z.object({
      frequency: z.string(),
      tests: z.array(z.string()),
      warning_limit: z.string(),
      action_limit: z.string()
    })
  }),
  
  calibration: z.object({
    scales: z.string(),
    mixers: z.string(),
    testing_equipment: z.string()
  }),
  
  active: z.boolean().default(true)
})

export type ComplianceTask = z.infer<typeof complianceTaskSchema>
export type ITTTestPlan = z.infer<typeof ittTestPlanSchema>
export type FPCControlPlan = z.infer<typeof fpcControlPlanSchema>

export interface ComplianceStats {
  total_recipes: number
  compliant: number
  missing_itt: number
  retest_required: number
  dop_ready: number
  dop_ready_percentage: number
  pending_tasks: number
  overdue_tasks: number
}

export interface RecipeComplianceStatus {
  recipe_id: string
  recipe_code: string
  en_designation: string
  is_compliant: boolean
  missing_tests: string[]
  pending_tasks: number
  dop_ready: boolean
  last_test_date: string | null
  next_test_due: string | null
}

export class ComplianceService {
  constructor(private supabase: SupabaseClient) {}

  // Compliance Tasks
  async getTasks(status?: string): Promise<ComplianceTask[]> {
    let query = this.supabase
      .from('en13813_compliance_tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createTask(task: Omit<ComplianceTask, 'id'>): Promise<ComplianceTask> {
    const validated = complianceTaskSchema.parse(task)
    
    const { data, error } = await this.supabase
      .from('en13813_compliance_tasks')
      .insert(validated)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateTask(id: string, updates: Partial<ComplianceTask>): Promise<ComplianceTask> {
    const { data, error } = await this.supabase
      .from('en13813_compliance_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async completeTask(id: string): Promise<ComplianceTask> {
    return this.updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  // ITT Test Plans
  async getITTPlan(recipeId: string): Promise<ITTTestPlan | null> {
    const { data, error } = await this.supabase
      .from('en13813_itt_test_plans')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  async createITTPlan(plan: Omit<ITTTestPlan, 'id'>): Promise<ITTTestPlan> {
    const validated = ittTestPlanSchema.parse(plan)
    
    const { data, error } = await this.supabase
      .from('en13813_itt_test_plans')
      .insert(validated)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateITTPlan(id: string, updates: Partial<ITTTestPlan>): Promise<ITTTestPlan> {
    const { data, error } = await this.supabase
      .from('en13813_itt_test_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // FPC Control Plans
  async getFPCPlan(recipeId: string): Promise<FPCControlPlan | null> {
    const { data, error } = await this.supabase
      .from('en13813_fpc_control_plans')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  async createFPCPlan(plan: Omit<FPCControlPlan, 'id'>): Promise<FPCControlPlan> {
    const validated = fpcControlPlanSchema.parse(plan)
    
    const { data, error } = await this.supabase
      .from('en13813_fpc_control_plans')
      .insert(validated)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Statistics
  async getStats(): Promise<ComplianceStats> {
    const { data: recipes } = await this.supabase
      .from('en13813_recipes')
      .select('id, status')

    const { data: tasks } = await this.supabase
      .from('en13813_compliance_tasks')
      .select('id, status, due_date')
      .eq('status', 'pending')

    const { data: ittPlans } = await this.supabase
      .from('en13813_itt_test_plans')
      .select('id, test_status')

    const totalRecipes = recipes?.length || 0
    const compliant = recipes?.filter(r => r.status === 'active').length || 0
    const missingITT = ittPlans?.filter(p => p.test_status === 'pending').length || 0
    const pendingTasks = tasks?.length || 0
    const overdueTasks = tasks?.filter(t => 
      t.due_date && new Date(t.due_date) < new Date()
    ).length || 0

    return {
      total_recipes: totalRecipes,
      compliant,
      missing_itt: missingITT,
      retest_required: 0, // TODO: Implement based on test dates
      dop_ready: compliant,
      dop_ready_percentage: totalRecipes > 0 ? Math.round((compliant / totalRecipes) * 100) : 0,
      pending_tasks: pendingTasks,
      overdue_tasks: overdueTasks
    }
  }

  async getRecipeStatuses(): Promise<RecipeComplianceStatus[]> {
    const { data: recipes } = await this.supabase
      .from('en13813_recipes')
      .select(`
        id,
        recipe_code,
        type,
        compressive_strength_class,
        flexural_strength_class,
        wear_resistance_class,
        status,
        en13813_itt_test_plans!inner(test_status, test_results),
        en13813_compliance_tasks!inner(id, status)
      `)

    if (!recipes) return []

    return recipes.map(recipe => {
      const ittPlan = recipe.en13813_itt_test_plans?.[0]
      const pendingTasks = recipe.en13813_compliance_tasks?.filter(
        (t: any) => t.status === 'pending'
      ).length || 0

      const missingTests = this.getMissingTests(recipe, ittPlan)
      const enDesignation = this.generateENDesignation(recipe)

      return {
        recipe_id: recipe.id,
        recipe_code: recipe.recipe_code,
        en_designation: enDesignation,
        is_compliant: recipe.status === 'active' && ittPlan?.test_status === 'completed',
        missing_tests: missingTests,
        pending_tasks: pendingTasks,
        dop_ready: recipe.status === 'active' && ittPlan?.test_status === 'completed',
        last_test_date: null, // TODO: Implement
        next_test_due: null // TODO: Implement
      }
    })
  }

  private getMissingTests(recipe: any, ittPlan: any): string[] {
    const missing: string[] = []

    if (!ittPlan || ittPlan.test_status !== 'completed') {
      if (['CT', 'CA', 'MA'].includes(recipe.type)) {
        if (!ittPlan?.test_results?.compressive_strength) {
          missing.push('Druckfestigkeit')
        }
        if (!ittPlan?.test_results?.flexural_strength) {
          missing.push('Biegezugfestigkeit')
        }
      }

      if (recipe.wear_resistance_class && !ittPlan?.test_results?.wear_resistance) {
        missing.push('Verschleißwiderstand')
      }
    }

    return missing
  }

  private generateENDesignation(recipe: any): string {
    let designation = `EN 13813 ${recipe.type}-${recipe.compressive_strength_class}-${recipe.flexural_strength_class}`
    
    if (recipe.wear_resistance_class) {
      designation += `-${recipe.wear_resistance_class}`
    }

    return designation
  }

  // Automatische Task-Erstellung
  async createAutomaticTasks(recipeId: string): Promise<void> {
    const { data: recipe } = await this.supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (!recipe) return

    const tasks: Omit<ComplianceTask, 'id'>[] = []

    // ITT-Testing Task
    tasks.push({
      recipe_id: recipeId,
      task_type: 'itt_testing',
      title: `ITT-Prüfung für ${recipe.recipe_code}`,
      description: 'Erstprüfung nach EN 13813 durchführen',
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 Tage
    })

    // FPC Audit Task (alle 6 Monate)
    tasks.push({
      recipe_id: recipeId,
      task_type: 'fpc_audit',
      title: `FPC-Audit für ${recipe.recipe_code}`,
      description: 'Werkseigene Produktionskontrolle überprüfen',
      priority: 'medium',
      status: 'pending',
      due_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 Monate
    })

    // DoP Creation Task
    if (recipe.status === 'active') {
      tasks.push({
        recipe_id: recipeId,
        task_type: 'dop_creation',
        title: `DoP erstellen für ${recipe.recipe_code}`,
        description: 'Leistungserklärung nach EN 13813 erstellen',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 Tage
      })
    }

    // Bulk insert tasks
    for (const task of tasks) {
      await this.createTask(task)
    }
  }
}
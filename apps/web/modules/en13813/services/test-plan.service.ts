/**
 * Prüfplan-Service für EN 13813
 * Verwaltet ITT-Prüfpläne und FPC-Prüffrequenzen
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface TestPlanItem {
  id: string
  property: string
  property_de: string
  norm: string
  test_method: string
  test_age_days?: number
  frequency: 'initial' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  mandatory: boolean
  applies_to: string[] // ['CT', 'CA', 'MA', 'AS', 'SR']
  category: 'mechanical' | 'physical' | 'chemical' | 'thermal' | 'acoustic' | 'electrical'
  notes?: string
}

export interface RecipeTestPlan {
  id: string
  recipe_id: string
  test_plan_items: TestPlanItem[]
  itt_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  itt_completion_date?: string
  fpc_active: boolean
  last_review_date?: string
  next_review_date?: string
  created_at?: string
  updated_at?: string
}

export interface TestSchedule {
  id: string
  recipe_id: string
  test_plan_item_id: string
  scheduled_date: string
  status: 'scheduled' | 'completed' | 'overdue' | 'skipped'
  test_result?: any
  tested_by?: string
  notes?: string
  created_at?: string
}

export class TestPlanService {
  constructor(private supabase: SupabaseClient) {}

  // EN 13813 Standard-Prüfplan
  private getStandardTestPlan(): TestPlanItem[] {
    return [
      // Mechanische Eigenschaften (PFLICHT für ITT)
      {
        id: '1',
        property: 'compressive_strength',
        property_de: 'Druckfestigkeit',
        norm: 'EN 13892-2',
        test_method: 'Würfel 40x40x40mm oder Prismen 40x40x160mm',
        test_age_days: 28,
        frequency: 'monthly',
        mandatory: true,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'mechanical'
      },
      {
        id: '2',
        property: 'flexural_strength',
        property_de: 'Biegezugfestigkeit',
        norm: 'EN 13892-2',
        test_method: 'Prismen 40x40x160mm, 3-Punkt-Biegung',
        test_age_days: 28,
        frequency: 'monthly',
        mandatory: true,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'mechanical'
      },
      {
        id: '3',
        property: 'wear_resistance_bohme',
        property_de: 'Verschleißwiderstand (Böhme)',
        norm: 'EN 13892-3',
        test_method: 'Böhme-Scheibe, 22 Umdrehungen',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'mechanical',
        notes: 'Nur wenn deklariert'
      },
      {
        id: '4',
        property: 'wear_resistance_bca',
        property_de: 'Verschleißwiderstand (BCA)',
        norm: 'EN 13892-4',
        test_method: 'BCA-Verfahren',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'mechanical',
        notes: 'Alternative zu Böhme'
      },
      {
        id: '5',
        property: 'surface_hardness',
        property_de: 'Oberflächenhärte',
        norm: 'EN 13892-6',
        test_method: 'Eindringkörper',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['MA'],
        category: 'mechanical',
        notes: 'Nur für Magnesiaestriche'
      },
      {
        id: '6',
        property: 'bond_strength',
        property_de: 'Haftzugfestigkeit',
        norm: 'EN 13892-8',
        test_method: 'Abreißversuch',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['SR'],
        category: 'mechanical',
        notes: 'Nur für Kunstharzestriche'
      },
      
      // Physikalische Eigenschaften
      {
        id: '7',
        property: 'consistency',
        property_de: 'Konsistenz',
        norm: 'EN 13454-2',
        test_method: 'Ausbreittisch oder Fließtisch',
        frequency: 'daily',
        mandatory: true,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'physical',
        notes: 'Frischmörtelprüfung'
      },
      {
        id: '8',
        property: 'density_fresh',
        property_de: 'Frischmörteldichte',
        norm: 'EN 12350-6',
        test_method: 'Wägung definiertes Volumen',
        frequency: 'daily',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'physical'
      },
      {
        id: '9',
        property: 'density_dry',
        property_de: 'Trockenrohdichte',
        norm: 'EN 12390-7',
        test_method: 'Nach Trocknung bei 105°C',
        test_age_days: 28,
        frequency: 'monthly',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'physical'
      },
      {
        id: '10',
        property: 'shrinkage',
        property_de: 'Schwinden',
        norm: 'EN 13454-2',
        test_method: 'Längenänderung',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA'],
        category: 'physical'
      },
      
      // Brandverhalten
      {
        id: '11',
        property: 'fire_class',
        property_de: 'Brandklasse',
        norm: 'EN 13501-1',
        test_method: 'Kleinbrennertest oder SBI',
        frequency: 'initial',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'thermal',
        notes: 'Nur bei Deklaration, System 1+ erforderlich'
      },
      
      // Thermische Eigenschaften
      {
        id: '12',
        property: 'thermal_conductivity',
        property_de: 'Wärmeleitfähigkeit',
        norm: 'EN 12664',
        test_method: 'Plattengerät',
        frequency: 'yearly',
        mandatory: false,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'thermal',
        notes: 'Nur wenn deklariert'
      },
      
      // Chemische Beständigkeit
      {
        id: '13',
        property: 'chemical_resistance',
        property_de: 'Chemische Beständigkeit',
        norm: 'EN 13529',
        test_method: 'Lagerung in Prüfmedien',
        test_age_days: 28,
        frequency: 'yearly',
        mandatory: false,
        applies_to: ['SR'],
        category: 'chemical',
        notes: 'Nur für spezielle Anwendungen'
      },
      
      // Elektrische Eigenschaften
      {
        id: '14',
        property: 'electrical_resistance',
        property_de: 'Elektrischer Widerstand',
        norm: 'EN 13893',
        test_method: 'Oberflächenwiderstand',
        test_age_days: 28,
        frequency: 'quarterly',
        mandatory: false,
        applies_to: ['AS'],
        category: 'electrical',
        notes: 'Nur für AS mit ESD-Anforderungen'
      },
      
      // Gefährliche Substanzen
      {
        id: '15',
        property: 'dangerous_substances',
        property_de: 'Gefährliche Substanzen',
        norm: 'EN 13813',
        test_method: 'Siehe Sicherheitsdatenblatt',
        frequency: 'initial',
        mandatory: true,
        applies_to: ['CT', 'CA', 'MA', 'AS', 'SR'],
        category: 'chemical',
        notes: 'NPD oder Verweis auf SDB'
      }
    ]
  }

  // Prüfplan für Rezeptur erstellen
  async createTestPlan(recipeId: string, estrichType: string): Promise<RecipeTestPlan> {
    const standardPlan = this.getStandardTestPlan()
    
    // Filter tests applicable to estrich type
    const applicableTests = standardPlan.filter(test => 
      test.applies_to.includes(estrichType)
    )
    
    const testPlan: Omit<RecipeTestPlan, 'id' | 'created_at' | 'updated_at'> = {
      recipe_id: recipeId,
      test_plan_items: applicableTests,
      itt_status: 'pending',
      fpc_active: false,
      next_review_date: this.calculateNextReviewDate()
    }
    
    const { data, error } = await this.supabase
      .from('en13813_test_plans')
      .insert(testPlan)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Prüfplan abrufen
  async getTestPlan(recipeId: string): Promise<RecipeTestPlan | null> {
    const { data, error } = await this.supabase
      .from('en13813_test_plans')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Prüftermine generieren
  async generateTestSchedule(recipeId: string, startDate: Date = new Date()): Promise<TestSchedule[]> {
    const testPlan = await this.getTestPlan(recipeId)
    if (!testPlan) throw new Error('Kein Prüfplan vorhanden')
    
    const schedules: Omit<TestSchedule, 'id' | 'created_at'>[] = []
    
    testPlan.test_plan_items.forEach(item => {
      if (item.frequency === 'initial') return // ITT nur einmalig
      
      const scheduleDates = this.calculateScheduleDates(startDate, item.frequency, 12) // 12 Monate vorausplanen
      
      scheduleDates.forEach(date => {
        schedules.push({
          recipe_id: recipeId,
          test_plan_item_id: item.id,
          scheduled_date: date.toISOString(),
          status: 'scheduled'
        })
      })
    })
    
    const { data, error } = await this.supabase
      .from('en13813_test_schedules')
      .insert(schedules)
      .select()
    
    if (error) throw error
    return data || []
  }

  // Anstehende Prüfungen abrufen
  async getUpcomingTests(daysAhead: number = 7): Promise<TestSchedule[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    const { data, error } = await this.supabase
      .from('en13813_test_schedules')
      .select(`
        *,
        recipe:en13813_recipes(recipe_code, name),
        test_plan:en13813_test_plans!inner(test_plan_items)
      `)
      .lte('scheduled_date', futureDate.toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Prüfergebnis erfassen
  async recordTestResult(
    scheduleId: string, 
    result: any, 
    testedBy: string,
    notes?: string
  ): Promise<TestSchedule> {
    const { data, error } = await this.supabase
      .from('en13813_test_schedules')
      .update({
        status: 'completed',
        test_result: result,
        tested_by: testedBy,
        notes: notes
      })
      .eq('id', scheduleId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // FPC Compliance Check
  async checkFPCCompliance(recipeId: string): Promise<{
    compliant: boolean
    overdue_tests: TestSchedule[]
    completion_rate: number
  }> {
    const today = new Date()
    
    const { data: schedules, error } = await this.supabase
      .from('en13813_test_schedules')
      .select('*')
      .eq('recipe_id', recipeId)
      .lte('scheduled_date', today.toISOString())
    
    if (error) throw error
    
    const overdueTests = (schedules || []).filter(s => 
      s.status === 'scheduled' && new Date(s.scheduled_date) < today
    )
    
    const completedTests = (schedules || []).filter(s => s.status === 'completed')
    const completionRate = schedules?.length 
      ? (completedTests.length / schedules.length) * 100 
      : 0
    
    return {
      compliant: overdueTests.length === 0 && completionRate >= 95,
      overdue_tests: overdueTests,
      completion_rate: completionRate
    }
  }

  // ITT Status aktualisieren
  async updateITTStatus(
    recipeId: string, 
    status: RecipeTestPlan['itt_status'],
    completionDate?: string
  ): Promise<RecipeTestPlan> {
    const updates: any = { itt_status: status }
    if (completionDate) {
      updates.itt_completion_date = completionDate
    }
    
    const { data, error } = await this.supabase
      .from('en13813_test_plans')
      .update(updates)
      .eq('recipe_id', recipeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Private Hilfsmethoden
  private calculateNextReviewDate(): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1) // Jährliche Überprüfung
    return date.toISOString()
  }

  private calculateScheduleDates(
    startDate: Date, 
    frequency: TestPlanItem['frequency'],
    monthsAhead: number
  ): Date[] {
    const dates: Date[] = []
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + monthsAhead)
    
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3)
          break
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
        default:
          return dates
      }
    }
    
    return dates
  }

  // Statistiken für Dashboard
  async getTestPlanStatistics() {
    const { data: plans, error: plansError } = await this.supabase
      .from('en13813_test_plans')
      .select('*')
    
    if (plansError) throw plansError
    
    const { data: schedules, error: schedulesError } = await this.supabase
      .from('en13813_test_schedules')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_date', new Date().toISOString())
    
    if (schedulesError) throw schedulesError
    
    return {
      total_test_plans: plans?.length || 0,
      itt_pending: plans?.filter(p => p.itt_status === 'pending').length || 0,
      itt_completed: plans?.filter(p => p.itt_status === 'completed').length || 0,
      fpc_active: plans?.filter(p => p.fpc_active).length || 0,
      overdue_tests: schedules?.length || 0
    }
  }
}
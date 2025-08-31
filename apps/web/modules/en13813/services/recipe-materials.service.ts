import { SupabaseClient } from '@supabase/supabase-js'
import * as z from 'zod'

// Schema für Materialzusammensetzung
export const recipeMaterialsSchema = z.object({
  id: z.string().uuid().optional(),
  recipe_id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  
  // Bindemittel
  binder_type: z.string().min(1, 'Bindemittel-Typ erforderlich'),
  binder_designation: z.string().min(1, 'Bindemittel-Bezeichnung erforderlich'),
  binder_amount_kg_m3: z.number().min(0).max(1000),
  binder_supplier: z.string().optional(),
  
  // Zuschlagstoffe
  aggregate_type: z.string().optional(),
  aggregate_max_size: z.string().optional(),
  sieve_curve: z.object({
    size_mm: z.array(z.number()),
    passing_percent: z.array(z.number())
  }).optional(),
  
  // Wasser & W/B-Wert
  water_content: z.number().min(0).max(500).optional(),
  water_binder_ratio: z.number().min(0.2).max(1.0),
  
  // Zusatzmittel
  additives: z.array(z.object({
    type: z.string(),
    name: z.string(),
    dosage_percent: z.number(),
    supplier: z.string().optional()
  })).default([]),
  
  fibers: z.object({
    type: z.enum(['steel', 'polymer', 'glass', 'other']),
    length_mm: z.number(),
    dosage_kg_m3: z.number(),
    supplier: z.string().optional()
  }).optional(),
  
  // Frischmörtel-Eigenschaften
  fresh_mortar_properties: z.object({
    consistency: z.object({
      method: z.enum(['flow_table', 'slump', 'compacting_factor']),
      target_mm: z.number().optional(),
      tolerance_mm: z.number().optional()
    }),
    setting_time: z.object({
      initial_minutes: z.number().optional(),
      final_minutes: z.number().optional()
    }),
    ph_value: z.number().min(0).max(14).optional(),
    processing_time_minutes: z.number().optional(),
    temperature_range: z.object({
      min_celsius: z.number(),
      max_celsius: z.number()
    })
  }).default({
    consistency: {
      method: 'flow_table',
      target_mm: null,
      tolerance_mm: null
    },
    setting_time: {
      initial_minutes: null,
      final_minutes: null
    },
    ph_value: null,
    processing_time_minutes: null,
    temperature_range: {
      min_celsius: 5,
      max_celsius: 30
    }
  })
})

export type RecipeMaterials = z.infer<typeof recipeMaterialsSchema>

export class RecipeMaterialsService {
  constructor(private supabase: SupabaseClient) {}

  async getByRecipeId(recipeId: string): Promise<RecipeMaterials | null> {
    const { data, error } = await this.supabase
      .from('en13813_recipe_materials')
      .select('*')
      .eq('recipe_id', recipeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  async create(materials: Omit<RecipeMaterials, 'id'>): Promise<RecipeMaterials> {
    const validated = recipeMaterialsSchema.parse(materials)
    
    const { data, error } = await this.supabase
      .from('en13813_recipe_materials')
      .insert(validated)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: Partial<RecipeMaterials>): Promise<RecipeMaterials> {
    const { data, error } = await this.supabase
      .from('en13813_recipe_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async upsert(materials: RecipeMaterials): Promise<RecipeMaterials> {
    const validated = recipeMaterialsSchema.parse(materials)
    
    const { data, error } = await this.supabase
      .from('en13813_recipe_materials')
      .upsert(validated, {
        onConflict: 'recipe_id'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('en13813_recipe_materials')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Hilfsfunktionen für Berechnungen
  calculateWaterBinderRatio(waterContent: number, binderAmount: number): number {
    if (binderAmount === 0) return 0
    return Math.round((waterContent / binderAmount) * 1000) / 1000
  }

  validateSieveCurve(sieveCurve: any): boolean {
    if (!sieveCurve || !sieveCurve.size_mm || !sieveCurve.passing_percent) {
      return false
    }

    // Prüfe ob Arrays gleich lang sind
    if (sieveCurve.size_mm.length !== sieveCurve.passing_percent.length) {
      return false
    }

    // Prüfe ob Werte absteigend sind (größere Siebe zuerst)
    for (let i = 1; i < sieveCurve.passing_percent.length; i++) {
      if (sieveCurve.passing_percent[i] > sieveCurve.passing_percent[i - 1]) {
        return false
      }
    }

    return true
  }

  // Berechne Gesamtmenge aller Komponenten
  calculateTotalAmount(materials: RecipeMaterials): number {
    let total = materials.binder_amount_kg_m3 || 0
    
    if (materials.water_content) {
      total += materials.water_content
    }

    if (materials.fibers?.dosage_kg_m3) {
      total += materials.fibers.dosage_kg_m3
    }

    // Zuschlagstoffe würden hier auch addiert, wenn wir die Menge hätten
    
    return Math.round(total * 10) / 10
  }
}
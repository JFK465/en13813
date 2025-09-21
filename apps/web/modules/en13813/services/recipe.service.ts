import { SupabaseClient } from '@supabase/supabase-js'
import { Recipe, RecipeFilter } from '../types'

export class RecipeService {
  constructor(private supabase: SupabaseClient) {}

  async list(filter?: RecipeFilter): Promise<Recipe[]> {
    try {
      let query = this.supabase
        .from('en13813_recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      if (filter?.type) {
        query = query.eq('binder_type', filter.type)
      }

      if (filter?.search) {
        query = query.or(`recipe_code.ilike.%${filter.search}%,name.ilike.%${filter.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error listing recipes:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Recipe | null> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting recipe:', error)
      throw error
    }
  }

  async create(recipe: Partial<Recipe>): Promise<Recipe> {
    try {
      // Generate recipe code if not provided
      if (!recipe.recipe_code && recipe.binder_type && recipe.compressive_strength_class && recipe.flexural_strength_class) {
        recipe.recipe_code = `${recipe.binder_type}-${recipe.compressive_strength_class}-${recipe.flexural_strength_class}`
        if (recipe.wear_resistance_bohme_class || recipe.wear_resistance_bca_class || recipe.wear_resistance_rollrad_class) {
          const wearClass = recipe.wear_resistance_bohme_class || recipe.wear_resistance_bca_class || recipe.wear_resistance_rollrad_class
          recipe.recipe_code += `-${wearClass}`
        }
      }

      // Set default values
      const recipeData = {
        ...recipe,
        status: recipe.status || 'draft',
        fire_class: recipe.fire_class || 'A1fl',
        avcp_system: recipe.avcp_system || '4', // Default System 4 for standard recipes
        setting_time_norm: recipe.setting_time_norm || 'EN 13454-2' // EN 13813 compliant norm
      }

      const { data, error } = await this.supabase
        .from('en13813_recipes')
        .insert(recipeData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw error
    }
  }

  async update(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      // Regenerate recipe code if classification changed
      if (updates.binder_type || updates.compressive_strength_class || updates.flexural_strength_class) {
        const existing = await this.getById(id)
        if (existing) {
          updates.recipe_code = `${updates.binder_type || existing.binder_type}-${updates.compressive_strength_class || existing.compressive_strength_class}-${updates.flexural_strength_class || existing.flexural_strength_class}`
          const wearClass = updates.wear_resistance_bohme_class || updates.wear_resistance_bca_class || updates.wear_resistance_rollrad_class ||
                           existing.wear_resistance_bohme_class || existing.wear_resistance_bca_class || existing.wear_resistance_rollrad_class
          if (wearClass) {
            updates.recipe_code += `-${wearClass}`
          }
        }
      }

      const { data, error } = await this.supabase
        .from('en13813_recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Check if recipe is used in any DoPs
      const { data: dops } = await this.supabase
        .from('en13813_dops')
        .select('id')
        .eq('recipe_id', id)
        .limit(1)

      if (dops && dops.length > 0) {
        throw new Error('Recipe cannot be deleted because it is used in DoPs')
      }

      const { error } = await this.supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting recipe:', error)
      throw error
    }
  }

  async validate(id: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const recipe = await this.getById(id)
      if (!recipe) {
        return { isValid: false, errors: ['Recipe not found'] }
      }

      const errors: string[] = []

      // Required fields
      if (!recipe.recipe_code) errors.push('Recipe code is required')
      if (!recipe.name) errors.push('Name is required')
      if (!recipe.estrich_type) errors.push('Estrich type is required')
      if (!recipe.compressive_strength) errors.push('Compressive strength is required')
      if (!recipe.flexural_strength) errors.push('Flexural strength is required')

      // Validate strength classes
      const validCompressiveStrengths = ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80']
      const validFlexuralStrengths = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50']

      if (recipe.compressive_strength && !validCompressiveStrengths.includes(recipe.compressive_strength)) {
        errors.push(`Invalid compressive strength: ${recipe.compressive_strength}`)
      }

      if (recipe.flexural_strength && !validFlexuralStrengths.includes(recipe.flexural_strength)) {
        errors.push(`Invalid flexural strength: ${recipe.flexural_strength}`)
      }

      // Optional properties validation
      if (recipe.wear_resistance) {
        const validWearResistance = ['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5']
        if (!validWearResistance.includes(recipe.wear_resistance)) {
          errors.push(`Invalid wear resistance: ${recipe.wear_resistance}`)
        }
      }

      const isValid = errors.length === 0

      // Update validation status
      await this.supabase
        .from('en13813_recipes')
        .update({
          is_validated: isValid,
          validation_errors: errors
        })
        .eq('id', id)

      return { isValid, errors }
    } catch (error) {
      console.error('Error validating recipe:', error)
      throw error
    }
  }

  async activate(id: string): Promise<Recipe> {
    const validation = await this.validate(id)
    if (!validation.isValid) {
      throw new Error(`Recipe cannot be activated: ${validation.errors.join(', ')}`)
    }

    return this.update(id, { status: 'active' })
  }

  async archive(id: string): Promise<Recipe> {
    return this.update(id, { status: 'archived' })
  }

  async duplicate(id: string, newName: string): Promise<Recipe> {
    const original = await this.getById(id)
    if (!original) {
      throw new Error('Recipe not found')
    }

    const { id: _, created_at, updated_at, ...recipeData } = original
    
    return this.create({
      ...recipeData,
      name: newName,
      recipe_code: `${original.recipe_code}-COPY`,
      status: 'draft',
      is_validated: false
    })
  }
}
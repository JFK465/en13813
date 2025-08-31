// EN13813 Services Export
export { RecipeService } from './recipe.service'
export { DoPGeneratorService } from './dop-generator.service'
export { PDFGeneratorService } from './pdf-generator.service'
export { RecipeMaterialsService } from './recipe-materials.service'
export { ComplianceService } from './compliance.service'

// Re-export types
export * from '../types'

// Service factory
import { SupabaseClient } from '@supabase/supabase-js'
import { RecipeService } from './recipe.service'
import { DoPGeneratorService } from './dop-generator.service'
import { PDFGeneratorService } from './pdf-generator.service'
import { RecipeMaterialsService } from './recipe-materials.service'
import { ComplianceService } from './compliance.service'

export interface EN13813Services {
  recipes: RecipeService
  dops: DoPGeneratorService
  pdf: PDFGeneratorService
  materials: RecipeMaterialsService
  compliance: ComplianceService
}

export function createEN13813Services(supabase: SupabaseClient): EN13813Services {
  return {
    recipes: new RecipeService(supabase),
    dops: new DoPGeneratorService(supabase),
    pdf: new PDFGeneratorService(),
    materials: new RecipeMaterialsService(supabase),
    compliance: new ComplianceService(supabase)
  }
}
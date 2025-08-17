// Export all EN13813 services
export * from './recipe.service'
export * from './dop-generator.service'
export * from './test-report.service'
export * from './batch.service'
export * from './csv-import.service'
export * from './validation.service'
export * from './pdf-generator.service'

// Re-export for convenience
import { RecipeService } from './recipe.service'
import { DoPGeneratorService } from './dop-generator.service'
import { TestReportService } from './test-report.service'
import { BatchService } from './batch.service'
import { CSVImportService } from './csv-import.service'
import { EN13813ValidationService } from './validation.service'
import { PDFGeneratorService } from './pdf-generator.service'
import { SupabaseClient } from '@supabase/supabase-js'

export interface EN13813Services {
  recipes: RecipeService
  dops: DoPGeneratorService
  testReports: TestReportService
  batches: BatchService
  csvImport: CSVImportService
  validation: EN13813ValidationService
  pdfGenerator: PDFGeneratorService
}

export function createEN13813Services(supabase: SupabaseClient): EN13813Services {
  return {
    recipes: new RecipeService(supabase),
    dops: new DoPGeneratorService(supabase),
    testReports: new TestReportService(supabase),
    batches: new BatchService(supabase),
    csvImport: new CSVImportService(supabase),
    validation: new EN13813ValidationService(),
    pdfGenerator: new PDFGeneratorService()
  }
}
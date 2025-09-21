import { SupabaseClient } from '@supabase/supabase-js'

export class CSVImportService {
  constructor(private supabase: SupabaseClient) {}

  generateRecipeTemplate(): string {
    const headers = [
      'recipe_code',
      'name',
      'type',
      'compressive_strength_class',
      'flexural_strength_class',
      'status'
    ]

    const sampleData = [
      'CT-C25-F4',
      'Standard Zementestrich',
      'CT',
      'C25',
      'F4',
      'active'
    ]

    return headers.join(',') + '\n' + sampleData.join(',')
  }

  async parseCSV(content: string): Promise<any[]> {
    // Basic CSV parsing - would need proper CSV library for production
    const lines = content.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim())
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || ''
          return obj
        }, {} as any)
      })
  }

  async importRecipes(csvContent: string): Promise<{ success: number; errors: string[] }> {
    return this.importRecipesFromCSV(csvContent)
  }

  async importRecipesFromCSV(csvContent: string): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = []
    let success = 0

    try {
      const records = await this.parseCSV(csvContent)

      for (const record of records) {
        try {
          const { error } = await this.supabase
            .from('en13813_recipes')
            .insert(record)

          if (error) {
            errors.push(`Row ${success + errors.length + 1}: ${error.message}`)
          } else {
            success++
          }
        } catch (err: any) {
          errors.push(`Row ${success + errors.length + 1}: ${err.message}`)
        }
      }
    } catch (err: any) {
      errors.push(`Parse error: ${err.message}`)
    }

    return { success, errors }
  }
}
import { SupabaseClient } from '@supabase/supabase-js'
import { RecipeService, recipeSchema } from './recipe.service'
import { TestReportService, testReportSchema } from './test-report.service'
import { z } from 'zod'

export interface CSVImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
}

export class CSVImportService {
  private recipeService: RecipeService
  private testReportService: TestReportService

  constructor(private supabase: SupabaseClient) {
    this.recipeService = new RecipeService(supabase)
    this.testReportService = new TestReportService(supabase)
  }

  async importRecipesFromCSV(csvContent: string): Promise<CSVImportResult> {
    const result: CSVImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const rows = this.parseCSV(csvContent)
      const headers = rows[0]
      const dataRows = rows.slice(1)

      // Map CSV headers to recipe fields
      const headerMapping = this.getRecipeHeaderMapping(headers)

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const rowNumber = i + 2 // Account for header row

        try {
          const recipeData = this.mapRowToRecipe(row, headerMapping)
          
          // Validate data
          const validated = recipeSchema.parse(recipeData)
          
          // Create recipe
          await this.recipeService.create(validated)
          result.success++
        } catch (error: any) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error',
            data: row
          })
        }
      }
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`)
    }

    return result
  }

  async importTestReportsFromCSV(csvContent: string, recipeId?: string): Promise<CSVImportResult> {
    const result: CSVImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const rows = this.parseCSV(csvContent)
      const headers = rows[0]
      const dataRows = rows.slice(1)

      // Map CSV headers to test report fields
      const headerMapping = this.getTestReportHeaderMapping(headers)

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const rowNumber = i + 2

        try {
          const reportData = this.mapRowToTestReport(row, headerMapping, recipeId)
          
          // Validate data
          const validated = testReportSchema.parse(reportData)
          
          // Create test report
          await this.testReportService.create(validated)
          result.success++
        } catch (error: any) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error',
            data: row
          })
        }
      }
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`)
    }

    return result
  }

  private parseCSV(content: string): string[][] {
    const lines = content.trim().split('\n')
    return lines.map(line => this.parseCSVLine(line))
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  private getRecipeHeaderMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {}
    const headerMap: Record<string, string> = {
      'Code': 'recipe_code',
      'Rezeptur-Code': 'recipe_code',
      'Recipe Code': 'recipe_code',
      'Name': 'name',
      'Bezeichnung': 'name',
      'Typ': 'type',
      'Type': 'type',
      'Druckfestigkeit': 'compressive_strength_class',
      'Compressive Strength': 'compressive_strength_class',
      'Biegezugfestigkeit': 'flexural_strength_class',
      'Flexural Strength': 'flexural_strength_class',
      'Verschleißwiderstand': 'wear_resistance_class',
      'Wear Resistance': 'wear_resistance_class',
      'Brandverhalten': 'fire_class',
      'Fire Class': 'fire_class',
      'Status': 'status'
    }

    headers.forEach((header, index) => {
      const normalizedHeader = header.trim()
      const fieldName = headerMap[normalizedHeader]
      if (fieldName) {
        mapping[fieldName] = index
      }
    })

    return mapping
  }

  private getTestReportHeaderMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {}
    const headerMap: Record<string, string> = {
      'Report Number': 'report_number',
      'Bericht-Nr': 'report_number',
      'Test Type': 'test_type',
      'Prüfart': 'test_type',
      'Test Date': 'test_date',
      'Prüfdatum': 'test_date',
      'Testing Body': 'testing_body',
      'Prüfstelle': 'testing_body',
      'Notified Body': 'notified_body_number',
      'Benannte Stelle': 'notified_body_number',
      'Valid Until': 'valid_until',
      'Gültig bis': 'valid_until',
      'Compressive Strength': 'compressive_strength',
      'Druckfestigkeit': 'compressive_strength',
      'Flexural Strength': 'flexural_strength',
      'Biegezugfestigkeit': 'flexural_strength'
    }

    headers.forEach((header, index) => {
      const normalizedHeader = header.trim()
      const fieldName = headerMap[normalizedHeader]
      if (fieldName) {
        mapping[fieldName] = index
      }
    })

    return mapping
  }

  private mapRowToRecipe(row: string[], mapping: Record<string, number>): any {
    const recipe: any = {
      recipe_code: row[mapping.recipe_code] || '',
      name: row[mapping.name] || '',
      type: row[mapping.type] || 'CT',
      compressive_strength_class: row[mapping.compressive_strength_class] || 'C25',
      flexural_strength_class: row[mapping.flexural_strength_class] || 'F4',
      status: row[mapping.status] || 'draft'
    }

    // Optional fields
    if (mapping.wear_resistance_class !== undefined && row[mapping.wear_resistance_class]) {
      recipe.wear_resistance_class = row[mapping.wear_resistance_class]
    }

    if (mapping.fire_class !== undefined && row[mapping.fire_class]) {
      recipe.fire_class = row[mapping.fire_class]
    }

    return recipe
  }

  private mapRowToTestReport(row: string[], mapping: Record<string, number>, recipeId?: string): any {
    const report: any = {
      report_number: row[mapping.report_number] || '',
      test_type: this.mapTestType(row[mapping.test_type] || 'initial_type_test'),
      test_date: this.parseDate(row[mapping.test_date] || new Date().toISOString()),
      testing_body: row[mapping.testing_body] || '',
      test_results: {}
    }

    // If recipe ID is provided, use it
    if (recipeId) {
      report.recipe_id = recipeId
    }

    // Optional fields
    if (mapping.notified_body_number !== undefined && row[mapping.notified_body_number]) {
      report.notified_body_number = row[mapping.notified_body_number]
    }

    if (mapping.valid_until !== undefined && row[mapping.valid_until]) {
      report.valid_until = this.parseDate(row[mapping.valid_until])
    }

    // Parse test results
    if (mapping.compressive_strength !== undefined && row[mapping.compressive_strength]) {
      report.test_results.compressive_strength = {
        value: parseFloat(row[mapping.compressive_strength]),
        unit: 'N/mm²',
        test_method: 'EN 13892-2'
      }
    }

    if (mapping.flexural_strength !== undefined && row[mapping.flexural_strength]) {
      report.test_results.flexural_strength = {
        value: parseFloat(row[mapping.flexural_strength]),
        unit: 'N/mm²',
        test_method: 'EN 13892-2'
      }
    }

    return report
  }

  private mapTestType(value: string): string {
    const typeMap: Record<string, string> = {
      'ITT': 'initial_type_test',
      'Erstprüfung': 'initial_type_test',
      'FPC': 'factory_control',
      'Werkseigene Produktionskontrolle': 'factory_control',
      'Audit': 'audit'
    }

    return typeMap[value] || value.toLowerCase().replace(/\s+/g, '_')
  }

  private parseDate(dateString: string): string {
    try {
      // Try different date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{1,2}\.\d{1,2}\.\d{4}$/, // D.M.YYYY
      ]

      let date: Date

      if (formats[0].test(dateString)) {
        date = new Date(dateString)
      } else if (formats[1].test(dateString) || formats[3].test(dateString)) {
        const [day, month, year] = dateString.split('.')
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      } else if (formats[2].test(dateString)) {
        const [day, month, year] = dateString.split('/')
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }

      return date.toISOString()
    } catch {
      throw new Error(`Invalid date format: ${dateString}`)
    }
  }

  generateRecipeTemplate(): string {
    const headers = [
      'Rezeptur-Code',
      'Name',
      'Typ',
      'Druckfestigkeit',
      'Biegezugfestigkeit',
      'Verschleißwiderstand',
      'Brandverhalten',
      'Status'
    ]

    const examples = [
      ['CT-C25-F4', 'Zementestrich Standard', 'CT', 'C25', 'F4', 'A22', 'A1fl', 'active'],
      ['CA-C30-F5', 'Calciumsulfatestrich Premium', 'CA', 'C30', 'F5', '', 'A1fl', 'active'],
      ['CT-C35-F6-AR', 'Zementestrich Hochfest', 'CT', 'C35', 'F6', 'AR2', 'A1fl', 'draft']
    ]

    const csv = [headers, ...examples].map(row => row.join(',')).join('\n')
    return csv
  }

  generateTestReportTemplate(): string {
    const headers = [
      'Bericht-Nr',
      'Prüfart',
      'Prüfdatum',
      'Prüfstelle',
      'Benannte Stelle',
      'Gültig bis',
      'Druckfestigkeit',
      'Biegezugfestigkeit'
    ]

    const examples = [
      ['2024-001', 'ITT', '01.01.2024', 'TÜV Süd', '0123', '31.12.2026', '28.5', '5.2'],
      ['2024-002', 'FPC', '15.02.2024', 'Labor Meyer', '', '', '27.8', '5.1'],
      ['2024-003', 'Audit', '01.03.2024', 'DEKRA', '0456', '28.02.2027', '29.2', '5.3']
    ]

    const csv = [headers, ...examples].map(row => row.join(',')).join('\n')
    return csv
  }
}
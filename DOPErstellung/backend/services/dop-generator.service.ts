import { BaseService, BaseEntity } from '@/lib/core/base.service'
import { SupabaseClient } from '@supabase/supabase-js'
import { RecipeService } from './recipe.service'
import { PDFGeneratorService } from './pdf-generator.service'
import { z } from 'zod'

// Validation schemas
export const manufacturerInfoSchema = z.object({
  company_name: z.string().min(1),
  address: z.string().min(1),
  postal_code: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  authorized_person: z.string().min(1),
  authorized_person_role: z.string().min(1)
})

export const essentialCharacteristicSchema = z.object({
  characteristic: z.string(),
  performance: z.string(),
  standard: z.string().default('EN 13813')
})

export const declaredPerformanceSchema = z.object({
  essential_characteristics: z.array(essentialCharacteristicSchema),
  system: z.enum(['System 1', 'System 1+', 'System 2+', 'System 3', 'System 4']).default('System 4'),
  notified_body: z.string().optional()
})

export const dopSchema = z.object({
  recipe_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  product_name: z.string().min(1),
  intended_use: z.string().default('Estrichmörtel für die Verwendung in Gebäuden gemäß EN 13813'),
  manufacturer_info: manufacturerInfoSchema,
  declared_performance: declaredPerformanceSchema,
  prepared_by: z.string().uuid().optional(),
  approved_by: z.string().uuid().optional()
})

export interface DoP extends BaseEntity {
  recipe_id: string
  batch_id?: string
  dop_number: string
  version: number
  product_name: string
  intended_use: string
  manufacturer_info: z.infer<typeof manufacturerInfoSchema>
  declared_performance: z.infer<typeof declaredPerformanceSchema>
  prepared_by?: string
  approved_by?: string
  approval_date?: string
  pdf_document_id?: string
  ce_label_document_id?: string
  qr_code?: string
  public_url?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'revoked'
  issued_at?: string
  expires_at?: string
}

export class DoPGeneratorService extends BaseService<DoP> {
  private recipeService: RecipeService
  private pdfGenerator: PDFGeneratorService

  constructor(supabase: SupabaseClient) {
    super(supabase, 'en13813_dops')
    this.recipeService = new RecipeService(supabase)
    this.pdfGenerator = new PDFGeneratorService()
  }

  async createDoP(data: z.infer<typeof dopSchema>): Promise<DoP> {
    // Validate input
    const validated = dopSchema.parse(data)

    // Validate recipe is ready for DoP
    const validationResult = await this.recipeService.validateRecipeForDoP(validated.recipe_id)
    if (!validationResult.valid) {
      throw new Error(`Recipe not ready for DoP: ${validationResult.issues.join(', ')}`)
    }

    // Get recipe details
    const recipe = await this.recipeService.getById(validated.recipe_id)
    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Generate DoP number
    const dopNumber = await this.generateDoPNumber(recipe.type, recipe.recipe_code)

    // Build essential characteristics based on recipe
    const essentialCharacteristics = this.buildEssentialCharacteristics(recipe)

    // Create DoP
    const dop = await this.create({
      ...validated,
      dop_number: dopNumber,
      version: 1,
      declared_performance: {
        ...validated.declared_performance,
        essential_characteristics: essentialCharacteristics
      },
      status: 'draft'
    })

    return dop
  }

  private async generateDoPNumber(recipeType: string, recipeCode: string): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('generate_dop_number', { recipe_type: recipeType, recipe_code: recipeCode })

    if (error) throw error
    return data
  }

  private buildEssentialCharacteristics(recipe: any): z.infer<typeof essentialCharacteristicSchema>[] {
    const characteristics: z.infer<typeof essentialCharacteristicSchema>[] = []

    // Mandatory characteristics
    characteristics.push({
      characteristic: 'Brandverhalten',
      performance: recipe.fire_class || 'A1fl',
      standard: 'EN 13501-1'
    })

    characteristics.push({
      characteristic: 'Freisetzung ätzender Substanzen',
      performance: recipe.type,
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Wasserdurchlässigkeit',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Wasserdampfdurchlässigkeit',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Druckfestigkeit',
      performance: recipe.compressive_strength_class,
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Biegezugfestigkeit',
      performance: recipe.flexural_strength_class,
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Verschleißwiderstand',
      performance: recipe.wear_resistance_class || 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Schallabsorption',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Schallschutz',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Wärmewiderstand',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    characteristics.push({
      characteristic: 'Chemische Beständigkeit',
      performance: 'NPD',
      standard: 'EN 13813'
    })

    return characteristics
  }

  async updateDoPStatus(id: string, status: DoP['status'], approvedBy?: string): Promise<DoP> {
    const updateData: any = { status }

    if (status === 'approved' && approvedBy) {
      updateData.approved_by = approvedBy
      updateData.approval_date = new Date().toISOString()
    }

    if (status === 'published') {
      updateData.issued_at = new Date().toISOString()
      // DoPs are valid for 5 years
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 5)
      updateData.expires_at = expiryDate.toISOString()
    }

    return this.update(id, updateData)
  }

  async generatePDF(id: string): Promise<string> {
    const dop = await this.getDoPWithRelations(id)
    if (!dop) {
      throw new Error('DoP not found')
    }

    // Generate PDF using the PDF generator service
    const pdfData = {
      dop_number: dop.dop_number,
      version: dop.version,
      product_name: dop.product_name,
      recipe_code: dop.recipe.recipe_code,
      intended_use: dop.intended_use,
      manufacturer_info: dop.manufacturer_info,
      declared_performance: dop.declared_performance,
      issued_at: dop.issued_at,
      qr_code: dop.qr_code
    }

    const pdfBytes = await this.pdfGenerator.generateDoPPDF(pdfData)
    
    // Store PDF in Supabase Storage
    const fileName = `dops/${dop.dop_number}_v${dop.version}.pdf`
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Create document record
    const { data: document, error: docError } = await this.supabase
      .from('documents')
      .insert({
        title: `DoP ${dop.dop_number}`,
        type: 'dop',
        file_path: fileName,
        file_size: pdfBytes.length,
        mime_type: 'application/pdf',
        module: 'en13813'
      })
      .select()
      .single()

    if (docError) throw docError

    // Update DoP with document ID
    await this.update(id, { pdf_document_id: document.id })

    // Also generate CE label
    await this.generateCELabel(dop)

    return document.id
  }

  async generateQRCode(id: string): Promise<string> {
    const dop = await this.getById(id)
    if (!dop) {
      throw new Error('DoP not found')
    }

    // Generate public URL for DoP
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/public/dop/${dop.dop_number}`

    // Generate QR code data
    const qrData = JSON.stringify({
      dop: dop.dop_number,
      v: dop.version,
      url: publicUrl
    })

    // Update DoP with QR code and public URL
    await this.update(id, {
      qr_code: qrData,
      public_url: publicUrl
    })

    return qrData
  }

  async getDoPWithRelations(id: string) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        recipe:en13813_recipes(
          id,
          recipe_code,
          name,
          type,
          compressive_strength_class,
          flexural_strength_class,
          wear_resistance_class,
          fire_class,
          test_reports:en13813_test_reports(
            id,
            report_number,
            test_date,
            testing_body,
            notified_body_number,
            test_results
          )
        ),
        batch:en13813_batches(
          id,
          batch_number,
          production_date,
          quantity_tons,
          production_site
        ),
        prepared_by_user:profiles!prepared_by(
          id,
          full_name,
          email
        ),
        approved_by_user:profiles!approved_by(
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createNewVersion(id: string, changes: Partial<z.infer<typeof dopSchema>>): Promise<DoP> {
    const currentDoP = await this.getById(id)
    if (!currentDoP) {
      throw new Error('DoP not found')
    }

    // Create new version
    const newVersion = currentDoP.version + 1
    
    const { id: _, dop_number, version, created_at, updated_at, status, ...dopData } = currentDoP

    const newDoP = await this.create({
      ...dopData,
      ...changes,
      dop_number: currentDoP.dop_number,
      version: newVersion,
      status: 'draft'
    })

    // Mark old version as superseded
    await this.update(id, { status: 'revoked' })

    return newDoP
  }

  async listByRecipe(recipeId: string) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('recipe_id', recipeId)
      .order('version', { ascending: false })

    if (error) throw error
    return data as DoP[]
  }

  async getActiveDoPs() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        recipe:en13813_recipes(
          recipe_code,
          name,
          type
        )
      `)
      .eq('status', 'published')
      .order('issued_at', { ascending: false })

    if (error) throw error
    return data
  }

  private async generateCELabel(dop: any): Promise<string> {
    const ceData = {
      company_name: dop.manufacturer_info.company_name,
      product_name: dop.product_name,
      recipe_code: dop.recipe.recipe_code,
      year: new Date().getFullYear().toString(),
      notified_body: dop.declared_performance.notified_body,
      classification: `${dop.recipe.type}-${dop.recipe.compressive_strength_class}-${dop.recipe.flexural_strength_class}`
    }

    const ceBytes = await this.pdfGenerator.generateCELabel(ceData)
    
    // Store CE label
    const fileName = `ce-labels/${dop.dop_number}_v${dop.version}_ce.pdf`
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(fileName, ceBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Create document record
    const { data: document, error: docError } = await this.supabase
      .from('documents')
      .insert({
        title: `CE Label - ${dop.dop_number}`,
        type: 'ce_label',
        file_path: fileName,
        file_size: ceBytes.length,
        mime_type: 'application/pdf',
        module: 'en13813'
      })
      .select()
      .single()

    if (docError) throw docError

    // Update DoP with CE label document ID
    await this.update(dop.id, { ce_label_document_id: document.id })

    return document.id
  }
}
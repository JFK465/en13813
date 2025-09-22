import { SupabaseClient } from '@supabase/supabase-js'
import { DoP, Recipe, DoPGenerationParams, DoPFilter, ManufacturerData } from '../types'
import { PDFGeneratorService } from './pdf-generator.service'
import * as QRCode from 'qrcode'
import logger from '@/lib/logger'

export class DoPGeneratorService {
  private pdfGenerator: PDFGeneratorService

  constructor(private supabase: SupabaseClient) {
    this.pdfGenerator = new PDFGeneratorService()
  }

  async listDoPs(filter?: DoPFilter): Promise<DoP[]> {
    try {
      let query = this.supabase
        .from('en13813_dops')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter?.status) {
        query = query.eq('workflow_status', filter.status)
      }

      if (filter?.recipe_id) {
        query = query.eq('recipe_id', filter.recipe_id)
      }

      if (filter?.search) {
        query = query.or(`dop_number.ilike.%${filter.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Error listing DoPs', {
        filter,
        error: error as Error,
        errorCode: 'DOP_LIST_FAILED'
      })
      throw error
    }
  }

  async generatePDF(params: DoPGenerationParams): Promise<DoP> {
    try {
      const { recipeId, batchId, testReportIds = [], language = 'de' } = params

      // Get recipe
      const { data: recipe, error: recipeError } = await this.supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (recipeError || !recipe) {
        throw new Error('Recipe not found')
      }

      // Validate recipe
      if (!recipe.is_validated || recipe.status !== 'active') {
        throw new Error('Recipe must be validated and active')
      }

      // WICHTIG: Prüfe ITT-Vollständigkeit vor DOP-Erstellung
      const { data: ittComplete } = await this.supabase
        .rpc('check_itt_completeness', { recipe_uuid: recipeId })
      
      if (!ittComplete?.complete) {
        throw new Error(`ITT nicht vollständig. Fehlende Tests: ${ittComplete?.missing_tests?.join(', ')}`)
      }

      // Prüfe AVCP System basierend auf Brandklasse
      let avcpSystem = '4' // Standard System 4
      let notifiedBodyInfo = null
      
      if (recipe.fire_class && recipe.fire_class !== 'A1fl' && recipe.fire_class !== 'NPD') {
        // Bei Brandklasse != A1fl ist System 1+ erforderlich
        avcpSystem = '1'
        
        // Hole System 1+ Prüfbericht mit Notified Body
        const { data: system1Report } = await this.supabase
          .from('en13813_test_reports')
          .select('*')
          .eq('recipe_id', recipeId)
          .eq('report_type', 'System1+')
          .eq('validation_status', 'valid')
          .single()
        
        if (!system1Report || !system1Report.notified_body_number) {
          throw new Error('System 1+ Prüfbericht mit Notified Body erforderlich für Brandklasse != A1fl')
        }
        
        notifiedBodyInfo = {
          number: system1Report.notified_body_number,
          name: system1Report.notified_body_name
        }
      }

      // Get tenant/manufacturer data
      const { data: tenant } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('id', recipe.tenant_id)
        .single()

      // Generate DoP number
      const dopNumber = await this.generateDoPNumber(recipe.tenant_id)

      // Get batch if provided
      let batch = null
      if (batchId) {
        const { data: batchData } = await this.supabase
          .from('en13813_batches')
          .select('*')
          .eq('id', batchId)
          .single()
        batch = batchData
      }

      // Prepare manufacturer data
      const manufacturerData: ManufacturerData = {
        name: tenant?.name || 'Estrichwerke GmbH',
        address: tenant?.settings?.address || 'Musterstraße 1',
        postalCode: tenant?.settings?.postalCode || '12345',
        city: tenant?.settings?.city || 'Musterstadt',
        country: tenant?.settings?.country || 'Deutschland',
        phone: tenant?.settings?.phone || '+49 123 456789',
        email: tenant?.settings?.email || 'info@estrichwerke.de',
        website: tenant?.settings?.website || 'www.estrichwerke.de',
        vat_number: tenant?.settings?.vat_number,
        registration_number: tenant?.settings?.registration_number
      }

      // Prepare declared performance based on recipe
      const declaredPerformance = {
        estrich_type: recipe.binder_type,
        compressive_strength: recipe.compressive_strength_class,
        flexural_strength: recipe.flexural_strength_class,
        wear_resistance: recipe.wear_resistance_class,
        hardness: recipe.hardness,
        rolling_wheel: recipe.rolling_wheel,
        impact_resistance: recipe.impact_resistance,
        fire_class: recipe.fire_class || 'A1fl',
        emissions: recipe.emissions || {},
        additional_properties: {
          application_thickness: recipe.application_thickness_min && recipe.application_thickness_max
            ? `${recipe.application_thickness_min}-${recipe.application_thickness_max} mm`
            : null
        }
      }

      // Generate public UUID for external access
      const publicUuid = crypto.randomUUID()
      const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dop.estrichwerke.de'}/public/dop/${publicUuid}`

      // Generate QR code
      const qrCodeData = await QRCode.toDataURL(publicUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Create DoP record
      const dopData = {
        tenant_id: recipe.tenant_id,
        recipe_id: recipeId,
        batch_id: batchId,
        test_report_ids: testReportIds,
        dop_number: dopNumber,
        version: 1,
        manufacturer_data: manufacturerData,
        declared_performance: declaredPerformance,
        avcp_system: avcpSystem,
        notified_body: notifiedBodyInfo,
        qr_code_data: qrCodeData,
        public_uuid: publicUuid,
        workflow_status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year validity
        is_active: false
      }

      const { data: dop, error: dopError } = await this.supabase
        .from('en13813_dops')
        .insert(dopData)
        .select()
        .single()

      if (dopError) throw dopError

      // Generate PDF
      try {
        const pdfBytes = await this.pdfGenerator.generateDoPPDF({
          dop,
          recipe,
          manufacturer: manufacturerData,
          batch,
          language: language as 'de' | 'en' | undefined
        })

        // Store PDF reference (in real implementation, upload to storage)
        // For now, we'll just update the DoP with a placeholder
        await this.supabase
          .from('en13813_dops')
          .update({ 
            pdf_document_id: crypto.randomUUID() // Placeholder for document storage
          })
          .eq('id', dop.id)

      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        // Continue without PDF - it can be generated later
      }

      return dop
    } catch (error) {
      console.error('Error generating DoP:', error)
      throw error
    }
  }

  private async generateDoPNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    
    // Get the count of DoPs for this year
    const { count } = await this.supabase
      .from('en13813_dops')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31`)

    const sequenceNumber = String((count || 0) + 1).padStart(4, '0')
    return `DoP-${year}-${sequenceNumber}`
  }

  async updateWorkflowStatus(
    id: string, 
    status: DoP['workflow_status'],
    userId?: string
  ): Promise<DoP> {
    try {
      const updates: Partial<DoP> = {
        workflow_status: status
      }

      // Add timestamp and user based on status
      switch (status) {
        case 'submitted':
          updates.submitted_at = new Date().toISOString()
          updates.submitted_by = userId
          break
        case 'reviewed':
          updates.reviewed_at = new Date().toISOString()
          updates.reviewed_by = userId
          break
        case 'approved':
          updates.approved_at = new Date().toISOString()
          updates.approved_by = userId
          break
        case 'published':
          updates.published_at = new Date().toISOString()
          updates.is_active = true
          break
        case 'revoked':
          updates.is_active = false
          break
      }

      const { data, error } = await this.supabase
        .from('en13813_dops')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating workflow status:', error)
      throw error
    }
  }

  async createRevision(id: string): Promise<DoP> {
    try {
      // Get original DoP
      const { data: original, error: getError } = await this.supabase
        .from('en13813_dops')
        .select('*')
        .eq('id', id)
        .single()

      if (getError || !original) {
        throw new Error('Original DoP not found')
      }

      // Create new revision
      const { id: _, version, created_at, updated_at, ...dopData } = original
      
      const revision = {
        ...dopData,
        version: version + 1,
        revision_of: id,
        workflow_status: 'draft',
        is_active: false,
        submitted_at: null,
        submitted_by: null,
        reviewed_at: null,
        reviewed_by: null,
        approved_at: null,
        approved_by: null,
        published_at: null
      }

      const { data, error } = await this.supabase
        .from('en13813_dops')
        .insert(revision)
        .select()
        .single()

      if (error) throw error

      // Deactivate original
      await this.supabase
        .from('en13813_dops')
        .update({ is_active: false })
        .eq('id', id)

      return data
    } catch (error) {
      console.error('Error creating revision:', error)
      throw error
    }
  }

  async generatePackage(dopIds: string[], name: string): Promise<any> {
    try {
      // Create package record
      const { data: packageData, error } = await this.supabase
        .from('en13813_dop_packages')
        .insert({
          name,
          dop_ids: dopIds,
          download_count: 0
        })
        .select()
        .single()

      if (error) throw error

      // In real implementation, generate combined PDF here
      // For now, just return the package data
      return packageData
    } catch (error) {
      console.error('Error generating package:', error)
      throw error
    }
  }
}
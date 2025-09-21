import { SupabaseClient } from '@supabase/supabase-js'
import { 
  DoP, 
  Recipe, 
  DoPGenerationParams, 
  DoPFilter, 
  ManufacturerData,
  DeclaredPerformance,
  NotifiedBody,
  DoPValidationResult,
  DoPValidationRules
} from '../types'
import { PDFGeneratorService } from './pdf-generator-updated.service'
import { CELabelGeneratorService } from './ce-label-generator.service'
import { NotifiedBodyValidationService } from './notified-body-validation.service'
import { FPCDoPIntegrationService } from './fpc-dop-integration.service'
import * as QRCode from 'qrcode'

export class DoPGeneratorService {
  private pdfGenerator: PDFGeneratorService
  private ceGenerator: CELabelGeneratorService
  private notifiedBodyValidator: NotifiedBodyValidationService
  private fpcIntegration: FPCDoPIntegrationService

  constructor(private supabase: SupabaseClient) {
    this.pdfGenerator = new PDFGeneratorService()
    this.ceGenerator = new CELabelGeneratorService()
    this.notifiedBodyValidator = new NotifiedBodyValidationService(supabase)
    this.fpcIntegration = new FPCDoPIntegrationService(supabase)
  }

  async getDoPs(filter?: DoPFilter): Promise<DoP[]> {
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
      console.error('Error listing DoPs:', error)
      throw error
    }
  }

  async generateDoP(params: DoPGenerationParams): Promise<DoP> {
    try {
      const { 
        recipeId, 
        batchId, 
        testReportIds = [], 
        language = 'de',
        signatory,
        authorizedRepresentative,
        notifiedBody 
      } = params

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

      // Validate FPC compliance
      const fpcValidation = await this.fpcIntegration.validateFPCForDoP(recipeId)
      if (!fpcValidation.valid) {
        throw new Error(`FPC validation failed: ${fpcValidation.errors.join(', ')}`)
      }
      if (fpcValidation.warnings && fpcValidation.warnings.length > 0) {
        console.warn('FPC warnings:', fpcValidation.warnings)
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

      // Determine AVCP System based on fire class
      const avcpSystem = this.determineAVCPSystem(recipe)
      
      // Prepare and validate notified body if System 1+
      let finalNotifiedBody: NotifiedBody | undefined
      if (avcpSystem === 1) {
        if (!notifiedBody && recipe.fire_class && recipe.fire_class !== 'NPD' && recipe.fire_class !== 'A1fl') {
          throw new Error('Notified body required for System 1+ (fire class declaration)')
        }
        
        if (notifiedBody) {
          // Validate notified body
          const nbValidation = await this.notifiedBodyValidator.validateSystem1Documentation({
            notifiedBodyNumber: notifiedBody.number,
            certificateNumber: notifiedBody.certificate_number,
            testReportNumber: notifiedBody.test_report,
            testDate: notifiedBody.test_date,
            fireClass: recipe.fire_class
          })
          
          if (!nbValidation.valid) {
            throw new Error(`Notified body validation failed: ${nbValidation.errors.join(', ')}`)
          }
          
          finalNotifiedBody = notifiedBody
        }
      }

      // Prepare declared performance based on recipe
      const declaredPerformance = this.prepareDeclaredPerformance(recipe)

      // Harmonized specification
      const harmonizedSpecification = {
        standard: 'EN 13813:2002',
        title: language === 'de' 
          ? 'Estrichmörtel und Estrichmassen - Estrichmörtel - Eigenschaften und Anforderungen'
          : 'Screed material and floor screeds - Screed material - Properties and requirements'
      }

      // Generate public UUID for external access
      const publicUuid = crypto.randomUUID()
      const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dop.estrichwerke.de'}/public/dop/${publicUuid}`
      const digitalAvailabilityUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dop.estrichwerke.de'}/dop/${dopNumber}`

      // Generate QR code
      const qrCodeData = await QRCode.toDataURL(publicUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Create DoP record with FPC reference
      const dopData: Partial<DoP> = {
        tenant_id: recipe.tenant_id,
        recipe_id: recipeId,
        batch_id: batchId,
        test_report_ids: testReportIds,
        dop_number: dopNumber,
        version: 1,
        language: language,
        manufacturer_data: manufacturerData,
        authorized_representative: authorizedRepresentative,
        avcp_system: avcpSystem,
        notified_body: finalNotifiedBody,
        harmonized_specification: harmonizedSpecification,
        declared_performance: declaredPerformance,
        qr_code_data: qrCodeData,
        public_uuid: publicUuid,
        public_url: publicUrl,
        digital_availability_url: digitalAvailabilityUrl,
        retention_period: '10 years',
        retention_location: 'Digital and physical archive',
        workflow_status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year validity
        is_active: false,
        signatory: signatory,
        fpc_compliant: fpcValidation.compliant,
        fpc_audit_date: fpcValidation.lastAuditDate,
        fpc_next_audit_date: fpcValidation.nextAuditDate
      }

      // Validate DoP before saving
      const validationResult = this.validateDoP(dopData as DoP)
      if (!validationResult.valid) {
        throw new Error(`DoP validation failed: ${validationResult.errors.join(', ')}`)
      }

      const { data: dop, error: dopError } = await this.supabase
        .from('en13813_dops')
        .insert(dopData)
        .select()
        .single()

      if (dopError) throw dopError

      // Generate PDF and CE Label
      try {
        // Generate DoP PDF
        const pdfBytes = await this.pdfGenerator.generateDoPPDF({
          dop,
          recipe,
          manufacturer: manufacturerData,
          batch,
          language: language as 'de' | 'en'
        })

        // Generate CE Label
        const ceLabelBytes = await this.ceGenerator.generateCELabel({
          dop,
          recipe,
          manufacturer: manufacturerData,
          language: language as 'de' | 'en',
          productName: recipe.name,
          intendedUse: this.getIntendedUseText(recipe, language)
        })

        // Generate batch label if batch provided
        let batchLabelBytes = null
        if (batch) {
          batchLabelBytes = await this.ceGenerator.generateBatchLabel({
            dop,
            recipe,
            batchNumber: batch.batch_number,
            productionDate: batch.production_date,
            quantity: batch.quantity_tons ? `${batch.quantity_tons} t` : undefined,
            language: language as 'de' | 'en'
          })
        }

        // Store document references (in real implementation, upload to storage)
        const updates: any = {
          pdf_document_id: crypto.randomUUID(),
          ce_label_document_id: crypto.randomUUID()
        }
        
        if (batchLabelBytes) {
          updates.batch_label_document_id = crypto.randomUUID()
        }

        await this.supabase
          .from('en13813_dops')
          .update(updates)
          .eq('id', dop.id)

        // Link FPC audit to DoP if available
        if (fpcValidation.lastAuditDate) {
          const { data: audit } = await this.supabase
            .from('en13813_fpc_audits')
            .select('id')
            .eq('recipe_id', recipeId)
            .eq('audit_date', fpcValidation.lastAuditDate)
            .single()
          
          if (audit) {
            await this.fpcIntegration.linkFPCToDoP(dop.id, audit.id)
          }
        }

      } catch (pdfError) {
        console.error('Error generating documents:', pdfError)
      }

      return dop
    } catch (error) {
      console.error('Error generating DoP:', error)
      throw error
    }
  }

  private determineAVCPSystem(recipe: Recipe): 1 | 4 {
    // System 1+ required if:
    // - Fire class is declared and is not A1fl or NPD
    if (recipe.fire_class && 
        recipe.fire_class !== 'NPD' && 
        recipe.fire_class !== 'A1fl') {
      return 1
    }
    
    // Otherwise System 4
    return 4
  }

  private prepareDeclaredPerformance(recipe: Recipe): DeclaredPerformance {
    const performance: DeclaredPerformance = {
      // Korrosive Stoffe - PFLICHT
      release_of_corrosive_substances: recipe.estrich_type,
      
      // Mechanische Eigenschaften - PFLICHT
      compressive_strength_class: recipe.compressive_strength,
      flexural_strength_class: recipe.flexural_strength,
      
      // Freisetzung gefährlicher Substanzen
      release_of_dangerous_substances: 'Siehe SDS'
    }

    // Verschleißwiderstand je nach Methode
    if (recipe.wear_resistance_method === 'bohme' && recipe.wear_resistance_class) {
      performance.wear_resistance_bohme_class = recipe.wear_resistance_class
    } else if (recipe.wear_resistance_method === 'bca' && recipe.wear_resistance_class) {
      performance.wear_resistance_bca_class = recipe.wear_resistance_class
    } else if (recipe.wear_resistance_method === 'rolling_wheel' && recipe.wear_resistance_class) {
      performance.wear_resistance_rwfc_class = recipe.wear_resistance_class
    }

    // Zusätzliche mechanische Eigenschaften
    if (recipe.surface_hardness_class) {
      performance.surface_hardness_class = recipe.surface_hardness_class
    }
    if (recipe.bond_strength_class) {
      performance.bond_strength_class = recipe.bond_strength_class
    }
    if (recipe.impact_resistance_class) {
      performance.impact_resistance_class = recipe.impact_resistance_class
    }

    // Brandverhalten
    if (recipe.fire_class) {
      performance.fire_class = recipe.fire_class
    }

    // Weitere Eigenschaften (normalerweise NPD)
    performance.water_permeability = 'NPD'
    performance.water_vapour_permeability = 'NPD'
    performance.sound_insulation = 'NPD'
    performance.sound_absorption = 'NPD'
    performance.thermal_resistance = 'NPD'
    performance.chemical_resistance = 'NPD'

    // Elektrische Eigenschaften nur für AS
    if (recipe.estrich_type === 'AS') {
      performance.electrical_resistance = 'NPD' // oder Wert wenn vorhanden
    }

    return performance
  }

  validateDoP(dop: DoP, rules?: DoPValidationRules): DoPValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // CPR-Pflichtfelder
    if (!dop.dop_number) {
      errors.push('DoP-Nummer fehlt')
    }
    
    if (!dop.manufacturer_data?.name) {
      errors.push('Herstellername fehlt')
    }
    
    if (!dop.manufacturer_data?.address) {
      errors.push('Herstelleradresse fehlt')
    }
    
    if (!dop.manufacturer_data?.city) {
      errors.push('Herstellerstadt fehlt')
    }
    
    if (!dop.manufacturer_data?.country) {
      errors.push('Herstellerland fehlt')
    }

    // Harmonisierte Spezifikation
    if (!dop.harmonized_specification?.standard) {
      errors.push('Harmonisierte Norm fehlt')
    }

    // AVCP System
    if (!dop.avcp_system) {
      errors.push('AVCP-System fehlt')
    }

    // System 1+ spezifisch
    if (dop.avcp_system === 1) {
      if (!dop.notified_body?.name) {
        errors.push('Name der notifizierten Stelle fehlt (System 1+)')
      }
      if (!dop.notified_body?.number) {
        errors.push('Nummer der notifizierten Stelle fehlt (System 1+)')
      }
      if (!dop.notified_body?.task) {
        errors.push('Aufgabe der notifizierten Stelle fehlt (System 1+)')
      }
      if (rules?.requireTestReports && (!dop.test_report_ids || dop.test_report_ids.length === 0)) {
        warnings.push('Prüfberichte empfohlen für System 1+')
      }
    }

    // EN 13813 spezifische Anforderungen
    if (!dop.declared_performance?.release_of_corrosive_substances) {
      errors.push('Freisetzung korrosiver Stoffe muss deklariert werden (EN 13813)')
    }
    
    if (!dop.declared_performance?.compressive_strength_class) {
      errors.push('Druckfestigkeitsklasse fehlt')
    }
    
    if (!dop.declared_performance?.flexural_strength_class) {
      errors.push('Biegezugfestigkeitsklasse fehlt')
    }

    // Optionale Prüfungen
    if (rules?.requireBatch && !dop.batch_id) {
      warnings.push('Chargennummer empfohlen')
    }

    if (rules?.checkExpiry) {
      if (dop.expiry_date) {
        const expiryDate = new Date(dop.expiry_date)
        const today = new Date()
        if (expiryDate < today) {
          errors.push('DoP ist abgelaufen')
        } else if (expiryDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
          warnings.push('DoP läuft in weniger als 30 Tagen ab')
        }
      }
    }

    // Sprache
    if (!dop.language) {
      errors.push('Sprache der DoP fehlt')
    }

    // Unterschrift für finale DoPs
    if (dop.workflow_status === 'approved' || dop.workflow_status === 'published') {
      if (!dop.signatory?.name) {
        errors.push('Unterzeichner fehlt für genehmigte/veröffentlichte DoP')
      }
      if (!dop.signatory?.position) {
        errors.push('Position des Unterzeichners fehlt')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
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
      // Get current DoP for validation
      const { data: currentDoP } = await this.supabase
        .from('en13813_dops')
        .select('*')
        .eq('id', id)
        .single()

      if (!currentDoP) {
        throw new Error('DoP not found')
      }

      // Validate before status changes
      if (status === 'approved' || status === 'published') {
        const validation = this.validateDoP(currentDoP, {
          requireNotifiedBody: currentDoP.avcp_system === 1,
          checkExpiry: true
        })
        
        if (!validation.valid) {
          throw new Error(`Cannot ${status} DoP: ${validation.errors.join(', ')}`)
        }
      }

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
      // Validate all DoPs exist and are published
      const { data: dops, error: fetchError } = await this.supabase
        .from('en13813_dops')
        .select('*')
        .in('id', dopIds)

      if (fetchError || !dops || dops.length !== dopIds.length) {
        throw new Error('Some DoPs not found')
      }

      const unpublished = dops.filter(d => d.workflow_status !== 'published')
      if (unpublished.length > 0) {
        throw new Error('All DoPs must be published to create a package')
      }

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
      return packageData
    } catch (error) {
      console.error('Error generating package:', error)
      throw error
    }
  }

  private getIntendedUseText(recipe: Recipe, language?: string): string {
    const parts: string[] = []
    const lang = language || 'de'
    
    if (recipe.intended_use?.wearing_surface) {
      parts.push(lang === 'de' ? 'Als Nutzschicht' : 'As wearing surface')
    }
    if (recipe.intended_use?.with_flooring) {
      parts.push(lang === 'de' ? 'Unter Bodenbelägen' : 'Under floor coverings')
    }
    if (recipe.intended_use?.heated_screed) {
      parts.push(lang === 'de' ? 'Als Heizestrich' : 'As heated screed')
    }
    if (recipe.intended_use?.outdoor_use) {
      parts.push(lang === 'de' ? 'Für Außenbereiche' : 'For outdoor use')
    }
    
    if (parts.length === 0) {
      return lang === 'de' ? 'Zur Verwendung in Gebäuden' : 'For use in buildings'
    }
    
    return parts.join(', ')
  }
}
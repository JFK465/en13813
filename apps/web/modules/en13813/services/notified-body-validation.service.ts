import { SupabaseClient } from '@supabase/supabase-js'

export interface NotifiedBodyInfo {
  number: string
  name: string
  country: string
  scope: string[]
  validUntil?: string
  website?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
  details?: NotifiedBodyInfo
}

export class NotifiedBodyValidationService {
  // Official EU NANDO database notified bodies for EN 13813
  // This is a subset - in production, this would be fetched from EU API
  private static readonly NOTIFIED_BODIES: Record<string, NotifiedBodyInfo> = {
    '0672': {
      number: '0672',
      name: 'MFPA Leipzig GmbH',
      country: 'DE',
      scope: ['EN 13813', 'Fire classification', 'System 1+'],
      website: 'www.mfpa.de'
    },
    '0769': {
      number: '0769',
      name: 'Kiwa GmbH',
      country: 'DE', 
      scope: ['EN 13813', 'Fire classification', 'System 1+', 'Factory production control'],
      website: 'www.kiwa.de'
    },
    '1020': {
      number: '1020',
      name: 'VDE Testing and Certification Institute',
      country: 'DE',
      scope: ['EN 13813', 'Fire classification', 'Electrical properties'],
      website: 'www.vde.com'
    },
    '0099': {
      number: '0099',
      name: 'BM TRADA Certification Ltd',
      country: 'UK',
      scope: ['EN 13813', 'Fire classification', 'System 1+'],
      website: 'www.bmtrada.com'
    },
    '0432': {
      number: '0432',
      name: 'BRE Global Ltd',
      country: 'UK',
      scope: ['EN 13813', 'Fire classification', 'System 1+'],
      website: 'www.bregroup.com'
    },
    '1391': {
      number: '1391',
      name: 'Instytut Techniki Budowlanej',
      country: 'PL',
      scope: ['EN 13813', 'System 1+', 'Factory production control'],
      website: 'www.itb.pl'
    },
    '1301': {
      number: '1301',
      name: 'IMBiGS',
      country: 'PL',
      scope: ['EN 13813', 'Mechanical properties', 'System 1+'],
      website: 'www.imbigs.pl'
    },
    '0370': {
      number: '0370',
      name: 'AFNOR Certification',
      country: 'FR',
      scope: ['EN 13813', 'Fire classification', 'System 1+'],
      website: 'www.afnor.org'
    },
    '0679': {
      number: '0679',
      name: 'CSTB',
      country: 'FR',
      scope: ['EN 13813', 'Fire classification', 'System 1+', 'Acoustics'],
      website: 'www.cstb.fr'
    },
    '2451': {
      number: '2451',
      name: 'TÜV Rheinland',
      country: 'DE',
      scope: ['EN 13813', 'System 1+', 'Factory production control'],
      website: 'www.tuv.com'
    }
  }

  constructor(private supabase?: SupabaseClient) {}

  /**
   * Validate a notified body number against EU NANDO database
   */
  async validateNotifiedBody(
    bodyNumber: string,
    requiredScope?: string[]
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check format (4 digits)
    if (!/^\d{4}$/.test(bodyNumber)) {
      errors.push(`Invalid notified body number format: ${bodyNumber}. Must be 4 digits.`)
      return { valid: false, errors }
    }

    // Look up in database
    const bodyInfo = NotifiedBodyValidationService.NOTIFIED_BODIES[bodyNumber]
    
    if (!bodyInfo) {
      // Check if exists in custom database
      if (this.supabase) {
        const customBody = await this.checkCustomNotifiedBody(bodyNumber)
        if (customBody) {
          return {
            valid: true,
            warnings: ['Notified body found in custom database, not in EU NANDO'],
            details: customBody
          }
        }
      }
      
      errors.push(`Notified body ${bodyNumber} not found in EU NANDO database for EN 13813`)
      return { valid: false, errors }
    }

    // Check scope if required
    if (requiredScope && requiredScope.length > 0) {
      const missingScopes = requiredScope.filter(
        scope => !bodyInfo.scope.some(s => s.toLowerCase().includes(scope.toLowerCase()))
      )
      
      if (missingScopes.length > 0) {
        errors.push(
          `Notified body ${bodyNumber} (${bodyInfo.name}) is not authorized for: ${missingScopes.join(', ')}`
        )
      }
    }

    // Check validity date if present
    if (bodyInfo.validUntil) {
      const validDate = new Date(bodyInfo.validUntil)
      const today = new Date()
      
      if (validDate < today) {
        errors.push(`Notified body ${bodyNumber} certification has expired on ${bodyInfo.validUntil}`)
      } else if (validDate < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
        warnings.push(`Notified body ${bodyNumber} certification expires soon: ${bodyInfo.validUntil}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      details: bodyInfo
    }
  }

  /**
   * Validate certificate number format
   */
  validateCertificateNumber(
    certificateNumber: string,
    bodyNumber: string
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Common format: NNNN-CPR-YYYY-XXXXX
    // Where NNNN = notified body number, YYYY = year, XXXXX = sequential number
    const certPattern = new RegExp(`^${bodyNumber}-CPR-\\d{4}-\\d{3,6}$`)
    
    if (!certPattern.test(certificateNumber)) {
      // Check alternative formats
      const altPattern1 = new RegExp(`^${bodyNumber}/\\d{4}/\\d+$`) // 0672/2024/12345
      const altPattern2 = new RegExp(`^${bodyNumber}-\\d{4}-\\d+$`) // 0672-2024-12345
      
      if (!altPattern1.test(certificateNumber) && !altPattern2.test(certificateNumber)) {
        warnings.push(
          `Certificate number format may be non-standard. Expected format: ${bodyNumber}-CPR-YYYY-XXXXX`
        )
      }
    }

    // Extract year from certificate
    const yearMatch = certificateNumber.match(/\d{4}/)
    if (yearMatch) {
      const certYear = parseInt(yearMatch[0])
      const currentYear = new Date().getFullYear()
      
      if (certYear > currentYear) {
        errors.push(`Certificate year ${certYear} is in the future`)
      } else if (certYear < currentYear - 10) {
        warnings.push(`Certificate is more than 10 years old (${certYear})`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * Validate test report reference
   */
  validateTestReport(
    reportNumber: string,
    bodyNumber: string,
    testDate?: string
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if report number includes body number
    if (!reportNumber.includes(bodyNumber)) {
      warnings.push(`Test report number doesn't include notified body number ${bodyNumber}`)
    }

    // Validate test date if provided
    if (testDate) {
      const date = new Date(testDate)
      const today = new Date()
      
      if (date > today) {
        errors.push('Test date cannot be in the future')
      }
      
      // EN 13813 validity periods
      const fiveYearsAgo = new Date(today.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
      const tenYearsAgo = new Date(today.getTime() - 10 * 365 * 24 * 60 * 60 * 1000)
      
      if (date < tenYearsAgo) {
        errors.push('Test report is older than 10 years and no longer valid for EN 13813')
      } else if (date < fiveYearsAgo) {
        warnings.push('Test report is older than 5 years - consider retesting')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * Check for notified body in custom database
   */
  private async checkCustomNotifiedBody(bodyNumber: string): Promise<NotifiedBodyInfo | null> {
    if (!this.supabase) return null

    try {
      const { data, error } = await this.supabase
        .from('notified_bodies')
        .select('*')
        .eq('number', bodyNumber)
        .single()

      if (error || !data) return null

      return {
        number: data.number,
        name: data.name,
        country: data.country,
        scope: data.scope || [],
        validUntil: data.valid_until,
        website: data.website
      }
    } catch {
      return null
    }
  }

  /**
   * Get list of valid notified bodies for specific scope
   */
  getNotifiedBodiesForScope(scope: string[]): NotifiedBodyInfo[] {
    return Object.values(NotifiedBodyValidationService.NOTIFIED_BODIES)
      .filter(body => 
        scope.every(s => 
          body.scope.some(bs => bs.toLowerCase().includes(s.toLowerCase()))
        )
      )
  }

  /**
   * Validate complete System 1+ documentation
   */
  async validateSystem1Documentation(params: {
    notifiedBodyNumber: string
    certificateNumber?: string
    testReportNumber?: string
    testDate?: string
    fireClass?: string
  }): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Validate notified body
    const bodyValidation = await this.validateNotifiedBody(
      params.notifiedBodyNumber,
      ['Fire classification', 'System 1+']
    )
    
    if (!bodyValidation.valid) {
      errors.push(...bodyValidation.errors)
    }
    if (bodyValidation.warnings) {
      warnings.push(...bodyValidation.warnings)
    }

    // Validate certificate if provided
    if (params.certificateNumber) {
      const certValidation = this.validateCertificateNumber(
        params.certificateNumber,
        params.notifiedBodyNumber
      )
      
      if (!certValidation.valid) {
        errors.push(...certValidation.errors)
      }
      if (certValidation.warnings) {
        warnings.push(...certValidation.warnings)
      }
    } else if (params.fireClass && params.fireClass !== 'A1fl' && params.fireClass !== 'NPD') {
      errors.push('Certificate number is required for fire class declaration in System 1+')
    }

    // Validate test report if provided
    if (params.testReportNumber) {
      const reportValidation = this.validateTestReport(
        params.testReportNumber,
        params.notifiedBodyNumber,
        params.testDate
      )
      
      if (!reportValidation.valid) {
        errors.push(...reportValidation.errors)
      }
      if (reportValidation.warnings) {
        warnings.push(...reportValidation.warnings)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      details: bodyValidation.details
    }
  }
}
/**
 * CAPA (Corrective and Preventive Action) Service
 * EN 13813:2002 § 6.3.2.2 - Wirksamkeitsprüfung von Korrekturmaßnahmen
 *
 * KRITISCH: Implementiert die geforderte Wirksamkeitsprüfung
 */

import {
  Deviation,
  RootCauseAnalysis,
  CorrectiveAction,
  PreventiveAction,
  EffectivenessCheck,
  CAPAStatistics,
  DeviationFilter,
  DeviationValidationResult,
  ICAPAService
} from '../types/deviation.types'
import { addDays, differenceInDays, isAfter, isBefore } from 'date-fns'

export class CAPAService implements ICAPAService {
  private static instance: CAPAService

  // In-memory storage für Entwicklung
  private deviations: Map<string, Deviation> = new Map()
  private effectivenessChecks: Map<string, EffectivenessCheck[]> = new Map()

  private constructor() {}

  static getInstance(): CAPAService {
    if (!CAPAService.instance) {
      CAPAService.instance = new CAPAService()
    }
    return CAPAService.instance
  }

  /**
   * Erstellt eine neue Abweichung
   */
  async createDeviation(data: Partial<Deviation>): Promise<Deviation> {
    // Validierung
    const validation = this.validateDeviation(data)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const deviation: Deviation = {
      id: this.generateId(),
      tenant_id: data.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      deviation_number: data.deviation_number || this.generateDeviationNumber(),
      title: data.title!,
      description: data.description!,

      type: data.type || 'process',
      severity: data.severity || 'minor',
      source: data.source || 'quality_control',

      discovered_date: data.discovered_date || new Date().toISOString(),
      discovered_by: data.discovered_by!,

      status: 'open',

      recipe_id: data.recipe_id,
      batch_id: data.batch_id,
      test_report_id: data.test_report_id,

      created_by: data.created_by,
    }

    this.deviations.set(deviation.id, deviation)

    // Bei kritischen Abweichungen automatisch Sofortmaßnahmen triggern
    if (deviation.severity === 'critical') {
      await this.triggerImmediateActions(deviation)
    }

    // Prüfe auf wiederkehrende Probleme
    const similar = await this.checkRecurrence(deviation)
    if (similar.length > 0) {
      console.warn(`Found ${similar.length} similar deviations. Consider systemic issue.`)
    }

    return deviation
  }

  /**
   * Aktualisiert eine Abweichung
   */
  async updateDeviation(id: string, data: Partial<Deviation>): Promise<Deviation> {
    const deviation = this.deviations.get(id)
    if (!deviation) {
      throw new Error(`Deviation ${id} not found`)
    }

    const updated = {
      ...deviation,
      ...data,
      updated_at: new Date().toISOString(),
    }

    this.deviations.set(id, updated)
    return updated
  }

  /**
   * Führt eine Ursachenanalyse durch
   */
  async performRootCauseAnalysis(deviationId: string, analysis: RootCauseAnalysis): Promise<void> {
    const deviation = await this.getDeviation(deviationId)

    deviation.root_cause_analysis = {
      ...analysis,
      performed_at: new Date().toISOString(),
    }

    deviation.status = 'investigation'

    await this.updateDeviation(deviationId, deviation)
  }

  /**
   * Fügt eine Korrekturmaßnahme hinzu
   */
  async addCorrectiveAction(deviationId: string, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const deviation = await this.getDeviation(deviationId)

    const correctiveAction: CorrectiveAction = {
      id: this.generateId(),
      action_number: this.generateActionNumber('CA'),
      description: action.description!,
      responsible_person: action.responsible_person!,
      planned_start_date: action.planned_start_date!,
      planned_end_date: action.planned_end_date!,
      status: 'planned',
      ...action,
    }

    if (!deviation.corrective_actions) {
      deviation.corrective_actions = []
    }
    deviation.corrective_actions.push(correctiveAction)

    deviation.status = 'corrective_action'

    await this.updateDeviation(deviationId, deviation)

    // KRITISCH: Automatisch Wirksamkeitsprüfungen planen
    await this.scheduleAutomaticEffectivenessChecks(deviationId, correctiveAction)

    return correctiveAction
  }

  /**
   * Fügt eine Vorbeugemaßnahme hinzu
   */
  async addPreventiveAction(deviationId: string, action: Partial<PreventiveAction>): Promise<PreventiveAction> {
    const deviation = await this.getDeviation(deviationId)

    const preventiveAction: PreventiveAction = {
      id: this.generateId(),
      action_number: this.generateActionNumber('PA'),
      description: action.description!,
      responsible_person: action.responsible_person!,
      planned_start_date: action.planned_start_date!,
      planned_end_date: action.planned_end_date!,
      status: 'planned',
      ...action,
    }

    if (!deviation.preventive_actions) {
      deviation.preventive_actions = []
    }
    deviation.preventive_actions.push(preventiveAction)

    await this.updateDeviation(deviationId, deviation)

    return preventiveAction
  }

  /**
   * KRITISCH: Plant eine Wirksamkeitsprüfung
   * EN 13813 § 6.3.2.2 - Überprüfung der Wirksamkeit von Maßnahmen
   */
  async scheduleEffectivenessCheck(
    deviationId: string,
    check: Partial<EffectivenessCheck>
  ): Promise<EffectivenessCheck> {
    const deviation = await this.getDeviation(deviationId)

    const effectivenessCheck: EffectivenessCheck = {
      id: this.generateId(),
      check_number: this.generateCheckNumber(),
      check_type: check.check_type || 'short_term',
      check_method: check.check_method || 'test',
      planned_date: check.planned_date!,
      success_criteria: check.success_criteria || [],
      ...check,
    }

    if (!deviation.effectiveness_checks) {
      deviation.effectiveness_checks = []
    }
    deviation.effectiveness_checks.push(effectivenessCheck)

    // Speichere auch separat für schnelleren Zugriff
    if (!this.effectivenessChecks.has(deviationId)) {
      this.effectivenessChecks.set(deviationId, [])
    }
    this.effectivenessChecks.get(deviationId)!.push(effectivenessCheck)

    await this.updateDeviation(deviationId, deviation)

    return effectivenessCheck
  }

  /**
   * KRITISCH: Automatische Planung von Wirksamkeitsprüfungen
   * Gemäß EN 13813 müssen Maßnahmen auf Wirksamkeit geprüft werden
   */
  private async scheduleAutomaticEffectivenessChecks(
    deviationId: string,
    action: CorrectiveAction
  ): Promise<void> {
    const deviation = await this.getDeviation(deviationId)
    const baseDate = new Date(action.planned_end_date)

    // 1. Sofortige Prüfung (nach 7 Tagen)
    await this.scheduleEffectivenessCheck(deviationId, {
      check_type: 'immediate',
      check_method: this.determineCheckMethod(deviation),
      planned_date: addDays(baseDate, 7).toISOString(),
      success_criteria: this.generateSuccessCriteria(deviation, 'immediate'),
    })

    // 2. Kurzfristige Prüfung (nach 30 Tagen)
    await this.scheduleEffectivenessCheck(deviationId, {
      check_type: 'short_term',
      check_method: this.determineCheckMethod(deviation),
      planned_date: addDays(baseDate, 30).toISOString(),
      success_criteria: this.generateSuccessCriteria(deviation, 'short_term'),
    })

    // 3. Langfristige Prüfung (nach 90 Tagen) - nur bei kritischen/major
    if (deviation.severity === 'critical' || deviation.severity === 'major') {
      await this.scheduleEffectivenessCheck(deviationId, {
        check_type: 'long_term',
        check_method: this.determineCheckMethod(deviation),
        planned_date: addDays(baseDate, 90).toISOString(),
        success_criteria: this.generateSuccessCriteria(deviation, 'long_term'),
      })
    }
  }

  /**
   * Bestimmt die geeignete Prüfmethode basierend auf der Abweichungsart
   */
  private determineCheckMethod(deviation: Deviation): EffectivenessCheck['check_method'] {
    switch (deviation.type) {
      case 'product':
        return 'test' // Produkttests durchführen
      case 'process':
        return 'measurement' // Prozessparameter messen
      case 'system':
        return 'audit' // System-Audit
      case 'documentation':
        return 'document_review' // Dokumentenprüfung
      case 'calibration':
        return 'measurement' // Kalibrierung prüfen
      default:
        return 'observation'
    }
  }

  /**
   * Generiert Erfolgskriterien für die Wirksamkeitsprüfung
   */
  private generateSuccessCriteria(
    deviation: Deviation,
    checkType: EffectivenessCheck['check_type']
  ): EffectivenessCheck['success_criteria'] {
    const criteria: EffectivenessCheck['success_criteria'] = []

    // Basis-Kriterium: Keine Wiederholung
    criteria.push({
      description: 'Keine Wiederholung der Abweichung',
      measurable_target: '0 gleichartige Abweichungen',
      tolerance: '0',
    })

    // Typ-spezifische Kriterien
    if (deviation.type === 'product' && deviation.recipe_id) {
      criteria.push({
        description: 'Produktqualität innerhalb Spezifikation',
        measurable_target: '100% Konformität',
        tolerance: '≥ 95%',
      })
    }

    if (deviation.type === 'process') {
      criteria.push({
        description: 'Prozessstabilität nachgewiesen',
        measurable_target: 'Cpk ≥ 1,33',
        tolerance: 'Cpk ≥ 1,0',
      })
    }

    // Zeitabhängige Kriterien
    if (checkType === 'long_term') {
      criteria.push({
        description: 'Nachhaltige Verbesserung',
        measurable_target: 'Trend über 3 Monate positiv',
        tolerance: 'Keine Verschlechterung',
      })
    }

    return criteria
  }

  /**
   * KRITISCH: Durchführung einer Wirksamkeitsprüfung
   */
  async performEffectivenessCheck(
    checkId: string,
    results: EffectivenessCheck['results']
  ): Promise<void> {
    // Finde die Abweichung mit dieser Prüfung
    let targetDeviation: Deviation | undefined
    let targetCheck: EffectivenessCheck | undefined

    for (const [deviationId, deviation] of this.deviations) {
      const check = deviation.effectiveness_checks?.find(c => c.id === checkId)
      if (check) {
        targetDeviation = deviation
        targetCheck = check
        break
      }
    }

    if (!targetDeviation || !targetCheck) {
      throw new Error(`Effectiveness check ${checkId} not found`)
    }

    // Aktualisiere die Prüfung
    targetCheck.performed_date = new Date().toISOString()
    targetCheck.results = results

    // Bewerte die Wirksamkeit
    targetCheck.effectiveness_rating = this.evaluateEffectiveness(targetCheck, results)

    // Bei nicht wirksamen Maßnahmen: Follow-up erforderlich
    if (targetCheck.effectiveness_rating === 'not_effective') {
      targetCheck.follow_up_required = true
      targetCheck.follow_up_actions = [{
        description: 'Neue Ursachenanalyse durchführen und alternative Maßnahmen definieren',
        responsible: targetDeviation.created_by || 'QM',
        due_date: addDays(new Date(), 7).toISOString(),
      }]

      // Status zurücksetzen
      targetDeviation.status = 'investigation'
    } else if (targetCheck.effectiveness_rating === 'partially_effective') {
      targetCheck.follow_up_required = true
      targetCheck.follow_up_actions = [{
        description: 'Zusätzliche Maßnahmen zur vollständigen Wirksamkeit definieren',
        responsible: targetDeviation.created_by || 'QM',
        due_date: addDays(new Date(), 14).toISOString(),
      }]
    }

    // Prüfe ob alle geplanten Checks durchgeführt wurden
    const allChecksCompleted = targetDeviation.effectiveness_checks?.every(
      c => c.performed_date !== undefined
    )

    const allChecksEffective = targetDeviation.effectiveness_checks?.every(
      c => c.effectiveness_rating === 'effective'
    )

    if (allChecksCompleted) {
      if (allChecksEffective) {
        // Alle Prüfungen erfolgreich -> Abweichung kann geschlossen werden
        targetDeviation.status = 'closed'
        targetDeviation.closure = {
          closed_by: 'System',
          closed_at: new Date().toISOString(),
          closure_notes: 'Alle Wirksamkeitsprüfungen erfolgreich abgeschlossen',
          final_status: 'resolved',
        }
      } else {
        // Nicht alle Prüfungen erfolgreich -> weitere Maßnahmen erforderlich
        targetDeviation.status = 'corrective_action'
      }
    } else {
      targetDeviation.status = 'effectiveness_check'
    }

    await this.updateDeviation(targetDeviation.id, targetDeviation)
  }

  /**
   * Bewertet die Wirksamkeit basierend auf den Ergebnissen
   */
  private evaluateEffectiveness(
    check: EffectivenessCheck,
    results: EffectivenessCheck['results']
  ): 'effective' | 'partially_effective' | 'not_effective' {
    if (!results || !check.success_criteria) {
      return 'not_effective'
    }

    const totalCriteria = check.success_criteria.length
    if (totalCriteria === 0) {
      return results.criteria_met ? 'effective' : 'not_effective'
    }

    // Zähle erfüllte Kriterien basierend auf results
    let metCriteria = 0
    if (results.criteria_met) {
      metCriteria = totalCriteria // Alle erfüllt
    } else if (results.actual_values) {
      // Prüfe einzelne Kriterien
      // Hier würde normalerweise eine detaillierte Prüfung erfolgen
      metCriteria = totalCriteria * 0.5 // Beispiel: 50% erfüllt
    }

    const successRate = metCriteria / totalCriteria

    if (successRate >= 1.0) {
      return 'effective'
    } else if (successRate >= 0.7) {
      return 'partially_effective'
    } else {
      return 'not_effective'
    }
  }

  /**
   * Holt alle überfälligen Wirksamkeitsprüfungen
   */
  async getOverdueEffectivenessChecks(): Promise<EffectivenessCheck[]> {
    const overdue: EffectivenessCheck[] = []
    const now = new Date()

    for (const deviation of this.deviations.values()) {
      if (deviation.effectiveness_checks) {
        for (const check of deviation.effectiveness_checks) {
          if (!check.performed_date && isBefore(new Date(check.planned_date), now)) {
            overdue.push(check)
          }
        }
      }
    }

    return overdue
  }

  /**
   * Generiert CAPA-Statistiken
   */
  async getCAPAStatistics(): Promise<CAPAStatistics> {
    const deviations = Array.from(this.deviations.values())

    // Zähle nach Schweregrad
    const bySeverity = {
      critical: deviations.filter(d => d.severity === 'critical').length,
      major: deviations.filter(d => d.severity === 'major').length,
      minor: deviations.filter(d => d.severity === 'minor').length,
      observation: deviations.filter(d => d.severity === 'observation').length,
    }

    // Zähle nach Status
    const byStatus = {
      open: deviations.filter(d => d.status === 'open').length,
      investigation: deviations.filter(d => d.status === 'investigation').length,
      corrective_action: deviations.filter(d => d.status === 'corrective_action').length,
      effectiveness_check: deviations.filter(d => d.status === 'effectiveness_check').length,
      closed: deviations.filter(d => d.status === 'closed').length,
    }

    // Wirksamkeitsrate
    let effective = 0, partiallyEffective = 0, notEffective = 0, pending = 0
    for (const deviation of deviations) {
      if (deviation.effectiveness_checks) {
        for (const check of deviation.effectiveness_checks) {
          if (!check.performed_date) {
            pending++
          } else {
            switch (check.effectiveness_rating) {
              case 'effective': effective++; break
              case 'partially_effective': partiallyEffective++; break
              case 'not_effective': notEffective++; break
            }
          }
        }
      }
    }

    // Durchschnittliche Schließzeit
    const closedDeviations = deviations.filter(d => d.closure)
    let totalClosureTime = 0
    for (const deviation of closedDeviations) {
      if (deviation.closure) {
        totalClosureTime += differenceInDays(
          new Date(deviation.closure.closed_at),
          new Date(deviation.created_at)
        )
      }
    }
    const avgClosureTime = closedDeviations.length > 0
      ? totalClosureTime / closedDeviations.length
      : 0

    // Wiederkehrende Probleme (vereinfacht)
    const recurringIssues: CAPAStatistics['recurring_issues'] = []

    return {
      total_deviations: deviations.length,
      open_deviations: deviations.filter(d => d.status !== 'closed').length,
      overdue_actions: await this.countOverdueActions(),
      pending_effectiveness_checks: pending,
      by_severity: bySeverity,
      by_status: byStatus,
      effectiveness_rate: {
        effective,
        partially_effective: partiallyEffective,
        not_effective: notEffective,
        pending,
      },
      avg_closure_time_days: Math.round(avgClosureTime),
      recurring_issues: recurringIssues,
    }
  }

  /**
   * Zählt überfällige Aktionen
   */
  private async countOverdueActions(): Promise<number> {
    let count = 0
    const now = new Date()

    for (const deviation of this.deviations.values()) {
      if (deviation.corrective_actions) {
        for (const action of deviation.corrective_actions) {
          if (action.status !== 'completed' &&
              action.planned_end_date &&
              isBefore(new Date(action.planned_end_date), now)) {
            count++
          }
        }
      }
    }

    return count
  }

  /**
   * Validiert Deviation-Daten
   */
  validateDeviation(data: Partial<Deviation>): DeviationValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Pflichtfelder
    if (!data.title) errors.push('Titel ist erforderlich')
    if (!data.description) errors.push('Beschreibung ist erforderlich')
    if (!data.discovered_by) errors.push('Entdecker ist erforderlich')

    // Kritische Abweichungen brauchen Sofortmaßnahmen
    if (data.severity === 'critical' && !data.immediate_action) {
      errors.push('Kritische Abweichungen erfordern Sofortmaßnahmen')
    }

    // Warnungen
    if (data.type === 'product' && !data.batch_id) {
      warnings.push('Produktabweichungen sollten eine Batch-ID haben')
    }

    if (!data.root_cause_analysis) {
      warnings.push('Ursachenanalyse wird empfohlen')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Prüft auf wiederkehrende Probleme
   */
  async checkRecurrence(deviation: Partial<Deviation>): Promise<Deviation[]> {
    const similar: Deviation[] = []

    for (const existing of this.deviations.values()) {
      // Ähnliche Abweichungen finden
      if (existing.id !== deviation.id &&
          existing.type === deviation.type &&
          (existing.recipe_id === deviation.recipe_id ||
           existing.batch_id === deviation.batch_id)) {
        similar.push(existing)
      }
    }

    return similar
  }

  /**
   * Triggert Sofortmaßnahmen bei kritischen Abweichungen
   */
  private async triggerImmediateActions(deviation: Deviation): Promise<void> {
    console.log(`CRITICAL DEVIATION: ${deviation.title}`)

    // Automatische Sofortmaßnahmen
    deviation.immediate_action = {
      description: 'Automatische Sperrung der betroffenen Charge',
      taken_by: 'System',
      taken_at: new Date().toISOString(),
      batch_blocked: true,
      customer_informed: false,
      product_recalled: false,
    }

    // Benachrichtigungen würden hier gesendet
    console.log('Sending notifications to QM team...')
  }

  // Hilfsmethoden
  async getDeviation(id: string): Promise<Deviation> {
    const deviation = this.deviations.get(id)
    if (!deviation) {
      throw new Error(`Deviation ${id} not found`)
    }
    return deviation
  }

  async listDeviations(filter?: DeviationFilter): Promise<Deviation[]> {
    let deviations = Array.from(this.deviations.values())

    if (filter) {
      if (filter.status) {
        deviations = deviations.filter(d => filter.status!.includes(d.status))
      }
      if (filter.severity) {
        deviations = deviations.filter(d => filter.severity!.includes(d.severity))
      }
      if (filter.type) {
        deviations = deviations.filter(d => filter.type!.includes(d.type))
      }
      if (filter.recipe_id) {
        deviations = deviations.filter(d => d.recipe_id === filter.recipe_id)
      }
      if (filter.batch_id) {
        deviations = deviations.filter(d => d.batch_id === filter.batch_id)
      }
    }

    return deviations
  }

  async updateAction(actionId: string, data: Partial<CorrectiveAction>): Promise<void> {
    // Implementation würde die Action in der entsprechenden Deviation aktualisieren
    console.log('Updating action:', actionId, data)
  }

  async generateCAPAReport(deviationId: string): Promise<Uint8Array> {
    // PDF-Generation würde hier implementiert
    const deviation = await this.getDeviation(deviationId)
    console.log('Generating CAPA report for:', deviation.title)
    return new Uint8Array()
  }

  // ID-Generierung
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDeviationNumber(): string {
    return `DEV-${new Date().getFullYear()}-${String(this.deviations.size + 1).padStart(4, '0')}`
  }

  private generateActionNumber(prefix: string): string {
    return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  }

  private generateCheckNumber(): string {
    return `EC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  }
}

export default CAPAService
/**
 * Marking & Delivery Note Service
 * EN 13813:2002 Klausel 8 - Marking, labelling and packaging
 *
 * Pflichtangaben gemäß Klausel 8:
 * 1. Designation (EN-Bezeichnung)
 * 2. Produktname
 * 3. Menge
 * 4. Herstelldatum & Haltbarkeit
 * 5. Batch-/Produktions-Nr.
 * 6. Max. Größtkorn oder Dickenbereich
 * 7. Misch-/Verarbeitungshinweise
 * 8. H&S-Hinweise (Health & Safety)
 * 9. Hersteller/Adresse
 */

import { Recipe, Batch, DoP } from '../types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export interface DeliveryNoteData {
  // Basis-Daten
  deliveryNoteNumber: string
  deliveryDate: Date

  // Kunde
  customerName: string
  customerAddress: string
  projectName?: string
  deliveryAddress?: string

  // Produkt (aus Recipe)
  recipe: Recipe

  // Charge (aus Batch)
  batch: Batch

  // Menge
  quantity: {
    value: number
    unit: 'kg' | 't' | 'm³'
  }

  // Optional: DoP-Verknüpfung
  dopNumber?: string
  dopUrl?: string
  ceMarkingRequired: boolean

  // Zusätzliche Lieferinformationen
  vehicleNumber?: string
  driverName?: string
  loadingTime?: Date
  unloadingTime?: Date
  remarks?: string
}

export interface MarkingLabelData {
  // Pflicht gemäß EN 13813 Klausel 8
  designation: string // 1. EN 13813 CT-C25-F4 etc.
  productName: string // 2. Handelsname
  quantity: string // 3. Menge (kg, t, m³)
  productionDate: string // 4. Herstelldatum
  shelfLife?: string // 4. Haltbarkeit (optional)
  batchNumber: string // 5. Batch-Nr.
  maxGrainSize?: string // 6. Größtkorn
  layerThickness?: string // 6. Dickenbereich
  mixingInstructions: string // 7. Mischanleitung
  applicationInstructions?: string // 7. Verarbeitungshinweise
  healthSafetyInstructions: string // 8. H&S-Hinweise
  manufacturerName: string // 9. Hersteller
  manufacturerAddress: string // 9. Adresse

  // CE-Kennzeichnung (falls erforderlich)
  ceMarking?: {
    year: string // NUR die letzten 2 Ziffern (z.B. "25")
    standard: string // EN 13813
    productDescription: string // Einzeiliger Beschreibungstext
    declaredPerformance: Record<string, string>
    // KEIN AVCP-Text im CE-Block (Annex ZA.3)
  }

  // QR-Code Daten
  qrCodeData?: {
    dopUrl?: string
    batchTraceUrl?: string
    safetyDataSheetUrl?: string
  }
}

export class MarkingDeliveryNoteService {
  /**
   * Generiert komplette Marking-Label-Daten nach EN 13813 Klausel 8
   */
  static generateMarkingLabel(data: {
    recipe: Recipe
    batch: Batch
    quantity: { value: number; unit: string }
    includeCE?: boolean
  }): MarkingLabelData {
    const { recipe, batch, quantity, includeCE = false } = data

    // Formatiere Haltbarkeit
    let shelfLife: string | undefined
    if (recipe.shelf_life_months && batch.production_date) {
      const prodDate = new Date(batch.production_date)
      const expDate = new Date(prodDate)
      expDate.setMonth(expDate.getMonth() + recipe.shelf_life_months)
      shelfLife = format(expDate, 'MM/yyyy')
    }

    // Formatiere Dickenbereich
    const layerThickness = recipe.layer_thickness_range ||
      (recipe.application_thickness_min && recipe.application_thickness_max ?
        `${recipe.application_thickness_min}-${recipe.application_thickness_max} mm` :
        undefined)

    const label: MarkingLabelData = {
      // 1. Designation
      designation: recipe.en_designation || this.generateDesignation(recipe),

      // 2. Produktname
      productName: recipe.name,

      // 3. Menge
      quantity: `${quantity.value} ${quantity.unit}`,

      // 4. Herstelldatum & Haltbarkeit
      productionDate: format(new Date(batch.production_date), 'dd.MM.yyyy'),
      shelfLife,

      // 5. Batch-Nummer
      batchNumber: batch.batch_number,

      // 6. Größtkorn ODER Dickenbereich (genau eine Angabe)
      maxGrainSize: recipe.max_grain_size ? `Dmax: ${recipe.max_grain_size}` : undefined,
      layerThickness: !recipe.max_grain_size && layerThickness ? `Dickenbereich: ${layerThickness}` : undefined,

      // 7. Misch- und Verarbeitungshinweise (angepasst an Lieferform)
      mixingInstructions: recipe.mixing_instructions || this.getDefaultMixingInstructions(recipe, quantity),
      applicationInstructions: recipe.application_instructions,

      // 8. H&S-Hinweise (KRITISCH - NEU HINZUGEFÜGT)
      healthSafetyInstructions: recipe.health_safety_instructions ||
        this.getDefaultHealthSafetyInstructions(recipe),

      // 9. Hersteller
      manufacturerName: recipe.manufacturer_name || 'Hersteller GmbH',
      manufacturerAddress: recipe.manufacturer_address || 'Musterstraße 1, 12345 Musterstadt',
    }

    // CE-Kennzeichnung hinzufügen falls erforderlich
    if (includeCE) {
      label.ceMarking = this.generateCEMarkingData(recipe, batch)
    }

    // QR-Code Daten
    if (recipe.safety_data_sheet_url) {
      label.qrCodeData = {
        safetyDataSheetUrl: recipe.safety_data_sheet_url,
        batchTraceUrl: `/trace/batch/${batch.id}`,
      }
    }

    return label
  }

  /**
   * Generiert EN-Bezeichnung nach EN 13813 § 7
   */
  private static generateDesignation(recipe: Recipe): string {
    let designation = `EN 13813 ${recipe.binder_type}`
    designation += `-C${recipe.compressive_strength_class}`
    designation += `-F${recipe.flexural_strength_class}`

    // Verschleißwiderstand nur wenn als Nutzschicht
    if (recipe.intended_use?.wearing_surface && recipe.wear_resistance_class) {
      const prefix = this.getWearResistancePrefix(recipe.wear_resistance_method)
      if (prefix) {
        designation += `-${prefix}${recipe.wear_resistance_class}`
      }
    }

    return designation
  }

  private static getWearResistancePrefix(method?: string): string {
    switch (method) {
      case 'bohme': return 'A'
      case 'bca': return 'AR'
      case 'rolling_wheel': return 'RWA'
      default: return ''
    }
  }

  /**
   * Generiert Produktbeschreibung gemäß Annex ZA.3 (PFLICHT im CE-Block)
   * Einzeiliger Beschreibungstext wie in Figure ZA.1
   */
  private static getProductDescription(recipe: Recipe): string {
    // Standard-Beschreibungen nach Bindemitteltyp
    switch (recipe.binder_type) {
      case 'CT':
        return 'Cementitious screed material for use internally in buildings'
      case 'CA':
        return 'Calcium sulphate screed material for use internally in buildings'
      case 'MA':
        return 'Magnesite screed material for use internally in buildings'
      case 'AS':
        return 'Mastic asphalt screed material for use internally and externally in buildings'
      case 'SR':
        return 'Synthetic resin screed material for use internally in buildings'
      default:
        return 'Screed material for use in buildings'
    }
  }

  /**
   * Standard H&S-Hinweise für verschiedene Bindemitteltypen
   */
  private static getDefaultHealthSafetyInstructions(recipe: Recipe): string {
    const instructions: string[] = []

    // Bindemittel-spezifische Hinweise
    switch (recipe.binder_type) {
      case 'CT': // Zementestrich
        instructions.push('Enthält Zement. Reagiert mit Feuchtigkeit/Wasser stark alkalisch.')
        instructions.push('Reizt die Haut. Gefahr ernster Augenschäden.')
        instructions.push('Schutzhandschuhe/Schutzkleidung/Augenschutz/Gesichtsschutz tragen.')
        instructions.push('Bei Berührung mit den Augen sofort gründlich mit Wasser abspülen und Arzt konsultieren.')
        instructions.push('Darf nicht in die Hände von Kindern gelangen.')
        break

      case 'CA': // Calciumsulfatestrich
        instructions.push('Enthält Calciumsulfat.')
        instructions.push('Staub nicht einatmen.')
        instructions.push('Bei der Verarbeitung für gute Belüftung sorgen.')
        instructions.push('Schutzhandschuhe und Staubschutzmaske tragen.')
        break

      case 'MA': // Magnesia-Estrich
        instructions.push('Enthält Magnesiumoxid und Magnesiumchlorid.')
        instructions.push('Kann Metallkorrosion verursachen.')
        instructions.push('Hautkontakt vermeiden.')
        instructions.push('Schutzausrüstung verwenden.')
        break

      case 'AS': // Gussasphaltestrich
        instructions.push('Bei Verarbeitung entstehen heiße Dämpfe.')
        instructions.push('Verbrennungsgefahr - Schutzausrüstung tragen.')
        instructions.push('Für ausreichende Belüftung sorgen.')
        instructions.push('Nicht in die Kanalisation gelangen lassen.')
        break

      case 'SR': // Kunstharzestrich
        instructions.push('Enthält reaktive Harzsysteme.')
        instructions.push('Kann allergische Reaktionen hervorrufen.')
        instructions.push('Dämpfe nicht einatmen.')
        instructions.push('Nur in gut belüfteten Bereichen verwenden.')
        instructions.push('Hautschutz und Atemschutz verwenden.')
        break

      default:
        instructions.push('Sicherheitsdatenblatt beachten.')
        instructions.push('Schutzausrüstung verwenden.')
    }

    // Zusätzlicher Hinweis auf Sicherheitsdatenblatt
    if (recipe.safety_data_sheet_url) {
      instructions.push(`Sicherheitsdatenblatt unter: ${recipe.safety_data_sheet_url}`)
    } else {
      instructions.push('Sicherheitsdatenblatt beim Hersteller anfordern.')
    }

    return instructions.join(' ')
  }

  /**
   * Standard-Mischanleitung - angepasst an Lieferform (Bulk/Sack)
   */
  private static getDefaultMixingInstructions(recipe: Recipe, quantity?: { value: number; unit: string }): string {
    const instructions: string[] = []

    // Prüfe ob Bulk/Silo-Lieferung (Tonnen oder m³)
    const isBulkDelivery = quantity && (quantity.unit === 't' || quantity.unit === 'm³')

    switch (recipe.binder_type) {
      case 'CT':
      case 'CA':
        if (isBulkDelivery) {
          // Bulk/Silo-spezifische Anweisungen (ohne Sack-Bezug)
          instructions.push('Wasser-Zement-Wert: 0,45-0,50')
          instructions.push('Wasserzugabe: 140-160 l/m³')
        } else {
          // Sack-spezifische Anweisungen
          if (recipe.water_addition_ratio) {
            instructions.push(`Wasserzugabe: ${recipe.water_addition_ratio}`)
          } else {
            instructions.push('Wasserzugabe: 3,5-4,0 l pro 25 kg Sack')
          }
        }
        if (recipe.mixing_time_minutes) {
          instructions.push(`Mischzeit: ${recipe.mixing_time_minutes} Minuten`)
        } else {
          instructions.push('Mindestens 3 Minuten intensiv mischen')
        }
        if (recipe.pot_life_minutes) {
          instructions.push(`Verarbeitungszeit: ${recipe.pot_life_minutes} Minuten`)
        }
        instructions.push('Mit Zwangsmischer oder Freifallmischer mischen')
        break

      case 'MA':
        instructions.push('Komponenten im angegebenen Verhältnis mischen')
        instructions.push('Chloridlösung langsam zugeben')
        instructions.push('Gründlich bis zur homogenen Masse mischen')
        break

      case 'AS':
        instructions.push('Auf Verarbeitungstemperatur (220-250°C) erhitzen')
        instructions.push('Kontinuierlich rühren')
        instructions.push('Überhitzung vermeiden')
        break

      case 'SR':
        instructions.push('Komponenten A und B im angegebenen Verhältnis mischen')
        instructions.push('Intensiv mischen bis homogen')
        if (recipe.pot_life_minutes) {
          instructions.push(`Topfzeit beachten: ${recipe.pot_life_minutes} Minuten`)
        }
        break
    }

    return instructions.join('. ') + '.'
  }

  /**
   * Generiert CE-Kennzeichnungsdaten gemäß Annex ZA.3
   * WICHTIG: Kein AVCP-Text, nur die letzten 2 Ziffern des Jahres
   */
  private static generateCEMarkingData(recipe: Recipe, batch: Batch): MarkingLabelData['ceMarking'] {
    // NUR die letzten 2 Ziffern (z.B. "25" für 2025)
    const year = new Date(batch.production_date).getFullYear().toString().slice(-2)

    // Produktbeschreibung (PFLICHT gemäß Annex ZA.3)
    const productDescription = this.getProductDescription(recipe)

    const declaredPerformance: Record<string, string> = {
      // CT ist üblicherweise A1fl (CWFT gemäß 96/603/EG), nicht NPD!
      'Reaction to fire': recipe.fire_class || (recipe.binder_type === 'CT' ? 'A1fl' : 'NPD'),
      'Release of corrosive substances': recipe.binder_type,
      'Water permeability': recipe.water_permeability || 'NPD',
      'Water vapour permeability': recipe.water_vapour_permeability || 'NPD',
      'Compressive strength': `C${recipe.compressive_strength_class}`,
      'Flexural strength': `F${recipe.flexural_strength_class}`,
    }

    // Verschleißwiderstand NUR wenn "Nutzschicht ohne Belag"
    if (recipe.intended_use?.wearing_surface && !recipe.intended_use?.with_flooring &&
        recipe.wear_resistance_class && recipe.wear_resistance_method) {
      const prefix = this.getWearResistancePrefix(recipe.wear_resistance_method)
      declaredPerformance['Wear resistance'] = `${prefix}${recipe.wear_resistance_class}`
    } else {
      declaredPerformance['Wear resistance'] = 'NPD'
    }

    // Weitere optionale Eigenschaften
    if (recipe.bond_strength_class) {
      declaredPerformance['Bond strength'] = `B${recipe.bond_strength_class}`
    }

    if (recipe.impact_resistance_class) {
      declaredPerformance['Impact resistance'] = recipe.impact_resistance_class
    }

    // Weitere Merkmale mit NPD (sofern zulässig)
    if (!recipe.sound_insulation) {
      declaredPerformance['Sound insulation'] = 'NPD'
    }
    if (!recipe.sound_absorption_coefficient) {
      declaredPerformance['Sound absorption'] = 'NPD'
    }
    if (!recipe.thermal_resistance) {
      declaredPerformance['Thermal resistance'] = 'NPD'
    }
    if (!recipe.chemical_resistance_class) {
      declaredPerformance['Chemical resistance'] = 'NPD'
    }

    return {
      year,
      standard: 'EN 13813',
      productDescription, // PFLICHT: Einzeilige Beschreibung
      declaredPerformance,
      // KEIN avcp-Feld! Annex ZA.3 verlangt dies nicht im CE-Block
    }
  }

  /**
   * Generiert vollständigen Lieferschein
   */
  static generateDeliveryNote(data: DeliveryNoteData): {
    header: Record<string, any>
    customerInfo: Record<string, any>
    productInfo: Record<string, any>
    markingInfo: MarkingLabelData
    deliveryInfo: Record<string, any>
    footer: Record<string, any>
  } {
    // Generiere Marking-Label-Daten
    const markingInfo = this.generateMarkingLabel({
      recipe: data.recipe,
      batch: data.batch,
      quantity: data.quantity,
      includeCE: data.ceMarkingRequired,
    })

    return {
      // Kopfdaten
      header: {
        documentType: 'LIEFERSCHEIN',
        documentNumber: data.deliveryNoteNumber,
        date: format(data.deliveryDate, 'dd.MM.yyyy', { locale: de }),
        page: '1/1',
      },

      // Kundeninformationen
      customerInfo: {
        name: data.customerName,
        address: data.customerAddress,
        projectName: data.projectName,
        deliveryAddress: data.deliveryAddress || data.customerAddress,
      },

      // Produktinformationen
      productInfo: {
        designation: markingInfo.designation,
        productName: markingInfo.productName,
        batchNumber: markingInfo.batchNumber,
        productionDate: markingInfo.productionDate,
        quantity: markingInfo.quantity,
        dopNumber: data.dopNumber,
        dopUrl: data.dopUrl,
      },

      // EN 13813 Marking gemäß Klausel 8
      markingInfo,

      // Lieferinformationen
      deliveryInfo: {
        vehicleNumber: data.vehicleNumber,
        driverName: data.driverName,
        loadingTime: data.loadingTime ? format(data.loadingTime, 'HH:mm') : undefined,
        unloadingTime: data.unloadingTime ? format(data.unloadingTime, 'HH:mm') : undefined,
        remarks: data.remarks,
      },

      // Fußzeile
      footer: {
        manufacturerName: markingInfo.manufacturerName,
        manufacturerAddress: markingInfo.manufacturerAddress,
        disclaimer: 'Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Lieferanten.',
        signature: {
          driver: '____________________',
          recipient: '____________________',
        },
      },
    }
  }

  /**
   * Erweiterte Validierung gemäß EN 13813:2002 Klausel 8 & Annex ZA.3
   * Implementiert alle geforderten Validierungsregeln
   */
  static validateMarkingCompliance(recipe: Recipe, quantity?: { value: number; unit: string }): {
    isCompliant: boolean
    missingFields: string[]
    warnings: string[]
    validationErrors: string[]
  } {
    const missingFields: string[] = []
    const warnings: string[] = []
    const validationErrors: string[] = []

    // === PFLICHTFELDER KLAUSEL 8 ===

    // 1. EN-Bezeichnung
    if (!recipe.en_designation) {
      missingFields.push('EN-Bezeichnung (Klausel 8.1)')
    }

    // 2. Produktname
    if (!recipe.name) {
      missingFields.push('Produktname (Klausel 8.2)')
    }

    // 3. Menge wird extern geprüft

    // 4. Herstelldatum & Haltbarkeit
    if (!recipe.shelf_life_months && !recipe.storage_conditions) {
      warnings.push('Haltbarkeit/Lagerbedingungen fehlen (Klausel 8.4)')
    }

    // 5. Batch-Nummer wird extern geprüft

    // 6. Dmax ODER Dickenbereich (genau eine Angabe!)
    if (!recipe.max_grain_size && !recipe.layer_thickness_range) {
      missingFields.push('Größtkorn (Dmax) oder Dickenbereich (Klausel 8.6)')
    }
    if (recipe.max_grain_size && recipe.layer_thickness_range) {
      validationErrors.push('NUR Dmax ODER Dickenbereich angeben, nicht beides! (Klausel 8.6)')
    }

    // 7. Mischanleitung
    if (!recipe.mixing_instructions && !recipe.water_addition_ratio) {
      missingFields.push('Mischanleitung (Klausel 8.7)')
    }

    // 8. H&S-Hinweise (KRITISCH - PFLICHT!)
    if (!recipe.health_safety_instructions) {
      missingFields.push('H&S-Hinweise/Health & Safety (Klausel 8.8 - PFLICHT!)')
    }

    // 9. Hersteller
    if (!recipe.manufacturer_name) {
      missingFields.push('Herstellername (Klausel 8.9)')
    }
    if (!recipe.manufacturer_address) {
      missingFields.push('Herstelleradresse (Klausel 8.9)')
    }

    // === CE-SPEZIFISCHE VALIDIERUNG (Annex ZA.3) ===

    // Brandverhalten: CT sollte A1fl haben, nicht NPD
    if (recipe.binder_type === 'CT' && (!recipe.fire_class || recipe.fire_class === 'NPD')) {
      validationErrors.push('CT-Estriche sind üblicherweise A1fl (CWFT), nicht NPD! (Annex ZA.3)')
    }

    // Verschleißwiderstand-Validierung
    if (recipe.intended_use?.wearing_surface && !recipe.intended_use?.with_flooring) {
      // Nutzschicht ohne Belag -> GENAU EINE Methode erforderlich
      if (!recipe.wear_resistance_method || recipe.wear_resistance_method === 'none') {
        validationErrors.push('Nutzschicht ohne Belag erfordert GENAU EINE Verschleißmethode (A/AR/RWA)!')
      }
      if (!recipe.wear_resistance_class) {
        validationErrors.push('Nutzschicht ohne Belag erfordert Verschleißklasse!')
      }

      // Einheiten-Validierung
      if (recipe.wear_resistance_method === 'bohme' && recipe.wear_resistance_class) {
        // A-Klassen: A1.5 bis A22 (cm³/50 cm²)
        const validClasses = ['1.5', '3', '6', '9', '12', '15', '22']
        if (!validClasses.includes(recipe.wear_resistance_class.replace('A', ''))) {
          warnings.push('Böhme-Klasse sollte A1.5, A3, A6, A9, A12, A15 oder A22 sein')
        }
      }
    } else if (recipe.wear_resistance_method && recipe.wear_resistance_method !== 'none' && recipe.wear_resistance_method !== 'NPD') {
      // Kein Verschleiß deklarieren wenn nicht Nutzschicht ohne Belag
      validationErrors.push('Verschleißwiderstand nur bei "Nutzschicht ohne Belag" deklarieren!')
    }

    // NPD-Regeln: NPD nicht bei Schwellenwert-Eigenschaften
    if (recipe.compressive_strength_class === 'NPD') {
      validationErrors.push('Druckfestigkeit darf nicht NPD sein (Schwellenwert-Eigenschaft)!')
    }
    if (recipe.flexural_strength_class === 'NPD') {
      validationErrors.push('Biegezugfestigkeit darf nicht NPD sein (Schwellenwert-Eigenschaft)!')
    }

    // Bulk-Lieferung erkannt -> Mischhinweise anpassen
    if (quantity && (quantity.unit === 't' || quantity.unit === 'm³')) {
      if (recipe.mixing_instructions?.includes('25 kg Sack')) {
        warnings.push('Bei Bulk/Silo-Lieferung sollten Mischhinweise ohne Sack-Bezug angegeben werden')
      }
    }

    // === ZUSÄTZLICHE WARNUNGEN ===

    if (!recipe.safety_data_sheet_url) {
      warnings.push('Link zum Sicherheitsdatenblatt empfohlen')
    }

    if (!recipe.application_instructions) {
      warnings.push('Verarbeitungshinweise empfohlen')
    }

    if (!recipe.pot_life_minutes) {
      warnings.push('Verarbeitungszeit (Topfzeit) empfohlen')
    }

    // CE-Jahr Format (wird extern geprüft, hier nur Warnung)
    // AVCP sollte NICHT im CE-Block erscheinen (wird extern behandelt)

    return {
      isCompliant: missingFields.length === 0 && validationErrors.length === 0,
      missingFields,
      warnings,
      validationErrors,
    }
  }
}

export default MarkingDeliveryNoteService
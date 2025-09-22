'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services } from '@/modules/en13813/services'
import { useRouter } from 'next/navigation'
import { NormDesignationDisplay } from './NormDesignationDisplay'
import { 
  COMPRESSIVE_STRENGTH_CLASSES,
  FLEXURAL_STRENGTH_CLASSES,
  WEAR_RESISTANCE_CLASSES_BOHME,
  WEAR_RESISTANCE_CLASSES_BCA,
  WEAR_RESISTANCE_CLASSES_ROLLRAD,
  SURFACE_HARDNESS_CLASSES,
  BOND_STRENGTH_CLASSES,
  IMPACT_RESISTANCE_CLASSES,
  FIRE_CLASSES,
  BINDER_TYPES,
  RWFC_CLASSES,
  ELECTRICAL_RESISTANCE_CLASSES
} from '@/modules/en13813/constants/strength-classes'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  AlertCircle,
  AlertTriangle, 
  Plus, 
  Trash2, 
  Calculator,
  FlaskConical,
  Shield,
  Thermometer,
  Droplets,
  Droplet,
  Timer,
  Gauge,
  FileText,
  History,
  Lock,
  Unlock,
  Upload,
  Info,
  Zap,
  Link
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ========== UTILITY FUNCTIONS ==========
// Safe number coercion to avoid NaN in form
function numOrUndef(e: React.ChangeEvent<HTMLInputElement>) {
  const v = e.target.value;
  if (v === '' || v === undefined || v === null) return undefined;
  const n = e.target.type === 'number' ? e.target.valueAsNumber : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// ========== UMFASSENDES SCHEMA MIT ALLEN EN13813 ANFORDERUNGEN ==========
const ultimateRecipeSchema = z.object({
  // === GRUNDDATEN & IDENTIFIKATION ===
  recipe_uuid: z.string().uuid().optional(), // Eindeutige ID zusätzlich zum Code
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),

  // === CE-KENNZEICHNUNG & AVCP ===
  avcp_system: z.enum(['4', '3', '2+', '1+', '1']), // System 4 für CT mit A1fl "ohne Prüfung"
  notified_body_number: z.string().optional(), // 1 / 1+ / 2+ erforderlich (bei 3 nur Prüfbericht, nicht im CE-Zeichen)
  
  // === VERSIONIERUNG ===
  version: z.string(),
  status: z.enum(['draft', 'in_review', 'approved', 'active', 'locked', 'archived']),
  approved_by: z.string().optional(),
  approved_at: z.string().optional(),
  
  // === FESTIGKEITSKLASSEN ===
  compressive_strength_class: z.string(),
  flexural_strength_class: z.string(),
  
  // === PRÜFALTER ===
  test_age_days: z.number(),
  early_strength: z.boolean().default(false),
  
  // === VERSCHLEIßWIDERSTAND (NUR EINE METHODE!) ===
  wear_resistance_method: z.enum(['none', 'bohme', 'bca', 'rolling_wheel']).default('none'),
  wear_resistance_class: z.string().optional(),

  // === RWFC (Resistance to Rolling Wheel with Floor Covering) ===
  rwfc_class: z.string().optional(), // RWFC150, RWFC250, RWFC350, RWFC450, RWFC550
  
  // === ESTRICHTYP-SPEZIFISCHE PFLICHTFELDER ===
  // AS (Gussasphalt)
  indentation_class: z.string().optional(), // IC10, IC15, IC40, IC100, IP10, IP15, IP40
  heated_indicator: z.boolean().optional(), // H-Kennzeichnung
  
  // SR (Kunstharz) & allgemein verwendbar für CT/CA
  bond_strength_class: z.string().optional(), // B0.2, B0.5, B1.0, B1.5, B2.0 - Pflicht für SR (≥B1.5), optional für CT/CA
  impact_resistance_class: z.string().optional(), // (legacy) IR1, IR2, IR4, IR10, IR20
  impact_resistance_nm: z.number().optional(), // NEU: numerisch in Nm (EN ISO 6272)
  
  // MA (Magnesit) - SH ist PFLICHT bei MA!
  surface_hardness_class: z.string().optional(), // SH30, SH50, SH75, SH100, SH150, SH200
  
  // === BRANDVERHALTEN ===
  fire_class: z.string().default('A1fl'),
  smoke_class: z.string().optional(), // s1, s2
  
  // === VERWENDUNGSZWECK ===
  intended_use: z.object({
    wearing_surface: z.boolean().default(false),
    with_flooring: z.boolean().default(false),
    heated_screed: z.boolean().default(false),
    indoor_only: z.boolean().default(true),
    outdoor_use: z.boolean().default(false),
    wet_areas: z.boolean().default(false),
    industrial_use: z.boolean().default(false),
    chemical_resistance: z.boolean().default(false)
  }),
  
  // === MATERIALZUSAMMENSETZUNG ===
  materials: z.object({
    // Bindemittel
    binder_type: z.string(),
    binder_designation: z.string(), // z.B. "CEM I 42,5 R nach EN 197-1"
    binder_amount_kg_m3: z.number().min(0),
    binder_supplier: z.string().optional(),
    binder_certificate: z.string().optional(), // Konformitätsnachweis

    // === KENNZEICHNUNGSPFLICHTFELDER (EN 13813 Anforderung) ===
    batch_size_kg: z.number().optional(), // Gebindegröße/Menge
    production_date: z.string().optional(), // Herstellungsdatum
    shelf_life_months: z.number().optional(), // Haltbarkeit
    storage_conditions: z.string().optional(), // Lagerbedingungen
    
    // Zuschlagstoffe
    aggregate_type: z.enum(['natural', 'recycled', 'lightweight', 'other']).optional(),
    aggregate_designation: z.string().optional(),
    aggregate_max_size: z.string().optional(),
    aggregate_amount_kg_m3: z.number().min(0).optional(),
    aggregate_bulk_density: z.number().optional(), // kg/m³
    aggregate_moisture_content: z.number().optional(), // %
    
    // SIEBLINIE / Korngrößenverteilung
    sieve_curve: z.object({
      sizes_mm: z.array(z.number()).default([16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.063]),
      passing_percent: z.array(z.number()).default([])
    }).optional(),
    sieve_curve_file: z.string().optional(), // URL zum PDF/Excel
    
    // Wasser
    water_content: z.number().min(0).optional(),
    water_binder_ratio: z.number().min(0.2).max(1.0),
    water_quality: z.enum(['drinking', 'tested', 'certified']).default('drinking'),
    
    // Zusatzmittel
    additives: z.array(z.object({
      type: z.enum(['plasticizer', 'retarder', 'accelerator', 'air_entrainer', 'waterproofer', 'shrinkage_reducer', 'fibers', 'other']),
      name: z.string(),
      dosage_percent: z.number(),
      supplier: z.string().optional(),
      data_sheet: z.string().optional() // URL zum Datenblatt
    })).default([]),
    
    // Fasern
    fibers: z.object({
      type: z.enum(['steel', 'polymer', 'glass', 'other', 'none']),
      length_mm: z.number().optional(),
      diameter_mm: z.number().optional(),
      dosage_kg_m3: z.number().optional(),
      supplier: z.string().optional()
    }).optional(),
    
    // Pigmente (für eingefärbte Estriche)
    pigments: z.object({
      color: z.string(),
      type: z.string(),
      dosage_percent: z.number()
    }).optional()
  }),
  
  // === MISCHVORSCHRIFT ===
  mixing_procedure: z.object({
    sequence: z.array(z.string()).default(['Zuschlag', 'Bindemittel', 'Wasser', 'Zusatzmittel']),
    mixer_type: z.enum(['forced', 'free_fall', 'continuous', 'other']),
    mixing_time_dry_seconds: z.number().optional(),
    mixing_time_wet_seconds: z.number().optional(),
    mixing_speed_rpm: z.number().optional(),
    batch_size_liters: z.number().optional()
  }),
  
  // === FRISCHMÖRTEL-EIGENSCHAFTEN ===
  fresh_mortar: z.object({
    consistency_method: z.enum(['flow_table', 'slump', 'compacting_factor', 'other']),
    consistency_target: z.number().optional(),
    consistency_tolerance: z.number().optional(),
    consistency_unit: z.string().default('mm'),

    setting_time_initial_minutes: z.number().optional(),
    setting_time_final_minutes: z.number().optional(),
    setting_time_norm: z.enum(['EN 13454-2', 'EN 196-3']).default('EN 13454-2'), // EN 13454-2 ist korrekt für EN 13813

    density_kg_m3: z.number().optional(),
    air_content_percent: z.number().optional(),
    ph_value: z.number().min(0).max(14).optional(), // Pflicht nur für CA (pH ≥ 7)
    
    processing_time_minutes: z.number().optional(),
    temperature_min_celsius: z.number(),
    temperature_max_celsius: z.number()
  }),
  
  // === VERARBEITUNGSPARAMETER ===
  processing: z.object({
    layer_thickness_min_mm: z.number().optional(),
    layer_thickness_max_mm: z.number().optional(),
    application_method: z.enum(['pump', 'conventional', 'self_leveling', 'other']).optional(),
    
    substrate_preparation: z.string().optional(),
    primer_required: z.boolean().default(false),
    primer_type: z.string().optional(),
    
    curing_time_walkable_hours: z.number().optional(),
    curing_time_loadable_days: z.number().optional(),
    curing_time_coating_ready_days: z.number().optional(),
    curing_conditions: z.string().optional(),
    
    aftertreatment: z.enum(['none', 'foil', 'curing_compound', 'water', 'other']).default('none'),
    aftertreatment_duration_days: z.number().optional()
  }),
  
  // === ERWEITERTE EIGENSCHAFTEN ===
  extended_properties: z.object({
    // Mechanische Eigenschaften
    elastic_modulus_gpa: z.number().optional(),
    elastic_modulus_class: z.enum(['NPD','E1','E2','E5','E10','E15','E20']).optional(),
    shrinkage_mm_m: z.number().optional(),
    swelling_mm_m: z.number().optional(),
    creep_coefficient: z.number().optional(),
    
    // Thermische Eigenschaften (PFLICHT bei Heizestrich!)
    thermal_conductivity_w_mk: z.number().optional(),
    thermal_expansion_coefficient: z.number().optional(),
    specific_heat_capacity: z.number().optional(),
    
    // Elektrische Eigenschaften
    electrical_resistance_ohm_m: z.number().optional(),
    
    // Chemische Beständigkeit
    chemical_resistance: z.array(z.enum(['oil', 'acid', 'alkali', 'salt', 'solvent'])).default([]),
    
    // Umwelt & Gesundheit
    radioactivity_index: z.number().optional(),
    dangerous_substances: z.array(z.string()).default([]),
    tvoc_emission: z.number().optional(), // μg/m³
    formaldehyde_emission: z.string().optional() // E1, E2
  }),
  
  // === QUALITÄTSKONTROLLE / WPK / FPC ===
  quality_control: z.object({
    // Prüffrequenzen
    test_frequency_fresh: z.enum(['per_batch', 'daily', 'weekly', 'monthly']),
    test_frequency_hardened: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
    
    // Probenahme
    sample_size: z.string().optional(), // z.B. "3 Würfel je Prüfung"
    sample_location: z.string().optional(),
    retention_samples_months: z.number(),
    
    // Kalibrierung
    calibration_scales: z.enum(['monthly', 'quarterly', 'biannual', 'annual']),
    calibration_mixers: z.enum(['quarterly', 'biannual', 'annual']),
    calibration_testing: z.string(),
    
    // Toleranzen
    tolerance_binder_percent: z.number(),
    tolerance_water_percent: z.number(),
    tolerance_temperature_celsius: z.number(),
    tolerance_consistency_percent: z.number(),
    
    // Abweichungsmaßnahmen
    deviation_minor: z.string(),
    deviation_major: z.string(),
    deviation_critical: z.string(),
    
    // Akzeptanzkriterien
    acceptance_criteria: z.string()
  }),
  
  // === RÜCKVERFOLGBARKEIT ===
  traceability: z.object({
    batch_linking_enabled: z.boolean().default(true),
    supplier_certificates: z.array(z.object({
      supplier: z.string(),
      material: z.string(),
      certificate_number: z.string(),
      valid_until: z.string(),
      file_url: z.string().optional()
    })).default([]),
    customer_deliveries_tracked: z.boolean().default(true)
  }),
  
  // === ITT PRÜFPLAN ===
  itt_test_plan: z.object({
    required_tests: z.array(z.object({
      property: z.string(),
      norm: z.string(),
      test_age_days: z.number(),
      target_value: z.string().optional()
    })).default([]),
    test_laboratory: z.string().optional(),
    test_report_number: z.string().optional(),
    test_report_date: z.string().optional(),
    test_report_file: z.string().optional() // URL zum PDF
  }),
  
  // === ÄNDERUNGSHISTORIE ===
  change_log: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.array(z.string()),
    requires_retest: z.boolean(),
    approved_by: z.string()
  })).default([]),
  
  // === NOTIZEN ===
  notes: z.string().optional(),
  internal_notes: z.string().optional() // Nicht für DoP
}).superRefine((data, ctx) => {
  // NB number for 1, 1+, 2+
  if (['1', '1+', '2+'].includes(data.avcp_system) && !data.notified_body_number) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['notified_body_number'],
      message: `Notified Body Nummer ist bei AVCP System ${data.avcp_system} erforderlich`
    });
  }

  // CA requires pH ≥ 7
  if (data.type === 'CA') {
    const pH = data.fresh_mortar?.ph_value;
    if (pH == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fresh_mortar','ph_value'],
        message: 'pH-Wert ist bei Calciumsulfatestrich (CA) erforderlich'
      });
    } else if (pH < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fresh_mortar','ph_value'],
        message: 'pH-Wert muss bei CA ≥ 7 sein (EN 13813 Anforderung)'
      });
    }
  }
})

type UltimateRecipeFormValues = z.infer<typeof ultimateRecipeSchema>

// ========== HAUPTKOMPONENTE ==========
export function RecipeFormUltimate() {
  const [loading, setLoading] = useState(false)
  const [dopNumber] = useState(() => {
    // Generiere einmalig eine konsistente DoP-Nummer für diese Session
    const randomId = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    return randomId
  })
  const [currentSection, setCurrentSection] = useState(0)
  const [enDesignation, setEnDesignation] = useState('')
  const sectionRefs = useRef<HTMLDivElement[]>([])  // Für Progress Chips Navigation
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<UltimateRecipeFormValues>({
    resolver: zodResolver(ultimateRecipeSchema) as any,
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      avcp_system: '4',
      version: '1.0',
      status: 'draft',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      test_age_days: 28,
      early_strength: false,
      wear_resistance_method: 'none',
      fire_class: 'A1fl',
      intended_use: {
        wearing_surface: false,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true,
        outdoor_use: false,
        wet_areas: false,
        industrial_use: false,
        chemical_resistance: false
      },
      materials: {
        binder_type: 'CEM I 42.5 R',
        binder_designation: '',
        binder_amount_kg_m3: 320,
        water_binder_ratio: 0.5,
        water_quality: 'drinking',
        additives: [],
        sieve_curve: {
          sizes_mm: [16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.063],
          passing_percent: []
        }
      },
      mixing_procedure: {
        sequence: ['Zuschlag', 'Bindemittel', 'Wasser', 'Zusatzmittel'],
        mixer_type: 'forced'
      },
      fresh_mortar: {
        consistency_method: 'flow_table',
        consistency_unit: 'mm',
        temperature_min_celsius: 5,
        temperature_max_celsius: 30
      },
      processing: {
        aftertreatment: 'none',
        primer_required: false
      },
      extended_properties: {
        chemical_resistance: [],
        dangerous_substances: []
      },
      quality_control: {
        test_frequency_fresh: 'per_batch',
        test_frequency_hardened: 'monthly',
        calibration_scales: 'quarterly',
        calibration_mixers: 'annual',
        calibration_testing: 'as_per_manufacturer',
        tolerance_binder_percent: 2,
        tolerance_water_percent: 3,
        tolerance_temperature_celsius: 2,
        tolerance_consistency_percent: 10,
        retention_samples_months: 12,
        deviation_minor: 'Nachjustierung und Dokumentation',
        deviation_major: 'Produktion stoppen, Charge prüfen',
        deviation_critical: 'Charge sperren, Ursachenanalyse, ggf. Rückruf',
        acceptance_criteria: 'Beurteilung gemäß EN 13813 Abschnitt 9 (statistische/Einzelwert-Prüfung)'
      },
      traceability: {
        batch_linking_enabled: true,
        supplier_certificates: [],
        customer_deliveries_tracked: true
      },
      itt_test_plan: {
        required_tests: []
      },
      change_log: []
    }
  })

  const watchedValues = form.watch()
  const { fields: additiveFields, append: appendAdditive, remove: removeAdditive } = useFieldArray({
    control: form.control,
    name: 'materials.additives'
  })

  // Helper functions for validation
  const parseBondStrength = (b?: string) => {
    if (!b) return NaN;
    // "B1.5" -> 1.5
    const v = parseFloat(b.replace(/^B/, '').replace(',', '.'));
    return isNaN(v) ? NaN : v;
  };

  const irClassToNm = (cls?: string) => {
    // Legacy-Mapping für vorhandene UI-Werte
    const map: Record<string, number> = { IR1:1, IR2:2, IR4:4, IR10:10, IR20:20 };
    return cls ? (map[cls] ?? NaN) : NaN;
  };

  // EN-Bezeichnung generieren (robust ohne Duplikate)
  useEffect(() => {
    const t = watchedValues.type
    const C = watchedValues.compressive_strength_class
    const F = watchedValues.flexural_strength_class
    const testAge = watchedValues.test_age_days
    const early = watchedValues.early_strength
    const useWear = watchedValues.wear_resistance_method && watchedValues.wear_resistance_method !== 'none'
    const wear = watchedValues.wear_resistance_class
    const SH = watchedValues.surface_hardness_class
    const B = watchedValues.bond_strength_class
    const IRnm = watchedValues.impact_resistance_nm ?? irClassToNm(watchedValues.impact_resistance_class)
    const RWFC = watchedValues.rwfc_class
    const wearing = watchedValues.intended_use?.wearing_surface
    const withFloor = watchedValues.intended_use?.with_flooring

    let d = `EN 13813 ${t}`

    if (['CT','CA','MA'].includes(t)) d += `-${C}-${F}`

    if (t === 'AS') {
      if (watchedValues.indentation_class) d += `-${watchedValues.indentation_class}`
      if (watchedValues.heated_indicator) d += `-H`
    }

    if (t === 'SR') {
      if (B) d += `-${B}`
      if (useWear && wear) d += `-${wear}` // AR… oder RWA…
      if (IRnm && !isNaN(IRnm)) d += `-IR${IRnm}`
    }

    // CT/CA: optional SH
    if (['CT','CA'].includes(t) && SH && SH !== 'NPD') d += `-${SH}`

    // MA: SH nur bei Nutzschicht ohne Belag
    if (t === 'MA' && wearing && !withFloor && SH && SH !== 'NPD') d += `-${SH}`

    // CT-Nutzschicht: Verschleiß genau einmal anhängen
    if (t === 'CT' && wearing && !withFloor && useWear && wear) {
      d += `-${wear}`
    }

    // RWFC nur wenn mit Belag
    if (withFloor && RWFC && RWFC !== 'NPD') d += `-${RWFC}`

    if (early && testAge && testAge < 28) d += ` (${testAge}d)`

    setEnDesignation(d)
  }, [watchedValues])

  // W/B-Wert automatisch berechnen
  useEffect(() => {
    if (watchedValues.materials?.water_content && watchedValues.materials?.binder_amount_kg_m3) {
      const ratio = watchedValues.materials.water_content / watchedValues.materials.binder_amount_kg_m3
      form.setValue('materials.water_binder_ratio', Math.round(ratio * 1000) / 1000)
    }
  }, [watchedValues.materials?.water_content, watchedValues.materials?.binder_amount_kg_m3, form])

  // SR + Böhme Konflikt automatisch korrigieren
  useEffect(() => {
    if (watchedValues.type === 'SR' && watchedValues.wear_resistance_method === 'bohme') {
      // Bei SR ist nur BCA oder Rolling Wheel zulässig, nicht Böhme
      form.setValue('wear_resistance_method', 'bca')
      form.setValue('wear_resistance_class', undefined)  // Reset class too
      toast({
        title: 'Verschleißwiderstand angepasst',
        description: 'Böhme ist für Kunstharzestrich (SR) nicht zulässig. Automatisch auf BCA umgestellt.',
      })
    }
  }, [watchedValues.type, watchedValues.wear_resistance_method, form])

  // Clear RWFC when "with flooring" is turned off
  useEffect(() => {
    if (!watchedValues.intended_use?.with_flooring && watchedValues.rwfc_class) {
      form.setValue('rwfc_class', undefined)
    }
  }, [watchedValues.intended_use?.with_flooring, watchedValues.rwfc_class, form])

  // Estrichtyp-spezifische Validierung
  const validateTypeSpecificFields = () => {
    const type = watchedValues.type
    const errors: string[] = []

    // Pflichtfelder für CT/CA/MA - Druckfestigkeit und Biegezugfestigkeit
    if (['CT', 'CA', 'MA'].includes(type)) {
      if (!watchedValues.compressive_strength_class) {
        errors.push(`Druckfestigkeit ist bei ${type} erforderlich`)
      }
      if (!watchedValues.flexural_strength_class) {
        errors.push(`Biegezugfestigkeit ist bei ${type} erforderlich`)
      }
      // NPD ist bei diesen Eigenschaften NICHT erlaubt
      if (watchedValues.compressive_strength_class === 'NPD') {
        errors.push(`Druckfestigkeit darf bei ${type} nicht NPD sein`)
      }
      if (watchedValues.flexural_strength_class === 'NPD') {
        errors.push(`Biegezugfestigkeit darf bei ${type} nicht NPD sein`)
      }
    }

    // MA: SH nur pflichtig bei Nutzschicht ohne Belag (≥ SH30 sinnvoll)
    if (type === 'MA' && watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring) {
      if (!watchedValues.surface_hardness_class || watchedValues.surface_hardness_class === 'NPD') {
        errors.push('MA-Nutzschicht: Oberflächenhärte (SH) deklarieren (nicht NPD)')
      }
    }

    // AS spezifisch - Eindrückklasse ist PFLICHT
    if (type === 'AS' && !watchedValues.indentation_class) {
      errors.push('Eindrückklasse (IC/IP) ist bei Gussasphaltestrich (AS) erforderlich')
    }

    // SR: B ist Pflicht und muss ≥ B1.5 sein
    if (type === 'SR') {
      const bVal = parseBondStrength(watchedValues.bond_strength_class)
      if (!watchedValues.bond_strength_class || isNaN(bVal)) {
        errors.push('SR: Verbundfestigkeit (B) ist erforderlich')
      } else if (bVal < 1.5) {
        errors.push('SR: Verbundfestigkeit mindestens B1.5')
      }
    }

    // Heizestrich – λ empfehlenswert, aber nicht harte Normpflicht
    if (watchedValues.intended_use?.heated_screed && !watchedValues.extended_properties?.thermal_conductivity_w_mk) {
      // Hinweis statt Fehler
      console.warn('Hinweis: Heizestrich – Wärmeleitfähigkeit λ angeben (empfohlen)')
    }

    // Verschleißpflicht nur differenziert:
    // CT: bei Nutzschicht ohne Belag -> Verschleiß (A/AR/RWA) deklarieren
    if (type === 'CT' &&
        watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring) {
      if (!watchedValues.wear_resistance_method || watchedValues.wear_resistance_method === 'none') {
        errors.push('CT-Nutzschicht: Verschleiß-Prüfmethode wählen (A/AR/RWA)')
      } else if (!watchedValues.wear_resistance_class) {
        errors.push('CT-Nutzschicht: Verschleiß-Klasse angeben')
      }
    }
    // SR: bei Nutzschicht ohne Belag -> AR oder RWA zulässig (Böhme nicht)
    if (type === 'SR' &&
        watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring) {
      if (watchedValues.wear_resistance_method === 'bohme') {
        errors.push('SR: Böhme ist nicht zulässig – AR (BCA) oder RWA (Rollrad) wählen')
      }
    }

    // SR: Impact (IR) bei Nutzschicht deklarieren (≥ 4 Nm)
    if (type === 'SR' &&
        watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring) {
      const irNm = watchedValues.impact_resistance_nm ??
                   irClassToNm(watchedValues.impact_resistance_class)
      if (!irNm || isNaN(irNm)) {
        errors.push('SR-Nutzschicht: Schlagfestigkeit (Nm) angeben')
      } else if (irNm < 4) {
        errors.push('SR-Nutzschicht: Schlagfestigkeit mindestens 4 Nm')
      }
    }

    // RWFC bei mit Bodenbelag – optional (nur Hinweis, keine Pflicht)

    // pH-Wert für CA - PFLICHT und muss ≥ 7 sein
    if (type === 'CA') {
      if (!watchedValues.fresh_mortar?.ph_value) {
        errors.push('pH-Wert ist bei Calciumsulfatestrich (CA) erforderlich')
      } else if (watchedValues.fresh_mortar.ph_value < 7) {
        errors.push('pH-Wert muss bei CA ≥ 7 sein (EN 13813 Anforderung)')
      }
    }

    // AVCP System Validierung - NB-Nummer bei System 1, 1+, 2+
    if ((watchedValues.avcp_system === '1' || watchedValues.avcp_system === '1+' || watchedValues.avcp_system === '2+')
        && !watchedValues.notified_body_number) {
      errors.push(`Notified Body Nummer ist bei AVCP System ${watchedValues.avcp_system} erforderlich (erscheint im CE-Zeichen)`)
    }

    // Automatische AVCP System 4 Regel für CT mit A1fl
    if (type === 'CT' && watchedValues.fire_class === 'A1fl' &&
        watchedValues.avcp_system && watchedValues.avcp_system !== '4') {
      console.log('Hinweis: CT mit A1fl "ohne Prüfung" sollte normalerweise System 4 verwenden')
    }

    return errors
  }

  // ITT-Tests automatisch generieren
  // ITT-Tests automatisch generieren basierend auf Formularwerten
  const buildITTTests = (data: UltimateRecipeFormValues) => {
    const tests: any[] = []
    const type = data.type

    // Grundlegende mechanische Tests
    if (['CT','CA','MA'].includes(type)) {
      tests.push(
        { property: 'Druckfestigkeit', norm: 'EN 13892-2', test_age_days: data.test_age_days || 28 },
        { property: 'Biegezugfestigkeit', norm: 'EN 13892-2', test_age_days: data.test_age_days || 28 }
      )
    }

    // Verschleißwiderstand
    if (data.wear_resistance_method && data.wear_resistance_method !== 'none') {
      const norms = { bohme: 'EN 13892-3', bca: 'EN 13892-4', rolling_wheel: 'EN 13892-5' } as const
      const m = data.wear_resistance_method
      if (type === 'SR' && m === 'bohme') {
        // SR: Böhme nicht zulässig, überspringen
      } else {
        tests.push({ property: `Verschleißwiderstand (${m})`, norm: norms[m], test_age_days: 28 })
      }
    }

    // Zusätzliche Tests basierend auf Eigenschaften
    if (data.bond_strength_class) {
      tests.push({ property: 'Haftzugfestigkeit', norm: 'EN 13892-8', test_age_days: 28 })
    }

    if (data.surface_hardness_class) {
      tests.push({ property: 'Oberflächenhärte', norm: 'EN 13892-6', test_age_days: 28 })
    }

    if (data.impact_resistance_nm) {
      tests.push({ property: 'Stoßfestigkeit', norm: 'EN ISO 6272', test_age_days: 28 })
    }

    if (data.rwfc_class && data.rwfc_class !== 'NPD') {
      tests.push({ property: 'RWFC Widerstand', norm: 'EN 13892-7', test_age_days: 28 })
    }

    if (data.fire_class && data.fire_class !== 'A1fl') {
      tests.push({ property: 'Brandverhalten', norm: 'EN 13501-1', test_age_days: 0 })
    }

    return tests
  }

  // ITT-Tests manuell generieren (für Button)
  const generateITTTests = () => {
    const tests = buildITTTests(watchedValues)
    form.setValue('itt_test_plan.required_tests', tests)
  }

  async function onSubmit(data: UltimateRecipeFormValues) {
    // Validierung
    const errors = validateTypeSpecificFields()
    if (errors.length > 0) {
      toast({
        title: 'Validierungsfehler',
        description: errors.join(', '),
        variant: 'destructive'
      })
      return
    }

    // Automatisch ITT-Tests generieren bevor die Rezeptur gespeichert wird
    const generatedTests = buildITTTests(data)
    if (generatedTests.length > 0) {
      // Füge generierte Tests zu den bestehenden hinzu (ohne Duplikate)
      const existingTests = data.itt_test_plan?.required_tests || []
      const mergedTests = [...existingTests]

      generatedTests.forEach(newTest => {
        const exists = existingTests.some(t =>
          t.property === newTest.property && t.norm === newTest.norm
        )
        if (!exists) {
          mergedTests.push(newTest)
        }
      })

      data.itt_test_plan = {
        ...data.itt_test_plan,
        required_tests: mergedTests
      }
    }

    setLoading(true)
    try {
      // Rezeptur mit allen Daten erstellen
      const recipe = await services.recipes.create({
        ...data,
        en_designation: enDesignation,
        recipe_uuid: crypto.randomUUID()
      } as any)

      // Materialzusammensetzung speichern
      await services.materials.create({
        recipe_id: recipe.id,
        ...data.materials
      } as any)

      // ITT-Plan erstellen
      await services.compliance.createITTPlan({
        recipe_id: recipe.id,
        required_tests: data.itt_test_plan.required_tests,
        test_status: 'pending'
      } as any)

      // FPC-Plan erstellen
      await services.compliance.createFPCPlan({
        recipe_id: recipe.id,
        ...data.quality_control
      } as any)

      // Compliance-Tasks erstellen
      await services.compliance.createAutomaticTasks(recipe.id)

      toast({
        title: 'Erfolg',
        description: 'Rezeptur wurde vollständig erstellt mit allen EN 13813 Anforderungen'
      })
      
      router.push(`/en13813/recipes/${recipe.id}`)
    } catch (error: any) {
      console.error('Error creating recipe:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Rezeptur konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    'Grunddaten',
    'Festigkeitsklassen',
    'Verwendungszweck',
    'Materialzusammensetzung',
    'Sieblinie',
    'Mischvorschrift',
    'Frischmörtel',
    'Verarbeitung',
    'Erweiterte Eigenschaften',
    'Qualitätskontrolle',
    'Rückverfolgbarkeit',
    'Versionierung'
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* EN-Bezeichnung Preview */}
        {enDesignation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generierte EN-Bezeichnung</CardTitle>
                <Badge variant="secondary" className="text-lg px-3 py-1 font-mono">
                  {enDesignation}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Fortschrittsanzeige */}
        <Card>
          <CardHeader>
            <CardTitle>Formular-Fortschritt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => (
                <Badge
                  key={index}
                  variant={currentSection === index ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrentSection(index)
                    sectionRefs.current[index]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }}
                >
                  {index + 1}. {section}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 1: GRUNDDATEN & IDENTIFIKATION === */}
        <Card ref={(el) => { if (el) sectionRefs.current[0] = el }}>
          <CardHeader>
            <CardTitle>1. Grunddaten & Identifikation</CardTitle>
            <CardDescription>
              Eindeutige Identifikation und Versionierung der Rezeptur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="recipe_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rezeptur-Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. CT-C25-F4-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Eindeutiger interner Code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estrich-Typ*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CT">CT - Zementestrich</SelectItem>
                        <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                        <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                        <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                        <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Entwurf
                          </div>
                        </SelectItem>
                        <SelectItem value="in_review">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            In Prüfung
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Freigegeben
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Unlock className="h-4 w-4" />
                            Aktiv
                          </div>
                        </SelectItem>
                        <SelectItem value="locked">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Gesperrt
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">Archiviert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bezeichnung*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="z.B. Zementestrich Standard für Wohnbereich" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EN-Bezeichnung LIVE */}
            <NormDesignationDisplay
              binderType={watchedValues.type}
              compressiveClass={watchedValues.compressive_strength_class}
              flexuralClass={watchedValues.flexural_strength_class}
              wearResistanceClass={watchedValues.wear_resistance_class}
              surfaceHardnessClass={watchedValues.surface_hardness_class}
              bondStrengthClass={watchedValues.bond_strength_class}
              impactResistanceClass={watchedValues.impact_resistance_class}
            />
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium">EN 13813 Bezeichnung (automatisch generiert)</Label>
              <p className="text-lg font-mono font-semibold mt-2 text-blue-900">
                {enDesignation}
              </p>
            </div>

            <Separator />

            {/* AVCP System und CE-Kennzeichnung */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                CE-Kennzeichnung & AVCP System
              </h3>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {watchedValues.type === 'CT' && watchedValues.fire_class === 'A1fl' && (
                    <span>
                      <strong>System 4</strong>: Zementestrich mit Brandklasse A1fl &quot;ohne Prüfung&quot; erfordert
                      <strong> kein Notified Body</strong>. Nur bei speziellen Brandklassen oder Zusatzstoffen
                      sind System 1 oder 3 erforderlich.
                    </span>
                  )}
                  {watchedValues.type === 'CA' && (
                    <span>
                      <strong>System 4</strong>: Calciumsulfatestrich mit üblicher Zusammensetzung.
                      Nur bei speziellen Anforderungen System 1 oder 3.
                    </span>
                  )}
                  {['MA', 'SR', 'AS'].includes(watchedValues.type) && (
                    <span>
                      Je nach Brandklasse und Verwendungszweck: System 1, 3 oder 4.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="avcp_system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AVCP System*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="4">System 4 (Herstellererklärung)</SelectItem>
                          <SelectItem value="3">System 3 (Reaktion-auf-Feuer durch notifizierte Prüfstelle, keine NB-Nr. im CE)</SelectItem>
                          <SelectItem value="2+">System 2+ (Werkseigene Produktionskontrolle mit notifizierter Stelle)</SelectItem>
                          <SelectItem value="1+">System 1+ (Produktzertifizierung mit Audit-Tests)</SelectItem>
                          <SelectItem value="1">System 1 (Zertifizierung notifizierte Stelle, NB-Nr. im CE)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Gem. Tabelle ZA.2 der EN 13813
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notified_body_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Notified Body Nr.
                        {(watchedValues.avcp_system === '1' || watchedValues.avcp_system === '1+' || watchedValues.avcp_system === '2+') && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            watchedValues.avcp_system === '1' || watchedValues.avcp_system === '1+'
                              ? "z.B. 1234 (4-stellig, erscheint im CE-Zeichen)"
                              : watchedValues.avcp_system === '2+'
                              ? "z.B. 1234 (4-stellig, erscheint im CE-Zeichen)"
                              : watchedValues.avcp_system === '3'
                              ? "Nicht im CE-Zeichen (nur Prüfbericht)"
                              : "Nicht erforderlich bei System 4"
                          }
                          {...field}
                          disabled={watchedValues.avcp_system === '4'}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchedValues.avcp_system === '4'
                          ? "Kein Notified Body bei System 4"
                          : watchedValues.avcp_system === '3'
                          ? "NB erstellt Prüfbericht, Nr. nicht im CE"
                          : "4-stellige Kennnummer (im CE-Zeichen)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Freigabe-Informationen */}
            {watchedValues.status === 'approved' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <FormField
                  control={form.control}
                  name="approved_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Freigegeben von</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="approved_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Freigabedatum</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* === SECTION 2: FESTIGKEITSKLASSEN & PRÜFALTER === */}
        <Card ref={(el) => { if (el) sectionRefs.current[1] = el }}>
          <CardHeader>
            <CardTitle>2. Festigkeitsklassen & Prüfalter</CardTitle>
            <CardDescription>
              Mechanische Eigenschaften und Prüfzeitpunkt nach EN 13813
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prüfalter */}
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <h3 className="font-medium">Prüfalter</h3>
              <FormField
                control={form.control}
                name="early_strength"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Frühfestigkeit (Prüfung vor 28 Tagen)
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              {watchedValues.early_strength && (
                <FormField
                  control={form.control}
                  name="test_age_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prüfalter (Tage)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="27"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormDescription>
                        Das Prüfalter wird in der EN-Bezeichnung angegeben: {enDesignation}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Festigkeitsklassen für CT/CA/MA */}
            {['CT', 'CA', 'MA'].includes(watchedValues.type) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compressive_strength_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Druckfestigkeitsklasse*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPRESSIVE_STRENGTH_CLASSES.map(cls => (
                            <SelectItem key={cls.value} value={cls.value}>
                              {cls.label} ({cls.strength} N/mm²)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nach EN 13892-2 ({watchedValues.test_age_days || 28} Tage)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flexural_strength_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biegezugfestigkeitsklasse*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FLEXURAL_STRENGTH_CLASSES.map(cls => (
                            <SelectItem key={cls.value} value={cls.value}>
                              {cls.label} ({cls.strength} N/mm²)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nach EN 13892-2 ({watchedValues.test_age_days || 28} Tage)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Separator />

            {/* ESTRICHTYP-SPEZIFISCHE PFLICHTFELDER */}
            
            {/* AS (Gussasphalt) - Eindrückklasse PFLICHT */}
            {watchedValues.type === 'AS' && (
              <div className="p-4 bg-orange-50 rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Gussasphalt-spezifische Eigenschaften (Pflicht)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="indentation_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eindrückklasse (IC/IP)*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pflicht bei AS" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IC10">IC10</SelectItem>
                            <SelectItem value="IC15">IC15</SelectItem>
                            <SelectItem value="IC40">IC40</SelectItem>
                            <SelectItem value="IC100">IC100</SelectItem>
                            <SelectItem value="IP10">IP10</SelectItem>
                            <SelectItem value="IP15">IP15</SelectItem>
                            <SelectItem value="IP40">IP40</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13813 für Gussasphalt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heated_indicator"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Heizestrich (H-Kennzeichnung)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* SR (Kunstharz) - Verbundfestigkeit PFLICHT */}
            {watchedValues.type === 'SR' && (
              <div className="p-4 bg-purple-50 rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Kunstharz-spezifische Eigenschaften
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bond_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verbundfestigkeit (B-Klasse)*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pflicht bei SR" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {watchedValues.type === 'SR' ? (
                              <>
                                {BOND_STRENGTH_CLASSES.filter(cls => cls.value === 'B1.5' || cls.value === 'B2.0').map(cls => (
                                  <SelectItem key={cls.value} value={cls.value}>
                                    {cls.label} N/mm² {cls.value === 'B1.5' && '(Minimum für SR)'}
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              <>
                                {BOND_STRENGTH_CLASSES.map(cls => (
                                  <SelectItem key={cls.value} value={cls.value}>{cls.label} N/mm²</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13892-8
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="impact_resistance_nm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schlagfestigkeit (Nm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="z.B. 4"
                            {...field}
                            onChange={(e) => field.onChange(numOrUndef(e))}
                          />
                        </FormControl>
                        <FormDescription>
                          Nach EN ISO 6272 (≥ 4 Nm für SR-Nutzschicht)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="impact_resistance_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schlagfestigkeit (Legacy IR-Klasse)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                            <SelectItem value="IR1">IR1 (1 Nm)</SelectItem>
                            <SelectItem value="IR2">IR2 (2 Nm)</SelectItem>
                            <SelectItem value="IR4">IR4 (4 Nm)</SelectItem>
                            <SelectItem value="IR10">IR10 (10 Nm)</SelectItem>
                            <SelectItem value="IR20">IR20 (20 Nm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Legacy-Mapping (Wert in Nm verwenden)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Bond Strength (B-Klassen) - Optional für CT/CA, Pflicht für SR */}
            {(['CT', 'CA'].includes(watchedValues.type)) && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Optionale Eigenschaften für {watchedValues.type}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bond_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verbundfestigkeit (B-Klasse)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                            {BOND_STRENGTH_CLASSES.map(cls => {
                              return (
                                <SelectItem key={cls.value} value={cls.value}>
                                  {cls.value} (≥ {cls.strength} N/mm²)
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13892-8 (häufig bei Verbundestrichen gefordert)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Oberflächenhärte für CT/CA (optional) */}
                  <FormField
                    control={form.control}
                    name="surface_hardness_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oberflächenhärte (SH-Klasse)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                            <SelectItem value="SH30">SH30</SelectItem>
                            <SelectItem value="SH40">SH40</SelectItem>
                            <SelectItem value="SH50">SH50</SelectItem>
                            <SelectItem value="SH70">SH70</SelectItem>
                            <SelectItem value="SH100">SH100</SelectItem>
                            <SelectItem value="SH150">SH150</SelectItem>
                            <SelectItem value="SH200">SH200</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13892-6 (optional für CT/CA)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* MA (Magnesit) - Oberflächenhärte PFLICHT */}
            {watchedValues.type === 'MA' && (
              <div className="p-4 bg-green-50 rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Magnesit-spezifische Eigenschaften
                </h3>
                <FormField
                  control={form.control}
                  name="surface_hardness_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Oberflächenhärte (SH-Klasse)
                        {watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
                          <span className="text-red-500"> *</span>
                        )}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pflicht bei MA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SH30">SH30</SelectItem>
                          <SelectItem value="SH40">SH40</SelectItem>
                          <SelectItem value="SH50">SH50</SelectItem>
                          <SelectItem value="SH70">SH70</SelectItem>
                          <SelectItem value="SH100">SH100</SelectItem>
                          <SelectItem value="SH150">SH150</SelectItem>
                          <SelectItem value="SH200">SH200</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nach EN 13892-6 (Pflicht für Magnesiaestrich)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Separator />

            {/* Verschleißwiderstand - NUR EINE METHODE! */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Verschleißwiderstand</h3>
              
              <FormField
                control={form.control}
                name="wear_resistance_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prüfverfahren (nur EINE Methode wählen!)</FormLabel>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="space-y-4"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="none">
                            NPD - No Performance Determined
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Kein Verschleißwiderstand deklariert
                          </p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="bohme" id="bohme" disabled={watchedValues.type === 'SR'} />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label htmlFor="bohme" className={cn(
                              "flex items-center gap-2",
                              watchedValues.type === 'SR' && "opacity-50"
                            )}>
                              Böhme-Verfahren (A-Klassen) - EN 13892-3
                              <span className="text-xs text-muted-foreground">
                                (Wert in cm³/50cm²)
                              </span>
                              {watchedValues.type === 'SR' && (
                                <span className="text-xs text-red-500">(Nicht für SR)</span>
                              )}
                            </Label>
                            {watchedValues.wear_resistance_method === 'bohme' && watchedValues.type !== 'SR' && (
                              <FormField
                                control={form.control}
                                name="wear_resistance_class"
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="A-Klasse wählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5'].map(cls => (
                                        <SelectItem key={cls} value={cls}>
                                          {cls} cm³/50cm²
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="bca" id="bca" />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label htmlFor="bca" className="flex items-center gap-2">
                              BCA-Verfahren (AR-Klassen) - EN 13892-4
                              <span className="text-xs text-muted-foreground">
                                (max. Abtrag ×10⁻² mm)
                              </span>
                            </Label>
                            {watchedValues.wear_resistance_method === 'bca' && (
                              <FormField
                                control={form.control}
                                name="wear_resistance_class"
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="AR-Klasse wählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['AR6', 'AR4', 'AR2', 'AR1', 'AR0.5'].map(cls => (
                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="rolling_wheel" id="rolling" />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label htmlFor="rolling" className="flex items-center gap-2">
                              Rollrad-Verfahren (RWA-Klassen) - EN 13892-5
                              <span className="text-xs text-muted-foreground">
                                (Wert in cm³)
                              </span>
                            </Label>
                            {watchedValues.wear_resistance_method === 'rolling_wheel' && (
                              <FormField
                                control={form.control}
                                name="wear_resistance_class"
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="RWA-Klasse wählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['RWA300', 'RWA100', 'RWA20', 'RWA10', 'RWA1'].map(cls => (
                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                    <FormDescription>
                      Bei Nutzschicht ohne Bodenbelag ist eine Methode erforderlich
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* RWFC bei Bodenbelag (EN 13892-7) */}
            {watchedValues.intended_use?.with_flooring && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Rollwiderstand mit Bodenbelag
                </h3>
                <FormField
                  control={form.control}
                  name="rwfc_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RWFC-Klasse (EN 13892-7, optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie eine RWFC-Klasse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                          <SelectItem value="RWFC550">RWFC550</SelectItem>
                          <SelectItem value="RWFC350">RWFC350</SelectItem>
                          <SelectItem value="RWFC250">RWFC250</SelectItem>
                          <SelectItem value="RWFC150">RWFC150</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Rollwiderstand mit Bodenbelag nach EN 13892-7
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* === SECTION 3: VERWENDUNGSZWECK === */}
        <Card ref={(el) => { if (el) sectionRefs.current[2] = el }}>
          <CardHeader>
            <CardTitle>3. Verwendungszweck</CardTitle>
            <CardDescription>
              Geplante Anwendungsbereiche und besondere Anforderungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="intended_use.wearing_surface"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Als Nutzschicht
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.with_flooring"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Mit Bodenbelag
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.heated_screed"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Heizestrich
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.indoor_only"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Nur Innenbereich
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.outdoor_use"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Außenbereich
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.wet_areas"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Nassbereiche
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.industrial_use"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Industriebereich
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.chemical_resistance"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Chemische Beständigkeit erforderlich
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Warnungen basierend auf Verwendungszweck */}
            {watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <strong>Verschleißwiderstand erforderlich!</strong> Bei Verwendung als Nutzschicht ohne Bodenbelag muss der Verschleißwiderstand angegeben werden.
                </AlertDescription>
              </Alert>
            )}

            {watchedValues.intended_use?.heated_screed && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Wärmeleitfähigkeit empfohlen.</strong> Bei Heizestrich sollte die Wärmeleitfähigkeit λ angegeben werden (siehe Erweiterte Eigenschaften).
                </AlertDescription>
              </Alert>
            )}

            {/* Außenbereich-Warnung */}
            {watchedValues.intended_use?.outdoor_use && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-900">
                  <strong>Hinweis Außenbereich:</strong> EN 13813 gilt primär für den Innenbereich. 
                  Für Außenanwendungen siehe EAD 190019-00-0502.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* === SECTION 4: MATERIALZUSAMMENSETZUNG === */}
        <Card ref={(el) => { if (el) sectionRefs.current[3] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              4. Materialzusammensetzung
            </CardTitle>
            <CardDescription>
              Detaillierte Rezeptur mit Konformitätsnachweisen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bindemittel */}
            <div>
              <h3 className="text-sm font-medium mb-4">Bindemittel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="materials.binder_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bindemittel-Typ*</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. CEM I 42.5 R" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.binder_designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bezeichnung nach Norm*</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. CEM I 42,5 R nach EN 197-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.binder_amount_kg_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge (kg/m³)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.binder_supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieferant</FormLabel>
                      <FormControl>
                        <Input placeholder="Hersteller/Lieferant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.binder_certificate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Konformitätsnachweis</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Zertifikat-Nr. oder Datei-URL" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Zuschlagstoffe mit Rohdichte und Feuchte */}
            <div>
              <h3 className="text-sm font-medium mb-4">Zuschlagstoffe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="materials.aggregate_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Art</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="natural">Natürlich</SelectItem>
                          <SelectItem value="recycled">Rezykliert</SelectItem>
                          <SelectItem value="lightweight">Leicht</SelectItem>
                          <SelectItem value="other">Sonstige</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bezeichnung</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Quarzsand 0/4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_max_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Größtkorn</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0/4">0/4 mm</SelectItem>
                          <SelectItem value="0/8">0/8 mm</SelectItem>
                          <SelectItem value="0/16">0/16 mm</SelectItem>
                          <SelectItem value="0/32">0/32 mm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_amount_kg_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge (kg/m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="z.B. 1800"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_bulk_density"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rohdichte (kg/m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="z.B. 2650"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_moisture_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feuchtegehalt (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="z.B. 2.5"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Wasser & W/B-Wert mit Wasserqualität */}
            <div>
              <h3 className="text-sm font-medium mb-4">Wasser & W/B-Wert</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="materials.water_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wasserzugabe (l/m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.water_binder_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>W/B-Wert*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchedValues.materials?.water_content && watchedValues.materials?.binder_amount_kg_m3 && (
                          <span className="text-xs">
                            Berechnet: {(watchedValues.materials.water_content / watchedValues.materials.binder_amount_kg_m3).toFixed(3)}
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.water_quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wasserqualität*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="drinking">Trinkwasser</SelectItem>
                          <SelectItem value="tested">Geprüft</SelectItem>
                          <SelectItem value="certified">Zertifiziert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Zusatzmittel mit Datenblättern */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Zusatzmittel</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAdditive({
                    type: 'plasticizer',
                    name: '',
                    dosage_percent: 0,
                    supplier: '',
                    data_sheet: ''
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Zusatzmittel hinzufügen
                </Button>
              </div>
              
              <div className="space-y-4">
                {additiveFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium">Zusatzmittel {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdditive(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`materials.additives.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typ</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="plasticizer">Fließmittel</SelectItem>
                                <SelectItem value="retarder">Verzögerer</SelectItem>
                                <SelectItem value="accelerator">Beschleuniger</SelectItem>
                                <SelectItem value="air_entrainer">Luftporenbildner</SelectItem>
                                <SelectItem value="waterproofer">Dichtungsmittel</SelectItem>
                                <SelectItem value="fibers">Fasern</SelectItem>
                                <SelectItem value="shrinkage_reducer">Schwindreduzierer</SelectItem>
                                <SelectItem value="other">Sonstiges</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`materials.additives.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produktname</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`materials.additives.${index}.dosage_percent`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosierung (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(numOrUndef(e))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`materials.additives.${index}.supplier`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lieferant</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`materials.additives.${index}.data_sheet`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Technisches Datenblatt</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="URL oder Datei-ID" {...field} />
                              </FormControl>
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 5: SIEBLINIE / KORNGRÖßENVERTEILUNG === */}
        <Card ref={(el) => { if (el) sectionRefs.current[4] = el }}>
          <CardHeader>
            <CardTitle>5. Sieblinie / Korngrößenverteilung</CardTitle>
            <CardDescription>
              Detaillierte Korngrößenverteilung der Zuschlagstoffe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.063].map((size, index) => (
                <div key={size}>
                  <Label>{size} mm</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Durchgang %"
                    onChange={(e) => {
                      const current = form.getValues('materials.sieve_curve.passing_percent') || []
                      current[index] = numOrUndef(e) ?? 0
                      form.setValue('materials.sieve_curve.passing_percent', current)
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label>Sieblinienkurve hochladen</Label>
                <p className="text-sm text-muted-foreground">
                  PDF oder Excel-Datei mit vollständiger Korngrößenverteilung
                </p>
              </div>
              <Button type="button" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Datei auswählen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 6: MISCHVORSCHRIFT === */}
        <Card ref={(el) => { if (el) sectionRefs.current[5] = el }}>
          <CardHeader>
            <CardTitle>6. Mischvorschrift</CardTitle>
            <CardDescription>
              Detaillierte Mischanweisungen und -parameter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mixing_procedure.sequence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mischreihenfolge*</FormLabel>
                  <FormDescription>
                    Reihenfolge der Zugabe (verschiebbar)
                  </FormDescription>
                  <div className="space-y-2 mt-2">
                    {field.value?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{index + 1}.</span>
                        <Input 
                          value={item} 
                          onChange={(e) => {
                            const updated = [...field.value]
                            updated[index] = e.target.value
                            field.onChange(updated)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mixing_procedure.mixer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mischer-Typ*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="forced">Zwangsmischer</SelectItem>
                        <SelectItem value="free_fall">Freifallmischer</SelectItem>
                        <SelectItem value="continuous">Durchlaufmischer</SelectItem>
                        <SelectItem value="other">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mixing_procedure.batch_size_liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chargengröße (Liter)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mixing_procedure.mixing_time_dry_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trockenmischzeit (Sek.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mixing_procedure.mixing_time_wet_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nassmischzeit (Sek.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mixing_procedure.mixing_speed_rpm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mischerdrehzahl (U/min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 7: FRISCHMÖRTEL-EIGENSCHAFTEN === */}
        <Card ref={(el) => { if (el) sectionRefs.current[6] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              7. Frischmörtel-Eigenschaften
            </CardTitle>
            <CardDescription>
              Eigenschaften im frischen Zustand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fresh_mortar.consistency_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konsistenz-Zielwert (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="z.B. 160"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>Zielwert für Ausbreitmaß</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.consistency_tolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toleranz (± mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="z.B. 10"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>Zulässige Abweichung vom Zielwert</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.processing_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verarbeitungszeit (Min.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 45"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.setting_time_initial_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erstarrungsbeginn (Min.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 180"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedValues.fresh_mortar?.setting_time_norm === 'EN 13454-2'
                        ? 'Nach EN 13454-2 (korrekt für EN 13813)'
                        : 'Nach EN 196-3 (Zement-Vicat, Info-Zweck)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.setting_time_norm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prüfnorm für Erstarrungszeit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EN 13454-2">EN 13454-2 (EN 13813 konform)</SelectItem>
                        <SelectItem value="EN 196-3">EN 196-3 (Zement-Vicat, Info)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      EN 13454-2 ist das Verfahren nach EN 13813
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.setting_time_final_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erstarrungsende (Min.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 360"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedValues.fresh_mortar?.setting_time_norm === 'EN 13454-2'
                        ? 'Nach EN 13454-2 (korrekt für EN 13813)'
                        : 'Nach EN 196-3 (Zement-Vicat, Info-Zweck)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.ph_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      pH-Wert {watchedValues.type === 'CA' && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="z.B. 12.5"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedValues.type === 'CA' ? (
                        <span className="text-orange-600">
                          Pflicht für CA: pH ≥ 7 (EN 13813 Anforderung)
                        </span>
                      ) : (
                        'pH-Wert des Frischmörtels (optional)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 8: VERARBEITUNGSPARAMETER === */}
        <Card ref={(el) => { if (el) sectionRefs.current[7] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              8. Verarbeitungsparameter
            </CardTitle>
            <CardDescription>
              Umgebungsbedingungen und Anwendungshinweise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fresh_mortar.temperature_min_celsius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Verarbeitungstemperatur (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 5"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fresh_mortar.temperature_max_celsius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. Verarbeitungstemperatur (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 30"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processing.layer_thickness_min_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Schichtdicke (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 35"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processing.layer_thickness_max_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. Schichtdicke (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 80"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 9: ERWEITERTE EIGENSCHAFTEN === */}
        <Card ref={(el) => { if (el) sectionRefs.current[8] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              9. Erweiterte Eigenschaften
            </CardTitle>
            <CardDescription>
              Zusätzliche technische Eigenschaften und Prüfungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="extended_properties.elastic_modulus_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Modul Klasse (Biegemodul)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie eine E-Klasse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                        <SelectItem value="E1">E1 (≥ 1 kN/mm²)</SelectItem>
                        <SelectItem value="E2">E2 (≥ 2 kN/mm²)</SelectItem>
                        <SelectItem value="E5">E5 (≥ 5 kN/mm²)</SelectItem>
                        <SelectItem value="E10">E10 (≥ 10 kN/mm²)</SelectItem>
                        <SelectItem value="E15">E15 (≥ 15 kN/mm²)</SelectItem>
                        <SelectItem value="E20">E20 (≥ 20 kN/mm²)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Modulus of elasticity in flexure nach EN ISO 178
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extended_properties.shrinkage_mm_m"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schwinden/Quellen (mm/m)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="z.B. 0.5"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedValues.intended_use?.heated_screed && (
                <FormField
                  control={form.control}
                  name="extended_properties.thermal_conductivity_w_mk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wärmeleitfähigkeit λ (W/mK)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="z.B. 1.2"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormDescription>Empfohlen bei Heizestrich (EN 12524/EN 12664)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="fire_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brandverhalten</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FIRE_CLASSES.map(cls => (
                          <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                        ))}
                        <SelectItem value="Cfl-s1">Cfl-s1</SelectItem>
                        <SelectItem value="Dfl-s1">Dfl-s1</SelectItem>
                        <SelectItem value="Efl">Efl</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extended_properties.chemical_resistance"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Chemische Beständigkeit</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {(['oil', 'acid', 'alkali', 'salt', 'solvent'] as const).map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            checked={field.value?.includes(type)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, type])
                              } else {
                                field.onChange(current.filter((t: string) => t !== type))
                              }
                            }}
                          />
                          <span className="text-sm">
                            {type === 'oil' && 'Öl'}
                            {type === 'acid' && 'Säure'}
                            {type === 'alkali' && 'Lauge'}
                            {type === 'solvent' && 'Lösemittel'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gefährliche Substanzen - EN 13813 Anforderung */}
              <div className="md:col-span-2 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-900 mb-1">Gefährliche Substanzen</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Gemäß EN 13813 muss die Freisetzung gefährlicher Substanzen deklariert werden
                      </p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="extended_properties.dangerous_substances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deklaration gefährlicher Substanzen *</FormLabel>
                        <div className="space-y-3">
                          <RadioGroup
                            value={field.value?.length > 0 ? 'declared' : 'npd'}
                            onValueChange={(value) => {
                              if (value === 'npd') {
                                field.onChange([])
                              } else {
                                field.onChange(['Siehe Sicherheitsdatenblatt'])
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="npd" id="ds-npd" />
                              <Label htmlFor="ds-npd" className="font-normal">
                                NPD (Leistung nicht bestimmt)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="declared" id="ds-declared" />
                              <Label htmlFor="ds-declared" className="font-normal">
                                Siehe Sicherheitsdatenblatt (SDB)
                              </Label>
                            </div>
                          </RadioGroup>
                          
                          {field.value?.length > 0 && (
                            <div className="mt-3 p-3 bg-white border rounded">
                              <p className="text-sm font-medium mb-2">Zusätzliche Angaben (optional):</p>
                              <Textarea
                                placeholder="z.B. Chromat-reduziert, REACH-konform, keine SVHC-Stoffe..."
                                value={field.value[0] === 'Siehe Sicherheitsdatenblatt' && field.value[1] ? field.value[1] : ''}
                                onChange={(e) => {
                                  const newValue = ['Siehe Sicherheitsdatenblatt']
                                  if (e.target.value) {
                                    newValue.push(e.target.value)
                                  }
                                  field.onChange(newValue)
                                }}
                                className="min-h-[60px]"
                              />
                            </div>
                          )}
                        </div>
                        <FormDescription>
                          Pflichtangabe für die Leistungserklärung gemäß EN 13813
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* VOC Emissionen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="extended_properties.tvoc_emission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TVOC-Emission (μg/m³)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.1"
                              placeholder="z.B. 250"
                              {...field}
                              onChange={(e) => field.onChange(numOrUndef(e))}
                            />
                          </FormControl>
                          <FormDescription>Nach EN 16516</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="extended_properties.formaldehyde_emission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formaldehyd-Emissionsklasse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="E1">E1 (≤ 0,1 ppm)</SelectItem>
                              <SelectItem value="E2">E2 (&gt; 0,1 ppm)</SelectItem>
                              <SelectItem value="none">Keine Angabe</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Nach EN 717-1</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 10: QUALITÄTSKONTROLLE / WPK / FPC === */}
        <Card ref={(el) => { if (el) sectionRefs.current[9] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              10. Qualitätskontrolle / WPK / FPC
            </CardTitle>
            <CardDescription>
              Werkseigene Produktionskontrolle und Toleranzen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Kalibrierintervalle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quality_control.calibration_scales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waagen</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                          <SelectItem value="biannual">Halbjährlich</SelectItem>
                          <SelectItem value="annual">Jährlich</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.calibration_mixers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mischer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">Jährlich</SelectItem>
                          <SelectItem value="biannual">Halbjährlich</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.calibration_testing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prüfgeräte</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Nach Herstellervorgabe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Toleranzgrenzen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quality_control.tolerance_binder_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bindemittel (± %)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="z.B. 2"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.tolerance_water_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wasser (± %)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="z.B. 3"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.tolerance_temperature_celsius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatur (± °C)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.5"
                          placeholder="z.B. 2"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Abweichungsmaßnahmen</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="quality_control.deviation_minor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geringfügige Abweichung</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="z.B. Nachjustierung, Dokumentation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.deviation_major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erhebliche Abweichung</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="z.B. Produktion stoppen, Charge sperren"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality_control.deviation_critical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kritische Abweichung</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="z.B. Rückruf, Kundeninformation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 11: RÜCKVERFOLGBARKEIT === */}
        <Card ref={(el) => { if (el) sectionRefs.current[10] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              11. Rückverfolgbarkeit
            </CardTitle>
            <CardDescription>
              Chargenverknüpfung und Rückstellmuster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="traceability.batch_linking_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Chargenverknüpfung aktiviert
                  </FormLabel>
                </FormItem>
              )}
            />

            {false && <div>
              <h3 className="text-sm font-medium mb-4">Rückstellmuster</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fields don't exist in schema yet - commenting out
                <FormField
                  control={form.control}
                  name="traceability.retention_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lagerort</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Musterlager Halle 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="traceability.retention_duration_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aufbewahrungsdauer (Monate)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="z.B. 6"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                */}

                {/* <FormField
                  control={form.control}
                  name="traceability.retention_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 2 kg oder 1 Prüfkörper" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>}
          </CardContent>
        </Card>

        {/* === SECTION 12: VERSIONIERUNG & ÄNDERUNGSHISTORIE === */}
        <Card ref={(el) => { if (el) sectionRefs.current[11] = el }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              12. Versionierung & Änderungshistorie
            </CardTitle>
            <CardDescription>
              Freigabe und Änderungsverfolgung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="z.B. 1.0"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Entwurf</SelectItem>
                        <SelectItem value="in_review">In Prüfung</SelectItem>
                        <SelectItem value="approved">Freigegeben</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="locked">Gesperrt</SelectItem>
                        <SelectItem value="archived">Archiviert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approved_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freigegeben von</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Name des Freigebenden"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Änderungshistorie wird beim Speichern automatisch erstellt */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Die Änderungshistorie wird automatisch bei jeder Speicherung aktualisiert.
                Alle Änderungen werden mit Zeitstempel und Benutzer dokumentiert.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* === SECTION 13: ITT-PRÜFPLAN (automatisch generiert) === */}
        {watchedValues.itt_test_plan?.required_tests?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                13. ITT-Prüfplan (automatisch generiert)
              </CardTitle>
              <CardDescription>
                Erforderliche Erstprüfungen basierend auf deklarierten Eigenschaften
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 font-medium text-sm border-b pb-2">
                  <div>Eigenschaft</div>
                  <div>Prüfnorm</div>
                  <div>Prüfalter</div>
                  <div>Anforderung</div>
                </div>
                {watchedValues.itt_test_plan.required_tests.map((test: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
                    <div>{test.property}</div>
                    <div className="text-muted-foreground">{test.norm}</div>
                    <div>{typeof test.test_age_days === 'number' ? `${test.test_age_days} Tage` : '—'}</div>
                    <div className="font-medium">{test.target_value ?? '—'}</div>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Dieser Prüfplan wurde automatisch basierend auf Ihren Angaben generiert.
                  Zusätzliche Prüfungen können erforderlich sein.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* === SECTION 14: DoP-VORBEREITUNG === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              14. DoP-Vorbereitung (Declaration of Performance)
            </CardTitle>
            <CardDescription>
              Vorbereitung der Leistungserklärung nach EN 13813
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DoP Administrative Daten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">DoP-Nummer (automatisch)</Label>
                <p className="text-sm font-mono mt-1">
                  {new Date().getFullYear()}-{watchedValues.type || 'XX'}-
                  {watchedValues.compressive_strength_class || watchedValues.indentation_class || watchedValues.bond_strength_class || 'XX'}-
                  {dopNumber}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Freisetzung korrosiver Stoffe</Label>
                <p className="text-sm mt-1 font-semibold">
                  {watchedValues.type || 'NPD'}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Deklariert durch Bindemittel-Typ nach EN 13813)
                </p>
              </div>
            </div>

            {/* Hersteller-Informationen - Fields don't exist in schema
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Hersteller-Informationen (erforderlich für DoP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firmenname*</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Estrich GmbH" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vollständige Anschrift*</FormLabel>
                      <FormControl>
                        <Input placeholder="Straße, PLZ Ort, Land" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer.authorized_rep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bevollmächtigter (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Falls zutreffend" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer.signatory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unterzeichner*</FormLabel>
                      <FormControl>
                        <Input placeholder="Name, Funktion" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div> */}

            {/* AVCP-System und Notified Body */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">AVCP-System und Konformitätsbewertung</h3>
              
              {/* AVCP System Anzeige - Verwende das ausgewählte AVCP System */}
              <Alert className={
                watchedValues.avcp_system === '1' ? "border-orange-200 bg-orange-50" :
                watchedValues.avcp_system === '3' ? "border-yellow-200 bg-yellow-50" :
                "border-blue-200 bg-blue-50"
              }>
                <Info className={
                  watchedValues.avcp_system === '1' ? "h-4 w-4 text-orange-600" :
                  watchedValues.avcp_system === '3' ? "h-4 w-4 text-yellow-600" :
                  "h-4 w-4 text-blue-600"
                } />
                <AlertDescription className={
                  watchedValues.avcp_system === '1' ? "text-orange-900" :
                  watchedValues.avcp_system === '3' ? "text-yellow-900" :
                  "text-blue-900"
                }>
                  <strong>AVCP-System: System {watchedValues.avcp_system || '4'}</strong><br />
                  {watchedValues.avcp_system === '1' && (
                    <>
                      • <strong>System 1</strong>: Zertifizierung durch notifizierte Zertifizierungsstelle<br />
                      • ITT-Prüfung und laufende Überwachung der WPK<br />
                      • <strong>NB-Nummer {watchedValues.notified_body_number ? `(${watchedValues.notified_body_number})` : ''} im CE-Zeichen erforderlich</strong><br />
                      • Zertifikat der Leistungsbeständigkeit erforderlich
                    </>
                  )}
                  {watchedValues.avcp_system === '3' && (
                    <>
                      • <strong>System 3</strong>: Reaktion-auf-Feuer durch notifizierte Prüfstelle<br />
                      • ITT-Prüfbericht durch notifizierte Stelle<br />
                      • <strong>Keine NB-Nummer im CE-Zeichen</strong><br />
                      • Prüfbericht in technischer Dokumentation aufbewahren
                    </>
                  )}
                  {(!watchedValues.avcp_system || watchedValues.avcp_system === '4') && (
                    <>
                      • <strong>System 4</strong>: Herstellererklärung<br />
                      • {watchedValues.type === 'CT' && watchedValues.fire_class === 'A1fl' ? (
                        <>Brandverhalten A1fl &quot;ohne Prüfung&quot; (CWFT)<br />
                        • <span className="text-sm text-muted-foreground">gem. Entscheidung 96/603/EG</span></>
                      ) : (
                        <>Eigenverantwortliche Deklaration</>
                      )}<br />
                      • ITT-Prüfungen in eigenem oder externem Labor<br />
                      • <strong>Keine notifizierte Stelle erforderlich</strong><br />
                      • <strong>CE-Zeichen ohne NB-Nummer</strong>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            {/* Zusammenfassung automatisch ermittelt */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Automatisch ermittelt:</strong><br />
                • Produkt-Typ: {watchedValues.type} Estrichmörtel<br />
                • Verwendung: Estrichmörtel für Innenböden nach EN 13813<br />
                • hEN: EN 13813:2002<br />
                • Gefährliche Substanzen: Siehe Sicherheitsdatenblatt<br />
                • <strong className="text-orange-600">10-Jahre-Aufbewahrung: DoP muss 10 Jahre aufbewahrt werden!</strong>
              </AlertDescription>
            </Alert>

            {/* Deklarierte Leistungen */}
            <div>
              <h3 className="text-sm font-medium mb-3">Deklarierte Leistungen</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 border-b">Wesentliche Merkmale</th>
                      <th className="text-left p-2 border-b">Leistung</th>
                      <th className="text-left p-2 border-b">Prüfnorm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* WICHTIG: Freisetzung korrosiver Stoffe IMMER ZUERST */}
                    <tr className="border-b">
                      <td className="p-2">Freisetzung korrosiver Stoffe</td>
                      <td className="p-2 font-medium">{watchedValues.type || 'NPD'}</td>
                      <td className="p-2 text-muted-foreground">EN 13813:2002</td>
                    </tr>
                    
                    {/* Pflichtangaben je nach Typ */}
                    {['CT', 'CA', 'MA'].includes(watchedValues.type) && (
                      <>
                        <tr className="border-b">
                          <td className="p-2">Druckfestigkeit</td>
                          <td className="p-2 font-medium">{watchedValues.compressive_strength_class || 'NPD'}</td>
                          <td className="p-2 text-muted-foreground">EN 13892-2</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Biegezugfestigkeit</td>
                          <td className="p-2 font-medium">{watchedValues.flexural_strength_class || 'NPD'}</td>
                          <td className="p-2 text-muted-foreground">EN 13892-2</td>
                        </tr>
                      </>
                    )}
                    
                    {watchedValues.type === 'AS' && (
                      <tr className="border-b">
                        <td className="p-2">Eindrückklasse</td>
                        <td className="p-2 font-medium">{watchedValues.indentation_class || 'NPD'}</td>
                        <td className="p-2 text-muted-foreground">EN 13813:2002</td>
                      </tr>
                    )}
                    
                    {watchedValues.type === 'SR' && (
                      <>
                        <tr className="border-b">
                          <td className="p-2">Verbundfestigkeit</td>
                          <td className="p-2 font-medium">{watchedValues.bond_strength_class || 'NPD'}</td>
                          <td className="p-2 text-muted-foreground">EN 13892-8</td>
                        </tr>
                        {(watchedValues.impact_resistance_class || watchedValues.impact_resistance_nm) && (
                          <tr className="border-b">
                            <td className="p-2">Schlagfestigkeit</td>
                            <td className="p-2 font-medium">
                              {watchedValues.impact_resistance_nm
                                ? `${watchedValues.impact_resistance_nm} Nm`
                                : watchedValues.impact_resistance_class}
                            </td>
                            <td className="p-2 text-muted-foreground">EN ISO 6272</td>
                          </tr>
                        )}
                      </>
                    )}
                    
                    {watchedValues.type === 'MA' && watchedValues.surface_hardness_class && (
                      <tr className="border-b">
                        <td className="p-2">Oberflächenhärte</td>
                        <td className="p-2 font-medium">{watchedValues.surface_hardness_class}</td>
                        <td className="p-2 text-muted-foreground">EN 13892-6</td>
                      </tr>
                    )}
                    
                    {/* Optionale Eigenschaften */}
                    {watchedValues.wear_resistance_class && watchedValues.wear_resistance_method !== 'none' && (
                      <tr className="border-b">
                        <td className="p-2">Verschleißwiderstand</td>
                        <td className="p-2 font-medium">{watchedValues.wear_resistance_class}</td>
                        <td className="p-2 text-muted-foreground">
                          {watchedValues.wear_resistance_method === 'bohme' ? 'EN 13892-3' :
                           watchedValues.wear_resistance_method === 'bca' ? 'EN 13892-4' :
                           watchedValues.wear_resistance_method === 'rolling_wheel' ? 'EN 13892-5' : 
                           'EN 13813:2002'}
                        </td>
                      </tr>
                    )}
                    
                    {(!watchedValues.wear_resistance_class || watchedValues.wear_resistance_method === 'none') && (
                      <tr className="border-b">
                        <td className="p-2">Verschleißwiderstand</td>
                        <td className="p-2 font-medium">NPD</td>
                        <td className="p-2 text-muted-foreground">EN 13813:2002</td>
                      </tr>
                    )}
                    
                    {/* RWFC bei "mit Bodenbelag" */}
                    {watchedValues.intended_use?.with_flooring && watchedValues.rwfc_class && (
                      <tr className="border-b">
                        <td className="p-2">Rollwiderstand mit Belag (RWFC)</td>
                        <td className="p-2 font-medium">{watchedValues.rwfc_class}</td>
                        <td className="p-2 text-muted-foreground">EN 13892-7</td>
                      </tr>
                    )}
                    
                    <tr className="border-b">
                      <td className="p-2">Brandverhalten</td>
                      <td className="p-2 font-medium">{watchedValues.fire_class || 'NPD'}</td>
                      <td className="p-2 text-muted-foreground">EN 13501-1</td>
                    </tr>
                    
                    <tr>
                      <td className="p-2">Freisetzung gefährlicher Substanzen</td>
                      <td className="p-2 font-medium">Siehe SDS</td>
                      <td className="p-2 text-muted-foreground">EN 13813:2002</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* EN-Bezeichnung */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Vollständige EN-Bezeichnung:</h3>
              <p className="text-lg font-mono font-semibold text-green-900">
                {enDesignation}
              </p>
            </div>

            {/* CE-Kennzeichnung Vorbereitung - Vollständig nach Anhang ZA */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium">CE-Kennzeichnung (nach Anhang ZA EN 13813)</h3>
              
              {/* CE-Label Vorschau */}
              <div className="p-6 border-4 border-black bg-white">
                <div className="text-center space-y-3">
                  {/* CE-Zeichen mit Jahr */}
                  <div className="flex justify-center items-center space-x-4">
                    <div className="text-5xl font-bold">CE</div>
                    <div className="text-3xl font-bold">{new Date().getFullYear().toString().slice(-2)}</div>
                  </div>
                  
                  {/* Notified Body bei System 1 / 1+ / 2+ */}
                  {['1','1+','2+'].includes(watchedValues.avcp_system || '') && (
                    <div className="text-2xl font-bold">
                      {watchedValues.notified_body_number || '####'}
                    </div>
                  )}
                  
                  {/* Hersteller */}
                  <div className="border-t-2 border-black pt-3">
                    <p className="font-bold text-lg">{'[Hersteller Name]'}</p>
                    <p className="text-sm">{'[Vollständige Anschrift]'}</p>
                  </div>
                  
                  {/* DoP-Nummer */}
                  <div className="text-sm">
                    <strong>DoP-Nr.:</strong> {new Date().getFullYear()}-{watchedValues.type || 'XX'}-
                    {watchedValues.compressive_strength_class || watchedValues.indentation_class || watchedValues.bond_strength_class || 'XX'}-
                    {dopNumber}
                  </div>
                  
                  {/* Produktidentifikation */}
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-sm"><strong>Produkt-Typ:</strong> {`${watchedValues.type || 'XX'} Estrichmörtel`}</p>
                    <p className="text-sm"><strong>Chargennummer:</strong> {'JJMMTT-###'}</p>
                  </div>
                  
                  {/* Verwendungszweck */}
                  <div className="text-sm">
                    <strong>Verwendungszweck:</strong><br/>
                    Estrichmörtel zur Verwendung in Gebäuden<br/>
                    gemäß EN 13813:2002
                  </div>
                  
                  {/* AVCP-System */}
                  <div className="text-sm">
                    <strong>System zur Bewertung und Überprüfung der Leistungsbeständigkeit:</strong><br/>
                    System {watchedValues.avcp_system || '4'}
                  </div>
                  
                  {/* Erklärte Leistungen - Kurzform */}
                  <div className="border-t-2 border-black pt-3">
                    <p className="font-bold text-xl">{enDesignation}</p>
                  </div>
                  
                  {/* Wesentliche Merkmale - Tabelle */}
                  <div className="mt-3 text-xs">
                    <table className="w-full border border-black">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-black p-1 text-left">Wesentliches Merkmal</th>
                          <th className="border border-black p-1 text-left">Leistung</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-1">Freisetzung korrosiver Stoffe</td>
                          <td className="border border-black p-1 font-bold">{watchedValues.type || 'NPD'}</td>
                        </tr>
                        {watchedValues.compressive_strength_class && (
                          <tr>
                            <td className="border border-black p-1">Druckfestigkeit</td>
                            <td className="border border-black p-1 font-bold">{watchedValues.compressive_strength_class}</td>
                          </tr>
                        )}
                        {watchedValues.flexural_strength_class && (
                          <tr>
                            <td className="border border-black p-1">Biegezugfestigkeit</td>
                            <td className="border border-black p-1 font-bold">{watchedValues.flexural_strength_class}</td>
                          </tr>
                        )}
                        {watchedValues.wear_resistance_class && watchedValues.wear_resistance_method !== 'none' && (
                          <tr>
                            <td className="border border-black p-1">Verschleißwiderstand</td>
                            <td className="border border-black p-1 font-bold">{watchedValues.wear_resistance_class}</td>
                          </tr>
                        )}
                        {watchedValues.fire_class && watchedValues.fire_class !== 'NPD' && (
                          <tr>
                            <td className="border border-black p-1">Brandverhalten</td>
                            <td className="border border-black p-1 font-bold">{watchedValues.fire_class}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Verweis auf DoP */}
                  <div className="text-xs border-t border-gray-400 pt-2 mt-3">
                    Die Leistung entspricht der erklärten Leistung.<br/>
                    Die vollständige Leistungserklärung ist verfügbar unter:<br/>
                    <strong>www.hersteller.de/dop</strong>
                  </div>
                </div>
              </div>
              
              {/* Hinweise zur CE-Kennzeichnung */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wichtige Hinweise zur CE-Kennzeichnung:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>CE-Zeichen muss mindestens 5 mm hoch sein</li>
                    <li>Bei System 1: Notified Body Nummer direkt unter CE-Zeichen</li>
                    <li>Bei System 3 und 4: CE-Zeichen ohne NB-Nummer</li>
                    <li>Alle Pflichtangaben nach Anhang ZA müssen enthalten sein</li>
                    <li>CE-Kennzeichnung auf Produkt, Verpackung oder Begleitdokumenten</li>
                    <li>DoP muss 10 Jahre aufbewahrt werden</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* === ACTIONS === */}
        <div className="flex justify-between items-center sticky bottom-0 bg-background p-4 border-t">
          <div className="text-sm text-muted-foreground">
            * Pflichtfelder | Version {watchedValues.version} | Status: {watchedValues.status}
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                generateITTTests()
                toast({
                  title: 'ITT-Tests generiert',
                  description: 'Erforderliche Prüfungen wurden automatisch ermittelt'
                })
              }}
            >
              <FlaskConical className="mr-2 h-4 w-4" />
              ITT-Tests generieren
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/en13813/recipes')}
            >
              Abbrechen
            </Button>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading ? (
                <>Speichern...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Rezeptur erstellen
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
export interface Audit {
  id: string;
  tenant_id: string;
  audit_number: string;
  audit_type: 'internal' | 'external' | 'certification';
  audit_date: string;
  auditor_name: string;
  audit_scope: string;
  status: 'planned' | 'in_progress' | 'completed' | 'closed';

  // Produktspezifische Informationen
  binder_types?: ('CT' | 'CA' | 'MA' | 'AS' | 'SR')[];
  intended_use?: 'wearing_layer' | 'non_wearing_layer';  // Nutzschicht ja/nein

  // AVCP-System Berechnung
  rf_regulated?: boolean;  // Reaktion auf Feuer reguliert
  rf_improvement_stage?: boolean;  // Verbesserungsstufe vorhanden
  dangerous_substances_regulated?: boolean;  // Gefahrstoffe reguliert
  avcp_system?: '4' | '3' | '1';  // Automatisch berechnet

  // ITT & Änderungen
  itt_available?: boolean;  // ITT vorhanden
  itt_after_change?: boolean;  // Re-ITT nach Änderung

  // Konformitätsbewertung
  conformity_method?: 'variables' | 'attributes';
  sample_size?: number;  // n
  mean_value?: number;  // Mittelwert x
  standard_deviation?: number;  // s
  ka_value?: number;  // kA aus Tabelle 12

  // Audit-Ergebnisse
  findings_summary?: string;
  nonconformities_count?: number;
  observations_count?: number;
  opportunities_count?: number;
  next_audit_date?: string;
  corrective_actions_required?: boolean;

  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AuditChecklistItem {
  id: string;
  audit_id: string;
  section: string;
  category: AuditCategory;
  requirement: string;
  reference?: string;
  status: 'conform' | 'nonconform' | 'not_applicable' | 'observation';
  evidence?: string;
  finding?: string;
  severity?: 'critical' | 'major' | 'minor';
  corrective_action_required?: boolean;
  corrective_action_description?: string;
  responsible_person?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  finding_number: string;
  finding_type: 'nonconformity' | 'observation' | 'opportunity';
  severity?: 'critical' | 'major' | 'minor';
  description: string;
  evidence?: string;
  affected_process?: string;
  root_cause?: string;
  corrective_action_required?: boolean;
  corrective_action_description?: string;
  preventive_action_description?: string;
  responsible_person?: string;
  target_date?: string;
  verification_date?: string;
  verification_result?: 'effective' | 'not_effective' | 'pending';
  verified_by?: string;
  status: 'open' | 'in_progress' | 'closed' | 'overdue';
  closure_date?: string;
  closure_comments?: string;
  created_at: string;
  updated_at: string;
}

export type AuditCategory =
  | 'fpc_general'                // EN13813 §6.3.1 General
  | 'process_control'            // EN13813 §6.3.2 Process Control
  | 'incoming_materials'         // EN13813 §6.3.2.1 Incoming materials
  | 'production_process'         // EN13813 §6.3.2.2 Production process
  | 'screed_material_tests'      // EN13813 §6.3.3.1 Tests on the screed material
  | 'alternative_tests'          // EN13813 §6.3.3.2 Alternative tests
  | 'test_equipment'             // EN13813 §6.3.3.3 Test equipment
  | 'traceability'               // EN13813 §6.3.4 Traceability
  | 'labelling'                  // EN13813 §6.3.5 Labelling
  | 'records'                    // EN13813 §6.3.6 Records
  | 'itt_properties'             // Initial Type Testing
  | 'conformity_assessment'      // Clause 9 Conformity
  | 'designation_marking'        // Clause 7-8 Designation & Marking
  | 'avcp_ce';

export interface AuditChecklistTemplate {
  section: string;
  category: AuditCategory;
  requirement: string;
  reference: string;
}

// kA-Werte aus EN 13813:2002 Tabelle 12
export const KA_TABLE_12: { [key: number]: number } = {
  3: 1.12,
  4: 0.95,
  5: 0.85,
  6: 0.78,
  7: 0.73,
  8: 0.69,
  9: 0.66,
  10: 0.64,
  15: 0.55,
  20: 0.49,
  30: 0.43,
  40: 0.39,
  50: 0.36,
  100: 0.28,
  200: 0.22,
  500: 0.16,
  1000: 0.13
};

// Funktion zur Berechnung des AVCP-Systems
export function calculateAVCPSystem(
  rf_regulated?: boolean,
  rf_improvement_stage?: boolean,
  dangerous_substances_regulated?: boolean
): '1' | '3' | '4' {
  if (rf_regulated && rf_improvement_stage) {
    return '1';
  } else if (rf_regulated || dangerous_substances_regulated) {
    return '3';
  } else {
    return '4';
  }
}

// Produktspezifische Pflichtmerkmale aus Tabelle 1
export function getMandatoryProperties(
  binderType: 'CT' | 'CA' | 'MA' | 'AS' | 'SR',
  isWearingLayer: boolean
) {
  const properties: string[] = [];

  switch (binderType) {
    case 'CT':
    case 'CA':
    case 'MA':
      properties.push('C (Druckfestigkeit)', 'F (Biegezugfestigkeit)');
      if (isWearingLayer) {
        properties.push('AR/BCA/RWA (Verschleiß)');
      }
      if (binderType === 'CA') {
        properties.push('pH ≥ 7');
      }
      if (binderType === 'MA' && isWearingLayer) {
        properties.push('SH (Oberflächenhärte)');
      }
      break;

    case 'AS':
      properties.push('IC/IP (Eindruckhärte)');
      break;

    case 'SR':
      if (isWearingLayer) {
        properties.push('AR/RWA (Verschleiß)', 'B ≥ 1,5 (Haftzugfestigkeit)', 'IR (Schlagfestigkeit)');
      }
      break;
  }

  return properties;
}

export const EN13813_AUDIT_CHECKLIST: AuditChecklistTemplate[] = [
  // 6.3.1 General - FPC Requirements
  {
    section: '6.3.1',
    category: 'fpc_general',
    requirement: 'QM-Handbuch vorhanden und aktuell (FPC beschrieben)',
    reference: 'EN 13813:2002 §6.3.1'
  },
  {
    section: '6.3.1',
    category: 'fpc_general',
    requirement: 'ISO 9001 konformes System implementiert (falls zutreffend)',
    reference: 'EN 13813:2002 §6.3.1'
  },
  {
    section: '6.3.1',
    category: 'fpc_general',
    requirement: 'Regelmäßige interne Prüfungen und Prüfplan definiert',
    reference: 'EN 13813:2002 §6.3.1'
  },

  // 6.3.2 Process Control
  {
    section: '6.3.2',
    category: 'process_control',
    requirement: 'Prozesslenkung dokumentiert und implementiert',
    reference: 'EN 13813:2002 §6.3.2'
  },

  // 6.3.2.1 Incoming materials - PRÄZISIERT
  {
    section: '6.3.2.1',
    category: 'incoming_materials',
    requirement: 'Akzeptanzkriterien für alle Eingangsstoffe klar definiert',
    reference: 'EN 13813:2002 §6.3.2.1'
  },
  {
    section: '6.3.2.1',
    category: 'incoming_materials',
    requirement: 'Eingangsprüfungen durchgeführt und dokumentiert',
    reference: 'EN 13813:2002 §6.3.2.1'
  },
  {
    section: '6.3.2.1',
    category: 'incoming_materials',
    requirement: 'Spezifikationen für alle Rohstoffe vorhanden',
    reference: 'EN 13813:2002 §6.3.2.1'
  },
  {
    section: '6.3.2.1',
    category: 'incoming_materials',
    requirement: 'Maßnahmen bei Nichterfüllung der Akzeptanzkriterien definiert',
    reference: 'EN 13813:2002 §6.3.2.1'
  },

  // 6.3.2.2 Production process - PRÄZISIERT
  {
    section: '6.3.2.2',
    category: 'production_process',
    requirement: 'Prozessparameter überwacht und aufgezeichnet',
    reference: 'EN 13813:2002 §6.3.2.2'
  },
  {
    section: '6.3.2.2',
    category: 'production_process',
    requirement: 'Regelmäßige Kalibrierung von Wiege-/Messmitteln mit aufgezeichneten Ergebnissen',
    reference: 'EN 13813:2002 §6.3.2.2'
  },
  {
    section: '6.3.2.2',
    category: 'production_process',
    requirement: 'Prüf-/Inspektionsfrequenzen klar definiert und eingehalten',
    reference: 'EN 13813:2002 §6.3.2.2'
  },
  {
    section: '6.3.2.2',
    category: 'production_process',
    requirement: 'Maßnahmen bei Nichterfüllung der Prozessparameter festgelegt',
    reference: 'EN 13813:2002 §6.3.2.2'
  },

  // 6.3.3.1 Tests on the screed material - PRÄZISIERT
  {
    section: '6.3.3.1',
    category: 'screed_material_tests',
    requirement: 'Sampling-/Test-Rate aus den Prinzipien von Klausel 9 abgeleitet',
    reference: 'EN 13813:2002 §6.3.3.1 & Clause 9'
  },
  {
    section: '6.3.3.1',
    category: 'screed_material_tests',
    requirement: 'Prüfungen am Estrichmaterial planmäßig durchgeführt',
    reference: 'EN 13813:2002 §6.3.3.1'
  },
  {
    section: '6.3.3.1',
    category: 'screed_material_tests',
    requirement: 'Prüfergebnisse protokolliert und systematisch ausgewertet',
    reference: 'EN 13813:2002 §6.3.3.1'
  },

  // 6.3.3.2 Alternative tests
  {
    section: '6.3.3.2',
    category: 'alternative_tests',
    requirement: 'Gleichwertige Prüfverfahren dokumentiert (falls verwendet)',
    reference: 'EN 13813:2002 §6.3.3.2'
  },
  {
    section: '6.3.3.2',
    category: 'alternative_tests',
    requirement: 'Nachweise für Gleichwertigkeit vorhanden',
    reference: 'EN 13813:2002 §6.3.3.2'
  },

  // 6.3.3.3 Test equipment
  {
    section: '6.3.3.3',
    category: 'test_equipment',
    requirement: 'Kalibrierplan für Prüfequipment vorhanden und aktuell',
    reference: 'EN 13813:2002 §6.3.3.3'
  },
  {
    section: '6.3.3.3',
    category: 'test_equipment',
    requirement: 'Alle Prüfgeräte kalibriert und gekennzeichnet',
    reference: 'EN 13813:2002 §6.3.3.3'
  },
  {
    section: '6.3.3.3',
    category: 'test_equipment',
    requirement: 'Kalibrierzertifikate vorhanden und rückführbar',
    reference: 'EN 13813:2002 §6.3.3.3'
  },

  // 6.3.4 Traceability - PRÄZISIERT
  {
    section: '6.3.4',
    category: 'traceability',
    requirement: 'Rückverfolgbarkeit über gesamte Prozesskette gewährleistet',
    reference: 'EN 13813:2002 §6.3.4'
  },
  {
    section: '6.3.4',
    category: 'traceability',
    requirement: 'Shelf-Life-Bestandsführung implementiert',
    reference: 'EN 13813:2002 §6.3.4'
  },
  {
    section: '6.3.4',
    category: 'traceability',
    requirement: 'Verfahren für nichtkonforme Produkte in QM-Dokumentation beschrieben',
    reference: 'EN 13813:2002 §6.3.4'
  },

  // 6.3.5 Labelling - PRÄZISIERT
  {
    section: '6.3.5',
    category: 'labelling',
    requirement: '"EN 13813" NUR bei tatsächlicher Konformität verwendet',
    reference: 'EN 13813:2002 §6.3.5'
  },
  {
    section: '6.3.5',
    category: 'labelling',
    requirement: 'Alle 9 Kennzeichnungs-Punkte vollständig (gem. Clause 8)',
    reference: 'EN 13813:2002 §6.3.5 & Clause 8'
  },

  // 6.3.6 Records - PRÄZISIERT
  {
    section: '6.3.6',
    category: 'records',
    requirement: 'Liste der zu führenden Aufzeichnungen definiert (Kalibrierungen, Rohstoffprüfungen, Batch-Daten)',
    reference: 'EN 13813:2002 §6.3.6'
  },
  {
    section: '6.3.6',
    category: 'records',
    requirement: 'Aufzeichnungen vollständig und autorisiert (mit Unterschrift/Freigabe)',
    reference: 'EN 13813:2002 §6.3.6'
  },
  {
    section: '6.3.6',
    category: 'records',
    requirement: 'Prüfergebnis-Traceability gewährleistet',
    reference: 'EN 13813:2002 §6.3.6'
  },
  {
    section: '6.3.6',
    category: 'records',
    requirement: 'Aufbewahrungsfristen eingehalten (10 Jahre)',
    reference: 'EN 13813:2002 §6.3.6'
  },
  {
    section: '6.3.6',
    category: 'records',
    requirement: 'Dokumentenlenkung implementiert',
    reference: 'EN 13813:2002 §6.3.6'
  },

  // ITT - Initial Type Testing (Clause 5 & 6.2)
  {
    section: '5/6.2',
    category: 'itt_properties',
    requirement: 'ITT für alle normativen Eigenschaften durchgeführt',
    reference: 'EN 13813:2002 Clause 5 & 6.2'
  },
  {
    section: '5/6.2',
    category: 'itt_properties',
    requirement: 'ITT bei wesentlichen Änderungen wiederholt',
    reference: 'EN 13813:2002 Clause 6.2'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'CT/CA/MA: C-Klasse und F-Klasse geprüft/deklariert',
    reference: 'EN 13813:2002 Table 1'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'Nutzschicht: Verschleiß (AR/BCA/RWA) geprüft (falls zutreffend)',
    reference: 'EN 13813:2002 Table 1'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'CA: pH ≥ 7 nachgewiesen',
    reference: 'EN 13813:2002 Table 1'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'MA (Nutzschicht): SH-Klasse geprüft',
    reference: 'EN 13813:2002 Table 1'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'AS: IC/IP nach passender Klasse geprüft',
    reference: 'EN 13813:2002 Table 8a-c'
  },
  {
    section: 'Tab.1',
    category: 'itt_properties',
    requirement: 'SR: AR/RWA, B ≥ 1,5, IR-Klasse geprüft (Nutzschicht)',
    reference: 'EN 13813:2002 Table 1'
  },

  // Clause 9 - Conformity Assessment
  {
    section: '9',
    category: 'conformity_assessment',
    requirement: 'Konformitätsbewertungsverfahren festgelegt (statistisch oder Einzelwerte)',
    reference: 'EN 13813:2002 Clause 9'
  },
  {
    section: '9',
    category: 'conformity_assessment',
    requirement: 'Statistisch: kA-Kriterium erfüllt, absoluter Grenzwert = -10% nicht verletzt',
    reference: 'EN 13813:2002 Clause 9'
  },
  {
    section: '9',
    category: 'conformity_assessment',
    requirement: 'Stichprobenumfang ausreichend (Attributverfahren ab n ≥ 20)',
    reference: 'EN 13813:2002 Clause 9'
  },

  // Clause 7-8 - Designation & Marking
  {
    section: '7',
    category: 'designation_marking',
    requirement: 'Bezeichnung korrekt (z.B. EN 13813 CT-C25-F5-AR1)',
    reference: 'EN 13813:2002 Clause 7'
  },
  {
    section: '8',
    category: 'designation_marking',
    requirement: '9 Marking-Items vollständig (Bezeichnung, Name, Menge, Datum, etc.)',
    reference: 'EN 13813:2002 Clause 8'
  },

  // Annex ZA - CE/AVCP
  {
    section: 'ZA',
    category: 'avcp_ce',
    requirement: 'Zutreffendes AVCP-System identifiziert (4/3/1)',
    reference: 'EN 13813:2002 Annex ZA'
  },
  {
    section: 'ZA',
    category: 'avcp_ce',
    requirement: 'DoC/CoC vollständig (je nach AVCP-System)',
    reference: 'EN 13813:2002 Annex ZA'
  },
  {
    section: 'ZA',
    category: 'avcp_ce',
    requirement: 'CE-Kennzeichnung gemäß ZA angebracht',
    reference: 'EN 13813:2002 Annex ZA'
  },
  {
    section: 'ZA',
    category: 'avcp_ce',
    requirement: 'Reaktion auf Feuer berücksichtigt (falls relevant)',
    reference: 'EN 13813:2002 Annex ZA'
  }
];
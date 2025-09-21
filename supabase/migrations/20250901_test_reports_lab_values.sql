-- ================================================
-- PRÜFBERICHTE & LABORWERTE MODULE
-- EN 13813 Normkonforme Implementierung
-- Basierend auf Feedback1 & Feedback2
-- ================================================

-- ================================================
-- 1. PRÜFBERICHTE (ITT, System 3, FPC)
-- ================================================

-- Haupttabelle für alle Prüfberichte
CREATE TABLE en13813_test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  -- Typ des Berichts
  report_type TEXT CHECK (report_type IN ('ITT', 'System3', 'FPC', 'External')) NOT NULL,
  
  -- AVCP System (wichtig für Validierung)
  avcp_system TEXT CHECK (avcp_system IN ('3', '4')),
  
  -- Labor/Prüfstelle Information
  test_lab TEXT NOT NULL,
  test_lab_address TEXT,
  notified_body_number TEXT, -- z.B. "0672" bei System 3
  notified_body_name TEXT,   -- Name der notifizierten Stelle
  
  -- Berichts-Identifikation
  report_number TEXT NOT NULL,
  report_date DATE NOT NULL,
  test_date DATE NOT NULL,
  
  -- WICHTIG: ITT hat KEIN automatisches Ablaufdatum!
  -- Nur ungültig bei Änderungen an Rezeptur/Produktion/Norm
  valid_from DATE DEFAULT CURRENT_DATE,
  invalidation_reason TEXT, -- Grund für Ungültigkeit (Rezepturänderung, etc.)
  invalidated_at TIMESTAMP,
  invalidated_by UUID REFERENCES users(id),
  
  -- Testergebnisse als strukturiertes JSONB
  test_results JSONB NOT NULL DEFAULT '{}',
  /* Struktur:
  {
    "compressive_strength": {
      "value": 28.5,
      "unit": "N/mm²", 
      "class": "C25",
      "age_days": 28,
      "norm": "EN 13892-2",
      "passed": true,
      "individual_values": [27.8, 28.5, 29.2],
      "mean": 28.5,
      "std_dev": 0.7
    },
    "flexural_strength": {
      "value": 4.5,
      "unit": "N/mm²",
      "class": "F4",
      "age_days": 28,
      "norm": "EN 13892-2",
      "passed": true
    },
    "fire_classification": {
      "class": "Bfl-s1",
      "norm": "EN 13501-1",
      "test_report": "KB-Hoch-180234",
      "notified_body": "0672"
    },
    "wear_resistance_bohme": {
      "value": 12.5,
      "unit": "cm³/50cm²",
      "class": "A12",
      "norm": "EN 13892-3",
      "passed": true
    },
    "rwfc": {
      "value": 5.5,
      "unit": "N/mm²",
      "class": "RWFC5",
      "norm": "EN 13892-7",
      "passed": true
    },
    "surface_hardness": {
      "value": 85,
      "unit": "N/mm²",
      "class": "SH75",
      "norm": "EN 13892-6",
      "passed": true
    },
    "bond_strength": {
      "value": 1.8,
      "unit": "N/mm²",
      "class": "B1.5",
      "norm": "EN 13892-8",
      "passed": true
    },
    "thermal_conductivity": {
      "value": 1.35,
      "unit": "W/(m·K)",
      "norm": "EN 12664",
      "passed": true
    }
  }
  */
  
  -- Dokumenten-Anhänge
  pdf_url TEXT,
  attachments JSONB DEFAULT '[]', -- Array von {name, url, type}
  
  -- Validierungsstatus
  validation_status TEXT CHECK (validation_status IN ('pending', 'valid', 'invalid', 'superseded')) DEFAULT 'pending',
  validation_errors JSONB DEFAULT '[]',
  validated_at TIMESTAMP,
  validated_by UUID REFERENCES users(id),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Eindeutigkeit
  UNIQUE(tenant_id, report_number)
);

-- Index für Performance
CREATE INDEX idx_test_reports_recipe ON en13813_test_reports(recipe_id);
CREATE INDEX idx_test_reports_type ON en13813_test_reports(report_type);
CREATE INDEX idx_test_reports_validation ON en13813_test_reports(validation_status);
CREATE INDEX idx_test_reports_date ON en13813_test_reports(test_date DESC);

-- ================================================
-- 2. LABORWERTE (FPC/WPK)
-- ================================================

-- Haupttabelle für Laborwerte
CREATE TABLE en13813_lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  recipe_id UUID REFERENCES en13813_recipes(id),
  batch_id UUID REFERENCES en13813_batches(id),
  
  -- Probenahme
  sample_id TEXT NOT NULL, -- Eindeutige Proben-ID
  sample_datetime TIMESTAMP NOT NULL,
  sample_location TEXT,
  sampled_by TEXT,
  
  -- Test-Typ
  test_type TEXT CHECK (test_type IN ('fresh', 'hardened', 'both')) NOT NULL,
  test_age_days INTEGER, -- Bei Festmörtel: 7, 28 Tage etc.
  
  -- FRISCHMÖRTEL-EIGENSCHAFTEN (nach EN 13813)
  fresh_properties JSONB,
  /* Struktur:
  {
    "consistency": {
      "value": 180,
      "unit": "mm",
      "method": "flow_table", // oder "slump"
      "specification": "170-190",
      "passed": true
    },
    "temperature": {
      "value": 18.5,
      "unit": "°C",
      "specification": "15-25",
      "passed": true
    },
    "ph": {
      "value": 12.8,
      "specification": "12.5-13.5",
      "passed": true
    },
    "density": {
      "value": 2250,
      "unit": "kg/m³",
      "specification": "2200-2300",
      "passed": true
    },
    "workability_time": {
      "value": 45,
      "unit": "min",
      "specification": "≥30",
      "passed": true
    }
  }
  */
  
  -- FESTMÖRTEL-EIGENSCHAFTEN
  hardened_properties JSONB,
  /* Struktur:
  {
    "compressive_strength": {
      "value": 26.5,
      "unit": "N/mm²",
      "individual_values": [25.8, 26.5, 27.2],
      "mean": 26.5,
      "std_dev": 0.7,
      "specification": "≥25.0",
      "class": "C25",
      "passed": true
    },
    "flexural_strength": {
      "value": 4.2,
      "unit": "N/mm²",
      "specification": "≥4.0",
      "class": "F4",
      "passed": true
    },
    "density": {
      "value": 2180,
      "unit": "kg/m³",
      "specification": "2150-2250",
      "passed": true
    }
  }
  */
  
  -- Grenzwert-Prüfung
  evaluation JSONB NOT NULL DEFAULT '{}',
  /* Struktur:
  {
    "overall_result": "pass", // pass, warning, fail
    "individual_check": true, // ≥ 0.85 × deklariert
    "mean_check": true,       // ≥ 0.95 × deklariert  
    "deviations": [],
    "action_required": null,
    "comments": ""
  }
  */
  
  -- Equipment & Kalibrierung
  equipment_used JSONB DEFAULT '[]',
  /* Array von:
  {
    "device": "Druckprüfmaschine",
    "model": "Controls 65-L1234",
    "calibration_date": "2024-06-15",
    "calibration_valid_until": "2025-06-15"
  }
  */
  
  -- Rohstoff-Chargen (Traceability)
  raw_material_batches JSONB DEFAULT '{}',
  /* Struktur:
  {
    "cement": {"batch": "2025-W03-001", "supplier": "HeidelbergCement"},
    "aggregate_0_4": {"batch": "2025-012", "supplier": "Kieswerk Müller"},
    "additive_1": {"batch": "FM-2025-234", "supplier": "BASF"}
  }
  */
  
  -- Status & Freigabe
  status TEXT CHECK (status IN ('pending', 'in_test', 'completed', 'rejected')) DEFAULT 'pending',
  released BOOLEAN DEFAULT false,
  released_by UUID REFERENCES users(id),
  released_at TIMESTAMP,
  
  -- Kommentare & Abweichungen
  comments TEXT,
  deviation_report_id UUID, -- Verweis auf Abweichungsbericht falls vorhanden
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Indizes für Performance
CREATE INDEX idx_lab_values_batch ON en13813_lab_values(batch_id);
CREATE INDEX idx_lab_values_recipe ON en13813_lab_values(recipe_id);
CREATE INDEX idx_lab_values_sample_date ON en13813_lab_values(sample_datetime DESC);
CREATE INDEX idx_lab_values_status ON en13813_lab_values(status);
CREATE INDEX idx_lab_values_evaluation ON en13813_lab_values USING GIN ((evaluation->'overall_result'));

-- ================================================
-- 3. FPC KONTROLLPUNKTE (Werkseigene Produktionskontrolle)
-- ================================================

CREATE TABLE en13813_fpc_control_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Kontrollpunkt-Definition
  control_type TEXT CHECK (control_type IN ('incoming_material', 'production', 'final_product')) NOT NULL,
  control_name TEXT NOT NULL, -- z.B. "Zement-Eingangskontrolle"
  control_category TEXT, -- z.B. "Rohstoffe", "Prozess", "Produkt"
  
  -- Frequenz basierend auf Produktionsvolumen
  frequency_low TEXT,    -- < 500 m³/Jahr
  frequency_medium TEXT, -- 500-5000 m³/Jahr  
  frequency_high TEXT,   -- > 5000 m³/Jahr
  
  -- Prüfparameter
  parameters JSONB NOT NULL DEFAULT '[]',
  /* Array von:
  {
    "name": "Konsistenz",
    "method": "Ausbreitmaß",
    "norm": "EN 12350-5",
    "unit": "mm",
    "specification": "170-190",
    "tolerance": "±10"
  }
  */
  
  -- Anforderungen
  requirements TEXT,
  acceptance_criteria JSONB,
  
  -- Status
  active BOOLEAN DEFAULT true,
  mandatory BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vordefinierte FPC-Kontrollpunkte einfügen
INSERT INTO en13813_fpc_control_points (control_type, control_name, control_category, frequency_low, frequency_medium, frequency_high, parameters, mandatory) VALUES
-- Eingangskontrolle
('incoming_material', 'Zement-Eingangskontrolle', 'Rohstoffe', 'pro Lieferung', 'pro Lieferung', 'pro Lieferung', 
  '[{"name": "Lieferschein", "method": "Sichtkontrolle"}, {"name": "CE-Kennzeichnung", "method": "Dokumentenprüfung"}, {"name": "Erstarrungszeit", "method": "EN 196-3", "frequency": "monatlich"}]'::jsonb, true),

('incoming_material', 'Gesteinskörnung-Kontrolle', 'Rohstoffe', 'wöchentlich', 'täglich', '2x täglich',
  '[{"name": "Korngrößenverteilung", "method": "EN 933-1", "unit": "%"}, {"name": "Feuchtegehalt", "method": "EN 1097-5", "unit": "%"}, {"name": "Rohdichte", "method": "EN 1097-6", "unit": "kg/m³"}]'::jsonb, true),

-- Produktionskontrolle
('production', 'Frischmörtel-Kontrolle', 'Prozess', 'täglich', 'pro Charge', 'kontinuierlich',
  '[{"name": "Konsistenz", "method": "EN 12350-5", "unit": "mm", "specification": "rezepturabhängig"}, {"name": "Temperatur", "method": "Thermometer", "unit": "°C", "specification": "10-30"}, {"name": "pH-Wert", "method": "pH-Meter", "specification": "12-13.5"}]'::jsonb, true),

('production', 'Mischzeit-Kontrolle', 'Prozess', 'täglich', 'pro Schicht', 'kontinuierlich',
  '[{"name": "Mischzeit", "method": "Timer", "unit": "min", "specification": "rezepturabhängig"}]'::jsonb, true),

-- Endprodukt-Kontrolle
('final_product', 'Festmörtel 28 Tage', 'Produkt', 'monatlich', 'wöchentlich', '2x wöchentlich',
  '[{"name": "Druckfestigkeit", "method": "EN 13892-2", "unit": "N/mm²", "age_days": 28}, {"name": "Biegezugfestigkeit", "method": "EN 13892-2", "unit": "N/mm²", "age_days": 28}]'::jsonb, true),

('final_product', 'Festmörtel 7 Tage', 'Produkt', 'bei Bedarf', 'monatlich', 'wöchentlich',
  '[{"name": "Druckfestigkeit", "method": "EN 13892-2", "unit": "N/mm²", "age_days": 7}]'::jsonb, false);

-- ================================================
-- 4. FPC DURCHFÜHRUNG (Tatsächliche Kontrollen)
-- ================================================

CREATE TABLE en13813_fpc_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  control_point_id UUID REFERENCES en13813_fpc_control_points(id),
  batch_id UUID REFERENCES en13813_batches(id),
  
  -- Durchführung
  execution_date DATE NOT NULL,
  execution_time TIME,
  executed_by TEXT NOT NULL,
  
  -- Ergebnisse
  results JSONB NOT NULL DEFAULT '{}',
  passed BOOLEAN NOT NULL DEFAULT true,
  
  -- Abweichungen
  deviations JSONB DEFAULT '[]',
  corrective_actions TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('completed', 'pending_review', 'approved')) DEFAULT 'completed',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 5. STATISTISCHE PROZESSLENKUNG (SPC)
-- ================================================

CREATE TABLE en13813_spc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  recipe_id UUID REFERENCES en13813_recipes(id),
  
  -- Periode
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Parameter
  parameter TEXT NOT NULL, -- z.B. "compressive_strength_28d"
  
  -- Statistische Kennwerte
  n_samples INTEGER NOT NULL,
  mean_value DECIMAL(10,2),
  std_deviation DECIMAL(10,3),
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  
  -- Prozessfähigkeit
  cpk DECIMAL(5,2), -- Minimum 1.33 für fähigen Prozess
  cp DECIMAL(5,2),
  
  -- Kontrollgrenzen
  ucl DECIMAL(10,2), -- Upper Control Limit (3σ)
  lcl DECIMAL(10,2), -- Lower Control Limit (3σ)
  uwl DECIMAL(10,2), -- Upper Warning Limit (2σ)
  lwl DECIMAL(10,2), -- Lower Warning Limit (2σ)
  
  -- Trend-Analyse
  trend TEXT CHECK (trend IN ('stable', 'increasing', 'decreasing', 'erratic')),
  out_of_control_points INTEGER DEFAULT 0,
  
  -- Audit
  calculated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, recipe_id, parameter, period_start, period_end)
);

-- ================================================
-- 6. VALIDIERUNGS-REGELN FÜR PRÜFBERICHTE
-- ================================================

CREATE TABLE en13813_test_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Für welchen Estrichtyp
  estrich_type TEXT CHECK (estrich_type IN ('CT', 'CA', 'MA', 'SR', 'AS')),
  
  -- Welche Eigenschaft
  property TEXT NOT NULL,
  
  -- Pflicht oder Optional
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Bedingungen (JSONB für Flexibilität)
  conditions JSONB,
  /* z.B.:
  {
    "if": {"intended_use.wearing_surface": true, "intended_use.with_flooring": false},
    "then": "mandatory"
  }
  */
  
  -- Prüfnorm
  test_norm TEXT NOT NULL,
  test_age_days INTEGER,
  
  -- Hinweise
  notes TEXT
);

-- Vordefinierte Validierungsregeln
INSERT INTO en13813_test_validation_rules (estrich_type, property, is_mandatory, test_norm, test_age_days, notes) VALUES
-- CT/CA/MA Pflichtprüfungen
('CT', 'compressive_strength', true, 'EN 13892-2', 28, 'Pflicht für CT'),
('CT', 'flexural_strength', true, 'EN 13892-2', 28, 'Pflicht für CT'),
('CA', 'compressive_strength', true, 'EN 13892-2', 28, 'Pflicht für CA'),
('CA', 'flexural_strength', true, 'EN 13892-2', 28, 'Pflicht für CA'),
('MA', 'compressive_strength', true, 'EN 13892-2', 28, 'Pflicht für MA'),
('MA', 'flexural_strength', true, 'EN 13892-2', 28, 'Pflicht für MA'),
('MA', 'surface_hardness', true, 'EN 13892-6', 28, 'SH ist PFLICHT bei MA!'),

-- AS spezifisch
('AS', 'indentation', true, 'EN 13813', NULL, 'Eindrücktiefe ist Pflicht bei AS'),

-- SR spezifisch
('SR', 'bond_strength', true, 'EN 13892-8', 7, 'Verbundfestigkeit ist Pflicht bei SR'),
('SR', 'impact_resistance', false, 'EN ISO 6272', NULL, 'Optional bei SR');

-- ================================================
-- 7. HILFSFUNKTIONEN
-- ================================================

-- Funktion zur Prüfung ob ITT vollständig für Rezeptur
CREATE OR REPLACE FUNCTION check_itt_completeness(recipe_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  recipe RECORD;
  missing_tests JSONB := '[]'::jsonb;
  result JSONB;
BEGIN
  -- Hole Rezeptur
  SELECT * INTO recipe FROM en13813_recipes WHERE id = recipe_uuid;
  
  -- Prüfe Pflichtfelder basierend auf Estrichtyp
  IF recipe.estrich_type IN ('CT', 'CA', 'MA') THEN
    -- Prüfe ob Druckfestigkeit getestet
    IF NOT EXISTS (
      SELECT 1 FROM en13813_test_reports 
      WHERE recipe_id = recipe_uuid 
        AND report_type = 'ITT'
        AND validation_status = 'valid'
        AND test_results ? 'compressive_strength'
    ) THEN
      missing_tests := missing_tests || '"Druckfestigkeit (EN 13892-2)"'::jsonb;
    END IF;
    
    -- Prüfe ob Biegezugfestigkeit getestet
    IF NOT EXISTS (
      SELECT 1 FROM en13813_test_reports 
      WHERE recipe_id = recipe_uuid 
        AND report_type = 'ITT'
        AND validation_status = 'valid'
        AND test_results ? 'flexural_strength'
    ) THEN
      missing_tests := missing_tests || '"Biegezugfestigkeit (EN 13892-2)"'::jsonb;
    END IF;
  END IF;
  
  -- MA spezifisch: Oberflächenhärte
  IF recipe.estrich_type = 'MA' AND recipe.surface_hardness_class != 'NPD' THEN
    IF NOT EXISTS (
      SELECT 1 FROM en13813_test_reports 
      WHERE recipe_id = recipe_uuid 
        AND report_type = 'ITT'
        AND validation_status = 'valid'
        AND test_results ? 'surface_hardness'
    ) THEN
      missing_tests := missing_tests || '"Oberflächenhärte (EN 13892-6)"'::jsonb;
    END IF;
  END IF;
  
  -- Verschleißwiderstand bei Nutzschicht
  IF (recipe.intended_use->>'wearing_surface')::boolean = true 
     AND (recipe.intended_use->>'with_flooring')::boolean = false THEN
    IF recipe.wear_resistance_method = 'bohme' THEN
      IF NOT EXISTS (
        SELECT 1 FROM en13813_test_reports 
        WHERE recipe_id = recipe_uuid 
          AND report_type = 'ITT'
          AND validation_status = 'valid'
          AND test_results ? 'wear_resistance_bohme'
      ) THEN
        missing_tests := missing_tests || '"Verschleiß Böhme (EN 13892-3)"'::jsonb;
      END IF;
    END IF;
  END IF;
  
  -- RWFC bei "mit Bodenbelag"
  IF (recipe.intended_use->>'with_flooring')::boolean = true THEN
    IF NOT EXISTS (
      SELECT 1 FROM en13813_test_reports 
      WHERE recipe_id = recipe_uuid 
        AND report_type = 'ITT'
        AND validation_status = 'valid'
        AND test_results ? 'rwfc'
    ) THEN
      missing_tests := missing_tests || '"RWFC (EN 13892-7)"'::jsonb;
    END IF;
  END IF;
  
  -- Brandverhalten wenn deklariert
  IF recipe.fire_class != 'NPD' AND recipe.fire_class != 'A1fl' THEN
    -- Bei Brandklasse != A1fl ist System 3 erforderlich
    IF NOT EXISTS (
      SELECT 1 FROM en13813_test_reports 
      WHERE recipe_id = recipe_uuid 
        AND report_type = 'System3'
        AND validation_status = 'valid'
        AND test_results ? 'fire_classification'
        AND notified_body_number IS NOT NULL
    ) THEN
      missing_tests := missing_tests || '"Brandverhalten System 3 mit Notified Body"'::jsonb;
    END IF;
  END IF;
  
  -- Ergebnis zusammenstellen
  result := jsonb_build_object(
    'complete', jsonb_array_length(missing_tests) = 0,
    'missing_tests', missing_tests,
    'can_generate_dop', jsonb_array_length(missing_tests) = 0
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. TRIGGER FÜR AUTOMATISCHE VALIDIERUNG
-- ================================================

CREATE OR REPLACE FUNCTION validate_test_report()
RETURNS TRIGGER AS $$
DECLARE
  recipe RECORD;
  errors JSONB := '[]'::jsonb;
BEGIN
  -- Hole zugehörige Rezeptur
  SELECT * INTO recipe FROM en13813_recipes WHERE id = NEW.recipe_id;
  
  -- Validiere Testergebnisse gegen deklarierte Werte
  IF NEW.test_results ? 'compressive_strength' THEN
    IF recipe.compressive_strength_class != 'NPD' THEN
      -- Prüfe ob Klasse erreicht wurde
      IF (NEW.test_results->'compressive_strength'->>'class')::text < recipe.compressive_strength_class THEN
        errors := errors || jsonb_build_object(
          'field', 'compressive_strength',
          'error', format('Getestete Klasse %s unter deklarierter Klasse %s', 
                         NEW.test_results->'compressive_strength'->>'class',
                         recipe.compressive_strength_class)
        );
      END IF;
    END IF;
  END IF;
  
  -- Weitere Validierungen...
  
  -- Setze Validierungsstatus
  IF jsonb_array_length(errors) = 0 THEN
    NEW.validation_status := 'valid';
  ELSE
    NEW.validation_status := 'invalid';
    NEW.validation_errors := errors;
  END IF;
  
  NEW.validated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_test_report
  BEFORE INSERT OR UPDATE ON en13813_test_reports
  FOR EACH ROW
  EXECUTE FUNCTION validate_test_report();

-- ================================================
-- 9. VIEWS FÜR ÜBERSICHT
-- ================================================

-- Übersicht ITT-Status pro Rezeptur
CREATE VIEW v_recipe_itt_status AS
SELECT 
  r.id,
  r.recipe_code,
  r.name,
  r.estrich_type,
  r.status as recipe_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM en13813_test_reports tr
      WHERE tr.recipe_id = r.id 
        AND tr.report_type = 'ITT'
        AND tr.validation_status = 'valid'
    ) THEN 'valid'
    ELSE 'missing'
  END as itt_status,
  (check_itt_completeness(r.id))->>'complete' as itt_complete,
  (check_itt_completeness(r.id))->>'missing_tests' as missing_tests
FROM en13813_recipes r;

-- Übersicht Laborwerte Trends
CREATE VIEW v_lab_value_trends AS
SELECT
  lv.recipe_id,
  r.recipe_code,
  r.name as recipe_name,
  DATE_TRUNC('week', lv.sample_datetime) as week,
  AVG((lv.hardened_properties->'compressive_strength'->>'value')::numeric) as avg_compressive,
  STDDEV((lv.hardened_properties->'compressive_strength'->>'value')::numeric) as stddev_compressive,
  MIN((lv.hardened_properties->'compressive_strength'->>'value')::numeric) as min_compressive,
  MAX((lv.hardened_properties->'compressive_strength'->>'value')::numeric) as max_compressive,
  COUNT(*) as n_samples
FROM en13813_lab_values lv
JOIN en13813_recipes r ON r.id = lv.recipe_id
WHERE lv.hardened_properties ? 'compressive_strength'
  AND lv.test_age_days = 28
GROUP BY lv.recipe_id, r.recipe_code, r.name, week
ORDER BY week DESC;

-- ================================================
-- 10. RLS POLICIES
-- ================================================

ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_lab_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_spc_data ENABLE ROW LEVEL SECURITY;

-- Policies für test_reports
CREATE POLICY "Users can view test reports for their tenant"
  ON en13813_test_reports FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert test reports for their tenant"
  ON en13813_test_reports FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update test reports for their tenant"
  ON en13813_test_reports FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Policies für lab_values
CREATE POLICY "Users can view lab values for their tenant"
  ON en13813_lab_values FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert lab values for their tenant"
  ON en13813_lab_values FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update lab values for their tenant"
  ON en13813_lab_values FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Policies für FPC
CREATE POLICY "Users can view FPC control points for their tenant"
  ON en13813_fpc_control_points FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) OR tenant_id IS NULL);

CREATE POLICY "Users can manage FPC control points for their tenant"
  ON en13813_fpc_control_points FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view FPC executions for their tenant"
  ON en13813_fpc_executions FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage FPC executions for their tenant"
  ON en13813_fpc_executions FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Policies für SPC
CREATE POLICY "Users can view SPC data for their tenant"
  ON en13813_spc_data FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage SPC data for their tenant"
  ON en13813_spc_data FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
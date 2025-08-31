-- ================================================
-- VOLLSTÄNDIGE EN 13813 MIGRATION
-- Erstellt alle fehlenden Tabellen und Erweiterungen
-- ================================================

-- Prüfe ob Basis-Tabellen existieren (tenants, profiles, documents)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    RAISE EXCEPTION 'Basis-Tabelle "tenants" fehlt. Bitte zuerst die Basis-Migration ausführen.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Basis-Tabelle "profiles" fehlt. Bitte zuerst die Basis-Migration ausführen.';
  END IF;
END $$;

-- ================================================
-- TEIL 1: BASIS EN13813 TABELLEN (falls nicht vorhanden)
-- ================================================

-- 1. Haupttabelle für Rezepturen
CREATE TABLE IF NOT EXISTS en13813_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('CT', 'CA', 'MA', 'SR', 'AS')) NOT NULL,
  
  -- Technische Eigenschaften
  compressive_strength_class TEXT NOT NULL,
  flexural_strength_class TEXT NOT NULL,
  wear_resistance_class TEXT,
  fire_class TEXT NOT NULL DEFAULT 'A1fl',
  
  -- Zusatzstoffe & Eigenschaften  
  additives JSONB DEFAULT '[]',
  special_properties JSONB DEFAULT '{}',
  
  -- Status & Validity
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  valid_from DATE,
  valid_until DATE,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_recipe_code_per_tenant UNIQUE(tenant_id, recipe_code)
);

-- 2. Prüfberichte (falls documents Tabelle existiert)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    CREATE TABLE IF NOT EXISTS en13813_test_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
      
      report_number TEXT NOT NULL,
      test_type TEXT NOT NULL CHECK (test_type IN ('initial_type_test', 'factory_control', 'audit')),
      test_date DATE NOT NULL,
      testing_body TEXT NOT NULL,
      notified_body_number TEXT,
      
      test_results JSONB NOT NULL,
      document_id UUID REFERENCES documents(id),
      valid_until DATE,
      status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked')),
      
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT unique_report_number_per_tenant UNIQUE(tenant_id, report_number)
    );
  END IF;
END $$;

-- 3. Chargen/Batches
CREATE TABLE IF NOT EXISTS en13813_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  batch_number TEXT NOT NULL,
  production_date DATE NOT NULL,
  quantity_tons DECIMAL(10,2),
  production_site TEXT,
  
  qc_data JSONB DEFAULT '{}',
  deviation_notes TEXT,
  
  status TEXT DEFAULT 'produced' CHECK (status IN ('produced', 'released', 'blocked', 'consumed')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_batch_number_per_tenant UNIQUE(tenant_id, batch_number)
);

-- 4. DoPs (falls documents Tabelle existiert)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    CREATE TABLE IF NOT EXISTS en13813_dops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
      batch_id UUID REFERENCES en13813_batches(id),
      
      dop_number TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      
      product_name TEXT NOT NULL,
      intended_use TEXT DEFAULT 'Estrichmörtel für die Verwendung in Gebäuden gemäß EN 13813',
      manufacturer_info JSONB NOT NULL,
      declared_performance JSONB NOT NULL,
      
      prepared_by UUID REFERENCES profiles(id),
      approved_by UUID REFERENCES profiles(id),
      approval_date TIMESTAMPTZ,
      
      pdf_document_id UUID REFERENCES documents(id),
      ce_label_document_id UUID REFERENCES documents(id),
      qr_code TEXT,
      public_url TEXT,
      
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'revoked')),
      issued_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT unique_dop_number_version UNIQUE(tenant_id, dop_number, version)
    );
    
    CREATE TABLE IF NOT EXISTS en13813_dop_packages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      
      name TEXT NOT NULL,
      recipient_type TEXT CHECK (recipient_type IN ('dealer', 'project', 'customer')) NOT NULL,
      recipient_info JSONB NOT NULL,
      
      dop_ids UUID[] NOT NULL,
      package_document_id UUID REFERENCES documents(id),
      
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- ================================================
-- TEIL 2: NEUE COMPLIANCE TABELLEN
-- ================================================

-- 1. Erweiterte Materialzusammensetzung
CREATE TABLE IF NOT EXISTS en13813_recipe_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Bindemittel
  binder_type TEXT NOT NULL,
  binder_designation TEXT NOT NULL,
  binder_amount_kg_m3 DECIMAL(10,2) NOT NULL,
  binder_supplier TEXT,
  
  -- Zuschlagstoffe
  aggregate_type TEXT,
  aggregate_max_size TEXT,
  sieve_curve JSONB,
  
  -- Wasser & W/B-Wert
  water_content DECIMAL(10,3),
  water_binder_ratio DECIMAL(10,3) NOT NULL,
  
  -- Zusatzmittel
  additives JSONB DEFAULT '[]',
  fibers JSONB,
  
  -- Frischmörtel-Eigenschaften
  fresh_mortar_properties JSONB DEFAULT '{
    "consistency": {
      "method": "flow_table",
      "target_mm": null,
      "tolerance_mm": null
    },
    "setting_time": {
      "initial_minutes": null,
      "final_minutes": null
    },
    "ph_value": null,
    "processing_time_minutes": null,
    "temperature_range": {
      "min_celsius": 5,
      "max_celsius": 30
    }
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Erweitere Rezepturen-Tabelle für neue Eigenschaften
DO $$ 
BEGIN
  -- wear_resistance_method
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'wear_resistance_method') THEN
    ALTER TABLE en13813_recipes 
    ADD COLUMN wear_resistance_method TEXT CHECK (wear_resistance_method IN ('bohme', 'bca', 'rolling_wheel'));
  END IF;
  
  -- wear_resistance_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'wear_resistance_class') THEN
    ALTER TABLE en13813_recipes ADD COLUMN wear_resistance_class TEXT;
  END IF;
  
  -- intended_use
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'intended_use') THEN
    ALTER TABLE en13813_recipes ADD COLUMN intended_use JSONB DEFAULT '{
      "wearing_surface": false,
      "with_flooring": false,
      "heated_screed": false,
      "indoor_only": true
    }';
  END IF;
  
  -- surface_hardness_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'surface_hardness_class') THEN
    ALTER TABLE en13813_recipes ADD COLUMN surface_hardness_class TEXT;
  END IF;
  
  -- bond_strength_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'bond_strength_class') THEN
    ALTER TABLE en13813_recipes ADD COLUMN bond_strength_class TEXT;
  END IF;
  
  -- impact_resistance_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'impact_resistance_class') THEN
    ALTER TABLE en13813_recipes ADD COLUMN impact_resistance_class TEXT;
  END IF;
  
  -- indentation_class
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'indentation_class') THEN
    ALTER TABLE en13813_recipes ADD COLUMN indentation_class TEXT;
  END IF;
  
  -- heated_screed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'en13813_recipes' 
                 AND column_name = 'heated_screed') THEN
    ALTER TABLE en13813_recipes ADD COLUMN heated_screed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. ITT-Prüfplan Tabelle
CREATE TABLE IF NOT EXISTS en13813_itt_test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  required_tests JSONB NOT NULL DEFAULT '[]',
  optional_tests JSONB DEFAULT '[]',
  
  test_status TEXT DEFAULT 'pending' CHECK (test_status IN ('pending', 'in_progress', 'completed', 'failed')),
  test_results JSONB DEFAULT '{}',
  
  last_validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Werkseigene Produktionskontrolle (FPC)
CREATE TABLE IF NOT EXISTS en13813_fpc_control_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  incoming_inspection JSONB DEFAULT '{
    "binder": {
      "frequency": "per_delivery",
      "tests": ["certificate_check", "visual_inspection"],
      "tolerance": "as_per_en197"
    },
    "aggregates": {
      "frequency": "weekly",
      "tests": ["moisture_content", "grading"],
      "tolerance": "±2%"
    }
  }',
  
  production_control JSONB DEFAULT '{
    "fresh_mortar": {
      "frequency": "per_batch",
      "tests": ["consistency", "temperature"],
      "limits": {}
    },
    "hardened_mortar": {
      "frequency": "monthly",
      "tests": ["compressive_strength", "flexural_strength"],
      "warning_limit": "90%_of_declared",
      "action_limit": "85%_of_declared"
    }
  }',
  
  calibration JSONB DEFAULT '{
    "scales": "quarterly",
    "mixers": "annually",
    "testing_equipment": "as_per_manufacturer"
  }',
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Erweiterte Compliance Tasks (überschreibt alte Tabelle falls vorhanden)
DROP TABLE IF EXISTS en13813_compliance_tasks CASCADE;
CREATE TABLE en13813_compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL CHECK (task_type IN (
    'itt_testing', 
    'recipe_validation', 
    'dop_creation', 
    'fpc_audit',
    'calibration',
    'retest_required'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rezeptur-Versionierung
CREATE TABLE IF NOT EXISTS en13813_recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES en13813_recipes(id),
  version_number INTEGER NOT NULL,
  changes JSONB NOT NULL,
  requires_retest BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(recipe_id, version_number)
);

-- ================================================
-- TEIL 3: INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON en13813_recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_tenant_id ON en13813_recipe_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_itt_test_plans_recipe_id ON en13813_itt_test_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_fpc_control_plans_recipe_id ON en13813_fpc_control_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_recipe_id ON en13813_compliance_tasks(recipe_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_status ON en13813_compliance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON en13813_compliance_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON en13813_recipe_versions(recipe_id);

-- ================================================
-- TEIL 4: ROW LEVEL SECURITY
-- ================================================

-- Enable RLS
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_recipe_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_itt_test_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies für alle Tabellen
DO $$ 
BEGIN
  -- en13813_recipes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipes' AND policyname = 'Users can view recipes in their tenant') THEN
    CREATE POLICY "Users can view recipes in their tenant" ON en13813_recipes
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipes' AND policyname = 'Users can manage recipes in their tenant') THEN
    CREATE POLICY "Users can manage recipes in their tenant" ON en13813_recipes
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- recipe_materials
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_materials' AND policyname = 'Users can view recipe materials in their tenant') THEN
    CREATE POLICY "Users can view recipe materials in their tenant" ON en13813_recipe_materials
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_materials' AND policyname = 'Users can manage recipe materials in their tenant') THEN
    CREATE POLICY "Users can manage recipe materials in their tenant" ON en13813_recipe_materials
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- ITT test plans
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_itt_test_plans' AND policyname = 'Users can manage ITT test plans in their tenant') THEN
    CREATE POLICY "Users can manage ITT test plans in their tenant" ON en13813_itt_test_plans
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- FPC control plans
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_fpc_control_plans' AND policyname = 'Users can manage FPC control plans in their tenant') THEN
    CREATE POLICY "Users can manage FPC control plans in their tenant" ON en13813_fpc_control_plans
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- Compliance tasks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_compliance_tasks' AND policyname = 'Users can manage compliance tasks in their tenant') THEN
    CREATE POLICY "Users can manage compliance tasks in their tenant" ON en13813_compliance_tasks
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- Recipe versions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_versions' AND policyname = 'Users can view recipe versions') THEN
    CREATE POLICY "Users can view recipe versions" ON en13813_recipe_versions
      FOR SELECT USING (
        recipe_id IN (
          SELECT id FROM en13813_recipes
          WHERE tenant_id IN (
            SELECT tenant_id FROM profiles 
            WHERE id = auth.uid()
          )
        )
      );
  END IF;
  
  -- Batches
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_batches' AND policyname = 'Users can manage batches in their tenant') THEN
    CREATE POLICY "Users can manage batches in their tenant" ON en13813_batches
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ================================================
-- FERTIG! Prüfe das Ergebnis mit:
-- ================================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'en13813_%'
-- ORDER BY table_name;
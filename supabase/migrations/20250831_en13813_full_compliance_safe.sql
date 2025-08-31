-- EN 13813 Full Compliance Migration (SAFE VERSION)
-- Diese Version prüft auf existierende Objekte bevor sie erstellt werden

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

-- 2. Erweitere Rezepturen-Tabelle für neue Eigenschaften (nur wenn Spalten nicht existieren)
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

-- 5. Compliance Tasks
CREATE TABLE IF NOT EXISTS en13813_compliance_tasks (
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

-- 7. Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON en13813_recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_tenant_id ON en13813_recipe_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_itt_test_plans_recipe_id ON en13813_itt_test_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_fpc_control_plans_recipe_id ON en13813_fpc_control_plans(recipe_id);
-- Skip compliance_tasks indexes as table might exist from base migration
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'en13813_compliance_tasks' 
             AND column_name = 'recipe_id') THEN
    CREATE INDEX IF NOT EXISTS idx_compliance_tasks_recipe_id ON en13813_compliance_tasks(recipe_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_status ON en13813_compliance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due_date ON en13813_compliance_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON en13813_recipe_versions(recipe_id);

-- 8. Enable RLS (nur wenn noch nicht aktiviert)
DO $$ 
BEGIN
  -- recipe_materials
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'en13813_recipe_materials' AND rowsecurity = true) THEN
    ALTER TABLE en13813_recipe_materials ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- itt_test_plans
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'en13813_itt_test_plans' AND rowsecurity = true) THEN
    ALTER TABLE en13813_itt_test_plans ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- fpc_control_plans
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'en13813_fpc_control_plans' AND rowsecurity = true) THEN
    ALTER TABLE en13813_fpc_control_plans ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- compliance_tasks
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'en13813_compliance_tasks' AND rowsecurity = true) THEN
    ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- recipe_versions
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'en13813_recipe_versions' AND rowsecurity = true) THEN
    ALTER TABLE en13813_recipe_versions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 9. RLS Policies (nur erstellen wenn nicht vorhanden)
DO $$ 
BEGIN
  -- recipe_materials policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_materials' AND policyname = 'Users can view recipe materials in their tenant') THEN
    CREATE POLICY "Users can view recipe materials in their tenant" ON en13813_recipe_materials
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_materials' AND policyname = 'Users can insert recipe materials in their tenant') THEN
    CREATE POLICY "Users can insert recipe materials in their tenant" ON en13813_recipe_materials
      FOR INSERT WITH CHECK (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipe_materials' AND policyname = 'Users can update recipe materials in their tenant') THEN
    CREATE POLICY "Users can update recipe materials in their tenant" ON en13813_recipe_materials
      FOR UPDATE USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- ITT test plans policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_itt_test_plans' AND policyname = 'Users can view ITT test plans in their tenant') THEN
    CREATE POLICY "Users can view ITT test plans in their tenant" ON en13813_itt_test_plans
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_itt_test_plans' AND policyname = 'Users can manage ITT test plans in their tenant') THEN
    CREATE POLICY "Users can manage ITT test plans in their tenant" ON en13813_itt_test_plans
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- FPC control plans policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_fpc_control_plans' AND policyname = 'Users can view FPC control plans in their tenant') THEN
    CREATE POLICY "Users can view FPC control plans in their tenant" ON en13813_fpc_control_plans
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_fpc_control_plans' AND policyname = 'Users can manage FPC control plans in their tenant') THEN
    CREATE POLICY "Users can manage FPC control plans in their tenant" ON en13813_fpc_control_plans
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- Compliance tasks policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_compliance_tasks' AND policyname = 'Users can view compliance tasks in their tenant') THEN
    CREATE POLICY "Users can view compliance tasks in their tenant" ON en13813_compliance_tasks
      FOR SELECT USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_compliance_tasks' AND policyname = 'Users can manage compliance tasks in their tenant') THEN
    CREATE POLICY "Users can manage compliance tasks in their tenant" ON en13813_compliance_tasks
      FOR ALL USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
  
  -- Recipe versions policies
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
END $$;
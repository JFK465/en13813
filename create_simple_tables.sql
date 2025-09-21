-- ================================================
-- VEREINFACHTE EN13813 TABELLEN OHNE ABHÄNGIGKEITEN
-- ================================================

-- 1. Haupttabelle für Rezepturen (ohne tenant/profile Abhängigkeiten)
CREATE TABLE IF NOT EXISTS en13813_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('CT', 'CA', 'MA', 'SR', 'AS')) NOT NULL,
  
  -- Technische Eigenschaften
  compressive_strength_class TEXT,
  flexural_strength_class TEXT,
  wear_resistance_class TEXT,
  fire_class TEXT DEFAULT 'A1fl',
  
  -- Zusatzstoffe & Eigenschaften  
  additives JSONB DEFAULT '[]',
  special_properties JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Materialzusammensetzung (ohne tenant Abhängigkeit)
CREATE TABLE IF NOT EXISTS en13813_recipe_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  -- Bindemittel
  binder_type TEXT NOT NULL,
  binder_designation TEXT NOT NULL,
  binder_amount_kg_m3 DECIMAL(10,2) NOT NULL,
  water_binder_ratio DECIMAL(10,3) NOT NULL,
  
  -- Zusatzmittel
  additives JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ITT Test Plans (ohne tenant Abhängigkeit)
CREATE TABLE IF NOT EXISTS en13813_itt_test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  required_tests JSONB NOT NULL DEFAULT '[]',
  optional_tests JSONB DEFAULT '[]',
  test_status TEXT DEFAULT 'pending' CHECK (test_status IN ('pending', 'in_progress', 'completed', 'failed')),
  test_results JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FPC Control Plans (ohne tenant Abhängigkeit)
CREATE TABLE IF NOT EXISTS en13813_fpc_control_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  control_frequency JSONB NOT NULL DEFAULT '{}',
  control_parameters JSONB NOT NULL DEFAULT '{}',
  acceptance_criteria JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Compliance Tasks (ohne tenant/profile Abhängigkeit)
CREATE TABLE IF NOT EXISTS en13813_compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON en13813_recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_itt_test_plans_recipe_id ON en13813_itt_test_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_fpc_control_plans_recipe_id ON en13813_fpc_control_plans(recipe_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_recipe_id ON en13813_compliance_tasks(recipe_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_status ON en13813_compliance_tasks(status);

-- Erfolg
DO $$
BEGIN
  RAISE NOTICE 'EN13813 Tabellen erfolgreich erstellt!';
END $$;
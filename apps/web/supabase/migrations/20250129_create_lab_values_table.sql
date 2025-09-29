-- Create en13813_lab_values table
CREATE TABLE IF NOT EXISTS en13813_lab_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID, -- Removed reference to tenants table (doesn't exist yet)
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id) ON DELETE SET NULL,

  -- Sample information
  sample_id VARCHAR(100) NOT NULL,
  sample_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sample_location VARCHAR(255),
  sampled_by VARCHAR(255),

  -- Test parameters
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('fresh', 'hardened', 'both')),
  test_age_days INTEGER,
  test_date TIMESTAMP WITH TIME ZONE,
  tested_by VARCHAR(255),

  -- Fresh concrete properties (JSONB)
  fresh_properties JSONB DEFAULT '{}',
  /* Example structure:
  {
    "consistency": {
      "value": 15,
      "unit": "cm",
      "method": "slump",
      "specification": "10-20 cm"
    },
    "air_content": {
      "value": 4.5,
      "unit": "%",
      "specification": "4-6%"
    },
    "fresh_density": {
      "value": 2350,
      "unit": "kg/m³"
    },
    "temperature": {
      "value": 22,
      "unit": "°C"
    }
  }
  */

  -- Hardened concrete properties (JSONB)
  hardened_properties JSONB DEFAULT '{}',
  /* Example structure:
  {
    "compressive_strength": {
      "value": 35.5,
      "unit": "N/mm²",
      "specification": "≥ 30",
      "test_method": "EN 12390-3"
    },
    "flexural_strength": {
      "value": 5.2,
      "unit": "N/mm²",
      "specification": "≥ 4.5"
    },
    "density": {
      "value": 2380,
      "unit": "kg/m³"
    },
    "wear_resistance": {
      "value": 18.5,
      "unit": "cm³/50cm²",
      "specification": "≤ 22"
    }
  }
  */

  -- Evaluation
  evaluation JSONB DEFAULT '{}',
  /* Example structure:
  {
    "overall_result": "pass", // pass, warning, fail
    "deviations": ["compressive_strength below target"],
    "action_required": "Monitor next batch closely"
  }
  */

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Comments
  notes TEXT,
  internal_notes TEXT,

  -- Documents
  test_report_url TEXT,
  attachments JSONB DEFAULT '[]',

  -- Quality control
  released BOOLEAN DEFAULT false,
  release_date TIMESTAMP WITH TIME ZONE,
  released_by VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  -- Indexes
  CONSTRAINT unique_sample_id UNIQUE (tenant_id, sample_id)
);

-- Create indexes for performance
CREATE INDEX idx_lab_values_tenant ON en13813_lab_values(tenant_id);
CREATE INDEX idx_lab_values_recipe ON en13813_lab_values(recipe_id);
CREATE INDEX idx_lab_values_batch ON en13813_lab_values(batch_id);
CREATE INDEX idx_lab_values_sample_date ON en13813_lab_values(sample_datetime);
CREATE INDEX idx_lab_values_status ON en13813_lab_values(status);
CREATE INDEX idx_lab_values_test_type ON en13813_lab_values(test_type);

-- Enable RLS
ALTER TABLE en13813_lab_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified - no multi-tenancy for now)
CREATE POLICY "Users can view all lab values"
  ON en13813_lab_values FOR SELECT
  USING (true);  -- Allow all authenticated users to read

CREATE POLICY "Users can create lab values"
  ON en13813_lab_values FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);  -- Any authenticated user can insert

CREATE POLICY "Users can update lab values"
  ON en13813_lab_values FOR UPDATE
  USING (auth.uid() IS NOT NULL);  -- Any authenticated user can update

CREATE POLICY "Users can delete lab values"
  ON en13813_lab_values FOR DELETE
  USING (auth.uid() IS NOT NULL);  -- Any authenticated user can delete

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_en13813_lab_values_updated_at
  BEFORE UPDATE ON en13813_lab_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create related table for lab measurements if not exists
CREATE TABLE IF NOT EXISTS en13813_lab_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID, -- Removed reference to tenants table (doesn't exist yet)
  lab_value_id UUID REFERENCES en13813_lab_values(id) ON DELETE CASCADE,

  parameter_name VARCHAR(100) NOT NULL,
  parameter_value NUMERIC NOT NULL,
  parameter_unit VARCHAR(50),

  specification_min NUMERIC,
  specification_max NUMERIC,
  specification_text VARCHAR(255),

  test_method VARCHAR(100),
  equipment_id VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on measurements table
ALTER TABLE en13813_lab_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for measurements (Simplified - no multi-tenancy for now)
CREATE POLICY "Users can view all lab measurements"
  ON en13813_lab_measurements FOR SELECT
  USING (true);  -- Allow all authenticated users to read

CREATE POLICY "Users can create lab measurements"
  ON en13813_lab_measurements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);  -- Any authenticated user can insert

CREATE POLICY "Users can update lab measurements"
  ON en13813_lab_measurements FOR UPDATE
  USING (auth.uid() IS NOT NULL);  -- Any authenticated user can update

CREATE POLICY "Users can delete lab measurements"
  ON en13813_lab_measurements FOR DELETE
  USING (auth.uid() IS NOT NULL);  -- Any authenticated user can delete
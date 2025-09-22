-- Add extended fields to existing audit table if not present
-- This migration adds the missing fields for full EN13813 compliance

-- Check and add missing columns one by one
DO $$
BEGIN
  -- AVCP-System fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'rf_regulated') THEN
    ALTER TABLE en13813_audits ADD COLUMN rf_regulated BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'rf_improvement_stage') THEN
    ALTER TABLE en13813_audits ADD COLUMN rf_improvement_stage BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'dangerous_substances_regulated') THEN
    ALTER TABLE en13813_audits ADD COLUMN dangerous_substances_regulated BOOLEAN DEFAULT FALSE;
  END IF;

  -- ITT fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'itt_available') THEN
    ALTER TABLE en13813_audits ADD COLUMN itt_available BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'itt_after_change') THEN
    ALTER TABLE en13813_audits ADD COLUMN itt_after_change BOOLEAN DEFAULT FALSE;
  END IF;

  -- Conformity assessment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'conformity_method') THEN
    ALTER TABLE en13813_audits ADD COLUMN conformity_method VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'sample_size') THEN
    ALTER TABLE en13813_audits ADD COLUMN sample_size INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'mean_value') THEN
    ALTER TABLE en13813_audits ADD COLUMN mean_value NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'standard_deviation') THEN
    ALTER TABLE en13813_audits ADD COLUMN standard_deviation NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'en13813_audits' AND column_name = 'ka_value') THEN
    ALTER TABLE en13813_audits ADD COLUMN ka_value NUMERIC;
  END IF;

  -- Update AVCP system default if column exists but lacks default
  ALTER TABLE en13813_audits ALTER COLUMN avcp_system SET DEFAULT '4';

  -- Remove deprecated column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_name = 'en13813_audits' AND column_name = 'reaction_to_fire_relevant') THEN
    ALTER TABLE en13813_audits DROP COLUMN reaction_to_fire_relevant;
  END IF;
END $$;

-- Add comment to document the fields
COMMENT ON COLUMN en13813_audits.rf_regulated IS 'Reaction to fire regulated per EN13813';
COMMENT ON COLUMN en13813_audits.rf_improvement_stage IS 'Reaction to fire improvement stage';
COMMENT ON COLUMN en13813_audits.dangerous_substances_regulated IS 'Dangerous substances regulated';
COMMENT ON COLUMN en13813_audits.itt_available IS 'Initial Type Testing available';
COMMENT ON COLUMN en13813_audits.itt_after_change IS 'ITT required after change';
COMMENT ON COLUMN en13813_audits.conformity_method IS 'Conformity assessment method: variables or attributes';
COMMENT ON COLUMN en13813_audits.sample_size IS 'Number of samples for conformity assessment';
COMMENT ON COLUMN en13813_audits.mean_value IS 'Mean value from test results';
COMMENT ON COLUMN en13813_audits.standard_deviation IS 'Standard deviation from test results';
COMMENT ON COLUMN en13813_audits.ka_value IS 'kA value from EN13813 Table 12';
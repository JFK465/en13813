-- Create table for recipe drafts (optional - for cloud sync)
CREATE TABLE IF NOT EXISTS en13813_recipe_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_name VARCHAR(255) NOT NULL,
  draft_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique draft names per user
  UNIQUE(user_id, draft_name)
);

-- Enable RLS
ALTER TABLE en13813_recipe_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own drafts" ON en13813_recipe_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own drafts" ON en13813_recipe_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON en13813_recipe_drafts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON en13813_recipe_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_recipe_drafts_user_id ON en13813_recipe_drafts(user_id);
CREATE INDEX idx_recipe_drafts_updated_at ON en13813_recipe_drafts(updated_at DESC);
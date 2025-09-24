-- Create feedback table for beta user feedback
CREATE TABLE IF NOT EXISTS en13813_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'praise')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  satisfaction text CHECK (satisfaction IN ('very-satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very-unsatisfied')),
  title text NOT NULL,
  description text NOT NULL,
  module text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'planned', 'in_progress', 'completed', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE en13813_feedback ENABLE ROW LEVEL SECURITY;

-- Users can create their own feedback
CREATE POLICY "Users can create feedback" ON en13813_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON en13813_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_en13813_feedback_user_id ON en13813_feedback(user_id);
CREATE INDEX idx_en13813_feedback_type ON en13813_feedback(type);
CREATE INDEX idx_en13813_feedback_status ON en13813_feedback(status);
CREATE INDEX idx_en13813_feedback_created_at ON en13813_feedback(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_en13813_feedback_updated_at
  BEFORE UPDATE ON en13813_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
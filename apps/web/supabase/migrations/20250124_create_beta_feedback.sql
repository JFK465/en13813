-- Create beta_feedback table for collecting user feedback during beta phase
CREATE TABLE IF NOT EXISTS public.beta_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email text,
    type text NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'praise', 'other')),
    message text NOT NULL,
    timestamp timestamptz NOT NULL DEFAULT now(),
    user_agent text,
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.beta_feedback
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.beta_feedback
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX idx_beta_feedback_status ON public.beta_feedback(status);
CREATE INDEX idx_beta_feedback_type ON public.beta_feedback(type);
CREATE INDEX idx_beta_feedback_created_at ON public.beta_feedback(created_at DESC);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beta_feedback_updated_at
BEFORE UPDATE ON public.beta_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.beta_feedback IS 'Stores user feedback during the beta phase of EstrichManager';
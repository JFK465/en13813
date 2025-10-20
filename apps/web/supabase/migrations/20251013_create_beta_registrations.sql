-- Create beta_registrations table for beta program sign-ups
CREATE TABLE IF NOT EXISTS public.beta_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  company_size TEXT NOT NULL,
  current_management TEXT,
  challenges TEXT[] DEFAULT '{}',
  challenge_level TEXT NOT NULL,
  newsletter_consent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_beta_registrations_email ON public.beta_registrations(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_beta_registrations_status ON public.beta_registrations(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_beta_registrations_created_at ON public.beta_registrations(created_at DESC);

-- Add RLS policies
ALTER TABLE public.beta_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration)
CREATE POLICY "Anyone can register for beta"
  ON public.beta_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view and update registrations
-- (You'll need to add an admin role check here based on your auth setup)
CREATE POLICY "Admins can view all registrations"
  ON public.beta_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      -- Add your admin check here, e.g.:
      -- AND auth.users.email IN ('admin@estrichmanager.de')
    )
  );

CREATE POLICY "Admins can update registrations"
  ON public.beta_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      -- Add your admin check here
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_beta_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_beta_registrations_updated_at
  BEFORE UPDATE ON public.beta_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_registrations_updated_at();

-- Add comments
COMMENT ON TABLE public.beta_registrations IS 'Stores beta program registration requests';
COMMENT ON COLUMN public.beta_registrations.status IS 'Registration status: pending, approved, rejected, contacted';
COMMENT ON COLUMN public.beta_registrations.challenges IS 'Array of EN13813 challenges selected by the user';
COMMENT ON COLUMN public.beta_registrations.challenge_level IS 'User rating of how challenging EN13813 is (1-5)';

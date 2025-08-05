-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source VARCHAR(50) DEFAULT 'landing_page',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Add index for created_at for sorting
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anonymous users
CREATE POLICY "Allow anonymous waitlist signups" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to view waitlist (for admin)
CREATE POLICY "Allow authenticated users to view waitlist" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);
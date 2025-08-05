-- Waitlist Table Setup for Legalese AI
-- This script only creates the waitlist functionality

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source VARCHAR(50) DEFAULT 'landing_page',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous waitlist signups" ON public.waitlist;
DROP POLICY IF EXISTS "Allow authenticated users to view waitlist" ON public.waitlist;

-- Create policies
CREATE POLICY "Allow anonymous waitlist signups" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view waitlist" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Verify setup
SELECT 'Waitlist table created successfully' as status;
-- Add lifetime documents created field to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS lifetime_documents_created INTEGER DEFAULT 0;

-- Update existing users to have their current document count as lifetime
UPDATE public.user_profiles p
SET lifetime_documents_created = (
  SELECT COUNT(*) 
  FROM public.documents d 
  WHERE d.user_id = p.id
)
WHERE lifetime_documents_created = 0;

-- Create or replace function to increment lifetime count on document creation
CREATE OR REPLACE FUNCTION public.increment_lifetime_documents()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment the lifetime documents counter for the user
  UPDATE public.user_profiles
  SET lifetime_documents_created = lifetime_documents_created + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment count on document insertion
DROP TRIGGER IF EXISTS increment_lifetime_documents_trigger ON public.documents;
CREATE TRIGGER increment_lifetime_documents_trigger
AFTER INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.increment_lifetime_documents();

-- Note: We intentionally DO NOT create a decrement trigger for DELETE
-- because lifetime usage should never decrease
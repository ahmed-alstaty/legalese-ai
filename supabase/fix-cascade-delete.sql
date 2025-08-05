-- Fix foreign key constraints to allow document deletion
-- This will CASCADE delete related records when a document is deleted

-- Drop existing foreign key constraints
ALTER TABLE public.analyses 
  DROP CONSTRAINT IF EXISTS analyses_document_id_fkey;

ALTER TABLE public.user_annotations 
  DROP CONSTRAINT IF EXISTS user_annotations_analysis_id_fkey;

ALTER TABLE public.chat_conversations 
  DROP CONSTRAINT IF EXISTS chat_conversations_analysis_id_fkey;

-- Re-add foreign key constraints with CASCADE DELETE
ALTER TABLE public.analyses 
  ADD CONSTRAINT analyses_document_id_fkey 
  FOREIGN KEY (document_id) 
  REFERENCES public.documents(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_annotations 
  ADD CONSTRAINT user_annotations_analysis_id_fkey 
  FOREIGN KEY (analysis_id) 
  REFERENCES public.analyses(id) 
  ON DELETE CASCADE;

ALTER TABLE public.chat_conversations 
  ADD CONSTRAINT chat_conversations_analysis_id_fkey 
  FOREIGN KEY (analysis_id) 
  REFERENCES public.analyses(id) 
  ON DELETE CASCADE;

-- Note: Usage tracking (analyses_used_this_month) is stored in user_profiles
-- and will NOT be affected by document deletion, preserving the usage count
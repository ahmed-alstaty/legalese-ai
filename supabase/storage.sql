-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for documents bucket

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
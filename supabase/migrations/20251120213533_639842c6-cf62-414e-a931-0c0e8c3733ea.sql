-- Fix storage bucket RLS policies to allow viewing complaint attachments
-- Allow authenticated users to view their own complaint attachments
CREATE POLICY "Users can view complaint attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments' AND
  EXISTS (
    SELECT 1 FROM public.complaints c
    JOIN public.complaint_attachments ca ON ca.complaint_id = c.id
    WHERE ca.file_url = name
    AND (c.reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Allow authenticated users to insert complaint attachments
CREATE POLICY "Users can upload complaint attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-attachments');

-- Update complaints RLS to allow admins to view all complaints
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;

CREATE POLICY "Users can view their complaints or admins can view all"
ON public.complaints FOR SELECT
TO authenticated
USING (
  reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- Allow admins to view all complaint attachments
DROP POLICY IF EXISTS "Users can view their own attachments" ON public.complaint_attachments;

CREATE POLICY "Users can view attachments or admins can view all"
ON public.complaint_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.complaints
    WHERE id = complaint_id
    AND (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
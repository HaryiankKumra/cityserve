-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name)
VALUES ('complaint-attachments', 'complaint-attachments')
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaint attachments
CREATE POLICY "Anyone can view complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-attachments' AND auth.uid() IS NOT NULL);

-- Insert sample departments
INSERT INTO departments (name, description, contact_email, contact_phone, is_active) VALUES
('Public Works Department', 'Handles road maintenance, infrastructure repairs, and public facilities', 'publicworks@cityserve.gov', '7986520232', true),
('Sanitation Department', 'Manages waste collection, recycling programs, and city cleanliness', 'sanitation@cityserve.gov', '7986520233', true),
('Utilities Department', 'Oversees water supply, electricity, street lighting, and utility services', 'utilities@cityserve.gov', '7986520234', true),
('Parks & Recreation', 'Maintains parks, playgrounds, and recreational facilities', 'parks@cityserve.gov', '7986520235', true),
('Traffic Management', 'Handles traffic signals, road signs, and traffic flow optimization', 'traffic@cityserve.gov', '7986520236', true)
ON CONFLICT (id) DO NOTHING;
-- ============================================
-- CITYSERVE DATABASE EXPORT
-- Complete database schema and data
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE ENUMS
-- ============================================

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'citizen');

-- Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- Create enum for complaint priority
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');


-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status public.complaint_status DEFAULT 'new',
  priority public.complaint_priority DEFAULT 'medium',
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_department_id UUID REFERENCES public.departments(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create complaint_attachments table
CREATE TABLE public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 4. CREATE FUNCTIONS
-- ============================================

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Create trigger for complaints updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- RLS Policies for departments
CREATE POLICY "Anyone can view active departments"
  ON public.departments FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for complaints
CREATE POLICY "Anyone can view complaints"
  ON public.complaints FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create complaints"
  ON public.complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own complaints"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can update any complaint"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete complaints"
  ON public.complaints FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their complaints or admins can view all"
  ON public.complaints FOR SELECT
  TO authenticated
  USING (
    reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for complaint_attachments
CREATE POLICY "Anyone can view attachments"
  ON public.complaint_attachments FOR SELECT
  USING (true);

CREATE POLICY "Complaint owners can manage attachments"
  ON public.complaint_attachments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.reporter_id = auth.uid()
    )
  );

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

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ============================================
-- 7. CREATE STORAGE BUCKET AND POLICIES
-- ============================================

-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaint attachments
CREATE POLICY "Anyone can view complaint images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Authenticated users can upload complaint images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-attachments' AND auth.uid() IS NOT NULL);

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

CREATE POLICY "Users can upload complaint attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-attachments');


-- ============================================
-- 8. INSERT SAMPLE DATA
-- ============================================

-- Insert sample departments
INSERT INTO public.departments (name, description, contact_email, contact_phone, is_active) VALUES
  ('Public Works Department', 'Handles road maintenance, infrastructure repairs, and public facilities', 'publicworks@cityserve.gov', '7986520232', true),
  ('Sanitation Department', 'Manages waste collection, recycling programs, and city cleanliness', 'sanitation@cityserve.gov', '7986520233', true),
  ('Utilities Department', 'Oversees water supply, electricity, street lighting, and utility services', 'utilities@cityserve.gov', '7986520234', true),
  ('Parks & Recreation', 'Maintains parks, playgrounds, and recreational facilities', 'parks@cityserve.gov', '7986520235', true),
  ('Traffic Management', 'Handles traffic signals, road signs, and traffic flow optimization', 'traffic@cityserve.gov', '7986520236', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your CityServe database is now ready!
-- 
-- Next steps:
-- 1. Enable Email Auth in Supabase Dashboard > Authentication > Providers
-- 2. Configure Site URL in Supabase Dashboard > Authentication > URL Configuration
-- 3. (Optional) Add your first admin user by running:
--    INSERT INTO public.user_roles (user_id, role) 
--    VALUES ('your-user-uuid-here', 'admin');
-- ============================================

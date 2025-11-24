-- ============================================
-- SAMPLE DATA INSERTION SCRIPT
-- Inserts departments and sample complaints
-- ============================================

-- 1. Insert Multiple Departments
INSERT INTO departments (name, description, contact_email, contact_phone, is_active) VALUES
  ('Public Works', 'Infrastructure, roads, bridges, and construction', 'publicworks@city.gov', '+1-555-0101', true),
  ('Sanitation', 'Waste management, cleanliness, and hygiene', 'sanitation@city.gov', '+1-555-0102', true),
  ('Water Supply', 'Water distribution, quality, and maintenance', 'water@city.gov', '+1-555-0103', true),
  ('Electricity', 'Power supply, street lighting, and electrical issues', 'electricity@city.gov', '+1-555-0104', true),
  ('Parks & Recreation', 'Parks, playgrounds, and recreational facilities', 'parks@city.gov', '+1-555-0105', true),
  ('Traffic Management', 'Traffic signals, signs, and congestion', 'traffic@city.gov', '+1-555-0106', true),
  ('Health & Safety', 'Public health, safety inspections, and regulations', 'health@city.gov', '+1-555-0107', true),
  ('Building Department', 'Permits, inspections, and code enforcement', 'building@city.gov', '+1-555-0108', true)
ON CONFLICT DO NOTHING;

-- 2. Insert 200 Resolved Complaints (Distributed Across Departments)
DO $$
DECLARE
  dept_array uuid[];
  dept_id uuid;
  i INTEGER;
BEGIN
  -- Get all department IDs into an array
  SELECT ARRAY_AGG(id) INTO dept_array FROM departments WHERE is_active = true;
  
  -- Insert 200 complaints, cycling through departments
  FOR i IN 1..200 LOOP
    -- Pick department by cycling through array
    dept_id := dept_array[1 + (i % array_length(dept_array, 1))];
    
    INSERT INTO complaints (
      title, description, category, status, priority,
      assigned_department_id, latitude, longitude, address,
      created_at, updated_at
    ) VALUES (
      'Complaint #' || i,
      'Sample resolved complaint. This issue was successfully addressed and closed.',
      CASE (i % 8)
        WHEN 0 THEN 'Roads'
        WHEN 1 THEN 'Water'
        WHEN 2 THEN 'Electricity'
        WHEN 3 THEN 'Sanitation'
        WHEN 4 THEN 'Parks'
        WHEN 5 THEN 'Traffic'
        WHEN 6 THEN 'Health'
        ELSE 'Building'
      END,
      'resolved'::complaint_status,
      CASE (i % 4)
        WHEN 0 THEN 'low'::complaint_priority
        WHEN 1 THEN 'medium'::complaint_priority
        WHEN 2 THEN 'high'::complaint_priority
        ELSE 'urgent'::complaint_priority
      END,
      dept_id,
      28.6139 + (random() * 0.1 - 0.05),
      77.2090 + (random() * 0.1 - 0.05),
      'Sample Address ' || i || ', New Delhi',
      NOW() - (random() * interval '365 days'),
      NOW() - (random() * interval '60 days')
    );
  END LOOP;
END $$;

-- 3. Insert 50 Active Complaints (Mixed Status, Distributed)
DO $$
DECLARE
  dept_array uuid[];
  dept_id uuid;
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO dept_array FROM departments WHERE is_active = true;
  
  FOR i IN 1..50 LOOP
    dept_id := dept_array[1 + (i % array_length(dept_array, 1))];
    
    INSERT INTO complaints (
      title, description, category, status, priority,
      assigned_department_id, latitude, longitude, address,
      created_at, updated_at
    ) VALUES (
      'Active Issue #' || i,
      'This is an ongoing complaint that requires attention.',
      CASE (i % 8)
        WHEN 0 THEN 'Roads'
        WHEN 1 THEN 'Water'
        WHEN 2 THEN 'Electricity'
        WHEN 3 THEN 'Sanitation'
        WHEN 4 THEN 'Parks'
        WHEN 5 THEN 'Traffic'
        WHEN 6 THEN 'Health'
        ELSE 'Building'
      END,
      CASE (i % 2)
        WHEN 0 THEN 'new'::complaint_status
        ELSE 'in_progress'::complaint_status
      END,
      CASE (i % 4)
        WHEN 0 THEN 'low'::complaint_priority
        WHEN 1 THEN 'medium'::complaint_priority
        WHEN 2 THEN 'high'::complaint_priority
        ELSE 'urgent'::complaint_priority
      END,
      dept_id,
      28.6139 + (random() * 0.1 - 0.05),
      77.2090 + (random() * 0.1 - 0.05),
      'Active Location ' || i || ', New Delhi',
      NOW() - (random() * interval '30 days'),
      NOW() - (random() * interval '7 days')
    );
  END LOOP;
END $$;

-- ============================================
-- HOW TO MAKE SOMEONE A MODERATOR
-- ============================================
-- Replace 'user-id-here' with the actual user ID from auth.users
-- You can find user IDs in Backend -> Authentication -> Users

-- Make a user a moderator:
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-here', 'moderator'::app_role)
ON CONFLICT DO NOTHING;

-- Make a user an admin:
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-here', 'admin'::app_role)
ON CONFLICT DO NOTHING;

-- Remove a role:
DELETE FROM user_roles 
WHERE user_id = 'user-id-here' AND role = 'moderator'::app_role;

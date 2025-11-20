# CityServe Database Setup Instructions

This guide explains how to use the `database_export.sql` file to set up your CityServe database in Supabase.

## Prerequisites

1. A Supabase account
2. Access to your Supabase project's SQL Editor

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query" to create a new SQL query

### 2. Run the Database Export

1. Open the `database_export.sql` file
2. Copy the entire contents
3. Paste it into the SQL Editor
4. Click "Run" to execute the script

The script will create:
- **Enums**: App roles, complaint statuses, and priorities
- **Tables**: Departments, complaints, complaint_attachments, user_roles
- **Functions**: Role checking and timestamp update functions
- **Triggers**: Auto-update timestamps
- **RLS Policies**: Secure access control for all tables
- **Storage Bucket**: For complaint image attachments
- **Sample Data**: 5 pre-configured departments

### 3. Configure Authentication

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Email** authentication
3. Configure the following settings:
   - Enable Email Confirmations (or disable for testing)
   - Set Site URL to your app's URL
   - Add redirect URLs for authentication

### 4. Create Your First Admin User

After creating your first user account through the app:

1. Go to SQL Editor
2. Run this query to make a user an admin:

```sql
-- Replace 'user-email@example.com' with the actual user's email
INSERT INTO public.user_roles (user_id, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'user-email@example.com'),
  'admin'
);
```

Alternatively, if you know the user's UUID:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('your-user-uuid-here', 'admin');
```

### 5. Configure Storage

The storage bucket `complaint-attachments` is created automatically. To verify:

1. Go to **Storage** in Supabase Dashboard
2. Confirm `complaint-attachments` bucket exists
3. Check that it's set to private (default)

## Database Schema Overview

### Tables

1. **departments**
   - Stores civic departments (Public Works, Sanitation, etc.)
   - Fields: name, description, contact info, active status

2. **complaints**
   - Main table for citizen complaints
   - Fields: title, description, category, status, priority, location, assignments

3. **complaint_attachments**
   - Stores references to uploaded images/files
   - Links to complaints and storage bucket

4. **user_roles**
   - Manages user permissions (admin, moderator, citizen)
   - Separate from auth.users for security

### Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Role-based Access**: Function-based role checking prevents privilege escalation
- **Secure Functions**: All functions use `SECURITY DEFINER` with proper search paths
- **Storage Policies**: Files are protected and only accessible to authorized users

## Verification

After running the setup, verify everything worked:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if departments were inserted
SELECT * FROM public.departments;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Troubleshooting

### If you get "relation already exists" errors:
- Some items might already be created
- The script uses `ON CONFLICT` and `IF EXISTS` clauses to handle this
- You can safely re-run specific sections

### If RLS policies fail:
- Check that the `has_role` function exists
- Verify user_roles table has data
- Ensure auth.users table is accessible

### If storage bucket creation fails:
- Check if bucket already exists in Storage section
- Manually create bucket named `complaint-attachments`
- Make it private (not public)

## Environment Variables

After setup, use these in your application:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase project settings under API.

## Support

If you encounter issues:
1. Check the Supabase logs in Dashboard > Logs
2. Verify all RLS policies are in place
3. Ensure storage bucket exists and has correct policies
4. Review authentication settings

## Data Migration Notes

If you're migrating from an existing CityServe instance:

1. Export your existing data first
2. Run this schema on the new instance
3. Manually insert your data using INSERT statements
4. Update any UUID references to match new user IDs
5. Migrate files in storage bucket separately

## Next Steps

After database setup:
1. Create your first user account through the app
2. Make that user an admin using the SQL above
3. Log in and test department management
4. Submit a test complaint
5. Verify file uploads work correctly

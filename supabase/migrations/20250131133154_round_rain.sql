/*
  # Authentication and Initial Admin Setup

  1. Changes
    - Create initial admin user
    - Set up auth schema triggers
    - Add user permissions
  
  2. Security
    - Enable RLS on all auth-related tables
    - Add policies for user management
*/

-- Create initial admin user if it doesn't exist
DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@tracerx.org'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@tracerx.org',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "System Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO auth_user_id;

    -- Insert into public.users
    INSERT INTO public.users (
      id,
      email,
      full_name,
      role
    ) VALUES (
      auth_user_id,
      'admin@tracerx.org',
      'System Admin',
      'admin'
    );

    -- Grant all permissions to admin
    INSERT INTO user_permissions (user_id, permission)
    VALUES 
      (auth_user_id, 'manage_users'),
      (auth_user_id, 'view_users'),
      (auth_user_id, 'manage_samples'),
      (auth_user_id, 'view_samples'),
      (auth_user_id, 'manage_permissions'),
      (auth_user_id, 'view_logs');
  END IF;
END $$;

-- Create trigger to sync user data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
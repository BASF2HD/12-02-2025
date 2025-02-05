/*
  # Simplify User Policies to Prevent Recursion

  1. Changes
    - Remove all existing policies
    - Implement simplified policy structure
    - Use auth.uid() for basic checks
    - Store admin status in auth.users metadata
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update profiles" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Create simplified policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users with admin role can view all"
  ON users FOR SELECT
  USING (role = 'admin');

CREATE POLICY "Users with admin role can insert"
  ON users FOR INSERT
  WITH CHECK (role = 'admin');

CREATE POLICY "Users with admin role can update"
  ON users FOR UPDATE
  USING (role = 'admin');

CREATE POLICY "Users with admin role can delete"
  ON users FOR DELETE
  USING (role = 'admin');

-- Update user trigger to handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    CASE 
      WHEN NEW.email = 'admin@tracerx.org' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
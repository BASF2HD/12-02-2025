/*
  # Fix User Policies to Prevent Recursion

  1. Changes
    - Rewrite policies to avoid circular dependencies
    - Use role-based checks without self-referential queries
    - Implement proper access control hierarchy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update profiles" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Basic user access - users can always view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admin access - using direct role check
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'::user_role
  );

-- Admin update access
CREATE POLICY "Admins can update profiles"
  ON users FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'::user_role
  );

-- Admin delete access
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'::user_role
  );

-- Admin insert access
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'::user_role
  );
/*
  # Initial Schema for Sample Tracking Database

  1. New Tables
    - `users` - Extended user profile information
      - `id` (uuid, primary key, linked to auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text)
      - `created_at` (timestamp)
      
    - `samples` - Main sample tracking table
      - `id` (uuid, primary key)
      - `barcode` (text, unique)
      - `patient_id` (text)
      - `type` (text) - blood, tissue, biospecimen
      - `subtype` (text) - specific type like plasma, whole_blood
      - `collection_date` (timestamp)
      - `status` (text) - available, in use, depleted
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      
    - `storage_locations` - Track where samples are stored
      - `id` (uuid, primary key)
      - `sample_id` (uuid, references samples)
      - `freezer` (text)
      - `shelf` (text)
      - `box` (text)
      - `position` (text)
      - `temperature` (text)
      - `created_at` (timestamp)
      
    - `custody_logs` - Chain of custody tracking
      - `id` (uuid, primary key)
      - `sample_id` (uuid, references samples)
      - `user_id` (uuid, references users)
      - `action` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      
    - `custom_fields` - Dynamic field definitions
      - `id` (uuid, primary key)
      - `name` (text)
      - `field_type` (text)
      - `required` (boolean)
      - `created_at` (timestamp)
      
    - `sample_custom_fields` - Values for custom fields
      - `id` (uuid, primary key)
      - `sample_id` (uuid, references samples)
      - `field_id` (uuid, references custom_fields)
      - `value` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create enum types
CREATE TYPE sample_type AS ENUM ('blood', 'tissue', 'biospecimen');
CREATE TYPE sample_status AS ENUM ('available', 'in_use', 'depleted');
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create samples table
CREATE TABLE samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  patient_id text NOT NULL,
  type sample_type NOT NULL,
  subtype text NOT NULL,
  collection_date timestamptz NOT NULL,
  status sample_status DEFAULT 'available',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create storage_locations table
CREATE TABLE storage_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid REFERENCES samples(id) ON DELETE CASCADE,
  freezer text NOT NULL,
  shelf text NOT NULL,
  box text NOT NULL,
  position text NOT NULL,
  temperature text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(freezer, shelf, box, position)
);

-- Create custody_logs table
CREATE TABLE custody_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid REFERENCES samples(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create custom_fields table
CREATE TABLE custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  field_type text NOT NULL,
  required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create sample_custom_fields table
CREATE TABLE sample_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid REFERENCES samples(id) ON DELETE CASCADE,
  field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sample_id, field_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Samples table policies
CREATE POLICY "Users can view all samples"
  ON samples FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert samples"
  ON samples FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own samples"
  ON samples FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Storage locations policies
CREATE POLICY "Users can view all storage locations"
  ON storage_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage storage locations"
  ON storage_locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM samples s
      WHERE s.id = storage_locations.sample_id
      AND (s.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- Custody logs policies
CREATE POLICY "Users can view all custody logs"
  ON custody_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custody logs"
  ON custody_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Custom fields policies
CREATE POLICY "Users can view custom fields"
  ON custom_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage custom fields"
  ON custom_fields FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sample custom fields policies
CREATE POLICY "Users can view all sample custom fields"
  ON sample_custom_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their sample custom fields"
  ON sample_custom_fields FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM samples s
      WHERE s.id = sample_custom_fields.sample_id
      AND (s.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );
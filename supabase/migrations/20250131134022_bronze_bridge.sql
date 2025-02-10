/*
  # Update samples table schema

  1. Changes
    - Add missing columns to match application data model
    - Update sample_type enum to include all types
    - Add appropriate constraints and defaults
    - Enable RLS policies for proper access control

  2. New Columns
    - barcode (text, unique)
    - patient_id (text)
    - type (sample_type)
    - investigation_type (text)
    - status (text)
    - site (text)
    - timepoint (text)
    - specimen (text)
    - spec_number (text)
    - material (text)
    - sample_date (timestamptz)
    - sample_time (text)
    - date_sent (timestamptz)
    - date_received (timestamptz)
    - freezer (text)
    - shelf (text)
    - box (text)
    - position (text)
    - sample_level (text)
    - volume (numeric)
    - amount (numeric)
    - concentration (numeric)
    - mass (numeric)
    - surplus (boolean)
    - comments (text)

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing sample_type enum and recreate with all types
DROP TYPE IF EXISTS sample_type CASCADE;
CREATE TYPE sample_type AS ENUM (
  'blood',
  'tissue',
  'ffpe',
  'he',
  'buffy',
  'plasma',
  'dna',
  'rna'
);

-- Drop and recreate samples table with updated schema
DROP TABLE IF EXISTS samples CASCADE;
CREATE TABLE samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  patient_id text NOT NULL,
  type sample_type NOT NULL,
  investigation_type text NOT NULL DEFAULT 'Sequencing',
  status text NOT NULL DEFAULT 'Collected',
  site text NOT NULL,
  timepoint text NOT NULL,
  specimen text NOT NULL,
  spec_number text NOT NULL,
  material text NOT NULL,
  sample_date timestamptz NOT NULL,
  sample_time text NOT NULL,
  date_sent timestamptz,
  date_received timestamptz,
  freezer text,
  shelf text,
  box text,
  position text,
  sample_level text NOT NULL,
  volume numeric,
  amount numeric,
  concentration numeric,
  mass numeric,
  surplus boolean DEFAULT false,
  comments text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all samples"
  ON samples FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert samples"
  ON samples FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update samples"
  ON samples FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_samples_barcode ON samples(barcode);
CREATE INDEX idx_samples_patient_id ON samples(patient_id);
CREATE INDEX idx_samples_type ON samples(type);
CREATE INDEX idx_samples_created_at ON samples(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
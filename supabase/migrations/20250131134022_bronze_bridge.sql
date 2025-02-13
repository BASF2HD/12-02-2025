-- Drop existing types if they exist
DROP TYPE IF EXISTS sample_type CASCADE;
DROP TYPE IF EXISTS sample_status CASCADE;

-- Create updated enum types
DROP TYPE IF EXISTS sample_type CASCADE;
CREATE TYPE sample_type AS ENUM (
  'Blood',
  'Tissue',
  'Buffy',
  'Plasma',
  'FFPE',
  'H&E',
  'DNA',
  'RNA'
);

CREATE TYPE sample_status AS ENUM ('Available', 'In Use', 'Depleted');

-- Create samples table with correct column order
CREATE TABLE IF NOT EXISTS samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  ltx_id text,
  patient_id text,
  type sample_type NOT NULL,
  investigation_type text,
  timepoint text,
  sample_level text,
  specimen text,
  spec_number text,
  material text,
  sample_date_time timestamptz,
  site text,
  freezer text,
  shelf text,
  box text,
  position text,
  volume_ml decimal,
  amount_mg decimal,
  concentration_ng_ul decimal,
  mass_ng decimal,
  surplus boolean,
  status sample_status DEFAULT 'Available',
  date_sent date,
  date_received date,
  comments text,
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
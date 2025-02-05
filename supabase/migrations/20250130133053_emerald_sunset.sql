/*
  # Update samples table schema

  1. Changes
    - Add missing columns for sample measurements
    - Add missing columns for dates
    - Update sample type enum
    - Add indexes for better query performance

  2. New Columns
    - volume: For blood samples (ml)
    - amount: For tissue samples (mg)
    - concentration: For DNA/RNA samples (ng/µL)
    - mass: For DNA/RNA samples (ng)
    - date_sent: For tracking shipments
    - date_received: For tracking receipts
*/

-- Add new columns to samples table
ALTER TABLE samples 
  ADD COLUMN IF NOT EXISTS volume numeric,
  ADD COLUMN IF NOT EXISTS amount numeric,
  ADD COLUMN IF NOT EXISTS concentration numeric,
  ADD COLUMN IF NOT EXISTS mass numeric,
  ADD COLUMN IF NOT EXISTS date_sent timestamptz,
  ADD COLUMN IF NOT EXISTS date_received timestamptz;

-- Update sample_type enum to include all types
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'ffpe';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'he';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'buffy';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'plasma';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'dna';
ALTER TYPE sample_type ADD VALUE IF NOT EXISTS 'rna';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_samples_barcode ON samples(barcode);
CREATE INDEX IF NOT EXISTS idx_samples_patient_id ON samples(patient_id);
CREATE INDEX IF NOT EXISTS idx_samples_type ON samples(type);
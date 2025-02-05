/*
  # Update sample fields and status enum

  1. Changes
    - Add missing columns for sample metadata
    - Update sample status enum to match application values
    - Add proper default values

  2. Security
    - Maintain existing RLS policies
*/

-- First add the new columns with null values
ALTER TABLE samples 
  ADD COLUMN IF NOT EXISTS investigation_type text,
  ADD COLUMN IF NOT EXISTS timepoint text,
  ADD COLUMN IF NOT EXISTS spec_number text,
  ADD COLUMN IF NOT EXISTS sample_level text,
  ADD COLUMN IF NOT EXISTS surplus boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS subtype text;

-- Create new enum without dropping the old one
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sample_status_new') THEN
    CREATE TYPE sample_status_new AS ENUM ('Collected', 'Shipped', 'Received');
  END IF;
END$$;

-- Update the column to use the new enum
ALTER TABLE samples 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE sample_status_new USING 
    CASE status::text
      WHEN 'available' THEN 'Collected'::sample_status_new
      WHEN 'in_use' THEN 'Shipped'::sample_status_new
      WHEN 'depleted' THEN 'Received'::sample_status_new
      ELSE 'Collected'::sample_status_new
    END;

-- Set the default value for the status column
ALTER TABLE samples 
  ALTER COLUMN status SET DEFAULT 'Collected'::sample_status_new;

-- Clean up the old enum
DROP TYPE IF EXISTS sample_status;
ALTER TYPE sample_status_new RENAME TO sample_status;
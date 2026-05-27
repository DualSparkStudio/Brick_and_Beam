-- Migration: Add source column to blocked_dates table
-- This allows differentiation between manual and other blocked dates

-- Add source column to blocked_dates table
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Add external_id column for tracking external platform references
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

-- Add platform_data column for storing additional metadata
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS platform_data JSONB;

-- Add created_at column if it doesn't exist
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on source column for better query performance
CREATE INDEX IF NOT EXISTS idx_blocked_dates_source ON blocked_dates(source);

-- Create index on external_id for external platform lookups
CREATE INDEX IF NOT EXISTS idx_blocked_dates_external_id ON blocked_dates(external_id);

-- Update existing records to have 'manual' source
UPDATE blocked_dates 
SET source = 'manual' 
WHERE source IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN blocked_dates.source IS 'Source of the blocked date: manual (admin panel), etc.';
COMMENT ON COLUMN blocked_dates.external_id IS 'External reference ID from the source platform';
COMMENT ON COLUMN blocked_dates.platform_data IS 'Additional metadata from the source platform (JSON format)';

-- Migration: Add new profile fields to existing users table
-- Copy and paste this entire script into Supabase SQL Editor

-- Add bio column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio text;

-- Add title column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS title text;

-- Add location column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location text;

-- Add website column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS website text;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FindIt Campus — Migration: Add missing columns to items table
-- Run this in Supabase SQL Editor NOW
-- ============================================================

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS challenge_question text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS challenge_answer text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS collection_point text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS contact_preference text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS date_occurred timestamptz;

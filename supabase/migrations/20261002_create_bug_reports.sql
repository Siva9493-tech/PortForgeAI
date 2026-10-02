-- PortForge AI: Bug Reports Table Migration
-- Creates the public.bug_reports table with RLS policies and indexes.

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    category TEXT NOT NULL CHECK (category IN ('Bug', 'UI / Design Issue', 'Feature Request', 'Improvement', 'Other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    reproduction_steps TEXT,
    additional_message TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    device_info JSONB,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert reports
CREATE POLICY "Authenticated users can submit bug reports"
ON public.bug_reports
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous visitors to submit bug reports
CREATE POLICY "Anonymous users can submit bug reports"
ON public.bug_reports
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

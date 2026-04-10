-- =====================================================
-- ITI Instructor System - Supabase Database Setup
-- Run this SQL in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Create instructors table
CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    father_name TEXT,
    trade TEXT NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    dob DATE NOT NULL,
    join_date DATE,
    blood_group TEXT,
    aadhar_no TEXT,
    pan_no TEXT,
    cpf_gpf TEXT,
    si_no TEXT,
    address TEXT,
    photo TEXT NOT NULL,
    signature TEXT,
    iti_name TEXT NOT NULL,
    iti_address TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Disable RLS (for simplicity - internal system)
ALTER TABLE instructors DISABLE ROW LEVEL SECURITY;

-- 3. Create storage bucket for photos (used for profile photos and signatures)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Allow public access to the photos bucket
CREATE POLICY "Public Access Photos" ON storage.objects 
FOR ALL USING (bucket_id = 'photos');

ALTER TABLE instructors ADD COLUMN IF NOT EXISTS signature TEXT;


-- 5. MIGRATION: If table already exists, run this to add the signature column:
-- ALTER TABLE instructors ADD COLUMN IF NOT EXISTS signature TEXT;

-- =====================================================
-- NEW FEATURES (Leaves, Edit Requests, Notices, Tools)
-- =====================================================

CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id TEXT REFERENCES instructors(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id TEXT REFERENCES instructors(id) ON DELETE CASCADE,
    requested_updates JSONB NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id TEXT REFERENCES instructors(id) ON DELETE CASCADE,
    tools_needed TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Issued, Rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Done! System now supports instructor and admin signature uploads, and HR workflows.

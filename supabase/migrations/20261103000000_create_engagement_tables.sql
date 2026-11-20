-- ==============================================================================
-- NEHA & CHINMAY ENGAGEMENT INVITATION DATABASE SCHEMA
-- Migration: 20261103000000_create_engagement_tables.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. VISITORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    browser_id UUID NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    first_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & lookups
CREATE INDEX IF NOT EXISTS idx_visitors_browser_id ON public.visitors (browser_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON public.visitors (last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_first_name ON public.visitors (first_name);

-- ------------------------------------------------------------------------------
-- 2. VISITOR SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    session_id UUID NOT NULL UNIQUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON public.visitor_sessions (visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions (session_id);

-- ------------------------------------------------------------------------------
-- 3. BLESSINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blessings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (char_length(trim(message)) >= 5 AND char_length(message) <= 500),
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blessings_status ON public.blessings (approval_status);
CREATE INDEX IF NOT EXISTS idx_blessings_created_at ON public.blessings (created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ADMIN PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_auth_user_id ON public.admin_profiles (auth_user_id);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 4 tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blessings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = auth.uid()
  ) OR (
    -- Also allow authenticated users whose email matches Neha or Chinmay's configured emails
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND auth.role() = 'authenticated'
  );
$$;

-- A. VISITORS POLICIES
-- Authenticated Admins can SELECT all visitors
CREATE POLICY "Admins can view all visitors"
    ON public.visitors
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Anon / Public cannot read any visitors
-- Public can INSERT their own visitor record during identification
CREATE POLICY "Public can insert visitor record"
    ON public.visitors
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        first_name IS NOT NULL AND 
        surname IS NOT NULL AND 
        char_length(trim(first_name)) >= 2 AND 
        char_length(trim(surname)) >= 2
    );

-- Public can UPDATE only their own record by browser_id
CREATE POLICY "Public can update own visitor record"
    ON public.visitors
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- B. VISITOR SESSIONS POLICIES
CREATE POLICY "Admins can view visitor sessions"
    ON public.visitor_sessions
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Public can insert visitor session"
    ON public.visitor_sessions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (session_id IS NOT NULL);

-- C. BLESSINGS POLICIES
CREATE POLICY "Public can insert blessing"
    ON public.blessings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (char_length(trim(message)) >= 5);

CREATE POLICY "Admins can view all blessings"
    ON public.blessings
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can update blessing approval"
    ON public.blessings
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- D. ADMIN PROFILES POLICIES
CREATE POLICY "Admins can view admin profiles"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = auth_user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. ATOMIC STORED PROCEDURE (RPC) FOR IDEMPOTENT VISIT RECORDING
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_guest_visit(
    p_browser_id UUID,
    p_first_name TEXT,
    p_surname TEXT,
    p_session_id UUID,
    p_is_new_session BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_visitor_id UUID;
    v_visit_count INT;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Validate inputs
    IF p_first_name IS NULL OR trim(p_first_name) = '' THEN
        RAISE EXCEPTION 'First name is required';
    END IF;
    IF p_surname IS NULL OR trim(p_surname) = '' THEN
        RAISE EXCEPTION 'Surname is required';
    END IF;

    -- Upsert visitor
    SELECT id, visit_count INTO v_visitor_id, v_visit_count
    FROM public.visitors
    WHERE browser_id = p_browser_id;

    IF v_visitor_id IS NOT NULL THEN
        -- Existing visitor: update last visit and conditionally increment count
        UPDATE public.visitors
        SET 
            last_visit = v_now,
            first_name = trim(p_first_name),
            surname = trim(p_surname),
            visit_count = CASE WHEN p_is_new_session THEN visit_count + 1 ELSE visit_count END
        WHERE id = v_visitor_id
        RETURNING visit_count INTO v_visit_count;
    ELSE
        -- New visitor
        INSERT INTO public.visitors (browser_id, first_name, surname, first_visit, last_visit, visit_count)
        VALUES (p_browser_id, trim(p_first_name), trim(p_surname), v_now, v_now, 1)
        RETURNING id, visit_count INTO v_visitor_id, v_visit_count;
    END IF;

    -- Record session if new
    IF p_is_new_session AND p_session_id IS NOT NULL THEN
        INSERT INTO public.visitor_sessions (visitor_id, session_id, started_at, last_activity_at)
        VALUES (v_visitor_id, p_session_id, v_now, v_now)
        ON CONFLICT (session_id) DO UPDATE 
        SET last_activity_at = v_now;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'visitor_id', v_visitor_id,
        'visit_count', v_visit_count
    );
END;
$$;

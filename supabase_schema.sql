-- ========================================================================
-- Neha & Chinmay Sakharpuda Invitation: Cloud Database Schema (Supabase)
-- Run this in your Supabase SQL Editor if you want centralized cloud sync
-- across all guests' phones. (Otherwise the site works offline/locally)
-- ========================================================================

-- 1. Create Visitors Table
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  browser_id text not null,
  first_name text not null,
  surname text not null,
  first_visit timestamptz default timezone('utc'::text, now()) not null,
  last_visit timestamptz default timezone('utc'::text, now()) not null,
  visit_count integer default 1 not null,
  device text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Create Visitor Sessions Table
create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) on delete cascade,
  session_id text not null,
  started_at timestamptz default timezone('utc'::text, now()) not null,
  device text
);

-- 3. Create Blessings Table
create table if not exists public.blessings (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) on delete set null,
  guest_name text,
  message text not null,
  approval_status text default 'approved' not null check (approval_status in ('approved', 'pending', 'rejected')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.visitors enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.blessings enable row level security;

-- 5. Public Access Policies (Allow guests to view, log visits & send blessings)
create policy "Public can read visitors" on public.visitors for select using (true);
create policy "Public can insert visitors" on public.visitors for insert with check (true);
create policy "Public can update visitors" on public.visitors for update using (true);
create policy "Public can delete visitors" on public.visitors for delete using (true);

create policy "Public can read sessions" on public.visitor_sessions for select using (true);
create policy "Public can insert sessions" on public.visitor_sessions for insert with check (true);

create policy "Public can read blessings" on public.blessings for select using (true);
create policy "Public can insert blessings" on public.blessings for insert with check (true);
create policy "Public can update blessings" on public.blessings for update using (true);
create policy "Public can delete blessings" on public.blessings for delete using (true);

-- 6. Table & Schema Permissions for PostgREST & Anon Client
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- Indexes for high performance
create index if not exists idx_visitors_browser_id on public.visitors(browser_id);
create index if not exists idx_blessings_visitor_id on public.blessings(visitor_id);
create index if not exists idx_sessions_visitor_id on public.visitor_sessions(visitor_id);

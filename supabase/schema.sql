-- ============================================================
-- FindIt Campus — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ITEMS TABLE
-- ============================================================
create table if not exists public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('lost', 'found')) not null,
  title text not null,
  description text,
  category text default 'other',
  image_url text,
  embedding vector(384),
  location_lat double precision,
  location_lng double precision,
  location_name text,
  challenge_question text,
  challenge_answer text,
  collection_point text,
  contact_preference text,
  date_occurred timestamptz,
  status text check (status in ('active', 'matched', 'claimed', 'archived')) default 'active',
  expires_at timestamptz default (now() + interval '20 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "Items are viewable by everyone."
  on items for select using (true);

create policy "Users can insert their own items."
  on items for insert with check (auth.uid() = user_id);

create policy "Users can update own items."
  on items for update using (auth.uid() = user_id);

create policy "Users can delete own items."
  on items for delete using (auth.uid() = user_id);

-- Index for performance
create index if not exists items_status_idx on items(status);
create index if not exists items_type_idx on items(type);
create index if not exists items_category_idx on items(category);
create index if not exists items_user_idx on items(user_id);
create index if not exists items_created_at_idx on items(created_at desc);

-- ============================================================
-- MATCHES TABLE
-- ============================================================
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  lost_item_id uuid references public.items(id) on delete cascade not null,
  found_item_id uuid references public.items(id) on delete cascade not null,
  text_score double precision default 0,
  image_score double precision default 0,
  total_score double precision default 0,
  created_at timestamptz default now(),
  unique(lost_item_id, found_item_id)
);

alter table public.matches enable row level security;

create policy "Matches are viewable by everyone."
  on matches for select using (true);

create policy "Matches can be inserted by authenticated users."
  on matches for insert with check (auth.uid() is not null);

create policy "Matches can be updated by authenticated users."
  on matches for update using (auth.uid() is not null);

create index if not exists matches_lost_idx on matches(lost_item_id);
create index if not exists matches_found_idx on matches(found_item_id);
create index if not exists matches_score_idx on matches(total_score desc);

-- ============================================================
-- CLAIMS TABLE
-- ============================================================
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  claimant_id uuid references public.profiles(id) on delete cascade not null,
  finder_id uuid references public.profiles(id) on delete cascade not null,
  challenge_question text not null,
  challenge_answer text not null,
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  qr_token text unique,
  verified_at timestamptz,
  created_at timestamptz default now()
);

alter table public.claims enable row level security;

create policy "Claims viewable by involved parties."
  on claims for select using (
    auth.uid() = claimant_id or auth.uid() = finder_id
  );

create policy "Authenticated users can create claims."
  on claims for insert with check (auth.uid() = claimant_id);

create policy "Finder can update claim status."
  on claims for update using (auth.uid() = finder_id or auth.uid() = claimant_id);

create index if not exists claims_item_idx on claims(item_id);
create index if not exists claims_claimant_idx on claims(claimant_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "Item images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "Authenticated users can upload images."
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.uid() is not null);

create policy "Users can update their own images."
  on storage.objects for update
  using (bucket_id = 'item-images' and auth.uid() is not null);

create policy "Users can delete their own images."
  on storage.objects for delete
  using (bucket_id = 'item-images' and auth.uid() is not null);

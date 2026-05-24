-- =============================================
-- FitAI Supabase Schema (Fixed)
-- Run this in your Supabase SQL editor
-- =============================================

-- =============================================
-- PROFILES TABLE
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  gender text default 'male',
  age integer,
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  goal text default 'improve_fitness',
  activity_level text default 'moderate',
  experience text default 'beginner',
  equipment text default 'full_gym',
  dietary_preference text default 'none',
  calories integer default 2000,
  protein integer default 150,
  carbs integer default 200,
  fat integer default 65,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- FOOD LOGS TABLE
-- =============================================
create table if not exists public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  food_name text not null,
  calories numeric not null default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  serving_size text,
  meal_type text default 'Snacks',
  created_at timestamptz default now()
);

alter table public.food_logs enable row level security;

create policy "Users can manage own food logs" on public.food_logs
  for all using (auth.uid() = user_id);

create index food_logs_user_date on public.food_logs(user_id, date);

-- =============================================
-- WEIGHT LOGS TABLE
-- =============================================
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  weight_kg numeric not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.weight_logs enable row level security;

create policy "Users can manage own weight logs" on public.weight_logs
  for all using (auth.uid() = user_id);

create index weight_logs_user_date on public.weight_logs(user_id, date);

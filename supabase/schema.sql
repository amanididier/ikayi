-- Ikayi credit book schema (run in Supabase SQL Editor on your NEW project)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text default '',
  phone text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.parties (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  local_id bigint not null,
  name text not null,
  phone text not null default '',
  kind text not null check (kind in ('customer', 'supplier')),
  created_at timestamptz not null default now(),
  unique (user_id, local_id)
);
create index if not exists parties_user_idx on public.parties (user_id);

create table if not exists public.debts (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  local_id bigint not null,
  party_local_id bigint not null,
  description text not null default '',
  amount numeric not null,
  created_at timestamptz not null default now(),
  due_days integer null,
  unique (user_id, local_id)
);
create index if not exists debts_user_idx on public.debts (user_id);

create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  local_id bigint not null,
  party_local_id bigint not null,
  amount numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, local_id)
);
create index if not exists payments_user_idx on public.payments (user_id);

alter table public.profiles enable row level security;
alter table public.parties enable row level security;
alter table public.debts enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "parties_all_own" on public.parties;
create policy "parties_all_own" on public.parties for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "debts_all_own" on public.debts;
create policy "debts_all_own" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payments_all_own" on public.payments;
create policy "payments_all_own" on public.payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

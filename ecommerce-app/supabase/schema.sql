-- ============================================================
-- PremiumStore — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. PRODUCTS
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  category     text not null check (category in ('premium_services', 'mobile_numbers', 'digital_access')),
  price        numeric(12,2) not null,
  logo_url     text,
  flag_url     text,
  country      text,
  description  text,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select using (true);

create policy "Only admins can insert products"
  on public.products for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update products"
  on public.products for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 3. ORDERS
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references public.users(id) on delete set null,
  product_id           uuid references public.products(id) on delete set null,
  product_name         text not null,
  product_category     text not null,
  status               text not null default 'payment_made'
                         check (status in ('payment_made','processing','payment_received','delivered')),
  full_name            text not null,
  contact_info         text,
  platform_username    text,
  platform_password    text,
  proof_of_payment_url text,
  total_amount         numeric(12,2) not null,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all orders"
  on public.orders for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- 4. ORDER STATUS HISTORY
-- ─────────────────────────────────────────────
create table if not exists public.order_status_history (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  created_at timestamptz default now()
);

alter table public.order_status_history enable row level security;

create policy "Users can view their own order history"
  on public.order_status_history for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can view all order history"
  on public.order_status_history for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert their own order history"
  on public.order_status_history for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can insert order history"
  on public.order_status_history for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 5. PAYMENTS
-- ─────────────────────────────────────────────
create table if not exists public.payments (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid references public.orders(id) on delete cascade,
  amount     numeric(12,2) not null,
  proof_url  text,
  verified   boolean default false,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Users can view their own payments"
  on public.payments for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can view all payments"
  on public.payments for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update payments"
  on public.payments for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 6. ENABLE REALTIME
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_status_history;

-- ─────────────────────────────────────────────
-- 7. STORAGE BUCKET
-- ─────────────────────────────────────────────
-- Run these in the Supabase Storage tab OR via SQL:
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload"
  on storage.objects for insert with check (
    bucket_id = 'payment-proofs' and auth.role() = 'authenticated'
  );

create policy "Authenticated users can view"
  on storage.objects for select using (
    bucket_id = 'payment-proofs' and auth.role() = 'authenticated'
  );

-- ─────────────────────────────────────────────
-- 8. MAKE YOURSELF ADMIN (replace with your email)
-- ─────────────────────────────────────────────
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

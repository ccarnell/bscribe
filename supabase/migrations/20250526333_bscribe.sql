-- =============================================
-- Bscribe Final MVP Schema  ·  2025-05-26
-- =============================================

-- ENUMS
create type role_enum          as enum ('admin','creator','member');
create type plan_enum          as enum ('creator','supporter');
create type sub_status_enum    as enum ('active','trialing','past_due','canceled');
create type purchase_status_enum as enum ('succeeded','refunded','failed');

-- =============================================
-- 1. IDENTITY & BILLING MIRRORS
-- =============================================

create table profiles (
  id                       uuid primary key references auth.users(id),
  display_name             text,
  avatar_url               text,
  role                     role_enum default 'member',
  email_marketing_consent  boolean default true,
  marketing_tags           text[]  default '{}'
);

create table stripe_customers (
  id                  uuid primary key references profiles(id),
  stripe_customer_id  text unique
);

create table stripe_subscriptions (
  id                     uuid primary key references profiles(id),
  stripe_subscription_id text unique,
  current_plan           plan_enum,
  subscription_status    sub_status_enum,
  current_period_end     timestamptz
);

-- =============================================
-- 2. DIGITAL GOODS
-- =============================================

create table products (
  id                     uuid primary key default gen_random_uuid(),
  owner_id               uuid references profiles(id),
  title                  text,
  slug                   text unique,
  cover_url              text,
  revenue_share_percent  numeric(5,2) default 69.00,  -- creator’s cut
  stripe_product_id      text,
  stripe_price_id        text,
  is_visible             boolean default true,
  deleted_at             timestamptz,
  created_at             timestamptz default now()
);

create table assets (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references products(id),
  storage_path  text,
  mime_type     text,
  size_bytes    bigint,
  deleted_at    timestamptz
);

-- =============================================
-- 3. TRANSACTIONS
-- =============================================

create table purchases (
  id                       uuid primary key default gen_random_uuid(),
  buyer_id                 uuid references profiles(id),
  product_id               uuid references products(id),
  stripe_payment_intent_id text unique,
  amount_cents             integer,
  status                   purchase_status_enum default 'succeeded',
  purchased_at             timestamptz default now()
);

-- =============================================
-- 4. AI COST MODEL
-- =============================================

create table api_usage (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id),
  action        text,              -- 'title_gen', 'content_gen', etc.
  credits_used  int  default 1,
  created_at    timestamptz default now()
);

create table generated_content (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id),
  product_id uuid references products(id) on delete set NULL,
  prompt     text,
  output     text,
  created_at timestamptz default now()
);

-- =============================================
-- 5. INDEXES
-- =============================================

create unique index if not exists idx_products_slug         on products(slug);
create        index if not exists idx_products_owner        on products(owner_id);
create        index if not exists idx_assets_product        on assets(product_id);
create        index if not exists idx_api_usage_user_time   on api_usage(user_id, created_at desc);

-- =============================================
-- 6. BASIC RLS POLICY EXAMPLES
-- =============================================

-- Enable RLS
alter table profiles       enable row level security;
alter table products       enable row level security;
alter table assets         enable row level security;
alter table purchases      enable row level security;
alter table api_usage      enable row level security;
alter table generated_content enable row level security;

-- Public read for visible products
create policy anon_read_products
on products for select
using (is_visible = true and deleted_at is null);

-- Owner or admin full access
create policy owner_admin_products
on products for all
using (
  auth.uid() = owner_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- (Repeat analogous owner/admin policies for other tables as needed)

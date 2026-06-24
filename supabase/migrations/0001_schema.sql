-- All Vegan — schema khởi tạo
-- Chạy file này TRƯỚC trong Supabase SQL Editor (sau đó 0002, 0003, 0004 theo thứ tự).

create extension if not exists "pgcrypto";

-- ============ profiles ============
-- 1:1 với auth.users, chứa các field nghiệp vụ tương ứng interface User trong store.ts
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null,
  points integer not null default 0,
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold','platinum')),
  total_spent bigint not null default 0,
  join_date date not null default current_date,
  orders_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ menu_items ============
-- thay thế src/data/menu.ts, public read
create table menu_items (
  id text primary key,
  name text not null,
  name_en text not null,
  category text not null,
  price integer not null,
  description text not null,
  image text not null,
  tags text[] not null default '{}',
  popular boolean not null default false,
  is_new boolean not null default false
);

-- ============ stores ============
-- thay thế src/data/stores.ts, public read
create table stores (
  id text primary key,
  name text not null,
  address text not null,
  district text not null,
  phone text not null,
  hours text not null,
  lat double precision not null,
  lng double precision not null,
  map_url text not null,
  features text[] not null default '{}'
);

-- ============ orders / order_items ============
create sequence order_seq;
create sequence invoice_seq;

create table orders (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  total integer not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','preparing','delivering','completed','cancelled')),
  order_type text not null check (order_type in ('dine-in','takeaway','delivery')),
  address text,
  table_number text,
  points_earned integer not null default 0,
  invoice_id text,
  voucher_code text
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id text not null references orders(id) on delete cascade,
  menu_item_id text not null references menu_items(id),
  name text not null,
  price integer not null,
  quantity integer not null check (quantity > 0)
);

-- ============ voucher_templates / user_vouchers ============
create table voucher_templates (
  code text primary key,
  name text not null,
  discount integer not null,
  discount_type text not null check (discount_type in ('percent','fixed')),
  min_order integer not null default 0,
  points_cost integer not null default 0,
  validity_days integer,
  fixed_expiry date,
  active boolean not null default true
);

create table user_vouchers (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  code text not null references voucher_templates(code),
  expiry date not null,
  used boolean not null default false,
  used_order_id text references orders(id),
  redeemed_at timestamptz not null default now()
);

-- ============ reviews ============
create table reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  reviewer_name text not null,
  order_id text references orders(id),
  overall_rating smallint not null check (overall_rating between 1 and 5),
  category_ratings jsonb not null default '{}',
  comment text,
  quick_tags text[] not null default '{}',
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, order_id)
);

-- ============ game_spins ============
create table game_spins (
  user_id uuid not null references profiles(id) on delete cascade,
  spin_date date not null default current_date,
  spins_used integer not null default 0,
  primary key (user_id, spin_date)
);

-- ============ quiz_questions ============
create table quiz_questions (
  id bigint generated always as identity primary key,
  question text not null,
  options text[] not null,
  correct_index smallint not null,
  points integer not null
);

-- view public không lộ đáp án
create view quiz_questions_public as
  select id, question, options, points from quiz_questions;

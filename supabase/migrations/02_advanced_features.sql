-- ============================================================================
-- PHIÊN BẢN MỞ RỘNG: MIGRATION 02 - HỆ SINH THÁI TU TẬP & CỘNG ĐỒNG
-- Chạy script này trong Supabase SQL Editor khi muốn bật lưu trữ đám mây.
-- ============================================================================

-- 1. BẢNG THỐNG KÊ TU TẬP CỦA TÀI KHOẢN (USER PRACTICE STATS)
create table if not exists public.user_practice_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null default 'Thiện nam / Tín nữ',
  total_incense integer not null default 0,
  total_chanting_rounds integer not null default 0,
  total_meditation_minutes integer not null default 0,
  total_sutras_read integer not null default 0,
  total_prayers integer not null default 0,
  current_streak integer not null default 0,
  merit_dedication text default '',
  updated_at timestamptz not null default now()
);

alter table public.user_practice_stats enable row level security;

create policy "Chủ tài khoản có quyền xem thống kê của mình"
  on public.user_practice_stats
  for select
  using (auth.uid() = user_id);

create policy "Chủ tài khoản có quyền cập nhật thống kê của mình"
  on public.user_practice_stats
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. BẢNG CÂY BỒ ĐỀ (BODHI TREES)
create table if not exists public.bodhi_trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tree_name text not null default 'Cây Bồ Đề Tâm',
  planted_at timestamptz not null default now(),
  water_count integer not null default 1,
  last_watered_date date not null default current_date,
  stage text not null default 'seed',
  ribbons jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bodhi_trees enable row level security;

create policy "Mọi người có thể chiêm bái cây Bồ Đề công khai"
  on public.bodhi_trees
  for select
  using (is_public = true or auth.uid() = user_id);

create policy "Chủ sở hữu có toàn quyền với cây Bồ Đề của mình"
  on public.bodhi_trees
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. BẢNG HỒ CÁ PHÓNG SINH (POND FISH)
create table if not exists public.pond_fish (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  species_id text not null,
  name text not null default 'Cá Cát Tường',
  releaser_name text not null default 'Phật tử ẩn danh',
  wish_note text,
  released_at timestamptz not null default now(),
  feed_count integer not null default 0,
  last_fed_at timestamptz
);

alter table public.pond_fish enable row level security;

create policy "Mọi người đều có thể ngắm cá trong hồ"
  on public.pond_fish
  for select
  using (true);

create policy "Mọi người đều có thể phóng sinh cá"
  on public.pond_fish
  for insert
  with check (char_length(coalesce(wish_note, '')) <= 240);

create policy "Ai cũng có thể cho cá ăn (cập nhật feed_count)"
  on public.pond_fish
  for update
  using (true)
  with check (feed_count >= 0);

-- 4. BẢNG HOA ĐĂNG CẦU AN TRÊN SÔNG (RIVER LANTERNS)
create table if not exists public.river_lanterns (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null default 'Phật tử ẩn danh',
  prayer_text text not null,
  category text not null default 'peace',
  lantern_type text not null default 'lotus_pink',
  created_at timestamptz not null default now()
);

alter table public.river_lanterns enable row level security;

create policy "Mọi người đều có thể chiêm ngưỡng hoa đăng"
  on public.river_lanterns
  for select
  using (true);

create policy "Mọi người đều có thể thả hoa đăng cầu nguyện"
  on public.river_lanterns
  for insert
  with check (char_length(prayer_text) between 1 and 200);

-- Tối ưu hóa truy vấn cho hoa đăng gần đây
create index if not exists idx_river_lanterns_created_at
  on public.river_lanterns (created_at desc);


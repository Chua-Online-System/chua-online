# 🪷 KẾ HOẠCH TRIỂN KHAI CHI TIẾT DỰ ÁN "ĐI CHÙA ONLINE"
> **Tài liệu đặc tả kỹ thuật, chia phase và phân rã công việc (Task Breakdown)**  
> *Dựa trên hiện trạng source code Nuxt 4, Three.js, Web Audio API và Supabase Realtime.*

---

## MỤC LỤC
1. [Nguyên Tắc Cốt Lõi & Kiến Trúc Kỹ Thuật](#1-nguyên-tắc-cốt-lõi--kiến-trúc-kỹ-thuật)
2. [Đặc Tả Cấu Trúc Dữ Liệu & Types (TypeScript)](#2-đặc-tả-cấu-trúc-dữ-liệu--types-typescript)
3. [Database Schema Mở Rộng (Supabase SQL)](#3-database-schema-mở-rộng-supabase-sql)
4. [Lộ Trình Phân Chia Các Phase (Roadmap)](#4-lộ-trình-phân-chia-các-phase-roadmap)
   - [Phase 1: Tu Tập Sâu & Nhật Ký Cá Nhân (Local-first)](#phase-1-tu-tập-sâu--nhật-ký-cá-nhân-local-first)
   - [Phase 2: Bản Đồ Ngôi Chùa & Phân Khu Sinh Thái](#phase-2-bản-đồ-ngôi-chùa--phân-khu-sinh-thái)
   - [Phase 3: Đồng Bộ Cloud, Cộng Đồng & Sự Kiện Realtime](#phase-3-đồng-bộ-cloud-cộng-đồng--sự-kiện-realtime)
5. [Tiêu Chuẩn Kiểm Thử & Nghiệm Thu (Acceptance Criteria)](#5-tiêu-chuẩn-kiểm-thử--nghiệm-thu-acceptance-criteria)
6. [Quản Trị Rủi Ro Kỹ Thuật & Hiệu Năng](#6-quản-trị-rủi-ro-kỹ-thuật--hiệu-năng)

---

## 1. NGUYÊN TẮC CỐT LÕI & KIẾN TRÚC KỸ THUẬT

### 1.1. Triết lý Sản phẩm
1. **Thanh tịnh & Trang nghiêm:** Mọi tương tác, âm thanh, màu sắc phải mang lại cảm giác bình yên, thư thái; tuyệt đối không tạo cảm giác vội vã, cạnh tranh.
2. **Nói không với Game hóa tiêu cực (No Negative Gamification):** Không tạo bảng xếp hạng "đua top công đức", không biến điểm tu tập thành tiền ảo trao đổi, không thương mại hóa tâm linh.
3. **Local-first (Ưu tiên ngoại tuyến):** Mọi tính năng tu tập (lần hạt, thiền, nhật ký, trồng cây ảo) phải hoạt động trơn tru 100% khi không có internet hoặc khi chưa kết nối Supabase (lưu tại `localStorage`). Khi có Supabase, dữ liệu sẽ tự động đồng bộ đám mây.
4. **Tối ưu di động (Mobile-first Performance):** Giữ FPS luôn $\ge 55$ fps trên điện thoại tầm trung. Tách biệt các phân khu đồ họa nặng thành Canvas 2D / 2.5D riêng, không nhồi nhét tất cả vào một WebGL scene 3D duy nhất.

### 1.2. Kiến trúc Thư mục Kế thừa & Mở rộng
```
Chua_Onl/
├── app/
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── practice/            # [MỚI] Module Tu tập (Niệm hạt, Thiền, Đọc kinh)
│   │   │   ├── BeadCounter.vue
│   │   │   ├── ZenMeditation.vue
│   │   │   ├── SutraReader.vue
│   │   │   └── DailyDharmaModal.vue
│   │   ├── ecosystem/           # [MỚI] Module Sinh thái (Hồ cá, Bồ Đề, Hoa Sen, Hoa Đăng)
│   │   │   ├── FishPondCanvas.vue
│   │   │   ├── BodhiGarden.vue
│   │   │   ├── LotusPond.vue
│   │   │   └── LanternRiver.vue
│   │   ├── navigation/          # [MỚI] Điều hướng & Bản đồ
│   │   │   ├── TempleMapModal.vue
│   │   │   └── BottomNavBar.vue
│   │   ├── profile/             # [MỚI] Nhật ký & Hồ sơ tu tập
│   │   │   ├── PracticeJournalModal.vue
│   │   │   └── PracticeStats.vue
│   │   ├── FortuneStick.vue     # [CŨ] Đã có
│   │   ├── IncenseBurner.vue    # [CŨ] Đã có
│   │   ├── TempleBell.vue       # [CŨ] Đã có
│   │   ├── TempleScene3D.client.vue # [CŨ] Đã có (Thế giới 3D)
│   │   └── ...
│   ├── composables/
│   │   ├── usePracticeJournal.ts # [MỚI] Quản lý nhật ký tu tập local + cloud
│   │   ├── useChanting.ts        # [MỚI] Bộ đếm niệm Phật, haptic vibration
│   │   ├── useMeditation.ts      # [MỚI] Quản lý phiên thiền, âm thanh chuông thiền
│   │   ├── useFishPond.ts        # [MỚI] Quản lý cá phóng sinh & mô phỏng sinh trưởng
│   │   ├── useBodhiTree.ts       # [MỚI] Quản lý cây Bồ Đề & tưới nước hàng ngày
│   │   ├── useLanterns.ts        # [MỚI] Quản lý hoa đăng & broadcast realtime
│   │   ├── useSound.ts           # [CŨ] Đã có (Web Audio API)
│   │   ├── useMultiplayer.ts     # [CŨ] Đã có (Realtime 3D)
│   │   └── useAuth.ts            # [CŨ] Đã có (Khách + Supabase)
│   ├── data/
│   │   ├── dharmaQuotes.ts      # [MỚI] 365 câu Pháp thoại ngắn mỗi ngày
│   │   ├── sutras.ts            # [CŨ - MỞ RỘNG] Thêm Chú Đại Bi, Kinh Địa Tạng, Phổ Môn
│   │   └── fortunes.ts          # [CŨ] Đã có (100 quẻ thẻ bài)
│   └── pages/
│       ├── index.vue            # [CŨ] Cổng tam quan & Trang chủ
│       ├── chua.vue             # [CŨ] Chánh điện 2D
│       ├── hanh-huong.vue       # [CŨ] Đại điện 3D WebGL
│       └── ban-do.vue           # [MỚI] Bản đồ tương tác 2.5D toàn cảnh chùa
└── supabase/
    ├── schema.sql               # [CŨ] Đã có (prayers, merits)
    └── migrations/              # [MỚI] Các file migration cho tính năng mới
```

---

## 2. ĐẶC TẢ CẤU TRÚC DỮ LIỆU & TYPES (TYPESCRIPT)

Tạo file mới: `app/types/practice.ts` và `app/types/ecosystem.ts`.

### 2.1. Module Tu Tập (`app/types/practice.ts`)
```typescript
/** Nhật ký thực hành tu tập hàng ngày */
export interface PracticeDayRecord {
  date: string // YYYY-MM-DD
  incenseCount: number // Số lần thắp nhang
  chantingCount: number // Số biến niệm Phật (tràng hạt)
  meditationMinutes: number // Số phút ngồi thiền
  sutraReadCount: number // Số bài kinh đã đọc
  treeWatered: boolean // Đã tưới cây Bồ Đề hôm nay chưa
  dharmaRead: boolean // Đã đọc Pháp thoại hôm nay chưa
  prayersCount: number // Số lời nguyện đã phát
}

/** Cấu hình phiên thiền định */
export interface MeditationConfig {
  durationMinutes: number // 3, 5, 10, 15, 20, 30
  ambientSound: 'silence' | 'rain' | 'stream' | 'temple_bell' | 'wind'
  guidanceVoice: boolean // Hướng dẫn hơi thở trực quan (hít vào / thở ra)
  bellIntervalMinutes?: number // Tiếng chuông điểm nhịp (mỗi 5 phút)
}

/** Bài kinh điển trong thư viện */
export interface SutraDetail {
  id: string
  title: string
  transliterationTitle?: string // Tên Hán Việt / Phạn
  category: 'daily' | 'repentance' | 'mahayana' | 'mantra'
  summary: string
  contentLines: Array<{
    section?: string
    text: string
    phonetic?: string // Âm đọc nếu là câu chú
  }>
  audioUrl?: string
  durationEstimateMinutes: number
}

/** Câu Pháp thoại mỗi ngày */
export interface DharmaQuote {
  id: number
  quote: string
  source: string // Kinh Pháp Cú, Thiền Sư Thích Nhất Hạnh, Lời Phật Dạy,...
  category: 'peace' | 'compassion' | 'letting_go' | 'karma' | 'mindfulness'
  backgroundTheme?: string
}
```

### 2.2. Module Sinh Thái (`app/types/ecosystem.ts`)
```typescript
/** Loài cá phóng sinh */
export interface FishSpecies {
  id: string
  name: string
  scientificOrCommonName: string
  symbolism: string // Ý nghĩa: cát tường, trường thọ, thanh tịnh
  colorScheme: { primary: string; secondary: string; tail: string }
  swimSpeedRange: [number, number]
  growthDurationDays: number // Số ngày để đạt độ trưởng thành hoàn toàn (vd: 30 ngày)
}

/** Cá đang sống trong hồ */
export interface PondFishItem {
  id: string
  userId?: string // null nếu khách vãng lai
  speciesId: string
  name: string // Tên người dùng đặt cho cá
  prayerNote?: string // Lời nguyện lành khi thả cá
  releasedAt: number // Timestamp ms
  lastFedAt?: number // Timestamp ms
  sizeMultiplier: number // 0.4 (cá con) -> 1.0 (trưởng thành)
}

/** Cây Bồ Đề cá nhân */
export interface BodhiTreeState {
  id: string
  userId?: string
  plantedAt: number // Timestamp ms
  totalWaterings: number
  lastWateredDate: string // YYYY-MM-DD
  stage: 'seed' | 'sprout' | 'sapling' | 'grown' | 'ancient' // 5 giai đoạn
  prayersAttached: Array<{
    id: string
    wish: string
    date: string
    ribbonColor: 'red' | 'yellow' | 'white'
  }>
}

/** Hoa đăng trên mặt nước */
export interface LanternItem {
  id: string
  senderName: string
  prayerText: string
  category: 'peace' | 'health' | 'family' | 'rebirth' // An lạc, Cầu sức khỏe, Gia đạo, Hồi hướng
  lanternType: 'lotus_pink' | 'lotus_gold' | 'hexagonal'
  createdAt: number
  xPercent: number // Tọa độ ngang trên mặt sông (0 - 100)
  speed: number
}
```

---

## 3. DATABASE SCHEMA MỞ RỘNG (SUPABASE SQL)

Tạo file mới: `supabase/migrations/02_advanced_features.sql`. Chạy trong Supabase SQL Editor khi muốn kích hoạt tính năng cloud.

```sql
-- ============================================================================
-- 1. BẢNG HỒ SƠ TU TẬP (PROFILES & PRACTICE LOGS)
-- ============================================================================
create table if not exists public.user_practice_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null default 'Thiện nam / Tín nữ',
  total_incense integer default 0,
  total_chanting_rounds integer default 0,
  total_meditation_minutes integer default 0,
  total_prayers integer default 0,
  total_fish_released integer default 0,
  updated_at timestamptz default now()
);

alter table public.user_practice_stats enable row level security;
create policy "Chủ tài khoản đọc và sửa thống kê của mình"
  on public.user_practice_stats
  for all using (auth.uid() = user_id);

-- ============================================================================
-- 2. BẢNG CÂY BỒ ĐỀ (BODHI TREES)
-- ============================================================================
create table if not exists public.bodhi_trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tree_name text default 'Cây Bồ Đề Tâm',
  planted_at timestamptz default now(),
  water_count integer default 1,
  last_watered_date date default current_date,
  prayers jsonb default '[]'::jsonb,
  is_public boolean default true
);

alter table public.bodhi_trees enable row level security;
create policy "Mọi người có thể chiêm bái cây Bồ Đề công khai"
  on public.bodhi_trees for select using (is_public = true or auth.uid() = user_id);
create policy "Chủ sở hữu được cập nhật cây của mình"
  on public.bodhi_trees for update using (auth.uid() = user_id);
create policy "Chủ sở hữu được tạo cây"
  on public.bodhi_trees for insert with check (auth.uid() = user_id);

-- ============================================================================
-- 3. BẢNG HỒ PHÓNG SINH (POND FISH)
-- ============================================================================
create table if not exists public.pond_fish (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  releaser_name text not null default 'Ẩn danh',
  species_id text not null,
  fish_name text default 'Cá Cát Tường',
  wish_note text,
  released_at timestamptz default now(),
  feed_count integer default 0,
  last_fed_at timestamptz
);

alter table public.pond_fish enable row level security;
create policy "Ai cũng xem được cá trong hồ phóng sinh"
  on public.pond_fish for select using (true);
create policy "Ai cũng có thể phóng sinh cá"
  on public.pond_fish for insert with check (char_length(coalesce(wish_note, '')) <= 240);

-- ============================================================================
-- 4. BẢNG HOA ĐĂNG CẦU AN (LANTERNS)
-- ============================================================================
create table if not exists public.river_lanterns (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null default 'Phật tử ẩn danh',
  prayer_text text not null,
  category text not null default 'peace',
  lantern_type text not null default 'lotus_pink',
  created_at timestamptz default now()
);

alter table public.river_lanterns enable row level security;
create policy "Xem hoa đăng công khai"
  on public.river_lanterns for select using (true);
create policy "Thả hoa đăng cầu nguyện"
  on public.river_lanterns for insert with check (char_length(prayer_text) between 1 and 200);

-- Tự động dọn dẹp hoa đăng cũ sau 7 ngày để tránh phình dữ liệu
create index idx_lanterns_created_at on public.river_lanterns (created_at desc);
```

---

## 4. LỘ TRÌNH PHÂN CHIA CÁC PHASE (ROADMAP)

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: TU TẬP SÂU & NHẬT KÝ CÁ NHÂN (Quick Wins - 1-2 Tuần)          │
│ • Chuỗi hạt 108 biến (Haptic + Web Audio)                              │
│ • Không gian thiền định Zen (Timer + Chuông thiền)                     │
│ • Mở rộng kinh điển & Pháp thoại mỗi ngày                              │
│ • Nhật ký tu tập Local-first (Lưu trình duyệt)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: BẢN ĐỒ CHÙA & KHÔNG GIAN SINH THÁI (2-3 Tuần)                 │
│ • Bản đồ chùa thủy mặc 2.5D (Trung tâm kết nối các khu vực)            │
│ • Hồ cá Koi phóng sinh Canvas 2D (Boids algorithm + Sinh trưởng)       │
│ • Vườn Bồ Đề (Gieo hạt + Tưới nước mỗi ngày)                           │
│ • Thả hoa đăng mặt nước (Hiệu ứng ánh sáng lung linh)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ĐỒNG BỘ CLOUD, CỘNG ĐỒNG & REALTIME (2 Tuần)                  │
│ • Đồng bộ Supabase Auth & Cloud Migration                              │
│ • Kiểm duyệt nội dung & Rate limit chống spam                          │
│ • Sự kiện thả hoa đăng tập thể đêm Rằm (Realtime broadcast)            │
│ • PWA Offline & Tối ưu hóa toàn diện trên Mobile                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### PHASE 1: TU TẬP SÂU & NHẬT KÝ CÁ NHÂN (LOCAL-FIRST)
> **Mục tiêu:** Cung cấp ngay các công cụ tu tập thiết thực, sâu lắng mỗi ngày mà không cần phụ thuộc vào server hay tài khoản phức tạp.

#### Task 1.1: Tràng hạt niệm Phật 108 biến (`BeadCounter.vue` & `useChanting.ts`)
- **Mô tả:** Trải nghiệm lần chuỗi hạt niệm Phật trang nghiêm trên màn hình.
- **Chi tiết kỹ thuật:**
  - Tạo `app/composables/useChanting.ts`:
    - Biến reactive: `currentCount` (0 - 108), `roundCount` (số chuỗi đã hoàn thành), `beadVibrationEnabled`.
    - Phát âm thanh gõ mõ / chuông con thông qua Web Audio API (`useSound.ts`) ở mỗi lần chuyển hạt.
    - Haptic feedback: gọi `navigator.vibrate?.(15)` mỗi khi chạm hạt (trên điện thoại).
    - Khi chạm mốc 108 hạt: phát tiếng chuông ngân dài, tự động tăng `roundCount` và kích hoạt hiệu ứng vầng sáng hào quang.
  - Tạo `app/components/practice/BeadCounter.vue`:
    - Vòng tràng hạt SVG hình tròn tương tác, có thể vuốt (swipe) hoặc click để lần hạt.
    - Lựa chọn danh hiệu niệm: *Nam Mô A Di Đà Phật*, *Nam Mô Quán Thế Âm Bồ Tát*, *Nam Mô Bổn Sư Thích Ca Mâu Ni Phật*.
    - Nút bật/tắt âm thanh mõ và rung phản hồi.
- **Tiêu chuẩn nghiệm thu (Acceptance Criteria):**
  - [ ] Chạm hoặc vuốt đều tăng biến số chính xác, không bị double-click ngoài ý muốn.
  - [ ] Điện thoại rung nhẹ mỗi lần lần hạt (nếu thiết bị hỗ trợ).
  - [ ] Đạt 108 biến ghi nhận ngay vào nhật ký tu tập trong ngày.

#### Task 1.2: Không gian Thiền định Zen (`ZenMeditation.vue` & `useMeditation.ts`)
- **Mô tả:** Không gian tịnh tâm với đồng hồ thiền (Zen timer), âm thanh môi trường và vòng tròn nhịp thở.
- **Chi tiết kỹ thuật:**
  - Tạo `app/composables/useMeditation.ts`:
    - State: `isActive`, `remainingSeconds`, `totalDuration`, `ambientTrack`.
    - Tích hợp âm thanh chuông bát (tibetan singing bowl) mở đầu và kết thúc bằng Web Audio API (tần số 432Hz hoặc 528Hz thư thái).
    - Tạo âm thanh nền tổng hợp không cần load file mp3: tiếng suối róc rách (white noise + biquad filter), tiếng mưa rơi nhẹ.
  - Tạo `app/components/practice/ZenMeditation.vue`:
    - Chọn mốc thời gian: 3 phút (khởi tâm), 5 phút, 10 phút, 15 phút, 30 phút.
    - Vòng tròn hướng dẫn nhịp thở (Breathing circle animation): Hít vào (4s) ➔ Giữ (2s) ➔ Thở ra (6s) ➔ Nghỉ (2s) chậm rãi.
    - Chế độ toàn màn hình (Full-screen Zen Mode) làm dịu ánh sáng nền (dark dimmed warm).
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Đồng hồ đếm ngược chính xác kể cả khi tắt màn hình tạm thời hoặc đổi tab (`requestAnimationFrame` / `performance.now`).
  - [ ] Tiếng chuông bát kết thúc êm dịu, âm vang ngân tự nhiên.
  - [ ] Tự động lưu số phút đã thiền vào nhật ký ngày sau khi hoàn thành.

#### Task 1.3: Thư viện Kinh điển & Pháp thoại mỗi ngày
- **Mô tả:** Đọc kinh chữ lớn trang nhã và nhận một lời dạy Phật pháp mỗi sáng.
- **Chi tiết kỹ thuật:**
  - Mở rộng `app/data/sutras.ts`:
    - Thêm nội dung hoàn chỉnh: *Chú Đại Bi (84 câu)*, *Kinh Bát Nhã Ba La Mật Đa Tâm Kinh*, *Kinh Sám Hối Hồng Danh*, *Kinh Phổ Môn*.
    - Cấu trúc từng câu kinh có phân đoạn và phiên âm rõ ràng.
  - Tạo `app/data/dharmaQuotes.ts`: 365 câu lời Phật dạy và pháp thoại ngắn được chọn lọc kỹ lưỡng, phân chia theo chủ đề an lạc, nhân quả, tha thứ, buông xả.
  - Tạo `app/components/practice/SutraReader.vue`:
    - Tính năng tự động cuộn chữ mượt mà (Auto-scroll) với thanh trượt tốc độ.
    - Nút tăng/giảm kích thước font chữ (cho Phật tử lớn tuổi dễ đọc).
    - Chế độ nền giấy dó (kem be `#F5EFE0`) và nền đêm huyền ảo (`#1A1714`).
  - Tạo `app/components/practice/DailyDharmaModal.vue`:
    - Hiển thị câu Pháp thoại tương ứng với ngày trong năm (`dayOfYear % totalQuotes`).
    - Nút "Chia sẻ tâm thiện": tạo ảnh card chữ thư pháp dạng Canvas để lưu về máy hoặc chia sẻ cho người thân.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Cuộn chữ mượt mà không giật khung hình.
  - [ ] Card Pháp thoại tạo ra ảnh sắc nét trên cả màn hình Retina/High DPI.

#### Task 1.4: Hệ thống Nhật ký Tu tập Local-first (`usePracticeJournal.ts` & `PracticeJournalModal.vue`)
- **Mô tả:** Ghi nhận chuỗi ngày tịnh tâm và tổng số hoạt động tu tập đã tích lũy.
- **Chi tiết kỹ thuật:**
  - Tạo `app/composables/usePracticeJournal.ts`:
    - Khóa lưu trữ cục bộ: `localStorage.getItem('dco_journal_v1')`.
    - Tự động đồng bộ các chỉ số từ thắp nhang, gõ chuông, niệm Phật, thiền định, đọc kinh.
    - Tính toán chuỗi ngày tịnh tâm liên tục (Mindfulness Streak): không mang tính áp lực cạnh tranh mà để khích lệ người dùng duy trì thói quen an trú.
  - Tạo `app/components/profile/PracticeJournalModal.vue`:
    - Xem lịch tuần/tháng với các chấm hoa sen đánh dấu những ngày đã viếng chùa/tu tập.
    - Biểu đồ tổng kết nhẹ nhàng (tổng số phút thiền, số lần niệm hạt, số nén nhang đã dâng).
    - Mục "Hồi hướng công đức": Viết vài dòng tâm niệm hồi hướng an lành cho gia đình, người thân sau mỗi buổi tu tập.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Dữ liệu lưu bền vững trên thiết bị, mở lại trình duyệt không bị mất.
  - [ ] Tính năng xuất/nhập file JSON sao lưu cá nhân (phòng khi đổi trình duyệt).

---

### PHASE 2: BẢN ĐỒ NGÔI CHÙA & PHÂN KHU SINH THÁI
> **Mục tiêu:** Mở rộng trải nghiệm từ một trang web đơn lẻ thành một **quần thể chùa tương tác sống động**, có cây cỏ, hồ nước và các loài sinh vật lớn dần theo thời gian.

#### Task 2.1: Bản đồ Chùa Thủy Mặc 2.5D (`TempleMapModal.vue` & `pages/ban-do.vue`)
- **Mô tả:** Bản đồ tổng quan toàn cảnh ngôi chùa với 8 phân khu danh lam.
- **Chi tiết kỹ thuật:**
  - Vẽ đồ họa bản đồ phong cách tranh thủy mặc / isometric nhẹ nhàng (Vector SVG hoặc hình ảnh tối ưu WebP kết hợp SVG hot-spots):
    1. *Cổng Tam Quan* (Lối vào, lịch âm, chọn phong cách chùa Bắc/Trung/Nam)
    2. *Chánh Điện* (Dâng hương, lễ Phật, hồi hướng)
    3. *Hồ Phóng Sinh* (Thả cá, ngắm cá bơi)
    4. *Vườn Bồ Đề* (Trồng cây, tưới cây, treo dải lụa nguyện ước)
    5. *Tháp Chuông & Gác Mõ* (Thỉnh đại hồng chung, chuông ngân lan tỏa)
    6. *Nhà Tụng Kinh* (Niệm Phật 108 hạt, thiền định, đọc kinh)
    7. *Bến Hoa Đăng* (Thả đèn hoa đăng lung linh trôi theo dòng nước)
    8. *Khu Cầu Nguyện & Sổ Vàng* (Cầu an, cầu siêu, gieo quẻ xăm)
  - Hiệu ứng: Mây bay lượn lờ (CSS translate vô tận), chim bay ngang, ánh sáng vầng hào quang nhẹ quanh các mái chùa.
  - Khi người dùng click vào từng khu vực: Hiển thị tooltip mô tả ngắn kèm nút "Bước vào không gian" (chuyển sang modal chuyên biệt hoặc dẫn tới góc nhìn tương ứng).
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Responsive hoàn hảo trên mobile (hỗ trợ pinch-to-zoom hoặc kéo rê ngón tay nhẹ nhàng).
  - [ ] Dung lượng toàn bộ asset bản đồ $< 450$ KB.

#### Task 2.2: Hồ cá Koi Phóng Sinh Canvas 2D (`FishPondCanvas.vue` & `useFishPond.ts`)
- **Mô tả:** Hồ cá trong xanh với đàn cá Koi bơi lội mềm mại, cho phép người dùng phóng sinh cá ảo và chăm sóc cá.
- **Chi tiết kỹ thuật:**
  - Tạo `app/composables/useFishPond.ts`:
    - Danh sách các loài cá: Cá Koi Kohaku (trắng đỏ), Taisho Sanke (3 màu), Yamabuki (vàng ánh kim), Cá Chép Đỏ Cát Tường.
    - Logic tính toán sinh trưởng:
      - $AgeDays = \frac{Date.now() - releasedAt}{86400000}$
      - Kích thước cá: $Scale = \min(1.0, 0.4 + \frac{AgeDays}{30} \times 0.6)$. Sau 30 ngày cá đạt kích cỡ cực đại.
    - Lưu trữ danh sách cá cá nhân và các chú cá công cộng trong `localStorage` (hoặc Supabase table `pond_fish`).
  - Tạo `app/components/ecosystem/FishPondCanvas.vue`:
    - Vẽ bằng HTML5 Canvas 2D với vòng lặp `requestAnimationFrame`:
      - Thuật toán bầy đàn (Boids): Đàn cá tự định hướng bơi quanh hồ, tránh va vào bờ, tách đàn rồi tụ hội.
      - Thân cá uốn lượn hình sin mềm mại theo nhịp bơi.
      - Tương tác chạm vào mặt nước: Tạo sóng nước loang tròn (`ripple effect`), cá bơi tản ra khi chạm gần chúng.
      - Nút "Rắc thức ăn": Click vào hồ làm rơi các hạt thức ăn, cá bơi lại gần đớp mồi.
      - Nút "Phóng sinh cá": Mở modal chọn loài cá, đặt tên cá, viết lời nguyện thiện lành ➔ Cá mới bơi vào hồ.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Đạt $60$ FPS ổn định trên cả điện thoại (Canvas 2D tối ưu, số lượng cá điều tiết từ 15-30 con).
  - [ ] Tự động dừng vòng lặp animation khi người dùng ẩn tab trình duyệt (`document.hidden`).

#### Task 2.3: Vườn Bồ Đề Tâm (`BodhiGarden.vue` & `useBodhiTree.ts`)
- **Mô tả:** Mỗi người dùng gieo trồng và chăm sóc một cây Bồ Đề tâm linh của riêng mình.
- **Chi tiết kỹ thuật:**
  - Tạo `app/composables/useBodhiTree.ts`:
    - Quản lý trạng thái cây: `plantedAt`, `waterCount`, `lastWateredDate`, `treeStage`.
    - Quy tắc tưới nước: Mỗi ngày người dùng chỉ được tưới cây 1 lần (để rèn luyện tính kiên nhẫn).
    - 5 giai đoạn phát triển:
      1. *Hạt mầm (Ngày 1 - 2)*
      2. *Mầm xanh nhú lá (Ngày 3 - 6)*
      3. *Cây non (Ngày 7 - 14)*
      4. *Cây Bồ Đề trưởng thành (Ngày 15 - 30)*
      5. *Cây Bồ Đề đại thụ tỏa bóng (Sau 30 ngày)*
    - Tính năng treo dải lụa cầu an: Treo dải lụa màu đỏ/vàng lên cành cây kèm lời ước nguyện cho người thân.
  - Tạo `app/components/ecosystem/BodhiGarden.vue`:
    - Đồ họa SVG động kết hợp lá cây lay nhẹ trong gió.
    - Hiệu ứng tưới nước: Giọt nước long lanh rơi xuống gốc cây kèm âm thanh suối mát.
    - Gốc cây có tiếng chuông gió đung đưa thư thái.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Chỉ cho phép tưới 1 lần/ngày theo ngày thực tế (GMT+7).
  - [ ] Hiển thị đúng giai đoạn phát triển tương ứng với số ngày chăm sóc.

#### Task 2.4: Bến Thả Hoa Đăng Cầu An (`LanternRiver.vue` & `useLanterns.ts`)
- **Mô tả:** Không gian bến sông về đêm với hàng trăm đóa hoa đăng lung linh trôi theo dòng nước.
- **Chi tiết kỹ thuật:**
  - Tạo `app/components/ecosystem/LanternRiver.vue`:
    - Khung cảnh đêm trăng mờ ảo, mặt nước gợn sóng lấp lánh phản chiếu ánh đèn lồng.
    - Các hoa đăng trôi từ từ từ góc màn hình ra xa (hiệu ứng phối cảnh xa gần: đèn ở xa nhỏ dần và mờ dần).
    - Người dùng bấm vào từng hoa đăng đang trôi để xem lời nguyện cầu tốt lành của những người khác (ẩn danh).
    - Nút "Thả hoa đăng": Chọn kiểu dáng (sen hồng, sen vàng), ghi họ tên và lời nguyện (cầu bình an, sức khỏe, hồi hướng cha mẹ) ➔ Đèn từ từ hạ thủy và trôi ra dòng sông.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Hiệu ứng ánh sáng lung linh (warm glow) nhẹ nhàng, không gây mỏi mắt.
  - [ ] Cho phép click đọc lời nguyện của các hoa đăng đang trôi trên sông.

---

### PHASE 3: ĐỒNG BỘ CLOUD, CỘNG ĐỒNG & SỰ KIỆN REALTIME
> **Mục tiêu:** Kết nối mọi người trong các dịp lễ lớn, đồng bộ dữ liệu trên nhiều thiết bị và bảo vệ không gian linh thiêng.

#### Task 3.1: Hoàn thiện Schema Supabase, RLS & Migration scripts
- **Mô tả:** Triển khai hạ tầng lưu trữ đám mây an toàn, bảo mật dữ liệu cá nhân.
- **Chi tiết kỹ thuật:**
  - Tạo file migration `supabase/migrations/02_advanced_features.sql` với RLS chặt chẽ.
  - Nâng cấp `useAuth.ts`:
    - Khi người dùng đăng nhập bằng Email / Supabase Auth: Tự động hợp nhất dữ liệu từ `localStorage` (cá đã thả, cây đã trồng, nhật ký) lên bảng Supabase của họ.
    - Khách chưa đăng nhập: Mọi dữ liệu vẫn lưu nguyên vẹn ở local, không bị mất.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Đăng nhập trên thiết bị mới tải về đầy đủ cây Bồ Đề và nhật ký tu tập của tài khoản đó.

#### Task 3.2: Bộ lọc nội dung & Kiểm duyệt chống Spam (`useModeration.ts`)
- **Mô tả:** Ngăn chặn các nội dung dung tục, quảng cáo, chửi bới, bảo đảm sự thanh tịnh cho nơi thờ tự online.
- **Chi tiết kỹ thuật:**
  - Tạo danh sách từ khóa nhạy cảm / danh sách đen tiếng Việt (`app/data/badwords.ts`).
  - Hàm kiểm duyệt tự động: Lọc bỏ ký tự đặc biệt cố tình lách luật (vd: l-ừ-a đ-ả-o, số điện thoại spam bán hàng).
  - Rate limiting phía client và API: Giới hạn mỗi địa chỉ IP / người dùng chỉ được gửi tối đa 3 lời nguyện / hoa đăng trong 10 phút.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Chặn đứng các từ ngữ thô tục, spam link hoặc số điện thoại rác trước khi lưu vào database.

#### Task 3.3: Sự kiện thả hoa đăng tập thể đêm Rằm (Realtime Broadcast)
- **Mô tả:** Hàng nghìn người cùng trực tuyến thả hoa đăng vào tối ngày 14, 15 âm lịch hàng tháng.
- **Chi tiết kỹ thuật:**
  - Tận dụng kênh Supabase Realtime Broadcast trong `useMultiplayer.ts`:
    - Kênh `realtime:lanterns_event`.
    - Khi bất kỳ ai bấm thả hoa đăng, gửi một payload gọn nhẹ: `{ id, x, text, type, sender }`.
    - Các máy khác đang mở màn hình bến sông sẽ thấy ngay một chiếc hoa đăng mới xuất hiện và trôi cùng đàn hoa đăng hiện hữu.
  - Fallback an toàn: Nếu số lượng người tham gia vượt quá hạn ngạch Realtime của Supabase, hệ thống tự động chuyển sang mô phỏng hoa đăng từ database theo chu kỳ 15 giây/lần.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Kiểm thử đồng thời 5 tab trình duyệt cùng lúc: hoa đăng thả từ tab này trôi ngay tức khắc trên 4 tab còn lại.

#### Task 3.4: PWA (Progressive Web App) & Tối ưu Mobile Hoàn Chỉnh
- **Mô tả:** Cho phép Phật tử cài đặt website lên màn hình chính điện thoại như ứng dụng native, mở lên viếng chùa mỗi sáng.
- **Chi tiết kỹ thuật:**
  - Cấu hình Web App Manifest (`manifest.json`): Tên "Đi Chùa Online", biểu tượng hoa sen vàng viền đỏ, theme color `#8B2E2E`, display `standalone`.
  - Service Worker cache các tài nguyên tĩnh (âm thanh Web Audio, font chữ Noto Serif, Cormorant Garamond, icons) để ứng dụng mở tức thì không có độ trễ.
  - Chế độ chuông nhắc tu tập: Tích hợp Web Notifications (nếu người dùng đồng ý) nhắc giờ tịnh tâm vào lúc 6h sáng hoặc 21h tối.
- **Tiêu chuẩn nghiệm thu:**
  - [ ] Cài đặt thành công trên màn hình chính (Add to Home Screen) của cả iOS Safari và Android Chrome.
  - [ ] Mở ứng dụng toàn màn hình không có thanh địa chỉ trình duyệt, cảm giác như ứng dụng gốc.

---

## 5. TIÊU CHUẨN KIỂM THỬ & NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chuẩn kỹ thuật | Cách thức kiểm thử |
| :--- | :--- | :--- |
| **Hiệu năng (FPS)** | Đạt $\ge 55$ FPS khi mở hồ cá Canvas 2D và cảnh chùa 3D. | Mở Performance tab trong Chrome DevTools trên thiết bị di động (hoặc giả lập CPU throttle 4x). |
| **Dung lượng (Bundle Size)** | Trang tải ban đầu $< 1.5$ MB; route 3D lười tải (lazy-load) khi người dùng chủ động vào `/hanh-huong`. | Kiểm tra Network tab khi tải trang đầu tiên. |
| **Ngoại tuyến (Offline/Local)** | Mọi chức năng đếm hạt, thiền, đọc kinh, tưới cây hoạt động 100% khi ngắt kết nối mạng. | Bật chế độ Airplane Mode / Offline trong DevTools và kiểm tra các thao tác. |
| **Âm thanh** | Không bị méo tiếng, rè âm, tự động tắt âm khi đóng tab hoặc chuyển ứng dụng khác. | Kiểm tra Web Audio Context lifecycle khi chuyển tab (`visibilitychange`). |
| **Trải nghiệm gõ phím / chạm** | Không bị delay khi lần hạt niệm Phật; haptic vibration hoạt động nhạy. | Thử nghiệm thực tế trên điện thoại Android / iOS. |

---

## 6. QUẢN TRỊ RỦI RO KỸ THUẬT & HIỆU NĂNG

### Rủi ro 1: Scene Three.js 3D làm nóng máy điện thoại yếu
- **Nguyên nhân:** Render bóng đổ (`castShadow`), quá nhiều nguồn sáng `PointLight`, hoặc kích thước texture lớn.
- **Giải pháp xử lý:**
  - Như đã làm rất tốt trong `world.ts`: Không dùng model GLTF bên ngoài nặng hàng chục MB; dựng bằng Three.js Primitives gọn nhẹ.
  - Dùng `InstancedMesh` cho 100 bồ đoàn thảm quỳ để gộp vào 2 draw calls duy nhất.
  - Đèn lồng dùng vật liệu tự phát quang (`emissive`) thay vì gắn nhiều `PointLight`.
  - Trên mobile yếu, tắt tính năng đổ bóng phức tạp (`renderer.shadowMap.enabled = false`).

### Rủi ro 2: Quá tải kết nối Supabase Realtime trong ngày Rằm
- **Nguyên nhân:** Gói Supabase Free giới hạn số concurrent connections đồng thời.
- **Giải pháp xử lý:**
  - Sử dụng **Broadcast Channels** tạm thời thay vì Database Postgres Changes (Broadcast không ghi đĩa database, siêu nhẹ).
  - Có cơ chế Client-side throttling: Mỗi client chỉ gửi gói tọa độ/hoa đăng với tần số tối đa 100ms/lần.
  - Khi mất kết nối realtime, tự động chuyển về chế độ chạy local độc lập mà không báo lỗi làm phiền người dùng.

### Rủi ro 3: Bị lợi dụng làm nơi tuyên truyền, mê tín dị đoan hoặc lừa đảo quyên góp
- **Giải pháp xử lý:**
  - Ghi chú minh bạch ở mục Công Đức: Đây là công đức tượng trưng / mô phỏng, trang web không thu tiền bất chính.
  - Lời nguyện cộng đồng và hoa đăng luôn qua bộ lọc từ ngữ tự động và giới hạn độ dài $\le 200$ ký tự.
  - Giữ vững phong cách trang nghiêm, không thêm các hình thức bói toán tiêu cực.

---

*Tài liệu này là căn cứ kỹ thuật chính thức để triển khai từng module. Khi bắt đầu bất kỳ giai đoạn nào, lập trình viên và AI agent chỉ cần đối chiếu theo đúng danh sách Task Breakdown và Tiêu chuẩn nghiệm thu ở trên.*


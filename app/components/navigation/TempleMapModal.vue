<script setup lang="ts">
import { ref } from 'vue'
import type { TempleZone } from '~/types/ecosystem'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-zone', action: string): void
}>()

const TEMPLE_ZONES: TempleZone[] = [
  {
    id: 'cong-tam-quan',
    name: 'Cổng Tam Quan',
    eyebrow: 'Lối vào thiền môn',
    description: 'Cửa thiền rộng mở đón bước chân hành hương, tra cứu lịch âm và chọn phong cách chùa ba miền.',
    icon: '⛩️',
    category: 'worship',
    posX: 50,
    posY: 85,
    targetAction: 'route_chua'
  },
  {
    id: 'ho-phong-sinh',
    name: 'Hồ Sen & Đàn Cá Koi 3D',
    eyebrow: 'Từ bi phóng sanh · Thế giới 3D',
    description: 'Hồ sen ngọc bích với đàn cá Koi Kohaku, Yamabuki bơi lội mềm mại dưới chân cầu đá vòm. Có thể thả cá 3D và rắc mồi nuôi dưỡng tâm từ bi.',
    icon: '🐟',
    category: 'nature',
    badge: '3D Sinh Thái',
    posX: 22,
    posY: 66,
    targetAction: 'modal_fish'
  },
  {
    id: 'ben-hoa-dang',
    name: 'Bến Thả Hoa Đăng',
    eyebrow: 'Ánh sáng nguyện cầu',
    description: 'Dòng sông đêm trăng tĩnh mịch với hàng ngàn hoa đăng sen hồng lung linh gửi lời chúc lành đến muôn loài.',
    icon: '🪔',
    category: 'nature',
    badge: 'Mới · Lung linh',
    posX: 66,
    posY: 78,
    targetAction: 'modal_lanterns'
  },
  {
    id: 'thap-chuong',
    name: 'Tháp Đại Hồng Chung',
    eyebrow: 'Chuông ngân thức tỉnh',
    description: 'Tiếng chuông đồng ngân vang lan tỏa sóng âm thiền tịnh, xua tan phiền não và lắng dịu thân tâm.',
    icon: '🔔',
    category: 'worship',
    posX: 20,
    posY: 44,
    targetAction: 'modal_bell'
  },
  {
    id: 'vuon-bo-de',
    name: 'Vườn Bồ Đề Tâm',
    eyebrow: 'Gieo mầm giác ngộ',
    description: 'Nơi mỗi Phật tử gieo trồng và tưới nước cho cây Bồ Đề của riêng mình, treo dải lụa cầu an lên cành biếc.',
    icon: '🌳',
    category: 'nature',
    badge: 'Mới · Trồng cây',
    posX: 74,
    posY: 44,
    targetAction: 'modal_bodhi'
  },
  {
    id: 'chanh-dien',
    name: 'Đại Điện Tam Bảo',
    eyebrow: 'Trung tâm linh thiêng',
    description: 'Ban Tam Thế dát vàng uy nghi, lư hương khói tỏa trầm mặc, nơi dâng 1-3-5 nén tâm hương và thành kính đảnh lễ.',
    icon: '🕯️',
    category: 'worship',
    posX: 50,
    posY: 36,
    targetAction: 'modal_incense'
  },
  {
    id: 'nha-tung-kinh',
    name: 'Nhà Tụng Kinh & Thiền',
    eyebrow: 'Công phu tu tập',
    description: 'Không gian lần chuỗi hạt 108 biến theo tiếng mõ, tọa thiền định Zen và đọc kinh Chú Đại Bi tự động cuộn chữ.',
    icon: '📿',
    category: 'practice',
    badge: 'Tu tập',
    posX: 26,
    posY: 20,
    targetAction: 'modal_practice'
  },
  {
    id: 'so-vang-cau-an',
    name: 'Khu Cầu An & Sổ Vàng',
    eyebrow: 'Hồi hướng công đức',
    description: 'Ghi lời cầu an cho gia đình vào sổ vàng thiền môn, xin quẻ xăm đầu năm và gieo duyên cúng dường thùng công đức.',
    icon: '🎋',
    category: 'merit',
    posX: 74,
    posY: 20,
    targetAction: 'modal_fortune'
  },
  {
    id: 'vuon-hoa-sen',
    name: 'Vườn Sen Phước Lành',
    eyebrow: 'Hương sen thanh khiết',
    description: 'Vườn sen bách hoa nở rộ giữa hồ thiền, nơi gửi gắm lời chúc an khang và xuất thiệp sen trao tặng người thân.',
    icon: '🌸',
    category: 'nature',
    badge: 'Mới · Tặng sen',
    posX: 85,
    posY: 64,
    targetAction: 'modal_lotus'
  }
]

const selectedZone = ref<TempleZone>(TEMPLE_ZONES[5]) // Mặc định chọn Chánh Điện

function onZoneClick(zone: TempleZone) {
  selectedZone.value = zone
}

function handleGoToZone(action: string) {
  emit('select-zone', action)
}
</script>

<template>
  <div class="card-zen relative flex flex-col overflow-hidden p-0 border border-dong/30 shadow-2xl bg-gradient-to-b from-[#FAF5E8] to-[#EFE1C8] text-[#3D2C1E] rounded-2xl h-[680px] max-h-[92vh]">
    <!-- Thanh trên cùng -->
    <div class="flex items-center justify-between border-b border-dong/25 px-5 py-3.5 bg-kem/90 backdrop-blur-sm z-20">
      <div class="flex items-center gap-2">
        <span class="text-2xl glow-icon">🗺️</span>
        <div>
          <h3 class="font-serif text-lg font-bold sm:text-xl text-do">
            Bản Đồ Quần Thể Chùa 2.5D
          </h3>
          <p class="text-[11px] text-go/70 font-serif">
            Chiêm bái toàn cảnh 8 danh lam không gian thiền tịnh
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs font-serif">
        <NuxtLink
          to="/ban-do"
          class="hidden sm:inline-block rounded-full border border-dong/40 bg-dong/10 px-3 py-1 text-go hover:bg-dong/25 transition-colors"
        >
          Mở trang toàn cảnh ↗
        </NuxtLink>

        <button
          v-if="$attrs.onClose"
          @click="emit('close')"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-dong/15 text-go hover:bg-dong/30 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Khung Bản Đồ Thủy Mặc Isometric -->
    <div class="relative flex-1 overflow-hidden select-none">
      <!-- Nền tranh thủy mặc núi non mờ ảo (Vector SVG) -->
      <svg class="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#EFE2CA" />
            <stop offset="60%" stop-color="#FAF4E8" />
            <stop offset="100%" stop-color="#E8D5B5" />
          </linearGradient>
          <linearGradient id="mountainMist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8B2E2E" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#C9A356" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <rect width="1000" height="680" fill="url(#skyGrad)" />

        <!-- Dãy núi xa xăm tầng 1 -->
        <path d="M0 320 Q180 120 380 260 T750 180 T1000 240 V680 H0 Z" fill="#6A5230" fill-opacity="0.12" />
        <!-- Dãy núi tầng 2 -->
        <path d="M0 420 Q250 240 500 360 T1000 320 V680 H0 Z" fill="url(#mountainMist)" />

        <!-- Dòng sông uốn lượn bên hữu (Bến hoa đăng) -->
        <path d="M720 680 C750 560 880 500 840 400 C800 320 860 220 900 160 L1000 160 L1000 680 Z" fill="#3D5A80" fill-opacity="0.2" />

        <!-- Hồ nước bên tả (Hồ phóng sinh) -->
        <ellipse cx="220" cy="460" rx="140" ry="85" fill="#2D6A4F" fill-opacity="0.25" />
        <ellipse cx="220" cy="460" rx="120" ry="70" fill="#40916C" fill-opacity="0.2" />

        <!-- Con đường đá uốn lượn nối từ cổng tam quan lên chánh điện -->
        <path d="M500 600 C500 520 460 480 500 420 C540 360 500 300 500 240" stroke="#C9A356" stroke-width="18" stroke-linecap="round" fill="none" opacity="0.35" />
        <path d="M500 600 C500 520 460 480 500 420 C540 360 500 300 500 240" stroke="#FAF5E8" stroke-width="12" stroke-linecap="round" fill="none" stroke-dasharray="8 8" opacity="0.7" />

        <!-- Đường rẽ sang hồ cá & tháp chuông -->
        <path d="M480 500 Q320 520 220 460 Q220 380 240 320" stroke="#C9A356" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.3" />

        <!-- Đường rẽ sang vườn bồ đề & hoa đăng -->
        <path d="M520 500 Q680 520 780 470 Q760 380 760 330" stroke="#C9A356" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.3" />

        <!-- Cụm tùng bách xanh mờ trang trí rải rác -->
        <g fill="#2D5A27" fill-opacity="0.35">
          <circle cx="120" cy="380" r="18" /><circle cx="140" cy="370" r="22" /><circle cx="110" cy="390" r="14" />
          <circle cx="880" cy="360" r="20" /><circle cx="900" cy="350" r="24" />
          <circle cx="370" cy="220" r="16" /><circle cx="630" cy="220" r="16" />
        </g>
      </svg>

      <!-- CÁC ĐIỂM GHIM DANH LAM (TEMPLE ZONE MARKERS) -->
      <div
        v-for="zone in TEMPLE_ZONES"
        :key="zone.id"
        @click="onZoneClick(zone)"
        class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-300 hover:scale-125 group"
        :style="{ left: `${zone.posX}%`, top: `${zone.posY}%` }"
      >
        <!-- Vầng hào quang nhấp nháy cho điểm đang chọn -->
        <div
          v-if="selectedZone.id === zone.id"
          class="absolute -inset-3 rounded-full bg-do/30 blur-md animate-pulse"
        />

        <!-- Ghim địa điểm chùa -->
        <div
          class="relative flex flex-col items-center justify-center rounded-2xl border-2 p-2 shadow-lg transition-all"
          :class="
            selectedZone.id === zone.id
              ? 'border-do bg-do text-kem scale-110 shadow-glow'
              : 'border-dong/50 bg-kem/95 text-do hover:border-do hover:bg-kem'
          "
        >
          <span class="text-xl sm:text-2xl">{{ zone.icon }}</span>
          <span class="mt-0.5 whitespace-nowrap text-[10px] font-serif font-bold leading-none px-1">
            {{ zone.name }}
          </span>
        </div>

        <!-- Badge nhỏ nếu có (Mới) -->
        <span
          v-if="zone.badge"
          class="absolute -top-2 -right-2 rounded-full bg-dong px-1.5 py-0.2 text-[8px] font-serif font-bold text-black shadow-sm"
        >
          {{ zone.badge }}
        </span>
      </div>
    </div>

    <!-- Thanh thông tin chi tiết danh lam đã chọn (Docked Footer Bar - Không che bản đồ) -->
    <div
      v-if="selectedZone"
      class="border-t border-dong/25 bg-kem/95 px-5 py-3.5 backdrop-blur-md z-30 shrink-0"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl glow-icon shrink-0">{{ selectedZone.icon }}</span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider text-do font-serif font-bold">
                {{ selectedZone.eyebrow }}
              </span>
              <h4 class="font-serif text-base sm:text-lg font-bold text-do">
                {{ selectedZone.name }}
              </h4>
              <span v-if="selectedZone.badge" class="rounded-full bg-dong/25 px-2 py-0.2 text-[9px] font-serif text-do font-semibold">
                {{ selectedZone.badge }}
              </span>
            </div>
            <p class="text-xs text-go/80 font-serif line-clamp-2 sm:line-clamp-1 mt-0.5 max-w-2xl">
              {{ selectedZone.description }}
            </p>
          </div>
        </div>

        <button
          @click="handleGoToZone(selectedZone.targetAction)"
          class="btn-zen whitespace-nowrap px-5 py-2 text-xs font-serif shadow-glow self-end sm:self-center shrink-0"
        >
          <span>Bước vào không gian</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  </div>
</template>


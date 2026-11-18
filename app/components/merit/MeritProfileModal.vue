<script setup lang="ts">
import { computed } from 'vue'
import { useMeritSystem, MERIT_TIERS } from '~/composables/useMeritSystem'
import { useAuth } from '~/composables/useAuth'
import { getOutfitById } from '~/three/avatarOutfits'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  profile,
  currentTierInfo,
  dailyRemainingPoints,
  canCheckInToday,
  performCheckIn,
  openCheckInModal,
  openOutfitShopModal,
  toggleAura,
  MAX_DAILY_REGULAR_POINTS
} = useMeritSystem()

const { current: authUser } = useAuth()

const displayName = computed(() => authUser.value?.name || 'Phật tử tại gia')

const nextTierPoints = computed(() => currentTierInfo.value.nextPoints)
const currentTierMin = computed(() => currentTierInfo.value.minPoints)

const levelProgressPercent = computed(() => {
  if (!nextTierPoints.value) return 100
  const range = nextTierPoints.value - currentTierMin.value
  const current = profile.totalMerit - currentTierMin.value
  return Math.min(100, Math.max(0, Math.round((current / range) * 100)))
})

const dailyProgressPercent = computed(() => {
  return Math.min(100, Math.round((profile.todayPoints / MAX_DAILY_REGULAR_POINTS) * 100))
})

const currentOutfitDef = computed(() => getOutfitById(profile.currentOutfit))
const activeAccessoriesDefs = computed(() => {
  return (profile.activeAccessories || []).map((id) => getOutfitById(id)).filter(Boolean)
})

function onCheckIn() {
  emit('close')
  openCheckInModal()
}

function onOpenOutfitShop() {
  emit('close')
  openOutfitShopModal()
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  return `${hh}:${mm} - ${dd}/${mo}`
}
</script>

<template>
  <div class="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#25170d] via-[#1b1008] to-[#120a06] border border-[#e6b95c]/50 p-6 sm:p-8 text-[#f7eedc] shadow-[0_24px_80px_rgba(0,0,0,0.7)] max-h-[90vh] flex flex-col">
    <!-- Nền phát sáng hoa sen -->
    <div class="absolute -top-32 right-0 w-80 h-80 rounded-full bg-[#ffd54f]/10 blur-3xl pointer-events-none" />

    <!-- Header Modal -->
    <div class="relative z-10 flex items-center justify-between pb-4 border-b border-[#e6b95c]/25 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffd54f] to-[#b4863f] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,213,79,0.45)] text-[#2a1708]">
          {{ currentTierInfo.badge }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#ffe082]">
              Sổ Công Đức Tu Học
            </h2>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#ffd54f]/20 text-amber-200 border border-[#ffd54f]/30">
              Cấp {{ currentTierInfo.tier }}
            </span>
          </div>
          <p class="text-xs text-[#d2beab]">
            Pháp danh: <span class="font-medium text-[#f5ebd7]">{{ displayName }}</span> · {{ currentTierInfo.title }}
          </p>
        </div>
      </div>

      <button
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#ebd7be] flex items-center justify-center transition-colors"
        title="Đóng"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- Body cuộn được -->
    <div class="relative z-10 overflow-y-auto pr-1 py-4 space-y-5 flex-1 text-xs sm:text-sm">
      <!-- 1. TỔNG QUAN ĐIỂM CÔNG ĐỨC & TIẾN TRÌNH CẤP BẬC -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Tổng điểm tích lũy -->
        <div class="p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/30 flex flex-col justify-between">
          <span class="text-xs text-[#cfbcaa]">Tổng Điểm Trọn Đời</span>
          <div class="my-1">
            <span class="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] to-[#ffb300]">
              {{ profile.totalMerit.toLocaleString('vi-VN') }}
            </span>
            <span class="text-xs text-amber-300 ml-1">điểm</span>
          </div>
          <span class="text-[11px] text-[#a89582]">Dùng để thăng cấp & khai mở hào quang</span>
        </div>

        <!-- Mức trần ngày hôm nay (Anti-Spam) -->
        <div class="p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/30 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-[#cfbcaa]">
            <span>Hôm Nay</span>
            <span class="font-mono text-amber-300">{{ profile.todayPoints }} / {{ MAX_DAILY_REGULAR_POINTS }}</span>
          </div>
          <div class="w-full bg-white/10 h-2.5 rounded-full overflow-hidden my-2">
            <div
              class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              :style="{ width: `${dailyProgressPercent}%` }"
            />
          </div>
          <span class="text-[11px] text-[#a89582]">
            Còn nhận tối đa: <b class="text-amber-200">{{ dailyRemainingPoints }}</b> điểm hôm nay
          </span>
        </div>

        <!-- Chuỗi ngày điểm danh (Streak) -->
        <div class="p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/30 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-[#cfbcaa]">
            <span>Chuỗi Tinh Tấn</span>
            <span class="font-bold text-orange-400">🔥 {{ profile.streakDays }} ngày</span>
          </div>
          <div class="my-2">
            <button
              v-if="canCheckInToday()"
              @click="onCheckIn"
              class="w-full py-1.5 px-3 rounded-xl font-serif text-xs font-bold bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              📅 Điểm Danh (+20đ)
            </button>
            <div
              v-else
              class="py-1 px-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 text-center text-xs font-medium"
            >
              ✓ Hôm nay đã điểm danh
            </div>
          </div>
          <span class="text-[10px] text-[#a89582]">Thưởng chuỗi: 3 ngày (+10đ), 7 ngày (+30đ), 30 ngày (+150đ)</span>
        </div>
      </div>

      <!-- Tiến trình lên cấp tiếp theo -->
      <div class="p-4 rounded-2xl bg-black/35 border border-[#e6b95c]/25">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ currentTierInfo.badge }}</span>
            <span class="font-serif font-bold text-sm text-[#f5ebd7]">{{ currentTierInfo.title }}</span>
          </div>
          <span v-if="nextTierPoints" class="text-xs text-amber-300 font-mono">
            {{ profile.totalMerit }} / {{ nextTierPoints }} điểm ({{ levelProgressPercent }}%)
          </span>
          <span v-else class="text-xs text-purple-300 font-serif font-semibold">
            🌌 Đạt cấp bậc tối cao
          </span>
        </div>

        <div class="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
          <div
            class="h-full bg-gradient-to-r from-[#d9b969] via-[#ffe082] to-[#ffd54f] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,213,79,0.5)]"
            :style="{ width: `${levelProgressPercent}%` }"
          />
        </div>
        <p class="mt-2 text-xs text-[#cfbcaa]">
          {{ currentTierInfo.description }}
        </p>
      </div>

      <!-- 2. HỆ THỐNG 5 TẦNG HÀO QUANG 3D & TÙY CHỌN BẬT/TẮT -->
      <div class="p-4 rounded-2xl bg-black/35 border border-[#e6b95c]/25">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <h3 class="font-serif font-bold text-sm text-[#ffe082]">
              5 Tầng Hào Quang Quang Minh (3D Halo)
            </h3>
          </div>
          <button
            @click="toggleAura"
            class="px-3 py-1 rounded-full text-xs font-serif transition-colors border"
            :class="
              profile.showAura
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-white/5 border-white/20 text-[#a89582]'
            "
          >
            {{ profile.showAura ? '👁️ Đang bật Hào quang' : 'Ẩn Hào quang' }}
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <div
            v-for="t in MERIT_TIERS"
            :key="t.tier"
            class="p-2.5 rounded-xl border flex flex-col items-center text-center transition-all"
            :class="
              profile.currentTier >= t.tier
                ? 'bg-[#ffd54f]/10 border-[#ffd54f]/40 text-[#fbf6ec]'
                : 'bg-white/5 border-white/10 text-white/40 opacity-60'
            "
          >
            <span class="text-2xl my-1">{{ t.badge }}</span>
            <span class="font-serif font-bold text-xs">{{ t.name }}</span>
            <span class="text-[10px] text-amber-200/70 mt-0.5">
              {{ t.minPoints }}+ điểm
            </span>
            <span
              v-if="profile.currentTier >= t.tier"
              class="text-[9px] mt-1 text-green-400 font-sans font-medium"
            >
              ✓ Đã mở
            </span>
            <span
              v-else
              class="text-[9px] mt-1 text-[#8c7d6e] font-sans"
            >
              🔒 Chưa mở
            </span>
          </div>
        </div>
      </div>

      <!-- 3. PHÁP PHỤC & PHỤ KIỆN THIỀN MÔN (PHÁP Y CÁC - PHASE 4) -->
      <div class="p-4 rounded-2xl bg-black/35 border border-[#e6b95c]/25">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-base">👘</span>
            <h3 class="font-serif font-bold text-sm text-[#ffe082]">
              Pháp Y Các – Trang Phục & Phụ Kiện
            </h3>
          </div>
          <button
            @click="onOpenOutfitShop"
            class="px-3 py-1 rounded-full text-xs font-serif font-semibold bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Vào Pháp Y Các</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
          <!-- Áo đang mặc -->
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shrink-0"
              :style="{ backgroundColor: (currentOutfitDef?.colorHex || '#5f6f82') + '33' }"
            >
              {{ currentOutfitDef?.badge || '👘' }}
            </div>
            <div>
              <div class="text-[11px] text-[#cfbcaa]">Đang khoác trên người:</div>
              <div class="font-serif font-bold text-sm text-amber-200">
                {{ currentOutfitDef?.name || 'Áo Lam Cư Sĩ' }}
              </div>
              <div class="text-[10px] text-[#a89582] italic">
                {{ currentOutfitDef?.tagline }}
              </div>
            </div>
          </div>

          <!-- Phụ kiện đang đeo -->
          <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <template v-if="activeAccessoriesDefs.length">
              <span
                v-for="acc in activeAccessoriesDefs"
                :key="acc.id"
                class="px-2.5 py-1 rounded-lg text-xs bg-amber-500/15 border border-amber-400/30 text-amber-200 flex items-center gap-1"
              >
                <span>{{ acc.badge }}</span>
                <span>{{ acc.name }}</span>
              </span>
            </template>
            <span v-else class="text-xs text-[#8c7d6e] italic">
              Chưa đeo phụ kiện nào
            </span>
          </div>
        </div>
      </div>

      <!-- 4. NHẬT KÝ HOẠT ĐỘNG THIỆN LÀNH GẦN ĐÂY -->
      <div class="p-4 rounded-2xl bg-black/35 border border-[#e6b95c]/25">
        <h3 class="font-serif font-bold text-sm text-[#ffe082] mb-3 flex items-center gap-2">
          <span>📜</span>
          <span>Nhật Ký Tích Lũy Công Đức Gần Đây</span>
        </h3>

        <div v-if="!profile.history.length" class="text-center py-6 text-xs text-[#9d8977] italic">
          Chưa có nhật ký nào. Hãy thỉnh chuông, tưới nước Bồ Đề, thả hoa đăng hoặc gõ mõ tụng kinh để tích công đức! 🙏
        </div>

        <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="item in profile.history.slice(0, 15)"
            :key="item.id"
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors"
          >
            <div class="flex flex-col min-w-0 pr-2">
              <span class="font-medium text-xs text-[#f5ebd7] truncate">
                {{ item.description }}
              </span>
              <span class="text-[10px] text-[#a89582]">
                {{ formatDate(item.timestamp) }}
              </span>
            </div>
            <span class="font-serif font-bold text-xs text-amber-300 shrink-0">
              +{{ item.amount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Modal -->
    <div class="relative z-10 pt-3 border-t border-[#e6b95c]/25 flex items-center justify-between shrink-0">
      <span class="text-[11px] text-[#9d8977] italic">
        "Công đức vô lượng xuất phát từ tâm từ bi và sự kiên trì mỗi ngày."
      </span>
      <button
        class="px-5 py-2 rounded-full font-serif text-xs font-bold bg-white/10 hover:bg-white/20 text-[#f7eedc] transition-colors"
        @click="emit('close')"
      >
        Đóng lại
      </button>
    </div>
  </div>
</template>


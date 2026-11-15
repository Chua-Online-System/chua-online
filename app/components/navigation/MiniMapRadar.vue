<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  playerX: number
  playerZ: number
  playerYaw: number
  remotePlayers?: Record<string, { x: number; z: number; name: string }>
  isAudioMuted?: boolean
}>()

const emit = defineEmits<{
  (e: 'teleport', target: { x: number; z: number; name: string }): void
  (e: 'toggle-audio'): void
}>()

const isExpanded = ref(false)

// Kích thước thế giới 3D thực tế
const BOUNDS = {
  minX: -88,
  maxX: 88,
  minZ: -94,
  maxZ: 62
}

const worldWidth = BOUNDS.maxX - BOUNDS.minX // 176m
const worldHeight = BOUNDS.maxZ - BOUNDS.minZ // 156m

// Chuyển đổi tọa độ thế giới (X, Z) sang tọa độ phần trăm trên radar (0 -> 100%)
function toPercent(x: number, z: number) {
  const left = ((x - BOUNDS.minX) / worldWidth) * 100
  const top = ((z - BOUNDS.minZ) / worldHeight) * 100
  return {
    left: `${Math.max(4, Math.min(96, left))}%`,
    top: `${Math.max(4, Math.min(96, top))}%`
  }
}

// Danh sách các địa danh linh thiêng trên bản đồ
const landmarks = [
  { id: 'chanh-dien', name: 'Đại Điện Tam Bảo', icon: '🏯', x: 0, z: -15, color: '#fbc02d' },
  { id: 'ho-ca', name: 'Hồ Sen & Cầu Đá', icon: '🐟', x: -65, z: -4, color: '#4dd0e1' },
  { id: 'lau-chuong', name: 'Lầu Đại Hồng Chung', icon: '🔔', x: 48, z: 28, color: '#ffa726' },
  { id: 'vuon-bo-de', name: 'Vườn Bồ Đề Tâm', icon: '🌳', x: 64, z: -12, color: '#81c784' },
  { id: 'ben-hoa-dang', name: 'Bến Hoa Đăng Sông Trăng', icon: '🪷', x: 0, z: -84, color: '#ba68c8' },
  { id: 'thien-duong', name: 'Nhà Tụng Kinh & Thiền Đường', icon: '🧘', x: -48, z: -48, color: '#ffb74d' },
  { id: 'tam-quan', name: 'Cổng Tam Quan', icon: '⛩️', x: 0, z: 48, color: '#e57373' }
]

const playerPosStyle = computed(() => toPercent(props.playerX, props.playerZ))

const playerRotStyle = computed(() => ({
  transform: `translate(-50%, -50%) rotate(${(-props.playerYaw * 180) / Math.PI + 180}deg)`
}))

function onLandmarkClick(lm: { x: number; z: number; name: string }) {
  emit('teleport', lm)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'm' || e.key === 'M') {
    const el = document.activeElement as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
    isExpanded.value = !isExpanded.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="minimap-container select-none">
    <!-- Nút điều khiển thanh công cụ nhỏ -->
    <div class="minimap-bar flex items-center justify-between gap-1.5 mb-1.5 px-2">
      <div class="flex items-center gap-1.5">
        <button
          @click="isExpanded = !isExpanded"
          class="map-btn"
          :title="isExpanded ? 'Thu nhỏ bản đồ (Phím M)' : 'Mở rộng bản đồ (Phím M)'"
        >
          <span>🗺️</span>
          <span class="text-[11px] font-medium hidden sm:inline">{{ isExpanded ? 'Thu gọn' : 'Bản đồ' }}</span>
        </button>
        <button
          @click="emit('toggle-audio')"
          class="map-btn"
          :title="isAudioMuted ? 'Bật âm thanh không gian 3D' : 'Tắt âm thanh không gian 3D'"
        >
          <span>{{ isAudioMuted ? '🔇' : '🔊' }}</span>
        </button>
      </div>

      <div class="text-[11px] font-serif text-[#ffd54f]/90 hidden sm:block">
        Phím <b>M</b>: Bản đồ
      </div>
    </div>

    <!-- Khung Radar Mini-Map -->
    <div
      class="radar-frame transition-all duration-300 relative overflow-hidden"
      :class="isExpanded ? 'w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-2xl' : 'w-[145px] h-[145px] sm:w-[170px] sm:h-[170px] rounded-full'"
    >
      <!-- Lưới Radar & Nền địa hình đồ họa Vector -->
      <div class="absolute inset-0 bg-[#0d161d]/90 backdrop-blur-md border border-[#c9a356]/50 shadow-2xl overflow-hidden pointer-events-auto">
        <!-- Vòng tròn quét radar -->
        <div class="radar-sweep absolute inset-0 pointer-events-none" />

        <!-- Lưới tọa độ địa hình -->
        <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffd54f" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <!-- Sông Trăng phía Bắc -->
        <div class="absolute top-0 left-0 right-0 h-[16%] bg-blue-900/35 border-b border-cyan-400/30 flex items-center justify-center">
          <span class="text-[9px] uppercase tracking-wider text-cyan-300/60 font-serif">Sông Trăng</span>
        </div>

        <!-- Hồ Cá Phóng Sinh Cánh Tây -->
        <div
          class="absolute rounded-full bg-teal-900/40 border border-teal-400/40 flex items-center justify-center"
          style="left: 6%; top: 52%; width: 20%; height: 18%;"
        />

        <!-- Vườn Bồ Đề Cánh Đông -->
        <div
          class="absolute rounded-full bg-emerald-950/40 border border-emerald-400/30 flex items-center justify-center"
          style="left: 76%; top: 46%; width: 20%; height: 20%;"
        />

        <!-- Các địa danh (Landmarks) -->
        <div
          v-for="lm in landmarks"
          :key="lm.id"
          class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
          :style="toPercent(lm.x, lm.z)"
          @click="onLandmarkClick(lm)"
        >
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-transform group-hover:scale-125 shadow-md"
            :style="{ background: `${lm.color}33`, border: `1px solid ${lm.color}` }"
            :title="`Bấm để dịch chuyển đến: ${lm.name}`"
          >
            {{ lm.icon }}
          </div>
          <!-- Nhãn hiển thị khi mở rộng -->
          <div
            v-if="isExpanded"
            class="absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-serif text-[#f5efe0] bg-black/70 px-1 rounded border border-[#c9a356]/40 pointer-events-none mt-0.5"
          >
            {{ lm.name }}
          </div>
        </div>

        <!-- Các người chơi khác online (Remote Players) -->
        <template v-if="remotePlayers">
          <div
            v-for="(p, id) in remotePlayers"
            :key="id"
            class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15"
            :style="toPercent(p.x, p.z)"
          >
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80 animate-ping absolute" />
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-300 border border-white" :title="p.name" />
          </div>
        </template>

        <!-- Vị trí nhân vật bản thân (Player Pin + Arrow) -->
        <div
          class="absolute z-20 pointer-events-none"
          :style="playerPosStyle"
        >
          <div class="relative" :style="playerRotStyle">
            <!-- Chấm sáng vàng -->
            <div class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-lg shadow-amber-400" />
            <!-- Mũi tên chỉ hướng nhìn -->
            <div class="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[8px] border-b-amber-300 absolute left-1/2 -top-2.5 -translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.minimap-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 25;
}

.map-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(20, 14, 10, 0.75);
  border: 1px solid rgba(201, 163, 86, 0.4);
  color: #f5efe0;
  padding: 4px 8px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  backdrop-filter: blur(6px);
  transition: all 0.2s;
}

.map-btn:hover {
  background: rgba(201, 163, 86, 0.25);
  border-color: #ffd54f;
}

.radar-sweep {
  background: conic-gradient(from 0deg at 50% 50%, rgba(255, 213, 79, 0.12) 0deg, transparent 75deg, transparent 360deg);
  animation: sweep 4s linear infinite;
  border-radius: inherit;
}

@keyframes sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAmbientMusic, type SoundscapeType } from '~/composables/useAmbientMusic'

const {
  playing,
  volume,
  currentSoundscape,
  soundscapeOptions,
  initAudio,
  toggle,
  start,
  stop,
  setVolume,
  setSoundscape
} = useAmbientMusic()

const props = withDefaults(
  defineProps<{
    positionClass?: string
    menuAlign?: 'left' | 'right'
  }>(),
  {
    positionClass: 'fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 select-none',
    menuAlign: 'right'
  }
)

const showMenu = ref(false)
const PREF = 'dichua_music'

function togglePlay() {
  toggle()
  if (import.meta.client) {
    localStorage.setItem(PREF, playing.value ? 'on' : 'off')
  }
}

function handleVolumeChange(e: Event) {
  const target = e.target as HTMLInputElement
  setVolume(Number(target.value))
}

function handleSelectSoundscape(sc: SoundscapeType) {
  setSoundscape(sc)
  if (!playing.value) {
    start()
    if (import.meta.client) localStorage.setItem(PREF, 'on')
  }
}

// Trình duyệt chặn tự phát nhạc -> khởi động ở lần chạm đầu tiên
function primeAutoplay() {
  if (!import.meta.client) return
  initAudio()
  const pref = localStorage.getItem(PREF)
  if (pref === 'off') return
  const startOnce = () => {
    if (!playing.value) start()
    window.removeEventListener('pointerdown', startOnce)
    window.removeEventListener('keydown', startOnce)
  }
  window.addEventListener('pointerdown', startOnce, { once: true })
  window.addEventListener('keydown', startOnce, { once: true })
}

onMounted(primeAutoplay)
onBeforeUnmount(() => stop())
</script>

<template>
  <div :class="[positionClass, 'select-none']">
    <!-- Popover bảng điều khiển âm thanh thiền -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-3 scale-95"
    >
      <div
        v-if="showMenu"
        class="card-zen absolute bottom-14 w-72 max-w-[calc(100vw-28px)] p-3.5 sm:p-4 shadow-2xl border border-dong/40 bg-kem/95 backdrop-blur-md rounded-2xl text-go mb-2"
        :class="menuAlign === 'left' ? 'left-0' : 'right-0'"
      >
        <div class="flex items-center justify-between pb-3 border-b border-dong/20">
          <div class="flex items-center gap-1.5 font-serif text-sm font-semibold text-do">
            <span>🎶</span>
            <span>Không Gian Âm Thanh Thiền</span>
          </div>
          <button
            @click="showMenu = false"
            class="h-6 w-6 rounded-full hover:bg-dong/20 flex items-center justify-center text-xs text-go/70"
          >
            ✕
          </button>
        </div>

        <!-- Trạng thái phát / dừng -->
        <div class="my-3 flex items-center justify-between">
          <span class="text-xs font-serif text-go/80">Trạng thái:</span>
          <button
            @click="togglePlay"
            class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-serif font-medium transition-all"
            :class="
              playing
                ? 'bg-do text-kem shadow-glow'
                : 'border border-dong/40 bg-kem text-go/80 hover:bg-dong/15'
            "
          >
            <span>{{ playing ? 'Đang phát' : 'Đang tắt' }}</span>
            <span>{{ playing ? '⏸️' : '▶️' }}</span>
          </button>
        </div>

        <!-- Thanh trượt âm lượng -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-xs font-serif text-go/80 mb-1">
            <span>Âm lượng:</span>
            <span class="font-bold text-do">{{ volume }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            :value="volume"
            @input="handleVolumeChange"
            class="w-full accent-[#8B2E2E] cursor-pointer h-1.5 bg-dong/30 rounded-lg"
          />
        </div>

        <!-- Danh sách 4 Soundscape -->
        <div class="mt-2 space-y-1.5">
          <p class="text-[11px] font-serif text-go/60 uppercase tracking-wider">Chọn âm thanh:</p>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              v-for="sc in soundscapeOptions"
              :key="sc.id"
              @click="handleSelectSoundscape(sc.id)"
              class="flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all text-xs"
              :class="
                currentSoundscape === sc.id && playing
                  ? 'border-do bg-do/15 text-do font-bold shadow-sm'
                  : 'border-dong/30 bg-kem/60 hover:bg-dong/10 text-go/80'
              "
            >
              <span class="text-lg mb-0.5">{{ sc.icon }}</span>
              <span class="font-serif text-[11px] leading-tight line-clamp-1">{{ sc.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Nút điều khiển chính (Floating Pill) -->
    <div class="flex items-center shadow-lg rounded-full border border-dong/50 bg-kem/90 backdrop-blur-md overflow-hidden">
      <!-- Nút bật/tắt nhanh -->
      <button
        @click="togglePlay"
        class="flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm text-go hover:bg-dong/15 transition-colors font-serif"
        :title="playing ? 'Tắt nhạc thiền' : 'Bật nhạc thiền'"
      >
        <span class="text-base" :class="{ 'animate-breathe': playing }">
          {{ playing ? '🎵' : '🔇' }}
        </span>
        <span class="hidden sm:inline font-medium">
          {{ playing ? 'Nhạc thiền' : 'Bật nhạc' }}
        </span>
      </button>

      <!-- Nút mở menu tùy chỉnh chi tiết -->
      <button
        @click="showMenu = !showMenu"
        class="border-l border-dong/30 px-2 py-2.5 text-xs text-go/70 hover:bg-dong/20 transition-colors"
        title="Tùy chỉnh âm lượng & loại âm thanh"
      >
        <span>⚙️</span>
      </button>
    </div>
  </div>
</template>

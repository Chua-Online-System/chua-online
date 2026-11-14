<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useChanting, MANTRAS } from '~/composables/useChanting'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  selectedMantraId,
  selectedMantra,
  currentBead,
  completedMalas,
  soundEnabled,
  vibrateEnabled,
  autoChant,
  autoSpeedMs,
  countNext,
  reset,
  toggleAuto,
  stopAuto
} = useChanting()

const isPressing = ref(false)
const showCompletionGlow = ref(false)

function handleChant() {
  isPressing.value = true
  const res = countNext()
  if (res.completedMala) {
    showCompletionGlow.value = true
    setTimeout(() => {
      showCompletionGlow.value = false
    }, 2800)
  }
  setTimeout(() => {
    isPressing.value = false
  }, 120)
}

function onKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault()
    handleChant()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stopAuto()
})

// Tính toán góc tọa độ cho 28 hạt hiển thị trên vòng chuỗi tượng trưng
const beadNodes = computed(() => {
  const TOTAL_DISPLAY = 36
  const nodes = []
  const radius = 135
  const cx = 160
  const cy = 160
  for (let i = 0; i < TOTAL_DISPLAY; i++) {
    const angle = (i / TOTAL_DISPLAY) * 2 * Math.PI - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    nodes.push({ i, x, y })
  }
  return nodes
})

// Tỉ lệ hạt đang niệm chiếu lên vòng chuỗi tượng trưng
const activeNodeIndex = computed(() => {
  if (currentBead.value === 0) return 0
  return Math.floor((currentBead.value / 108) * 36) % 36
})
</script>

<template>
  <div class="card-zen relative overflow-hidden p-6 sm:p-8 border border-dong/30 shadow-xl bg-kem/95">
    <!-- Nút đóng nếu mở dạng modal -->
    <button
      v-if="$attrs.onClose"
      @click="emit('close')"
      class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-dong/10 text-go hover:bg-dong/25 transition-colors"
      title="Đóng"
    >
      ✕
    </button>

    <div class="mb-4 text-center">
      <p class="eyebrow">Nhiếp tâm niệm Phật</p>
      <h3 class="mt-1 text-2xl heading-serif text-do sm:text-3xl">Tràng Hạt 108 Biến</h3>
      <p class="mt-1 text-xs text-go/70 sm:text-sm">
        Mỗi lần lần hạt là một niệm an lành gửi vào hư không.
      </p>
    </div>

    <!-- Chọn danh hiệu niệm -->
    <div class="mb-6 flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="m in MANTRAS"
        :key="m.id"
        @click="selectedMantraId = m.id"
        class="rounded-full px-3.5 py-1.5 text-xs font-serif transition-all duration-300 sm:text-sm border"
        :class="
          selectedMantraId === m.id
            ? 'border-do bg-do text-kem shadow-glow font-medium'
            : 'border-dong/30 bg-kem/50 text-go/80 hover:bg-dong/15 hover:border-dong'
        "
      >
        {{ m.name }}
      </button>
    </div>

    <!-- Khung chính: Vòng chuỗi và Nút lần hạt -->
    <div class="relative mx-auto my-2 flex h-[340px] w-[320px] items-center justify-center select-none">
      <!-- SVG vòng chuỗi hạt -->
      <svg class="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 320 320">
        <!-- Đường dây chuỗi -->
        <circle cx="160" cy="160" r="135" fill="none" stroke="#C9A356" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="4 4" />
        
        <!-- Các hạt gỗ -->
        <g v-for="node in beadNodes" :key="node.i">
          <!-- Hạt thường -->
          <circle
            :cx="node.x"
            :cy="node.y"
            :r="node.i === activeNodeIndex ? 11 : 7.5"
            :fill="node.i === 0 ? '#C9A356' : node.i <= activeNodeIndex ? '#8B2E2E' : '#5C4033'"
            stroke="#C9A356"
            :stroke-width="node.i === activeNodeIndex ? 2.5 : 1"
            class="transition-all duration-300"
            :class="{ 'filter drop-shadow-[0_0_8px_rgba(201,163,86,0.9)]': node.i === activeNodeIndex }"
          />
        </g>

        <!-- Hạt Mẹ (Guru bead) ở đỉnh trên kèm tua rua -->
        <circle cx="160" cy="25" r="13" fill="#C9A356" stroke="#8B2E2E" stroke-width="2" />
        <line x1="160" y1="38" x2="160" y2="58" stroke="#8B2E2E" stroke-width="4" stroke-linecap="round" />
        <path d="M156 58 Q160 74 160 82 Q160 74 164 58 Z" fill="#8B2E2E" />
      </svg>

      <!-- Tâm giữa: Nút bấm lớn lần hạt -->
      <button
        @click="handleChant"
        class="group relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 border-dong/50 bg-gradient-to-b from-[#FAF6EE] to-[#EFE2C6] p-4 text-center shadow-xl transition-all duration-150 active:scale-95 hover:border-do hover:shadow-2xl"
        :class="{ 'scale-95 ring-4 ring-dong/40': isPressing }"
      >
        <span class="text-xs uppercase tracking-widest text-dong/90 font-medium">Lần hạt</span>
        <span class="my-1 font-serif text-3xl font-semibold text-do group-hover:scale-105 transition-transform">
          {{ currentBead }}
        </span>
        <span class="text-[11px] text-go/70 font-serif line-clamp-2 max-w-[140px] leading-tight">
          {{ selectedMantra.name }}
        </span>
        <span class="mt-2 text-[10px] text-go/40">Chạm hoặc ấn Space</span>
      </button>

      <!-- Vầng sáng chúc mừng hoàn thành 108 biến -->
      <transition
        enter-active-class="transition duration-700 ease-out"
        enter-from-class="opacity-0 scale-75"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-500 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-110"
      >
        <div
          v-if="showCompletionGlow"
          class="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-do/90 p-6 text-center text-kem backdrop-blur-sm"
        >
          <span class="text-4xl animate-bounce">🪷</span>
          <h4 class="mt-2 font-serif text-2xl font-bold text-dong">Viên Mãn 108 Biến</h4>
          <p class="mt-1 text-xs text-kem/90 leading-relaxed max-w-[220px]">
            Công đức viên tròn, tâm hoa nở rộ. Nguyện muôn loài an lạc, thân tâm tự tại.
          </p>
        </div>
      </transition>
    </div>

    <!-- Thanh tiến trình & Thông số chuỗi -->
    <div class="mt-4 rounded-xl bg-dong/10 p-3.5 border border-dong/20">
      <div class="flex items-center justify-between text-xs text-go/80 mb-1.5 font-serif">
        <span>Tiến trình tràng hạt: <b class="text-do">{{ currentBead }} / 108</b></span>
        <span>Đã hoàn thành: <b class="text-do font-bold">{{ completedMalas }} chuỗi</b></span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-dong/20">
        <div
          class="h-full bg-gradient-to-r from-dong to-do transition-all duration-300 rounded-full"
          :style="{ width: `${(currentBead / 108) * 100}%` }"
        />
      </div>
    </div>

    <!-- Thanh điều khiển: Âm thanh, Rung, Tự động niệm, Reset -->
    <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-go/80">
      <div class="flex items-center gap-3">
        <!-- Bật/tắt mõ -->
        <button
          @click="soundEnabled = !soundEnabled"
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border transition-colors"
          :class="soundEnabled ? 'border-dong bg-dong/15 text-go' : 'border-go/20 text-go/40'"
          title="Tiếng mõ gõ"
        >
          <span>{{ soundEnabled ? '🔔 Tiếng mõ: Bật' : '🔕 Tiếng mõ: Tắt' }}</span>
        </button>

        <!-- Rung -->
        <button
          @click="vibrateEnabled = !vibrateEnabled"
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border transition-colors"
          :class="vibrateEnabled ? 'border-dong bg-dong/15 text-go' : 'border-go/20 text-go/40'"
          title="Rung xúc giác trên điện thoại"
        >
          <span>{{ vibrateEnabled ? '📳 Rung: Bật' : '📴 Rung: Tắt' }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <!-- Tự động niệm -->
        <button
          @click="toggleAuto"
          class="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition-all"
          :class="autoChant ? 'bg-do text-kem shadow-sm' : 'border border-dong/40 hover:bg-dong/15 text-go'"
        >
          <span>{{ autoChant ? '⏸ Dừng tự động' : '▶ Tự động niệm' }}</span>
        </button>

        <!-- Nút Reset -->
        <button
          @click="reset"
          class="rounded-lg border border-go/20 px-2.5 py-1.5 hover:bg-go/10 text-go/70 transition-colors"
          title="Đếm lại từ đầu"
        >
          🔄 Đặt lại
        </button>
      </div>
    </div>

    <!-- Tùy chỉnh tốc độ tự động nếu bật -->
    <div v-if="autoChant" class="mt-3 flex items-center justify-between gap-3 text-xs text-go/70 pt-2 border-t border-dong/15">
      <span>Tốc độ niệm: {{ (autoSpeedMs / 1000).toFixed(1) }}s/câu</span>
      <input
        type="range"
        min="1000"
        max="3500"
        step="200"
        v-model.number="autoSpeedMs"
        class="w-36 accent-do cursor-pointer"
      />
    </div>
  </div>
</template>


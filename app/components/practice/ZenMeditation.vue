<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMeditation, type AmbientSoundType } from '~/composables/useMeditation'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  status,
  selectedDuration,
  remainingSeconds,
  ambientSound,
  soundVolume,
  breathPhase,
  breathPrompt,
  startMeditation,
  pauseMeditation,
  resumeMeditation,
  stopMeditation
} = useMeditation()

const isFullscreenZen = ref(false)

const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const durationOptions = [3, 5, 10, 15, 20, 30]

const ambientOptions: Array<{ id: AmbientSoundType; label: string; icon: string }> = [
  { id: 'stream', label: 'Suối mát', icon: '🌊' },
  { id: 'rain', label: 'Mưa thiền', icon: '🌧️' },
  { id: 'temple_bell', label: 'Chuông xa', icon: '🔔' },
  { id: 'silence', label: 'Tĩnh lặng', icon: '🕯️' }
]

function toggleFullscreen() {
  isFullscreenZen.value = !isFullscreenZen.value
}
</script>

<template>
  <div
    class="card-zen relative overflow-hidden transition-all duration-700 p-6 sm:p-10 border border-dong/30 shadow-2xl"
    :class="
      isFullscreenZen
        ? 'fixed inset-0 z-50 rounded-none bg-[#14110E] text-kem flex flex-col justify-between'
        : 'bg-kem/95 text-go'
    "
  >
    <!-- Thanh công cụ trên cùng -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl glow-icon">🧘</span>
        <span class="font-serif text-lg text-do" :class="{ '!text-dong': isFullscreenZen }">
          Thiền Định Tĩnh Lặng
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Chế độ toàn màn hình tập trung -->
        <button
          @click="toggleFullscreen"
          class="rounded-full px-3 py-1.5 text-xs font-serif transition-colors border"
          :class="
            isFullscreenZen
              ? 'border-dong/40 bg-dong/15 text-dong hover:bg-dong/25'
              : 'border-dong/30 bg-dong/10 text-go hover:bg-dong/20'
          "
          title="Chế độ thiền toàn màn hình"
        >
          {{ isFullscreenZen ? 'Thu nhỏ' : 'Toàn cảnh Zen' }}
        </button>

        <!-- Nút Đóng -->
        <button
          v-if="$attrs.onClose || isFullscreenZen"
          @click="isFullscreenZen ? (isFullscreenZen = false) : emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-dong/10 text-go hover:bg-dong/20 transition-colors"
          :class="{ '!text-kem !bg-white/10': isFullscreenZen }"
          title="Thoát"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Khu vực trung tâm: Vòng tròn hơi thở & Đồng hồ đếm ngược -->
    <div class="my-auto flex flex-col items-center justify-center py-6 select-none">
      <!-- Vòng tròn hơi thở thiền (Breathing Guide Circle) -->
      <div class="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
        <!-- Vầng sáng hào quang ngoài -->
        <div
          class="absolute rounded-full border border-dong/30 bg-dong/10 blur-xl transition-all duration-[3000ms] ease-in-out"
          :class="{
            'scale-125 opacity-70': breathPhase === 'inhale' || breathPhase === 'hold',
            'scale-90 opacity-30': breathPhase === 'exhale' || breathPhase === 'rest',
            'scale-100 opacity-40': status === 'idle'
          }"
          :style="{ width: '85%', height: '85%' }"
        />

        <!-- Vòng gợn sóng thứ hai -->
        <div
          class="absolute rounded-full border-2 border-dong/40 transition-all duration-[3000ms] ease-in-out"
          :class="{
            'scale-115 opacity-60': breathPhase === 'inhale',
            'scale-115 opacity-80': breathPhase === 'hold',
            'scale-95 opacity-30': breathPhase === 'exhale',
            'scale-95 opacity-20': breathPhase === 'rest',
            'scale-100 opacity-40': status === 'idle'
          }"
          :style="{ width: '70%', height: '70%' }"
        />

        <!-- Tâm tròn trung tâm chứa đồng hồ -->
        <div
          class="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border-2 border-dong/60 shadow-xl transition-all duration-[3000ms] ease-in-out sm:h-56 sm:w-56"
          :class="
            isFullscreenZen
              ? 'bg-[#1D1915] border-dong/70'
              : 'bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0]'
          "
        >
          <span
            class="font-serif text-4xl sm:text-5xl font-semibold tracking-wider text-do"
            :class="{ '!text-dong': isFullscreenZen }"
          >
            {{ formattedTime }}
          </span>
          <span class="mt-1 text-xs tracking-widest text-go/60 uppercase" :class="{ '!text-kem/60': isFullscreenZen }">
            {{ status === 'running' ? 'Đang tịnh tâm' : status === 'paused' ? 'Tạm dừng' : 'Thời gian thiền' }}
          </span>
        </div>
      </div>

      <!-- Lời nhắc nhở nhịp thở nhẹ nhàng -->
      <div class="mt-4 h-12 text-center max-w-md px-4">
        <transition mode="out-in" enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
          <p
            v-if="status === 'running'"
            :key="breathPhase"
            class="font-serif text-sm italic sm:text-base text-do/90"
            :class="{ '!text-dong': isFullscreenZen }"
          >
            {{ breathPrompt }}
          </p>
          <p v-else-if="status === 'idle'" class="text-xs text-go/60 sm:text-sm font-serif" :class="{ '!text-kem/60': isFullscreenZen }">
            Hãy ngồi thẳng lưng, thả lỏng hai vai và chọn thời gian để bắt đầu.
          </p>
          <p v-else-if="status === 'paused'" class="text-xs text-go/70 sm:text-sm font-serif" :class="{ '!text-kem/70': isFullscreenZen }">
            Tâm đang tạm dừng. Khi đã sẵn sàng, hãy chạm tiếp tục để trở lại hơi thở.
          </p>
        </transition>
      </div>

      <!-- Nút thao tác chính (Bắt đầu / Tạm dừng / Tiếp tục / Hủy) -->
      <div class="mt-4 flex items-center justify-center gap-3">
        <button
          v-if="status === 'idle'"
          @click="startMeditation"
          class="btn-zen px-8 py-3 text-base font-serif shadow-glow flex items-center gap-2"
        >
          <span>🪷</span> Bắt đầu toạ thiền
        </button>

        <template v-if="status === 'running'">
          <button
            @click="pauseMeditation"
            class="rounded-full border border-dong/50 px-6 py-2.5 font-serif text-sm text-go hover:bg-dong/20 transition-colors"
            :class="{ '!text-kem !border-dong': isFullscreenZen }"
          >
            ⏸ Tạm dừng
          </button>
          <button
            @click="stopMeditation"
            class="rounded-full border border-do/30 px-5 py-2.5 font-serif text-sm text-do/80 hover:bg-do/10 transition-colors"
            :class="{ '!text-red-400': isFullscreenZen }"
          >
            ⏹ Kết thúc sớm
          </button>
        </template>

        <template v-if="status === 'paused'">
          <button
            @click="resumeMeditation"
            class="btn-zen px-7 py-2.5 text-sm font-serif"
          >
            ▶ Tiếp tục
          </button>
          <button
            @click="stopMeditation"
            class="rounded-full border border-go/20 px-5 py-2.5 font-serif text-sm text-go/60 hover:bg-go/10 transition-colors"
            :class="{ '!text-kem/60': isFullscreenZen }"
          >
            Làm lại
          </button>
        </template>
      </div>
    </div>

    <!-- Tùy chỉnh (Thời gian, Âm thanh môi trường) - Ẩn khi đang chạy để không phân tâm -->
    <div
      v-if="status === 'idle'"
      class="mt-4 border-t pt-5 transition-colors border-dong/20"
      :class="{ '!border-white/10': isFullscreenZen }"
    >
      <!-- Chọn thời gian thiền -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span class="text-xs text-go/70 font-serif mr-2" :class="{ '!text-kem/70': isFullscreenZen }">
          Thời lượng:
        </span>
        <button
          v-for="d in durationOptions"
          :key="d"
          @click="selectedDuration = d; remainingSeconds = d * 60"
          class="h-9 min-w-[42px] px-2.5 rounded-full border text-xs font-serif transition-all"
          :class="
            selectedDuration === d
              ? 'border-do bg-do text-kem shadow-sm font-semibold'
              : 'border-dong/30 bg-dong/10 text-go/80 hover:bg-dong/20'
          "
        >
          {{ d }}p
        </button>
      </div>

      <!-- Chọn âm thanh môi trường -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="text-xs text-go/70 font-serif mr-2" :class="{ '!text-kem/70': isFullscreenZen }">
          Âm hưởng:
        </span>
        <button
          v-for="a in ambientOptions"
          :key="a.id"
          @click="ambientSound = a.id"
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-serif border transition-all"
          :class="[
            ambientSound === a.id
              ? 'border-dong bg-dong/25 text-go font-medium shadow-sm'
              : 'border-dong/20 text-go/60 hover:bg-dong/10',
            { '!text-kem': isFullscreenZen && ambientSound === a.id }
          ]"
        >
          <span>{{ a.icon }}</span>
          <span>{{ a.label }}</span>
        </button>
      </div>
    </div>

    <!-- Màn hình chúc mừng khi hoàn tất phiên thiền -->
    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="status === 'completed'"
        class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-kem/95 p-6 text-center backdrop-blur-md"
        :class="{ '!bg-[#161311] !text-kem': isFullscreenZen }"
      >
        <span class="text-5xl animate-bounce">🪷</span>
        <h3 class="mt-3 font-serif text-3xl font-bold text-do" :class="{ '!text-dong': isFullscreenZen }">
          Viên Mãn Thời Thiền
        </h3>
        <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-go/80" :class="{ '!text-kem/80': isFullscreenZen }">
          Bạn vừa hoàn thành {{ Math.round(selectedDuration) }} phút thiền định nuôi dưỡng thân tâm.
          Số phút đã được tự động lưu vào Nhật ký tu tập của bạn.
        </p>
        <button
          @click="status = 'idle'; remainingSeconds = selectedDuration * 60"
          class="btn-zen mt-6 px-6 py-2.5 text-sm font-serif"
        >
          An trú tiếp tục
        </button>
      </div>
    </transition>
  </div>
</template>

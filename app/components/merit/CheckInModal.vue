<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useMeritSystem,
  getWeekStreakDays,
  getTodayBlessing
} from '~/composables/useMeritSystem'
import { useSound } from '~/composables/useSound'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  profile,
  canCheckInToday,
  performCheckIn,
  closeCheckInModal
} = useMeritSystem()

const { playBell } = useSound()

const blessing = getTodayBlessing()
const weekDays = computed(() => getWeekStreakDays(profile.streakDays, canCheckInToday()))

const isCheckingIn = ref(false)
const justCheckedIn = ref(false)
const earnedResult = ref<{ earned: number; bonus: number; streak: number } | null>(null)

// Tính số điểm sẽ nhận được nếu điểm danh hôm nay
const nextEarnablePoints = computed(() => {
  const nextStreak = canCheckInToday() ? profile.streakDays + 1 : profile.streakDays
  let bonus = 0
  if (nextStreak === 3) bonus = 10
  else if (nextStreak === 7) bonus = 30
  else if (nextStreak === 14) bonus = 60
  else if (nextStreak === 30 || (nextStreak > 30 && nextStreak % 30 === 0)) bonus = 150
  else if (nextStreak > 7 && nextStreak % 7 === 0) bonus = 30
  return { base: 20, bonus, total: 20 + bonus, streak: nextStreak }
})

function handleCheckIn() {
  if (!canCheckInToday() || isCheckingIn.value) return
  isCheckingIn.value = true
  playBell()

  const res = performCheckIn()
  if (res.success) {
    justCheckedIn.value = true
    earnedResult.value = {
      earned: res.earned,
      bonus: res.bonus,
      streak: res.streak
    }
  }
  isCheckingIn.value = false
}

function handleClose() {
  closeCheckInModal()
  emit('close')
}
</script>

<template>
  <div class="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#291a11] via-[#1c1109] to-[#120a06] border-2 border-[#e6b95c]/60 p-6 sm:p-8 text-[#f7eedc] shadow-[0_24px_80px_rgba(230,185,92,0.35)] max-h-[92vh] flex flex-col">
    <!-- Hào quang nền hoa sen -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-[#ffd54f]/15 via-[#ff9800]/10 to-transparent blur-3xl pointer-events-none" />

    <!-- Header Modal -->
    <div class="relative z-10 flex items-center justify-between pb-4 border-b border-[#e6b95c]/25 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffd54f] to-[#b4863f] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,213,79,0.5)] text-[#2a1708]">
          📅
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300]">
              Sổ Điểm Danh Tinh Tấn
            </h2>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
              🔥 Chuỗi {{ profile.streakDays }} ngày
            </span>
          </div>
          <p class="text-xs text-[#d2beab]">
            Mỗi ngày viếng chùa · Vun bồi thiện căn · Tích lũy công đức
          </p>
        </div>
      </div>

      <button
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#ebd7be] flex items-center justify-center transition-colors"
        title="Đóng"
        @click="handleClose"
      >
        ✕
      </button>
    </div>

    <!-- Nội dung cuộn được -->
    <div class="relative z-10 overflow-y-auto pr-1 py-4 space-y-5 flex-1 text-xs sm:text-sm">
      <!-- 1. CÂU KINH PHẬT KHAI TÂM ĐẦU NGÀY -->
      <div class="p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/30 relative overflow-hidden">
        <div class="absolute -right-4 -bottom-4 text-7xl opacity-5 pointer-events-none font-serif text-[#ffd54f]">
          🪷
        </div>
        <div class="flex items-start gap-3">
          <span class="text-xl text-[#ffd54f] shrink-0 mt-0.5">❝</span>
          <div class="flex-1">
            <p class="font-serif text-sm sm:text-base text-[#fef5e7] italic leading-relaxed">
              {{ blessing.quote }}
            </p>
            <div class="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-white/10 pt-2 text-[11px]">
              <span class="text-amber-300/90 font-medium">— {{ blessing.author }}</span>
              <span class="text-[#c7b5a2] italic">{{ blessing.meaning }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. LỊCH CHU KỲ 7 NGÀY TINH TẤN (Lotus Blossom Grid) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-serif font-bold text-sm text-[#ffe082] flex items-center gap-1.5">
            <span>🪷</span>
            <span>Hành Trình Tinh Tấn 7 Ngày</span>
          </h3>
          <span class="text-[11px] text-[#c7b5a2]">
            Hoàn thành tuần lễ nhận thêm <b class="text-amber-300">+30 công đức</b>
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-7 gap-2">
          <div
            v-for="d in weekDays"
            :key="d.dayIndex"
            class="relative rounded-2xl p-3 border flex flex-col items-center justify-between text-center transition-all duration-300"
            :class="[
              d.status === 'completed'
                ? 'bg-gradient-to-b from-[#ffd54f]/15 to-[#b4863f]/10 border-[#ffd54f]/50 text-[#fef5e7] shadow-sm'
                : d.status === 'today'
                ? 'bg-gradient-to-b from-amber-500/25 to-yellow-600/15 border-amber-400 text-white shadow-[0_0_15px_rgba(255,213,79,0.35)] ring-2 ring-amber-400/30'
                : 'bg-black/30 border-white/10 text-white/50 opacity-70',
              d.dayIndex === 7 ? 'sm:col-span-1 border-yellow-500/40' : ''
            ]"
          >
            <!-- Tag thưởng đặc biệt -->
            <div
              v-if="d.bonus > 0"
              class="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs border border-amber-300/40"
            >
              +{{ d.bonus }}đ
            </div>

            <span class="text-[11px] font-medium text-[#c7b5a2] mt-1">
              {{ d.label }}
            </span>

            <!-- Biểu tượng hoa sen trạng thái -->
            <div class="my-2 text-2xl transition-transform" :class="{ 'scale-110 animate-bounce': d.status === 'today' }">
              <span v-if="d.status === 'completed'">🪷</span>
              <span v-else-if="d.status === 'today'">✨</span>
              <span v-else class="grayscale opacity-50">🪷</span>
            </div>

            <!-- Số điểm nhận được -->
            <span
              class="font-serif font-bold text-xs"
              :class="d.status === 'completed' ? 'text-green-300' : d.status === 'today' ? 'text-amber-300 font-extrabold' : 'text-amber-200/60'"
            >
              +{{ d.points }}đ
            </span>

            <!-- Trạng thái -->
            <span
              class="text-[9px] mt-1 font-sans px-1.5 py-0.5 rounded-full"
              :class="
                d.status === 'completed'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : d.status === 'today'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 font-bold'
                  : 'bg-white/5 text-white/40'
              "
            >
              {{ d.status === 'completed' ? '✓ Đã nhận' : d.status === 'today' ? 'Hôm nay' : 'Sắp tới' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3. CÁC CỘT MỐC CHUỖI TINH TẤN (Streak Milestones) -->
      <div class="p-4 rounded-2xl bg-black/35 border border-[#e6b95c]/25">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-serif font-bold text-sm text-[#ffe082] flex items-center gap-1.5">
            <span>🔥</span>
            <span>Các Cột Mốc Thưởng Chuỗi Ngày</span>
          </h3>
          <span class="text-xs text-orange-300 font-medium">
            Hiện tại: {{ profile.streakDays }} ngày
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div
            class="p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all"
            :class="profile.streakDays >= 3 ? 'bg-amber-500/15 border-amber-400 text-[#fef5e7]' : 'bg-white/5 border-white/10 text-white/40'"
          >
            <span class="text-lg">🥉</span>
            <span class="font-serif font-bold text-xs mt-0.5">Chuỗi 3 Ngày</span>
            <span class="text-amber-300 font-bold text-[11px]">+10 Công Đức</span>
            <span class="text-[9px] mt-1" :class="profile.streakDays >= 3 ? 'text-green-400' : 'text-stone-500'">
              {{ profile.streakDays >= 3 ? '✓ Đã đạt' : `${profile.streakDays}/3 ngày` }}
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all"
            :class="profile.streakDays >= 7 ? 'bg-amber-500/15 border-amber-400 text-[#fef5e7]' : 'bg-white/5 border-white/10 text-white/40'"
          >
            <span class="text-lg">🥈</span>
            <span class="font-serif font-bold text-xs mt-0.5">Chuỗi 7 Ngày</span>
            <span class="text-amber-300 font-bold text-[11px]">+30 Công Đức</span>
            <span class="text-[9px] mt-1" :class="profile.streakDays >= 7 ? 'text-green-400' : 'text-stone-500'">
              {{ profile.streakDays >= 7 ? '✓ Đã đạt' : `${profile.streakDays}/7 ngày` }}
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all"
            :class="profile.streakDays >= 14 ? 'bg-amber-500/15 border-amber-400 text-[#fef5e7]' : 'bg-white/5 border-white/10 text-white/40'"
          >
            <span class="text-lg">🥇</span>
            <span class="font-serif font-bold text-xs mt-0.5">Chuỗi 14 Ngày</span>
            <span class="text-amber-300 font-bold text-[11px]">+60 Công Đức</span>
            <span class="text-[9px] mt-1" :class="profile.streakDays >= 14 ? 'text-green-400' : 'text-stone-500'">
              {{ profile.streakDays >= 14 ? '✓ Đã đạt' : `${profile.streakDays}/14 ngày` }}
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all"
            :class="profile.streakDays >= 30 ? 'bg-purple-500/20 border-purple-400 text-[#fef5e7]' : 'bg-white/5 border-white/10 text-white/40'"
          >
            <span class="text-lg">💎</span>
            <span class="font-serif font-bold text-xs mt-0.5">Chuỗi 30 Ngày</span>
            <span class="text-purple-300 font-bold text-[11px]">+150 Công Đức</span>
            <span class="text-[9px] mt-1" :class="profile.streakDays >= 30 ? 'text-purple-300' : 'text-stone-500'">
              {{ profile.streakDays >= 30 ? '✓ Đã đạt' : `${profile.streakDays}/30 ngày` }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- KHU VỰC NÚT BẤM ĐIỂM DANH (Footer Action) -->
    <div class="relative z-10 pt-4 border-t border-[#e6b95c]/25 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
      <div class="text-xs text-[#c7b5a2] text-center sm:text-left">
        <template v-if="canCheckInToday()">
          <span class="text-[#fef5e7] font-serif font-medium">Hôm nay bạn chưa điểm danh!</span>
          <span class="block text-[11px] text-amber-300">
            Điểm danh nhận ngay <b>+{{ nextEarnablePoints.base }}đ</b>
            <template v-if="nextEarnablePoints.bonus > 0">
              (+{{ nextEarnablePoints.bonus }}đ thưởng mốc ngày {{ nextEarnablePoints.streak }})
            </template>
          </span>
        </template>
        <template v-else>
          <span class="text-green-300 font-serif font-medium">✓ Hôm nay bạn đã điểm danh tinh tấn!</span>
          <span class="block text-[11px] text-[#a89582]">Hãy tiếp tục quay lại vào ngày mai để duy trì chuỗi nhé.</span>
        </template>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button
          v-if="canCheckInToday()"
          class="w-full sm:w-auto px-7 py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-[#d9b969] via-[#ffe082] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,213,79,0.5)] flex items-center justify-center gap-2"
          :disabled="isCheckingIn"
          @click="handleCheckIn"
        >
          <span>🙏</span>
          <span>Điểm Danh Đầu Ngày (+{{ nextEarnablePoints.total }}đ)</span>
        </button>

        <button
          v-else
          class="w-full sm:w-auto px-6 py-2.5 rounded-full font-serif text-xs font-semibold bg-white/10 text-stone-300 cursor-default flex items-center justify-center gap-2"
        >
          <span>✓ Đã Điểm Danh Hôm Nay</span>
        </button>

        <button
          class="px-4 py-2.5 rounded-full font-serif text-xs bg-white/5 hover:bg-white/15 text-[#ebd7be] transition-colors"
          @click="handleClose"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>


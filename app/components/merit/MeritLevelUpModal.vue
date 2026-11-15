<script setup lang="ts">
import { useMeritSystem } from '~/composables/useMeritSystem'

const { levelUpModal, closeLevelUpModal } = useMeritSystem()

const haloDetails: Record<number, { title: string; desc: string; icon: string }> = {
  2: {
    title: 'Hào Quang Ánh Bạc Thanh Tịnh (Silver Halo)',
    desc: 'Vòng sáng bạc ấm áp lơ lửng phía sau gáy nhân vật, nhịp thở phát quang êm dịu soi đường tu tập.',
    icon: '✨'
  },
  3: {
    title: 'Hào Quang Kim Sắc & Bụi Sáng (Golden Radiance)',
    desc: 'Vòng hào quang vàng kim rực rỡ 2 tầng, bao quanh là 8 hạt bụi sáng nhiệm màu bay lượn an lạc.',
    icon: '🌟'
  },
  4: {
    title: 'Luân Xa Đài Sen Quang Minh 12 Cánh (Lotus Lightwheel)',
    desc: 'Đài sen 12 cánh xoay chậm 3D sau đầu, kèm vầng hào quang soi rạng mặt đất dưới chân mỗi bước đi.',
    icon: '🪷'
  },
  5: {
    title: 'Hào Quang Thất Sắc Quang Minh (Celestial Rainbow Aura)',
    desc: 'Quầng hào quang ngũ sắc thất sắc nhiệm màu bao bọc thân tâm; mỗi bước chân di chuyển nở ra một đóa sen sáng huyền ảo.',
    icon: '🌌'
  }
}
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-400"
    enter-from-class="opacity-0 scale-90"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-250"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="levelUpModal?.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      @click.self="closeLevelUpModal"
    >
      <div class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-[#291a11] via-[#1a110a] to-[#120a06] border-2 border-[#e6b95c]/60 p-6 sm:p-8 text-center text-[#f7eedc] shadow-[0_20px_70px_rgba(230,185,92,0.45)]">
        <!-- Vòng hào quang phát sáng nền -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-[#ffd54f]/20 via-[#ff9800]/10 to-transparent blur-3xl pointer-events-none" />

        <!-- Tiêu đề mạ vàng -->
        <div class="relative z-10 mb-3">
          <p class="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#e6b95c] font-sans">
            ✦ CHÚC MỪNG PHẬT TỬ TINH TẤN ✦
          </p>
          <h2 class="mt-1 font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300]">
            Khai Mở Tầng Hào Quang Mới!
          </h2>
        </div>

        <!-- Biểu tượng cấp bậc lớn với hiệu ứng xoay & lấp lánh -->
        <div class="relative my-6 flex items-center justify-center">
          <!-- Vòng tròn hào quang xoay chậm -->
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-[#ffd54f]/50 flex items-center justify-center animate-[spin_18s_linear_infinite]">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#ffd54f]/30" />
          </div>

          <!-- Huy hiệu trung tâm -->
          <div class="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#ffd54f] to-[#b4863f] flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_35px_rgba(255,213,79,0.7)] text-[#2a1708]">
            {{ levelUpModal.newTier.badge }}
          </div>
        </div>

        <!-- Tên Cấp Bậc -->
        <div class="relative z-10 mb-4">
          <div class="inline-block px-4 py-1 rounded-full bg-[#ffd54f]/15 border border-[#ffd54f]/35 text-amber-300 font-serif text-sm font-medium mb-1">
            Cấp Bậc {{ levelUpModal.newTier.tier }}
          </div>
          <h3 class="font-serif text-xl sm:text-2xl font-bold text-[#fef5e7]">
            {{ levelUpModal.newTier.title }}
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-[#eedbc2]/90 leading-relaxed max-w-md mx-auto">
            {{ levelUpModal.newTier.description }}
          </p>
        </div>

        <!-- Khung giới thiệu Hào Quang 3D được mở khóa -->
        <div
          v-if="haloDetails[levelUpModal.newTier.tier]"
          class="relative z-10 my-4 p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/30 text-left flex items-start gap-3"
        >
          <span class="text-2xl shrink-0 p-1.5 rounded-xl bg-[#ffd54f]/15 border border-[#ffd54f]/30">
            {{ haloDetails[levelUpModal.newTier.tier].icon }}
          </span>
          <div>
            <h4 class="font-serif font-bold text-sm text-[#ffd54f]">
              {{ haloDetails[levelUpModal.newTier.tier].title }}
            </h4>
            <p class="mt-1 text-xs text-[#ddcbba] leading-relaxed">
              {{ haloDetails[levelUpModal.newTier.tier].desc }}
            </p>
          </div>
        </div>

        <!-- Lời nguyện chánh niệm -->
        <p class="relative z-10 text-[11px] sm:text-xs text-[#e6b95c]/70 italic my-3">
          "Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sanh, đều trọn thành Phật đạo."
        </p>

        <!-- Nút xác nhận -->
        <div class="relative z-10 mt-5">
          <button
            class="w-full sm:w-auto px-8 py-3 rounded-full font-serif font-bold text-base bg-gradient-to-r from-[#d9b969] via-[#f7d788] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(247,215,136,0.6)]"
            @click="closeLevelUpModal"
          >
            Lĩnh Hội & Tiếp Tục Tu Học 🙏
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

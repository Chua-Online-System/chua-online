<script setup lang="ts">
import { useMeritSystem } from '~/composables/useMeritSystem'

const { activeMeritToast, dismissMeritToast } = useMeritSystem()
</script>

<template>
  <transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="-translate-y-8 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transform transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="-translate-y-6 opacity-0 scale-95"
  >
    <div
      v-if="activeMeritToast"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      role="alert"
    >
      <div
        class="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md cursor-pointer select-none border transition-all duration-300"
        :class="
          activeMeritToast.capped && activeMeritToast.amount === 0
            ? 'bg-[#2a2016]/90 border-amber-500/40 text-amber-100 shadow-amber-900/30'
            : 'bg-[#22160d]/92 border-[#e6b95c]/60 text-[#fbf6ec] shadow-[0_10px_35px_rgba(230,185,92,0.35)]'
        "
        @click="dismissMeritToast"
      >
        <!-- Icon phát sáng -->
        <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd54f]/25 to-[#c9a356]/15 border border-[#ffd54f]/40 text-xl shrink-0 shadow-inner">
          <span>{{ activeMeritToast.badge || '🪷' }}</span>
          <span
            v-if="activeMeritToast.amount > 0"
            class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75"
          />
        </div>

        <!-- Nội dung thông báo -->
        <div class="flex flex-col min-w-0 pr-1">
          <div class="flex items-center gap-2">
            <span
              v-if="activeMeritToast.amount > 0"
              class="font-serif font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300]"
            >
              +{{ activeMeritToast.amount }} Công Đức
            </span>
            <span
              v-else
              class="font-serif font-semibold text-sm text-amber-300"
            >
              Giới Hạn Công Đức
            </span>
            <span
              v-if="activeMeritToast.capped && activeMeritToast.amount > 0"
              class="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30"
            >
              Chạm trần ngày
            </span>
          </div>

          <p class="text-xs text-[#eedbc2] leading-snug truncate max-w-[280px] sm:max-w-md">
            {{ activeMeritToast.description }}
          </p>
        </div>

        <!-- Nút đóng nhanh -->
        <button
          class="ml-1 text-xs text-amber-200/50 hover:text-amber-100 transition-colors p-1"
          title="Đóng thông báo"
          @click.stop="dismissMeritToast"
        >
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>


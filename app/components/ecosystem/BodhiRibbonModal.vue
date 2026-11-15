<script setup lang="ts">
import { ref } from 'vue'
import { useBodhiTree } from '~/composables/useBodhiTree'
import { useModeration } from '~/composables/useModeration'
import { useSound } from '~/composables/useSound'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'ribbon-attached', data: { wish: string; author: string; color: 'red' | 'yellow' | 'white' }): void
}>()

const { attachRibbon } = useBodhiTree()
const { sanitize, checkRateLimit } = useModeration()
const { playBell } = useSound()

const ribbonColor = ref<'red' | 'yellow' | 'white'>('red')
const wishText = ref('')
const authorName = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')

const colorOptions: { id: 'red' | 'yellow' | 'white'; name: string; meaning: string; bg: string; border: string; text: string }[] = [
  {
    id: 'red',
    name: 'Dải Lụa Đỏ Thắm',
    meaning: 'Cát Tường · Bình An · Tiêu Trừ Tai Ách',
    bg: 'bg-red-900/40',
    border: 'border-red-500/80',
    text: 'text-red-300'
  },
  {
    id: 'yellow',
    name: 'Dải Lụa Hoàng Kim',
    meaning: 'Trí Tuệ · Công Đức · Phúc Thọ Tăng Trưởng',
    bg: 'bg-amber-900/40',
    border: 'border-amber-400/80',
    text: 'text-amber-300'
  },
  {
    id: 'white',
    name: 'Dải Lụa Bạch Ngọc',
    meaning: 'Thanh Tịnh · Giải Thoát · Tâm Không Vướng Bận',
    bg: 'bg-stone-800/40',
    border: 'border-stone-300/80',
    text: 'text-stone-200'
  }
]

const wishSuggestions = [
  'Cầu cho cha mẹ trường thọ, gia đạo bình an hạnh phúc.',
  'Nguyện thân tâm an lạc, tiêu trừ chướng ngại phiền não.',
  'Cầu công việc thuận lợi, đạo nghiệp tinh tấn hanh thông.',
  'Nguyện muôn loài dứt khổ thêm vui, thế giới hòa bình an lạc.'
]

function pickSuggestion(sug: string) {
  wishText.value = sug
}

async function onSubmit() {
  errorMsg.value = ''

  const modWish = sanitize(wishText.value || 'Nguyện muôn sự an lành, vạn sự cát tường.')
  if (!modWish.isValid) {
    errorMsg.value = modWish.error || 'Nội dung lời nguyện không hợp lệ.'
    return
  }

  const rate = checkRateLimit('bodhi_ribbon', 4, 300)
  if (!rate.allowed) {
    errorMsg.value = `Xin hãy hoan hỷ chờ ${rate.remainingSeconds} giây trước khi treo dải lụa tiếp.`
    return
  }

  const cleanAuthor = sanitize(authorName.value || 'Phật tử ẩn danh').cleaned

  isSubmitting.value = true
  try {
    await attachRibbon(modWish.cleaned, cleanAuthor, ribbonColor.value)
    playBell()
    emit('ribbon-attached', {
      wish: modWish.cleaned,
      author: cleanAuthor,
      color: ribbonColor.value
    })
    emit('close')
  } catch (err: any) {
    errorMsg.value = 'Chưa thể gửi lời nguyện, xin hoan hỷ thử lại sau.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
    <div class="relative w-full max-w-lg bg-[#22170f] border border-[#c9a356]/60 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#f5efe0] overflow-hidden">
      <!-- Nút đóng -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-[#c9a356] hover:text-[#ffd580] text-xl transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-black/30"
      >
        ✕
      </button>

      <!-- Tiêu đề -->
      <div class="text-center mb-6">
        <p class="text-xs uppercase tracking-widest text-[#c9a356] font-medium">Đông Phương Phúc Lạc</p>
        <h2 class="text-2xl sm:text-3xl font-serif text-[#f3e6c4] mt-1">Treo Dải Lụa Nguyện Ước</h2>
        <p class="text-xs sm:text-sm text-[#e8d5be]/80 mt-1">
          Dưới bóng mát cội Bồ Đề linh thiêng, gửi gắm tâm nguyện chí thành lên cành lá đại thụ
        </p>
      </div>

      <!-- Form gửi nguyện ước -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- 1. Chọn màu dải lụa -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-2">
            Chọn màu sắc dải lụa nguyện ước
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              v-for="opt in colorOptions"
              :key="opt.id"
              @click="ribbonColor = opt.id"
              class="cursor-pointer border rounded-xl p-3 transition-all text-center flex flex-col items-center gap-1.5"
              :class="ribbonColor === opt.id ? `${opt.bg} ${opt.border} shadow-lg ring-1 ring-[#c9a356]` : 'bg-black/20 border-[#c9a356]/20 hover:border-[#c9a356]/50'"
            >
              <div
                class="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                :class="opt.id === 'red' ? 'bg-red-500' : opt.id === 'yellow' ? 'bg-amber-400' : 'bg-stone-200'"
              />
              <span class="text-xs font-serif font-bold text-[#f3e6c4]">{{ opt.name }}</span>
              <span class="text-[10px] text-[#e8d5be]/70 leading-tight">{{ opt.meaning }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Nhập lời nguyện -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Lời tâm nguyện khắc trên dải lụa
          </label>
          <textarea
            v-model="wishText"
            rows="3"
            placeholder="Viết lời nguyện cầu an, hồi hướng công đức cho cha mẹ, người thân hay muôn loài..."
            maxlength="200"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors resize-none"
          />
          <!-- Gợi ý lời nguyện -->
          <div class="space-y-1.5 mt-2">
            <div class="text-[11px] text-[#c9a356]/80 font-medium">Gợi ý nguyện ước:</div>
            <div class="flex flex-col gap-1">
              <button
                v-for="(sug, idx) in wishSuggestions"
                :key="idx"
                type="button"
                @click="pickSuggestion(sug)"
                class="text-[11px] text-left px-2.5 py-1 rounded-lg bg-[#c9a356]/10 hover:bg-[#c9a356]/20 text-[#f5efe0]/90 transition-colors border border-[#c9a356]/15 truncate"
              >
                📜 {{ sug }}
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Tên người nguyện -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Pháp danh / Tên người gửi lời nguyện (hoặc để trống)
          </label>
          <input
            v-model="authorName"
            type="text"
            placeholder="Phật tử ẩn danh / Tên của bạn"
            maxlength="40"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors"
          />
        </div>

        <!-- Thông báo lỗi nếu có -->
        <p v-if="errorMsg" class="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
          {{ errorMsg }}
        </p>

        <!-- Nút hành động -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-full font-semibold text-sm sm:text-base text-[#2a1a0c] bg-gradient-to-r from-[#d9b969] via-[#f5d07a] to-[#b4863f] hover:shadow-xl hover:shadow-[#c9a356]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🎗️</span>
            <span>{{ isSubmitting ? 'Đang treo dải lụa lên cành Bồ Đề…' : 'Treo Dải Lụa Lên Cây Bồ Đề 3D' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

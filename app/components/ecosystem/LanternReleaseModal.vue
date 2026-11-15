<script setup lang="ts">
import { ref } from 'vue'
import { useLanterns } from '~/composables/useLanterns'
import { useModeration } from '~/composables/useModeration'
import { useSound } from '~/composables/useSound'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'released', data: { sender: string; text: string; type: 'lotus_pink' | 'lotus_gold' | 'lotus_white'; category: string }): void
}>()

const { releaseLantern } = useLanterns()
const { sanitize, checkRateLimit } = useModeration()
const { playBell } = useSound()

const senderName = ref('')
const prayerText = ref('')
const category = ref<'peace' | 'health' | 'family' | 'rebirth'>('peace')
const lanternType = ref<'lotus_pink' | 'lotus_gold' | 'lotus_white'>('lotus_pink')
const isSubmitting = ref(false)
const errorMsg = ref('')

const lanternTypes: { id: 'lotus_pink' | 'lotus_gold' | 'lotus_white'; name: string; meaning: string; color: string; border: string; bg: string }[] = [
  {
    id: 'lotus_pink',
    name: 'Đài Sen Hồng',
    meaning: 'Từ Bi · Gia Đạo Hạnh Phúc · Vạn Sự Cát Tường',
    color: 'text-pink-300',
    border: 'border-pink-500/80',
    bg: 'bg-pink-950/40'
  },
  {
    id: 'lotus_gold',
    name: 'Đài Sen Vàng',
    meaning: 'Trí Tuệ · Công Đức Viên Mãn · Phúc Thọ Tăng Triều',
    color: 'text-amber-300',
    border: 'border-amber-400/80',
    bg: 'bg-amber-950/40'
  },
  {
    id: 'lotus_white',
    name: 'Đài Sen Trắng',
    meaning: 'Thanh Tịnh · Giải Thoát · Cầu Siêu Cửu Huyền Thất Tổ',
    color: 'text-stone-200',
    border: 'border-stone-300/80',
    bg: 'bg-stone-900/40'
  }
]

const categories: { id: 'peace' | 'health' | 'family' | 'rebirth'; label: string; icon: string }[] = [
  { id: 'peace', label: 'Bình An', icon: '🕊️' },
  { id: 'health', label: 'Sức Khỏe', icon: '🌿' },
  { id: 'family', label: 'Gia Đạo', icon: '🏡' },
  { id: 'rebirth', label: 'Cầu Siêu', icon: '🕯️' }
]

const prayerSuggestions = [
  'Nguyện quốc thái dân an, mưa thuận gió hòa, muôn nhà ấm no hạnh phúc.',
  'Cầu cho cha mẹ sống lâu trăm tuổi, thân tâm an lạc, tiêu trừ nghiệp chướng.',
  'Nguyện đem ánh sáng từ bi xua tan u tối, soi đường cho con cháu hướng thiện.',
  'Hồi hướng công đức cửu huyền thất tổ, thân bằng quyến thuộc vãng sanh Tây Phương.'
]

function pickSuggestion(sug: string) {
  prayerText.value = sug
}

async function onSubmit() {
  errorMsg.value = ''

  const modPrayer = sanitize(prayerText.value || 'Nguyện muôn loài an lạc, thân tâm tự tại.')
  if (!modPrayer.isValid) {
    errorMsg.value = modPrayer.error || 'Nội dung lời nguyện không hợp lệ.'
    return
  }

  const rate = checkRateLimit('release_lantern', 3, 300)
  if (!rate.allowed) {
    errorMsg.value = `Xin hãy hoan hỷ chờ ${rate.remainingSeconds} giây trước khi thả tiếp.`
    return
  }

  const cleanSender = sanitize(senderName.value || 'Phật tử ẩn danh').cleaned

  isSubmitting.value = true
  try {
    releaseLantern(cleanSender, modPrayer.cleaned, category.value, lanternType.value)
    playBell()
    emit('released', {
      sender: cleanSender,
      text: modPrayer.cleaned,
      type: lanternType.value,
      category: category.value
    })
    emit('close')
  } catch (err: any) {
    errorMsg.value = 'Chưa thể thả hoa đăng, xin hoan hỷ thử lại sau.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
    <div class="relative w-full max-w-lg bg-[#111c26] border border-[#c9a356]/60 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#f5efe0] overflow-hidden">
      <!-- Nút đóng -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-[#c9a356] hover:text-[#ffd580] text-xl transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-black/30"
      >
        ✕
      </button>

      <!-- Tiêu đề -->
      <div class="text-center mb-6">
        <p class="text-xs uppercase tracking-widest text-[#64b5f6] font-medium">Bắc Phương Tịnh Thủy</p>
        <h2 class="text-2xl sm:text-3xl font-serif text-[#f3e6c4] mt-1">Thả Hoa Đăng Sông Trăng</h2>
        <p class="text-xs sm:text-sm text-[#d0e2ec]/80 mt-1">
          Thắp sáng ngọn nến hoa sen lung linh, gửi lời ước nguyện xuôi theo dòng nước đêm thanh tịnh
        </p>
      </div>

      <!-- Form thả hoa đăng -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- 1. Chọn loại hoa đăng -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-2">
            Chọn kiểu dáng đài sen hoa đăng
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              v-for="lt in lanternTypes"
              :key="lt.id"
              @click="lanternType = lt.id"
              class="cursor-pointer border rounded-xl p-3 transition-all text-center flex flex-col items-center gap-1.5"
              :class="lanternType === lt.id ? `${lt.bg} ${lt.border} shadow-lg ring-1 ring-[#ffd54f]` : 'bg-black/20 border-[#c9a356]/20 hover:border-[#c9a356]/50'"
            >
              <div
                class="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                :class="lt.id === 'lotus_pink' ? 'bg-pink-500 shadow-pink-500/50' : lt.id === 'lotus_gold' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-stone-200 shadow-white/50'"
              />
              <span class="text-xs font-serif font-bold text-[#f3e6c4]">{{ lt.name }}</span>
              <span class="text-[10px] text-[#d0e2ec]/70 leading-tight">{{ lt.meaning }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Chọn chủ đề nguyện ước -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Tâm nguyện hồi hướng
          </label>
          <div class="flex items-center gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              @click="category = cat.id"
              class="flex-1 py-1.5 px-2 rounded-xl text-xs font-serif transition-all border text-center flex items-center justify-center gap-1"
              :class="category === cat.id ? 'bg-[#c9a356]/25 border-[#ffd54f] text-[#ffd54f] font-bold' : 'bg-black/20 border-white/10 text-stone-300 hover:border-white/30'"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- 3. Viết lời cầu nguyện -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Lời nguyện gửi vào ngọn nến hoa đăng
          </label>
          <textarea
            v-model="prayerText"
            rows="3"
            placeholder="Viết lời nguyện cầu bình an, giải trừ tai ách, hồi hướng phước đức..."
            maxlength="200"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors resize-none"
          />
          <!-- Gợi ý lời nguyện -->
          <div class="space-y-1.5 mt-2">
            <div class="text-[11px] text-[#c9a356]/80 font-medium">Gợi ý tâm nguyện:</div>
            <div class="flex flex-col gap-1">
              <button
                v-for="(sug, idx) in prayerSuggestions"
                :key="idx"
                type="button"
                @click="pickSuggestion(sug)"
                class="text-[11px] text-left px-2.5 py-1 rounded-lg bg-[#c9a356]/10 hover:bg-[#c9a356]/20 text-[#f5efe0]/90 transition-colors border border-[#c9a356]/15 truncate"
              >
                🕯️ {{ sug }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Tên người thả -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Pháp danh / Tên người cầu nguyện (hoặc để trống)
          </label>
          <input
            v-model="senderName"
            type="text"
            placeholder="Phật tử ẩn danh / Tên của bạn"
            maxlength="40"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors"
          />
        </div>

        <!-- Lỗi nếu có -->
        <p v-if="errorMsg" class="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
          {{ errorMsg }}
        </p>

        <!-- Nút hành động -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-full font-semibold text-sm sm:text-base text-[#111c26] bg-gradient-to-r from-[#ffd54f] via-[#fff176] to-[#ffb74d] hover:shadow-xl hover:shadow-[#ffd54f]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🪷</span>
            <span>{{ isSubmitting ? 'Đang thắp nến thả hoa đăng…' : 'Thắp Sáng & Thả Xuống Sông 3D' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { FISH_SPECIES, useFishPond } from '~/composables/useFishPond'
import { useModeration } from '~/composables/useModeration'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'released', fish: { speciesId: string; name: string; releaser: string; wish: string }): void
}>()

const { releaseFish } = useFishPond()
const { sanitize, checkRateLimit } = useModeration()

const selectedSpecies = ref(FISH_SPECIES[0].id)
const fishName = ref('')
const releaserName = ref('')
const wishNote = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')

const nameSuggestions = ['An Nhiên', 'Như Ý', 'Cát Tường', 'Tuệ Giác', 'Hỷ Lạc', 'Bình An', 'Kim Long']

function pickSuggestion(name: string) {
  fishName.value = name
}

async function onSubmit() {
  errorMsg.value = ''

  const modWish = sanitize(wishNote.value || 'Nguyện muôn loài tự tại an vui, thân tâm thanh tịnh.')
  if (!modWish.isValid) {
    errorMsg.value = modWish.error || 'Lời nguyện không hợp lệ.'
    return
  }

  const rate = checkRateLimit('release_fish', 3, 300)
  if (!rate.allowed) {
    errorMsg.value = `Xin hãy hoan hỷ chờ ${rate.remainingSeconds} giây trước khi phóng sinh tiếp.`
    return
  }

  const cleanName = sanitize(fishName.value || 'Cá An Lạc').cleaned
  const cleanReleaser = sanitize(releaserName.value || 'Phật tử ẩn danh').cleaned

  isSubmitting.value = true
  try {
    await releaseFish(selectedSpecies.value, cleanName, cleanReleaser, modWish.cleaned)
    emit('released', {
      speciesId: selectedSpecies.value,
      name: cleanName,
      releaser: cleanReleaser,
      wish: modWish.cleaned
    })
    emit('close')
  } catch (err: any) {
    errorMsg.value = 'Chưa thể phóng sinh cá, xin hoan hỷ thử lại sau.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
    <div class="relative w-full max-w-lg bg-[#241a12] border border-[#c9a356]/60 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#f5efe0] overflow-hidden">
      <!-- Nút đóng -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-[#c9a356] hover:text-[#ffd580] text-xl transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-black/30"
      >
        ✕
      </button>

      <!-- Tiêu đề -->
      <div class="text-center mb-6">
        <p class="text-xs uppercase tracking-widest text-[#c9a356] font-medium">Tây Phương Cảnh Trí</p>
        <h2 class="text-2xl sm:text-3xl font-serif text-[#f3e6c4] mt-1">Phóng Sinh Cá Cát Tường</h2>
        <p class="text-xs sm:text-sm text-[#e8d5be]/80 mt-1">
          Gieo duyên lành cứu chuộc sinh linh, hồi hướng bình an đến muôn loài
        </p>
      </div>

      <!-- Form phóng sinh -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- 1. Chọn loài cá -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-2">
            Chọn loài cá phóng sinh
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <div
              v-for="sp in FISH_SPECIES"
              :key="sp.id"
              @click="selectedSpecies = sp.id"
              class="cursor-pointer border rounded-xl p-2.5 transition-all text-left flex items-start gap-2.5"
              :class="selectedSpecies === sp.id ? 'bg-[#c9a356]/20 border-[#ffd54f] shadow-md shadow-[#c9a356]/20' : 'bg-black/20 border-[#c9a356]/30 hover:border-[#c9a356]/60'"
            >
              <!-- Màu đại diện -->
              <div
                class="w-6 h-6 rounded-full shrink-0 border border-white/20 mt-0.5"
                :style="{ background: `linear-gradient(135deg, ${sp.colors.primary}, ${sp.colors.secondary})` }"
              />
              <div class="min-w-0">
                <div class="font-medium text-xs sm:text-sm text-[#fce4a6] truncate">{{ sp.name }}</div>
                <div class="text-[11px] text-[#e8d5be]/70 truncate">{{ sp.symbolism }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Tên đặt cho chú cá -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Pháp danh / Tên cho chú cá
          </label>
          <input
            v-model="fishName"
            type="text"
            placeholder="Ví dụ: An Nhiên, Như Ý..."
            maxlength="40"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors"
          />
          <!-- Gợi ý tên hay -->
          <div class="flex items-center gap-1.5 flex-wrap mt-2">
            <span class="text-[11px] text-[#c9a356]/80">Gợi ý:</span>
            <button
              v-for="sug in nameSuggestions"
              :key="sug"
              type="button"
              @click="pickSuggestion(sug)"
              class="text-[11px] px-2 py-0.5 rounded-full bg-[#c9a356]/15 hover:bg-[#c9a356]/30 text-[#f5efe0] transition-colors"
            >
              {{ sug }}
            </button>
          </div>
        </div>

        <!-- 3. Tên người phóng sinh -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Người phóng sinh (có thể để trống)
          </label>
          <input
            v-model="releaserName"
            type="text"
            placeholder="Phật tử ẩn danh / Tên của bạn"
            maxlength="50"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors"
          />
        </div>

        <!-- 4. Lời nguyện ước -->
        <div>
          <label class="block text-xs uppercase tracking-wider text-[#c9a356] font-semibold mb-1.5">
            Lời nguyện phóng sinh & Hồi hướng công đức
          </label>
          <textarea
            v-model="wishNote"
            rows="2"
            placeholder="Nguyện cầu cha mẹ mạnh khỏe, muôn loài sống trong an lành tự tại..."
            maxlength="200"
            class="w-full bg-black/40 border border-[#c9a356]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#fff] focus:border-[#ffd54f] focus:outline-none transition-colors resize-none"
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
            class="w-full py-3 rounded-full font-semibold text-sm sm:text-base text-[#2a1a0c] bg-gradient-to-r from-[#d9b969] via-[#f5d07a] to-[#b4863f] hover:shadow-lg hover:shadow-[#c9a356]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🪷</span>
            <span>{{ isSubmitting ? 'Đang phóng sinh vào hồ…' : 'Phóng Sinh Vào Hồ 3D' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DETAILED_SUTRAS, type DetailedSutra } from '~/data/sutras'
import { useSound } from '~/composables/useSound'
import { usePracticeJournal } from '~/composables/usePracticeJournal'

const emit = defineEmits<{ (e: 'close'): void }>()

const { playWoodenFish } = useSound()
const journal = usePracticeJournal()

const selectedSutraId = ref(DETAILED_SUTRAS[0].id)
const fontSize = ref<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg')
const readingTheme = ref<'doh' | 'truc' | 'night'>('doh')
const isAutoScrolling = ref(false)
const scrollSpeed = ref(3) // 1 (rất chậm) đến 10 (nhanh)
const soundBeats = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)
let scrollInterval: any = null
let soundInterval: any = null

const activeSutra = computed<DetailedSutra>(() => {
  return DETAILED_SUTRAS.find((s) => s.id === selectedSutraId.value) || DETAILED_SUTRAS[0]
})

const fontSizeClass = computed(() => {
  switch (fontSize.value) {
    case 'sm': return 'text-sm leading-relaxed'
    case 'base': return 'text-base leading-relaxed'
    case 'lg': return 'text-lg leading-loose'
    case 'xl': return 'text-xl leading-loose'
    case '2xl': return 'text-2xl leading-loose font-normal'
  }
})

const themeClass = computed(() => {
  switch (readingTheme.value) {
    case 'doh': // Giấy Dó cổ truyền
      return 'bg-[#FAF6EE] text-[#3D2C1E] border-[#D9C8AA]'
    case 'truc': // Thanh Trúc
      return 'bg-[#F2F5EF] text-[#243322] border-[#C3D4BF]'
    case 'night': // Dạ Thiền
      return 'bg-[#181512] text-[#E8DFD3] border-[#382E25]'
  }
})

function toggleAutoScroll() {
  if (isAutoScrolling.value) {
    stopAutoScroll()
  } else {
    startAutoScroll()
  }
}

function startAutoScroll() {
  isAutoScrolling.value = true
  if (scrollInterval) clearInterval(scrollInterval)

  scrollInterval = setInterval(() => {
    if (!scrollContainer.value) return
    const el = scrollContainer.value
    // Tốc độ cuộn: 1 đến 10 tương ứng 1px mỗi 100ms / 20ms
    const step = 1
    const intervalTime = Math.max(15, 80 - scrollSpeed.value * 6)
    el.scrollTop += step

    // Nếu đã cuộn hết bài kinh -> ghi nhận hoàn thành
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      stopAutoScroll()
      journal.addSutraRead()
    }
  }, Math.max(15, 80 - scrollSpeed.value * 6))

  // Nếu bật tiếng mõ điểm nhịp
  if (soundBeats.value) {
    if (soundInterval) clearInterval(soundInterval)
    soundInterval = setInterval(() => {
      playWoodenFish()
    }, 2200)
  }
}

function stopAutoScroll() {
  isAutoScrolling.value = false
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
  if (soundInterval) {
    clearInterval(soundInterval)
    soundInterval = null
  }
}

function selectSutra(id: string) {
  stopAutoScroll()
  selectedSutraId.value = id
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
  journal.addSutraRead()
}

onBeforeUnmount(() => {
  stopAutoScroll()
})
</script>

<template>
  <div
    class="card-zen relative flex flex-col h-[650px] max-h-[85vh] overflow-hidden p-0 border transition-all duration-500 shadow-2xl rounded-2xl"
    :class="themeClass"
  >
    <!-- Thanh điều hướng trên cùng -->
    <div class="flex flex-wrap items-center justify-between border-b px-5 py-3.5 border-inherit/40 bg-inherit/90 backdrop-blur-sm z-10">
      <div class="flex items-center gap-2">
        <span class="text-xl">📖</span>
        <h3 class="font-serif text-lg font-semibold sm:text-xl text-do">
          Kinh Điển Thiền Môn
        </h3>
      </div>

      <!-- Tùy chỉnh: Cỡ chữ, Nền đọc, Đóng -->
      <div class="flex items-center gap-3 text-xs">
        <!-- Chỉnh cỡ chữ -->
        <div class="flex items-center gap-1 border rounded-lg px-2 py-1 border-inherit/40">
          <button
            @click="fontSize = 'base'"
            class="px-1.5 py-0.5 rounded font-serif"
            :class="fontSize === 'base' ? 'bg-do text-kem font-bold' : 'opacity-70 hover:opacity-100'"
            title="Chữ vừa"
          >
            A
          </button>
          <button
            @click="fontSize = 'lg'"
            class="px-1.5 py-0.5 rounded font-serif text-sm"
            :class="fontSize === 'lg' ? 'bg-do text-kem font-bold' : 'opacity-70 hover:opacity-100'"
            title="Chữ lớn"
          >
            A+
          </button>
          <button
            @click="fontSize = 'xl'"
            class="px-1.5 py-0.5 rounded font-serif text-base"
            :class="fontSize === 'xl' ? 'bg-do text-kem font-bold' : 'opacity-70 hover:opacity-100'"
            title="Chữ rất lớn"
          >
            A++
          </button>
        </div>

        <!-- Chọn màu nền -->
        <div class="flex items-center gap-1">
          <button
            @click="readingTheme = 'doh'"
            class="h-6 w-6 rounded-full border border-dong/40 bg-[#FAF6EE]"
            :class="{ 'ring-2 ring-do': readingTheme === 'doh' }"
            title="Giấy dó"
          />
          <button
            @click="readingTheme = 'truc'"
            class="h-6 w-6 rounded-full border border-dong/40 bg-[#F2F5EF]"
            :class="{ 'ring-2 ring-do': readingTheme === 'truc' }"
            title="Thanh trúc"
          />
          <button
            @click="readingTheme = 'night'"
            class="h-6 w-6 rounded-full border border-dong/40 bg-[#181512]"
            :class="{ 'ring-2 ring-dong': readingTheme === 'night' }"
            title="Dạ thiền"
          />
        </div>

        <!-- Nút đóng -->
        <button
          v-if="$attrs.onClose"
          @click="emit('close')"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-inherit/60 hover:opacity-75 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Thanh chọn bài kinh dạng thẻ cuộn ngang -->
    <div class="flex gap-2 overflow-x-auto border-b px-5 py-2.5 border-inherit/30 scrollbar-none z-10 bg-inherit/70">
      <button
        v-for="s in DETAILED_SUTRAS"
        :key="s.id"
        @click="selectSutra(s.id)"
        class="whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-serif transition-all border"
        :class="
          selectedSutraId === s.id
            ? 'border-do bg-do text-kem font-semibold shadow-sm'
            : 'border-inherit/40 opacity-75 hover:opacity-100 hover:border-do'
        "
      >
        {{ s.title }}
      </button>
    </div>

    <!-- Khung nội dung đọc kinh (Auto-scroll container) -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto px-6 py-8 sm:px-12 scroll-smooth select-text"
    >
      <div class="mx-auto max-w-2xl text-center">
        <!-- Tiêu đề bài kinh -->
        <p class="text-xs uppercase tracking-widest text-do/80 font-serif">Kinh Điển Phật Giáo</p>
        <h2 class="mt-1 font-serif text-2xl font-bold sm:text-3xl text-do">
          {{ activeSutra.title }}
        </h2>
        <p v-if="activeSutra.subtitle" class="mt-1 text-xs italic opacity-75 sm:text-sm">
          {{ activeSutra.subtitle }}
        </p>
        <p class="mx-auto mt-3 max-w-xl text-xs sm:text-sm opacity-80 border-t border-b border-inherit/30 py-2">
          {{ activeSutra.summary }}
        </p>

        <!-- Các đoạn kinh văn -->
        <div class="mt-8 space-y-8 font-serif" :class="fontSizeClass">
          <div
            v-for="(para, idx) in activeSutra.paragraphs"
            :key="idx"
            class="space-y-3"
          >
            <h4 v-if="para.heading" class="text-base font-semibold text-do tracking-wide uppercase opacity-90 pb-1">
              {{ para.heading }}
            </h4>
            <div class="space-y-2">
              <p
                v-for="(line, lIdx) in para.lines"
                :key="lIdx"
                class="tracking-normal"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </div>

        <!-- Hồi hướng cuối bài -->
        <div class="mt-12 border-t border-inherit/30 pt-6 text-center text-xs opacity-70 italic font-serif">
          🙏 Nguyện đem công đức này, hồi hướng khắp muôn loài chúng sinh trọn thành Phật đạo.
        </div>
      </div>
    </div>

    <!-- Thanh công cụ cuộn tự động ở đáy (Bottom Controls) -->
    <div class="flex items-center justify-between border-t px-5 py-3 border-inherit/40 bg-inherit/90 backdrop-blur-sm z-10 text-xs">
      <!-- Nút Bật/Dừng cuộn tự động -->
      <div class="flex items-center gap-3">
        <button
          @click="toggleAutoScroll"
          class="btn-zen flex items-center gap-1.5 px-4 py-1.5 text-xs font-serif"
        >
          <span>{{ isAutoScrolling ? '⏸ Dừng cuộn' : '▶ Tự động cuộn' }}</span>
        </button>

        <!-- Bật gõ mõ nhịp -->
        <button
          @click="soundBeats = !soundBeats"
          class="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 border-inherit/40 transition-colors"
          :class="soundBeats ? 'bg-dong/20 font-medium' : 'opacity-70 hover:opacity-100'"
          title="Tiếng mõ điểm nhịp"
        >
          <span>{{ soundBeats ? '🔔 Nhịp mõ: Bật' : '🔕 Nhịp mõ: Tắt' }}</span>
        </button>
      </div>

      <!-- Thanh chỉnh tốc độ cuộn -->
      <div v-if="isAutoScrolling" class="flex items-center gap-2">
        <span class="opacity-75">Tốc độ cuộn:</span>
        <input
          type="range"
          min="1"
          max="8"
          v-model.number="scrollSpeed"
          class="w-24 accent-do cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>


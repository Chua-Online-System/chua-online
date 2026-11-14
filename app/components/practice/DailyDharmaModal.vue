<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTodayQuote, getRandomQuote, type DharmaQuote } from '~/data/dharmaQuotes'
import { usePracticeJournal } from '~/composables/usePracticeJournal'

const emit = defineEmits<{ (e: 'close'): void }>()

const journal = usePracticeJournal()

const currentQuote = ref<DharmaQuote>(getTodayQuote())
const isDownloading = ref(false)
const downloadSuccess = ref(false)
const canvasEl = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  journal.markDharmaRead()
})

function getNewQuote() {
  currentQuote.value = getRandomQuote()
  journal.markDharmaRead()
}

function getCategoryName(cat: string) {
  switch (cat) {
    case 'peace': return 'An Lạc'
    case 'compassion': return 'Từ Bi'
    case 'letting_go': return 'Buông Xả'
    case 'karma': return 'Nhân Quả'
    case 'mindfulness': return 'Chánh Niệm'
    default: return 'Thiền Vị'
  }
}

// Tạo và tải ảnh Canvas thư pháp
function downloadCardImage() {
  if (!import.meta.client) return
  isDownloading.value = true

  const canvas = canvasEl.value || document.createElement('canvas')
  const width = 800
  const height = 1000
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. Nền giấy dó ấm
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#FAF5E8')
  bgGrad.addColorStop(0.5, '#F5EDE0')
  bgGrad.addColorStop(1, '#EFE4D2')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Khung viền chỉ vàng & đỏ trầm
  ctx.strokeStyle = '#C9A356'
  ctx.lineWidth = 4
  ctx.strokeRect(36, 36, width - 72, height - 72)

  ctx.strokeStyle = '#8B2E2E'
  ctx.lineWidth = 1.5
  ctx.strokeRect(46, 46, width - 92, height - 92)

  // 4 góc trang trí hoa văn
  const corners = [
    [54, 54],
    [width - 54, 54],
    [54, height - 54],
    [width - 54, height - 54]
  ]
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#C9A356'
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  // 3. Biểu tượng hoa sen đỉnh
  ctx.font = '52px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🪷', width / 2, 130)

  // Tiêu đề
  ctx.font = 'italic 20px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#8B2E2E'
  ctx.fillText(`PHÁP THOẠI NGÀY NAY · ${getCategoryName(currentQuote.value.category).toUpperCase()}`, width / 2, 180)

  // Đường kẻ vàng nhẹ
  ctx.strokeStyle = 'rgba(201, 163, 86, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(width / 2 - 120, 205)
  ctx.lineTo(width / 2 + 120, 205)
  ctx.stroke()

  // 4. Lời Pháp thoại (Wrap text tự động)
  ctx.font = '500 28px "Noto Serif", "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = '#3A281A'
  const maxWidth = width - 180
  const lineHeight = 48
  const words = currentQuote.value.quote.split(' ')
  let line = ''
  const lines: string[] = []

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)

  // Căn giữa văn bản theo chiều dọc
  const totalTextH = lines.length * lineHeight
  let startY = 380 + (280 - totalTextH) / 2

  lines.forEach((l) => {
    ctx.fillText(l.trim(), width / 2, startY)
    startY += lineHeight
  })

  // 5. Nguồn trích & Tác giả
  ctx.font = 'italic 20px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#8B2E2E'
  ctx.fillText(`— ${currentQuote.value.source} —`, width / 2, startY + 50)

  if (currentQuote.value.author) {
    ctx.font = '16px "Noto Serif", Georgia, serif'
    ctx.fillStyle = '#6E5540'
    ctx.fillText(currentQuote.value.author, width / 2, startY + 84)
  }

  // 6. Con dấu triện đỏ tròn "Đi Chùa Online · Thiện Tâm"
  const stampX = width / 2
  const stampY = height - 120
  ctx.strokeStyle = 'rgba(139, 46, 46, 0.85)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(stampX - 70, stampY - 30, 140, 50)
  ctx.font = 'bold 15px "Noto Serif", Georgia, serif'
  ctx.fillStyle = 'rgba(139, 46, 46, 0.9)'
  ctx.fillText('ĐI CHÙA ONLINE', stampX, stampY - 4)
  ctx.font = '12px "Noto Serif", Georgia, serif'
  ctx.fillText('Tâm An Vạn Sự An', stampX, stampY + 14)

  // Xuất file và tải về
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `phap-thoai-${Date.now()}.png`
  link.href = dataUrl
  link.click()

  isDownloading.value = false
  downloadSuccess.value = true
  setTimeout(() => (downloadSuccess.value = false), 3500)
}
</script>

<template>
  <div class="card-zen relative overflow-hidden p-6 sm:p-10 border border-dong/30 shadow-2xl bg-[#FAF6EE] text-[#3D2C1E]">
    <!-- Nút đóng -->
    <button
      v-if="$attrs.onClose"
      @click="emit('close')"
      class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-dong/10 hover:bg-dong/25 transition-colors text-go"
      title="Đóng"
    >
      ✕
    </button>

    <!-- Biểu tượng hoa sen & tiêu đề -->
    <div class="text-center select-none">
      <span class="text-4xl glow-icon inline-block">🪷</span>
      <p class="mt-2 text-xs uppercase tracking-widest text-do font-serif font-semibold">
        Mỗi Ngày Một Câu Pháp Thoại
      </p>
      <span class="mt-1 inline-block rounded-full bg-dong/20 px-3 py-0.5 text-[11px] font-serif text-go/80">
        Chủ đề: {{ getCategoryName(currentQuote.category) }}
      </span>
    </div>

    <!-- Khung chính: Câu danh ngôn dạng thiền thư pháp -->
    <div class="relative mx-auto my-8 max-w-xl rounded-2xl border-2 border-dong/40 bg-gradient-to-b from-[#FFFDF8] to-[#F5ECE0] p-8 text-center shadow-md">
      <!-- Dấu ngoặc kép mờ trang trí -->
      <span class="absolute left-4 top-2 font-serif text-6xl text-dong/25 select-none leading-none">“</span>
      <span class="absolute right-4 bottom-2 font-serif text-6xl text-dong/25 select-none leading-none">”</span>

      <!-- Nội dung câu nói -->
      <p class="relative z-10 font-serif text-xl sm:text-2xl leading-relaxed text-[#2C1D11] italic font-normal">
        {{ currentQuote.quote }}
      </p>

      <!-- Nguồn trích & Tác giả -->
      <div class="mt-6 border-t border-dong/30 pt-4">
        <p class="font-serif text-sm font-semibold text-do">
          {{ currentQuote.source }}
        </p>
        <p v-if="currentQuote.author" class="mt-0.5 text-xs text-go/70 font-serif">
          {{ currentQuote.author }}
        </p>
      </div>
    </div>

    <!-- Thanh công cụ hành động -->
    <div class="flex flex-wrap items-center justify-center gap-3 select-none">
      <!-- Nút đổi câu khác (Tùy duyên thỉnh pháp) -->
      <button
        @click="getNewQuote"
        class="flex items-center gap-1.5 rounded-full border border-dong/50 px-4 py-2 font-serif text-xs sm:text-sm text-go hover:bg-dong/15 transition-all"
      >
        <span>🎲</span> Tùy duyên thỉnh pháp
      </button>

      <!-- Nút lưu ảnh Canvas -->
      <button
        @click="downloadCardImage"
        :disabled="isDownloading"
        class="btn-zen flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-serif"
      >
        <span>🖼️</span> {{ isDownloading ? 'Đang tạo ảnh...' : 'Lưu ảnh thiền vị' }}
      </button>
    </div>

    <!-- Thông báo tải thành công -->
    <p v-if="downloadSuccess" class="mt-3 text-center text-xs text-do font-serif animate-fade-up">
      ✓ Đã lưu ảnh thiền vị về máy của bạn thành công!
    </p>

    <!-- Canvas ẩn dùng để vẽ ảnh xuất file -->
    <canvas ref="canvasEl" class="hidden" />
  </div>
</template>


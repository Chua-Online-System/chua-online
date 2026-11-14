<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLotusBlessing } from '~/composables/useLotusBlessing'
import { useModeration } from '~/composables/useModeration'
import { useSound } from '~/composables/useSound'
import type { LotusType, LotusBlessingItem } from '~/types/lotus'

const emit = defineEmits<{ (e: 'close'): void }>()

const { blessings, init, sendBlessing, getLotusTypeInfo } = useLotusBlessing()
const { sanitize, checkRateLimit } = useModeration()
const { playBell, playChime } = useSound()

const activeTab = ref<'send' | 'garden'>('send')

// Form trao tặng
const selectedType = ref<LotusType>('pink')
const senderName = ref('')
const recipientName = ref('')
const wishText = ref('')
const formError = ref('')
const justSentItem = ref<LotusBlessingItem | null>(null)
const selectedItem = ref<LotusBlessingItem | null>(null)
const isDownloading = ref(false)
const canvasEl = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  init()
})

function handleSubmit() {
  formError.value = ''

  if (!wishText.value.trim()) {
    formError.value = 'Xin hãy nhập lời chúc lành hoặc tâm nguyện hồi hướng.'
    return
  }

  const modWish = sanitize(wishText.value)
  if (!modWish.isValid) {
    formError.value = modWish.error || 'Nội dung chứa từ ngữ không phù hợp.'
    return
  }

  const rate = checkRateLimit('send_lotus', 3, 180)
  if (!rate.allowed) {
    formError.value = `Xin hãy hoan hỷ đợi ${rate.remainingSeconds} giây trước khi gửi tiếp đóa sen.`
    return
  }

  const cleanSender = sanitize(senderName.value || 'Người gửi ẩn danh').cleaned
  const cleanRecipient = sanitize(recipientName.value || 'Người thân yêu').cleaned

  const newItem = sendBlessing(cleanSender, cleanRecipient, modWish.cleaned, selectedType.value)
  justSentItem.value = newItem
  playChime()

  wishText.value = ''
  senderName.value = ''
  recipientName.value = ''
}

// Tải thiệp sen thư pháp qua Canvas
function downloadLotusCard(item: LotusBlessingItem) {
  if (!import.meta.client) return
  isDownloading.value = true

  const canvas = canvasEl.value || document.createElement('canvas')
  const width = 800
  const height = 960
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Nền giấy dó ấm
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#FAF6EE')
  bgGrad.addColorStop(0.5, '#F5EDE0')
  bgGrad.addColorStop(1, '#EFE4D2')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Khung viền chỉ vàng & đỏ
  ctx.strokeStyle = '#C9A356'
  ctx.lineWidth = 3.5
  ctx.strokeRect(36, 36, width - 72, height - 72)
  ctx.strokeStyle = '#8B2E2E'
  ctx.lineWidth = 1.2
  ctx.strokeRect(46, 46, width - 92, height - 92)

  // Đóa sen biểu tượng
  ctx.font = '54px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🪷', width / 2, 130)

  // Tiêu đề
  const info = getLotusTypeInfo(item.lotusType)
  ctx.font = 'italic bold 22px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#8B2E2E'
  ctx.fillText(`THIỆP PHƯỚC LÀNH · ${info.name.toUpperCase()}`, width / 2, 185)

  // Kính gửi
  ctx.font = '600 24px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#4A3728'
  ctx.fillText(`Kính gửi: ${item.recipient}`, width / 2, 240)

  // Đường hoa văn phân cách
  ctx.strokeStyle = 'rgba(201, 163, 86, 0.45)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(width / 2 - 140, 265)
  ctx.lineTo(width / 2 + 140, 265)
  ctx.stroke()

  // Lời chúc an lành (Wrap text)
  ctx.font = 'italic 500 26px "Noto Serif", "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = '#2A1A0C'
  const maxWidth = width - 180
  const lineHeight = 46
  const words = item.wish.split(' ')
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

  const totalTextH = lines.length * lineHeight
  let startY = 380 + (220 - totalTextH) / 2

  lines.forEach((l) => {
    ctx.fillText(`"${l.trim()}"`, width / 2, startY)
    startY += lineHeight
  })

  // Người gửi & Ý nghĩa đóa sen
  ctx.font = '500 20px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#8B2E2E'
  ctx.fillText(`Nguyện chúc bởi: ${item.sender}`, width / 2, startY + 50)

  ctx.font = 'italic 16px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#6E5540'
  ctx.fillText(`Ý nghĩa đóa sen: ${info.meaning}`, width / 2, startY + 85)

  // Con dấu triện đỏ
  ctx.strokeStyle = 'rgba(139, 46, 46, 0.8)'
  ctx.lineWidth = 2
  ctx.strokeRect(width / 2 - 80, height - 140, 160, 44)
  ctx.font = 'bold 14px "Noto Serif", Georgia, serif'
  ctx.fillStyle = '#8B2E2E'
  ctx.fillText('ĐI CHÙA ONLINE · THIỆN TÂM', width / 2, height - 112)

  // Xuất file ảnh
  try {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `thiep-sen-phuoc-lanh-${Date.now()}.png`
    a.click()
  } catch (e) {
    console.warn(e)
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="card-zen relative max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-dong/30 shadow-2xl bg-gradient-to-b from-[#FAF6EE] to-[#EFE4D0] text-[#3D2C1E]">
    <!-- Nút đóng -->
    <button
      v-if="$attrs.onClose"
      @click="emit('close')"
      class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-dong/10 hover:bg-dong/25 transition-colors text-go"
      title="Đóng"
    >
      ✕
    </button>

    <div class="text-center">
      <span class="text-4xl glow-icon">🪷</span>
      <h3 class="mt-2 text-2xl heading-serif text-do sm:text-3xl">Vườn Sen & Tặng Sen Phước Lành</h3>
      <p class="mt-1 text-xs text-go/70 sm:text-sm font-serif">
        Dâng một đóa sen ngát hương, gửi gắm ước nguyện bình an đến người thân và chúng sinh.
      </p>
    </div>

    <!-- Thanh chuyển Tab -->
    <div class="mt-6 flex justify-center border-b border-dong/20 pb-3">
      <div class="flex gap-2 rounded-full bg-dong/10 p-1">
        <button
          @click="activeTab = 'send'"
          class="rounded-full px-5 py-1.5 text-xs sm:text-sm font-serif transition-all"
          :class="activeTab === 'send' ? 'bg-do text-kem shadow-glow font-bold' : 'text-go hover:bg-dong/20'"
        >
          🎁 Trao Tặng Đóa Sen
        </button>
        <button
          @click="activeTab = 'garden'"
          class="rounded-full px-5 py-1.5 text-xs sm:text-sm font-serif transition-all"
          :class="activeTab === 'garden' ? 'bg-do text-kem shadow-glow font-bold' : 'text-go hover:bg-dong/20'"
        >
          🪷 Vườn Sen Nguyện Cầu ({{ blessings.length }})
        </button>
      </div>
    </div>

    <!-- TAB 1: FORM TRAO TẶNG SEN -->
    <div v-if="activeTab === 'send'" class="mt-6 max-w-xl mx-auto animate-fade-up">
      <!-- Đã tặng thành công (Banner chúc mừng & nút tải thiệp) -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="justSentItem" class="mb-6 rounded-2xl border border-emerald-600/40 bg-emerald-50/80 p-4 text-center shadow-sm">
          <p class="text-xs font-serif font-bold text-emerald-800">
            ✓ Đóa {{ getLotusTypeInfo(justSentItem.lotusType).name }} đã nở rộ cùng lời chúc của bạn!
          </p>
          <div class="mt-3 flex items-center justify-center gap-3">
            <button
              @click="downloadLotusCard(justSentItem)"
              :disabled="isDownloading"
              class="btn-zen px-4 py-1.5 text-xs font-serif shadow-glow"
            >
              <span>🖼️</span> {{ isDownloading ? 'Đang tạo...' : 'Tải thiệp sen gửi tặng' }}
            </button>
            <button
              @click="activeTab = 'garden'"
              class="rounded-full border border-emerald-700/30 px-3.5 py-1.5 text-xs font-serif text-emerald-900 hover:bg-emerald-100"
            >
              Xem trong vườn sen ➔
            </button>
          </div>
        </div>
      </transition>

      <!-- Chọn 3 loại sen -->
      <div class="mb-5">
        <label class="block text-xs font-serif font-bold text-do mb-2">1. Chọn đóa sen cúng dường & chúc lành:</label>
        <div class="grid grid-cols-3 gap-2.5">
          <div
            v-for="t in (['pink', 'white', 'gold'] as LotusType[])"
            :key="t"
            @click="selectedType = t"
            class="p-3 rounded-xl border text-center cursor-pointer transition-all duration-300"
            :class="
              selectedType === t
                ? 'border-do bg-do/10 shadow-glow scale-102 font-bold'
                : 'border-dong/30 bg-kem/50 hover:bg-dong/15'
            "
          >
            <div class="text-3xl mb-1">{{ getLotusTypeInfo(t).icon }}</div>
            <div class="font-serif text-xs text-do font-bold">{{ getLotusTypeInfo(t).name }}</div>
            <p class="mt-1 text-[10px] text-go/70 font-serif leading-tight">
              {{ getLotusTypeInfo(t).meaning }}
            </p>
          </div>
        </div>
      </div>

      <!-- Người nhận & Người gửi -->
      <div class="grid gap-3 sm:grid-cols-2 mb-4">
        <div>
          <label class="block text-xs font-serif font-bold text-go/80 mb-1">Kính tặng đến ai:</label>
          <input
            v-model="recipientName"
            type="text"
            placeholder="Ví dụ: Thân mẫu, Ba mẹ, Bạn bè..."
            maxlength="40"
            class="w-full rounded-xl border border-dong/40 bg-kem/90 px-3 py-2 text-xs font-serif text-go outline-none focus:border-do"
          />
        </div>
        <div>
          <label class="block text-xs font-serif font-bold text-go/80 mb-1">Pháp danh / Tên của bạn:</label>
          <input
            v-model="senderName"
            type="text"
            placeholder="Để trống nếu muốn ẩn danh"
            maxlength="40"
            class="w-full rounded-xl border border-dong/40 bg-kem/90 px-3 py-2 text-xs font-serif text-go outline-none focus:border-do"
          />
        </div>
      </div>

      <!-- Lời chúc lành -->
      <div class="mb-4">
        <label class="block text-xs font-serif font-bold text-go/80 mb-1">Tâm nguyện & Lời chúc an lành:</label>
        <textarea
          v-model="wishText"
          rows="3"
          placeholder="Nguyện cầu thân tâm an lạc, bệnh tật tiêu trừ, vạn sự hanh thông..."
          maxlength="200"
          class="w-full rounded-xl border border-dong/40 bg-kem/90 p-3 text-xs font-serif text-go outline-none focus:border-do resize-none"
        ></textarea>
        <div class="flex justify-between text-[11px] text-go/50 font-serif mt-1">
          <span>* Nội dung được duyệt tự động theo tinh thần Phật giáo</span>
          <span>{{ wishText.length }}/200</span>
        </div>
      </div>

      <p v-if="formError" class="mb-3 text-center text-xs font-serif text-do font-bold">
        ⚠️ {{ formError }}
      </p>

      <!-- Nút gửi -->
      <div class="text-center">
        <button
          @click="handleSubmit"
          class="btn-zen px-8 py-2.5 text-xs sm:text-sm font-serif shadow-glow"
        >
          <span>🪷</span> Trao Tặng Đóa Sen Phước Lành
        </button>
      </div>
    </div>

    <!-- TAB 2: VƯỜN SEN NGUYỆN CẦU -->
    <div v-else class="mt-6 animate-fade-up">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in blessings"
          :key="item.id"
          @click="selectedItem = item"
          class="p-4 rounded-xl border border-dong/30 bg-kem/70 hover:bg-dong/15 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
        >
          <div class="flex items-center justify-between pb-2 border-b border-dong/20">
            <div class="flex items-center gap-1.5">
              <span class="text-xl">{{ getLotusTypeInfo(item.lotusType).icon }}</span>
              <span class="font-serif text-xs font-bold text-do">
                {{ getLotusTypeInfo(item.lotusType).name }}
              </span>
            </div>
            <span class="text-[10px] text-go/50 font-serif">
              {{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}
            </span>
          </div>

          <p class="mt-2 text-xs font-serif text-go/90 italic line-clamp-3">
            "{{ item.wish }}"
          </p>

          <div class="mt-3 flex items-center justify-between text-[11px] font-serif text-go/70 pt-2 border-t border-dong/10">
            <span>Tặng: <b class="text-do">{{ item.recipient }}</b></span>
            <span>Bởi: <b>{{ item.sender }}</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem chi tiết và tải thiệp sen -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="selectedItem = null"
      >
        <div class="card-zen max-w-md w-full p-6 text-center animate-fade-up bg-[#FAF6EE]">
          <span class="text-4xl">{{ getLotusTypeInfo(selectedItem.lotusType).icon }}</span>
          <h4 class="font-serif text-lg font-bold text-do mt-2">
            Đóa {{ getLotusTypeInfo(selectedItem.lotusType).name }}
          </h4>
          <p class="text-xs text-go/60 font-serif mb-4">
            Kính tặng: <b class="text-do">{{ selectedItem.recipient }}</b>
          </p>

          <div class="p-4 rounded-xl border border-dong/30 bg-kem/60 text-sm font-serif italic text-go/90 leading-relaxed mb-4">
            "{{ selectedItem.wish }}"
          </div>

          <p class="text-xs text-go/70 font-serif mb-4">
            — {{ selectedItem.sender }} —
          </p>

          <div class="flex items-center justify-center gap-3">
            <button
              @click="downloadLotusCard(selectedItem)"
              :disabled="isDownloading"
              class="btn-zen px-4 py-1.5 text-xs font-serif shadow-glow"
            >
              <span>🖼️</span> {{ isDownloading ? 'Đang tạo...' : 'Tải thiệp sen' }}
            </button>
            <button
              @click="selectedItem = null"
              class="rounded-full border border-dong/40 px-4 py-1.5 text-xs font-serif text-go hover:bg-dong/20"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Canvas ẩn dùng để xuất ảnh -->
    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>


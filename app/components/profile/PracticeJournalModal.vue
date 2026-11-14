<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePracticeJournal } from '~/composables/usePracticeJournal'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  today,
  records,
  streak,
  totalStats,
  saveDedication,
  exportData,
  importData
} = usePracticeJournal()

const dedicationInput = ref(today.value.meritDedication || '')
const saveSuccess = ref(false)
const importError = ref('')
const importSuccess = ref(false)
const showBackup = ref(false)

function onSaveDedication() {
  saveDedication(dedicationInput.value)
  saveSuccess.value = true
  setTimeout(() => (saveSuccess.value = false), 2500)
}

function handleExport() {
  if (!import.meta.client) return
  const data = exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nhat-ky-tu-tap-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImportFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result as string
    if (importData(content)) {
      importSuccess.value = true
      importError.value = ''
      setTimeout(() => (importSuccess.value = false), 3000)
    } else {
      importError.value = 'File sao lưu không hợp lệ.'
    }
  }
  reader.readAsText(file)
}

// Tạo danh sách 30 ngày gần đây để hiển thị lịch hoa sen
const recentDays = computed(() => {
  const days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dayNum}`

    const rec = records.value[dateStr]
    const hasPracticed = rec && (
      (rec.chantingCount || 0) > 0 ||
      (rec.meditationMinutes || 0) > 0 ||
      (rec.incenseCount || 0) > 0 ||
      (rec.sutraReadCount || 0) > 0 ||
      rec.dharmaRead
    )

    days.push({
      dateStr,
      dayNum,
      isToday: i === 0,
      hasPracticed,
      rec
    })
  }
  return days
})
</script>

<template>
  <div class="card-zen relative max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-dong/30 shadow-2xl bg-[#FAF6EE] text-[#3D2C1E]">
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
      <span class="text-4xl glow-icon">🏮</span>
      <h3 class="mt-2 text-2xl heading-serif text-do sm:text-3xl">Nhật Ký Tu Tập & Hồi Hướng</h3>
      <p class="mt-1 text-xs text-go/70 sm:text-sm">
        Ghi dấu từng bước chân an lạc, tích lũy phước lành và hồi hướng tâm nguyện.
      </p>
    </div>

    <!-- Thẻ tóm tắt thông số tu tập -->
    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <!-- Chuỗi ngày tịnh tâm -->
      <div class="rounded-xl border border-dong/30 bg-kem/60 p-4 text-center shadow-sm">
        <span class="text-2xl">🔥</span>
        <div class="mt-1 text-2xl font-bold font-serif text-do">{{ streak }} ngày</div>
        <p class="text-[11px] text-go/70 uppercase tracking-wider font-serif">Tịnh tâm liên tục</p>
      </div>

      <!-- Niệm Phật -->
      <div class="rounded-xl border border-dong/30 bg-kem/60 p-4 text-center shadow-sm">
        <span class="text-2xl">📿</span>
        <div class="mt-1 text-2xl font-bold font-serif text-do">{{ totalStats.totalChanting }}</div>
        <p class="text-[11px] text-go/70 uppercase tracking-wider font-serif">
          Biến niệm ({{ totalStats.totalMalas }} chuỗi)
        </p>
      </div>

      <!-- Thiền định -->
      <div class="rounded-xl border border-dong/30 bg-kem/60 p-4 text-center shadow-sm">
        <span class="text-2xl">🧘</span>
        <div class="mt-1 text-2xl font-bold font-serif text-do">{{ totalStats.totalMeditation }}p</div>
        <p class="text-[11px] text-go/70 uppercase tracking-wider font-serif">Tọa thiền</p>
      </div>

      <!-- Thắp nhang & Đọc kinh -->
      <div class="rounded-xl border border-dong/30 bg-kem/60 p-4 text-center shadow-sm">
        <span class="text-2xl">🕯️</span>
        <div class="mt-1 text-2xl font-bold font-serif text-do">
          {{ totalStats.totalIncense }} / {{ totalStats.totalSutras }}
        </div>
        <p class="text-[11px] text-go/70 uppercase tracking-wider font-serif">Dâng hương / Đọc kinh</p>
      </div>
    </div>

    <!-- Hôm nay của bạn -->
    <div class="mt-6 rounded-2xl border border-dong/30 bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] p-5 shadow-sm">
      <div class="flex items-center justify-between border-b border-dong/20 pb-3">
        <h4 class="font-serif text-base font-semibold text-do flex items-center gap-1.5">
          <span>🌿</span> Thực hành hôm nay ({{ today.date }})
        </h4>
        <span class="text-xs text-go/60 font-serif">Lưu trữ cục bộ</span>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 font-serif">
        <div class="flex items-center gap-2">
          <span class="text-lg">🕯️</span>
          <span>Dâng hương: <b class="text-do">{{ today.incenseCount }}</b> nén</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg">📿</span>
          <span>Niệm Phật: <b class="text-do">{{ today.chantingCount }}</b> biến</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg">🧘</span>
          <span>Thiền định: <b class="text-do">{{ today.meditationMinutes }}</b> phút</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg">📖</span>
          <span>Đọc kinh: <b class="text-do">{{ today.sutraReadCount }}</b> bài</span>
        </div>
      </div>
    </div>

    <!-- Lịch hoa sen 30 ngày gần nhất -->
    <div class="mt-6">
      <h4 class="font-serif text-base font-semibold text-do mb-3 flex items-center gap-1.5">
        <span>🪷</span> Lịch Hoa Sen (30 ngày gần đây)
      </h4>
      <div class="grid grid-cols-6 sm:grid-cols-10 gap-2 text-center text-xs">
        <div
          v-for="day in recentDays"
          :key="day.dateStr"
          class="flex flex-col items-center justify-center rounded-xl p-2 border transition-all"
          :class="[
            day.hasPracticed
              ? 'border-dong bg-dong/20 text-do shadow-sm'
              : 'border-dong/20 bg-kem/40 text-go/50',
            { 'ring-2 ring-do': day.isToday }
          ]"
          :title="`${day.dateStr}: ${day.hasPracticed ? 'Đã tu tập' : 'Chưa ghi nhận'}`"
        >
          <span class="text-base">{{ day.hasPracticed ? '🪷' : '⚪' }}</span>
          <span class="mt-1 font-serif text-[11px]" :class="{ 'font-bold text-do': day.isToday }">
            {{ day.dayNum }}
          </span>
        </div>
      </div>
    </div>

    <!-- Hồi hướng công đức -->
    <div class="mt-6 rounded-2xl border border-dong/30 bg-[#FFFDF9] p-5 shadow-sm">
      <h4 class="font-serif text-base font-semibold text-do flex items-center gap-1.5">
        <span>🙏</span> Lời Hồi Hướng Công Đức
      </h4>
      <p class="mt-1 text-xs text-go/70">
        Sau mỗi giờ niệm Phật, tọa thiền hay dâng hương, hãy gửi gắm lời nguyện an lành đến ông bà, cha mẹ và muôn loài chúng sinh.
      </p>

      <div class="mt-3">
        <textarea
          v-model="dedicationInput"
          rows="3"
          placeholder="Ví dụ: Nguyện đem công đức tu tập này hồi hướng cho cha mẹ bình an khỏe mạnh, cửu huyền thất tổ siêu sinh tịnh độ, muôn loài đều an vui..."
          class="w-full rounded-xl border border-dong/40 bg-kem/40 p-3 text-xs sm:text-sm text-go focus:border-do focus:outline-none focus:ring-1 focus:ring-do font-serif"
        />
        <div class="mt-2 flex items-center justify-between">
          <p v-if="saveSuccess" class="text-xs text-do font-serif animate-fade-up">
            ✓ Đã lưu tâm nguyện hồi hướng!
          </p>
          <span v-else />

          <button
            @click="onSaveDedication"
            class="btn-zen px-4 py-1.5 text-xs font-serif"
          >
            Lưu hồi hướng
          </button>
        </div>
      </div>
    </div>

    <!-- Sao lưu & Phục hồi dữ liệu -->
    <div class="mt-6 border-t border-dong/20 pt-4 text-xs">
      <div class="flex items-center justify-between">
        <button
          @click="showBackup = !showBackup"
          class="text-go/70 hover:text-do underline font-serif"
        >
          {{ showBackup ? 'Ẩn cài đặt sao lưu' : '⚙️ Quản lý & Sao lưu dữ liệu' }}
        </button>
      </div>

      <div v-if="showBackup" class="mt-3 flex flex-wrap items-center gap-3 bg-dong/10 p-3 rounded-xl">
        <button
          @click="handleExport"
          class="rounded-lg border border-dong/50 px-3 py-1.5 bg-kem/80 hover:bg-kem text-go font-serif transition-colors"
        >
          📥 Tải file sao lưu (.json)
        </button>

        <label class="cursor-pointer rounded-lg border border-dong/50 px-3 py-1.5 bg-kem/80 hover:bg-kem text-go font-serif transition-colors">
          📤 Khôi phục từ file
          <input type="file" accept=".json" @change="handleImportFile" class="hidden" />
        </label>

        <span v-if="importSuccess" class="text-do font-bold">✓ Đã khôi phục dữ liệu thành công!</span>
        <span v-if="importError" class="text-red-600 font-bold">{{ importError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLanterns } from '~/composables/useLanterns'
import { useSound } from '~/composables/useSound'
import { useModeration } from '~/composables/useModeration'
import type { LanternItem } from '~/types/ecosystem'

const emit = defineEmits<{ (e: 'close'): void }>()

const { lanterns, isRealtimeConnected, lunarFestivalInfo, init, releaseLantern } = useLanterns()
const { playBell } = useSound()
const { sanitize, checkRateLimit } = useModeration()

const showReleaseModal = ref(false)
const selectedLantern = ref<LanternItem | null>(null)
const justReleased = ref(false)
const releaseError = ref('')

const senderName = ref('')
const prayerText = ref('')
const category = ref<'peace' | 'health' | 'family' | 'rebirth'>('peace')
const lanternType = ref<'lotus_pink' | 'lotus_gold' | 'lotus_white'>('lotus_pink')

let animTimer: any = null

function updateDrift() {
  // Cho các hoa đăng trôi nhẹ nhàng từ dưới lên trên (về phía chân trời xa)
  lanterns.value.forEach((l) => {
    l.yPercent -= l.speed * 0.08
    l.driftPhase += 0.02
    l.xPercent += Math.sin(l.driftPhase) * 0.04

    // Thu nhỏ dần khi trôi ra xa chân trời
    l.sizeScale = Math.max(0.4, 0.4 + (l.yPercent / 100) * 0.6)

    // Nếu hoa đăng trôi khuất đường chân trời (y < 8%) -> quay lại hạ lưu
    if (l.yPercent < 8) {
      l.yPercent = 85 + Math.random() * 10
      l.xPercent = 15 + Math.random() * 70
    }
  })
}

function handleReleaseSubmit() {
  releaseError.value = ''

  const modPrayer = sanitize(prayerText.value)
  if (!modPrayer.isValid) {
    releaseError.value = modPrayer.error || 'Nội dung không hợp lệ.'
    return
  }

  const rate = checkRateLimit('release_lantern', 3, 300)
  if (!rate.allowed) {
    releaseError.value = `Xin hãy hoan hỷ chờ ${rate.remainingSeconds} giây trước khi thả tiếp.`
    return
  }

  const cleanSender = sanitize(senderName.value || 'Phật tử ẩn danh').cleaned

  releaseLantern(
    cleanSender,
    modPrayer.cleaned,
    category.value,
    lanternType.value
  )
  playBell()
  showReleaseModal.value = false
  justReleased.value = true
  setTimeout(() => (justReleased.value = false), 4000)

  prayerText.value = ''
  senderName.value = ''
}

onMounted(() => {
  init()
  animTimer = setInterval(updateDrift, 50)
})

onBeforeUnmount(() => {
  if (animTimer) clearInterval(animTimer)
})
</script>

<template>
  <div class="card-zen relative flex flex-col overflow-hidden p-0 border border-dong/30 shadow-2xl bg-[#08121E] text-kem rounded-2xl h-[560px] max-h-[85vh]">
    <!-- Thanh trên cùng -->
    <div class="flex flex-wrap items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#0B1E2D]/80 backdrop-blur-sm z-20">
      <div class="flex items-center gap-2">
        <span class="text-2xl glow-icon">🪔</span>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-serif text-lg font-semibold sm:text-xl text-dong">
              Bến Sông Hoa Đăng Cầu An
            </h3>
            <span
              v-if="isRealtimeConnected"
              class="hidden sm:inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-serif text-emerald-400"
              title="Đang đồng bộ trực tuyến với các Phật tử khác"
            >
              🟢 Realtime
            </span>
          </div>
          <p class="text-[11px] text-kem/70 font-serif">
            Hàng ngàn đóa hoa sen thắp sáng ước nguyện thiện lành trôi về chân trời an yên
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <button
          @click="showReleaseModal = true"
          class="btn-zen flex items-center gap-1.5 px-4 py-1.5 text-xs font-serif shadow-glow"
        >
          <span>🪷</span> Thả hoa đăng
        </button>

        <button
          v-if="$attrs.onClose"
          @click="emit('close')"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-kem hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Khung cảnh sông đêm lung linh (Interactive River Scene) -->
    <div class="relative flex-1 overflow-hidden select-none">
      <!-- Bầu trời đêm & Trăng rằm mờ ảo -->
      <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#040810] to-[#0A1A2B] pointer-events-none">
        <!-- Vầng trăng vàng dịu -->
        <div class="absolute top-6 right-16 h-16 w-16 rounded-full bg-[#FFEAA7] blur-[1px] opacity-85 shadow-[0_0_35px_rgba(255,234,167,0.7)]" />
        <!-- Dãy núi mờ xa xa -->
        <svg class="absolute bottom-0 inset-x-0 w-full h-24 opacity-30" viewBox="0 0 800 120" preserveAspectRatio="none">
          <path d="M0 120 L0 80 Q150 20 300 70 T600 40 T800 60 L800 120 Z" fill="#06121C" />
        </svg>

        <!-- Banner Lễ Hội Đêm Rằm / Mùng Một nếu đúng ngày -->
        <div
          v-if="lunarFestivalInfo.isFestivalToday"
          class="absolute top-4 left-4 rounded-full bg-dong/25 border border-dong/50 px-3.5 py-1 text-xs font-serif text-dong backdrop-blur-md shadow-glow flex items-center gap-1.5 animate-pulse"
        >
          <span>🌕</span>
          <span>{{ lunarFestivalInfo.festivalTitle }} · Đang diễn ra</span>
        </div>
      </div>

      <!-- Mặt nước sông gợn sóng lấp lánh phản chiếu -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#0A1A2B] via-[#081522] to-[#050B12]">
        <!-- Vệt sáng trăng rọi trên mặt nước -->
        <div class="absolute top-28 right-16 w-24 h-full bg-gradient-to-b from-dong/20 via-dong/5 to-transparent blur-2xl pointer-events-none" />
      </div>

      <!-- CÁC HOA ĐĂNG ĐANG TRÔI TRÊN DÒNG NƯỚC -->
      <div
        v-for="lan in lanterns"
        :key="lan.id"
        @click="selectedLantern = lan"
        class="absolute cursor-pointer transition-transform duration-200 hover:scale-125 z-10 -translate-x-1/2 -translate-y-1/2 group"
        :style="{
          left: `${lan.xPercent}%`,
          top: `${lan.yPercent}%`,
          transform: `scale(${lan.sizeScale})`
        }"
      >
        <!-- Vầng sáng hào quang quanh ngọn nến -->
        <div class="absolute -inset-2 rounded-full bg-dong/30 blur-md group-hover:bg-dong/60 transition-colors animate-pulse" />

        <!-- Bóng nước phản chiếu dưới đáy -->
        <div class="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-dong/20 blur-[2px]" />

        <!-- Đóa hoa sen chứa nến -->
        <svg width="48" height="42" viewBox="0 0 48 42" class="relative z-10 overflow-visible">
          <!-- Cánh sen ngoài -->
          <path
            d="M24 16 C12 18 6 30 14 34 C20 36 28 36 34 34 C42 30 36 18 24 16 Z"
            :fill="lan.lanternType === 'lotus_pink' ? '#FF758F' : lan.lanternType === 'lotus_gold' ? '#FFD166' : '#FFFFFF'"
            :stroke="lan.lanternType === 'lotus_pink' ? '#D90429' : lan.lanternType === 'lotus_gold' ? '#C9A356' : '#CCC'"
            stroke-width="1"
          />
          <!-- Cánh sen trong ôm lấy nến -->
          <path
            d="M24 20 C18 22 14 30 20 33 C24 34 26 34 28 33 C34 30 30 22 24 20 Z"
            :fill="lan.lanternType === 'lotus_pink' ? '#FF8FA3' : lan.lanternType === 'lotus_gold' ? '#FFE49E' : '#FFF'"
          />
          <!-- Ngọn nến lung linh -->
          <rect x="22.5" y="16" width="3" height="10" fill="#FFF3B0" rx="1.5" />
          <!-- Đốm lửa nến chập chờn -->
          <ellipse cx="24" cy="13" rx="3.5" ry="5.5" fill="#FF5400" />
          <ellipse cx="24" cy="14" rx="2" ry="3.5" fill="#FFEAA7" />
        </svg>

        <!-- Tooltip tên người gửi khi rê chuột -->
        <div class="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[9px] text-dong font-serif">
          {{ lan.senderName }}
        </div>
      </div>

      <!-- Gợi ý ở đáy màn hình -->
      <div class="pointer-events-none absolute bottom-3 left-4 text-[11px] text-kem/50 font-serif z-20">
        💡 Nhấp vào bất kỳ đóa hoa đăng nào để chiêm ngưỡng ước nguyện an lành của Phật tử
      </div>

      <!-- Thông báo khi vừa thả xong hoa đăng -->
      <transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div
          v-if="justReleased"
          class="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-dong/90 px-5 py-1.5 text-xs font-serif font-bold text-[#141A1F] shadow-lg backdrop-blur-sm z-30"
        >
          ✓ Đóa hoa đăng đã hạ thủy! Nguyện ước nguyện của bạn tỏa sáng an yên.
        </div>
      </transition>
    </div>

    <!-- ================================================================= -->
    <!-- MODAL XEM CHI TIẾT ƯỚC NGUYỆN CỦA HOA ĐĂNG                      -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="selectedLantern"
        class="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        @click.self="selectedLantern = null"
      >
        <div class="w-full max-w-sm rounded-2xl border border-dong/40 bg-[#0F2232] p-6 text-center text-kem shadow-2xl animate-fade-up">
          <span class="text-4xl glow-icon">🪷</span>
          <h4 class="mt-2 font-serif text-xl font-bold text-dong">
            Đóa Hoa Đăng Cầu An
          </h4>
          <p class="text-xs text-kem/70 font-serif">
            Người gửi: <b>{{ selectedLantern.senderName }}</b>
          </p>

          <p class="my-4 rounded-xl border border-white/10 bg-black/30 p-4 font-serif text-sm italic text-dong leading-relaxed">
            "{{ selectedLantern.prayerText }}"
          </p>

          <div class="text-[11px] text-kem/60 font-serif mb-4">
            Ý nguyện: {{ selectedLantern.category === 'peace' ? 'Cầu bình an, an lạc' : selectedLantern.category === 'health' ? 'Cầu sức khỏe thọ khang' : selectedLantern.category === 'family' ? 'Cầu gia đạo hòa thuận' : 'Hồi hướng cửu huyền thất tổ' }}
          </div>

          <button
            @click="selectedLantern = null"
            class="btn-zen px-6 py-1.5 text-xs font-serif"
          >
            Lắng lòng niệm an
          </button>
        </div>
      </div>
    </transition>

    <!-- ================================================================= -->
    <!-- MODAL THẢ HOA ĐĂNG MỚI                                            -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="showReleaseModal"
        class="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="showReleaseModal = false"
      >
        <div class="w-full max-w-md rounded-2xl border border-dong/40 bg-[#0E1E2C] p-6 text-kem shadow-2xl animate-fade-up">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 class="font-serif text-lg font-bold text-dong flex items-center gap-2">
              <span>🪷</span> Thả Đóa Hoa Đăng Thiện Lành
            </h4>
            <button @click="showReleaseModal = false" class="text-kem/60 hover:text-kem">✕</button>
          </div>

          <p class="mt-3 text-xs text-kem/80 font-serif leading-relaxed">
            Thắp lên ngọn nến tâm thành, gửi gắm lời chúc nguyện an yên trôi theo dòng sông thanh tịnh.
          </p>

          <!-- Chọn kiểu dáng sắc sen -->
          <div class="mt-4">
            <label class="block text-xs font-serif text-dong mb-1.5">Chọn đóa sen:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="lanternType = 'lotus_pink'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="lanternType === 'lotus_pink' ? 'border-[#FF758F] bg-[#FF758F]/25 text-[#FF8FA3] font-bold' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                🌸 Sen Hồng<br /><span class="text-[10px] font-normal">Từ bi & Tịnh độ</span>
              </button>
              <button
                type="button"
                @click="lanternType = 'lotus_gold'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="lanternType === 'lotus_gold' ? 'border-dong bg-dong/25 text-dong font-bold' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                🟡 Sen Vàng<br /><span class="text-[10px] font-normal">Trí tuệ & Cát tường</span>
              </button>
              <button
                type="button"
                @click="lanternType = 'lotus_white'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="lanternType === 'lotus_white' ? 'border-white bg-white/25 text-white font-bold' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                ⚪ Sen Trắng<br /><span class="text-[10px] font-normal">Thuần khiết & Siêu sinh</span>
              </button>
            </div>
          </div>

          <!-- Chủ đề cầu nguyện -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1.5">Chủ đề cầu an:</label>
            <div class="grid grid-cols-2 gap-2 text-xs font-serif">
              <button
                type="button"
                @click="category = 'peace'"
                class="rounded-lg border p-1.5 text-left transition-colors"
                :class="category === 'peace' ? 'border-dong bg-dong/20 text-dong' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                🕊️ Cầu bình an & an lạc
              </button>
              <button
                type="button"
                @click="category = 'health'"
                class="rounded-lg border p-1.5 text-left transition-colors"
                :class="category === 'health' ? 'border-dong bg-dong/20 text-dong' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                🌿 Cầu sức khỏe thọ khang
              </button>
              <button
                type="button"
                @click="category = 'family'"
                class="rounded-lg border p-1.5 text-left transition-colors"
                :class="category === 'family' ? 'border-dong bg-dong/20 text-dong' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                👨‍👩‍👧‍👦 Cầu gia đạo hòa thuận
              </button>
              <button
                type="button"
                @click="category = 'rebirth'"
                class="rounded-lg border p-1.5 text-left transition-colors"
                :class="category === 'rebirth' ? 'border-dong bg-dong/20 text-dong' : 'border-white/10 bg-white/5 text-kem/70'"
              >
                🪷 Hồi hướng cửu huyền
              </button>
            </div>
          </div>

          <!-- Lời nguyện lành -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1">Lời nguyện gửi vào đóa sen:</label>
            <textarea
              v-model="prayerText"
              rows="3"
              placeholder="Nguyện cầu cha mẹ an vui, muôn loài sống trong hòa bình..."
              class="w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-xs text-kem focus:border-dong focus:outline-none font-serif"
            />
          </div>

          <!-- Tên người gửi -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1">Họ tên của bạn (hoặc ghi Ẩn danh):</label>
            <input
              v-model="senderName"
              type="text"
              placeholder="Phật tử ẩn danh"
              class="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-kem focus:border-dong focus:outline-none font-serif"
            />
          </div>

          <!-- Lỗi kiểm duyệt nếu có -->
          <p v-if="releaseError" class="mt-2 text-xs text-red-400 font-serif">
            {{ releaseError }}
          </p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              @click="showReleaseModal = false"
              class="rounded-xl border border-white/20 px-4 py-1.5 text-xs font-serif hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              @click="handleReleaseSubmit"
              class="btn-zen px-6 py-1.5 text-xs font-serif shadow-glow"
            >
              Thắp nến hạ thủy
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


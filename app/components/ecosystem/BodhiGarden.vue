<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBodhiTree } from '~/composables/useBodhiTree'
import { useSound } from '~/composables/useSound'
import { useModeration } from '~/composables/useModeration'
import type { BodhiRibbon } from '~/types/ecosystem'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  tree,
  currentStage,
  stageName,
  canWaterToday,
  daysPlanted,
  waterTree,
  attachRibbon,
  renameTree
} = useBodhiTree()

const { playChime } = useSound()
const { sanitize, checkRateLimit } = useModeration()

const showRibbonModal = ref(false)
const showRenameModal = ref(false)
const selectedRibbon = ref<BodhiRibbon | null>(null)
const isWatering = ref(false)
const waterSuccess = ref(false)
const ribbonError = ref('')

const newWish = ref('')
const newAuthor = ref('')
const newColor = ref<'red' | 'yellow' | 'white'>('red')
const editName = ref(tree.value.treeName)

function handleWater() {
  if (!canWaterToday.value || isWatering.value) return
  isWatering.value = true
  playChime()

  setTimeout(() => {
    waterTree()
    isWatering.value = false
    waterSuccess.value = true
    setTimeout(() => (waterSuccess.value = false), 3500)
  }, 1200)
}

function handleAddRibbon() {
  ribbonError.value = ''
  const mod = sanitize(newWish.value)
  if (!mod.isValid) {
    ribbonError.value = mod.error || 'Nội dung không hợp lệ.'
    return
  }
  const cleanAuthor = sanitize(newAuthor.value || 'Con').cleaned

  attachRibbon(mod.cleaned, cleanAuthor, newColor.value)
  showRibbonModal.value = false
  newWish.value = ''
  newAuthor.value = ''
  playChime()
}

function handleSaveName() {
  renameTree(editName.value)
  showRenameModal.value = false
}
</script>

<template>
  <div class="card-zen relative overflow-hidden p-6 sm:p-8 border border-dong/30 shadow-2xl bg-gradient-to-b from-[#FAF6EE] to-[#EFE4D0] text-[#3D2C1E]">
    <!-- Nút đóng -->
    <button
      v-if="$attrs.onClose"
      @click="emit('close')"
      class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-dong/10 hover:bg-dong/25 transition-colors text-go"
      title="Đóng"
    >
      ✕
    </button>

    <!-- Header thông tin cây -->
    <div class="text-center">
      <div class="flex items-center justify-center gap-2">
        <h3 class="text-2xl font-bold font-serif text-do sm:text-3xl">
          {{ tree.treeName }}
        </h3>
        <button
          @click="showRenameModal = true; editName = tree.treeName"
          class="text-xs text-go/50 hover:text-do"
          title="Đổi tên cây"
        >
          ✏️
        </button>
      </div>
      <p class="mt-1 text-xs text-go/70 font-serif">
        Đã gieo trồng: <b class="text-do">{{ daysPlanted }} ngày</b> · Đã tưới nước: <b class="text-do">{{ tree.waterCount }} lần</b>
      </p>
      <span class="mt-1.5 inline-block rounded-full bg-dong/20 px-3 py-0.5 text-xs font-serif text-do font-medium">
        Giai đoạn: {{ stageName }}
      </span>
    </div>

    <!-- Khung chính: Cây Bồ Đề SVG tương tác -->
    <div class="relative mx-auto my-4 flex h-72 w-full max-w-md items-center justify-center select-none">
      <!-- Nền đồi thoai thoải & bầu trời mây nhẹ -->
      <svg class="h-full w-full" viewBox="0 0 400 320">
        <!-- Bầu trời và đồi cỏ -->
        <ellipse cx="200" cy="300" rx="190" ry="35" fill="#4A6B3C" fill-opacity="0.25" />
        <ellipse cx="200" cy="302" rx="170" ry="24" fill="#3A5330" fill-opacity="0.35" />

        <!-- GIAI ĐOẠN 1: SEED (Hạt mầm) -->
        <g v-if="currentStage === 'seed'">
          <ellipse cx="200" cy="292" rx="28" ry="10" fill="#6B4B32" />
          <circle cx="200" cy="288" r="8" fill="#C9A356" />
          <path d="M200 280 Q203 268 206 264" stroke="#5E8C31" stroke-width="3" stroke-linecap="round" fill="none" />
          <circle cx="206" cy="264" r="3" fill="#5E8C31" />
        </g>

        <!-- GIAI ĐOẠN 2: SPROUT (Chồi non 2 lá) -->
        <g v-else-if="currentStage === 'sprout'">
          <ellipse cx="200" cy="292" rx="34" ry="12" fill="#5A3E28" />
          <!-- Thân chồi -->
          <path d="M200 292 Q200 240 200 220" stroke="#4B6B2B" stroke-width="5" stroke-linecap="round" fill="none" />
          <!-- 2 lá mầm hình trái tim -->
          <path d="M200 220 C185 200 170 215 190 228 C197 232 200 224 200 220 Z" fill="#588157" />
          <path d="M200 220 C215 200 230 215 210 228 C203 232 200 224 200 220 Z" fill="#6A994E" />
          <!-- Giọt sương -->
          <circle cx="208" cy="216" r="2.5" fill="#FFF" fill-opacity="0.8" />
        </g>

        <!-- GIAI ĐOẠN 3: SAPLING (Cây non) -->
        <g v-else-if="currentStage === 'sapling'">
          <!-- Gốc cây -->
          <path d="M194 295 L197 220 L203 220 L206 295 Z" fill="#5B3D28" />
          <!-- Cành nhánh -->
          <path d="M198 245 Q175 220 160 215" stroke="#5B3D28" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M202 235 Q225 210 240 200" stroke="#5B3D28" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M200 220 Q200 180 195 165" stroke="#5B3D28" stroke-width="3" stroke-linecap="round" fill="none" />
          <!-- Tán lá Bồ Đề -->
          <ellipse cx="160" cy="210" rx="26" ry="18" fill="#52796F" fill-opacity="0.9" />
          <ellipse cx="240" cy="195" rx="30" ry="20" fill="#40916C" fill-opacity="0.9" />
          <ellipse cx="195" cy="160" rx="35" ry="25" fill="#2D6A4F" fill-opacity="0.95" />
        </g>

        <!-- GIAI ĐOẠN 4 & 5: GROWN & ANCIENT (Cây trưởng thành & Cổ thụ) -->
        <g v-else>
          <!-- Hào quang vàng phía sau cây đại thụ -->
          <circle v-if="currentStage === 'ancient'" cx="200" cy="145" r="95" fill="#C9A356" fill-opacity="0.15" />

          <!-- Rễ và thân cây đồ sộ -->
          <path d="M182 298 C185 240 192 190 195 140 L205 140 C208 190 215 240 218 298 Z" fill="#4A2C1C" />
          <!-- Rễ phụ cắm xuống đất -->
          <path d="M185 270 Q170 285 160 298" stroke="#4A2C1C" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M215 270 Q230 285 240 298" stroke="#4A2C1C" stroke-width="4" stroke-linecap="round" fill="none" />

          <!-- Các cành vươn rộng -->
          <path d="M196 170 Q140 140 110 130" stroke="#4A2C1C" stroke-width="6" stroke-linecap="round" fill="none" />
          <path d="M204 165 Q260 135 290 120" stroke="#4A2C1C" stroke-width="6" stroke-linecap="round" fill="none" />
          <path d="M198 140 Q170 100 150 75" stroke="#4A2C1C" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M202 140 Q230 95 250 70" stroke="#4A2C1C" stroke-width="4.5" stroke-linecap="round" fill="none" />

          <!-- Tán lá xum xuê nhiều tầng bồ đề -->
          <ellipse cx="110" cy="125" rx="42" ry="28" fill="#2D6A4F" fill-opacity="0.9" />
          <ellipse cx="290" cy="115" rx="46" ry="30" fill="#40916C" fill-opacity="0.9" />
          <ellipse cx="150" cy="70" rx="44" ry="32" fill="#52796F" fill-opacity="0.92" />
          <ellipse cx="250" cy="65" rx="48" ry="34" fill="#2D6A4F" fill-opacity="0.92" />
          <ellipse cx="200" cy="55" rx="55" ry="38" fill="#1B4332" fill-opacity="0.96" />

          <!-- Chuông gió treo trên cành -->
          <circle cx="150" cy="135" r="3" fill="#C9A356" />
          <line x1="150" y1="135" x2="150" y2="152" stroke="#C9A356" stroke-width="1.2" />
          <rect x="148" y="152" width="4" height="7" fill="#C9A356" />
        </g>

        <!-- DẢI LỤA CẦU AN TREO TRÊN CÀNH (Nếu cây đã ở giai đoạn sapling/grown/ancient) -->
        <g v-if="currentStage !== 'seed' && currentStage !== 'sprout'">
          <g
            v-for="(rib, rIdx) in tree.ribbons.slice(0, 6)"
            :key="rib.id"
            @click="selectedRibbon = rib"
            class="cursor-pointer transition-transform hover:scale-125"
            :transform="`translate(${140 + (rIdx % 4) * 38}, ${145 + Math.sin(rIdx * 1.5) * 20})`"
          >
            <!-- Dây lụa rủ xuống đung đưa -->
            <path
              d="M0 0 Q4 16 0 28 Q-3 36 0 44"
              :stroke="rib.color === 'red' ? '#8B2E2E' : rib.color === 'yellow' ? '#C9A356' : '#FFF'"
              stroke-width="3"
              stroke-linecap="round"
              fill="none"
              class="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            />
            <circle cx="0" cy="0" r="2.5" fill="#C9A356" />
          </g>
        </g>

        <!-- Hiệu ứng tưới nước (Giọt nước rơi long lanh) -->
        <g v-if="isWatering">
          <circle cx="200" cy="210" r="4" fill="#3A86FF" class="animate-bounce" />
          <circle cx="192" cy="235" r="3" fill="#3A86FF" />
          <circle cx="208" cy="245" r="3.5" fill="#3A86FF" />
          <circle cx="200" cy="270" r="5" fill="#3A86FF" />
        </g>
      </svg>
    </div>

    <!-- Thông báo sau khi tưới nước thành công -->
    <transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <p v-if="waterSuccess" class="text-center text-xs font-serif text-do font-bold my-1">
        ✓ Bạn đã tưới nước cho cây Bồ Đề hôm nay! Cây thêm tươi tốt và đầy sinh khí.
      </p>
    </transition>

    <!-- Thanh nút hành động (Tưới cây & Treo dải lụa) -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
      <!-- Nút tưới cây -->
      <button
        @click="handleWater"
        :disabled="!canWaterToday || isWatering"
        class="btn-zen flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-serif shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>💧</span>
        <span>{{ isWatering ? 'Đang tưới nước...' : canWaterToday ? 'Tưới nước hôm nay' : 'Đã tưới nước hôm nay' }}</span>
      </button>

      <!-- Nút treo dải lụa cầu an -->
      <button
        @click="showRibbonModal = true"
        class="rounded-full border border-do/40 bg-do/10 px-5 py-2.5 font-serif text-xs sm:text-sm text-do hover:bg-do/20 transition-all flex items-center gap-1.5"
      >
        <span>🎗️</span> Treo dải lụa cầu an
      </button>
    </div>

    <p v-if="!canWaterToday" class="mt-2 text-center text-[11px] text-go/60 font-serif">
      (Mỗi ngày bạn chỉ cần tưới 1 lần để nuôi dưỡng tính kiên nhẫn. Hãy quay lại vào ngày mai nhé!)
    </p>

    <!-- Danh sách các dải lụa đã treo dưới gốc cây -->
    <div v-if="tree.ribbons.length > 0" class="mt-6 border-t border-dong/25 pt-4">
      <h4 class="font-serif text-sm font-semibold text-do mb-2 flex items-center gap-1.5">
        <span>🎗️</span> Các Dải Lụa Cầu An Dưới Gốc Cây ({{ tree.ribbons.length }})
      </h4>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div
          v-for="rib in tree.ribbons"
          :key="rib.id"
          @click="selectedRibbon = rib"
          class="flex-shrink-0 cursor-pointer rounded-xl border p-2.5 max-w-[200px] text-xs font-serif transition-all hover:scale-105 shadow-sm"
          :class="
            rib.color === 'red'
              ? 'border-do/40 bg-do/10 text-do'
              : rib.color === 'yellow'
              ? 'border-dong/50 bg-dong/15 text-go'
              : 'border-white bg-white/80 text-go'
          "
        >
          <div class="font-bold flex items-center gap-1">
            <span>{{ rib.color === 'red' ? '🔴' : rib.color === 'yellow' ? '🟡' : '⚪' }}</span>
            <span>{{ rib.author }}</span>
          </div>
          <p class="mt-1 line-clamp-2 italic opacity-85 text-[11px]">
            "{{ rib.wish }}"
          </p>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- MODAL TREO DẢI LỤA CẦU AN                                         -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="showRibbonModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="showRibbonModal = false"
      >
        <div class="w-full max-w-sm rounded-2xl border border-dong/40 bg-[#FAF6EE] p-6 text-[#3D2C1E] shadow-2xl animate-fade-up">
          <h4 class="font-serif text-lg font-bold text-do flex items-center gap-2">
            <span>🎗️</span> Treo Dải Lụa Cầu An
          </h4>
          <p class="mt-1 text-xs text-go/70 font-serif">
            Gửi gắm ước nguyện hướng thiện lên cành cây Bồ Đề tâm linh.
          </p>

          <!-- Chọn màu dải lụa -->
          <div class="mt-4">
            <label class="block text-xs font-serif text-do mb-1.5 font-semibold">Chọn sắc lụa:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="newColor = 'red'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="newColor === 'red' ? 'border-do bg-do text-kem font-bold' : 'border-do/30 bg-do/10 text-do'"
              >
                🔴 Lụa Đỏ<br /><span class="text-[10px] font-normal">Cầu bình an</span>
              </button>
              <button
                type="button"
                @click="newColor = 'yellow'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="newColor === 'yellow' ? 'border-dong bg-dong text-kem font-bold' : 'border-dong/40 bg-dong/15 text-go'"
              >
                🟡 Lụa Vàng<br /><span class="text-[10px] font-normal">Cầu trí tuệ</span>
              </button>
              <button
                type="button"
                @click="newColor = 'white'"
                class="rounded-xl border p-2 text-center text-xs font-serif transition-all"
                :class="newColor === 'white' ? 'border-go bg-white text-go font-bold' : 'border-go/30 bg-white/70 text-go'"
              >
                ⚪ Lụa Trắng<br /><span class="text-[10px] font-normal">Cầu thanh tịnh</span>
              </button>
            </div>
          </div>

          <!-- Lời ước nguyện -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-do mb-1 font-semibold">Lời nguyện lành:</label>
            <textarea
              v-model="newWish"
              rows="3"
              placeholder="Nguyện cầu cha mẹ khỏe mạnh, gia đình an vui, thân tâm an lạc..."
              class="w-full rounded-xl border border-dong/40 bg-white/70 p-2.5 text-xs text-go focus:border-do focus:outline-none font-serif"
            />
          </div>

          <!-- Tên người gửi -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-do mb-1 font-semibold">Tên bạn (hoặc ghi Con):</label>
            <input
              v-model="newAuthor"
              type="text"
              placeholder="Con / Ẩn danh / Họ tên"
              class="w-full rounded-xl border border-dong/40 bg-white/70 px-3 py-1.5 text-xs text-go focus:border-do focus:outline-none font-serif"
            />
          </div>

          <p v-if="ribbonError" class="mt-2 text-xs text-red-600 font-serif">
            {{ ribbonError }}
          </p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              @click="showRibbonModal = false"
              class="rounded-xl border border-go/20 px-4 py-1.5 text-xs font-serif text-go/70 hover:bg-go/10"
            >
              Hủy
            </button>
            <button
              @click="handleAddRibbon"
              class="btn-zen px-5 py-1.5 text-xs font-serif"
            >
              Treo lên cây
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ================================================================= -->
    <!-- MODAL ĐỔI TÊN CÂY BỒ ĐỀ                                          -->
    <!-- ================================================================= -->
    <div
      v-if="showRenameModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="showRenameModal = false"
    >
      <div class="w-full max-w-xs rounded-2xl border border-dong/40 bg-[#FAF6EE] p-5 text-[#3D2C1E] shadow-2xl">
        <h4 class="font-serif text-base font-bold text-do">Đổi Tên Cây Bồ Đề</h4>
        <input
          v-model="editName"
          type="text"
          class="mt-3 w-full rounded-xl border border-dong/40 bg-white px-3 py-2 text-xs text-go focus:border-do focus:outline-none font-serif"
        />
        <div class="mt-4 flex justify-end gap-2 text-xs font-serif">
          <button @click="showRenameModal = false" class="px-3 py-1 text-go/60">Hủy</button>
          <button @click="handleSaveName" class="btn-zen px-4 py-1">Lưu tên</button>
        </div>
      </div>
    </div>

    <!-- MODAL XEM CHI TIẾT DẢI LỤA -->
    <div
      v-if="selectedRibbon"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="selectedRibbon = null"
    >
      <div class="w-full max-w-sm rounded-2xl border border-dong/40 bg-[#FAF6EE] p-6 text-center text-[#3D2C1E] shadow-2xl">
        <span class="text-3xl">🎗️</span>
        <h4 class="mt-2 font-serif text-lg font-bold text-do">
          Dải Lụa Cầu An
        </h4>
        <p class="mt-0.5 text-xs text-go/60 font-serif">Người gửi: <b>{{ selectedRibbon.author }}</b></p>
        <p class="my-4 rounded-xl border border-dong/30 bg-dong/10 p-4 font-serif text-sm italic text-go leading-relaxed">
          "{{ selectedRibbon.wish }}"
        </p>
        <button @click="selectedRibbon = null" class="btn-zen px-6 py-1.5 text-xs font-serif">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>


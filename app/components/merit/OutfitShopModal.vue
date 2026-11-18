<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMeritSystem } from '~/composables/useMeritSystem'
import { useSound } from '~/composables/useSound'
import { OUTFITS_CATALOG, type OutfitItem, type OutfitType } from '~/three/avatarOutfits'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const {
  profile,
  setOutfit,
  toggleAccessory,
  unlockOutfit
} = useMeritSystem()

const { playBell } = useSound()

const currentTab = ref<'all' | 'robe' | 'accessory'>('all')
const selectedOutfitId = ref<string>(profile.currentOutfit || 'robe_lam')

const filteredOutfits = computed(() => {
  if (currentTab.value === 'all') return OUTFITS_CATALOG
  return OUTFITS_CATALOG.filter((item) => item.type === currentTab.value)
})

const selectedItem = computed<OutfitItem>(() => {
  return OUTFITS_CATALOG.find((o) => o.id === selectedOutfitId.value) || OUTFITS_CATALOG[0]
})

function isUnlocked(item: OutfitItem): boolean {
  if (item.cost === 0) return true
  return profile.unlockedOutfits.includes(item.id)
}

function isEquipped(item: OutfitItem): boolean {
  if (item.type === 'robe') {
    return profile.currentOutfit === item.id
  }
  return profile.activeAccessories?.includes(item.id) ?? false
}

function handleSelect(item: OutfitItem) {
  selectedOutfitId.value = item.id
}

function handleAction() {
  const item = selectedItem.value
  if (!item) return

  if (!isUnlocked(item)) {
    // Quy đổi
    if (profile.currentMerit >= item.cost) {
      const ok = unlockOutfit(item.id, item.cost)
      if (ok) {
        playBell()
      }
    }
  } else {
    // Đã sở hữu
    if (item.type === 'robe') {
      setOutfit(item.id)
    } else {
      toggleAccessory(item.id)
    }
  }
}
</script>

<template>
  <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#25170f] via-[#1a110a] to-[#120a06] border-2 border-[#e6b95c]/50 text-[#fbf6ec] shadow-[0_25px_80px_rgba(0,0,0,0.7)] flex flex-col p-4 sm:p-6">
    <!-- Hào quang nền mờ ảo -->
    <div class="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#ffd54f]/10 blur-3xl pointer-events-none" />
    <div class="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#ff9800]/10 blur-3xl pointer-events-none" />

    <!-- 1. HEADER -->
    <div class="relative z-10 flex items-center justify-between pb-3 border-b border-[#e6b95c]/30">
      <div class="flex items-center gap-3">
        <span class="text-3xl p-2 rounded-2xl bg-[#ffd54f]/15 border border-[#ffd54f]/30">
          👘
        </span>
        <div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300]">
            Pháp Y Các – Thiền Môn Y Phục
          </h2>
          <p class="text-xs text-[#cfbcaa]">
            Quy đổi pháp phục trang nghiêm & phụ kiện giải thoát bằng điểm công đức
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Điểm công đức khả dụng -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#e6b95c]/30">
          <span class="text-xs text-[#cbb8a3]">Công đức khả dụng:</span>
          <span class="font-serif font-bold text-amber-300 text-sm">
            {{ profile.currentMerit.toLocaleString('vi-VN') }}
          </span>
          <span class="text-[10px] text-amber-200">điểm</span>
        </div>

        <button
          class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10 text-sm"
          title="Đóng"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Thanh điểm trên mobile -->
    <div class="sm:hidden flex items-center justify-between py-2 px-3 my-2 rounded-xl bg-black/40 border border-[#e6b95c]/25 text-xs">
      <span class="text-[#cfbcaa]">Công đức khả dụng:</span>
      <span class="font-serif font-bold text-amber-300">
        {{ profile.currentMerit.toLocaleString('vi-VN') }} điểm
      </span>
    </div>

    <!-- 2. TABS BỘ LỌC -->
    <div class="relative z-10 flex items-center gap-2 mt-3 mb-4">
      <button
        @click="currentTab = 'all'"
        class="px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all border"
        :class="
          currentTab === 'all'
            ? 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 font-bold shadow-md'
            : 'bg-white/5 border-white/10 text-[#d8c7b5] hover:bg-white/10'
        "
      >
        Tất Cả ({{ OUTFITS_CATALOG.length }})
      </button>

      <button
        @click="currentTab = 'robe'"
        class="px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all border"
        :class="
          currentTab === 'robe'
            ? 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 font-bold shadow-md'
            : 'bg-white/5 border-white/10 text-[#d8c7b5] hover:bg-white/10'
        "
      >
        Pháp Phục (5)
      </button>

      <button
        @click="currentTab = 'accessory'"
        class="px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all border"
        :class="
          currentTab === 'accessory'
            ? 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 font-bold shadow-md'
            : 'bg-white/5 border-white/10 text-[#d8c7b5] hover:bg-white/10'
        "
      >
        Phụ Kiện Thiền Môn (2)
      </button>
    </div>

    <!-- 3. BODY CHÍNH: DANH SÁCH & PHÒNG THỬ ĐỒ -->
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto flex-1 pr-1">
      <!-- Cột Trái: Danh sách thẻ vật phẩm (7 cột trên desktop) -->
      <div class="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 auto-rows-max">
        <div
          v-for="item in filteredOutfits"
          :key="item.id"
          @click="handleSelect(item)"
          class="relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between"
          :class="[
            selectedOutfitId === item.id
              ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(255,213,79,0.25)]'
              : 'bg-black/30 border-white/10 hover:border-amber-500/30 hover:bg-white/5'
          ]"
        >
          <!-- Huy hiệu trạng thái góc trên -->
          <div class="flex items-start justify-between">
            <span class="text-3xl p-2 rounded-xl bg-black/40 border border-white/10">
              {{ item.badge }}
            </span>

            <div class="flex flex-col items-end gap-1">
              <span
                v-if="isEquipped(item)"
                class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 border border-green-400 text-green-300"
              >
                ✓ {{ item.type === 'robe' ? 'Đang mặc' : 'Đang đeo' }}
              </span>
              <span
                v-else-if="isUnlocked(item)"
                class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 border border-amber-400 text-amber-200"
              >
                Đã sở hữu
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 border border-white/20 text-[#cfbcaa]"
              >
                {{ item.cost }} điểm
              </span>
            </div>
          </div>

          <!-- Thông tin tên & phân loại -->
          <div class="mt-2.5">
            <h4 class="font-serif font-bold text-sm text-[#fdf8f0]">
              {{ item.name }}
            </h4>
            <p class="text-[11px] text-[#b8a796] line-clamp-1 mt-0.5">
              {{ item.tagline }}
            </p>
          </div>

          <!-- Dải màu & loại -->
          <div class="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span class="text-[#8e7f72]">
              {{ item.type === 'robe' ? 'Áo tràng' : 'Phụ kiện' }}
            </span>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full border border-white/30" :style="{ backgroundColor: item.colorHex }" />
              <span class="text-[#cfbcaa]">{{ item.colorHex }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Khung Xem Trước Chi Tiết (5 cột trên desktop) -->
      <div class="md:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-black/45 border border-[#e6b95c]/30 shadow-inner">
        <div>
          <!-- Vòng hào quang đại diện -->
          <div class="relative flex items-center justify-center my-3">
            <div
              class="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(255,213,79,0.35)] border-2 border-amber-300/40"
              :style="{ backgroundColor: selectedItem.colorHex + '33' }"
            >
              {{ selectedItem.badge }}
            </div>
          </div>

          <!-- Tên & Tagline -->
          <div class="text-center mb-3">
            <h3 class="font-serif text-lg font-bold text-amber-300">
              {{ selectedItem.name }}
            </h3>
            <p class="text-xs text-[#ddcbba] italic mt-0.5">
              "{{ selectedItem.tagline }}"
            </p>
          </div>

          <!-- Ý Nghĩa Tâm Linh -->
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 mb-3 text-xs leading-relaxed text-[#f0e4d5]">
            <div class="font-serif font-semibold text-amber-200 mb-1 flex items-center gap-1.5">
              <span>🌸</span>
              <span>Ý Nghĩa Thiền Môn:</span>
            </div>
            <p class="italic text-[#d9c8b7]">
              {{ selectedItem.spiritualMeaning }}
            </p>
          </div>

          <!-- Điểm Đặc Trưng Pháp Phục -->
          <div class="space-y-1.5 mb-4">
            <div class="text-[11px] font-semibold text-[#bcaaa0] uppercase tracking-wider">
              Chi Tiết Tạo Hình 3D:
            </div>
            <div
              v-for="(f, idx) in selectedItem.features"
              :key="idx"
              class="flex items-center gap-2 text-xs text-[#cfbcaa]"
            >
              <span class="text-amber-400 text-xs">✦</span>
              <span>{{ f }}</span>
            </div>
          </div>
        </div>

        <!-- Khung Hành Động Nút Bấm -->
        <div class="pt-3 border-t border-white/10">
          <!-- Trường hợp CHƯA SỞ HỮU -->
          <template v-if="!isUnlocked(selectedItem)">
            <button
              v-if="profile.currentMerit >= selectedItem.cost"
              @click="handleAction"
              class="w-full py-2.5 px-4 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-[#d9b969] via-[#ffe082] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span>Quy Đổi Pháp Phục (-{{ selectedItem.cost }} Điểm)</span>
            </button>
            <button
              v-else
              disabled
              class="w-full py-2.5 px-4 rounded-xl font-serif text-xs bg-white/10 text-white/40 cursor-not-allowed border border-white/5 flex items-center justify-center gap-2"
            >
              <span>🔒</span>
              <span>Chưa Đủ Công Đức (Thiếu {{ (selectedItem.cost - profile.currentMerit).toLocaleString('vi-VN') }} điểm)</span>
            </button>
          </template>

          <!-- Trường hợp ĐÃ SỞ HỮU -->
          <template v-else>
            <!-- Nếu là Áo -->
            <template v-if="selectedItem.type === 'robe'">
              <div
                v-if="isEquipped(selectedItem)"
                class="w-full py-2.5 px-4 rounded-xl font-serif text-xs bg-green-500/15 border border-green-500/30 text-green-300 text-center font-medium"
              >
                ✓ Đang Mặc Trên Người
              </div>
              <button
                v-else
                @click="handleAction"
                class="w-full py-2.5 px-4 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Khoác Áo Này Lên Người 🙏
              </button>
            </template>

            <!-- Nếu là Phụ Kiện -->
            <template v-else>
              <button
                @click="handleAction"
                class="w-full py-2.5 px-4 rounded-xl font-serif font-bold text-xs transition-all border"
                :class="
                  isEquipped(selectedItem)
                    ? 'bg-red-500/20 border-red-500/40 text-red-200 hover:bg-red-500/30'
                    : 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 hover:brightness-110'
                "
              >
                {{ isEquipped(selectedItem) ? 'Tháo Phụ Kiện Xuống' : 'Đeo Phụ Kiện Lên Người 📿' }}
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- 4. FOOTER -->
    <div class="relative z-10 mt-3 pt-2 border-t border-white/10 text-center text-[11px] text-[#a89582] italic">
      "Pháp phục thiền môn là y giải thoát, trang nghiêm thân tâm, nuôi lớn phước điền nơi chốn tịnh thổ." 🙏
    </div>
  </div>
</template>

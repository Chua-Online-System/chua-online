<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'open-action', action: string): void
}>()

const activeSheet = ref<'practice' | 'ecosystem' | null>(null)

function toggleSheet(sheet: 'practice' | 'ecosystem') {
  if (activeSheet.value === sheet) {
    activeSheet.value = null
  } else {
    activeSheet.value = sheet
  }
}

function handleAction(action: string) {
  activeSheet.value = null
  emit('open-action', action)
}
</script>

<template>
  <div class="sm:hidden">
    <!-- Bottom Sheet chọn nhanh khi bấm Tu Tập / Sinh Thái -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="activeSheet"
        class="fixed inset-x-0 bottom-16 z-40 rounded-t-2xl border-t border-dong/40 bg-kem/95 p-4 shadow-2xl backdrop-blur-md select-none"
      >
        <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-dong/40"></div>

        <!-- Sheet: Tu tập -->
        <div v-if="activeSheet === 'practice'" class="space-y-2">
          <p class="text-xs font-serif font-bold text-do mb-2 flex items-center gap-1.5">
            <span>📿</span> Chọn Hoạt Động Tu Tập
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="handleAction('beads')"
              class="flex items-center gap-2 rounded-xl border border-dong/30 bg-kem/70 p-2.5 text-left text-xs font-serif text-go hover:bg-dong/20"
            >
              <span class="text-xl">📿</span>
              <div>
                <b class="text-do block">Tràng Hạt</b>
                <span class="text-[10px] text-go/70">108 biến niệm</span>
              </div>
            </button>
            <button
              @click="handleAction('meditation')"
              class="flex items-center gap-2 rounded-xl border border-dong/30 bg-kem/70 p-2.5 text-left text-xs font-serif text-go hover:bg-dong/20"
            >
              <span class="text-xl">🧘</span>
              <div>
                <b class="text-do block">Toạ Thiền</b>
                <span class="text-[10px] text-go/70">Chuông bát 432Hz</span>
              </div>
            </button>
            <button
              @click="handleAction('sutras')"
              class="flex items-center gap-2 rounded-xl border border-dong/30 bg-kem/70 p-2.5 text-left text-xs font-serif text-go hover:bg-dong/20"
            >
              <span class="text-xl">📖</span>
              <div>
                <b class="text-do block">Kinh Điển</b>
                <span class="text-[10px] text-go/70">Tự cuộn trang</span>
              </div>
            </button>
            <button
              @click="handleAction('dharma')"
              class="flex items-center gap-2 rounded-xl border border-dong/30 bg-kem/70 p-2.5 text-left text-xs font-serif text-go hover:bg-dong/20"
            >
              <span class="text-xl">📜</span>
              <div>
                <b class="text-do block">Pháp Thoại</b>
                <span class="text-[10px] text-go/70">Lời Phật dạy</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Sheet: Sinh thái -->
        <div v-if="activeSheet === 'ecosystem'" class="space-y-2">
          <p class="text-xs font-serif font-bold text-do mb-2 flex items-center gap-1.5">
            <span>🌿</span> Không Gian Sinh Thái & Cảnh Quan
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="handleAction('fish')"
              class="flex items-center gap-2 rounded-xl border border-emerald-800/30 bg-emerald-950/5 p-2.5 text-left text-xs font-serif text-go hover:bg-emerald-900/10"
            >
              <span class="text-xl">🐟</span>
              <div>
                <b class="text-emerald-900 block">Hồ Cá Koi</b>
                <span class="text-[10px] text-go/70">Phóng sinh & cho ăn</span>
              </div>
            </button>
            <button
              @click="handleAction('bodhi')"
              class="flex items-center gap-2 rounded-xl border border-amber-800/30 bg-amber-950/5 p-2.5 text-left text-xs font-serif text-go hover:bg-amber-900/10"
            >
              <span class="text-xl">🌳</span>
              <div>
                <b class="text-amber-900 block">Vườn Bồ Đề</b>
                <span class="text-[10px] text-go/70">Tưới nước & treo lụa</span>
              </div>
            </button>
            <button
              @click="handleAction('lanterns')"
              class="flex items-center gap-2 rounded-xl border border-blue-900/30 bg-blue-950/5 p-2.5 text-left text-xs font-serif text-go hover:bg-blue-900/10"
            >
              <span class="text-xl">🪔</span>
              <div>
                <b class="text-blue-900 block">Thả Hoa Đăng</b>
                <span class="text-[10px] text-go/70">Sông đêm nguyện ước</span>
              </div>
            </button>
            <button
              @click="handleAction('lotus')"
              class="flex items-center gap-2 rounded-xl border border-pink-800/30 bg-pink-950/5 p-2.5 text-left text-xs font-serif text-go hover:bg-pink-900/10"
            >
              <span class="text-xl">🪷</span>
              <div>
                <b class="text-pink-900 block">Vườn Sen</b>
                <span class="text-[10px] text-go/70">Tặng đóa sen lành</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Backdrop mờ khi mở bottom sheet -->
    <div
      v-if="activeSheet"
      @click="activeSheet = null"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
    ></div>

    <!-- Thanh Bottom Navigation Bar cố định -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-dong/30 bg-kem/95 backdrop-blur-md shadow-2xl">
      <div class="flex items-center justify-around py-2">
        <!-- 1. Chánh điện / Trang chủ -->
        <NuxtLink
          to="/chua"
          @click="activeSheet = null"
          class="flex flex-col items-center justify-center text-center transition-colors px-2"
          active-class="text-do font-bold"
        >
          <span class="text-lg">⛩️</span>
          <span class="text-[10px] font-serif mt-0.5">Chánh Điện</span>
        </NuxtLink>

        <!-- 2. Bản đồ 2.5D -->
        <button
          @click="handleAction('map')"
          class="flex flex-col items-center justify-center text-center transition-colors px-2 text-go/80 hover:text-do"
        >
          <span class="text-lg">🗺️</span>
          <span class="text-[10px] font-serif mt-0.5">Bản Đồ</span>
        </button>

        <!-- 3. Tu tập (Drawer trigger) -->
        <button
          @click="toggleSheet('practice')"
          class="flex flex-col items-center justify-center text-center transition-colors px-2"
          :class="activeSheet === 'practice' ? 'text-do font-bold' : 'text-go/80 hover:text-do'"
        >
          <span class="text-lg">📿</span>
          <span class="text-[10px] font-serif mt-0.5">Tu Tập</span>
        </button>

        <!-- 4. Sinh thái (Drawer trigger) -->
        <button
          @click="toggleSheet('ecosystem')"
          class="flex flex-col items-center justify-center text-center transition-colors px-2"
          :class="activeSheet === 'ecosystem' ? 'text-do font-bold' : 'text-go/80 hover:text-do'"
        >
          <span class="text-lg">🌿</span>
          <span class="text-[10px] font-serif mt-0.5">Sinh Thái</span>
        </button>

        <!-- 5. Nhật ký cá nhân -->
        <button
          @click="handleAction('journal')"
          class="flex flex-col items-center justify-center text-center transition-colors px-2 text-go/80 hover:text-do"
        >
          <span class="text-lg">🏮</span>
          <span class="text-[10px] font-serif mt-0.5">Nhật Ký</span>
        </button>
      </div>
    </nav>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useTempleTheme } from '~/composables/useTempleTheme'
import { usePracticeJournal } from '~/composables/usePracticeJournal'
import { useZenTheme } from '~/composables/useZenTheme'
import { getTodayQuote } from '~/data/dharmaQuotes'

import BeadCounter from '~/components/practice/BeadCounter.vue'
import ZenMeditation from '~/components/practice/ZenMeditation.vue'
import SutraReader from '~/components/practice/SutraReader.vue'
import DailyDharmaModal from '~/components/practice/DailyDharmaModal.vue'
import PracticeJournalModal from '~/components/profile/PracticeJournalModal.vue'

import FishPondCanvas from '~/components/ecosystem/FishPondCanvas.vue'
import BodhiGarden from '~/components/ecosystem/BodhiGarden.vue'
import LanternRiver from '~/components/ecosystem/LanternRiver.vue'
import LotusBlessingModal from '~/components/ecosystem/LotusBlessingModal.vue'
import TempleMapModal from '~/components/navigation/TempleMapModal.vue'
import MobileBottomNav from '~/components/navigation/MobileBottomNav.vue'
import PracticeHallModal from '~/components/practice/PracticeHallModal.vue'

const { current } = useTempleTheme()
const { streak } = usePracticeJournal()
const { isNightMode, isFullscreen, toggleNightMode, toggleFullscreen } = useZenTheme()

const todayQuote = getTodayQuote()

// Trạng thái mở các Modal tu tập & sinh thái
const activeModal = ref<
  'practice' | 'beads' | 'meditation' | 'sutras' | 'dharma' | 'journal' | 'fish' | 'bodhi' | 'lanterns' | 'lotus' | 'map' | null
>(null)

function openModal(modal: 'practice' | 'beads' | 'meditation' | 'sutras' | 'dharma' | 'journal' | 'fish' | 'bodhi' | 'lanterns' | 'lotus' | 'map') {
  activeModal.value = modal
}

function closeModal() {
  activeModal.value = null
}

function handleMapZoneSelect(action: string) {
  if (action === 'modal_fish') openModal('fish')
  else if (action === 'modal_bodhi') openModal('bodhi')
  else if (action === 'modal_lanterns') openModal('lanterns')
  else if (action === 'modal_lotus') openModal('lotus')
  else if (action === 'modal_practice') openModal('practice')
  else if (action === 'modal_beads') openModal('beads')
  else if (action === 'modal_meditation') openModal('meditation')
  else if (action === 'modal_sutras') openModal('sutras')
  else closeModal()
}

function handleMobileNavAction(action: string) {
  if (action === 'map') openModal('map')
  else if (action === 'journal') openModal('journal')
  else if (action === 'beads') openModal('beads')
  else if (action === 'meditation') openModal('meditation')
  else if (action === 'sutras') openModal('sutras')
  else if (action === 'dharma') openModal('dharma')
  else if (action === 'fish') openModal('fish')
  else if (action === 'bodhi') openModal('bodhi')
  else if (action === 'lanterns') openModal('lanterns')
  else if (action === 'lotus') openModal('lotus')
}
</script>

<template>
  <main class="relative min-h-screen pb-24">
    <!-- Thanh trên -->
    <header class="sticky top-0 z-30 border-b border-dong/20 bg-kem/85 backdrop-blur-md">
      <div class="container-zen flex items-center justify-between py-3.5">
        <NuxtLink to="/" class="flex items-center gap-2 font-serif text-lg text-do">
          <span class="text-2xl glow-icon">☸</span> Đi Chùa Online
        </NuxtLink>

        <!-- Nút tiện ích trên thanh điều hướng -->
        <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <!-- Nút Bản đồ chùa -->
          <button
            @click="openModal('map')"
            class="flex items-center gap-1.5 rounded-full border border-dong/50 bg-kem px-3 py-1 text-do hover:bg-dong/20 transition-colors shadow-sm font-serif"
            title="Bản đồ toàn cảnh chùa"
          >
            <span>🗺️</span>
            <span class="hidden sm:inline">Bản đồ</span>
          </button>

          <!-- Nút mở Pháp thoại -->
          <button
            @click="openModal('dharma')"
            class="flex items-center gap-1.5 rounded-full border border-dong/40 bg-kem px-3 py-1 text-go hover:border-do transition-colors"
            title="Pháp thoại mỗi ngày"
          >
            <span>📜</span>
            <span class="hidden sm:inline">Pháp thoại</span>
          </button>

          <!-- Nút mở Nhật ký tu tập với badge streak -->
          <button
            @click="openModal('journal')"
            class="flex items-center gap-1.5 rounded-full border border-dong/50 bg-dong/15 px-3 py-1 font-serif text-do hover:bg-dong/25 transition-all shadow-sm"
            title="Nhật ký tu tập & Hồi hướng"
          >
            <span>🏮</span>
            <span>Nhật ký</span>
            <span v-if="streak > 0" class="rounded-full bg-do px-1.5 py-0.2 text-[10px] text-kem font-bold">
              {{ streak }}d
            </span>
          </button>

          <!-- Link sang 3D -->
          <NuxtLink
            to="/hanh-huong"
            class="hidden sm:flex items-center gap-1 rounded-full border border-dong/30 px-3 py-1 text-go/70 hover:text-do hover:border-do transition-colors"
          >
            <span>🏔️</span> Chùa 3D
          </NuxtLink>

          <!-- Nút Chế độ Thiền Đêm dịu mắt -->
          <button
            @click="toggleNightMode"
            class="flex items-center justify-center h-8 w-8 rounded-full border border-dong/40 bg-kem text-go hover:bg-dong/20 transition-all text-sm"
            :title="isNightMode ? 'Chuyển sang chế độ ban ngày' : 'Bật chế độ thiền đêm dịu mắt'"
          >
            <span>{{ isNightMode ? '☀️' : '🌙' }}</span>
          </button>

          <!-- Nút Toàn màn hình tịnh tâm -->
          <button
            @click="toggleFullscreen"
            class="hidden md:flex items-center justify-center h-8 w-8 rounded-full border border-dong/40 bg-kem text-go hover:bg-dong/20 transition-all text-xs"
            :title="isFullscreen ? 'Thu nhỏ màn hình' : 'Toàn màn hình tịnh tâm'"
          >
            <span>{{ isFullscreen ? '⤓' : '⛶' }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="container-zen pt-8 sm:pt-10">
      <div class="text-center animate-fade-up">
        <p class="eyebrow">Chánh điện trực tuyến</p>
        <h1 class="mt-2 text-4xl text-do sm:text-5xl font-serif">Không Gian Tịnh Tâm</h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-go/75">
          Hãy để lòng lắng lại giữa chốn thiền môn. Chọn một hoạt động tu tập để bắt đầu hành trình an yên của bạn.
        </p>
      </div>

      <!-- Banner Pháp Thoại Hôm Nay (Nhẹ nhàng, thư thái) -->
      <div class="mx-auto mt-6 max-w-3xl rounded-2xl border border-dong/30 bg-gradient-to-r from-dong/10 via-kem to-dong/10 p-4 sm:p-5 shadow-sm">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div class="flex items-center gap-3">
            <span class="text-2xl sm:text-3xl">🪷</span>
            <div>
              <p class="text-[11px] font-serif uppercase tracking-wider text-do font-semibold">Lời Phật Dạy Hôm Nay</p>
              <p class="font-serif text-sm italic text-go/90 line-clamp-1 mt-0.5">
                "{{ todayQuote.quote }}"
              </p>
            </div>
          </div>
          <button
            @click="openModal('dharma')"
            class="whitespace-nowrap rounded-full border border-dong/50 bg-kem px-3.5 py-1 text-xs font-serif text-do hover:bg-dong/15 transition-all shadow-sm"
          >
            Chiêm bái & Lưu ảnh ➔
          </button>
        </div>
      </div>

      <!-- 4 Hoạt động Tu Tập & Nhiếp Tâm (PHASE 1) -->
      <div class="mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-serif text-xl sm:text-2xl text-do flex items-center gap-2">
            <span>📿</span> Hoạt Động Tu Tập & Tịnh Tâm
          </h2>
          <button
            @click="openModal('journal')"
            class="text-xs text-go/70 hover:text-do font-serif underline"
          >
            Xem nhật ký cá nhân ➔
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- 1. Tràng hạt 108 biến -->
          <div
            @click="openModal('beads')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">📿</span>
              <span class="rounded-full bg-dong/20 px-2 py-0.5 text-[10px] font-serif text-do font-medium">108 biến</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Tràng Hạt Niệm Phật
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Lần chuỗi tràng hạt 108 hạt, tiếng mõ gõ trầm ấm và rung phản hồi trên tay.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-do font-serif font-medium">
              <span>Bắt đầu lần hạt</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 2. Toạ thiền định Zen -->
          <div
            @click="openModal('meditation')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🧘</span>
              <span class="rounded-full bg-dong/20 px-2 py-0.5 text-[10px] font-serif text-do font-medium">3 - 30 phút</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Toạ Thiền Định Zen
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Đồng hồ thiền đếm ngược, chuông bát ngân vang và vòng thở hướng dẫn hít - thở.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-do font-serif font-medium">
              <span>Bước vào thời thiền</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 3. Đọc kinh điển toàn văn -->
          <div
            @click="openModal('sutras')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">📖</span>
              <span class="rounded-full bg-dong/20 px-2 py-0.5 text-[10px] font-serif text-do font-medium">Tự cuộn</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Thư Viện Kinh Điển
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Chú Đại Bi 84 câu, Bát Nhã Tâm Kinh chữ lớn, tự động cuộn chữ và nhịp mõ.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-do font-serif font-medium">
              <span>Đọc kinh trang nghiêm</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 4. Nhật ký tu tập & Hồi hướng -->
          <div
            @click="openModal('journal')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group bg-gradient-to-b from-kem to-dong/15"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🏮</span>
              <span class="rounded-full bg-do/15 px-2 py-0.5 text-[10px] font-serif text-do font-medium">
                {{ streak }} ngày tịnh
              </span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Nhật Ký & Hồi Hướng
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Theo dõi chuỗi ngày tu tập, lịch hoa sen và ghi chép lời hồi hướng công đức.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-do font-serif font-medium">
              <span>Xem tiến trình tu tập</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Khu Vực Sinh Thái & Cảnh Quan (MỚI - PHASE 2) -->
      <div class="mt-10">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-serif text-xl sm:text-2xl text-do flex items-center gap-2">
            <span>🌿</span> Không Gian Sinh Thái & Cảnh Quan Chùa
          </h2>
          <NuxtLink
            to="/ban-do"
            class="text-xs text-go/70 hover:text-do font-serif underline flex items-center gap-1"
          >
            <span>Mở toàn cảnh bản đồ</span>
            <span>➔</span>
          </NuxtLink>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- 1. Hồ cá Koi phóng sinh Canvas 2D -->
          <div
            @click="openModal('fish')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group border-emerald-800/30 bg-gradient-to-b from-kem to-emerald-950/10"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🐟</span>
              <span class="rounded-full bg-emerald-700/20 px-2 py-0.5 text-[10px] font-serif text-emerald-800 font-bold">Canvas 2D</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Hồ Cá Phóng Sinh
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Đàn cá Koi bơi lội mềm mại, phóng sinh cá ảo gửi lời chúc lành và rắc mồi nuôi cá lớn theo ngày.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-emerald-800 font-serif font-medium">
              <span>Thăm hồ cá Koi</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 2. Vườn Bồ Đề Tâm -->
          <div
            @click="openModal('bodhi')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group border-amber-800/30 bg-gradient-to-b from-kem to-amber-950/10"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🌳</span>
              <span class="rounded-full bg-amber-700/20 px-2 py-0.5 text-[10px] font-serif text-amber-900 font-bold">5 giai đoạn</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Vườn Bồ Đề Tâm
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Gieo mầm cây Bồ Đề của riêng bạn, tưới nước nuôi dưỡng mỗi ngày và treo dải lụa nguyện ước.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-amber-900 font-serif font-medium">
              <span>Chăm sóc cây Bồ Đề</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 3. Bến Thả Hoa Đăng Sông Đêm -->
          <div
            @click="openModal('lanterns')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group border-blue-900/30 bg-gradient-to-b from-kem to-blue-950/10"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🪔</span>
              <span class="rounded-full bg-blue-700/20 px-2 py-0.5 text-[10px] font-serif text-blue-900 font-bold">Sông đêm</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Bến Thả Hoa Đăng
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Thắp nến thả hoa đăng bồng bềnh trôi trên mặt nước đêm trăng và chiêm ngưỡng lời nguyện của mọi người.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-blue-900 font-serif font-medium">
              <span>Thả đóa hoa đăng</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>

          <!-- 4. Vườn Hoa Sen Phước Lành (Tặng sen) -->
          <div
            @click="openModal('lotus')"
            class="card-zen p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-do hover:shadow-lg group border-pink-900/30 bg-gradient-to-b from-kem to-pink-950/10"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl glow-icon group-hover:scale-110 transition-transform">🪷</span>
              <span class="rounded-full bg-pink-700/20 px-2 py-0.5 text-[10px] font-serif text-pink-900 font-bold">Tặng sen</span>
            </div>
            <h3 class="mt-3 font-serif text-lg font-semibold text-do">
              Vườn Sen Phước Lành
            </h3>
            <p class="mt-1 text-xs text-go/70 leading-relaxed">
              Dâng đóa sen bạch, hồng, kim liên; gửi gắm lời nguyện an lành và xuất thiệp sen trao tặng người thân.
            </p>
            <div class="mt-4 flex items-center gap-1 text-xs text-pink-900 font-serif font-medium">
              <span>Trao tặng đóa sen</span>
              <span class="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </div>
        </div>
      </div>

      <LotusDivider class="my-10" />

      <!-- Lịch âm + chọn không gian chùa -->
      <div class="grid gap-6 lg:grid-cols-2">
        <LunarCalendar />
        <TempleThemeSwitcher />
      </div>

      <!-- Thắp nhang + Rung chuông -->
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <IncenseBurner />
        <TempleBell />
      </div>

      <!-- Tụng kinh chạy chữ theo nhịp mõ (bản gốc) -->
      <div class="mt-6">
        <SutraChanting />
      </div>

      <!-- Xin xăm + Xin keo -->
      <div class="mt-6">
        <FortuneStick />
      </div>
      <div class="mt-6">
        <KeoDivination />
      </div>

      <!-- Cầu an & Sổ vàng -->
      <div class="mt-6">
        <PrayerBook />
      </div>

      <LotusDivider class="my-12" />
      <p class="text-center text-sm text-go/50 font-serif">
        🙏 Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sinh, đều trọn thành Phật đạo.
      </p>
    </div>

    <!-- Nhạc nền thiền (nút nổi) -->
    <ClientOnly>
      <MusicToggle />
    </ClientOnly>

    <!-- ================================================================= -->
    <!-- CÁC MODAL TƯƠNG TÁC TU TẬP & SINH THÁI                            -->
    <!-- ================================================================= -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="w-full max-w-3xl my-auto animate-fade-up">
          <PracticeHallModal v-if="activeModal === 'practice'" @close="closeModal" />

          <!-- Phase 1 Modals -->
          <BeadCounter v-else-if="activeModal === 'beads'" @close="closeModal" />
          <ZenMeditation v-else-if="activeModal === 'meditation'" @close="closeModal" />
          <SutraReader v-else-if="activeModal === 'sutras'" @close="closeModal" />
          <DailyDharmaModal v-else-if="activeModal === 'dharma'" @close="closeModal" />
          <PracticeJournalModal v-else-if="activeModal === 'journal'" @close="closeModal" />

          <!-- Phase 2 Modals -->
          <FishPondCanvas v-else-if="activeModal === 'fish'" @close="closeModal" />
          <BodhiGarden v-else-if="activeModal === 'bodhi'" @close="closeModal" />
          <LanternRiver v-else-if="activeModal === 'lanterns'" @close="closeModal" />
          <LotusBlessingModal v-else-if="activeModal === 'lotus'" @close="closeModal" />
          <TempleMapModal v-else-if="activeModal === 'map'" @close="closeModal" @select-zone="handleMapZoneSelect" />
        </div>
      </div>
    </transition>

    <!-- Thanh điều hướng cố định mép dưới cho Mobile -->
    <ClientOnly>
      <MobileBottomNav @open-action="handleMobileNavAction" />
    </ClientOnly>
  </main>
</template>

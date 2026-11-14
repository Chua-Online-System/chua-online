<script setup lang="ts">
import { ref } from 'vue'
import TempleMapModal from '~/components/navigation/TempleMapModal.vue'
import FishPondCanvas from '~/components/ecosystem/FishPondCanvas.vue'
import BodhiGarden from '~/components/ecosystem/BodhiGarden.vue'
import LanternRiver from '~/components/ecosystem/LanternRiver.vue'
import BeadCounter from '~/components/practice/BeadCounter.vue'
import ZenMeditation from '~/components/practice/ZenMeditation.vue'
import SutraReader from '~/components/practice/SutraReader.vue'
import DailyDharmaModal from '~/components/practice/DailyDharmaModal.vue'
import PracticeJournalModal from '~/components/profile/PracticeJournalModal.vue'
import LotusBlessingModal from '~/components/ecosystem/LotusBlessingModal.vue'
import PracticeHallModal from '~/components/practice/PracticeHallModal.vue'

const router = useRouter()

const activeSubModal = ref<'practice' | 'fish' | 'bodhi' | 'lanterns' | 'lotus' | 'beads' | 'meditation' | 'sutras' | 'journal' | null>(null)
const practiceTab = ref<'beads' | 'meditation' | 'sutras' | 'dharma'>('beads')

function handleSelectZone(action: string) {
  if (action === 'modal_fish') {
    activeSubModal.value = 'fish'
  } else if (action === 'modal_bodhi') {
    activeSubModal.value = 'bodhi'
  } else if (action === 'modal_lanterns') {
    activeSubModal.value = 'lanterns'
  } else if (action === 'modal_lotus') {
    activeSubModal.value = 'lotus'
  } else if (action === 'modal_practice') {
    practiceTab.value = 'beads'
    activeSubModal.value = 'practice'
  } else if (action === 'modal_beads') {
    practiceTab.value = 'beads'
    activeSubModal.value = 'practice'
  } else if (action === 'modal_meditation') {
    practiceTab.value = 'meditation'
    activeSubModal.value = 'practice'
  } else if (action === 'modal_sutras') {
    practiceTab.value = 'sutras'
    activeSubModal.value = 'practice'
  } else if (action === 'route_chua' || action === 'modal_incense' || action === 'modal_bell' || action === 'modal_fortune') {
    router.push('/chua')
  } else if (action === 'route_3d') {
    router.push('/hanh-huong')
  }
}
</script>

<template>
  <main class="relative min-h-screen bg-[#F5EFE0] pb-16">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-dong/20 bg-kem/85 backdrop-blur-md">
      <div class="container-zen flex items-center justify-between py-3.5">
        <NuxtLink to="/" class="flex items-center gap-2 font-serif text-lg text-do">
          <span class="text-2xl glow-icon">☸</span> Đi Chùa Online
        </NuxtLink>

        <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-serif">
          <NuxtLink
            to="/chua"
            class="rounded-full border border-dong/40 bg-kem px-3.5 py-1 text-do hover:bg-dong/15 transition-colors"
          >
            🪷 Chánh điện
          </NuxtLink>
          <NuxtLink
            to="/hanh-huong"
            class="rounded-full border border-dong/30 px-3 py-1 text-go/70 hover:text-do hover:border-do transition-colors"
          >
            🏔️ Chùa 3D
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="container-zen pt-6 sm:pt-8">
      <div class="text-center mb-6 animate-fade-up">
        <p class="eyebrow">Toàn cảnh danh lam</p>
        <h1 class="mt-1 text-3xl sm:text-4xl font-serif text-do font-bold">
          Bản Đồ Quần Thể Chùa Online
        </h1>
        <p class="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-go/75 font-serif">
          Từ Cổng Tam Quan, Hồ Phóng Sinh, Vườn Bồ Đề đến Đại Điện Tam Bảo — hãy chạm vào từng khu vực để dạo bước chiêm bái.
        </p>
      </div>

      <!-- Bản đồ tương tác chính -->
      <div class="mx-auto max-w-5xl">
        <TempleMapModal @select-zone="handleSelectZone" />
      </div>
    </div>

    <!-- Nhạc nền thiền -->
    <ClientOnly>
      <MusicToggle />
    </ClientOnly>

    <!-- Modal con tương tác khi click từ bản đồ -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="activeSubModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="activeSubModal = null"
      >
        <div class="w-full max-w-3xl my-auto animate-fade-up">
          <PracticeHallModal v-if="activeSubModal === 'practice'" :initial-tab="practiceTab" @close="activeSubModal = null" />
          <FishPondCanvas v-else-if="activeSubModal === 'fish'" @close="activeSubModal = null" />
          <BodhiGarden v-else-if="activeSubModal === 'bodhi'" @close="activeSubModal = null" />
          <LanternRiver v-else-if="activeSubModal === 'lanterns'" @close="activeSubModal = null" />
          <LotusBlessingModal v-else-if="activeSubModal === 'lotus'" @close="activeSubModal = null" />
          <BeadCounter v-else-if="activeSubModal === 'beads'" @close="activeSubModal = null" />
          <ZenMeditation v-else-if="activeSubModal === 'meditation'" @close="activeSubModal = null" />
          <SutraReader v-else-if="activeSubModal === 'sutras'" @close="activeSubModal = null" />
        </div>
      </div>
    </transition>
  </main>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import BeadCounter from '~/components/practice/BeadCounter.vue'
import ZenMeditation from '~/components/practice/ZenMeditation.vue'
import SutraReader from '~/components/practice/SutraReader.vue'
import DailyDharmaModal from '~/components/practice/DailyDharmaModal.vue'

const props = withDefaults(
  defineProps<{
    initialTab?: 'beads' | 'meditation' | 'sutras' | 'dharma'
  }>(),
  {
    initialTab: 'beads'
  }
)

const emit = defineEmits<{ (e: 'close'): void }>()

const activeTab = ref<'beads' | 'meditation' | 'sutras' | 'dharma'>(props.initialTab)

watch(
  () => props.initialTab,
  (val) => {
    if (val) activeTab.value = val
  }
)
</script>

<template>
  <div class="card-zen relative max-h-[92vh] overflow-y-auto p-0 border border-dong/40 shadow-2xl bg-gradient-to-b from-[#FAF6EE] to-[#EFE4D0] text-[#3D2C1E] rounded-2xl">
    <!-- Header: Nhà Tụng Kinh & Thiền Môn -->
    <div class="sticky top-0 z-20 border-b border-dong/25 bg-kem/95 px-5 py-3.5 backdrop-blur-md">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl glow-icon">📿</span>
          <div>
            <h3 class="font-serif text-lg font-bold sm:text-xl text-do">
              Nhà Tụng Kinh & Thiền Môn
            </h3>
            <p class="text-[11px] text-go/70 font-serif">
              Không gian công phu tu tập, nhiếp tâm niệm Phật và lắng nghe tiếng chuông thiền
            </p>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-dong/15 text-go hover:bg-dong/30 transition-colors"
          title="Đóng"
        >
          ✕
        </button>
      </div>

      <!-- Thanh chọn 4 Hoạt động Tu Tập -->
      <div class="mt-3 flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
        <button
          @click="activeTab = 'beads'"
          class="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-serif transition-all"
          :class="
            activeTab === 'beads'
              ? 'bg-do text-kem font-bold shadow-glow'
              : 'border border-dong/30 bg-kem/60 text-go hover:bg-dong/20'
          "
        >
          <span>📿</span>
          <span>Tràng Hạt 108</span>
        </button>

        <button
          @click="activeTab = 'meditation'"
          class="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-serif transition-all"
          :class="
            activeTab === 'meditation'
              ? 'bg-do text-kem font-bold shadow-glow'
              : 'border border-dong/30 bg-kem/60 text-go hover:bg-dong/20'
          "
        >
          <span>🧘</span>
          <span>Toạ Thiền Zen</span>
        </button>

        <button
          @click="activeTab = 'sutras'"
          class="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-serif transition-all"
          :class="
            activeTab === 'sutras'
              ? 'bg-do text-kem font-bold shadow-glow'
              : 'border border-dong/30 bg-kem/60 text-go hover:bg-dong/20'
          "
        >
          <span>📖</span>
          <span>Kinh Điển Cuộn Chữ</span>
        </button>

        <button
          @click="activeTab = 'dharma'"
          class="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-serif transition-all"
          :class="
            activeTab === 'dharma'
              ? 'bg-do text-kem font-bold shadow-glow'
              : 'border border-dong/30 bg-kem/60 text-go hover:bg-dong/20'
          "
        >
          <span>📜</span>
          <span>Lời Phật Dạy</span>
        </button>
      </div>
    </div>

    <!-- Nội dung hoạt động đang chọn -->
    <div class="p-2 sm:p-4">
      <BeadCounter v-if="activeTab === 'beads'" @close="emit('close')" />
      <ZenMeditation v-else-if="activeTab === 'meditation'" @close="emit('close')" />
      <SutraReader v-else-if="activeTab === 'sutras'" @close="emit('close')" />
      <DailyDharmaModal v-else-if="activeTab === 'dharma'" @close="emit('close')" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  useMeritSystem,
  type LeaderboardEntry,
  type TempleContribution,
  MERIT_TIERS
} from '~/composables/useMeritSystem'
import { getOutfitById } from '~/three/avatarOutfits'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  profile,
  getLeaderboard,
  TEMPLE_CONTRIBUTIONS_SEED
} = useMeritSystem()

const activeTab = ref<'leaderboard' | 'contributions'>('leaderboard')
const loading = ref(true)
const entries = ref<LeaderboardEntry[]>([])

onMounted(async () => {
  loading.value = true
  try {
    entries.value = await getLeaderboard()
  } finally {
    loading.value = false
  }
})

const top3 = computed(() => entries.value.slice(0, 3))
const remainingList = computed(() => entries.value.slice(3))

const myRankEntry = computed(() => {
  return entries.value.find((e) => e.isCurrentUser)
})

function getTierBadge(tierNumber: number): string {
  const t = MERIT_TIERS.find((x) => x.tier === tierNumber)
  return t ? `${t.badge} ${t.title}` : '🌿 Sơ Tâm'
}

function getRobeBadge(outfitId: string): string {
  const def = getOutfitById(outfitId)
  return def ? `${def.badge} ${def.name}` : '👘 Áo Lam'
}
</script>

<template>
  <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#25170f] via-[#1a110a] to-[#120a06] border-2 border-[#e6b95c]/50 text-[#fbf6ec] shadow-[0_25px_80px_rgba(0,0,0,0.7)] flex flex-col p-4 sm:p-6">
    <!-- Hào quang nền mờ ảo -->
    <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#ffd54f]/10 blur-3xl pointer-events-none" />
    <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#ba68c8]/10 blur-3xl pointer-events-none" />

    <!-- 1. HEADER -->
    <div class="relative z-10 flex items-center justify-between pb-3 border-b border-[#e6b95c]/30">
      <div class="flex items-center gap-3">
        <span class="text-3xl p-2 rounded-2xl bg-[#ffd54f]/15 border border-[#ffd54f]/30">
          🏆
        </span>
        <div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300]">
            Bảng Vàng Công Đức – Tôn Vinh Tinh Tấn
          </h2>
          <p class="text-xs text-[#cfbcaa]">
            Tuyên dương các phật tử tinh tấn tu tập và hộ trì Tam Bảo chốn thiền môn
          </p>
        </div>
      </div>

      <button
        class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors border border-white/10 text-sm"
        title="Đóng"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <!-- 2. TABS CHỌN BẢNG -->
    <div class="relative z-10 flex items-center gap-2 mt-3 mb-4">
      <button
        @click="activeTab = 'leaderboard'"
        class="px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all border flex items-center gap-1.5"
        :class="
          activeTab === 'leaderboard'
            ? 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 font-bold shadow-md'
            : 'bg-white/5 border-white/10 text-[#d8c7b5] hover:bg-white/10'
        "
      >
        <span>🌟</span>
        <span>Bảng Vàng Tinh Tấn (Top Công Đức)</span>
      </button>

      <button
        @click="activeTab = 'contributions'"
        class="px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all border flex items-center gap-1.5"
        :class="
          activeTab === 'contributions'
            ? 'bg-gradient-to-r from-[#d9b969] to-[#b4863f] text-[#2a1708] border-amber-300 font-bold shadow-md'
            : 'bg-white/5 border-white/10 text-[#d8c7b5] hover:bg-white/10'
        "
      >
        <span>🪷</span>
        <span>Tấm Lòng Vàng Tu Bổ Chùa</span>
      </button>
    </div>

    <!-- 3. BODY NỘI DUNG CUỘN ĐƯỢC -->
    <div class="relative z-10 overflow-y-auto flex-1 pr-1 space-y-4">
      <!-- ================= TAB 1: BẢNG XẾP HẠNG CÔNG ĐỨC ================= -->
      <div v-if="activeTab === 'leaderboard'" class="space-y-4">
        <!-- Đang tải -->
        <div v-if="loading" class="text-center py-12 text-sm text-[#cfbcaa]">
          Đang thỉnh bảng vàng công đức... 🙏
        </div>

        <template v-else>
          <!-- PODIUM TOP 3 (1ST, 2ND, 3RD) -->
          <div v-if="top3.length" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <!-- Hạng 2 (Bạc) -->
            <div
              v-if="top3[1]"
              class="order-2 sm:order-1 p-3.5 rounded-2xl bg-gradient-to-b from-[#2e2b29] to-[#1c1a19] border border-gray-400/40 flex flex-col items-center text-center relative shadow-lg"
              :class="{ 'ring-2 ring-amber-400': top3[1].isCurrentUser }"
            >
              <div class="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-300 text-slate-900 font-serif font-bold text-xs shadow">
                🥈 Hạng Nhì
              </div>
              <div class="w-14 h-14 rounded-full bg-slate-400/20 border-2 border-slate-300 flex items-center justify-center text-2xl my-2 shadow-[0_0_15px_rgba(203,213,225,0.4)]">
                {{ top3[1].tier >= 5 ? '🌌' : top3[1].tier >= 4 ? '🪷' : '✨' }}
              </div>
              <h4 class="font-serif font-bold text-sm text-slate-100 flex items-center gap-1">
                <span>{{ top3[1].dharmaName }}</span>
                <span v-if="top3[1].isCurrentUser" class="text-[10px] text-amber-300 font-sans">(Bạn)</span>
              </h4>
              <span class="text-[11px] text-slate-300 mt-0.5">
                {{ getTierBadge(top3[1].tier) }}
              </span>
              <div class="mt-2 py-1 px-3 rounded-xl bg-black/40 border border-slate-400/30 w-full">
                <span class="font-serif font-bold text-slate-200 text-base">
                  {{ top3[1].totalMerit.toLocaleString('vi-VN') }}
                </span>
                <span class="text-xs text-slate-400 ml-1">điểm</span>
                <div class="text-[10px] text-orange-300">🔥 {{ top3[1].streakDays }} ngày tinh tấn</div>
              </div>
            </div>

            <!-- Hạng 1 (Vàng - Trung Tâm) -->
            <div
              v-if="top3[0]"
              class="order-1 sm:order-2 p-4 rounded-2xl bg-gradient-to-b from-[#4a3416] via-[#2a1c0d] to-[#1c1208] border-2 border-[#ffd54f]/70 flex flex-col items-center text-center relative shadow-2xl scale-100 sm:scale-105 z-10"
              :class="{ 'ring-2 ring-amber-300': top3[0].isCurrentUser }"
            >
              <div class="absolute -top-4 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#ffe082] to-[#ffd54f] text-[#2a1708] font-serif font-bold text-xs shadow-md">
                👑 Quán Quân
              </div>
              <div class="w-16 h-16 rounded-full bg-[#ffd54f]/25 border-2 border-[#ffd54f] flex items-center justify-center text-3xl my-2 shadow-[0_0_25px_rgba(255,213,79,0.7)] animate-pulse">
                {{ top3[0].tier >= 5 ? '🌌' : '🪷' }}
              </div>
              <h4 class="font-serif font-bold text-base text-[#fff9c4] flex items-center gap-1">
                <span>{{ top3[0].dharmaName }}</span>
                <span v-if="top3[0].isCurrentUser" class="text-xs text-amber-300 font-sans">(Bạn)</span>
              </h4>
              <span class="text-xs text-amber-200 mt-0.5">
                {{ getTierBadge(top3[0].tier) }}
              </span>
              <div class="mt-2 py-1.5 px-3 rounded-xl bg-black/50 border border-amber-400/40 w-full">
                <span class="font-serif font-bold text-amber-300 text-lg">
                  {{ top3[0].totalMerit.toLocaleString('vi-VN') }}
                </span>
                <span class="text-xs text-amber-200 ml-1">điểm</span>
                <div class="text-[11px] text-amber-300/90 font-medium">🔥 {{ top3[0].streakDays }} ngày tinh tấn</div>
              </div>
            </div>

            <!-- Hạng 3 (Đồng) -->
            <div
              v-if="top3[2]"
              class="order-3 p-3.5 rounded-2xl bg-gradient-to-b from-[#332219] to-[#1c130d] border border-amber-700/50 flex flex-col items-center text-center relative shadow-lg"
              :class="{ 'ring-2 ring-amber-400': top3[2].isCurrentUser }"
            >
              <div class="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[#cd7f32] text-amber-950 font-serif font-bold text-xs shadow">
                🥉 Hạng Ba
              </div>
              <div class="w-14 h-14 rounded-full bg-amber-700/25 border-2 border-[#cd7f32] flex items-center justify-center text-2xl my-2 shadow-[0_0_15px_rgba(205,127,50,0.4)]">
                {{ top3[2].tier >= 5 ? '🌌' : top3[2].tier >= 4 ? '🪷' : '🌟' }}
              </div>
              <h4 class="font-serif font-bold text-sm text-amber-100 flex items-center gap-1">
                <span>{{ top3[2].dharmaName }}</span>
                <span v-if="top3[2].isCurrentUser" class="text-[10px] text-amber-300 font-sans">(Bạn)</span>
              </h4>
              <span class="text-[11px] text-amber-200/80 mt-0.5">
                {{ getTierBadge(top3[2].tier) }}
              </span>
              <div class="mt-2 py-1 px-3 rounded-xl bg-black/40 border border-amber-700/40 w-full">
                <span class="font-serif font-bold text-amber-200 text-base">
                  {{ top3[2].totalMerit.toLocaleString('vi-VN') }}
                </span>
                <span class="text-xs text-amber-300/70 ml-1">điểm</span>
                <div class="text-[10px] text-orange-300">🔥 {{ top3[2].streakDays }} ngày tinh tấn</div>
              </div>
            </div>
          </div>

          <!-- DANH SÁCH BẢNG XẾP HẠNG TỪ HẠNG 4 TRỞ ĐI -->
          <div class="rounded-2xl bg-black/35 border border-[#e6b95c]/25 overflow-hidden">
            <div class="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-[#cfbcaa]">
              <div class="w-12 text-center">Hạng</div>
              <div class="flex-1 px-2">Pháp Danh & Y Phục</div>
              <div class="hidden sm:block w-40 text-center">Tầng Hào Quang</div>
              <div class="w-24 text-center">Chuỗi Ngày</div>
              <div class="w-28 text-right">Tổng Điểm</div>
            </div>

            <div class="divide-y divide-white/5 max-h-72 overflow-y-auto">
              <div
                v-for="entry in remainingList"
                :key="entry.id"
                class="px-4 py-3 flex items-center justify-between transition-colors text-xs"
                :class="
                  entry.isCurrentUser
                    ? 'bg-amber-500/15 border-l-4 border-amber-400 font-medium'
                    : 'hover:bg-white/5'
                "
              >
                <!-- Cột Hạng -->
                <div class="w-12 text-center font-mono font-bold text-amber-300">
                  #{{ entry.rank }}
                </div>

                <!-- Cột Pháp danh & y phục -->
                <div class="flex-1 px-2">
                  <div class="font-serif font-bold text-sm text-[#f5ebd7] flex items-center gap-1.5">
                    <span>{{ entry.dharmaName }}</span>
                    <span
                      v-if="entry.isCurrentUser"
                      class="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40"
                    >
                      Bạn
                    </span>
                  </div>
                  <div class="text-[10px] text-[#a89582] mt-0.5">
                    {{ getRobeBadge(entry.outfitId) }}
                  </div>
                </div>

                <!-- Cột Hào quang -->
                <div class="hidden sm:block w-40 text-center text-[11px] text-[#d8c7b5]">
                  {{ getTierBadge(entry.tier) }}
                </div>

                <!-- Cột Chuỗi Streak -->
                <div class="w-24 text-center text-orange-400 font-mono text-[11px]">
                  🔥 {{ entry.streakDays }} ngày
                </div>

                <!-- Cột Tổng Điểm -->
                <div class="w-28 text-right">
                  <span class="font-serif font-bold text-amber-300 text-sm">
                    {{ entry.totalMerit.toLocaleString('vi-VN') }}
                  </span>
                  <span class="text-[10px] text-amber-200/70 ml-1">đ</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ================= TAB 2: CÔNG QUẢ TU BỔ CHÙA ================= -->
      <div v-else class="space-y-3">
        <div class="p-4 rounded-2xl bg-black/40 border border-[#e6b95c]/25 text-xs text-[#d8c7b5] leading-relaxed">
          <p class="font-serif font-bold text-sm text-amber-300 mb-1 flex items-center gap-1.5">
            <span>🪷</span>
            <span>Tri Ân Tấm Lòng Vàng Hộ Trì Thiền Môn:</span>
          </p>
          Mỗi lời cầu an, mỗi ngọn hoa đăng, nhát chuông hay dải lụa nguyện ước đều là công đức vô lượng trợ duyên cho ngôi chùa thêm phần trang nghiêm, thanh tịnh.
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="item in TEMPLE_CONTRIBUTIONS_SEED"
            :key="item.id"
            class="p-3.5 rounded-2xl bg-black/35 border border-white/10 hover:border-amber-500/30 transition-all flex items-start gap-3"
          >
            <span class="text-3xl p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
              {{ item.badge }}
            </span>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-serif font-bold text-sm text-amber-200">
                  {{ item.purpose }}
                </h4>
                <span class="text-[10px] text-[#8e7f72]">{{ item.date }}</span>
              </div>
              <p class="text-xs text-[#e8dacb] mt-1">
                Phật tử: <b class="text-[#ffe082]">{{ item.donorName }}</b>
              </p>
              <div class="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                <span class="text-green-300">✓ Đã viên thành công đức</span>
                <span class="font-mono text-amber-300 font-bold">+{{ item.amountMerit }} điểm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. THANH VỊ TRÍ CỦA TÔI Ở ĐÁY -->
    <div
      v-if="myRankEntry"
      class="relative z-10 mt-3 pt-3 border-t border-[#e6b95c]/30 flex items-center justify-between text-xs"
    >
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
          Thứ hạng của bạn: #{{ myRankEntry.rank }}
        </span>
        <span class="text-[#cfbcaa] hidden sm:inline">
          Pháp danh: <b class="text-white">{{ myRankEntry.dharmaName }}</b>
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-orange-400">🔥 {{ myRankEntry.streakDays }} ngày tinh tấn</span>
        <span class="font-serif font-bold text-amber-300 text-sm">
          {{ myRankEntry.totalMerit.toLocaleString('vi-VN') }} điểm
        </span>
      </div>
    </div>
  </div>
</template>

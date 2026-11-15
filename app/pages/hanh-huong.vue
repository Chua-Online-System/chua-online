<script setup lang="ts">
// Trải nghiệm 3D: leo núi, qua cổng tam quan, cởi dép, vào chùa thờ cúng.
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import TempleMapModal from '~/components/navigation/TempleMapModal.vue'
import FishReleaseModal from '~/components/ecosystem/FishReleaseModal.vue'
import FishPondCanvas from '~/components/ecosystem/FishPondCanvas.vue'
import BodhiRibbonModal from '~/components/ecosystem/BodhiRibbonModal.vue'
import BodhiGarden from '~/components/ecosystem/BodhiGarden.vue'
import LanternReleaseModal from '~/components/ecosystem/LanternReleaseModal.vue'
import LanternRiver from '~/components/ecosystem/LanternRiver.vue'
import LotusBlessingModal from '~/components/ecosystem/LotusBlessingModal.vue'
import PracticeJournalModal from '~/components/profile/PracticeJournalModal.vue'
import PracticeHallModal from '~/components/practice/PracticeHallModal.vue'
import MeritToast from '~/components/merit/MeritToast.vue'
import MeritLevelUpModal from '~/components/merit/MeritLevelUpModal.vue'
import MeritProfileModal from '~/components/merit/MeritProfileModal.vue'
import { useMeritSystem } from '~/composables/useMeritSystem'

const { current, cloudEnabled, init, enterAsGuest, signUp, signIn, signOut } = useAuth()
const { profile, currentTierInfo, earnMerit, init: initMerit } = useMeritSystem()

const activePanel = ref<string>('')
const templeSceneRef = ref<any>(null)
const practiceTab = ref<'beads' | 'meditation' | 'sutras' | 'dharma'>('beads')
const showGate = ref(true) // cửa "tự cấp tài khoản" trước khi vào
const showMeritModal = ref(false)

// khách đã lưu -> vào thẳng, không nháy cửa tài khoản
if (import.meta.client) { try { if (localStorage.getItem('dco.pilgrim')) showGate.value = false } catch {} }

// form tài khoản
const mode = ref<'guest' | 'signup' | 'signin'>('guest')
const form = reactive({ name: '', email: '', password: '' })
const authError = ref('')
const busy = ref(false)

onMounted(async () => {
  await init()
  initMerit()
  if (current.value) showGate.value = false
})

async function submitAuth() {
  authError.value = ''
  busy.value = true
  try {
    if (mode.value === 'guest') {
      if (!form.name.trim()) { authError.value = 'Xin cho biết pháp danh / tên của bạn.'; return }
      enterAsGuest(form.name)
    } else if (mode.value === 'signup') {
      const r = await signUp(form.name, form.email, form.password)
      if (!r.ok) { authError.value = r.error || 'Đăng ký không thành công.'; return }
    } else {
      const r = await signIn(form.email, form.password)
      if (!r.ok) { authError.value = r.error || 'Đăng nhập không thành công.'; return }
    }
    showGate.value = false
  } finally {
    busy.value = false
  }
}

function onInteract(action: string) {
  if (action === 'route_chua') {
    navigateTo('/chua')
    return
  }
  if (action === 'route_3d') {
    closePanel()
    return
  }
  if (action === 'modal_fish_release' || action === 'fish_release') {
    activePanel.value = 'fish_release'
    return
  }
  if (action === 'modal_fish' || action === 'fish') {
    // Dịch chuyển người chơi đến cầu đá hồ sen 3D
    templeSceneRef.value?.teleportTo(-53, -4)
    closePanel()
    return
  }
  if (action === 'modal_bodhi_ribbon' || action === 'bodhi_ribbon') {
    activePanel.value = 'bodhi_ribbon'
    return
  }
  if (action === 'modal_bodhi' || action === 'bodhi') {
    // Dịch chuyển đến Vườn Bồ Đề 3D
    templeSceneRef.value?.teleportTo(61, -15)
    closePanel()
    return
  }
  if (action === 'modal_bell' || action === 'bell') {
    // Dịch chuyển đến Lầu Đại Hồng Chung 3D
    templeSceneRef.value?.teleportTo(44, 28)
    closePanel()
    return
  }
  if (action === 'modal_lantern_release' || action === 'lantern_release') {
    activePanel.value = 'lantern_release'
    return
  }
  if (action === 'modal_lanterns' || action === 'lanterns') {
    // Dịch chuyển đến Bến Hoa Đăng Sông Trăng 3D
    templeSceneRef.value?.teleportTo(0, -82)
    closePanel()
    return
  }
  if (action === 'sutra_read') {
    practiceTab.value = 'sutras'
    activePanel.value = 'practice'
    return
  }
  else if (action === 'modal_lotus' || action === 'lotus') activePanel.value = 'lotus'
  else if (action === 'modal_map' || action === 'map') activePanel.value = 'map'
  else if (action === 'modal_journal' || action === 'journal') activePanel.value = 'journal'
  else if (action === 'modal_incense' || action === 'incense') activePanel.value = 'incense'
  else if (action === 'modal_bell' || action === 'bell') activePanel.value = 'bell'
  else if (action === 'modal_merit' || action === 'merit') activePanel.value = 'merit'
  else if (action === 'modal_prayer' || action === 'prayer') activePanel.value = 'prayer'
  else if (action === 'modal_fortune' || action === 'fortune') activePanel.value = 'fortune'
  else if (action === 'modal_practice' || action === 'practice') {
    practiceTab.value = 'beads'
    activePanel.value = 'practice'
  }
  else if (action === 'modal_beads' || action === 'beads') {
    practiceTab.value = 'beads'
    activePanel.value = 'practice'
  }
  else if (action === 'modal_meditation' || action === 'meditation') {
    practiceTab.value = 'meditation'
    activePanel.value = 'practice'
  }
  else if (action === 'modal_sutras' || action === 'modal_sutra' || action === 'sutra') {
    practiceTab.value = 'sutras'
    activePanel.value = 'practice'
  }
  else if (action === 'modal_dharma' || action === 'dharma') {
    practiceTab.value = 'dharma'
    activePanel.value = 'practice'
  }
  else {
    activePanel.value = action
  }
}
function closePanel() { activePanel.value = '' }

function onFishReleased(data: { speciesId: string; name: string; releaser: string; wish: string }) {
  if (templeSceneRef.value?.spawnFish) {
    templeSceneRef.value.spawnFish(data.speciesId, data.name)
  }
  earnMerit('fish_release', 15, `Phóng sinh cá Koi: ${data.name || 'Cá Cát Tường'}`)
  closePanel()
}

function onRibbonAttached(data: { wish: string; author: string; color: 'red' | 'yellow' | 'white' }) {
  if (templeSceneRef.value?.addBodhiRibbon) {
    templeSceneRef.value.addBodhiRibbon(data.wish, data.author, data.color)
  }
  earnMerit('bodhi_ribbon', 10, 'Treo dải lụa nguyện ước Cội Bồ Đề')
  closePanel()
}

function onLanternReleased(data: { sender: string; text: string; type: 'lotus_pink' | 'lotus_gold' | 'lotus_white'; category: string }) {
  if (templeSceneRef.value?.releaseRiverLantern) {
    templeSceneRef.value.releaseRiverLantern(data.sender, data.text, data.type)
  }
  earnMerit('lantern_release', 15, 'Thả hoa đăng cầu an Sông Trăng')
  closePanel()
}

const isAltarPanel = computed(() =>
  ['incense', 'bell', 'merit', 'prayer', 'fortune'].includes(activePanel.value)
)

const isFullModal = computed(() =>
  ['practice', 'map', 'fish', 'fish_release', 'bodhi', 'bodhi_ribbon', 'lanterns', 'lantern_release', 'lotus', 'journal'].includes(activePanel.value)
)

const panelTitle = computed(() => ({
  incense: '🪔 Thắp nhang',
  bell: '🔔 Thỉnh chuông',
  merit: '💛 Cúng dường',
  prayer: '🙏 Cầu an',
  fortune: '🎋 Xin xăm'
}[activePanel.value] || ''))

async function doSignOut() { await signOut(); showGate.value = true }
</script>

<template>
  <div class="hh-root">
    <TempleScene3D ref="templeSceneRef" v-if="!showGate" @interact="onInteract" />

    <!-- Cổng tài khoản: tự cấp tài khoản để vào chùa -->
    <transition name="fade">
      <div v-if="showGate" class="gate-overlay">
        <div class="gate-card">
          <div class="lotus">🪷</div>
          <h1>Đi Chùa Online</h1>
          <p class="tagline">Tự tạo tài khoản hành hương — leo núi, qua cổng tam quan,
            vào chùa lễ Phật như ngoài đời.</p>

          <div class="tabs">
            <button :class="{ on: mode === 'guest' }" @click="mode = 'guest'">Vào ngay</button>
            <button :class="{ on: mode === 'signup' }" @click="mode = 'signup'">Đăng ký</button>
            <button :class="{ on: mode === 'signin' }" @click="mode = 'signin'">Đăng nhập</button>
          </div>

          <form class="auth-form" @submit.prevent="submitAuth">
            <input v-if="mode !== 'signin'" v-model="form.name" placeholder="Pháp danh / Tên của bạn" />
            <input v-if="mode !== 'guest'" v-model="form.email" type="email" placeholder="Email" />
            <input v-if="mode !== 'guest'" v-model="form.password" type="password" placeholder="Mật khẩu" />
            <p v-if="authError" class="err">{{ authError }}</p>
            <button class="btn-gold" :disabled="busy" type="submit">
              {{ mode === 'guest' ? '🚪 Bước tới chân núi' : mode === 'signup' ? 'Tạo tài khoản & vào chùa' : 'Đăng nhập' }}
            </button>
          </form>

          <p class="note">
            <template v-if="cloudEnabled">Tài khoản được lưu trên cloud, dùng lại trên mọi thiết bị.</template>
            <template v-else>Chế độ khách: tài khoản lưu ngay trên trình duyệt của bạn.</template>
          </p>
        </div>
      </div>
    </transition>

    <!-- thanh điều hướng & người dùng góc trên -->
    <div v-if="!showGate && current" class="userbar">
      <NuxtLink to="/chua" class="btn-hud" title="Về Chánh điện 2D">
        <span>🪷</span>
        <span class="hidden sm:inline">Chánh điện</span>
      </NuxtLink>
      <button @click="onInteract('map')" class="btn-hud" title="Bản đồ chùa 2.5D">
        <span>🗺️</span>
        <span class="hidden sm:inline">Bản đồ</span>
      </button>
      <button @click="onInteract('journal')" class="btn-hud" title="Nhật ký tu tập">
        <span>🏮</span>
        <span class="hidden sm:inline">Nhật ký</span>
      </button>
      <button @click="showMeritModal = true" class="btn-hud btn-merit" title="Sổ Công Đức Tu Học">
        <span>{{ currentTierInfo.badge }}</span>
        <span class="font-serif font-bold text-amber-300">{{ profile.totalMerit }}</span>
        <span class="hidden md:inline text-xs text-amber-200/90 font-sans">Công đức</span>
      </button>
      <span class="divider">|</span>
      <span class="name">🙏 {{ current.name }}</span>
      <button @click="doSignOut" class="btn-signout" title="Rời chùa">Rời chùa</button>
    </div>

    <!-- Nhạc nền thiền với volume & soundscape -->
    <ClientOnly>
      <MusicToggle />
    </ClientOnly>

    <!-- 1. Bảng thờ cúng nơi điện thờ (Nhang, Chuông, Cúng dường, Cầu an, Xin xăm) -->
    <transition name="fade">
      <div v-if="isAltarPanel" class="panel-overlay" @click.self="closePanel">
        <div class="panel-card">
          <div class="panel-head">
            <h2>{{ panelTitle }}</h2>
            <button class="close" @click="closePanel">✕</button>
          </div>
          <div class="panel-body">
            <IncenseBurner v-if="activePanel === 'incense'" />
            <TempleBell v-else-if="activePanel === 'bell'" />
            <MeritBox v-else-if="activePanel === 'merit'" />
            <PrayerBook v-else-if="activePanel === 'prayer'" />
            <FortuneStick v-else-if="activePanel === 'fortune'" />
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. Không gian độc lập (Nhà Tụng Kinh & Thiền, Bản Đồ, Sinh Thái, Nhật Ký) -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isFullModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="closePanel"
      >
        <div class="w-full max-w-3xl my-auto animate-fade-up">
          <PracticeHallModal
            v-if="activePanel === 'practice'"
            :initial-tab="practiceTab"
            @close="closePanel"
          />
          <TempleMapModal
            v-else-if="activePanel === 'map'"
            @close="closePanel"
            @select-zone="onInteract"
          />
          <FishReleaseModal
            v-else-if="activePanel === 'fish_release'"
            @close="closePanel"
            @released="onFishReleased"
          />
          <FishPondCanvas v-else-if="activePanel === 'fish'" @close="closePanel" />
          <BodhiRibbonModal
            v-if="activePanel === 'bodhi_ribbon'"
            @close="closePanel"
            @ribbon-attached="onRibbonAttached"
          />
          <BodhiGarden v-else-if="activePanel === 'bodhi'" @close="closePanel" />
          <LanternReleaseModal
            v-else-if="activePanel === 'lantern_release'"
            @close="closePanel"
            @released="onLanternReleased"
          />
          <LanternRiver v-else-if="activePanel === 'lanterns'" @close="closePanel" />
          <LotusBlessingModal v-else-if="activePanel === 'lotus'" @close="closePanel" />
          <PracticeJournalModal v-else-if="activePanel === 'journal'" @close="closePanel" />
        </div>
      </div>
    </transition>

    <!-- Hệ Thống Thông Báo Công Đức & Thăng Cấp (Phase 1) -->
    <ClientOnly>
      <MeritToast />
      <MeritLevelUpModal />

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMeritModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto"
          @click.self="showMeritModal = false"
        >
          <div class="w-full max-w-2xl my-auto animate-fade-up">
            <MeritProfileModal @close="showMeritModal = false" />
          </div>
        </div>
      </transition>
    </ClientOnly>
  </div>
</template>

<style scoped>
.hh-root { position: fixed; inset: 0; background: #0d0a07; }

.gate-overlay {
  position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 24px;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(201,163,86,.25), transparent 60%),
    linear-gradient(160deg, #241305, #0d0a07);
}
.gate-card {
  width: min(440px, 92vw); text-align: center; color: #f5efe0;
  background: rgba(40,26,16,.7); border: 1px solid rgba(201,163,86,.45);
  border-radius: 22px; padding: 30px 26px; backdrop-filter: blur(10px);
  box-shadow: 0 24px 70px rgba(0,0,0,.5);
}
.lotus { font-size: 2.6rem; }
.gate-card h1 { font-family: 'Cormorant Garamond','Noto Serif',serif; font-size: 2.4rem; margin: 6px 0 8px; color: #f3e6c4; }
.tagline { font-size: .95rem; opacity: .85; line-height: 1.55; margin-bottom: 22px; }
.tabs { display: flex; gap: 6px; background: rgba(0,0,0,.25); padding: 5px; border-radius: 999px; margin-bottom: 18px; }
.tabs button { flex: 1; border: none; background: transparent; color: #e7dcc4; padding: 9px; border-radius: 999px; cursor: pointer; font-size: .9rem; }
.tabs button.on { background: linear-gradient(135deg,#d9b969,#b4863f); color: #2a1a0c; font-weight: 600; }
.auth-form { display: flex; flex-direction: column; gap: 10px; }
.auth-form input {
  background: rgba(255,255,255,.08); border: 1px solid rgba(201,163,86,.35); color: #fff;
  padding: 12px 14px; border-radius: 12px; font-size: .95rem; outline: none;
}
.auth-form input:focus { border-color: #c9a356; }
.err { color: #ffb4a3; font-size: .85rem; margin: 2px 0; }
.btn-gold {
  background: linear-gradient(135deg,#d9b969,#b4863f); color: #2a1a0c; font-weight: 600;
  border: none; padding: 13px; border-radius: 999px; font-size: 1rem; cursor: pointer; margin-top: 4px;
}
.btn-gold:disabled { opacity: .6; cursor: wait; }
.note { font-size: .78rem; opacity: .6; margin-top: 16px; }

.userbar {
  position: fixed; top: 16px; left: 16px; z-index: 20; display: flex; gap: 8px; align-items: center;
  background: rgba(36,22,14,.75); color: #f5efe0; padding: 6px 14px; border-radius: 999px;
  border: 1px solid rgba(201,163,86,.45); backdrop-filter: blur(8px); font-size: .88rem;
  box-shadow: 0 4px 20px rgba(0,0,0,.35);
}
.btn-hud {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,.1); border: 1px solid rgba(201,163,86,.3);
  color: #f5efe0; padding: 5px 12px; border-radius: 999px; cursor: pointer;
  font-size: .82rem; text-decoration: none; transition: all .2s;
}
.btn-hud:hover { background: rgba(201,163,86,.25); color: #fff; border-color: #c9a356; }
.btn-merit {
  background: linear-gradient(135deg, rgba(217, 185, 105, 0.22), rgba(180, 134, 63, 0.15));
  border-color: rgba(230, 185, 92, 0.55);
}
.btn-merit:hover {
  background: linear-gradient(135deg, rgba(217, 185, 105, 0.4), rgba(180, 134, 63, 0.25));
  border-color: #ffd54f;
  box-shadow: 0 0 12px rgba(255, 213, 79, 0.35);
}
.divider { opacity: .3; margin: 0 2px; }
.name { font-weight: 500; color: #f3e6c4; }
.btn-signout {
  background: rgba(139,46,46,.4); border: 1px solid rgba(139,46,46,.6);
  color: #ffc4be; padding: 4px 10px; border-radius: 999px; cursor: pointer; font-size: .78rem;
  transition: all .2s;
}
.btn-signout:hover { background: rgba(139,46,46,.7); color: #fff; }

.panel-overlay { position: fixed; inset: 0; z-index: 25; display: grid; place-items: center; padding: 20px; background: rgba(10,6,3,.6); backdrop-filter: blur(4px); }
.panel-card {
  width: min(640px, 94vw); max-height: 88vh; overflow: auto;
  background: #f5efe0; border-radius: 20px; box-shadow: 0 24px 70px rgba(0,0,0,.5);
  border: 1px solid #c9a356;
}
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(201,163,86,.35); position: sticky; top: 0; background: #f5efe0; z-index: 2; }
.panel-head h2 { font-family: 'Cormorant Garamond','Noto Serif',serif; font-size: 1.5rem; color: #8b2e2e; margin: 0; }
.close { border: none; background: rgba(139,46,46,.1); color: #8b2e2e; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1rem; }
.panel-body { padding: 18px 20px 24px; }

.fade-enter-active, .fade-leave-active { transition: opacity .4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

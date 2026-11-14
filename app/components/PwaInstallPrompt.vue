<script setup lang="ts">
import { ref, onMounted } from 'vue'

const deferredPrompt = ref<any>(null)
const canInstall = ref(false)
const isInstalled = ref(false)
const showPrompt = ref(false)
const reminderEnabled = ref(false)
const notificationStatus = ref<'default' | 'granted' | 'denied'>('default')

onMounted(() => {
  if (!import.meta.client) return

  // Kiểm tra xem đã cài PWA chưa
  if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
    isInstalled.value = true
  }

  // Bắt sự kiện có thể cài đặt PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
    // Hiện banner sau 3 giây để không làm phiền người dùng
    setTimeout(() => {
      if (!isInstalled.value) {
        showPrompt.value = true
      }
    }, 3000)
  })

  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    showPrompt.value = false
    deferredPrompt.value = null
  })

  if ('Notification' in window) {
    notificationStatus.value = Notification.permission
    reminderEnabled.value = Notification.permission === 'granted'
  }
})

async function installPwa() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    canInstall.value = false
    showPrompt.value = false
  }
  deferredPrompt.value = null
}

async function enableMindfulnessReminder() {
  if (!import.meta.client || !('Notification' in window)) return

  try {
    const permission = await Notification.requestPermission()
    notificationStatus.value = permission
    if (permission === 'granted') {
      reminderEnabled.value = true
      // Gửi thông báo chào mừng
      new Notification('Đi Chùa Online · Tịnh Tâm', {
        body: 'Đã bật nhắc nhở tịnh tâm. Nguyện chúc bạn một ngày an yên và thân tâm tự tại!',
        icon: '/icon-192.svg'
      })
    }
  } catch {}
}
</script>

<template>
  <div class="fixed bottom-4 left-4 z-40 select-none">
    <!-- Banner mời cài đặt PWA -->
    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showPrompt && canInstall"
        class="flex items-center gap-3 rounded-2xl border border-dong/40 bg-kem/95 p-3.5 text-[#3D2C1E] shadow-2xl backdrop-blur-md max-w-sm"
      >
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-do text-kem text-xl shadow-sm">
          🪷
        </div>
        <div class="flex-1 text-xs font-serif">
          <p class="font-bold text-do">Cài đặt Đi Chùa Online</p>
          <p class="text-go/70 mt-0.5 leading-snug">
            Mở viếng chùa nhanh chóng từ màn hình chính điện thoại, chạy mượt cả khi không có mạng.
          </p>
        </div>
        <div class="flex flex-col gap-1">
          <button
            @click="installPwa"
            class="btn-zen px-3 py-1 text-xs font-serif whitespace-nowrap shadow-sm"
          >
            Cài đặt
          </button>
          <button
            @click="showPrompt = false"
            class="text-[10px] text-go/50 hover:text-go text-center font-serif"
          >
            Để sau
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>


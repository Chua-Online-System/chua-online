import { ref } from 'vue'

const isNightMode = ref(false)
const isFullscreen = ref(false)

export function useZenTheme() {
  function initZenTheme() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem('dco_night_mode')
      if (saved === 'true') {
        isNightMode.value = true
        document.documentElement.classList.add('zen-night')
      }

      document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement
      })
    } catch {}
  }

  function toggleNightMode() {
    if (!import.meta.client) return
    isNightMode.value = !isNightMode.value
    if (isNightMode.value) {
      document.documentElement.classList.add('zen-night')
      localStorage.setItem('dco_night_mode', 'true')
    } else {
      document.documentElement.classList.remove('zen-night')
      localStorage.setItem('dco_night_mode', 'false')
    }
  }

  async function toggleFullscreen() {
    if (!import.meta.client) return
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
          isFullscreen.value = false
        }
      }
    } catch (e) {
      console.warn('Fullscreen error:', e)
    }
  }

  return {
    isNightMode,
    isFullscreen,
    initZenTheme,
    toggleNightMode,
    toggleFullscreen
  }
}


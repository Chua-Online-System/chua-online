import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useSound } from './useSound'
import { usePracticeJournal } from './usePracticeJournal'
import type { MantraOption } from '~/types/practice'

export const MANTRAS: MantraOption[] = [
  {
    id: 'a-di-da',
    name: 'Nam Mô A Di Đà Phật',
    sanskrit: 'Namo Amitābha Buddha',
    description: 'Xưng niệm hồng danh Đức Từ Phụ, nguyện tâm an tịnh và hướng về cõi Cực Lạc.',
    color: '#C9A356'
  },
  {
    id: 'quan-am',
    name: 'Nam Mô Quán Thế Âm Bồ Tát',
    sanskrit: 'Namo Avalokiteśvara Bodhisattva',
    description: 'Khởi lòng từ bi, lắng nghe nỗi đau và nguyện cầu bình an, cứu khổ cứu nạn.',
    color: '#8B2E2E'
  },
  {
    id: 'bon-su',
    name: 'Nam Mô Bổn Sư Thích Ca Mâu Ni Phật',
    sanskrit: 'Namo Śākyamuni Buddha',
    description: 'Quy kính Đấng Giác Ngộ, soi rọi trí tuệ và bước theo con đường chánh pháp.',
    color: '#4A3728'
  },
  {
    id: 'dia-tang',
    name: 'Nam Mô Đại Nguyện Địa Tạng Vương Bồ Tát',
    sanskrit: 'Namo Kṣitigarbha Bodhisattva',
    description: 'Đại nguyện cứu độ muôn loài chúng sinh, hiếu thuận và hồi hướng phước đức gia tiên.',
    color: '#7A5A2E'
  },
  {
    id: 'om-mani',
    name: 'Án Ma Ni Bát Mê Hồng',
    sanskrit: 'Oṃ Maṇi Padme Hūṃ',
    description: 'Lục Tự Đại Minh Chân Ngôn — viên ngọc quý trong hoa sen, khai mở lòng bác ái.',
    color: '#B04A38'
  }
]

export function useChanting() {
  const { playWoodenFish, playBell } = useSound()
  const journal = usePracticeJournal()

  const selectedMantraId = ref('a-di-da')
  const currentBead = ref(0) // 0 đến 108
  const completedMalas = ref(0) // Số chuỗi (108 biến) đã xong
  const soundEnabled = ref(true)
  const vibrateEnabled = ref(true)
  const autoChant = ref(false)
  const autoSpeedMs = ref(1800) // Tốc độ tự động

  let autoTimer: any = null

  const selectedMantra = computed(() => {
    return MANTRAS.find((m) => m.id === selectedMantraId.value) || MANTRAS[0]
  })

  function triggerHaptic() {
    if (!vibrateEnabled.value || !import.meta.client) return
    try {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(22)
      }
    } catch {}
  }

  function countNext(): { completedMala: boolean } {
    let completed = false
    triggerHaptic()

    if (currentBead.value >= 107) {
      // Hoàn thành tràng 108 hạt
      currentBead.value = 108
      completedMalas.value++
      completed = true
      if (soundEnabled.value) {
        playBell()
      }
      journal.addChanting(1)
      // Chờ một chút rồi quay về hạt số 0 cho tràng mới
      setTimeout(() => {
        currentBead.value = 0
      }, 700)
    } else {
      currentBead.value++
      if (soundEnabled.value) {
        playWoodenFish()
      }
      journal.addChanting(1)
    }

    return { completedMala: completed }
  }

  function reset() {
    currentBead.value = 0
    stopAuto()
  }

  function startAuto() {
    autoChant.value = true
    if (autoTimer) clearInterval(autoTimer)
    countNext()
    autoTimer = setInterval(() => {
      countNext()
    }, autoSpeedMs.value)
  }

  function stopAuto() {
    autoChant.value = false
    if (autoTimer) {
      clearInterval(autoTimer)
      autoTimer = null
    }
  }

  function toggleAuto() {
    if (autoChant.value) {
      stopAuto()
    } else {
      startAuto()
    }
  }

  watch(autoSpeedMs, () => {
    if (autoChant.value) {
      startAuto()
    }
  })

  onBeforeUnmount(() => {
    stopAuto()
  })

  return {
    selectedMantraId,
    selectedMantra,
    currentBead,
    completedMalas,
    soundEnabled,
    vibrateEnabled,
    autoChant,
    autoSpeedMs,
    countNext,
    reset,
    toggleAuto,
    stopAuto
  }
}


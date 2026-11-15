import { ref, computed, onBeforeUnmount } from 'vue'
import { usePracticeJournal } from './usePracticeJournal'
import { useMeritSystem } from './useMeritSystem'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (!import.meta.client) return null
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export type AmbientSoundType = 'silence' | 'rain' | 'stream' | 'temple_bell'

export function useMeditation() {
  const journal = usePracticeJournal()
  const { earnMerit } = useMeritSystem()

  const status = ref<'idle' | 'running' | 'paused' | 'completed'>('idle')
  const selectedDuration = ref(5) // phút (3, 5, 10, 15, 20, 30)
  const remainingSeconds = ref(300)
  const elapsedSeconds = ref(0)
  const ambientSound = ref<AmbientSoundType>('stream')
  const soundVolume = ref(0.4)

  // Nhịp thở: Inhale (4s), Hold (2s), Exhale (6s), Rest (2s) -> Tổng chu kỳ 14s
  const breathPhase = ref<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale')
  const breathPrompt = computed(() => {
    switch (breathPhase.value) {
      case 'inhale':
        return 'Hít vào chậm rãi, đón nhận sự trong lành...'
      case 'hold':
        return 'Giữ hơi thở, cảm nhận tâm tĩnh lặng...'
      case 'exhale':
        return 'Thở ra nhẹ nhàng, buông hết muộn phiền...'
      case 'rest':
        return 'An trú thảnh thơi nơi giây phút hiện tại...'
    }
  })

  let timerInterval: any = null
  let breathInterval: any = null
  let ambientSourceNodes: { stop: () => void } | null = null

  // Phát tiếng chuông bát thiền (Tibetan singing bowl gong - 432Hz ngân vang)
  function playSingingBowl() {
    const ac = getAudioContext()
    if (!ac) return
    const now = ac.currentTime

    const master = ac.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.6 * soundVolume.value, now + 0.05)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 6.5)
    master.connect(ac.destination)

    // Bội âm thiền: 432Hz, 864Hz, 1296Hz, 1728Hz
    const freqs = [
      { f: 432, g: 1.0 },
      { f: 864, g: 0.4 },
      { f: 1296, g: 0.2 },
      { f: 1728, g: 0.08 }
    ]

    freqs.forEach((p, idx) => {
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(p.f, now)
      // Hiệu ứng ngân rung nhẹ (vibrato / beating)
      osc.frequency.linearRampToValueAtTime(p.f + (idx % 2 === 0 ? 1.5 : -1.5), now + 3.0)

      g.gain.setValueAtTime(p.g, now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 6.5 - idx * 0.5)

      osc.connect(g)
      g.connect(master)
      osc.start(now)
      osc.stop(now + 6.6)
    })
  }

  // Khởi động âm thanh môi trường Web Audio API
  function startAmbientSound() {
    stopAmbientSound()
    if (ambientSound.value === 'silence') return

    const ac = getAudioContext()
    if (!ac) return

    if (ambientSound.value === 'stream' || ambientSound.value === 'rain') {
      // White noise buffer + Bandpass filter
      const bufferSize = ac.sampleRate * 2
      const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ac.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = ac.createBiquadFilter()
      filter.type = ambientSound.value === 'stream' ? 'bandpass' : 'lowpass'
      filter.frequency.value = ambientSound.value === 'stream' ? 800 : 450
      filter.Q.value = 1.2

      const gain = ac.createGain()
      gain.gain.value = 0.08 * soundVolume.value

      whiteNoise.connect(filter)
      filter.connect(gain)
      gain.connect(ac.destination)

      whiteNoise.start()
      ambientSourceNodes = {
        stop: () => {
          try {
            whiteNoise.stop()
            whiteNoise.disconnect()
          } catch {}
        }
      }
    } else if (ambientSound.value === 'temple_bell') {
      // Tiếng chuông định kỳ mỗi 30s
      const bellInterval = setInterval(() => {
        playSingingBowl()
      }, 30000)

      ambientSourceNodes = {
        stop: () => clearInterval(bellInterval)
      }
    }
  }

  function stopAmbientSound() {
    if (ambientSourceNodes) {
      ambientSourceNodes.stop()
      ambientSourceNodes = null
    }
  }

  // Quản lý nhịp thở chu kỳ 14s (4s - 2s - 6s - 2s)
  function startBreathingCycle() {
    let cycleTime = 0
    breathPhase.value = 'inhale'

    breathInterval = setInterval(() => {
      cycleTime = (cycleTime + 1) % 14
      if (cycleTime < 4) {
        breathPhase.value = 'inhale'
      } else if (cycleTime < 6) {
        breathPhase.value = 'hold'
      } else if (cycleTime < 12) {
        breathPhase.value = 'exhale'
      } else {
        breathPhase.value = 'rest'
      }
    }, 1000)
  }

  function startMeditation() {
    if (status.value === 'idle' || status.value === 'completed') {
      remainingSeconds.value = selectedDuration.value * 60
      elapsedSeconds.value = 0
    }

    status.value = 'running'
    playSingingBowl()
    startAmbientSound()
    startBreathingCycle()

    let lastTime = performance.now()
    timerInterval = setInterval(() => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (remainingSeconds.value > 0) {
        remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
        elapsedSeconds.value++
      } else {
        completeMeditation()
      }
    }, 1000)
  }

  function pauseMeditation() {
    status.value = 'paused'
    if (timerInterval) clearInterval(timerInterval)
    if (breathInterval) clearInterval(breathInterval)
    stopAmbientSound()
  }

  function resumeMeditation() {
    status.value = 'running'
    startAmbientSound()
    startBreathingCycle()

    let lastTime = performance.now()
    timerInterval = setInterval(() => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (remainingSeconds.value > 0) {
        remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
        elapsedSeconds.value++
      } else {
        completeMeditation()
      }
    }, 1000)
  }

  function completeMeditation() {
    status.value = 'completed'
    if (timerInterval) clearInterval(timerInterval)
    if (breathInterval) clearInterval(breathInterval)
    stopAmbientSound()

    // Tiếng chuông bát kết thúc
    playSingingBowl()
    setTimeout(() => {
      playSingingBowl()
    }, 2500)

    // Ghi nhận vào nhật ký
    const minutesDone = Math.max(1, Math.round(elapsedSeconds.value / 60))
    journal.addMeditation(minutesDone)
    const meritPoints = Math.min(30, Math.max(10, Math.floor(minutesDone / 3) * 10 || 10))
    earnMerit('meditation', meritPoints, `Tọa thiền tĩnh tâm ${minutesDone} phút`)
  }

  function stopMeditation() {
    status.value = 'idle'
    if (timerInterval) clearInterval(timerInterval)
    if (breathInterval) clearInterval(breathInterval)
    stopAmbientSound()
    remainingSeconds.value = selectedDuration.value * 60
    elapsedSeconds.value = 0
  }

  onBeforeUnmount(() => {
    stopMeditation()
  })

  return {
    status,
    selectedDuration,
    remainingSeconds,
    elapsedSeconds,
    ambientSound,
    soundVolume,
    breathPhase,
    breathPrompt,
    startMeditation,
    pauseMeditation,
    resumeMeditation,
    stopMeditation,
    playSingingBowl
  }
}


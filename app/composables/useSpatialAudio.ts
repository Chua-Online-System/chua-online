/**
 * 3D Spatial Audio System (Phase 5)
 * Tổng hợp âm thanh không gian tự nhiên bằng Web Audio API:
 * - Không phụ thuộc file nhạc ngoài, chạy mượt mà 100% offline và tức thì
 * - Tự động điều biến âm lượng (volume fading) mượt mà theo khoảng cách nhân vật
 * - Phân khu âm thanh:
 *   1. Bến Sông Trăng (X: 0, Z: -88): Tiếng sóng nước sông đêm rì rào & gió mát
 *   2. Đại Điện Tam Bảo (X: 0, Z: -15): Âm vang trầm mặc thiền định
 *   3. Vườn Bồ Đề Tâm (X: 64, Z: -12): Tiếng gió xào xạc qua tán lá Bồ Đề
 *   4. Hồ Cá & Cầu Đá (X: -65, Z: -4): Tiếng róc rách nước đài sen phun
 */
import { ref } from 'vue'

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

interface AudioZone {
  name: string
  x: number
  z: number
  radius: number
  gainNode: GainNode | null
  targetGain: number
  currentGain: number
}

const isEnabled = ref(true)
const isStarted = ref(false)

// Các phân khu âm thanh không gian
const zones: Record<string, AudioZone> = {
  river: { name: 'Sông Trăng', x: 0, z: -88, radius: 36, gainNode: null, targetGain: 0, currentGain: 0 },
  hall: { name: 'Chánh Điện', x: 0, z: -15, radius: 28, gainNode: null, targetGain: 0, currentGain: 0 },
  bodhi: { name: 'Vườn Bồ Đề', x: 64, z: -12, radius: 30, gainNode: null, targetGain: 0, currentGain: 0 },
  pond: { name: 'Hồ Sen Cá Koi', x: -65, z: -4, radius: 28, gainNode: null, targetGain: 0, currentGain: 0 }
}

let masterGain: GainNode | null = null

function createNoiseBuffer(ctx: AudioContext, seconds = 2.0): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }
  return buffer
}

function initAudioNodes() {
  const ctx = getAudioContext()
  if (!ctx || isStarted.value) return

  masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.5, ctx.currentTime)
  masterGain.connect(ctx.destination)

  const noiseBuf = createNoiseBuffer(ctx, 3.0)

  // 1. Phân khu Sông Trăng: Tiếng nước chảy róc rách & tiếng sóng đêm
  try {
    const riverGain = ctx.createGain()
    riverGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    riverGain.connect(masterGain)
    zones.river.gainNode = riverGain

    const riverNoise = ctx.createBufferSource()
    riverNoise.buffer = noiseBuf
    riverNoise.loop = true

    const riverFilter1 = ctx.createBiquadFilter()
    riverFilter1.type = 'bandpass'
    riverFilter1.frequency.setValueAtTime(320, ctx.currentTime)
    riverFilter1.Q.setValueAtTime(2.5, ctx.currentTime)

    const riverFilter2 = ctx.createBiquadFilter()
    riverFilter2.type = 'lowpass'
    riverFilter2.frequency.setValueAtTime(700, ctx.currentTime)

    riverNoise.connect(riverFilter1)
    riverFilter1.connect(riverFilter2)
    riverFilter2.connect(riverGain)
    riverNoise.start()
  } catch (e) {
    console.warn('Lỗi khởi tạo âm thanh Sông Trăng:', e)
  }

  // 2. Phân khu Chánh Điện: Âm hưởng tĩnh lặng thiền định
  try {
    const hallGain = ctx.createGain()
    hallGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    hallGain.connect(masterGain)
    zones.hall.gainNode = hallGain

    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(108, ctx.currentTime) // Tần số 108Hz thiền định

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(216, ctx.currentTime)

    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.08, ctx.currentTime)

    osc1.connect(oscGain)
    osc2.connect(oscGain)
    oscGain.connect(hallGain)
    osc1.start()
    osc2.start()
  } catch (e) {
    console.warn('Lỗi khởi tạo âm thanh Chánh Điện:', e)
  }

  // 3. Phân khu Vườn Bồ Đề: Tiếng gió lùa qua tán lá Bồ Đề
  try {
    const bodhiGain = ctx.createGain()
    bodhiGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    bodhiGain.connect(masterGain)
    zones.bodhi.gainNode = bodhiGain

    const windNoise = ctx.createBufferSource()
    windNoise.buffer = noiseBuf
    windNoise.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.setValueAtTime(1400, ctx.currentTime)
    windFilter.Q.setValueAtTime(3.2, ctx.currentTime)

    windNoise.connect(windFilter)
    windFilter.connect(bodhiGain)
    windNoise.start()
  } catch (e) {
    console.warn('Lỗi khởi tạo âm thanh Vườn Bồ Đề:', e)
  }

  // 4. Phân khu Hồ Sen: Tiếng nước đài sen phun róc rách
  try {
    const pondGain = ctx.createGain()
    pondGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    pondGain.connect(masterGain)
    zones.pond.gainNode = pondGain

    const pondNoise = ctx.createBufferSource()
    pondNoise.buffer = noiseBuf
    pondNoise.loop = true

    const pondFilter = ctx.createBiquadFilter()
    pondFilter.type = 'bandpass'
    pondFilter.frequency.setValueAtTime(520, ctx.currentTime)
    pondFilter.Q.setValueAtTime(1.8, ctx.currentTime)

    pondNoise.connect(pondFilter)
    pondFilter.connect(pondGain)
    pondNoise.start()
  } catch (e) {
    console.warn('Lỗi khởi tạo âm thanh Hồ Sen:', e)
  }

  isStarted.value = true
}

export function useSpatialAudio() {
  function start() {
    initAudioNodes()
  }

  /**
   * Cập nhật vị trí nhân vật (X, Z) để điều chỉnh âm lượng từng phân khu
   */
  function updatePosition(x: number, z: number, dt = 0.05) {
    if (!isEnabled.value || !isStarted.value) return
    const ctx = getAudioContext()
    if (!ctx) return

    for (const key in zones) {
      const zData = zones[key]
      if (!zData.gainNode) continue

      const dist = Math.hypot(x - zData.x, z - zData.z)
      if (dist < zData.radius) {
        // Tỷ lệ âm lượng từ 1.0 (ở tâm) đến 0.0 (ở mép bán kính)
        const norm = 1.0 - dist / zData.radius
        zData.targetGain = Math.pow(norm, 1.8) * 0.35
      } else {
        zData.targetGain = 0.0001
      }

      // Nội suy làm mượt âm lượng
      zData.currentGain += (zData.targetGain - zData.currentGain) * Math.min(1, dt * 3.5)
      try {
        zData.gainNode.gain.setValueAtTime(Math.max(0.0001, zData.currentGain), ctx.currentTime)
      } catch {}
    }
  }

  function setMasterVolume(vol: number) {
    if (!masterGain) return
    const ctx = getAudioContext()
    if (!ctx) return
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime)
  }

  function toggleMute() {
    isEnabled.value = !isEnabled.value
    if (!isEnabled.value) {
      setMasterVolume(0)
    } else {
      setMasterVolume(0.5)
    }
  }

  return {
    isEnabled,
    isStarted,
    start,
    updatePosition,
    setMasterVolume,
    toggleMute
  }
}


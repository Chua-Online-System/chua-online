import { ref } from 'vue'

export type SoundscapeType = 'penta' | 'rain' | 'stream' | 'temple'

export interface SoundscapeOption {
  id: SoundscapeType
  name: string
  icon: string
  desc: string
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  { id: 'penta', name: 'Ngũ Cung Thiền', icon: '🪕', desc: 'Giai điệu ngũ cung thư thái, trầm ấm' },
  { id: 'rain', name: 'Mưa Mái Chùa', icon: '🌧️', desc: 'Tiếng mưa rơi dịu nhẹ trên mái ngói' },
  { id: 'stream', name: 'Suối Rừng Trúc', icon: '🌊', desc: 'Tiếng nước róc rách qua ghềnh đá' },
  { id: 'temple', name: 'Chuông Mõ Thanh Tịnh', icon: '🔔', desc: 'Tiếng chuông ngân xa cùng nhịp mõ trầm' }
]

const playing = ref(false)
const currentSoundscape = ref<SoundscapeType>('penta')
const volume = ref(35) // 0 - 100

let ctx: AudioContext | null = null
let master: GainNode | null = null
let soundscapeNodes: Array<{ stop?: () => void; disconnect: () => void }> = []
let loopTimers: number[] = []

// Pink noise buffer dùng cho mưa & suối
let noiseBuffer: AudioBuffer | null = null

function getOrCreateNoiseBuffer(audioCtx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const bufferSize = audioCtx.sampleRate * 4
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const output = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1
    b6 = white * 0.115926
  }
  noiseBuffer = buffer
  return buffer
}

function clearActiveSoundscape() {
  loopTimers.forEach((t) => clearTimeout(t))
  loopTimers = []
  soundscapeNodes.forEach((node) => {
    try {
      if (node.stop) node.stop()
      node.disconnect()
    } catch {}
  })
  soundscapeNodes = []
}

// 1. NGŨ CUNG THIỀN (Penta)
const PAD_FREQS = [110.0, 164.81, 220.0]
const PENTA_NOTES = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]

function startPenta(audioCtx: AudioContext, targetGain: GainNode) {
  const now = audioCtx.currentTime
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 720
  filter.Q.value = 0.4
  filter.connect(targetGain)
  soundscapeNodes.push(filter)

  // Pad hòa âm trầm
  PAD_FREQS.forEach((freq, i) => {
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'sine'
    o.frequency.value = freq
    o.detune.value = (i - 1) * 4
    g.gain.value = 0.12 / (i * 0.4 + 1)
    o.connect(g)
    g.connect(filter)
    o.start(now)
    soundscapeNodes.push(o, g)
  })

  // Twinkle ngẫu nhiên nốt ngũ cung
  function scheduleTwinkle() {
    if (!playing.value || currentSoundscape.value !== 'penta') return
    const tNow = audioCtx.currentTime
    const freq = PENTA_NOTES[Math.floor(Math.random() * PENTA_NOTES.length)]
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, tNow)
    g.gain.exponentialRampToValueAtTime(0.08, tNow + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, tNow + 2.8)
    o.connect(g)
    g.connect(targetGain)
    o.start(tNow)
    o.stop(tNow + 3.0)

    const next = 2200 + Math.random() * 2600
    const tid = window.setTimeout(scheduleTwinkle, next)
    loopTimers.push(tid)
  }

  const tid = window.setTimeout(scheduleTwinkle, 1800)
  loopTimers.push(tid)
}

// 2. MƯA MÁI CHÙA (Rain)
function startRain(audioCtx: AudioContext, targetGain: GainNode) {
  const buffer = getOrCreateNoiseBuffer(audioCtx)
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1100
  filter.Q.value = 0.7

  const rainGain = audioCtx.createGain()
  rainGain.gain.value = 0.45

  source.connect(filter)
  filter.connect(rainGain)
  rainGain.connect(targetGain)

  source.start(0)
  soundscapeNodes.push(source, filter, rainGain)

  // Tiếng giọt nước nhỏ rơi lách tách
  function scheduleDrop() {
    if (!playing.value || currentSoundscape.value !== 'rain') return
    const tNow = audioCtx.currentTime
    const dropOsc = audioCtx.createOscillator()
    const dropGain = audioCtx.createGain()
    dropOsc.type = 'sine'
    dropOsc.frequency.setValueAtTime(1400 + Math.random() * 600, tNow)
    dropOsc.frequency.exponentialRampToValueAtTime(800, tNow + 0.06)

    dropGain.gain.setValueAtTime(0.0001, tNow)
    dropGain.gain.exponentialRampToValueAtTime(0.04, tNow + 0.01)
    dropGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.07)

    dropOsc.connect(dropGain)
    dropGain.connect(targetGain)
    dropOsc.start(tNow)
    dropOsc.stop(tNow + 0.08)

    const next = 200 + Math.random() * 500
    const tid = window.setTimeout(scheduleDrop, next)
    loopTimers.push(tid)
  }

  const tid = window.setTimeout(scheduleDrop, 400)
  loopTimers.push(tid)
}

// 3. SUỐI RỪNG TRÚC (Stream)
function startStream(audioCtx: AudioContext, targetGain: GainNode) {
  const buffer = getOrCreateNoiseBuffer(audioCtx)
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 650
  filter.Q.value = 1.2

  // LFO tạo nhịp sóng nước róc rách
  const lfo = audioCtx.createOscillator()
  lfo.frequency.value = 0.35
  const lfoGain = audioCtx.createGain()
  lfoGain.gain.value = 280
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start(0)

  const streamGain = audioCtx.createGain()
  streamGain.gain.value = 0.5

  source.connect(filter)
  filter.connect(streamGain)
  streamGain.connect(targetGain)

  source.start(0)
  soundscapeNodes.push(source, filter, lfo, lfoGain, streamGain)
}

// 4. CHUÔNG MÕ THANH TỊNH (Temple)
function startTemple(audioCtx: AudioContext, targetGain: GainNode) {
  // Gõ chuông định kỳ
  function chime() {
    if (!playing.value || currentSoundscape.value !== 'temple') return
    const tNow = audioCtx.currentTime
    const freqs = [432, 864, 1296]
    freqs.forEach((f, idx) => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.type = 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, tNow)
      g.gain.exponentialRampToValueAtTime(0.06 / (idx + 1), tNow + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, tNow + 4.5)
      o.connect(g)
      g.connect(targetGain)
      o.start(tNow)
      o.stop(tNow + 4.6)
    })

    const next = 6000 + Math.random() * 4000
    const tid = window.setTimeout(chime, next)
    loopTimers.push(tid)
  }

  // Tiếng mõ trầm xen kẽ
  function knock() {
    if (!playing.value || currentSoundscape.value !== 'temple') return
    const tNow = audioCtx.currentTime
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(320, tNow)
    o.frequency.exponentialRampToValueAtTime(140, tNow + 0.08)

    g.gain.setValueAtTime(0.0001, tNow)
    g.gain.exponentialRampToValueAtTime(0.09, tNow + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.12)

    o.connect(g)
    g.connect(targetGain)
    o.start(tNow)
    o.stop(tNow + 0.14)

    const next = 2000 + Math.random() * 2000
    const tid = window.setTimeout(knock, next)
    loopTimers.push(tid)
  }

  const tid1 = window.setTimeout(chime, 800)
  const tid2 = window.setTimeout(knock, 2400)
  loopTimers.push(tid1, tid2)
}

function applySoundscape() {
  if (!ctx || !master || !playing.value) return
  clearActiveSoundscape()

  switch (currentSoundscape.value) {
    case 'penta':
      startPenta(ctx, master)
      break
    case 'rain':
      startRain(ctx, master)
      break
    case 'stream':
      startStream(ctx, master)
      break
    case 'temple':
      startTemple(ctx, master)
      break
  }
}

export function useAmbientMusic() {
  function initAudio() {
    if (!import.meta.client) return
    try {
      const savedVol = localStorage.getItem('dco_ambient_volume')
      if (savedVol) volume.value = Number(savedVol)
      const savedSc = localStorage.getItem('dco_ambient_soundscape') as SoundscapeType
      if (savedSc && SOUNDSCAPE_OPTIONS.some((o) => o.id === savedSc)) {
        currentSoundscape.value = savedSc
      }
    } catch {}
  }

  function start() {
    if (playing.value || !import.meta.client) return
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    master = ctx.createGain()
    const volGain = (volume.value / 100) * 0.35
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volGain), now + 2)
    master.connect(ctx.destination)

    playing.value = true
    applySoundscape()
  }

  function stop() {
    if (!ctx || !master) {
      playing.value = false
      return
    }
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

    clearActiveSoundscape()
    window.setTimeout(() => {
      playing.value = false
    }, 1200)
  }

  function toggle() {
    if (playing.value) stop()
    else start()
  }

  function setVolume(val: number) {
    volume.value = Math.max(0, Math.min(100, val))
    if (import.meta.client) {
      localStorage.setItem('dco_ambient_volume', String(volume.value))
    }
    if (ctx && master && playing.value) {
      const now = ctx.currentTime
      const targetGain = (volume.value / 100) * 0.35
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(Math.max(0.0001, targetGain), now + 0.1)
    }
  }

  function setSoundscape(type: SoundscapeType) {
    if (currentSoundscape.value === type) return
    currentSoundscape.value = type
    if (import.meta.client) {
      localStorage.setItem('dco_ambient_soundscape', type)
    }
    if (playing.value) {
      applySoundscape()
    }
  }

  return {
    playing,
    volume,
    currentSoundscape,
    soundscapeOptions: SOUNDSCAPE_OPTIONS,
    initAudio,
    start,
    stop,
    toggle,
    setVolume,
    setSoundscape
  }
}

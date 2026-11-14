<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useFishPond, FISH_SPECIES } from '~/composables/useFishPond'
import { useModeration } from '~/composables/useModeration'
import type { PondFishItem } from '~/types/ecosystem'

const emit = defineEmits<{ (e: 'close'): void }>()

const { fishList, totalFishCount, speciesList, init, releaseFish, feedFish, getFishGrowthScale } = useFishPond()
const { sanitize, checkRateLimit } = useModeration()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedFish = ref<PondFishItem | null>(null)
const showReleaseModal = ref(false)
const showListModal = ref(false)

// Form thả cá mới
const newFishSpecies = ref(FISH_SPECIES[0].id)
const newFishName = ref('')
const newReleaserName = ref('')
const newWishNote = ref('')
const justReleased = ref(false)
const releaseError = ref('')

interface FoodParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

interface WaterRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

interface SimulatedFish {
  data: PondFishItem
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  targetAngle: number
  speed: number
  baseSpeed: number
  bodyPhase: number
  scale: number
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
}

let simulatedFish: SimulatedFish[] = []
let foods: FoodParticle[] = []
let ripples: WaterRipple[] = []
let animId = 0
let width = 800
let height = 550

function getSpecies(id: string) {
  return FISH_SPECIES.find((s) => s.id === id) || FISH_SPECIES[0]
}

function initSimulation() {
  init()
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  width = rect.width || 800
  height = rect.height || 550
  canvas.width = width
  canvas.height = height

  simulatedFish = fishList.value.map((f, idx) => {
    const sp = getSpecies(f.speciesId)
    const scale = getFishGrowthScale(f.releasedAt)
    const angle = Math.random() * Math.PI * 2
    const speed = sp.swimSpeedRange[0] + Math.random() * (sp.swimSpeedRange[1] - sp.swimSpeedRange[0])

    return {
      data: f,
      x: 100 + Math.random() * (width - 200),
      y: 80 + Math.random() * (height - 160),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      targetAngle: angle,
      speed,
      baseSpeed: speed,
      bodyPhase: Math.random() * Math.PI * 2,
      scale,
      primaryColor: sp.colors.primary,
      secondaryColor: sp.colors.secondary,
      accentColor: sp.colors.accent
    }
  })
}

function spawnRipple(x: number, y: number, maxR = 40) {
  ripples.push({
    x,
    y,
    radius: 5,
    maxRadius: maxR,
    alpha: 0.8
  })
}

function dropFoodAt(x: number, y: number) {
  for (let i = 0; i < 4; i++) {
    foods.push({
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 20 - 10),
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.3 + Math.random() * 0.4,
      life: 250 // khung hình tồn tại
    })
  }
  spawnRipple(x, y, 30)
}

function handleCanvasClick(e: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  // Kiểm tra xem có click trúng cá nào không
  let clickedOnFish = false
  for (const f of simulatedFish) {
    const dist = Math.hypot(f.x - clickX, f.y - clickY)
    if (dist < 32 * f.scale) {
      selectedFish.value = f.data
      feedFish(f.data.id)
      f.data.feedCount++
      spawnRipple(f.x, f.y, 45)
      clickedOnFish = true
      break
    }
  }

  // Nếu không trúng cá -> Rắc thức ăn xuống vị trí đó
  if (!clickedOnFish) {
    dropFoodAt(clickX, clickY)
  }
}

function drawFish(ctx: CanvasRenderingContext2D, f: SimulatedFish) {
  ctx.save()
  ctx.translate(f.x, f.y)
  ctx.rotate(f.angle)
  ctx.scale(f.scale, f.scale)

  const wiggle = Math.sin(f.bodyPhase) * 4
  const tailWiggle = Math.sin(f.bodyPhase - 0.8) * 8

  // Bóng cá dưới nước
  ctx.save()
  ctx.translate(8, 12)
  ctx.fillStyle = 'rgba(10, 25, 20, 0.25)'
  ctx.beginPath()
  ctx.ellipse(0, 0, 28, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 1. Vây ngực 2 bên (Pectoral fins)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  const finFlap = Math.sin(f.bodyPhase * 1.5) * 0.2
  // Vây trái
  ctx.save()
  ctx.translate(6, -8)
  ctx.rotate(-0.6 + finFlap)
  ctx.beginPath()
  ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Vây phải
  ctx.save()
  ctx.translate(6, 8)
  ctx.rotate(0.6 - finFlap)
  ctx.beginPath()
  ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 2. Đuôi cá mềm mại (Caudal fin)
  ctx.save()
  ctx.translate(-26, tailWiggle * 0.5)
  ctx.fillStyle = f.secondaryColor ? f.secondaryColor : f.primaryColor
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-14, -14, -22, -8)
  ctx.quadraticCurveTo(-18, 0, -24, 8)
  ctx.quadraticCurveTo(-14, 14, 0, 0)
  ctx.fill()
  ctx.globalAlpha = 1.0
  ctx.restore()

  // 3. Thân cá (Body)
  ctx.fillStyle = f.primaryColor
  ctx.beginPath()
  ctx.moveTo(28, 0) // Đầu cá
  ctx.quadraticCurveTo(10, -13, -12, -9 + wiggle * 0.2) // Lưng
  ctx.quadraticCurveTo(-22, -4 + wiggle * 0.5, -26, tailWiggle * 0.5) // Cuống đuôi
  ctx.quadraticCurveTo(-22, 4 + wiggle * 0.5, -12, 9 + wiggle * 0.2) // Bụng
  ctx.quadraticCurveTo(10, 13, 28, 0)
  ctx.fill()

  // Viền nhẹ thân cá
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 4. Các mảng đốm hoa văn (Spots)
  if (f.secondaryColor) {
    ctx.fillStyle = f.secondaryColor
    ctx.beginPath()
    ctx.ellipse(8, -2, 9, 6, 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(-8, 3, 7, 5, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Đốm đen Sumi nếu có (Taisho Sanke)
  if (f.accentColor && f.accentColor !== f.secondaryColor) {
    ctx.fillStyle = f.accentColor
    ctx.beginPath()
    ctx.arc(0, 4, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(-14, -3, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // 5. Mắt cá 2 bên
  ctx.fillStyle = '#1A1816'
  ctx.beginPath()
  ctx.arc(20, -5, 1.8, 0, Math.PI * 2)
  ctx.arc(20, 5, 1.8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Vẽ lá sen bồng bềnh trang trí
function drawLotusPads(ctx: CanvasRenderingContext2D) {
  const pads = [
    { x: 70, y: 70, r: 42, angle: 0.8 },
    { x: width - 80, y: 90, r: 50, angle: 2.1 },
    { x: 90, y: height - 80, r: 48, angle: 3.4 },
    { x: width - 90, y: height - 70, r: 45, angle: 5.0 }
  ]

  pads.forEach((p) => {
    ctx.save()
    ctx.translate(p.x, p.y)
    // Bóng lá sen
    ctx.fillStyle = 'rgba(10, 25, 20, 0.3)'
    ctx.beginPath()
    ctx.arc(4, 6, p.r, 0, Math.PI * 2)
    ctx.fill()

    // Thân lá sen xanh ngọc
    ctx.fillStyle = '#2D6A4F'
    ctx.beginPath()
    ctx.arc(0, 0, p.r, p.angle, p.angle + Math.PI * 1.85)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.fill()

    // Gân lá sen
    ctx.strokeStyle = '#40916C'
    ctx.lineWidth = 1.2
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * (p.r - 4), Math.sin(a) * (p.r - 4))
      ctx.stroke()
    }

    // Giọt sương đọng trên lá
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.beginPath()
    ctx.arc(p.r * 0.3, p.r * 0.2, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  })

  // Đóa hoa sen hồng nở rộ góc hồ
  ctx.save()
  ctx.translate(width - 95, 115)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.fillStyle = i % 2 === 0 ? '#E87A90' : '#F4A7B9'
    ctx.beginPath()
    ctx.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 12, 6, a, 0, Math.PI * 2)
    ctx.fill()
  }
  // Nhuỵ sen vàng
  ctx.fillStyle = '#F5B82E'
  ctx.beginPath()
  ctx.arc(0, 0, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function updateSimulation() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // 1. Nền nước hồ trong xanh ngọc bích
  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#123024')
  bg.addColorStop(0.5, '#1B4332')
  bg.addColorStop(1, '#0F261D')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // 2. Vẽ và cập nhật sóng nước gợn lan tỏa
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]
    r.radius += 0.8
    r.alpha *= 0.96
    if (r.radius >= r.maxRadius || r.alpha <= 0.05) {
      ripples.splice(i, 1)
      continue
    }
    ctx.save()
    ctx.strokeStyle = `rgba(200, 235, 220, ${r.alpha})`
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 3. Cập nhật và vẽ hạt thức ăn
  for (let i = foods.length - 1; i >= 0; i--) {
    const fd = foods[i]
    fd.x += fd.vx
    fd.y += fd.vy
    fd.life--
    if (fd.life <= 0 || fd.y > height - 10) {
      foods.splice(i, 1)
      continue
    }
    ctx.fillStyle = '#D4A373'
    ctx.beginPath()
    ctx.arc(fd.x, fd.y, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 4. Cập nhật đàn cá
  simulatedFish.forEach((f) => {
    f.bodyPhase += 0.12 * (f.speed / f.baseSpeed)

    // Nếu có thức ăn trong hồ: cá bơi hướng về hạt thức ăn gần nhất
    if (foods.length > 0) {
      let nearestFood: FoodParticle | null = null
      let minDist = 250
      for (const fd of foods) {
        const d = Math.hypot(fd.x - f.x, fd.y - f.y)
        if (d < minDist) {
          minDist = d
          nearestFood = fd
        }
      }

      if (nearestFood) {
        f.targetAngle = Math.atan2(nearestFood.y - f.y, nearestFood.x - f.x)
        f.speed = f.baseSpeed * 1.5 // Bơi nhanh hơn để đớp mồi
        if (minDist < 12) {
          // Ăn hạt thức ăn
          const idx = foods.indexOf(nearestFood)
          if (idx !== -1) foods.splice(idx, 1)
          spawnRipple(f.x, f.y, 25)
        }
      } else {
        f.speed = f.baseSpeed
      }
    } else {
      f.speed = f.baseSpeed
      // Đổi hướng ngẫu nhiên nhẹ nhàng
      if (Math.random() < 0.02) {
        f.targetAngle += (Math.random() - 0.5) * 1.2
      }
    }

    // Tránh bờ mép hồ
    const margin = 60
    if (f.x < margin) f.targetAngle = 0
    else if (f.x > width - margin) f.targetAngle = Math.PI
    if (f.y < margin) f.targetAngle = Math.PI / 2
    else if (f.y > height - margin) f.targetAngle = -Math.PI / 2

    // Xoay từ từ về góc mục tiêu (Smooth turning)
    let diff = f.targetAngle - f.angle
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    f.angle += diff * 0.05

    // Di chuyển
    f.x += Math.cos(f.angle) * f.speed
    f.y += Math.sin(f.angle) * f.speed

    // Giới hạn trong hồ
    f.x = Math.max(25, Math.min(width - 25, f.x))
    f.y = Math.max(25, Math.min(height - 25, f.y))

    drawFish(ctx, f)
  })

  // 5. Vẽ lá sen và hoa sen trang trí
  drawLotusPads(ctx)

  animId = requestAnimationFrame(updateSimulation)
}

function handleReleaseSubmit() {
  releaseError.value = ''

  const modWish = sanitize(newWishNote.value || 'Nguyện muôn loài tự tại an vui.')
  if (!modWish.isValid) {
    releaseError.value = modWish.error || 'Nội dung không hợp lệ.'
    return
  }

  const rate = checkRateLimit('release_fish', 3, 300)
  if (!rate.allowed) {
    releaseError.value = `Xin hãy hoan hỷ chờ ${rate.remainingSeconds} giây trước khi thả tiếp.`
    return
  }

  const cleanName = sanitize(newFishName.value || 'Cá Cát Tường').cleaned
  const cleanReleaser = sanitize(newReleaserName.value || 'Phật tử ẩn danh').cleaned

  const created = releaseFish(
    newFishSpecies.value,
    cleanName,
    cleanReleaser,
    modWish.cleaned
  )

  // Đưa chú cá mới vào simulation ngay lập tức
  const sp = getSpecies(created.speciesId)
  simulatedFish.unshift({
    data: created,
    x: width / 2,
    y: height / 2,
    vx: 1,
    vy: 1,
    angle: 0,
    targetAngle: 0,
    speed: sp.swimSpeedRange[0],
    baseSpeed: sp.swimSpeedRange[0],
    bodyPhase: 0,
    scale: 0.5, // cá con mới thả
    primaryColor: sp.colors.primary,
    secondaryColor: sp.colors.secondary,
    accentColor: sp.colors.accent
  })

  spawnRipple(width / 2, height / 2, 60)

  showReleaseModal.value = false
  justReleased.value = true
  setTimeout(() => (justReleased.value = false), 4000)

  // Reset form
  newFishName.value = ''
  newWishNote.value = ''
}

onMounted(() => {
  initSimulation()
  animId = requestAnimationFrame(updateSimulation)

  window.addEventListener('resize', initSimulation)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', initSimulation)
})
</script>

<template>
  <div class="card-zen relative flex flex-col overflow-hidden p-0 border border-dong/30 shadow-2xl bg-[#0D2118] text-kem rounded-2xl">
    <!-- Thanh điều hướng trên -->
    <div class="flex flex-wrap items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#0F261D]/90 backdrop-blur-sm z-10">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🐟</span>
        <div>
          <h3 class="font-serif text-lg font-semibold sm:text-xl text-dong">
            Hồ Cá Phóng Sinh Cát Tường
          </h3>
          <p class="text-[11px] text-kem/70 font-serif">
            Tổng cộng: <b class="text-dong">{{ totalFishCount }} chú cá</b> đang bơi lội an vui
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <!-- Nút Phóng sinh cá -->
        <button
          @click="showReleaseModal = true"
          class="btn-zen flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif shadow-glow"
        >
          <span>🪷</span> Phóng sinh cá
        </button>

        <!-- Nút Rắc thức ăn -->
        <button
          @click="dropFoodAt(width / 2, height / 2)"
          class="rounded-full border border-dong/40 bg-dong/15 px-3 py-1.5 font-serif text-dong hover:bg-dong/25 transition-colors"
          title="Rắc thức ăn xuống giữa hồ"
        >
          🌾 Rắc mồi
        </button>

        <!-- Xem danh sách cá -->
        <button
          @click="showListModal = true"
          class="rounded-full border border-white/20 bg-white/5 px-2.5 py-1.5 font-serif hover:bg-white/10 transition-colors"
          title="Danh sách cá trong hồ"
        >
          📋
        </button>

        <!-- Nút Đóng -->
        <button
          v-if="$attrs.onClose"
          @click="emit('close')"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-kem hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Màn hình Canvas chính hồ cá -->
    <div class="relative w-full h-[460px] sm:h-[520px] select-none cursor-crosshair">
      <canvas
        ref="canvasRef"
        @click="handleCanvasClick"
        class="h-full w-full block"
      />

      <!-- Gợi ý tương tác mờ ở góc dưới -->
      <div class="pointer-events-none absolute bottom-3 left-4 text-[11px] text-kem/50 font-serif">
        💡 Chạm vào mặt nước để rải thức ăn · Nhấp vào chú cá để chiêm ngưỡng lời nguyện
      </div>

      <!-- Thông báo khi vừa phóng sinh -->
      <transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div
          v-if="justReleased"
          class="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-dong/90 px-5 py-1.5 text-xs font-serif font-bold text-[#1F1710] shadow-lg backdrop-blur-sm"
        >
          ✓ Chú cá đã bơi vào hồ an lành! Công đức phóng sinh vô lượng.
        </div>
      </transition>
    </div>

    <!-- ================================================================= -->
    <!-- MODAL CHI TIẾT CHÚ CÁ KHI BẤM VÀO                                 -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="selectedFish"
        class="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="selectedFish = null"
      >
        <div class="w-full max-w-sm rounded-2xl border border-dong/40 bg-[#16291F] p-6 text-center text-kem shadow-2xl animate-fade-up">
          <span class="text-4xl">🐟</span>
          <h4 class="mt-2 font-serif text-2xl font-bold text-dong">
            {{ selectedFish.name }}
          </h4>
          <p class="text-xs text-kem/70 font-serif">
            Loài: {{ getSpecies(selectedFish.speciesId).name }}
          </p>

          <div class="my-4 rounded-xl border border-white/10 bg-black/25 p-3 text-left text-xs font-serif space-y-1.5">
            <p><span class="text-kem/60">Người thả:</span> <b>{{ selectedFish.releaserName }}</b></p>
            <p><span class="text-kem/60">Ý nghĩa:</span> <span class="text-dong">{{ getSpecies(selectedFish.speciesId).symbolism }}</span></p>
            <p><span class="text-kem/60">Số lần được cho ăn:</span> {{ selectedFish.feedCount }} lần</p>
            <p><span class="text-kem/60">Độ trưởng thành:</span> {{ Math.round(getFishGrowthScale(selectedFish.releasedAt) * 100) }}%</p>
            <div class="border-t border-white/10 pt-2 text-dong italic">
              "{{ selectedFish.wishNote || 'Nguyện muôn loài bình an tự tại.' }}"
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="dropFoodAt(width / 2, height / 2); selectedFish.feedCount++; selectedFish = null"
              class="btn-zen flex-1 py-2 text-xs font-serif"
            >
              🌾 Cho cá ăn
            </button>
            <button
              @click="selectedFish = null"
              class="rounded-xl border border-white/20 px-4 py-2 text-xs font-serif hover:bg-white/10"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ================================================================= -->
    <!-- MODAL PHÓNG SINH CÁ MỚI                                           -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="showReleaseModal"
        class="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="showReleaseModal = false"
      >
        <div class="w-full max-w-md rounded-2xl border border-dong/40 bg-[#162E22] p-6 text-kem shadow-2xl animate-fade-up">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 class="font-serif text-lg font-bold text-dong flex items-center gap-2">
              <span>🪷</span> Phóng Sinh Cá Thiện Lành
            </h4>
            <button @click="showReleaseModal = false" class="text-kem/60 hover:text-kem">✕</button>
          </div>

          <p class="mt-3 text-xs text-kem/80 font-serif leading-relaxed">
            Phóng sinh ảo khởi phát tâm từ bi, không cần tốn tiền tài, nguyện cho muôn loài được tự do bơi lội an vui.
          </p>

          <!-- Chọn loài cá -->
          <div class="mt-4">
            <label class="block text-xs font-serif text-dong mb-1.5">Chọn giống cá:</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="sp in speciesList"
                :key="sp.id"
                @click="newFishSpecies = sp.id"
                type="button"
                class="rounded-xl border p-2 text-left text-xs font-serif transition-all"
                :class="
                  newFishSpecies === sp.id
                    ? 'border-dong bg-dong/25 text-dong shadow-sm font-semibold'
                    : 'border-white/10 bg-white/5 text-kem/70 hover:bg-white/10'
                "
              >
                <div class="font-medium text-kem">{{ sp.name }}</div>
                <div class="text-[10px] text-dong/90 mt-0.5">{{ sp.symbolism }}</div>
              </button>
            </div>
          </div>

          <!-- Đặt tên cá -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1">Tên bạn đặt cho cá:</label>
            <input
              v-model="newFishName"
              type="text"
              placeholder="Ví dụ: An Lạc, Cát Tường, Như Ý..."
              class="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-xs text-kem focus:border-dong focus:outline-none font-serif"
            />
          </div>

          <!-- Tên người phóng sinh -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1">Tên người phát tâm (hoặc ẩn danh):</label>
            <input
              v-model="newReleaserName"
              type="text"
              placeholder="Phật tử ẩn danh"
              class="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-xs text-kem focus:border-dong focus:outline-none font-serif"
            />
          </div>

          <!-- Lời nguyện thiện lành -->
          <div class="mt-3">
            <label class="block text-xs font-serif text-dong mb-1">Lời nguyện lành khi thả cá:</label>
            <textarea
              v-model="newWishNote"
              rows="2"
              placeholder="Nguyện cầu cha mẹ bình an, muôn loài chúng sinh dứt trừ khổ nạn..."
              class="w-full rounded-xl border border-white/20 bg-black/30 p-2.5 text-xs text-kem focus:border-dong focus:outline-none font-serif"
            />
          </div>

          <!-- Lỗi kiểm duyệt nếu có -->
          <p v-if="releaseError" class="mt-2 text-xs text-red-400 font-serif">
            {{ releaseError }}
          </p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              @click="showReleaseModal = false"
              class="rounded-xl border border-white/20 px-4 py-2 text-xs font-serif hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              @click="handleReleaseSubmit"
              class="btn-zen px-6 py-2 text-xs font-serif shadow-glow"
            >
              Xác nhận phóng sinh
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ================================================================= -->
    <!-- MODAL DANH SÁCH TẤT CẢ CÁ TRONG HỒ                               -->
    <!-- ================================================================= -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="showListModal"
        class="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
        @click.self="showListModal = false"
      >
        <div class="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-dong/40 bg-[#14261C] p-5 text-kem shadow-2xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 class="font-serif text-base font-bold text-dong flex items-center gap-2">
              <span>🐟</span> Đàn Cá Đang Sống Trong Hồ ({{ fishList.length }})
            </h4>
            <button @click="showListModal = false" class="text-kem/60 hover:text-kem">✕</button>
          </div>

          <div class="flex-1 overflow-y-auto my-3 space-y-2 pr-1 text-xs font-serif">
            <div
              v-for="fish in fishList"
              :key="fish.id"
              class="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center justify-between gap-3 hover:border-dong/40 transition-colors"
            >
              <div>
                <div class="font-bold text-dong text-sm flex items-center gap-1.5">
                  <span>{{ fish.name }}</span>
                  <span class="text-[10px] font-normal text-kem/60">({{ getSpecies(fish.speciesId).name }})</span>
                </div>
                <p class="text-kem/80 italic mt-0.5 line-clamp-1">"{{ fish.wishNote }}"</p>
                <div class="text-[10px] text-kem/50 mt-1">
                  Người thả: {{ fish.releaserName }} · Trưởng thành: {{ Math.round(getFishGrowthScale(fish.releasedAt) * 100) }}%
                </div>
              </div>

              <button
                @click="feedFish(fish.id); fish.feedCount++; showListModal = false; dropFoodAt(width / 2, height / 2)"
                class="whitespace-nowrap rounded-lg border border-dong/40 bg-dong/15 px-2.5 py-1 text-[11px] text-dong hover:bg-dong/30"
              >
                🌾 Cho ăn
              </button>
            </div>
          </div>

          <button
            @click="showListModal = false"
            class="rounded-xl border border-white/20 py-2 text-xs font-serif hover:bg-white/10 text-center"
          >
            Đóng
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>


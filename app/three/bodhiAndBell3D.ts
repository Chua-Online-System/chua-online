/**
 * Module 3D Vườn Bồ Đề Tâm & Lầu Đại Hồng Chung (Phase 3)
 * Kiến trúc sinh thái & tâm linh 3D chi tiết:
 * 1. Lầu Chuông Đại Hồng Chung (Grand Bell Tower):
 *    - Lầu 2 tầng mái đao cong vút cổ truyền, 4 đại trụ gỗ lim trên bệ đá bậc ngũ cấp
 *    - Quả Đại Hồng Chung bằng đồng khổng lồ (cao 2.8m) chạm khắc hoa văn thiền môn
 *    - Dùi gỗ lim treo dây thừng đỏ với chuyển động vật lý va đập thực tế
 *    - Vòng sóng âm phát quang (Visual Shockwave) lan tỏa 25m khi điểm chuông
 * 2. Vườn Bồ Đề Tâm & Cây Đại Thụ Nguyện Ước (Sacred Bodhi Tree Sanctuary):
 *    - Cây Bồ Đề cổ thụ thân to lớn, rễ nổi uốn lượn, tán lá sum suê tỏa bóng mát
 *    - Hàng chục dải lụa đỏ & vàng nguyện ước đung đưa mềm mại theo gió tự nhiên
 *    - Hiệu ứng lá Bồ Đề vàng rơi lượn bay trong không khí
 *    - Đài nước / giếng ngọc đá múc nước tưới cây với hiệu ứng rễ phát sáng hào quang
 *    - Bàn đá nguyện ước kết nối gửi lời cầu an lên Supabase
 */
import * as THREE from 'three'
import type { Interactive, World } from './world'

export interface BodhiAndBell3DController {
  ringBell: () => void
  waterTree: () => { success: boolean }
  addRibbon: (wish: string, author: string, color: 'red' | 'yellow' | 'white') => void
  getRibbonCount: () => number
}

// Bảng màu kiến trúc & thiên nhiên
const C = {
  limWood: 0x3d1d0e,
  darkWood: 0x2b1409,
  tileRed: 0x8a3324,
  tileRidge: 0x541e15,
  stonePlinth: 0x7a756c,
  stoneSteps: 0x969085,
  bronzeBell: 0xa88732,
  bronzeDark: 0x5e4817,
  goldSpire: 0xf5c038,
  strikerWood: 0x5c3317,
  ropeRed: 0xb71c1c,
  bodhiTrunk: 0x4a3a2a,
  bodhiRoot: 0x3d2f21,
  bodhiFoliage1: 0x2e6629,
  bodhiFoliage2: 0x3c7d36,
  bodhiFoliage3: 0x4a9443,
  fallingLeaf: 0xd4af37,
  wellStone: 0x615b52,
  waterCyan: 0x48a9a6,
  ribbonRed: 0xd32f2f,
  ribbonYellow: 0xfbc02d,
  ribbonWhite: 0xf5f5f5
}

function makeBox(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

interface Ribbon3D {
  mesh: THREE.Mesh
  phase: number
  speed: number
  baseAngle: number
}

interface FallingLeaf {
  mesh: THREE.Mesh
  velY: number
  velX: number
  velZ: number
  spinSpeed: number
  startY: number
}

interface ShockwaveRing {
  mesh: THREE.Mesh
  scale: number
  opacity: number
}

/**
 * XÂY DỰNG TOÀN BỘ PHÂN KHU VƯỜN BỒ ĐỀ & LẦU CHUÔNG (PHASE 3)
 */
export function buildBodhiAndBell3D(
  root: THREE.Group,
  floorY: number,
  updaters: World['updaters'],
  interactives: Interactive[],
  onRingBellSound?: () => void
): BodhiAndBell3DController {
  const eastWingGroup = new THREE.Group()
  root.add(eastWingGroup)

  // =========================================================================
  // 1. LẦU CHUÔNG ĐẠI HỒNG CHUNG 2 TẦNG (Tọa độ: X: 48, Z: 28)
  // =========================================================================
  const BELL_X = 48
  const BELL_Z = 28
  const bellTowerGroup = new THREE.Group()
  bellTowerGroup.position.set(BELL_X, floorY, BELL_Z)
  eastWingGroup.add(bellTowerGroup)

  const matLim = new THREE.MeshStandardMaterial({ color: C.limWood, roughness: 0.75 })
  const matDarkLim = new THREE.MeshStandardMaterial({ color: C.darkWood, roughness: 0.85 })
  const matTile = new THREE.MeshStandardMaterial({ color: C.tileRed, roughness: 0.7 })
  const matStonePlinth = new THREE.MeshStandardMaterial({ color: C.stonePlinth, roughness: 0.9 })
  const matStoneStep = new THREE.MeshStandardMaterial({ color: C.stoneSteps, roughness: 0.85 })
  const matBronze = new THREE.MeshStandardMaterial({ color: C.bronzeBell, roughness: 0.35, metalness: 0.75 })

  // --- 1.1. Bệ đá tam cấp ngũ giác vuông ---
  const BASE_SIZE = 9.4
  const plinth = makeBox(BASE_SIZE, 0.6, BASE_SIZE, matStonePlinth, 0, 0.3, 0)
  bellTowerGroup.add(plinth)

  // Bậc thang đá 4 hướng
  for (const side of [
    { x: 0, z: BASE_SIZE / 2 + 0.6, rot: 0 },
    { x: 0, z: -(BASE_SIZE / 2 + 0.6), rot: Math.PI },
    { x: -(BASE_SIZE / 2 + 0.6), z: 0, rot: -Math.PI / 2 },
    { x: BASE_SIZE / 2 + 0.6, z: 0, rot: Math.PI / 2 }
  ]) {
    for (let st = 0; st < 3; st++) {
      const step = makeBox(4.2 - st * 0.4, 0.2, 0.4, matStoneStep, side.x, 0.1 + st * 0.2, side.z)
      if (side.rot !== 0) step.rotation.y = side.rot
      bellTowerGroup.add(step)
    }
  }

  // Sàn gỗ lầu 1
  const floor1 = makeBox(BASE_SIZE - 0.6, 0.18, BASE_SIZE - 0.6, matLim, 0, 0.68, 0)
  bellTowerGroup.add(floor1)

  // --- 1.2. Tầng 1: 4 Đại Cột Gỗ Lim & Lan Can ---
  const COL_OFFSET_1 = 3.4
  const COL_H_1 = 4.8
  const COL_R_1 = 0.32

  const colGeo1 = new THREE.CylinderGeometry(COL_R_1, COL_R_1 * 1.08, COL_H_1, 16)
  for (const dx of [-COL_OFFSET_1, COL_OFFSET_1]) {
    for (const dz of [-COL_OFFSET_1, COL_OFFSET_1]) {
      // Chân tảng đá đỡ cột
      const baseStone = new THREE.Mesh(new THREE.CylinderGeometry(COL_R_1 * 1.35, COL_R_1 * 1.5, 0.25, 16), matStonePlinth)
      baseStone.position.set(dx, 0.78, dz)
      const col = new THREE.Mesh(colGeo1, matLim)
      col.position.set(dx, 0.7 + COL_H_1 / 2, dz)
      col.castShadow = true
      bellTowerGroup.add(baseStone, col)
    }
  }

  // Khung dầm xà xâu tầng 1
  for (const dz of [-COL_OFFSET_1, COL_OFFSET_1]) {
    bellTowerGroup.add(makeBox(COL_OFFSET_1 * 2 + 0.6, 0.35, 0.35, matDarkLim, 0, 5.2, dz))
  }
  for (const dx of [-COL_OFFSET_1, COL_OFFSET_1]) {
    bellTowerGroup.add(makeBox(0.35, 0.35, COL_OFFSET_1 * 2 + 0.6, matDarkLim, dx, 5.2, 0))
  }

  // Lan can con tiện gỗ tầng 1 (3 phía, chừa phía Tây để bước lên)
  for (const side of [
    { x: 0, z: COL_OFFSET_1, w: COL_OFFSET_1 * 2, d: 0.18 },
    { x: 0, z: -COL_OFFSET_1, w: COL_OFFSET_1 * 2, d: 0.18 },
    { x: COL_OFFSET_1, z: 0, w: 0.18, d: COL_OFFSET_1 * 2 }
  ]) {
    const rail = makeBox(side.w, 0.9, side.d, matLim, side.x, 1.2, side.z)
    bellTowerGroup.add(rail)
  }

  // --- 1.3. Mái Tầng 1 (Mái Hạ xòe rộng với 4 góc đao cong) ---
  const ROOF_1_W = 10.6
  const roof1 = makeBox(ROOF_1_W, 0.55, ROOF_1_W, matTile, 0, 5.5, 0)
  bellTowerGroup.add(roof1)

  // 4 góc đao vuốt cong mái hạ
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const eave = makeBox(1.8, 0.3, 1.8, matTile, sx * (ROOF_1_W / 2 + 0.4), 5.75, sz * (ROOF_1_W / 2 + 0.4))
      eave.rotation.x = -sz * 0.25
      eave.rotation.z = sx * 0.25
      bellTowerGroup.add(eave)
    }
  }

  // --- 1.4. Tầng 2 (Lầu Thượng treo chuông): 4 cột lầu & Mái Thượng đao cong vút ---
  const COL_OFFSET_2 = 2.4
  const COL_H_2 = 3.6
  const COL_R_2 = 0.26
  const colGeo2 = new THREE.CylinderGeometry(COL_R_2, COL_R_2 * 1.05, COL_H_2, 16)

  for (const dx of [-COL_OFFSET_2, COL_OFFSET_2]) {
    for (const dz of [-COL_OFFSET_2, COL_OFFSET_2]) {
      const col2 = new THREE.Mesh(colGeo2, matLim)
      col2.position.set(dx, 5.8 + COL_H_2 / 2, dz)
      col2.castShadow = true
      bellTowerGroup.add(col2)
    }
  }

  // Dầm thượng xà chịu lực treo chuông
  const mainBeam = makeBox(COL_OFFSET_2 * 2 + 0.8, 0.45, 0.45, matDarkLim, 0, 9.15, 0)
  bellTowerGroup.add(mainBeam)

  // Mái Thượng (Mái 2) cao vút
  const ROOF_2_W = 8.2
  const roof2 = makeBox(ROOF_2_W, 0.65, ROOF_2_W, matTile, 0, 9.6, 0)
  const roofCap = makeBox(ROOF_2_W * 0.6, 0.6, ROOF_2_W * 0.6, matTile, 0, 10.1, 0)
  bellTowerGroup.add(roof2, roofCap)

  // 4 đầu đao cong vút mái thượng
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const eave2 = makeBox(1.9, 0.32, 1.9, matTile, sx * (ROOF_2_W / 2 + 0.35), 9.9, sz * (ROOF_2_W / 2 + 0.35))
      eave2.rotation.x = -sz * 0.32
      eave2.rotation.z = sx * 0.32
      bellTowerGroup.add(eave2)
    }
  }

  // Chóp hồ lô / bông sen đồng vàng óng trên đỉnh nóc
  const spireMat = new THREE.MeshStandardMaterial({ color: C.goldSpire, roughness: 0.3, metalness: 0.8 })
  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.5, 12), spireMat)
  spireBase.position.y = 10.55
  const spireBall = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), spireMat)
  spireBall.position.y = 10.95
  const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 12), spireMat)
  spireTip.position.y = 11.45
  bellTowerGroup.add(spireBase, spireBall, spireTip)

  // --- 1.5. QUẢ ĐẠI HỒNG CHUNG BẰNG ĐỒNG KHỔNG LỒ ---
  const bellPivot = new THREE.Group()
  bellPivot.position.set(0, 9.15, 0) // Treo từ dầm thượng xà
  bellTowerGroup.add(bellPivot)

  // Quai chuông rồng Bồ Lao bằng đồng
  const hanger = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.12, 12, 24, Math.PI), matBronze)
  hanger.rotation.x = Math.PI / 2
  hanger.position.y = -0.25
  bellPivot.add(hanger)

  // Thân chuông đồng
  const bellBodyGroup = new THREE.Group()
  bellPivot.add(bellBodyGroup)

  const BELL_H = 2.7
  // Đỉnh vòm chuông
  const bellDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    matBronze
  )
  bellDome.position.y = -0.6
  // Thân hình chuông loe dần xuống đáy
  const bellCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 1.18, BELL_H - 0.6, 28, 4, true),
    matBronze
  )
  bellCylinder.position.y = -0.6 - (BELL_H - 0.6) / 2
  // Vành miệng chuông đúc dày
  const bellLip = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.14, 14, 32),
    new THREE.MeshStandardMaterial({ color: C.bronzeDark, roughness: 0.45, metalness: 0.7 })
  )
  bellLip.rotation.x = Math.PI / 2
  bellLip.position.y = -BELL_H
  // Hoa văn chữ Vạn & núm gõ chuông 4 hướng
  const knobMat = new THREE.MeshStandardMaterial({ color: C.bronzeDark, roughness: 0.4, metalness: 0.8 })
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.12, 12), knobMat)
    knob.rotation.z = Math.PI / 2
    knob.position.set(Math.cos(ang) * 1.05, -2.0, Math.sin(ang) * 1.05)
    bellBodyGroup.add(knob)
  }
  bellBodyGroup.add(bellDome, bellCylinder, bellLip)

  // --- 1.6. DÙI GỖ LIM (LOG STRIKER) TREO BẰNG DÂY THỪNG ĐỎ ---
  const strikerPivot = new THREE.Group()
  strikerPivot.position.set(-1.85, 9.15, 0)
  bellTowerGroup.add(strikerPivot)

  // 2 dây thừng đỏ treo dùi
  const ropeMat = new THREE.MeshStandardMaterial({ color: C.ropeRed, roughness: 0.8 })
  const rope1 = makeBox(0.06, 6.2, 0.06, ropeMat, 0, -3.1, -0.65)
  const rope2 = makeBox(0.06, 6.2, 0.06, ropeMat, 0, -3.1, 0.65)
  strikerPivot.add(rope1, rope2)

  // Khúc gỗ lim đầm chắc
  const strikerGroup = new THREE.Group()
  strikerGroup.position.set(0, -6.2, 0)
  strikerPivot.add(strikerGroup)

  const STRIKER_LEN = 2.4
  const strikerLog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, STRIKER_LEN, 16),
    new THREE.MeshStandardMaterial({ color: C.strikerWood, roughness: 0.7 })
  )
  strikerLog.rotation.x = Math.PI / 2
  // Đầu gõ chuông bọc đồng vàng
  const strikerHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.35, 16),
    matBronze
  )
  strikerHead.rotation.x = Math.PI / 2
  strikerHead.position.z = STRIKER_LEN / 2 - 0.15
  strikerGroup.add(strikerLog, strikerHead)

  // --- 1.7. VẬT LÝ DAO ĐỘNG CHUÔNG & DÙI GỖ ---
  let bellVel = 0
  let bellAngle = 0
  let strikerVel = 0
  let strikerAngle = 0
  let isStriking = false

  function triggerBellPhysicalImpact() {
    isStriking = true
    strikerVel = 4.2 // Lực vung dùi về phía chuông
    if (onRingBellSound) {
      setTimeout(() => onRingBellSound(), 320)
    }
  }

  // --- 1.8. VÒNG SÓNG ÂM PHÁT QUANG (VISUAL SOUND SHOCKWAVES) ---
  const shockwaves: ShockwaveRing[] = []
  const shockwaveGeo = new THREE.RingGeometry(0.8, 1.25, 36)
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: 0xffe082,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  function emitShockwave() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ring = new THREE.Mesh(shockwaveGeo, shockwaveMat.clone())
        ring.rotation.x = -Math.PI / 2
        ring.position.set(BELL_X, floorY + 4.2, BELL_Z)
        eastWingGroup.add(ring)
        shockwaves.push({ mesh: ring, scale: 1.0, opacity: 0.9 })
      }, i * 160)
    }
  }

  updaters.push((_t, dt) => {
    // 1. Cập nhật dùi gỗ
    if (isStriking) {
      const spring = -18 * strikerAngle - 2.2 * strikerVel
      strikerVel += spring * dt
      strikerAngle += strikerVel * dt

      // Khi dùi vung chạm tới thành chuông
      if (strikerAngle > 0.42) {
        strikerAngle = 0.42
        strikerVel = -strikerVel * 0.45 // Nảy ngược lại
        bellVel += 0.85 // Truyền động lượng làm chuông rung
        emitShockwave()
        isStriking = false
      }
      strikerPivot.rotation.z = -strikerAngle
    } else {
      // Dùi đung đưa tắt dần về vị trí nghỉ
      const dampSpring = -12 * strikerAngle - 1.8 * strikerVel
      strikerVel += dampSpring * dt
      strikerAngle += strikerVel * dt
      strikerPivot.rotation.z = -strikerAngle
    }

    // 2. Cập nhật chuông lắc lư tắt dần
    const bellSpring = -16 * bellAngle - 1.4 * bellVel
    bellVel += bellSpring * dt
    bellAngle += bellVel * dt
    bellPivot.rotation.z = bellAngle

    // 3. Cập nhật vòng sóng âm lan tỏa
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i]
      s.scale += dt * 14.5
      s.opacity -= dt * 0.45
      s.mesh.scale.set(s.scale, s.scale, s.scale)
      ;(s.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, s.opacity)

      if (s.opacity <= 0 || s.scale > 26) {
        eastWingGroup.remove(s.mesh)
        shockwaves.splice(i, 1)
      }
    }
  })

  // Điểm tương tác thỉnh chuông Lầu Chuông
  const bellHit = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 4.0, 4.2),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  bellHit.position.set(BELL_X, floorY + 1.8, BELL_Z)
  eastWingGroup.add(bellHit)
  interactives.push({
    object: bellHit,
    action: 'bell_ring',
    label: '🔔 Thỉnh Đại Hồng Chung',
    focus: new THREE.Vector3(BELL_X, floorY + 1.8, BELL_Z)
  })

  // =========================================================================
  // 2. VƯỜN BỒ ĐỀ TÂM & CÂY ĐẠI THỤ NGUYỆN ƯỚC (Tọa độ: X: 64, Z: -12)
  // =========================================================================
  const BODHI_X = 64
  const BODHI_Z = -12
  const bodhiGroup = new THREE.Group()
  bodhiGroup.position.set(BODHI_X, floorY, BODHI_Z)
  eastWingGroup.add(bodhiGroup)

  // --- 2.1. Gò đồi đất tròn cỏ xanh & Bờ đá thiên nhiên ---
  const MOUND_R = 13.5
  const moundGeo = new THREE.CylinderGeometry(MOUND_R * 0.92, MOUND_R, 0.9, 32)
  const moundMat = new THREE.MeshStandardMaterial({
    color: 0x3d5c2e,
    roughness: 0.95
  })
  const mound = new THREE.Mesh(moundGeo, moundMat)
  mound.position.y = 0.45
  bodhiGroup.add(mound)

  // Đai đá cuội thiên nhiên bao quanh chân gò Bồ Đề
  const boulderMat = new THREE.MeshStandardMaterial({ color: 0x5a544d, roughness: 0.9 })
  for (let b = 0; b < 28; b++) {
    const ang = (b / 28) * Math.PI * 2
    const bx = Math.cos(ang) * (MOUND_R - 0.2)
    const bz = Math.sin(ang) * (MOUND_R - 0.2)
    const sz = 0.8 + Math.sin(b * 3) * 0.25
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 1), boulderMat)
    rock.position.set(bx, 0.4, bz)
    rock.rotation.set(b * 0.4, b * 0.6, 0)
    bodhiGroup.add(rock)
  }

  // --- 2.2. THÂN CÂY BỒ ĐỀ ĐẠI THỤ CỔ KÍNH ---
  const trunkMat = new THREE.MeshStandardMaterial({
    color: C.bodhiTrunk,
    roughness: 0.96
  })
  const rootMat = new THREE.MeshStandardMaterial({
    color: C.bodhiRoot,
    roughness: 0.95
  })

  // Thân chính cổ thụ xù xì, xoắn vặn tự nhiên
  const trunkSegments = [
    { yBottom: 0.6, yTop: 2.2, rB: 1.55, rT: 1.35, dx: 0, dz: 0 },
    { yBottom: 2.2, yTop: 4.2, rB: 1.35, rT: 1.15, dx: 0.15, dz: -0.1 },
    { yBottom: 4.2, yTop: 6.4, rB: 1.15, rT: 0.95, dx: 0.35, dz: 0.1 }
  ]

  for (const seg of trunkSegments) {
    const tMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(seg.rT, seg.rB, seg.yTop - seg.yBottom, 18),
      trunkMat
    )
    tMesh.position.set(seg.dx, (seg.yBottom + seg.yTop) / 2, seg.dz)
    tMesh.castShadow = true
    bodhiGroup.add(tMesh)
  }

  // Bộ rễ nổi cuồn cuộn bò lan ra mặt đất
  for (let r = 0; r < 8; r++) {
    const rAng = (r / 8) * Math.PI * 2 + 0.2
    const rLen = 3.6 + (r % 3) * 0.8
    const rX = Math.cos(rAng) * (rLen / 2 + 0.6)
    const rZ = Math.sin(rAng) * (rLen / 2 + 0.6)
    const rootMesh = makeBox(0.42, 0.55, rLen, rootMat, rX, 0.72, rZ)
    rootMesh.rotation.y = -rAng + Math.PI / 2
    rootMesh.rotation.z = (Math.random() - 0.5) * 0.12
    bodhiGroup.add(rootMesh)
  }

  // --- 2.3. HỆ CÀNH LỚN & VÒM TÁN LÁ BỒ ĐỀ RỢP BÓNG ---
  const foliageMats = [
    new THREE.MeshStandardMaterial({ color: C.bodhiFoliage1, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: C.bodhiFoliage2, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: C.bodhiFoliage3, roughness: 0.8 })
  ]

  interface Bough {
    x: number
    y: number
    z: number
    spanX: number
    spanZ: number
    canopyR: number
  }

  const boughs: Bough[] = [
    { x: 2.8, y: 5.6, z: 2.2, spanX: 4.8, spanZ: 3.8, canopyR: 4.6 },
    { x: -3.2, y: 5.8, z: 2.6, spanX: -5.4, spanZ: 4.2, canopyR: 4.8 },
    { x: -3.6, y: 6.2, z: -2.8, spanX: -5.8, spanZ: -4.6, canopyR: 5.2 },
    { x: 3.4, y: 6.0, z: -3.2, spanX: 5.6, spanZ: -5.0, canopyR: 5.0 },
    { x: 0.2, y: 7.2, z: 3.8, spanX: 0.4, spanZ: 6.4, canopyR: 4.5 },
    { x: -0.4, y: 7.5, z: -4.0, spanX: -0.6, spanZ: -6.8, canopyR: 4.6 },
    { x: 0.0, y: 8.8, z: 0.0, spanX: 0.0, spanZ: 0.0, canopyR: 5.8 } // Vòm chóp trung tâm
  ]

  for (const b of boughs) {
    if (b.spanX !== 0 || b.spanZ !== 0) {
      // Cành gỗ vươn dài
      const bDist = Math.hypot(b.spanX, b.spanZ)
      const bBranch = makeBox(0.48, 0.48, bDist, trunkMat, b.spanX / 2, b.y, b.spanZ / 2)
      bBranch.rotation.y = Math.atan2(b.spanX, b.spanZ)
      bBranch.rotation.x = 0.15
      bodhiGroup.add(bBranch)
    }

    // Tán lá xanh xòe tròn xếp lớp
    const canopyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(b.canopyR, 14, 10),
      foliageMats[Math.floor(Math.random() * foliageMats.length)]
    )
    canopyMesh.scale.set(1.15, 0.65, 1.15)
    canopyMesh.position.set(b.spanX, b.y + 0.8, b.spanZ)
    canopyMesh.castShadow = true
    bodhiGroup.add(canopyMesh)
  }

  // --- 2.4. HÀNG CHỤC DẢI LỤA ĐỎ & VÀNG NGUYỆN ƯỚC (PRAYER RIBBONS) ---
  const ribbonsGroup = new THREE.Group()
  bodhiGroup.add(ribbonsGroup)

  const ribbons3D: Ribbon3D[] = []

  const ribbonMatRed = new THREE.MeshStandardMaterial({
    color: C.ribbonRed,
    roughness: 0.65,
    side: THREE.DoubleSide
  })
  const ribbonMatYellow = new THREE.MeshStandardMaterial({
    color: C.ribbonYellow,
    roughness: 0.65,
    side: THREE.DoubleSide
  })
  const ribbonMatWhite = new THREE.MeshStandardMaterial({
    color: C.ribbonWhite,
    roughness: 0.65,
    side: THREE.DoubleSide
  })

  function createRibbonMesh(
    x: number,
    y: number,
    z: number,
    color: 'red' | 'yellow' | 'white'
  ): Ribbon3D {
    const rGroup = new THREE.Group()
    rGroup.position.set(x, y, z)

    const mat = color === 'red' ? ribbonMatRed : color === 'yellow' ? ribbonMatYellow : ribbonMatWhite

    // Nút thắt vải trên cành cây
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat)
    rGroup.add(knot)

    // Dải lụa mềm buông dài
    const RIBBON_LEN = 1.6 + Math.random() * 0.6
    const ribGeo = new THREE.PlaneGeometry(0.18, RIBBON_LEN, 1, 6)
    // Đặt trục xoay ở đầu trên
    ribGeo.translate(0, -RIBBON_LEN / 2, 0)
    const ribMesh = new THREE.Mesh(ribGeo, mat)
    ribMesh.castShadow = true
    rGroup.add(ribMesh)

    ribbonsGroup.add(rGroup)

    const baseAng = (Math.random() - 0.5) * 0.3
    const phase = Math.random() * Math.PI * 2
    const speed = 1.4 + Math.random() * 0.8

    return {
      mesh: rGroup as any,
      phase,
      speed,
      baseAngle: baseAng
    }
  }

  // Khởi tạo 24 dải lụa nguyện ước rủ từ các nhánh bồ đề
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.25
    const dist = 3.2 + Math.random() * 3.8
    const rx = Math.cos(ang) * dist
    const rz = Math.sin(ang) * dist
    const ry = 4.8 + Math.random() * 1.6
    const colorType: 'red' | 'yellow' | 'white' = i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'red' : 'white'
    ribbons3D.push(createRibbonMesh(rx, ry, rz, colorType))
  }

  // --- 2.5. LÁ BỒ ĐỀ VÀNG RƠI LƯỢN TRONG KHÔNG GIAN ---
  const leavesGroup = new THREE.Group()
  bodhiGroup.add(leavesGroup)

  const leaves: FallingLeaf[] = []
  const leafMat = new THREE.MeshStandardMaterial({
    color: C.fallingLeaf,
    roughness: 0.6,
    side: THREE.DoubleSide
  })
  const leafGeo = new THREE.PlaneGeometry(0.24, 0.32)

  for (let l = 0; l < 22; l++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    const startY = 5.0 + Math.random() * 4.0
    const startX = (Math.random() - 0.5) * 12.0
    const startZ = (Math.random() - 0.5) * 12.0
    leaf.position.set(startX, startY, startZ)
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    leavesGroup.add(leaf)

    leaves.push({
      mesh: leaf,
      velY: -(0.55 + Math.random() * 0.45),
      velX: (Math.random() - 0.5) * 0.25,
      velZ: (Math.random() - 0.5) * 0.25,
      spinSpeed: 1.2 + Math.random() * 1.8,
      startY
    })
  }

  // --- 2.6. BÀN ĐÁ NGUYỆN ƯỚC & GIẾNG NGỌC TƯỚI CÂY ---
  // Bàn đá nguyện ước (X: -4.5, Z: -3.5 so với gốc Bồ Đề)
  const altarTable = makeBox(2.8, 0.9, 1.4, matStoneStep, -4.2, 0.9, -3.2)
  altarTable.rotation.y = 0.45
  bodhiGroup.add(altarTable)

  // Khay lụa ngũ sắc trên bàn đá
  const tray = makeBox(1.1, 0.08, 0.7, matLim, -4.2, 1.4, -3.2)
  tray.rotation.y = 0.45
  bodhiGroup.add(tray)

  // Giếng ngọc đá múc nước tưới cây (X: -4.8, Z: 3.2 so với gốc)
  const wellGroup = new THREE.Group()
  wellGroup.position.set(-4.8, 0.45, 3.2)
  bodhiGroup.add(wellGroup)

  const wellStone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.45, 0.95, 16),
    new THREE.MeshStandardMaterial({ color: C.wellStone, roughness: 0.9 })
  )
  wellStone.position.y = 0.47
  // Mặt nước giếng ngọc trong biếc
  const wellWater = new THREE.Mesh(
    new THREE.CircleGeometry(1.18, 16),
    new THREE.MeshStandardMaterial({ color: C.waterCyan, roughness: 0.1, transparent: true, opacity: 0.85 })
  )
  wellWater.rotation.x = -Math.PI / 2
  wellWater.position.y = 0.88
  wellGroup.add(wellStone, wellWater)

  // Cần múc nước & gáo dừa nhỏ
  const dipperHandle = makeBox(0.06, 0.06, 1.3, matLim, 0.2, 1.05, 0)
  dipperHandle.rotation.x = 0.25
  const dipperBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    matLim
  )
  dipperBowl.rotation.x = Math.PI
  dipperBowl.position.set(0.2, 0.96, 0.6)
  wellGroup.add(dipperHandle, dipperBowl)

  // --- 2.7. HIỆU ỨNG TƯỚI NƯỚC & HÀO QUANG BỒ ĐỀ ---
  let wateringLife = 0
  const auraLight = new THREE.PointLight(0x76ff03, 0, 18)
  auraLight.position.set(0, 2.5, 0)
  bodhiGroup.add(auraLight)

  function triggerWaterEffect() {
    wateringLife = 4.0 // 4 giây tỏa hào quang
  }

  // --- 2.8. VÒNG LẶP UPDATE THIÊN NHIÊN (LÁ BAY & DẢI LỤA ĐUNG ĐƯA) ---
  updaters.push((t, dt) => {
    // 1. Dải lụa đung đưa theo gió
    for (const r of ribbons3D) {
      const windSway = Math.sin(t * r.speed + r.phase) * 0.18 + Math.cos(t * 0.8 + r.phase) * 0.08
      r.mesh.rotation.z = r.baseAngle + windSway
      r.mesh.rotation.x = Math.sin(t * 1.1 + r.phase) * 0.1
    }

    // 2. Lá bồ đề rơi nhẹ nhàng
    for (const lf of leaves) {
      lf.mesh.position.y += lf.velY * dt
      lf.mesh.position.x += Math.sin(t * 2.2 + lf.startY) * 0.15 * dt + lf.velX * dt
      lf.mesh.position.z += Math.cos(t * 1.8 + lf.startY) * 0.15 * dt + lf.velZ * dt
      lf.mesh.rotation.x += lf.spinSpeed * dt
      lf.mesh.rotation.z += lf.spinSpeed * 0.8 * dt

      // Chạm đất -> hồi sinh lên đỉnh tán cây
      if (lf.mesh.position.y < 0.6) {
        lf.mesh.position.y = lf.startY
        lf.mesh.position.x = (Math.random() - 0.5) * 12.0
        lf.mesh.position.z = (Math.random() - 0.5) * 12.0
      }
    }

    // 3. Hiệu ứng hào quang tưới nước
    if (wateringLife > 0) {
      wateringLife -= dt
      const pulse = Math.sin(t * 5.0) * 0.4 + 1.2
      auraLight.intensity = Math.max(0, wateringLife * 2.5 * pulse)
    } else {
      auraLight.intensity = 0
    }
  })

  // =========================================================================
  // 3. CÁC ĐIỂM TƯƠNG TÁC 3D (INTERACTIVE TRIGGERS)
  // =========================================================================

  // Điểm 1: Treo dải lụa nguyện ước tại bàn đá
  const ribbonHit = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 3.2, 3.6),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  ribbonHit.position.set(BODHI_X - 4.2, floorY + 1.6, BODHI_Z - 3.2)
  eastWingGroup.add(ribbonHit)
  interactives.push({
    object: ribbonHit,
    action: 'bodhi_ribbon',
    label: '🎗️ Treo Dải Lụa Nguyện Ước',
    focus: new THREE.Vector3(BODHI_X - 4.2, floorY + 1.6, BODHI_Z - 3.2)
  })

  // Điểm 2: Tưới nước cội Bồ Đề tại giếng ngọc
  const waterHit = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 3.0, 3.2),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  waterHit.position.set(BODHI_X - 4.8, floorY + 1.5, BODHI_Z + 3.2)
  eastWingGroup.add(waterHit)
  interactives.push({
    object: waterHit,
    action: 'bodhi_water',
    label: '💧 Tưới Nước Cội Bồ Đề',
    focus: new THREE.Vector3(BODHI_X - 4.8, floorY + 1.6, BODHI_Z + 3.2)
  })

  // Điểm 3: Chiêm bái cội Bồ Đề
  const bodhiViewHit = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 3.0, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  bodhiViewHit.position.set(BODHI_X, floorY + 1.5, BODHI_Z)
  eastWingGroup.add(bodhiViewHit)
  interactives.push({
    object: bodhiViewHit,
    action: 'bodhi_view',
    label: '🌳 Chiêm Bái Cội Bồ Đề',
    focus: new THREE.Vector3(BODHI_X, floorY + 1.8, BODHI_Z)
  })

  return {
    ringBell: triggerBellPhysicalImpact,
    waterTree: () => {
      triggerWaterEffect()
      return { success: true }
    },
    addRibbon: (wish: string, author: string, color: 'red' | 'yellow' | 'white') => {
      const ang = Math.random() * Math.PI * 2
      const dist = 2.8 + Math.random() * 3.2
      const rx = Math.cos(ang) * dist
      const rz = Math.sin(ang) * dist
      const ry = 4.6 + Math.random() * 1.8
      ribbons3D.push(createRibbonMesh(rx, ry, rz, color))
    },
    getRibbonCount: () => ribbons3D.length
  }
}

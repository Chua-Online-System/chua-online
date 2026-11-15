/**
 * Module 3D Hồ Cá Phóng Sinh & Cầu Đá Đài Sen (Phase 2)
 * Kiến trúc sinh thái 3D chi tiết:
 * - Lòng hồ nước ngọc bích với shader sóng nước dập dềnh phản chiếu
 * - Cầu đá vòm cong (Arched Stone Bridge) bắc ngang qua hồ cho người chơi bước lên
 * - Đàn cá Koi 3D (Boids simulation) bơi lội mềm mại, quẫy đuôi uốn lượn dưới nước
 * - Đài sen đá phun nước giữa hồ với bọt nước sủi bồng bềnh
 * - Quần thể hoa sen hồng & lá sen ngọc bích nổi trên mặt nước
 * - Cơ chế Rắc mồi cho cá (Feed Fish) thu hút đàn cá ùa lại
 * - Bến Phóng Sinh Cá Cát Tường kết nối lưu dữ liệu vào Supabase
 */
import * as THREE from 'three'
import type { Interactive, World } from './world'

export interface FishPond3DController {
  feedFish: (sourcePos?: THREE.Vector3) => { count: number; x: number; z: number }
  spawnFish: (speciesId: string, name?: string) => void
  getFishCount: () => number
}

// Bảng màu cho các dòng cá Koi & cảnh quan hồ
const POND_COLORS = {
  waterDeep: 0x1f5e58,
  waterSurface: 0x338f87,
  pebble: 0x47433d,
  bridgeStone: 0x8a8479,
  bridgeLight: 0xa8a398,
  bridgeDark: 0x615c54,
  lotusLeaf: 0x2f6b38,
  lotusPink: 0xf58aa2,
  lotusWhite: 0xffffff,
  lotusYellow: 0xffd54f,
  foodPellet: 0xc49343,

  // Các dòng cá Koi
  kohakuWhite: 0xf6f3ec,
  kohakuRed: 0xd33827,
  yamabukiGold: 0xf5b82e,
  sankeBlack: 0x1a1a1a,
  carpOrange: 0xe65126
}

function makeBox(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

interface KoiFish3D {
  group: THREE.Group
  tailPivot: THREE.Group
  finL: THREE.Mesh
  finR: THREE.Mesh
  pos: THREE.Vector3
  vel: THREE.Vector3
  angle: number
  targetAngle: number
  speed: number
  baseSpeed: number
  swimPhase: number
  targetDepth: number
  depth: number
  isEating: boolean
  speciesId: string
}

interface FoodDrop {
  mesh: THREE.Mesh
  velY: number
  x: number
  y: number
  z: number
  life: number
}

interface WaterRipple {
  mesh: THREE.Mesh
  scale: number
  maxScale: number
  opacity: number
}

/**
 * XÂY DỰNG TOÀN BỘ PHÂN KHU HỒ CÁ PHÓNG SINH 3D (PHASE 2)
 */
export function buildFishPond3D(
  root: THREE.Group,
  floorY: number,
  updaters: World['updaters'],
  interactives: Interactive[]
): FishPond3DController {
  const pondGroup = new THREE.Group()
  root.add(pondGroup)

  // TỌA ĐỘ VÀ QUY CÁCH HỒ CÁ
  const POND_X = -65
  const POND_Z = -4
  const POND_RADIUS_X = 13.8
  const POND_RADIUS_Z = 12.2
  const WATER_Y = floorY - 0.28
  const BED_Y = floorY - 2.15

  // =========================================================================
  // 1. LÒNG HỒ & BỜ ĐÁ CUỘI (Pond Basin & Natural Rock Shoreline)
  // =========================================================================

  // Đáy hồ lót đá cuội sẫm màu
  const bedGeo = new THREE.CylinderGeometry(POND_RADIUS_X, POND_RADIUS_X * 1.05, 0.4, 40)
  bedGeo.scale(1, 1, POND_RADIUS_Z / POND_RADIUS_X)
  const bedMat = new THREE.MeshStandardMaterial({
    color: POND_COLORS.pebble,
    roughness: 0.95
  })
  const bedMesh = new THREE.Mesh(bedGeo, bedMat)
  bedMesh.position.set(POND_X, BED_Y, POND_Z)
  bedMesh.receiveShadow = true
  pondGroup.add(bedMesh)

  // Thành trong của hồ (đá rêu phong)
  const wallGeo = new THREE.CylinderGeometry(
    POND_RADIUS_X + 0.3,
    POND_RADIUS_X,
    floorY - BED_Y,
    40,
    1,
    true
  )
  wallGeo.scale(1, 1, POND_RADIUS_Z / POND_RADIUS_X)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3d3a34,
    roughness: 0.9,
    side: THREE.BackSide
  })
  const wallMesh = new THREE.Mesh(wallGeo, wallMat)
  wallMesh.position.set(POND_X, (floorY + BED_Y) / 2, POND_Z)
  pondGroup.add(wallMesh)

  // Bờ kè đá cuội bao quanh hồ
  const rockCount = 36
  const shoreRocks: THREE.Mesh[] = []
  for (let i = 0; i < rockCount; i++) {
    // Để trống lối lên cầu đá (ở góc Đông X: ~-53 và Tây X: ~-77)
    const a = (i / rockCount) * Math.PI * 2
    const rx = POND_X + Math.cos(a) * (POND_RADIUS_X + 0.4)
    const rz = POND_Z + Math.sin(a) * (POND_RADIUS_Z + 0.4)

    // Bỏ qua chỗ chân cầu đá vắt qua
    const nearBridgeEnds = Math.abs(rz - POND_Z) < 3.2 && (rx > POND_X + 10 || rx < POND_X - 10)
    if (nearBridgeEnds) continue

    const rockScale = 0.8 + (i % 3) * 0.35
    const rockMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rockScale, 0),
      new THREE.MeshStandardMaterial({
        color: (i % 2 === 0 ? 0x635e56 : 0x524e47),
        roughness: 0.95
      })
    )
    rockMesh.position.set(rx, floorY + 0.2, rz)
    rockMesh.rotation.set(i * 0.3, i * 0.5, i * 0.2)
    rockMesh.scale.set(1.2, 0.75, 1.2)
    rockMesh.castShadow = true
    rockMesh.receiveShadow = true
    pondGroup.add(rockMesh)
    shoreRocks.push(rockMesh)
  }

  // =========================================================================
  // 2. MẶT NƯỚC SÓNG GỢN TRONG SUỐT (Animated Water Surface)
  // =========================================================================
  const waterSegs = 48
  const waterGeo = new THREE.PlaneGeometry(
    POND_RADIUS_X * 2.1,
    POND_RADIUS_Z * 2.1,
    waterSegs,
    waterSegs
  )
  waterGeo.rotateX(-Math.PI / 2)

  // Lưu tọa độ gốc để tính dao động sóng
  const posAttr = waterGeo.attributes.position as THREE.BufferAttribute
  const originalY = new Float32Array(posAttr.count)
  for (let i = 0; i < posAttr.count; i++) {
    originalY[i] = posAttr.getY(i)
  }

  const waterMat = new THREE.MeshStandardMaterial({
    color: POND_COLORS.waterSurface,
    roughness: 0.12,
    metalness: 0.4,
    transparent: true,
    opacity: 0.82
  })
  const waterMesh = new THREE.Mesh(waterGeo, waterMat)
  waterMesh.position.set(POND_X, WATER_Y, POND_Z)
  waterMesh.receiveShadow = true
  pondGroup.add(waterMesh)

  // Hiệu ứng sóng nước gợn nhẹ lăn tăn
  updaters.push((t) => {
    for (let i = 0; i < posAttr.count; i++) {
      const u = posAttr.getX(i) * 0.45
      const v = posAttr.getZ(i) * 0.45
      const wave =
        Math.sin(t * 1.8 + u + v) * 0.045 +
        Math.cos(t * 1.3 - u * 0.7 + v * 0.5) * 0.035
      posAttr.setY(i, originalY[i] + wave)
    }
    posAttr.needsUpdate = true
    waterGeo.computeVertexNormals()
  })

  // =========================================================================
  // 3. CẦU ĐÁ VÒM CONG VƯỢT HỒ (Arched Stone Bridge)
  // =========================================================================
  // Cầu nối từ bờ Đông (X: -52) sang bờ Tây (X: -78) vắt ngang giữa hồ
  const bridgeGroup = new THREE.Group()
  bridgeGroup.position.set(POND_X, floorY, POND_Z)
  pondGroup.add(bridgeGroup)

  const BRIDGE_LEN = 24.5
  const BRIDGE_W = 4.2
  const BRIDGE_ARCH_H = 1.05 // độ cong vồng lên của cầu
  const stepCount = 20

  for (let s = 0; s < stepCount; s++) {
    const t1 = s / stepCount
    const t2 = (s + 1) / stepCount
    const x1 = (t1 - 0.5) * BRIDGE_LEN
    const x2 = (t2 - 0.5) * BRIDGE_LEN
    const midX = (x1 + x2) / 2
    const segLen = (BRIDGE_LEN / stepCount) * 1.05

    // Đường cong vòm Parabol
    const archNorm = Math.sin(t1 * Math.PI)
    const archY = archNorm * BRIDGE_ARCH_H

    // Mặt bậc cầu đá
    const slab = makeBox(
      segLen,
      0.35,
      BRIDGE_W,
      s % 2 === 0
        ? new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeStone, roughness: 0.85 })
        : new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeLight, roughness: 0.85 }),
      midX,
      archY + 0.1,
      0
    )
    bridgeGroup.add(slab)

    // Khối bệ đỡ cong dưới vòm cầu
    const underArch = makeBox(segLen, 0.4, BRIDGE_W - 0.3, new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeDark, roughness: 0.9 }), midX, archY - 0.2, 0)
    bridgeGroup.add(underArch)

    // Lan can đá 2 bên thành cầu
    for (const side of [-1, 1]) {
      const railZ = side * (BRIDGE_W / 2 - 0.25)
      // Tay vịn đá
      const railBar = makeBox(segLen, 0.16, 0.28, new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeLight, roughness: 0.8 }), midX, archY + 1.15, railZ)
      bridgeGroup.add(railBar)

      // Cột con tiện đá cách quãng
      if (s % 2 === 0) {
        const baluster = makeBox(0.24, 0.95, 0.24, new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeStone, roughness: 0.85 }), x1, archY + 0.6, railZ)
        // Chóp búp sen đá nhỏ trên đỉnh mỗi trụ lan can
        const lotusBud = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeLight, roughness: 0.7 })
        )
        lotusBud.position.set(x1, archY + 1.3, railZ)
        bridgeGroup.add(baluster, lotusBud)
      }
    }
  }

  // 2 thềm dốc đá tiếp cận mố cầu (East ramp & West ramp)
  // Giúp người chơi bước lên/xuống cầu mượt mà, loại bỏ mọi góc cạnh vấp ngã
  const eastRamp = makeBox(2.2, 0.2, BRIDGE_W, new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeStone, roughness: 0.85 }), 12.25 + 1.1, 0.08, 0)
  const westRamp = makeBox(2.2, 0.2, BRIDGE_W, new THREE.MeshStandardMaterial({ color: POND_COLORS.bridgeStone, roughness: 0.85 }), -12.25 - 1.1, 0.08, 0)
  bridgeGroup.add(eastRamp, westRamp)

  // 2 mố trụ cầu đá cắm sâu vào lòng hồ
  for (const px of [-6.0, 6.0]) {
    const pier = makeBox(1.6, floorY - BED_Y + 0.5, BRIDGE_W + 0.4, new THREE.MeshStandardMaterial({ color: 0x4a453e, roughness: 0.95 }), px, (floorY + BED_Y) / 2 - floorY, 0)
    bridgeGroup.add(pier)
  }

  // =========================================================================
  // 4. ĐÀI SEN ĐÁ PHUN NƯỚC GIỮA HỒ (Stone Lotus Fountain)
  // =========================================================================
  const fountainGroup = new THREE.Group()
  fountainGroup.position.set(POND_X - 1.5, BED_Y, POND_Z + 4.8)
  pondGroup.add(fountainGroup)

  // Trụ đá đài sen
  const fBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2.0, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x6e685f, roughness: 0.9 })
  )
  fBase.position.y = 0.4
  const fShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.1, floorY - BED_Y - 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x8a847a, roughness: 0.85 })
  )
  fShaft.position.y = (floorY - BED_Y) / 2
  fountainGroup.add(fBase, fShaft)

  // Bát sen đá trên mặt nước
  const bowlY = floorY - BED_Y + 0.1
  const lotusBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 1.2, 0.7, 20),
    new THREE.MeshStandardMaterial({ color: 0x9e988e, roughness: 0.8 })
  )
  lotusBowl.position.y = bowlY
  fountainGroup.add(lotusBowl)

  // Các cánh sen đá viền quanh bát
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xb5afa4, roughness: 0.7 })
    )
    petal.scale.set(0.8, 1.2, 0.4)
    petal.position.set(Math.cos(a) * 2.2, bowlY + 0.35, Math.sin(a) * 2.2)
    petal.lookAt(Math.cos(a) * 4, bowlY + 1.0, Math.sin(a) * 4)
    fountainGroup.add(petal)
  }

  // Cột nước bọt sủi phun nhẹ từ giữa đài sen
  const jetCount = 20
  const jetGeo = new THREE.BufferGeometry()
  const jetPos = new Float32Array(jetCount * 3)
  for (let i = 0; i < jetCount; i++) {
    jetPos[i * 3] = (Math.random() - 0.5) * 0.4
    jetPos[i * 3 + 1] = Math.random() * 1.4
    jetPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4
  }
  jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3))
  const jetMat = new THREE.PointsMaterial({
    color: 0xe0f7fa,
    size: 0.25,
    transparent: true,
    opacity: 0.85
  })
  const jetPoints = new THREE.Points(jetGeo, jetMat)
  jetPoints.position.set(0, bowlY + 0.3, 0)
  fountainGroup.add(jetPoints)

  updaters.push((t, dt) => {
    const p = jetGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < jetCount; i++) {
      let y = p.getY(i) + dt * 2.2
      if (y > 1.4) {
        y = 0.05
        p.setX(i, (Math.random() - 0.5) * 0.4)
        p.setZ(i, (Math.random() - 0.5) * 0.4)
      }
      p.setY(i, y)
    }
    p.needsUpdate = true
  })

  // =========================================================================
  // 5. THẢM HOA SEN & LÁ SEN NỔI TRÊN MẶT NƯỚC (Water Lilies)
  // =========================================================================
  const lotusClusters = [
    { x: POND_X - 6.5, z: POND_Z - 6.0, count: 5 },
    { x: POND_X + 6.0, z: POND_Z - 5.5, count: 6 },
    { x: POND_X - 7.0, z: POND_Z + 5.5, count: 4 },
    { x: POND_X + 5.5, z: POND_Z + 6.5, count: 5 }
  ]

  for (const c of lotusClusters) {
    for (let i = 0; i < c.count; i++) {
      const a = (i / c.count) * Math.PI * 2 + Math.random() * 0.5
      const dist = 0.6 + Math.random() * 2.2
      const lx = c.x + Math.cos(a) * dist
      const lz = c.z + Math.sin(a) * dist

      // Lá sen hình tròn
      const leafR = 0.55 + Math.random() * 0.35
      const leafMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(leafR, leafR, 0.03, 16),
        new THREE.MeshStandardMaterial({
          color: POND_COLORS.lotusLeaf,
          roughness: 0.8
        })
      )
      leafMesh.position.set(lx, WATER_Y + 0.02, lz)
      pondGroup.add(leafMesh)

      // Hoa sen nở giữa cụm lá (xác suất 40%)
      if (i % 2 === 0) {
        const flowerColor = i % 4 === 0 ? POND_COLORS.lotusWhite : POND_COLORS.lotusPink
        const lotusFlower = new THREE.Group()
        // Cánh hoa
        for (let p = 0; p < 8; p++) {
          const pa = (p / 8) * Math.PI * 2
          const petal = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.38, 4),
            new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.5 })
          )
          petal.position.set(Math.cos(pa) * 0.16, 0.15, Math.sin(pa) * 0.16)
          petal.rotation.z = Math.cos(pa) * 0.4
          petal.rotation.x = Math.sin(pa) * 0.4
          lotusFlower.add(petal)
        }
        // Nhụy sen vàng
        const center = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8),
          new THREE.MeshStandardMaterial({ color: POND_COLORS.lotusYellow, roughness: 0.6 })
        )
        center.position.y = 0.12
        lotusFlower.add(center)

        lotusFlower.position.set(lx + 0.2, WATER_Y + 0.05, lz + 0.2)
        pondGroup.add(lotusFlower)
      }
    }
  }

  // =========================================================================
  // 6. ĐÀN CÁ KOI 3D (3D Fish Models & Flocking Simulation)
  // =========================================================================
  const fishList3D: KoiFish3D[] = []

  // Hàm tạo 1 mô hình 3D cá Koi hoàn chỉnh
  function createKoiMesh(species: 'kohaku' | 'sanke' | 'yamabuki' | 'carp') {
    const g = new THREE.Group()

    let baseColor = POND_COLORS.kohakuWhite
    let spotColor = POND_COLORS.kohakuRed
    let isGold = false

    if (species === 'yamabuki') {
      baseColor = POND_COLORS.yamabukiGold
      spotColor = POND_COLORS.yamabukiGold
      isGold = true
    } else if (species === 'carp') {
      baseColor = POND_COLORS.carpOrange
      spotColor = POND_COLORS.carpOrange
    } else if (species === 'sanke') {
      baseColor = POND_COLORS.kohakuWhite
      spotColor = POND_COLORS.sankeBlack
    }

    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: isGold ? 0.35 : 0.6,
      metalness: isGold ? 0.7 : 0.15
    })
    const spotMat = new THREE.MeshStandardMaterial({
      color: spotColor,
      roughness: 0.55
    })

    // 1. Thân cá (thuôn dài)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), bodyMat)
    body.scale.set(0.65, 0.55, 1.45)
    g.add(body)

    // Đốm son / sumi trên lưng cá
    if (species !== 'yamabuki' && species !== 'carp') {
      const spot1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), spotMat)
      spot1.scale.set(0.7, 0.2, 0.8)
      spot1.position.set(0, 0.17, 0.15)
      g.add(spot1)

      const spot2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshStandardMaterial({ color: POND_COLORS.kohakuRed, roughness: 0.55 })
      )
      spot2.scale.set(0.6, 0.2, 0.7)
      spot2.position.set(0.06, 0.16, -0.25)
      g.add(spot2)
    }

    // 2. Đầu cá & miệng cá
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.45, 10), bodyMat)
    head.rotation.x = -Math.PI / 2
    head.scale.set(0.9, 1.2, 0.7)
    head.position.set(0, -0.02, 0.68)
    g.add(head)

    // Mắt cá 2 bên
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 })
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat)
      eye.position.set(s * 0.18, 0.08, 0.62)
      g.add(eye)
    }

    // 3. Khớp đuôi & Vây đuôi cá (quẫy nhịp nhàng)
    const tailPivot = new THREE.Group()
    tailPivot.position.set(0, 0, -0.62)
    g.add(tailPivot)

    const tailFinMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.7,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    })
    const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 3), tailFinMat)
    tailFin.scale.set(0.1, 1.0, 1.3)
    tailFin.rotation.x = Math.PI / 2
    tailFin.position.set(0, 0, -0.42)
    tailPivot.add(tailFin)

    // 4. Vây ngực 2 bên (uốn lượn khi bơi)
    const finMat = tailFinMat.clone()
    const finL = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.45), finMat)
    finL.rotation.x = Math.PI / 2.8
    finL.rotation.z = Math.PI / 3.5
    finL.position.set(0.3, -0.08, 0.25)
    g.add(finL)

    const finR = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.45), finMat)
    finR.rotation.x = Math.PI / 2.8
    finR.rotation.z = -Math.PI / 3.5
    finR.position.set(-0.3, -0.08, 0.25)
    g.add(finR)

    // 5. Vây lưng
    const dorsalFin = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.55), finMat)
    dorsalFin.rotation.y = Math.PI / 2
    dorsalFin.rotation.z = -Math.PI / 8
    dorsalFin.position.set(0, 0.26, -0.05)
    g.add(dorsalFin)

    return { group: g, tailPivot, finL, finR }
  }

  // Khởi tạo đàn cá ban đầu 16 con
  const INITIAL_FISH_COUNT = 16
  const speciesTypes: Array<'kohaku' | 'sanke' | 'yamabuki' | 'carp'> = [
    'kohaku',
    'yamabuki',
    'sanke',
    'carp',
    'kohaku',
    'yamabuki'
  ]

  for (let i = 0; i < INITIAL_FISH_COUNT; i++) {
    const sp = speciesTypes[i % speciesTypes.length]
    const fishMesh = createKoiMesh(sp)
    const ang = (i / INITIAL_FISH_COUNT) * Math.PI * 2 + Math.random() * 0.4
    const r = 2.0 + Math.random() * (POND_RADIUS_X - 4.5)
    const fx = POND_X + Math.cos(ang) * r
    const fz = POND_Z + Math.sin(ang) * (r * (POND_RADIUS_Z / POND_RADIUS_X))
    const initialDepth = WATER_Y - 0.45 - Math.random() * 0.9

    fishMesh.group.position.set(fx, initialDepth, fz)
    pondGroup.add(fishMesh.group)

    fishList3D.push({
      group: fishMesh.group,
      tailPivot: fishMesh.tailPivot,
      finL: fishMesh.finL,
      finR: fishMesh.finR,
      pos: new THREE.Vector3(fx, initialDepth, fz),
      vel: new THREE.Vector3(Math.cos(ang + Math.PI / 2), 0, Math.sin(ang + Math.PI / 2)),
      angle: ang + Math.PI / 2,
      targetAngle: ang + Math.PI / 2,
      speed: 1.2 + Math.random() * 0.8,
      baseSpeed: 1.2 + Math.random() * 0.8,
      swimPhase: Math.random() * Math.PI * 2,
      targetDepth: initialDepth,
      depth: initialDepth,
      isEating: false,
      speciesId: sp
    })
  }

  // =========================================================================
  // 7. HỆ THỐNG MỒI ĂN & VÒNG SÓNG NƯỚC (Food Drops & Ripple FX)
  // =========================================================================
  const activeFoods: FoodDrop[] = []
  const activeRipples: WaterRipple[] = []

  // Vòng sóng nước
  function spawnRipple(x: number, z: number, maxScale = 2.4) {
    const ripGeo = new THREE.RingGeometry(0.15, 0.28, 24)
    ripGeo.rotateX(-Math.PI / 2)
    const ripMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2f1,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    const ripMesh = new THREE.Mesh(ripGeo, ripMat)
    ripMesh.position.set(x, WATER_Y + 0.015, z)
    pondGroup.add(ripMesh)
    activeRipples.push({ mesh: ripMesh, scale: 0.3, maxScale, opacity: 0.8 })
  }

  // Hàm rắc mồi xuống hồ
  function feedFish(sourcePos?: THREE.Vector3) {
    // Nếu truyền vị trí người chơi (đứng trên cầu), rắc mồi từ mép cầu
    let fx = sourcePos ? sourcePos.x : POND_X
    let fz = sourcePos ? sourcePos.z : POND_Z

    // Đảm bảo thức ăn rơi trong lòng hồ
    const dx = fx - POND_X
    const dz = fz - POND_Z
    const distSq = (dx / POND_RADIUS_X) ** 2 + (dz / POND_RADIUS_Z) ** 2
    if (distSq > 0.85) {
      fx = POND_X + (dx / Math.sqrt(distSq)) * 0.6 * POND_RADIUS_X
      fz = POND_Z + (dz / Math.sqrt(distSq)) * 0.6 * POND_RADIUS_Z
    }

    const pelletCount = 10
    for (let i = 0; i < pelletCount; i++) {
      const px = fx + (Math.random() - 0.5) * 2.2
      const pz = fz + (Math.random() - 0.5) * 2.2
      const py = (sourcePos ? sourcePos.y + 1.2 : floorY + 1.2) + Math.random() * 0.4

      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 6, 6),
        new THREE.MeshStandardMaterial({ color: POND_COLORS.foodPellet, roughness: 0.7 })
      )
      pMesh.position.set(px, py, pz)
      pondGroup.add(pMesh)

      activeFoods.push({
        mesh: pMesh,
        velY: -(1.8 + Math.random() * 1.5),
        x: px,
        y: py,
        z: pz,
        life: 14 // tồn tại trong 14 giây cho cá ăn
      })
    }

    // Thu hút đàn cá ùa lại
    for (const fish of fishList3D) {
      const dToFood = Math.hypot(fish.pos.x - fx, fish.pos.z - fz)
      if (dToFood < 16) {
        fish.targetAngle = Math.atan2(fz - fish.pos.z, fx - fish.pos.x) + (Math.random() - 0.5) * 0.4
        fish.speed = fish.baseSpeed * 2.2
        fish.targetDepth = WATER_Y - 0.12 // ngoi sát mặt nước đớp mồi
        fish.isEating = true
      }
    }

    return { count: pelletCount, x: fx, z: fz }
  }

  // Phóng sinh một chú cá mới vào hồ 3D
  function spawnFish(speciesId: string, name?: string) {
    let sp: 'kohaku' | 'sanke' | 'yamabuki' | 'carp' = 'kohaku'
    if (speciesId.includes('yamabuki') || speciesId.includes('gold')) sp = 'yamabuki'
    else if (speciesId.includes('taisho') || speciesId.includes('sanke')) sp = 'sanke'
    else if (speciesId.includes('chep') || speciesId.includes('carp')) sp = 'carp'

    const fishMesh = createKoiMesh(sp)
    // Thả ở mép bến phóng sinh (X: -54, Z: 2)
    const sx = POND_X + 9.5
    const sz = POND_Z + 4.0
    const sDepth = WATER_Y - 0.2

    fishMesh.group.position.set(sx, sDepth, sz)
    pondGroup.add(fishMesh.group)

    // Tạo vòng sóng nước chỗ mới thả
    spawnRipple(sx, sz, 3.2)

    const newFishObj: KoiFish3D = {
      group: fishMesh.group,
      tailPivot: fishMesh.tailPivot,
      finL: fishMesh.finL,
      finR: fishMesh.finR,
      pos: new THREE.Vector3(sx, sDepth, sz),
      vel: new THREE.Vector3(-1, 0, -0.4).normalize(),
      angle: Math.atan2(-0.4, -1),
      targetAngle: Math.atan2(-0.4, -1),
      speed: 2.6, // bơi vút ra hồ
      baseSpeed: 1.4,
      swimPhase: 0,
      targetDepth: WATER_Y - 0.6,
      depth: sDepth,
      isEating: false,
      speciesId: sp
    }

    fishList3D.push(newFishObj)
  }

  // =========================================================================
  // 8. VÒNG LẶP MÔ PHỎNG ĐÀN CÁ & SÓNG NƯỚC (Animation Loop)
  // =========================================================================
  updaters.push((t, dt) => {
    // 1. Cập nhật các hạt thức ăn rơi xuống nước
    for (let i = activeFoods.length - 1; i >= 0; i--) {
      const f = activeFoods[i]
      if (f.y > WATER_Y) {
        f.y += f.velY * dt
        f.mesh.position.y = f.y
        if (f.y <= WATER_Y) {
          f.y = WATER_Y
          spawnRipple(f.x, f.z, 1.2)
        }
      } else {
        // Chìm từ từ xuống đáy hồ
        f.y = Math.max(BED_Y + 0.1, f.y - dt * 0.12)
        f.mesh.position.y = f.y
        f.life -= dt
        if (f.life <= 0) {
          pondGroup.remove(f.mesh)
          activeFoods.splice(i, 1)
        }
      }
    }

    // 2. Cập nhật các vòng sóng nước lan tỏa
    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const r = activeRipples[i]
      r.scale += dt * 1.6
      r.opacity -= dt * 0.7
      r.mesh.scale.set(r.scale, r.scale, 1)
      ;(r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, r.opacity)
      if (r.opacity <= 0 || r.scale >= r.maxScale) {
        pondGroup.remove(r.mesh)
        activeRipples.splice(i, 1)
      }
    }

    // 3. Cập nhật chuyển động đàn cá Koi
    for (const fish of fishList3D) {
      fish.swimPhase += dt * (fish.speed * 4.5)

      // Quẫy đuôi cá hình sin
      fish.tailPivot.rotation.y = Math.sin(fish.swimPhase) * 0.42
      // Vây ngực vẫy nhẹ
      fish.finL.rotation.z = Math.PI / 3.5 + Math.sin(fish.swimPhase) * 0.18
      fish.finR.rotation.z = -Math.PI / 3.5 - Math.sin(fish.swimPhase) * 0.18

      // Đổi hướng ngẫu nhiên định kỳ
      if (Math.random() < 0.02 && !fish.isEating) {
        fish.targetAngle += (Math.random() - 0.5) * 0.9
        fish.targetDepth = WATER_Y - 0.3 - Math.random() * 1.1
        fish.speed = THREE.MathUtils.lerp(fish.speed, fish.baseSpeed, 0.1)
      }

      // Tránh bờ hồ hình oval: kéo cá quay về lòng hồ khi bơi quá sát bờ
      const relX = fish.pos.x - POND_X
      const relZ = fish.pos.z - POND_Z
      const distNorm = (relX / (POND_RADIUS_X - 1.8)) ** 2 + (relZ / (POND_RADIUS_Z - 1.8)) ** 2

      if (distNorm > 1.0) {
        const toCenterX = -relX
        const toCenterZ = -relZ
        fish.targetAngle = Math.atan2(toCenterZ, toCenterX) + (Math.random() - 0.5) * 0.3
        fish.speed = fish.baseSpeed * 1.2
      }

      // Nội suy góc quay mượt mà
      let diffAng = fish.targetAngle - fish.angle
      while (diffAng > Math.PI) diffAng -= Math.PI * 2
      while (diffAng < -Math.PI) diffAng += Math.PI * 2
      fish.angle += diffAng * Math.min(1, dt * 3.2)

      // Cập nhật vị trí
      fish.pos.x += Math.cos(fish.angle) * fish.speed * dt
      fish.pos.z += Math.sin(fish.angle) * fish.speed * dt
      fish.depth = THREE.MathUtils.lerp(fish.depth, fish.targetDepth, dt * 1.8)
      fish.pos.y = fish.depth

      fish.group.position.copy(fish.pos)
      // Quay đầu cá theo hướng bơi (đầu cá hướng Z+)
      fish.group.rotation.y = -fish.angle + Math.PI / 2
      // Nghiêng thân nhẹ khi rẽ
      fish.group.rotation.z = diffAng * 0.35
    }
  })

  // =========================================================================
  // 9. CÁC ĐIỂM TƯƠNG TÁC 3D (Interactive Triggers)
  // =========================================================================

  // Điểm 1: Đứng giữa vòm cầu đá rắc mồi cho cá
  const feedHit = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 3.2, 4.5),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  feedHit.position.set(POND_X, floorY + 1.8, POND_Z)
  pondGroup.add(feedHit)
  interactives.push({
    object: feedHit,
    action: 'fish_feed',
    label: '🍞 Rắc mồi cho cá',
    focus: new THREE.Vector3(POND_X, floorY + 1.6, POND_Z)
  })

  // Điểm 2: Bến phóng sinh cá (ở bờ Đông hồ cạnh cầu đá)
  const dockHit = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 3.0, 4.0),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  dockHit.position.set(POND_X + 11.5, floorY + 1.5, POND_Z + 4.0)
  pondGroup.add(dockHit)
  interactives.push({
    object: dockHit,
    action: 'fish_release',
    label: '🐟 Phóng sinh cá mới',
    focus: new THREE.Vector3(POND_X + 11.5, floorY + 1.6, POND_Z + 4.0)
  })

  // Điểm 3: Đài Sen ngắm cảnh
  const lotusFountainHit = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 2.8, 2.5, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  lotusFountainHit.position.set(POND_X - 1.5, floorY + 1.2, POND_Z + 4.8)
  pondGroup.add(lotusFountainHit)
  interactives.push({
    object: lotusFountainHit,
    action: 'fish_view',
    label: '🪷 Chiêm ngưỡng đài sen & hồ cá',
    focus: new THREE.Vector3(POND_X - 1.5, floorY + 1.6, POND_Z + 4.8)
  })

  return {
    feedFish,
    spawnFish,
    getFishCount: () => fishList3D.length
  }
}


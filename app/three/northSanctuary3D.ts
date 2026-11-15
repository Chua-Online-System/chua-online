/**
 * Module 3D Bến Thả Hoa Đăng Sông Trăng & Thiền Đường Tịnh Độ (Phase 4)
 * Kiến trúc sinh thái & không gian tu tập 3D chi tiết:
 * 1. Bến Thả Hoa Đăng Sông Trăng (Moonlit River Wharf):
 *    - Dòng sông đêm trải dài tĩnh mịch phản chiếu ánh trăng lung linh
 *    - Bến đá hoa cương ngũ cấp, cầu tàu gỗ vươn ra mép nước, thạch đăng soi sáng đêm
 *    - Đàn hoa đăng sen 3D (36+ chiếc) mang ngọn nến phát sáng trôi dập dềnh xuôi dòng
 *    - Cơ chế thả hoa đăng 3D trực tiếp xuống sông, đồng bộ Supabase `river_lanterns`
 * 2. Nhà Tụng Kinh & Thiền Đường Tịnh Độ (Zen Meditation Hall):
 *    - Gian nhà gỗ ba gian cổ kính lợp ngói vảy cá, cửa võng chạm trổ tại cánh Tây Bắc
 *    - Tượng Phật Thích Ca tọa thiền, bàn kinh có Mõ Gỗ hình cá và Chuông Bát gia trì
 *    - 12 Bồ đoàn thiền định xếp hàng ngay ngắn cho Phật tử tọa thiền kiết già
 *    - Cơ chế toạ thiền, gõ mõ niệm Phật âm thanh chân thực, tính streak tu tập
 */
import * as THREE from 'three'
import type { Interactive, World } from './world'

export interface NorthSanctuary3DController {
  releaseLantern: (sender: string, text: string, type: 'lotus_pink' | 'lotus_gold' | 'lotus_white') => void
  getLanternCount: () => number
  hitWoodenFish: () => void
  getMeditationPads: () => THREE.Vector3[]
}

const C = {
  limWood: 0x3d1d0e,
  darkWood: 0x241208,
  tileRed: 0x8a3324,
  stoneGranite: 0x827d75,
  stoneStep: 0x9e988f,
  bronzeStatue: 0xa88732,
  bronzeBowl: 0xc49d3b,
  woodenFish: 0x5a2d13,
  cushionSaffron: 0x9e2a3b,
  riverWater: 0x0a1c2a,
  waterFoam: 0x1f445c,
  lanternPink: 0xf48fb1,
  lanternGold: 0xffd54f,
  lanternWhite: 0xf5f5f5,
  candleFlame: 0xffa726,
  leafBase: 0x2e6629
}

function makeBox(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

interface FloatingLantern3D {
  group: THREE.Group
  pos: THREE.Vector3
  speed: number
  wavePhase: number
  waveFreq: number
  yaw: number
  yawSpeed: number
  flameMesh: THREE.Mesh
}

/**
 * XÂY DỰNG TOÀN BỘ PHÂN KHU BẮC: BẾN HOA ĐĂNG & THIỀN ĐƯỜNG (PHASE 4)
 */
export function buildNorthSanctuary3D(
  root: THREE.Group,
  floorY: number,
  updaters: World['updaters'],
  interactives: Interactive[],
  onWoodenFishSound?: () => void
): NorthSanctuary3DController {
  const northGroup = new THREE.Group()
  root.add(northGroup)

  const matLim = new THREE.MeshStandardMaterial({ color: C.limWood, roughness: 0.75 })
  const matDarkLim = new THREE.MeshStandardMaterial({ color: C.darkWood, roughness: 0.85 })
  const matTile = new THREE.MeshStandardMaterial({ color: C.tileRed, roughness: 0.7 })
  const matGranite = new THREE.MeshStandardMaterial({ color: C.stoneGranite, roughness: 0.85 })
  const matStep = new THREE.MeshStandardMaterial({ color: C.stoneStep, roughness: 0.8 })
  const matBronze = new THREE.MeshStandardMaterial({ color: C.bronzeStatue, roughness: 0.35, metalness: 0.7 })

  // =========================================================================
  // 1. BẾN THẢ HOA ĐĂNG SÔNG TRĂNG (Tọa độ: X: 0, Z: -80 đến -120)
  // =========================================================================
  const RIVER_Z = -96
  const RIVER_W = 196
  const RIVER_DEPTH = 44
  const WATER_Y = floorY - 0.85

  // --- 1.0. Đáy sông Sông Trăng & Vách núi bờ Bắc đối diện ---
  const riverBed = makeBox(
    RIVER_W,
    0.4,
    RIVER_DEPTH + 8,
    new THREE.MeshStandardMaterial({ color: 0x0c151c, roughness: 0.95 }),
    0,
    floorY - 2.8,
    RIVER_Z
  )
  northGroup.add(riverBed)

  // Bờ sông phía đối diện (North Bank Cliffs) tạo hẻm núi tráng lệ
  const farBank = makeBox(
    RIVER_W + 16,
    8.0,
    38,
    new THREE.MeshStandardMaterial({ color: 0x384e32, roughness: 0.95 }),
    0,
    floorY + 2.0,
    -134
  )
  northGroup.add(farBank)

  // --- 1.1. Mặt nước sông đêm phản chiếu ánh trăng ---
  const riverGeo = new THREE.PlaneGeometry(RIVER_W, RIVER_DEPTH, 48, 20)
  riverGeo.rotateX(-Math.PI / 2)
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x16384e,
    roughness: 0.08,
    metalness: 0.55,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  })
  const riverMesh = new THREE.Mesh(riverGeo, riverMat)
  riverMesh.position.set(0, WATER_Y, RIVER_Z)
  northGroup.add(riverMesh)

  // Sóng nước dập dềnh nhẹ nhàng trên sông
  const riverPos = riverGeo.attributes.position
  const origRiverY = new Float32Array(riverPos.count)
  for (let i = 0; i < riverPos.count; i++) origRiverY[i] = riverPos.getY(i)

  updaters.push((t) => {
    for (let i = 0; i < riverPos.count; i++) {
      const u = riverPos.getX(i) * 0.12
      const v = riverPos.getZ(i) * 0.2
      const wave = Math.sin(t * 1.6 + u + v) * 0.045 + Math.cos(t * 1.1 - u * 0.6) * 0.03
      riverPos.setY(i, origRiverY[i] + wave)
    }
    riverPos.needsUpdate = true
    riverGeo.computeVertexNormals()
  })

  // --- 1.2. Bến đá hoa cương & Bậc tam cấp bước xuống nước ---
  const WHARF_Z = -84
  const wharfGroup = new THREE.Group()
  wharfGroup.position.set(0, floorY, WHARF_Z)
  northGroup.add(wharfGroup)

  // Bệ đá hoa cương rộng lớn
  const wharfPlaza = makeBox(32, 0.5, 10, matGranite, 0, -0.25, 0)
  wharfGroup.add(wharfPlaza)

  // Bậc thang đá thoai thoải dẫn xuống mép sông (hướng Bắc ra sông)
  for (let s = 0; s < 4; s++) {
    const step = makeBox(18 - s * 0.8, 0.22, 0.6, matStep, 0, -0.25 - (s + 1) * 0.18, -4.8 - s * 0.55)
    wharfGroup.add(step)
  }

  // Cầu tàu gỗ vươn dài ra mặt sông để phật tử thả đăng (vươn về hướng Bắc ra sông)
  const pier = makeBox(5.2, 0.25, 7.0, matLim, 0, -0.75, -7.5)
  wharfGroup.add(pier)

  // Bàn đá hoa đăng linh thiêng trên đầu cầu tàu gỗ
  const lotusTable = makeBox(1.6, 0.4, 1.6, matGranite, 0, -0.45, -9.0)
  const goldenLotus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.3, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.3, metalness: 0.8 })
  )
  goldenLotus.position.set(0, -0.15, -9.0)
  const altarFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffeb3b })
  )
  altarFlame.position.set(0, 0.12, -9.0)
  const altarLight = new THREE.PointLight(0xffb74d, 2.0, 12)
  altarLight.position.set(0, 0.3, -9.0)
  wharfGroup.add(lotusTable, goldenLotus, altarFlame, altarLight)

  // Lan can đá hoa cương 2 bên mạn bến
  for (const side of [-1, 1]) {
    const railX = side * 15.2
    const rail = makeBox(0.4, 0.95, 10, matStep, railX, 0.45, 0)
    wharfGroup.add(rail)

    // Trụ đá đầu bến có thạch đăng soi sáng dòng sông
    const lanternPost = makeBox(0.7, 2.4, 0.7, matGranite, railX, 1.2, -4.6)
    const lanternRoof = makeBox(1.2, 0.25, 1.2, matTile, railX, 2.5, -4.6)
    const lanternLight = new THREE.PointLight(0xffb74d, 1.8, 16)
    lanternLight.position.set(railX, 2.2, -4.6)
    wharfGroup.add(lanternPost, lanternRoof, lanternLight)
  }

  // --- 1.3. ĐÀN HOA ĐĂNG SEN 3D TRÔI XUÔI DÒNG SÔNG ---
  const lanternsGroup = new THREE.Group()
  northGroup.add(lanternsGroup)

  const floatingLanterns: FloatingLantern3D[] = []

  const matPetalPink = new THREE.MeshStandardMaterial({ color: C.lanternPink, roughness: 0.5 })
  const matPetalGold = new THREE.MeshStandardMaterial({ color: C.lanternGold, roughness: 0.4 })
  const matPetalWhite = new THREE.MeshStandardMaterial({ color: C.lanternWhite, roughness: 0.5 })
  const matLeafBase = new THREE.MeshStandardMaterial({ color: C.leafBase, roughness: 0.8 })
  const matFlame = new THREE.MeshBasicMaterial({ color: 0xffecb3 })

  function createLotusLanternMesh(
    x: number,
    z: number,
    type: 'lotus_pink' | 'lotus_gold' | 'lotus_white'
  ): FloatingLantern3D {
    const lGroup = new THREE.Group()
    lGroup.position.set(x, WATER_Y, z)

    // Bè lá sen tròn nâng đỡ đài hoa
    const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.05, 14), matLeafBase)
    leaf.position.y = 0.02
    lGroup.add(leaf)

    // Các cánh sen nở xòe bao quanh
    const pMat = type === 'lotus_pink' ? matPetalPink : type === 'lotus_gold' ? matPetalGold : matPetalWhite
    for (let p = 0; p < 8; p++) {
      const ang = (p / 8) * Math.PI * 2
      const petal = makeBox(0.18, 0.16, 0.28, pMat, Math.cos(ang) * 0.26, 0.1, Math.sin(ang) * 0.26)
      petal.rotation.y = -ang
      petal.rotation.x = 0.35
      lGroup.add(petal)
    }

    // Tầng cánh sen búp bên trong
    for (let p = 0; p < 6; p++) {
      const ang = (p / 6) * Math.PI * 2 + 0.3
      const innerPetal = makeBox(0.14, 0.18, 0.22, pMat, Math.cos(ang) * 0.16, 0.14, Math.sin(ang) * 0.16)
      innerPetal.rotation.y = -ang
      innerPetal.rotation.x = 0.22
      lGroup.add(innerPetal)
    }

    // Ngọn nến nhỏ ở nhụy sen
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 8), matPetalWhite)
    candle.position.y = 0.14
    lGroup.add(candle)

    // Ngọn lửa nến phát sáng vàng ấm
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 8), matFlame)
    flame.position.y = 0.28
    lGroup.add(flame)

    lanternsGroup.add(lGroup)

    const speed = 0.65 + Math.random() * 0.55
    const waveFreq = 1.6 + Math.random() * 0.6
    const wavePhase = Math.random() * Math.PI * 2
    const yawSpeed = (Math.random() - 0.5) * 0.25

    return {
      group: lGroup,
      pos: lGroup.position,
      speed,
      wavePhase,
      waveFreq,
      yaw: Math.random() * Math.PI * 2,
      yawSpeed,
      flameMesh: flame
    }
  }

  // Khởi tạo 32 hoa đăng rải rác trên sông từ Đông sang Tây
  for (let i = 0; i < 32; i++) {
    const lx = (i / 32) * RIVER_W - RIVER_W / 2 + (Math.random() - 0.5) * 4.0
    const lz = RIVER_Z + (Math.random() - 0.5) * (RIVER_DEPTH - 6.0)
    const type = i % 3 === 0 ? 'lotus_pink' : i % 3 === 1 ? 'lotus_gold' : 'lotus_white'
    floatingLanterns.push(createLotusLanternMesh(lx, lz, type))
  }

  // Dòng chảy sông đêm (River Drift Updater)
  updaters.push((t, dt) => {
    for (const lt of floatingLanterns) {
      // Trôi từ Đông sang Tây (X giảm dần)
      lt.pos.x -= lt.speed * dt
      // Nhấp nhô bập bềnh theo sóng nước
      lt.pos.y = WATER_Y + Math.sin(t * lt.waveFreq + lt.wavePhase) * 0.038
      // Xoay nhẹ theo dòng nước
      lt.yaw += lt.yawSpeed * dt
      lt.group.rotation.y = lt.yaw
      lt.group.rotation.z = Math.sin(t * 1.4 + lt.wavePhase) * 0.06
      // Nhấp nháy ngọn nến
      const flicker = 1.0 + Math.sin(t * 14.0 + lt.wavePhase) * 0.15
      lt.flameMesh.scale.set(flicker, flicker, flicker)

      // Khi trôi qua biên Tây (X < -RIVER_W/2) -> quay lại đầu nguồn phía Đông (X = RIVER_W/2)
      if (lt.pos.x < -RIVER_W / 2) {
        lt.pos.x = RIVER_W / 2 + Math.random() * 6.0
        lt.pos.z = RIVER_Z + (Math.random() - 0.5) * (RIVER_DEPTH - 6.0)
      }
    }
  })

  // Điểm tương tác: Thả hoa đăng tại đầu cầu tàu gỗ sát mép sông
  const lanternHit = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 3.2, 4.5),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  lanternHit.position.set(0, floorY - 0.45, WHARF_Z - 8.5)
  northGroup.add(lanternHit)
  interactives.push({
    object: lanternHit,
    action: 'lantern_release',
    label: '🪷 Thả Hoa Đăng Sông Trăng',
    focus: new THREE.Vector3(0, floorY - 0.75, WHARF_Z - 8.5)
  })

  // =========================================================================
  // 2. NHÀ TỤNG KINH & THIỀN ĐƯỜNG TỊNH ĐỘ (Tọa độ: X: -48, Z: -48)
  // =========================================================================
  const HALL_X = -48
  const HALL_Z = -48
  const hallGroup = new THREE.Group()
  hallGroup.position.set(HALL_X, floorY, HALL_Z)
  northGroup.add(hallGroup)

  const HALL_W = 16.0
  const HALL_D = 10.5
  const HALL_H = 5.2

  // --- 2.1. Nền móng & Bậc tam cấp Thiền Đường ---
  const hallPlinth = makeBox(HALL_W + 1.2, 0.5, HALL_D + 1.2, matGranite, 0, 0.25, 0)
  hallGroup.add(hallPlinth)

  // Bậc tam cấp phía trước (hướng Nam, đón người từ đại lộ bước vào)
  for (let s = 0; s < 3; s++) {
    const step = makeBox(6.4 - s * 0.4, 0.18, 0.45, matStep, 0, 0.09 + s * 0.18, HALL_D / 2 + 0.8 + s * 0.45)
    hallGroup.add(step)
  }

  // Sàn gỗ lim ấm cúng bên trong
  const hallFloor = makeBox(HALL_W - 0.2, 0.16, HALL_D - 0.2, matLim, 0, 0.58, 0)
  hallGroup.add(hallFloor)

  // --- 2.2. Khung cột gỗ 8 đại trụ & Vách gỗ ba gian ---
  const COL_R = 0.26
  const colGeo = new THREE.CylinderGeometry(COL_R, COL_R * 1.06, HALL_H, 16)

  // 8 cột chia 3 gian
  const colXOffsets = [-HALL_W / 2 + 1.0, -HALL_W / 6, HALL_W / 6, HALL_W / 2 - 1.0]
  for (const cx of colXOffsets) {
    for (const cz of [-HALL_D / 2 + 0.8, HALL_D / 2 - 0.8]) {
      const col = new THREE.Mesh(colGeo, matLim)
      col.position.set(cx, 0.5 + HALL_H / 2, cz)
      col.castShadow = true
      hallGroup.add(col)
    }
  }

  // Vách gỗ bao quanh 3 phía (Bắc, Tây, Đông), chừa mặt Nam mở cửa thoáng
  const matWall = new THREE.MeshStandardMaterial({ color: C.darkWood, roughness: 0.9 })
  // Vách Bắc (sau lưng tượng Phật)
  hallGroup.add(makeBox(HALL_W - 0.4, HALL_H - 0.6, 0.25, matWall, 0, 0.5 + (HALL_H - 0.6) / 2, -HALL_D / 2 + 0.8))
  // Vách Tây & Vách Đông có cửa sổ song tiện
  hallGroup.add(makeBox(0.25, HALL_H - 0.6, HALL_D - 1.6, matWall, -HALL_W / 2 + 1.0, 0.5 + (HALL_H - 0.6) / 2, 0))
  hallGroup.add(makeBox(0.25, HALL_H - 0.6, HALL_D - 1.6, matWall, HALL_W / 2 - 1.0, 0.5 + (HALL_H - 0.6) / 2, 0))

  // --- 2.3. Mái ngói vảy cá ba gian cong vút ---
  const roof = makeBox(HALL_W + 3.4, 0.65, HALL_D + 3.2, matTile, 0, HALL_H + 0.8, 0)
  const roofRidge = makeBox(HALL_W + 2.8, 0.45, 0.7, matDarkLim, 0, HALL_H + 1.35, 0)
  hallGroup.add(roof, roofRidge)

  // 4 góc đao vuốt cong mái
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const eave = makeBox(2.2, 0.35, 2.2, matTile, sx * (HALL_W / 2 + 1.2), HALL_H + 1.1, sz * (HALL_D / 2 + 1.1))
      eave.rotation.x = -sz * 0.26
      eave.rotation.z = sx * 0.26
      hallGroup.add(eave)
    }
  }

  // --- 2.4. BÀN THỜ PHẬT & TƯỢNG PHẬT THÍCH CA TỌA THIỀN ---
  // Bàn thờ gỗ chạm hoa sen áp sát vách Bắc
  const altarTable = makeBox(4.8, 1.2, 1.8, matLim, 0, 1.1, -HALL_D / 2 + 2.0)
  hallGroup.add(altarTable)

  // Tượng Phật Thích Ca Mâu Ni tọa thiền bằng đồng
  const buddhaGroup = new THREE.Group()
  buddhaGroup.position.set(0, 1.7, -HALL_D / 2 + 2.0)
  // Tòa sen
  const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.35, 16), matBronze)
  buddhaGroup.add(lotusBase)
  // Thân tượng tọa kiết già
  const bBody = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.25, 16), matBronze)
  bBody.position.y = 0.75
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), matBronze)
  bHead.position.y = 1.48
  // Hào quang lá đề sau lưng tượng Phật
  const halo = new THREE.Mesh(new THREE.CircleGeometry(0.95, 24), new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide
  }))
  halo.position.set(0, 1.4, -0.2)
  buddhaGroup.add(bBody, bHead, halo)
  hallGroup.add(buddhaGroup)

  // Lư hương trầm nghi ngút khói & 2 chân đèn đồng
  const censer = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.26, 12), matBronze)
  censer.position.set(0, 1.83, -HALL_D / 2 + 2.6)
  hallGroup.add(censer)

  // --- 2.5. BÀN KINH ĐIỂN, MÕ GỖ HÌNH CÁ & CHUÔNG BÁT GIA TRÌ ---
  const chanterTable = makeBox(3.4, 0.85, 1.2, matLim, 0, 0.95, -HALL_D / 2 + 4.2)
  hallGroup.add(chanterTable)

  // Mõ Gỗ hình cá (Mokugyo) bên trái
  const mokugyoGroup = new THREE.Group()
  mokugyoGroup.position.set(-0.85, 1.48, -HALL_D / 2 + 4.2)
  const fishBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 12),
    new THREE.MeshStandardMaterial({ color: C.woodenFish, roughness: 0.55 })
  )
  fishBody.scale.set(1.15, 0.9, 1.25)
  // Dùi gõ mõ
  const fishMallet = makeBox(0.04, 0.04, 0.36, matLim, 0.16, 0.12, 0)
  fishMallet.rotation.z = 0.35
  mokugyoGroup.add(fishBody, fishMallet)
  hallGroup.add(mokugyoGroup)

  // Chuông bát gia trì bằng đồng bên phải
  const bellBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: C.bronzeBowl, roughness: 0.3, metalness: 0.85, side: THREE.DoubleSide })
  )
  bellBowl.rotation.x = Math.PI
  bellBowl.position.set(0.85, 1.58, -HALL_D / 2 + 4.2)
  // Đệm gối kê chuông
  const bellCushion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.1, 14),
    new THREE.MeshStandardMaterial({ color: C.cushionSaffron, roughness: 0.8 })
  )
  bellCushion.position.set(0.85, 1.42, -HALL_D / 2 + 4.2)
  hallGroup.add(bellBowl, bellCushion)

  // Cuốn kinh Bát Nhã mở trên giá gỗ
  const sutraBook = makeBox(0.48, 0.04, 0.34, new THREE.MeshStandardMaterial({ color: 0xfff8e1, roughness: 0.8 }), 0, 1.4, -HALL_D / 2 + 4.2)
  sutraBook.rotation.x = -0.2
  hallGroup.add(sutraBook)

  // Hoạt ảnh gõ mõ vật lý
  let malletAnim = 0
  function strikeWoodenFish() {
    malletAnim = 1.0
    if (onWoodenFishSound) onWoodenFishSound()
  }

  updaters.push((_t, dt) => {
    if (malletAnim > 0) {
      malletAnim -= dt * 6.5
      fishMallet.rotation.z = 0.35 + Math.sin(Math.max(0, malletAnim) * Math.PI) * 0.45
    } else {
      fishMallet.rotation.z = 0.35
    }
  })

  // Điểm tương tác: Gõ mõ tại bàn kinh
  const chanterHit = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.2, 2.0),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  chanterHit.position.set(0, floorY + 1.4, HALL_Z - HALL_D / 2 + 4.2)
  northGroup.add(chanterHit)
  interactives.push({
    object: chanterHit,
    action: 'wooden_fish',
    label: '🐟 Gõ Mõ Niệm Phật',
    focus: new THREE.Vector3(HALL_X, floorY + 1.4, HALL_Z - HALL_D / 2 + 4.2)
  })

  // Điểm tương tác: Đọc tụng kinh điển
  const sutraHit = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  sutraHit.position.set(0, floorY + 1.4, HALL_Z - HALL_D / 2 + 3.0)
  northGroup.add(sutraHit)
  interactives.push({
    object: sutraHit,
    action: 'sutra_read',
    label: '📜 Tụng Kinh Bát Nhã',
    focus: new THREE.Vector3(HALL_X, floorY + 1.4, HALL_Z - HALL_D / 2 + 3.0)
  })

  // --- 2.6. HÀNG 12 BỒ ĐOÀN TỌA THIỀN (MEDITATION CUSHIONS) ---
  const cushionMat = new THREE.MeshStandardMaterial({
    color: C.cushionSaffron,
    roughness: 0.85
  })
  const cushionGeo = new THREE.CylinderGeometry(0.44, 0.46, 0.18, 18)

  const meditationPads: THREE.Vector3[] = []
  const CUSHION_ROWS = 3
  const CUSHION_COLS = 4

  for (let r = 0; r < CUSHION_ROWS; r++) {
    const pz = -HALL_D / 2 + 5.8 + r * 1.5
    for (let c = 0; c < CUSHION_COLS; c++) {
      const px = -3.6 + c * 2.4
      const cushion = new THREE.Mesh(cushionGeo, cushionMat)
      cushion.position.set(px, 0.67, pz)
      cushion.castShadow = true
      hallGroup.add(cushion)

      const worldPos = new THREE.Vector3(HALL_X + px, floorY + 0.67, HALL_Z + pz)
      meditationPads.push(worldPos)
    }
  }

  // Điểm tương tác toạ thiền trên bồ đoàn
  const medAreaHit = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 2.0, 5.0),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  medAreaHit.position.set(HALL_X, floorY + 1.0, HALL_Z + 1.2)
  northGroup.add(medAreaHit)
  interactives.push({
    object: medAreaHit,
    action: 'meditation_sit',
    label: '🧘 Tọa Thiền Nhập Định',
    focus: new THREE.Vector3(HALL_X, floorY + 1.0, HALL_Z + 1.2)
  })

  return {
    releaseLantern: (sender, text, type) => {
      // Sinh ngay hoa đăng mới ở mép cầu tàu X: 0, Z: -87.2
      const newLan = createLotusLanternMesh(
        (Math.random() - 0.5) * 1.8,
        WHARF_Z + 7.2,
        type
      )
      newLan.speed = 0.95 // Trôi nhanh hơn một chút lúc mới thả
      floatingLanterns.unshift(newLan)
    },
    getLanternCount: () => floatingLanterns.length,
    hitWoodenFish: strikeWoodenFish,
    getMeditationPads: () => meditationPads
  }
}


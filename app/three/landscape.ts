/**
 * Module Mở Rộng Địa Hình & Cảnh Quan Quần Thể Chùa 3D (Phase 1)
 * Kiến tạo thế giới mở 200m x 200m:
 * - Đại cao nguyên đỉnh núi rợp cỏ xanh & vách đá mây ngàn
 * - Mạng lưới đại lộ lát đá kết nối: Cánh Tây (Hồ Cá), Cánh Đông (Vườn Bồ Đề & Lầu Chuông), Cánh Bắc (Bến Hoa Đăng & Thiền Đường)
 * - Rừng trúc xanh thanh tịnh (Bamboo Groves)
 * - Hệ thống Thạch Đăng cổ kính (Stone Lanterns) phát quang ấm áp
 * - Biển chỉ dẫn gỗ chạm khắc thiền môn (Direction Signposts)
 * - Ghế đá thiền tịnh & tiểu cảnh vườn đá Zen
 */
import * as THREE from 'three'
import type { Interactive, World } from './world'

// Bảng vật liệu thiên nhiên & cảnh quan
export const LandscapeMats = {
  grassPlateau: () =>
    new THREE.MeshStandardMaterial({ color: 0x476d3b, roughness: 0.95 }),
  grassLush: () =>
    new THREE.MeshStandardMaterial({ color: 0x567e45, roughness: 0.9 }),
  stoneFlag: () =>
    new THREE.MeshStandardMaterial({ color: 0x938e84, roughness: 0.85 }),
  stoneBorder: () =>
    new THREE.MeshStandardMaterial({ color: 0x6e685f, roughness: 0.95 }),
  stoneGravel: () =>
    new THREE.MeshStandardMaterial({ color: 0xb5afa4, roughness: 1.0 }),
  rockCliff: () =>
    new THREE.MeshStandardMaterial({ color: 0x58564e, roughness: 0.95 }),
  bambooTrunk: () =>
    new THREE.MeshStandardMaterial({ color: 0xa6b252, roughness: 0.6 }),
  bambooJoint: () =>
    new THREE.MeshStandardMaterial({ color: 0x5a6d2b, roughness: 0.7 }),
  bambooLeaf: () =>
    new THREE.MeshStandardMaterial({ color: 0x3d5a2c, roughness: 0.8, side: THREE.DoubleSide }),
  lanternStone: () =>
    new THREE.MeshStandardMaterial({ color: 0x7c7870, roughness: 0.88 }),
  lanternLight: () =>
    new THREE.MeshStandardMaterial({
      color: 0xffe6a3,
      emissive: 0xffaa33,
      emissiveIntensity: 0.95,
      roughness: 0.3
    }),
  signWood: () =>
    new THREE.MeshStandardMaterial({ color: 0x4d321f, roughness: 0.85 }),
  signGold: () =>
    new THREE.MeshStandardMaterial({
      color: 0xd9af48,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x634d16,
      emissiveIntensity: 0.3
    }),
  signRed: () =>
    new THREE.MeshStandardMaterial({ color: 0x7c231c, roughness: 0.75 })
}

function makeBox(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * Thạch Đăng cổ kính (Stone Lantern)
 * Đặt dọc các lối đi, phát ánh sáng vàng ấm ban đêm
 */
export function buildStoneLantern(x: number, y: number, z: number, updaters: World['updaters']) {
  const g = new THREE.Group()
  const M = LandscapeMats

  // Đế đá 2 tầng
  g.add(makeBox(1.5, 0.4, 1.5, M.stoneBorder(), 0, 0.2, 0))
  g.add(makeBox(1.2, 0.35, 1.2, M.lanternStone(), 0, 0.55, 0))

  // Trụ đá giữa
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 8), M.lanternStone())
  pillar.position.y = 1.4
  pillar.castShadow = true
  g.add(pillar)

  // Bệ đỡ lồng đèn
  g.add(makeBox(1.4, 0.3, 1.4, M.lanternStone(), 0, 2.25, 0))

  // Lồng đèn có 4 cửa sổ rỗng + lõi phát sáng bên trong
  const fireBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.65), M.lanternLight())
  fireBox.position.y = 2.85
  g.add(fireBox)

  // 4 cột góc lồng đèn
  for (const cx of [-0.5, 0.5]) {
    for (const cz of [-0.5, 0.5]) {
      g.add(makeBox(0.18, 0.9, 0.18, M.lanternStone(), cx, 2.85, cz))
    }
  }

  // Mái đá cong 4 góc
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.65, 4), M.lanternStone())
  roof.rotation.y = Math.PI / 4
  roof.position.y = 3.65
  roof.castShadow = true
  g.add(roof)

  // Chóp búp sen đá đỉnh thạch đăng
  const finialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.3, 8), M.lanternStone())
  finialBase.position.y = 4.1
  const finialBud = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.lanternStone())
  finialBud.position.y = 4.35
  g.add(finialBase, finialBud)

  // Hiệu ứng ánh nến lung linh nhẹ
  const phase = Math.random() * Math.PI * 2
  updaters.push((t) => {
    ;(fireBox.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.85 + Math.sin(t * 3.5 + phase) * 0.18
  })

  g.position.set(x, y, z)
  return g
}

/**
 * Cụm Trúc Xanh Thiền Tịnh (Bamboo Grove)
 * Tạo rặng tre trúc râm mát rì rào dọc theo các con đường đá
 */
export function buildBambooGrove(
  centerX: number,
  baseY: number,
  centerZ: number,
  stalkCount = 7,
  radius = 2.2,
  updaters?: World['updaters']
) {
  const g = new THREE.Group()
  const M = LandscapeMats

  const stalks: Array<{ mesh: THREE.Group; phase: number; h: number }> = []

  for (let i = 0; i < stalkCount; i++) {
    const angle = (i / stalkCount) * Math.PI * 2 + Math.random() * 0.4
    const r = Math.random() * radius
    const bx = Math.cos(angle) * r
    const bz = Math.sin(angle) * r
    const h = 5.2 + Math.random() * 3.2 // chiều cao ngọn trúc 5m - 8m
    const rStalk = 0.08 + Math.random() * 0.04

    const stalkGroup = new THREE.Group()
    stalkGroup.position.set(bx, 0, bz)

    // Tạo các đốt thân trúc
    const segmentCount = Math.floor(h / 0.7)
    for (let s = 0; s < segmentCount; s++) {
      const segH = h / segmentCount
      const segMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rStalk * 0.95, rStalk, segH - 0.04, 7),
        M.bambooTrunk()
      )
      segMesh.position.y = s * segH + segH / 2
      segMesh.castShadow = true

      // Vòng đốt trúc sẫm màu
      const jointMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rStalk * 1.15, rStalk * 1.15, 0.04, 7),
        M.bambooJoint()
      )
      jointMesh.position.y = s * segH + segH

      stalkGroup.add(segMesh, jointMesh)

      // Cành lá trúc tỏa ra từ nửa trên
      if (s > segmentCount * 0.45 && Math.random() > 0.3) {
        const branchAng = Math.random() * Math.PI * 2
        const branchLen = 0.8 + Math.random() * 0.9
        const branchMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.03, branchLen, 4),
          M.bambooJoint()
        )
        branchMesh.position.set(
          Math.cos(branchAng) * (rStalk + branchLen * 0.4),
          s * segH + segH * 0.7,
          Math.sin(branchAng) * (rStalk + branchLen * 0.4)
        )
        branchMesh.rotation.z = Math.cos(branchAng) * 0.85
        branchMesh.rotation.x = Math.sin(branchAng) * 0.85

        // Tán lá trúc hình thoi
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.28, 0.8, 3),
          M.bambooLeaf()
        )
        leaf.position.set(
          Math.cos(branchAng) * (rStalk + branchLen * 0.9),
          s * segH + segH * 0.9,
          Math.sin(branchAng) * (rStalk + branchLen * 0.9)
        )
        leaf.rotation.y = branchAng
        leaf.rotation.x = Math.PI / 3
        stalkGroup.add(branchMesh, leaf)
      }
    }

    g.add(stalkGroup)
    stalks.push({ mesh: stalkGroup, phase: Math.random() * Math.PI * 2, h })
  }

  // Hiệu ứng gió thoảng làm ngọn trúc đung đưa nhẹ nhàng
  if (updaters) {
    updaters.push((t) => {
      for (const s of stalks) {
        const sway = Math.sin(t * 1.4 + s.phase) * 0.035
        s.mesh.rotation.z = sway
        s.mesh.rotation.x = Math.cos(t * 1.1 + s.phase) * 0.02
      }
    })
  }

  g.position.set(centerX, baseY, centerZ)
  return g
}

/**
 * Biển chỉ dẫn phong cách Thiền Môn (Direction Signpost)
 * Giúp người chơi định hướng rõ ràng khi đi dạo trong thế giới 3D
 */
export function buildSignpost(
  x: number,
  y: number,
  z: number,
  signText: string,
  subText: string,
  dir: 'left' | 'right' | 'forward' | 'cross',
  interactives?: Interactive[]
) {
  const g = new THREE.Group()
  const M = LandscapeMats

  // Chân đế đá
  g.add(makeBox(1.2, 0.4, 1.2, M.stoneBorder(), 0, 0.2, 0))

  // Cột gỗ lim
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 8), M.signWood())
  post.position.y = 1.8
  post.castShadow = true
  g.add(post)

  // Mái che nhỏ trên đỉnh biển gỗ
  const miniRoof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.45, 4), M.stoneBorder())
  miniRoof.rotation.y = Math.PI / 4
  miniRoof.position.y = 3.55
  g.add(miniRoof)

  // Tấm bảng gỗ chạm khắc
  const board = makeBox(3.2, 1.1, 0.2, M.signWood(), 0, 2.7, 0)
  board.add(makeBox(3.0, 0.9, 0.06, M.signRed(), 0, 0, 0.09))
  g.add(board)

  // Canvas vẽ chữ thư pháp chỉ hướng
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#6f241f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#d4af5a'
  ctx.lineWidth = 8
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

  ctx.fillStyle = '#fce4a6'
  ctx.font = 'bold 44px "Noto Serif", "Segoe UI", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(signText, canvas.width / 2, 58)

  ctx.font = 'italic 28px "Be Vietnam Pro", sans-serif'
  ctx.fillStyle = '#e8d5be'
  ctx.fillText(subText, canvas.width / 2, 114)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const signPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 0.85),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })
  )
  signPlane.position.set(0, 2.7, 0.16)
  g.add(signPlane)

  // Mặt sau biển
  const signPlaneBack = signPlane.clone()
  signPlaneBack.rotation.y = Math.PI
  signPlaneBack.position.set(0, 2.7, -0.16)
  g.add(signPlaneBack)

  g.position.set(x, y, z)

  if (interactives) {
    const hitGeo = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 3.5, 3.6),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    hitGeo.position.set(x, y + 1.8, z)
    interactives.push({
      object: hitGeo,
      action: 'signpost_' + dir,
      label: `📜 ${signText}`,
      focus: new THREE.Vector3(x, y + 1.8, z + 3.0)
    })
  }

  return g
}

/**
 * Ghế Đá Thiền Tịnh (Stone Zen Bench)
 * Đặt dưới bóng mát cho khách hành hương tĩnh tâm
 */
export function buildStoneBench(x: number, y: number, z: number, rotationY = 0) {
  const g = new THREE.Group()
  const M = LandscapeMats

  // 2 chân đá khối
  g.add(makeBox(0.45, 0.65, 0.6, M.stoneBorder(), -1.1, 0.325, 0))
  g.add(makeBox(0.45, 0.65, 0.6, M.stoneBorder(), 1.1, 0.325, 0))

  // Mặt ghế đá hoa cương mài nhẵn
  g.add(makeBox(3.0, 0.18, 0.9, M.stoneFlag(), 0, 0.74, 0))

  // Tựa lưng đá thấp
  g.add(makeBox(3.0, 0.65, 0.15, M.stoneFlag(), 0, 1.15, -0.38))

  g.position.set(x, y, z)
  g.rotation.y = rotationY
  return g
}

/**
 * XÂY DỰNG TOÀN BỘ CẢNH QUAN MỞ RỘNG 200M X 200M (PHASE 1)
 */
export function buildExpandedLandscape(
  root: THREE.Group,
  floorY: number,
  updaters: World['updaters'],
  interactives: Interactive[]
) {
  const M = LandscapeMats
  const landscapeGroup = new THREE.Group()
  root.add(landscapeGroup)

  // =========================================================================
  // 1. ĐẠI CAO NGUYÊN ĐỈNH NÚI (The Grand Mountain Plateau) - 190m x 190m
  // =========================================================================
  // Thảm cỏ thiền tịnh rộng lớn trải dài toàn bộ quần thể chùa
  const plateauGrass = makeBox(188, 1.4, 184, M.grassPlateau(), 0, floorY - 0.72, -16)
  landscapeGroup.add(plateauGrass)

  // Lớp đồi đất nhung xanh viền quanh tạo độ gợn sóng tự nhiên
  const terraceWest = makeBox(70, 0.25, 90, M.grassLush(), -56, floorY + 0.05, 0)
  const terraceEast = makeBox(70, 0.25, 90, M.grassLush(), 56, floorY + 0.05, 0)
  const terraceNorth = makeBox(110, 0.25, 60, M.grassLush(), 0, floorY + 0.05, -62)
  landscapeGroup.add(terraceWest, terraceEast, terraceNorth)

  // =========================================================================
  // 2. MẠNG LƯỚI ĐẠI LỘ LÁT ĐÁ (Grand Stone Pathway Network)
  // =========================================================================

  // --- TRỤC NỐI SANG CÁNH TÂY (Lối sang Hồ Cá Phóng Sinh) ---
  // Đoạn 1: Từ sân chùa (X: -24, Z: 20) chạy thẳng sang Tây đến X: -68
  const pathWestMain = makeBox(46, 0.12, 5.2, M.stoneFlag(), -46, floorY + 0.06, 20)
  const pathWestGravel = makeBox(48, 0.06, 6.4, M.stoneGravel(), -46, floorY + 0.03, 20)
  landscapeGroup.add(pathWestMain, pathWestGravel)

  // Đoạn 2: Từ (X: -68, Z: 20) bẻ góc vuông dẫn lên hướng Bắc tới Hồ Cá (X: -65, Z: -2)
  const pathWestToPond = makeBox(5.2, 0.12, 26, M.stoneFlag(), -66, floorY + 0.06, 7)
  const pathWestToPondGravel = makeBox(6.4, 0.06, 28, M.stoneGravel(), -66, floorY + 0.03, 7)
  landscapeGroup.add(pathWestToPond, pathWestToPondGravel)

  // Đoạn 3: Lối đi tắt từ hông Chánh Điện (X: -32, Z: -12) sang Hồ Cá (X: -62, Z: -2)
  const pathWestDiagonal = makeBox(32, 0.1, 4.2, M.stoneFlag(), -48, floorY + 0.06, -7)
  landscapeGroup.add(pathWestDiagonal)

  // Quảng trường đá nhỏ trước Bến Hồ Cá (X: -65, Z: 0)
  const pondPlaza = makeBox(18, 0.14, 18, M.stoneFlag(), -65, floorY + 0.07, 0)
  const pondPlazaBorder = makeBox(19.2, 0.08, 19.2, M.stoneBorder(), -65, floorY + 0.04, 0)
  landscapeGroup.add(pondPlaza, pondPlazaBorder)

  // --- TRỤC NỐI SANG CÁNH ĐÔNG (Lối sang Vườn Bồ Đề & Lầu Đại Hồng Chung) ---
  // Đoạn 1: Từ sân chùa (X: 24, Z: 20) chạy thẳng sang Đông đến X: +68
  const pathEastMain = makeBox(46, 0.12, 5.2, M.stoneFlag(), 46, floorY + 0.06, 20)
  const pathEastGravel = makeBox(48, 0.06, 6.4, M.stoneGravel(), 46, floorY + 0.03, 20)
  landscapeGroup.add(pathEastMain, pathEastGravel)

  // Đoạn 2: Rẽ vào Lầu Chuông (X: 48, Z: 24)
  const pathEastToBell = makeBox(14, 0.12, 4.2, M.stoneFlag(), 48, floorY + 0.06, 24)
  landscapeGroup.add(pathEastToBell)

  // Đoạn 3: Từ (X: 68, Z: 20) dẫn lên hướng Bắc tới Vườn Bồ Đề Tâm (X: 64, Z: -12)
  const pathEastToBodhi = makeBox(5.2, 0.12, 36, M.stoneFlag(), 66, floorY + 0.06, 2)
  const pathEastToBodhiGravel = makeBox(6.4, 0.06, 38, M.stoneGravel(), 66, floorY + 0.03, 2)
  landscapeGroup.add(pathEastToBodhi, pathEastToBodhiGravel)

  // Lối tắt từ hông Chánh Điện (X: +32, Z: -12) sang Vườn Bồ Đề (X: 62, Z: -12)
  const pathEastDirect = makeBox(32, 0.1, 4.2, M.stoneFlag(), 48, floorY + 0.06, -12)
  landscapeGroup.add(pathEastDirect)

  // Quảng trường đá trước Vườn Bồ Đề (X: 64, Z: -12)
  const bodhiPlaza = makeBox(18, 0.14, 18, M.stoneFlag(), 64, floorY + 0.07, -12)
  landscapeGroup.add(bodhiPlaza)

  // --- TRỤC PHÍA BẮC (Sau Chánh Điện dẫn ra Bến Hoa Đăng & Thiền Đường) ---
  // 2 hành lang đá chạy dọc 2 bên hông Chánh Điện dẫn ra sân sau
  const pathNorthWestWing = makeBox(4.4, 0.1, 48, M.stoneFlag(), -33, floorY + 0.06, -34)
  const pathNorthEastWing = makeBox(4.4, 0.1, 48, M.stoneFlag(), 33, floorY + 0.06, -34)
  landscapeGroup.add(pathNorthWestWing, pathNorthEastWing)

  // Đại lộ sau Chánh Điện nối 2 cánh và dẫn thẳng ra Bến Hoa Đăng (Z: -60 đến -82)
  const pathNorthBackCross = makeBox(70, 0.12, 5.0, M.stoneFlag(), 0, floorY + 0.06, -58)
  const pathNorthToRiver = makeBox(6.0, 0.12, 26, M.stoneFlag(), 0, floorY + 0.06, -72)
  landscapeGroup.add(pathNorthBackCross, pathNorthToRiver)

  // Bến đá hoa cương chuẩn bị cho Bến Hoa Đăng (X: 0, Z: -85)
  const riverDockPlaza = makeBox(28, 0.14, 14, M.stoneFlag(), 0, floorY + 0.06, -84)
  landscapeGroup.add(riverDockPlaza)

  // =========================================================================
  // 3. RỪNG TRÚC XANH & TIỂU CẢNH THIÊN NHIÊN (Bamboo Groves & Pine Trees)
  // =========================================================================
  // Hàng trúc xanh che bóng mát dọc lối đi Cánh Tây
  landscapeGroup.add(buildBambooGrove(-36, floorY, 26, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(-48, floorY, 26, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(-60, floorY, 26, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(-72, floorY, 12, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(-72, floorY, -6, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(-52, floorY, -16, 7, 2.2, updaters))

  // Hàng trúc xanh che bóng mát dọc lối đi Cánh Đông
  landscapeGroup.add(buildBambooGrove(36, floorY, 26, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(48, floorY, 28, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(60, floorY, 26, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(72, floorY, 12, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(72, floorY, -4, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(52, floorY, -22, 8, 2.5, updaters))

  // Rừng trúc quanh Bến Hoa Đăng và phía sau Chánh Điện
  landscapeGroup.add(buildBambooGrove(-16, floorY, -68, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(16, floorY, -68, 8, 2.5, updaters))
  landscapeGroup.add(buildBambooGrove(-24, floorY, -80, 9, 2.8, updaters))
  landscapeGroup.add(buildBambooGrove(24, floorY, -80, 9, 2.8, updaters))

  // =========================================================================
  // 4. HỆ THỐNG THẠCH ĐĂNG CỔ KÍNH (Stone Lanterns with Warm Night Glow)
  // =========================================================================
  // Thạch đăng dọc đại lộ Cánh Tây (soi sáng ngã rẽ và lối sang Hồ Cá)
  landscapeGroup.add(buildStoneLantern(-34, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(-52, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(-68, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(-69, floorY, 10, updaters))
  landscapeGroup.add(buildStoneLantern(-69, floorY, -4, updaters))
  landscapeGroup.add(buildStoneLantern(-58, floorY, 6, updaters))
  landscapeGroup.add(buildStoneLantern(-58, floorY, -6, updaters))

  // Thạch đăng dọc đại lộ Cánh Đông (soi sáng lối sang Vườn Bồ Đề & Lầu Chuông)
  landscapeGroup.add(buildStoneLantern(34, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(52, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(68, floorY, 23.5, updaters))
  landscapeGroup.add(buildStoneLantern(69, floorY, 10, updaters))
  landscapeGroup.add(buildStoneLantern(69, floorY, -6, updaters))
  landscapeGroup.add(buildStoneLantern(56, floorY, 6, updaters))
  landscapeGroup.add(buildStoneLantern(56, floorY, -18, updaters))

  // Thạch đăng dọc lối ra sau Chánh Điện & Bến Hoa Đăng
  landscapeGroup.add(buildStoneLantern(-36, floorY, -54, updaters))
  landscapeGroup.add(buildStoneLantern(36, floorY, -54, updaters))
  landscapeGroup.add(buildStoneLantern(-10, floorY, -62, updaters))
  landscapeGroup.add(buildStoneLantern(10, floorY, -62, updaters))
  landscapeGroup.add(buildStoneLantern(-8, floorY, -80, updaters))
  landscapeGroup.add(buildStoneLantern(8, floorY, -80, updaters))

  // =========================================================================
  // 5. BIỂN CHỈ DẪN THIỀN MÔN (Direction Signposts)
  // =========================================================================
  // Biển 1: Tại ngã ba Tây (Sân Chùa rẽ sang Hồ Cá)
  landscapeGroup.add(
    buildSignpost(
      -26,
      floorY,
      17,
      'Hồ Cá Phóng Sinh',
      'Tây Phương Cảnh Trí · Đài Sen',
      'left',
      interactives
    )
  )

  // Biển 2: Tại ngã ba Đông (Sân Chùa rẽ sang Vườn Bồ Đề & Lầu Chuông)
  landscapeGroup.add(
    buildSignpost(
      26,
      floorY,
      17,
      'Vườn Bồ Đề Tâm',
      'Cây Nguyện Ước · Lầu Đại Hồng Chung',
      'right',
      interactives
    )
  )

  // Biển 3: Tại quảng trường sau Chánh Điện (Hướng ra Bến Hoa Đăng)
  landscapeGroup.add(
    buildSignpost(
      0,
      floorY,
      -55,
      'Bến Thả Hoa Đăng',
      'Sông Trăng Huyền Ảo · Thiền Đường',
      'forward',
      interactives
    )
  )

  // Biển 4: Tại Bến Hồ Cá (Quay về Chánh Điện)
  landscapeGroup.add(
    buildSignpost(
      -62,
      floorY,
      12,
      'Đại Điện Tam Bảo',
      'Sân Chùa & Lối Về Cổng Tam Quan',
      'right',
      interactives
    )
  )

  // Biển 5: Tại Vườn Bồ Đề (Quay về Chánh Điện)
  landscapeGroup.add(
    buildSignpost(
      62,
      floorY,
      12,
      'Đại Điện Tam Bảo',
      'Sân Chùa & Lầu Chuông',
      'left',
      interactives
    )
  )

  // =========================================================================
  // 6. GHẾ ĐÁ THIỀN TỊNH (Zen Stone Benches)
  // =========================================================================
  landscapeGroup.add(buildStoneBench(-42, floorY, 23.5, 0))
  landscapeGroup.add(buildStoneBench(-62, floorY, 15, Math.PI / 2))
  landscapeGroup.add(buildStoneBench(42, floorY, 23.5, 0))
  landscapeGroup.add(buildStoneBench(62, floorY, 15, -Math.PI / 2))
  landscapeGroup.add(buildStoneBench(-12, floorY, -76, Math.PI / 2))
  landscapeGroup.add(buildStoneBench(12, floorY, -76, -Math.PI / 2))

  // =========================================================================
  // 7. VÁCH NÚI ĐÁ & TIỂU CẢNH THIỀN (Rock Ledges & Natural Scenery)
  // =========================================================================
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2
    const dist = 88 + (i % 3) * 6
    const rx = Math.cos(angle) * dist
    const rz = Math.sin(angle) * dist - 16
    const rockMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(4 + (i % 4) * 2, 0),
      M.rockCliff()
    )
    rockMesh.position.set(rx, floorY - 1.5, rz)
    rockMesh.rotation.set(i * 0.4, i * 0.7, 0)
    rockMesh.castShadow = true
    rockMesh.receiveShadow = true
    landscapeGroup.add(rockMesh)
  }

  return landscapeGroup
}

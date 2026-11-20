/**
 * 3D Physics, Collision & Terrain Elevation System (Open-World Sanctuary)
 * 
 * Quản lý toàn bộ vật lý va chạm, trượt tường (Wall Sliding), chống kẹt (Anti-Stuck)
 * và nâng hạ cao độ địa hình tự nhiên (Terrain Ground Height).
 */

export interface BoxCollider {
  type: 'box'
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  name?: string
}

export interface CircleCollider {
  type: 'circle'
  x: number
  z: number
  radius: number
  name?: string
}

export type Collider = BoxCollider | CircleCollider

// Bán kính va chạm thân nhân vật
export const PLAYER_RADIUS = 0.38

/**
 * Danh sách toàn bộ vùng cản vật lý trong Thế Giới 3D Chùa Online (200m x 200m)
 */
export function createWorldColliders(): Collider[] {
  const list: Collider[] = []

  // 1. GHẾ ĐÁ THIỀN TỊNH (6 ghế đá)
  list.push({ type: 'box', minX: -43.6, maxX: -40.4, minZ: 22.8, maxZ: 24.2, name: 'Ghế đá Đại Lộ Tây 1' })
  list.push({ type: 'box', minX: -62.6, maxX: -61.4, minZ: 13.4, maxZ: 16.6, name: 'Ghế đá Bến Hồ Cá' })
  list.push({ type: 'box', minX: 40.4, maxX: 43.6, minZ: 22.8, maxZ: 24.2, name: 'Ghế đá Đại Lộ Đông 1' })
  list.push({ type: 'box', minX: 61.4, maxX: 62.6, minZ: 13.4, maxZ: 16.6, name: 'Ghế đá Vườn Bồ Đề' })
  list.push({ type: 'box', minX: -12.6, maxX: -11.4, minZ: -77.6, maxZ: -74.4, name: 'Ghế đá Bến Sông Tây' })
  list.push({ type: 'box', minX: 11.4, maxX: 12.6, minZ: -77.6, maxZ: -74.4, name: 'Ghế đá Bến Sông Đông' })

  // 2. HỆ THỐNG THẠCH ĐĂNG CỔ KÍNH (20+ trụ đèn đá)
  const lanternRadius = 0.52
  const lanterns = [
    { x: -34, z: 23.5 }, { x: -52, z: 23.5 }, { x: -68, z: 23.5 },
    { x: -69, z: 13 }, { x: -50, z: 1 }, { x: -50, z: -9 }, { x: -80, z: 1 }, { x: -80, z: -9 },
    { x: 34, z: 23.5 }, { x: 52, z: 23.5 }, { x: 68, z: 23.5 },
    { x: 69, z: 10 }, { x: 69, z: -6 }, { x: 56, z: 6 }, { x: 56, z: -18 },
    { x: -36, z: -54 }, { x: 36, z: -54 }, { x: -10, z: -62 }, { x: 10, z: -62 },
    { x: -8, z: -80 }, { x: 8, z: -80 }
  ]
  lanterns.forEach((l, i) => {
    list.push({ type: 'circle', x: l.x, z: l.z, radius: lanternRadius, name: `Thạch đăng ${i + 1}` })
  })

  // Lan can đá Cầu vòm vượt Hồ Cá (ngăn không cho ngã xuống nước, chừa lối đi giữa Z: -5.7 đến -2.3)
  list.push({ type: 'box', minX: -77.5, maxX: -52.5, minZ: -6.4, maxZ: -5.8, name: 'Lan can Nam Cầu đá' })
  list.push({ type: 'box', minX: -77.5, maxX: -52.5, minZ: -2.2, maxZ: -1.6, name: 'Lan can Bắc Cầu đá' })

  // 3. RỪNG TRÚC XANH THIỀN TỊNH (16 rặng trúc xanh)
  const bambooRadius = 1.35
  const bambooGroves = [
    { x: -36, z: 26 }, { x: -48, z: 26 }, { x: -60, z: 26 },
    { x: -72, z: 12 }, { x: -74, z: -16 }, { x: -52, z: -16 },
    { x: 36, z: 26 }, { x: 48, z: 28 }, { x: 60, z: 26 },
    { x: 72, z: 12 }, { x: 72, z: -6 }, { x: 52, z: -16 },
    { x: -16, z: -68 }, { x: 16, z: -68 }, { x: -24, z: -80 }, { x: 24, z: -80 }
  ]
  bambooGroves.forEach((b, i) => {
    list.push({ type: 'circle', x: b.x, z: b.z, radius: bambooRadius, name: `Rặng trúc ${i + 1}` })
  })

  // 4. BIỂN CHỈ DẪN THIỀN MÔN (5 biển chỉ dẫn)
  const signposts = [
    { x: -26, z: 17 }, { x: 26, z: 17 }, { x: 0, z: -55 },
    { x: -62, z: 12 }, { x: 62, z: 12 }
  ]
  signposts.forEach((s, i) => {
    list.push({ type: 'circle', x: s.x, z: s.z, radius: 0.55, name: `Biển chỉ dẫn ${i + 1}` })
  })

  // 5. CÁC VẬT PHẨM SÂN CHÙA ĐẠI LỄ
  list.push({ type: 'box', minX: 13.0, maxX: 15.0, minZ: 33.2, maxZ: 34.8, name: 'Thùng công đức' })
  list.push({ type: 'circle', x: -24, z: 14, radius: 1.1, name: 'Giá đại hồng chung sân chùa' })
  list.push({ type: 'circle', x: 24, z: 14, radius: 1.1, name: 'Trống gỗ sân chùa' })

  // 6. ĐẠI ĐIỆN TAM BẢO (CHÁNH ĐIỆN)
  list.push({ type: 'box', minX: -28.5, maxX: 28.5, minZ: -54.8, maxZ: -53.2, name: 'Vách sau Chánh Điện' })
  list.push({ type: 'box', minX: -28.8, maxX: -27.2, minZ: -54.0, maxZ: -9.5, name: 'Vách Tây Chánh Điện' })
  list.push({ type: 'box', minX: 27.2, maxX: 28.8, minZ: -54.0, maxZ: -9.5, name: 'Vách Đông Chánh Điện' })
  list.push({ type: 'box', minX: -28.5, maxX: -11.5, minZ: -10.8, maxZ: -9.2, name: 'Mặt tiền Tây Chánh Điện' })
  list.push({ type: 'box', minX: 11.5, maxX: 28.5, minZ: -10.8, maxZ: -9.2, name: 'Mặt tiền Đông Chánh Điện' })
  list.push({ type: 'box', minX: -23.0, maxX: 23.0, minZ: -54.0, maxZ: -46.5, name: 'Ban Tam Thế' })
  list.push({ type: 'box', minX: -9.5, maxX: 9.5, minZ: -42.8, maxZ: -39.2, name: 'Hương án Chánh Điện' })
  list.push({ type: 'box', minX: 17.2, maxX: 22.8, minZ: -28.5, maxZ: -23.5, name: 'Pháp tòa tụng kinh' })
  list.push({ type: 'box', minX: -19.5, maxX: -16.5, minZ: -25.5, maxZ: -22.5, name: 'Bàn ống xăm' })

  // Các hàng đại trụ lim trong điện
  const hallCols = [
    { x: -22, z: -12 }, { x: -11, z: -12 }, { x: 11, z: -12 }, { x: 22, z: -12 },
    { x: -22, z: -34 }, { x: -11, z: -34 }, { x: 11, z: -34 }, { x: 22, z: -34 },
    { x: -22, z: -46 }, { x: 22, z: -46 }
  ]
  hallCols.forEach((c, i) => {
    list.push({ type: 'circle', x: c.x, z: c.z, radius: 0.42, name: `Cột Chánh Điện ${i + 1}` })
  })

  // 7. LẦU CHUÔNG ĐẠI HỒNG CHUNG (48, 28)
  const bellCols = [
    { x: 44.2, z: 24.2 }, { x: 51.8, z: 24.2 },
    { x: 44.2, z: 31.8 }, { x: 51.8, z: 31.8 }
  ]
  bellCols.forEach((c, i) => {
    list.push({ type: 'circle', x: c.x, z: c.z, radius: 0.48, name: `Cột Lầu Chuông ${i + 1}` })
  })
  list.push({ type: 'circle', x: 48.0, z: 28.0, radius: 1.6, name: 'Quả Đại Hồng Chung' })

  // 8. VƯỜN BỒ ĐỀ TÂM (64, -12)
  list.push({ type: 'circle', x: 64.0, z: -12.0, radius: 2.3, name: 'Cội Bồ Đề cổ thụ' })
  list.push({ type: 'box', minX: 58.2, maxX: 61.4, minZ: -16.2, maxZ: -14.2, name: 'Bàn đá nguyện ước' })
  list.push({ type: 'circle', x: 68.2, z: -15.5, radius: 1.15, name: 'Giếng ngọc Bồ Đề' })

  // 9. NHÀ TỤNG KINH & THIỀN ĐƯỜNG TỊNH ĐỘ (-48, -48)
  // 3 vách tường bao quanh (Bắc, Tây, Đông)
  list.push({ type: 'box', minX: -55.8, maxX: -40.2, minZ: -53.4, maxZ: -51.8, name: 'Vách Bắc Thiền Đường' })
  list.push({ type: 'box', minX: -55.8, maxX: -54.2, minZ: -53.0, maxZ: -43.2, name: 'Vách Tây Thiền Đường' })
  list.push({ type: 'box', minX: -41.8, maxX: -40.2, minZ: -53.0, maxZ: -43.2, name: 'Vách Đông Thiền Đường' })
  // Bàn thờ Phật Thích Ca & Bàn kinh mõ gỗ (sát vách Bắc)
  list.push({ type: 'box', minX: -50.5, maxX: -45.5, minZ: -52.5, maxZ: -47.0, name: 'Ban thờ Thiền Đường' })
  // 2 cột trụ mặt tiền (mặt Nam mở cửa rộng 4.6m, không có vách cản bước ra)
  list.push({ type: 'circle', x: -50.67, z: -43.55, radius: 0.3, name: 'Cột hiên Tây Thiền Đường' })
  list.push({ type: 'circle', x: -45.33, z: -43.55, radius: 0.3, name: 'Cột hiên Đông Thiền Đường' })

  // 10. BẾN THẢ HOA ĐĂNG SÔNG TRĂNG
  // Lan can đá hoa cương 2 bên mạn bến (X: ±15.2, Z: -84)
  list.push({ type: 'box', minX: -15.8, maxX: -14.6, minZ: -89.0, maxZ: -78.5, name: 'Lan can Bến Sông Tây' })
  list.push({ type: 'box', minX: 14.6, maxX: 15.8, minZ: -89.0, maxZ: -78.5, name: 'Lan can Bến Sông Đông' })
  // Lan can đá mép bờ sông (ngăn trượt xuống vực nước, chừa lối cầu tàu gỗ |X| <= 2.8)
  list.push({ type: 'box', minX: -15.6, maxX: -2.8, minZ: -85.2, maxZ: -83.6, name: 'Lan can Mép Bờ Tây' })
  list.push({ type: 'box', minX: 2.8, maxX: 15.6, minZ: -85.2, maxZ: -83.6, name: 'Lan can Mép Bờ Đông' })

  // 11. CỔNG TAM QUAN (Z: 46)
  list.push({ type: 'box', minX: -18.0, maxX: -7.0, minZ: 45.4, maxZ: 46.6, name: 'Tường cổng Tây' })
  list.push({ type: 'box', minX: 7.0, maxX: 18.0, minZ: 45.4, maxZ: 46.6, name: 'Tường cổng Đông' })
  list.push({ type: 'circle', x: -5.5, z: 46.0, radius: 0.6, name: 'Cột Cổng Tam Quan Tây' })
  list.push({ type: 'circle', x: 5.5, z: 46.0, radius: 0.6, name: 'Cột Cổng Tam Quan Đông' })

  // 12. ĐÀI SEN ĐÁ PHUN NƯỚC GIỮA HỒ CÁ (ở X: -66.5, Z: 0.8 trong hồ, không nằm trên cầu)
  list.push({ type: 'circle', x: -66.5, z: 0.8, radius: 2.2, name: 'Đài sen giữa hồ' })

  // 13. VÁCH ĐÁ BIÊN BẢN ĐỒ (Phù hợp với vị trí thực tế trong landscape.ts)
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2
    let dist = 94 + (i % 3) * 4
    let rx = Math.cos(angle) * dist
    let rz = Math.sin(angle) * dist - 16
    if (rx < -60 && rz > -22 && rz < 14) {
      rx = -96
    }
    const rSize = 3.0 + (i % 3) * 0.8
    list.push({ type: 'circle', x: rx, z: rz, radius: rSize * 0.9, name: `Vách đá biên ${i + 1}` })
  }

  // 14. KHỐI ĐÁ TẢNG BỜ HỒ SEN CÁ KOI (Ngăn đi xuyên vào lòng đá bị kẹt)
  const POND_X = -65.0
  const POND_Z = -4.0
  const POND_RADIUS_X = 14.5
  const POND_RADIUS_Z = 12.0
  const rockCount = 28
  for (let i = 0; i < rockCount; i++) {
    const a = (i / rockCount) * Math.PI * 2
    const rx = POND_X + Math.cos(a) * (POND_RADIUS_X + 0.4)
    const rz = POND_Z + Math.sin(a) * (POND_RADIUS_Z + 0.4)
    const nearBridgeEnds = Math.abs(rz - POND_Z) < 3.2 && (rx > POND_X + 10 || rx < POND_X - 10)
    if (nearBridgeEnds) continue
    const rockScale = 0.8 + (i % 3) * 0.35
    list.push({ type: 'circle', x: rx, z: rz, radius: rockScale * 0.9, name: `Đá bờ hồ cá ${i + 1}` })
  }

  // 15. VIỀN ĐÁ TẢNG GÒ BỒ ĐỀ
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2
    const bx = 64 + Math.cos(a) * 11.2
    const bz = -12 + Math.sin(a) * 11.2
    list.push({ type: 'circle', x: bx, z: bz, radius: 0.8, name: `Đá viền Bồ Đề ${i + 1}` })
  }

  // 16. BẢNG SỔ ĐIỂM DANH TINH TẤN (18, 20)
  list.push({ type: 'circle', x: 18.0, z: 20.0, radius: 1.15, name: 'Bảng Sổ Điểm Danh' })

  return list
}

const WORLD_COLLIDERS = createWorldColliders()

/**
 * Kiểm tra xem điểm (x, z) với bán kính `radius` có bị chặn bởi vật thể nào không
 */
export function isPointBlocked(x: number, z: number, radius = PLAYER_RADIUS): boolean {
  // 1. Kiểm tra biên giới hạn thế giới
  if (x < -86 + radius || x > 86 - radius || z < -94 + radius || z > 60 - radius) {
    return true
  }

  // 2. Va chạm mặt nước Hồ Sen: chỉ được đi trên cầu đá vòm
  const pRelX = (x - (-65)) / 13.5
  const pRelZ = (z - (-4)) / 11.5
  const inPondWater = (pRelX * pRelX + pRelZ * pRelZ) < 1.0
  // Cầu đá nối bờ Đông (X: -49.0) sang bờ Tây (X: -81.0):
  // Phủ rộng ra ngoài mép bờ hồ để loại bỏ hoàn toàn vùng kẹt ở 2 mố cầu
  const onBridge = Math.abs(z - (-4)) <= 1.85 && x >= -81.5 && x <= -48.5
  if (inPondWater && !onBridge) {
    return true
  }

  // 3. Va chạm mặt nước Sông Trăng:
  // Nước sông bắt đầu tại Z < -84.2. Chỉ được đi trên cầu tàu gỗ: X trong [-2.6, 2.6] và Z trong [-93.5, -84.0]
  if (z < -84.2) {
    const onWharfPier = Math.abs(x) <= 2.6 && z >= -93.5
    if (!onWharfPier) {
      return true // Ngăn không cho bước chân xuống nước sông
    }
    // Chặn mép đầu cầu tàu ở Z = -93.5
    if (z < -93.5 + radius) {
      return true
    }
  }

  // 4. Kiểm tra toàn bộ Colliders tĩnh (Hộp & Trụ)
  for (const c of WORLD_COLLIDERS) {
    if (c.type === 'box') {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true
      }
    } else if (c.type === 'circle') {
      const dx = x - c.x
      const dz = z - c.z
      const minDist = c.radius + radius
      if (dx * dx + dz * dz < minDist * minDist) {
        return true
      }
    }
  }

  return false
}

/**
 * Thuật toán Trượt Tường & Chống kẹt (Wall Sliding & Anti-Stuck Engine):
 * 1. Nếu vị trí hiện tại đang bị kẹt trong vật thể (do va chạm hay spawn), tự động tìm hướng thoát ra ngoài.
 * 2. Cho phép nhân vật lướt mượt mà dọc theo cạnh vật cản khi đi chéo.
 */
export function resolveMovement(
  currentX: number,
  currentZ: number,
  moveX: number,
  moveZ: number,
  speed: number,
  radius = PLAYER_RADIUS
): { newX: number; newZ: number; isBlocked: boolean } {
  const desiredX = currentX + moveX * speed
  const desiredZ = currentZ + moveZ * speed

  // CHỐNG KẸT: Nếu đang đứng trong vật thể, ưu tiên bước ra ngoài!
  if (isPointBlocked(currentX, currentZ, radius)) {
    // Nếu điểm đích đưa nhân vật ra khỏi vùng cấm, cho phép đi ngay
    if (!isPointBlocked(desiredX, desiredZ, radius)) {
      return { newX: desiredX, newZ: desiredZ, isBlocked: false }
    }
    // Thử di chuyển theo X
    if (!isPointBlocked(desiredX, currentZ, radius)) {
      return { newX: desiredX, newZ: currentZ, isBlocked: false }
    }
    // Thử di chuyển theo Z
    if (!isPointBlocked(currentX, desiredZ, radius)) {
      return { newX: currentX, newZ: desiredZ, isBlocked: false }
    }

    // Nếu vẫn bị kẹt cả 2 trục, tự động đẩy nhẹ nhân vật về phía tâm đường đi (0, 0)
    const escapeDirX = -Math.sign(currentX) || 1
    const escapeDirZ = currentZ < -40 ? 1 : -1
    return {
      newX: currentX + escapeDirX * speed * 0.8,
      newZ: currentZ + escapeDirZ * speed * 0.8,
      isBlocked: true
    }
  }

  // Trường hợp bình thường: Thử đi thẳng theo cả 2 trục
  if (!isPointBlocked(desiredX, desiredZ, radius)) {
    return { newX: desiredX, newZ: desiredZ, isBlocked: false }
  }

  // Bị chặn! Thử trượt dọc theo trục X
  const canSlideX = !isPointBlocked(desiredX, currentZ, radius)
  // Thử trượt dọc theo trục Z
  const canSlideZ = !isPointBlocked(currentX, desiredZ, radius)

  if (canSlideX && !canSlideZ) {
    return { newX: desiredX, newZ: currentZ, isBlocked: true }
  }
  if (!canSlideX && canSlideZ) {
    return { newX: currentX, newZ: desiredZ, isBlocked: true }
  }
  if (canSlideX && canSlideZ) {
    if (Math.abs(moveX) >= Math.abs(moveZ)) {
      return { newX: desiredX, newZ: currentZ, isBlocked: true }
    } else {
      return { newX: currentX, newZ: desiredZ, isBlocked: true }
    }
  }

  // Cả 2 trục đều kẹt cứng
  return { newX: currentX, newZ: currentZ, isBlocked: true }
}

/**
 * Tính toán độ cao bề mặt tự nhiên (Terrain Ground Height) tại tọa độ (x, z)
 * Khớp 100% với các khối hình học thực tế trong cảnh 3D.
 */
export function getGroundHeight(x: number, z: number, floorY: number): number {
  // 1. Cầu đá vòm vượt hồ cá (X: -79.5 đến -50.5, Z: -4)
  if (Math.abs(z - (-4)) <= 1.95 && x >= -79.5 && x <= -50.5) {
    const bt = (x - (-77.25)) / 24.5
    const clampedBt = Math.max(0, Math.min(1, bt))
    const archElev = Math.sin(clampedBt * Math.PI) * 1.05 + 0.22
    // Bậc ramp thoải ở 2 mố cầu để tiếp đất êm ái
    let ramp = 1
    if (x < -77.25) ramp = Math.max(0, (x - (-79.5)) / 2.25)
    else if (x > -52.75) ramp = Math.max(0, (-50.5 - x) / 2.25)
    return floorY + archElev * ramp
  }

  // 2. Chánh Điện: Thềm đá ngũ cấp và sàn gỗ bên trong
  if (Math.abs(x) <= 28 && z >= -54 && z <= -10.5) {
    return floorY + 0.22
  }
  if (Math.abs(x) <= 28 && z > -10.5 && z <= -6.0) {
    const t = (-6.0 - z) / 4.5
    return floorY + Math.max(0, Math.min(1, t)) * 0.22
  }

  // 3. Lầu Chuông Đại Hồng Chung (48, 28)
  const bellDist = Math.max(Math.abs(x - 48), Math.abs(z - 28))
  if (bellDist <= 4.8) {
    return floorY + 0.68
  }
  if (bellDist <= 6.0) {
    const t = 1 - (bellDist - 4.8) / 1.2
    return floorY + Math.max(0, Math.min(1, t)) * 0.68
  }

  // 4. Vườn Bồ Đề Tâm: Gò đồi đất tròn cỏ xanh (64, -12), cao 0.9m
  const bodhiDist = Math.hypot(x - 64, z - (-12))
  if (bodhiDist <= 13.5) {
    return floorY + 0.9 // Mặt bằng đỉnh gò Bồ Đề, chân bước trên thảm cỏ
  }
  if (bodhiDist <= 15.5) {
    const t = 1 - (bodhiDist - 13.5) / 2.0
    return floorY + Math.max(0, Math.min(1, t)) * 0.9 // Dốc thoai thoải bước lên gò
  }

  // 5. Nhà Tụng Kinh & Thiền Đường (-48, -48)
  if (x >= -56 && x <= -40 && z >= -53 && z <= -43) {
    return floorY + 0.58 // Sàn gỗ lim thiền đường
  }
  if (x >= -51 && x <= -45 && z > -43 && z <= -40.5) {
    const t = (-40.5 - z) / 2.5
    return floorY + Math.max(0, Math.min(1, t)) * 0.58
  }

  // 6. Bến Sông Trăng & Cầu tàu gỗ
  if (z <= -79 && z >= -84.2 && Math.abs(x) <= 16) {
    const t = (-z - 79) / 5.2
    return floorY - t * 0.35 // Bến đá thoải dần xuống mép nước
  }
  if (z < -84.2 && Math.abs(x) <= 2.6) {
    return floorY - 0.75 // Cầu tàu gỗ vươn ra sông
  }

  // 7. Cầu thang đá bám sườn trước núi & sườn dốc trước chùa (Z: 62 đến 96)
  if (z > 62 && z <= 96) {
    const t = (z - 62) / 34
    return floorY + t * (-10 - floorY) // dốc đều từ floorY (18) xuống chân núi (-10)
  }

  // 8. Chân núi & Thềm đá đón phật tử (Z > 96)
  if (z > 96) {
    return -10
  }

  // Mặt sân chùa mặc định (Z <= 62)
  return floorY
}

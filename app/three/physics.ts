/**
 * 3D Physics, Collision & Terrain Elevation System (Open-World Sanctuary)
 * 
 * Quản lý toàn bộ vật lý va chạm, trượt tường (Wall Sliding) và nâng hạ cao độ địa hình tự nhiên:
 * 1. Colliders cho toàn bộ vật thể: Ghế đá, Thạch đăng, Rặng trúc, Cội Bồ Đề, Lầu Chuông,
 *    Vách tường & Ban thờ Chánh Điện, Thiền Đường, Thùng công đức, Biển chỉ dẫn, Mép nước Sông Trăng, Bờ hồ cá.
 * 2. Thuật toán Wall Sliding: Trượt mượt mà dọc theo cạnh vật cản khi đi chéo.
 * 3. Bề mặt địa hình (Terrain Heightfield): Nâng hạ cao độ nhân vật tự nhiên theo bậc tam cấp,
 *    cầu vòm đá, thềm lầu chuông, gò đất bồ đề, bậc bến sông.
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

  // 1. GHẾ ĐÁ THIỀN TỊNH (6 ghế đá dọc các đại lộ)
  // (-42, 23.5) xoay 0 (dài 3.2m theo trục X, rộng 1.1m theo Z)
  list.push({ type: 'box', minX: -43.6, maxX: -40.4, minZ: 22.8, maxZ: 24.2, name: 'Ghế đá Đại Lộ Tây 1' })
  // (-62, 15) xoay 90 độ (dài 3.2m theo trục Z, rộng 1.1m theo X)
  list.push({ type: 'box', minX: -62.6, maxX: -61.4, minZ: 13.4, maxZ: 16.6, name: 'Ghế đá Bến Hồ Cá' })
  // (42, 23.5) xoay 0
  list.push({ type: 'box', minX: 40.4, maxX: 43.6, minZ: 22.8, maxZ: 24.2, name: 'Ghế đá Đại Lộ Đông 1' })
  // (62, 15) xoay -90 độ
  list.push({ type: 'box', minX: 61.4, maxX: 62.6, minZ: 13.4, maxZ: 16.6, name: 'Ghế đá Vườn Bồ Đề' })
  // (-12, -76) xoay 90 độ
  list.push({ type: 'box', minX: -12.6, maxX: -11.4, minZ: -77.6, maxZ: -74.4, name: 'Ghế đá Bến Sông Tây' })
  // (12, -76) xoay -90 độ
  list.push({ type: 'box', minX: 11.4, maxX: 12.6, minZ: -77.6, maxZ: -74.4, name: 'Ghế đá Bến Sông Đông' })

  // 2. HỆ THỐNG THẠCH ĐĂNG CỔ KÍNH (20+ trụ đèn đá dọc đường)
  const lanternRadius = 0.52
  const lanterns = [
    // Đại lộ Tây
    { x: -34, z: 23.5 }, { x: -52, z: 23.5 }, { x: -68, z: 23.5 },
    { x: -69, z: 10 }, { x: -69, z: -4 }, { x: -58, z: 6 }, { x: -58, z: -6 },
    // Đại lộ Đông
    { x: 34, z: 23.5 }, { x: 52, z: 23.5 }, { x: 68, z: 23.5 },
    { x: 69, z: 10 }, { x: 69, z: -6 }, { x: 56, z: 6 }, { x: 56, z: -18 },
    // Lối ra Bến Hoa Đăng
    { x: -36, z: -54 }, { x: 36, z: -54 }, { x: -10, z: -62 }, { x: 10, z: -62 },
    { x: -8, z: -80 }, { x: 8, z: -80 },
    // Trụ đèn đầu bến đá
    { x: -15.2, z: -79.4 }, { x: 15.2, z: -79.4 }
  ]
  lanterns.forEach((l, i) => {
    list.push({ type: 'circle', x: l.x, z: l.z, radius: lanternRadius, name: `Thạch đăng ${i + 1}` })
  })

  // 3. RỪNG TRÚC XANH THIỀN TỊNH (16 rặng trúc xanh)
  const bambooRadius = 1.35
  const bambooGroves = [
    // Lối Tây
    { x: -36, z: 26 }, { x: -48, z: 26 }, { x: -60, z: 26 },
    { x: -72, z: 12 }, { x: -72, z: -6 }, { x: -52, z: -16 },
    // Lối Đông
    { x: 36, z: 26 }, { x: 48, z: 28 }, { x: 60, z: 26 },
    { x: 72, z: 12 }, { x: 72, z: -6 }, { x: 52, z: -16 },
    // Lối Bắc
    { x: -16, z: -68 }, { x: 16, z: -68 }, { x: -24, z: -80 }, { x: 24, z: -80 }
  ]
  bambooGroves.forEach((b, i) => {
    list.push({ type: 'circle', x: b.x, z: b.z, radius: bambooRadius, name: `Rặng trúc ${i + 1}` })
  })

  // 4. BIỂN CHỈ DẪN THIỀN MÔN (5 biển chỉ dẫn gỗ)
  const signposts = [
    { x: -26, z: 17 }, { x: 26, z: 17 }, { x: 0, z: -55 },
    { x: -62, z: 12 }, { x: 62, z: 12 }
  ]
  signposts.forEach((s, i) => {
    list.push({ type: 'circle', x: s.x, z: s.z, radius: 0.55, name: `Biển chỉ dẫn ${i + 1}` })
  })

  // 5. CÁC VẬT PHẨM SÂN CHÙA ĐẠI LỄ
  // Thùng công đức
  list.push({ type: 'box', minX: 13.0, maxX: 15.0, minZ: 33.2, maxZ: 34.8, name: 'Thùng công đức' })
  // Trống gỗ & Giá chuông sân chùa
  list.push({ type: 'circle', x: -24, z: 14, radius: 1.1, name: 'Giá đại hồng chung sân chùa' })
  list.push({ type: 'circle', x: 24, z: 14, radius: 1.1, name: 'Trống gỗ sân chùa' })

  // 6. ĐẠI ĐIỆN TAM BẢO (CHÁNH ĐIỆN)
  // Vách tường sau Chánh Điện (Z = -54)
  list.push({ type: 'box', minX: -28.5, maxX: 28.5, minZ: -54.8, maxZ: -53.2, name: 'Vách sau Chánh Điện' })
  // Vách tường Tây Chánh Điện (X = -28)
  list.push({ type: 'box', minX: -28.8, maxX: -27.2, minZ: -54.0, maxZ: -9.5, name: 'Vách Tây Chánh Điện' })
  // Vách tường Đông Chánh Điện (X = 28)
  list.push({ type: 'box', minX: 27.2, maxX: 28.8, minZ: -54.0, maxZ: -9.5, name: 'Vách Đông Chánh Điện' })
  // Mặt tiền Chánh Điện (2 góc 2 bên cửa đại môn mở rộng 22m ở giữa)
  list.push({ type: 'box', minX: -28.5, maxX: -11.5, minZ: -10.8, maxZ: -9.2, name: 'Mặt tiền Tây Chánh Điện' })
  list.push({ type: 'box', minX: 11.5, maxX: 28.5, minZ: -10.8, maxZ: -9.2, name: 'Mặt tiền Đông Chánh Điện' })
  // Ban Tam Thế & Bệ 3 pho tượng Phật (không cho trèo lên bàn thờ)
  list.push({ type: 'box', minX: -23.0, maxX: 23.0, minZ: -54.0, maxZ: -46.5, name: 'Ban Tam Thế' })
  // Hương án (Bàn thờ chính đặt lư trầm & đèn dầu)
  list.push({ type: 'box', minX: -9.5, maxX: 9.5, minZ: -42.8, maxZ: -39.2, name: 'Hương án Chánh Điện' })
  // Pháp tòa tụng kinh
  list.push({ type: 'box', minX: 17.2, maxX: 22.8, minZ: -28.5, maxZ: -23.5, name: 'Pháp tòa tụng kinh' })
  // Bàn ống xăm
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

  // 7. LẦU CHUÔNG ĐẠI HỒNG CHUNG (Tọa độ tâm: 48, 28)
  // 4 Đại trụ gỗ lim khổng lồ
  const bellCols = [
    { x: 44.2, z: 24.2 }, { x: 51.8, z: 24.2 },
    { x: 44.2, z: 31.8 }, { x: 51.8, z: 31.8 }
  ]
  bellCols.forEach((c, i) => {
    list.push({ type: 'circle', x: c.x, z: c.z, radius: 0.48, name: `Cột Lầu Chuông ${i + 1}` })
  })
  // Quả Đại Hồng Chung & Giá đỡ ở trung tâm
  list.push({ type: 'circle', x: 48.0, z: 28.0, radius: 1.6, name: 'Quả Đại Hồng Chung' })

  // 8. VƯỜN BỒ ĐỀ TÂM (Tọa độ tâm: 64, -12)
  // Thân cây Bồ Đề cổ thụ (gốc xù xì đại thụ)
  list.push({ type: 'circle', x: 64.0, z: -12.0, radius: 2.3, name: 'Cội Bồ Đề cổ thụ' })
  // Bàn đá dải lụa nguyện ước
  list.push({ type: 'box', minX: 58.2, maxX: 61.4, minZ: -16.2, maxZ: -14.2, name: 'Bàn đá nguyện ước' })
  // Giếng ngọc đá múc nước
  list.push({ type: 'circle', x: 68.2, z: -15.5, radius: 1.15, name: 'Giếng ngọc Bồ Đề' })

  // 9. NHÀ TỤNG KINH & THIỀN ĐƯỜNG TỊNH ĐỘ (Tọa độ: X: -48, Z: -48)
  // Vách Bắc (sau lưng tượng Phật)
  list.push({ type: 'box', minX: -56.5, maxX: -39.5, minZ: -53.8, maxZ: -52.2, name: 'Vách Bắc Thiền Đường' })
  // Vách Tây
  list.push({ type: 'box', minX: -56.5, maxX: -54.5, minZ: -53.0, maxZ: -42.5, name: 'Vách Tây Thiền Đường' })
  // Vách Đông
  list.push({ type: 'box', minX: -41.5, maxX: -39.5, minZ: -53.0, maxZ: -42.5, name: 'Vách Đông Thiền Đường' })
  // Mặt trước (2 góc 2 bên cửa)
  list.push({ type: 'box', minX: -56.5, maxX: -51.5, minZ: -43.8, maxZ: -42.2, name: 'Mặt trước Tây Thiền Đường' })
  list.push({ type: 'box', minX: -44.5, maxX: -39.5, minZ: -43.8, maxZ: -42.2, name: 'Mặt trước Đông Thiền Đường' })
  // Bàn thờ Phật Thích Ca & Bàn kinh mõ gỗ
  list.push({ type: 'box', minX: -50.8, maxX: -45.2, minZ: -52.5, maxZ: -47.2, name: 'Ban thờ Thiền Đường' })

  // 10. CỔNG TAM QUAN (Tọa độ: Z: 56)
  // Vách đá 2 bên cổng chính
  list.push({ type: 'box', minX: -18.0, maxX: -7.0, minZ: 55.4, maxZ: 56.6, name: 'Tường cổng Tây' })
  list.push({ type: 'box', minX: 7.0, maxX: 18.0, minZ: 55.4, maxZ: 56.6, name: 'Tường cổng Đông' })
  // Cột đá Tam Quan
  list.push({ type: 'circle', x: -5.5, z: 56.0, radius: 0.6, name: 'Cột Cổng Tam Quan Tây' })
  list.push({ type: 'circle', x: 5.5, z: 56.0, radius: 0.6, name: 'Cột Cổng Tam Quan Đông' })

  // 11. ĐÀI SEN ĐÁ PHUN NƯỚC GIỮA HỒ CÁ
  list.push({ type: 'circle', x: -65.0, z: -4.0, radius: 1.5, name: 'Đài sen giữa hồ' })

  // 12. CÁC TẢNG ĐÁ NÚI VEN BIÊN BẢN ĐỒ
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2
    const dist = 88 + (i % 3) * 6
    const rx = Math.cos(angle) * dist
    const rz = Math.sin(angle) * dist - 16
    list.push({ type: 'circle', x: rx, z: rz, radius: 3.5, name: `Vách đá biên ${i + 1}` })
  }

  return list
}

const WORLD_COLLIDERS = createWorldColliders()

/**
 * Kiểm tra xem điểm (x, z) với bán kính `radius` có bị chặn bởi vật thể nào không
 */
export function isPointBlocked(x: number, z: number, radius = PLAYER_RADIUS): boolean {
  // 1. Kiểm tra biên giới hạn thế giới
  if (x < -86 + radius || x > 86 - radius || z < -92 + radius || z > 60 - radius) {
    return true
  }

  // 2. Va chạm mặt nước Hồ Sen: chỉ được đi trên cầu đá vòm
  const pRelX = (x - (-65)) / 13.5
  const pRelZ = (z - (-4)) / 8.8
  const inPondWater = (pRelX * pRelX + pRelZ * pRelZ) < 1.0
  const onBridge = Math.abs(z - (-4)) <= 2.2 && x >= -77.5 && x <= -52.5
  if (inPondWater && !onBridge) {
    return true
  }

  // 3. Va chạm mặt nước Sông Trăng:
  // Nước sông bắt đầu tại Z < -84.2. Chỉ được đi trên cầu tàu gỗ: X trong [-2.6, 2.6] và Z trong [-88.0, -84.0]
  if (z < -84.2) {
    const onWharfPier = Math.abs(x) <= 2.6 && z >= -88.0
    if (!onWharfPier) {
      return true // Ngăn không cho bước chân xuống nước sông
    }
    // Chặn mép đầu cầu tàu ở -88.0
    if (z < -88.0 + radius) {
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
 * Thuật toán Trượt Tường (Wall Sliding Physics):
 * Cho phép nhân vật lướt mượt mà dọc theo cạnh vật cản khi đi chéo
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

  // Thử đi thẳng theo cả 2 trục
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
    // Nếu cả 2 trục đều trượt được riêng lẻ, ưu tiên trục có thành phần di chuyển lớn hơn
    if (Math.abs(moveX) >= Math.abs(moveZ)) {
      return { newX: desiredX, newZ: currentZ, isBlocked: true }
    } else {
      return { newX: currentX, newZ: desiredZ, isBlocked: true }
    }
  }

  // Cả 2 trục đều kẹt cứng (ví dụ đâm trực diện vào góc tường)
  return { newX: currentX, newZ: currentZ, isBlocked: true }
}

/**
 * Tính toán độ cao bề mặt tự nhiên (Terrain Ground Height) tại tọa độ (x, z)
 * Giúp chân nhân vật tự động bước lên bậc thềm, cầu vòm, gò bồ đề mượt mà.
 */
export function getGroundHeight(x: number, z: number, floorY: number): number {
  // 1. Cầu đá vòm vượt hồ cá
  const onBridge = Math.abs(z - (-4)) <= 2.2 && x >= -77.25 && x <= -52.75
  if (onBridge) {
    const bt = (x - (-77.25)) / 24.5
    const archElev = Math.sin(Math.max(0, Math.min(1, bt)) * Math.PI) * 1.05 + 0.22
    return floorY + archElev
  }

  // 2. Chánh Điện: Thềm đá ngũ cấp và sàn gỗ bên trong
  // Trong lòng đại điện
  if (Math.abs(x) <= 28 && z >= -54 && z <= -10.5) {
    return floorY + 0.22
  }
  // Bậc tam cấp phía trước Chánh Điện
  if (Math.abs(x) <= 28 && z > -10.5 && z <= -6.0) {
    const t = (-6.0 - z) / 4.5 // 0 -> 1
    return floorY + Math.max(0, Math.min(1, t)) * 0.22
  }

  // 3. Lầu Chuông Đại Hồng Chung (48, 28)
  const bellDist = Math.max(Math.abs(x - 48), Math.abs(z - 28))
  if (bellDist <= 4.8) {
    return floorY + 0.68 // Sàn gỗ lim tầng 1
  }
  if (bellDist <= 6.0) {
    const t = 1 - (bellDist - 4.8) / 1.2
    return floorY + Math.max(0, Math.min(1, t)) * 0.68
  }

  // 4. Vườn Bồ Đề Tâm: Gò đất tròn thoai thoải (64, -12)
  const bodhiDist = Math.hypot(x - 64, z - (-12))
  if (bodhiDist < 18.0) {
    const t = Math.max(0, 1 - bodhiDist / 18.0)
    const moundElev = Math.pow(t, 1.4) * 0.75
    return floorY + moundElev
  }

  // 5. Nhà Tụng Kinh & Thiền Đường (-48, -48)
  if (x >= -56 && x <= -40 && z >= -53 && z <= -43) {
    return floorY + 0.58 // Sàn gỗ lim thiền đường
  }
  // Bậc tam cấp trước cửa thiền đường
  if (x >= -51 && x <= -45 && z > -43 && z <= -40.5) {
    const t = (-40.5 - z) / 2.5
    return floorY + Math.max(0, Math.min(1, t)) * 0.58
  }

  // 6. Bến Sông Trăng & Cầu tàu gỗ
  if (z <= -80 && z >= -84.2 && Math.abs(x) <= 16) {
    const t = (-z - 80) / 4.2
    return floorY - t * 0.35 // Bến đá thoải dần xuống sông
  }
  if (z < -84.2 && Math.abs(x) <= 2.6) {
    return floorY - 0.75 // Cầu tàu gỗ vươn ra sông
  }

  // Mặt sân chùa mặc định
  return floorY
}


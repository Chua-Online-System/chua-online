import * as THREE from 'three'

/**
 * HỆ THỐNG PHÁP PHỤC & PHỤ KIỆN 3D - PHÁP Y CÁC (PHASE 4)
 * - 5 Bộ Pháp Phục: Áo Lam Cư Sĩ, Áo Nâu Sồng, Áo Tràng Chỉ Vàng, Bạch Y Tuyết Liên, Pháp Y Cà Sa Gấm Vàng
 * - 2 Phụ Kiện: Chuỗi Tràng Hạt Bồ Đề 108 Hạt, Nón Lá Trúc Thiền Môn
 * - Hỗ trợ cập nhật tức thời trên mô hình 3D (setOutfit) không cần tải lại thế giới
 */

export type OutfitType = 'robe' | 'accessory'

export interface OutfitItem {
  id: string
  name: string
  type: OutfitType
  cost: number
  colorHex: string
  robeColor: number
  skirtColor?: number
  sashColor: number
  sashMetalness?: number
  sashRoughness?: number
  badge: string
  tagline: string
  description: string
  spiritualMeaning: string
  features: string[]
}

export const OUTFITS_CATALOG: OutfitItem[] = [
  {
    id: 'robe_lam',
    name: 'Áo Lam Cư Sĩ',
    type: 'robe',
    cost: 0,
    colorHex: '#5f6f82',
    robeColor: 0x5f6f82,
    sashColor: 0xd9b24a,
    sashMetalness: 0.2,
    sashRoughness: 0.6,
    badge: '👘',
    tagline: 'Pháp phục cư sĩ mộc mạc',
    description: 'Vải lam xám mộc mạc, vạt áo thanh nhã của người con Phật tại gia giữ gìn năm giới.',
    spiritualMeaning: 'Biểu trưng cho sự khiêm nhường, bình đẳng và hòa hợp thanh tịnh nơi chốn già lam.',
    features: ['Vải thô lam xám trang nhã', 'Vạt áo thiền môn rộng rãi', 'Đai thắt lưng màu vàng đất']
  },
  {
    id: 'robe_nau',
    name: 'Áo Nâu Sồng Thiền Tịnh',
    type: 'robe',
    cost: 120,
    colorHex: '#5c3d28',
    robeColor: 0x5c3d28,
    skirtColor: 0x472d1d,
    sashColor: 0x82593b,
    sashMetalness: 0.15,
    sashRoughness: 0.8,
    badge: '🧘',
    tagline: 'Màu nâu của đất mẹ nhẫn nhục',
    description: 'Màu nâu sồng đất ấm, tượng trưng cho tinh thần cần cù, nhẫn nhục và giản dị của người tu sĩ chân tu.',
    spiritualMeaning: 'Nhẫn nhục như đất mẹ, chở che nuôi lớn muôn loài mà không hề phân biệt hay than phiền.',
    features: ['Vải thô nhuộm màu vỏ cây', 'Đai thắt lưng gỗ đồng ấm', 'Tôn vinh tinh thần nhẫn nại']
  },
  {
    id: 'robe_chivang',
    name: 'Áo Tràng Lam Viền Chỉ Vàng',
    type: 'robe',
    cost: 300,
    colorHex: '#32445a',
    robeColor: 0x32445a,
    skirtColor: 0x243345,
    sashColor: 0xf5c33b,
    sashMetalness: 0.45,
    sashRoughness: 0.35,
    badge: '✨',
    tagline: 'Lam trầm viền kim tuyến uy nghiêm',
    description: 'Vải lam đậm trang nghiêm, viền cổ và vạt áo thêu họa tiết chỉ vàng óng ánh tỏa rạng chốn đạo tràng.',
    spiritualMeaning: 'Ánh đạo vàng soi rọi tâm tư u tối, chuyển hóa những hạt giống phiền não thành bồ đề quang minh.',
    features: ['Vải gấm lam sẫm cao cấp', 'Viền chỉ vàng lấp lánh quanh cổ & tay áo', 'Đai ngọc thắt lưng mạ vàng']
  },
  {
    id: 'robe_bach_y',
    name: 'Bạch Y Tuyết Liên',
    type: 'robe',
    cost: 600,
    colorHex: '#f2f5f7',
    robeColor: 0xf0f4f8,
    skirtColor: 0xe2e8f0,
    sashColor: 0xcfd8dc,
    sashMetalness: 0.25,
    sashRoughness: 0.5,
    badge: '🌸',
    tagline: 'Trắng tinh khôi tựa hoa sen tuyết',
    description: 'Bộ bạch y trắng muốt thoát tục, vạt áo phiêu bồng tựa cánh sen tuyết nở ngát hương nơi chốn tịnh thổ.',
    spiritualMeaning: 'Gần bùn mà chẳng hôi tanh mùi bùn, tâm hồn sáng trong không vướng bụi trần thế gian.',
    features: ['Lụa tuyết trắng tinh khiết', 'Vạt áo thanh thoát phiêu diêu', 'Đai thắt lưng ánh bạc ngọc']
  },
  {
    id: 'robe_ca_sa',
    name: 'Pháp Y Cà Sa Gấm Vàng',
    type: 'robe',
    cost: 1200,
    colorHex: '#d49924',
    robeColor: 0x8a2f18, // Thân áo hoại sắc thiền môn
    skirtColor: 0x6e2412,
    sashColor: 0xfcb024,
    sashMetalness: 0.5,
    sashRoughness: 0.3,
    badge: '☸️',
    tagline: 'Pháp bảo giải thoát Điền Tướng Y',
    description: 'Khoác dải áo cà sa gấm vàng hổ phách vắt chéo qua vai, điểm xuyết chốt cài pháp luân uy nghiêm cao quý.',
    spiritualMeaning: 'Chiếc áo ruộng phước (Điền Tướng Y) gieo duyên lành giải thoát, nuôi lớn hạt giống từ bi vô lượng.',
    features: ['Dải áo Cà Sa vàng hổ phách khoác chéo vai', 'Chốt cài Pháp Luân kim bảo', 'Thân áo màu hoại sắc thiền môn']
  },
  {
    id: 'acc_trang_hat',
    name: 'Chuỗi Tràng Hạt Bồ Đề 108 Hạt',
    type: 'accessory',
    cost: 200,
    colorHex: '#4a2f18',
    robeColor: 0,
    sashColor: 0,
    badge: '📿',
    tagline: 'Định tâm niệm Phật từng sát na',
    description: 'Chuỗi hạt bồ đề màu gỗ mun quấn quanh cổ và buông nhẹ trước ngực, giúp hành giả giữ vững chánh niệm.',
    spiritualMeaning: '108 hạt tiêu trừ 108 phiền não thế tục, hướng tâm an định trong từng hơi thở và bước chân.',
    features: ['108 hạt gỗ bồ đề già bóng bẩy', 'Hạt hồ lô & tua chỉ chánh niệm đỏ thắm', 'Vắt tự nhiên quanh cổ nhân vật']
  },
  {
    id: 'acc_non_la',
    name: 'Nón Lá Trúc Thiền Môn',
    type: 'accessory',
    cost: 150,
    colorHex: '#e6cf95',
    robeColor: 0,
    sashColor: 0,
    badge: '🌾',
    tagline: 'Hồn quê che chở nắng sớm thiền hành',
    description: 'Chiếc nón lá nứa trúc chuốt thanh thoát đội nhẹ trên đầu nhân vật che nắng sương sớm khi viếng cảnh chùa.',
    spiritualMeaning: 'Mộc mạc hồn quê xứ sở, che chở hạt mầm bồ đề thanh tịnh trước bão giông cuộc đời.',
    features: ['Lá cọ non chuốt bóng', 'Chóp nón thanh mảnh trang nhã', 'Quai nón lụa nhẹ buông']
  }
]

export function getOutfitById(id: string): OutfitItem | undefined {
  return OUTFITS_CATALOG.find((o) => o.id === id)
}

export interface AvatarControllerResult {
  group: THREE.Group
  legL: THREE.Group
  legR: THREE.Group
  setOutfit: (outfitId: string | number, accessories?: string[]) => void
  getCurrentOutfit: () => string
  getActiveAccessories: () => string[]
}

/**
 * Xây dựng mô hình nhân vật 3D hỗ trợ thay đổi Pháp phục và Phụ kiện tức thì
 */
export function buildCustomAvatar(
  initialOutfit: string | number = 'robe_lam',
  initialAccessories: string[] = []
): AvatarControllerResult {
  const g = new THREE.Group()
  g.name = 'PilgrimAvatarRoot'

  let currentOutfitId = typeof initialOutfit === 'string' ? initialOutfit : 'robe_lam'
  let customNumericColor: number | null = typeof initialOutfit === 'number' ? initialOutfit : null
  let currentAccessories = [...initialAccessories]

  const outfitDef = getOutfitById(currentOutfitId) || OUTFITS_CATALOG[0]
  const initialRobeColor = customNumericColor !== null ? customNumericColor : outfitDef.robeColor

  // 1. VẬT LIỆU CHÍNH (Dynamic Materials)
  const robeMat = new THREE.MeshStandardMaterial({
    color: initialRobeColor,
    roughness: 0.85
  })

  const skirtMat = new THREE.MeshStandardMaterial({
    color: outfitDef.skirtColor ?? new THREE.Color(outfitDef.robeColor).multiplyScalar(0.82).getHex(),
    roughness: 0.85
  })

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe8c39e,
    roughness: 0.7
  })

  const sashMat = new THREE.MeshStandardMaterial({
    color: outfitDef.sashColor,
    roughness: outfitDef.sashRoughness ?? 0.6,
    metalness: outfitDef.sashMetalness ?? 0.2
  })

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x3a3330,
    roughness: 1
  })

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x241f1b,
    roughness: 1
  })

  // 2. KHỐI CƠ THỂ
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.62, 1.5, 16), robeMat)
  body.position.y = 1.2
  body.castShadow = true

  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.7, 16), skirtMat)
  skirt.position.y = 0.75

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 12), robeMat)
  shoulders.scale.set(1, 0.55, 0.75)
  shoulders.position.y = 1.9

  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.06), sashMat)
  sash.position.set(0, 1.45, 0.4)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 16), skinMat)
  head.position.y = 2.32
  head.scale.y = 1.08

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.33, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  )
  hair.position.y = 2.4

  const hands = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skinMat)
  hands.scale.set(0.9, 1.3, 0.7)
  hands.position.set(0, 1.55, 0.42)

  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8), robeMat)
    arm.position.set(s * 0.28, 1.5, 0.28)
    arm.rotation.z = s * 0.4
    arm.rotation.x = -0.9
    g.add(arm)
  }

  const mkLeg = (sx: number) => {
    const p = new THREE.Group()
    p.position.set(sx, 0.78, 0)
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.78, 8), legMat)
    l.position.y = -0.39
    l.castShadow = true
    p.add(l)
    return p
  }
  const legL = mkLeg(-0.17)
  const legR = mkLeg(0.17)

  g.add(body, skirt, shoulders, sash, head, hair, hands, legL, legR)

  // 3. VIỀN CHỈ VÀNG (Dành cho Áo Chỉ Vàng & Cà Sa)
  const goldTrimGroup = new THREE.Group()
  goldTrimGroup.name = 'GoldTrimGroup'
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf5c33b,
    metalness: 0.5,
    roughness: 0.3
  })
  const collarTrim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 8, 24), goldTrimMat)
  collarTrim.rotation.x = Math.PI / 2
  collarTrim.position.set(0, 1.95, 0)
  goldTrimGroup.add(collarTrim)
  g.add(goldTrimGroup)

  // 4. DẢI ÁO CÀ SA GẤM VÀNG CHÉO VAI (robe_ca_sa)
  const kasayaGroup = new THREE.Group()
  kasayaGroup.name = 'KasayaSashGroup'
  const kasayaMat = new THREE.MeshStandardMaterial({
    color: 0xfcb024,
    metalness: 0.45,
    roughness: 0.35
  })
  // Dải chéo trước ngực (từ vai trái qua eo phải)
  const kasayaFront = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.25, 0.08), kasayaMat)
  kasayaFront.position.set(0.04, 1.52, 0.32)
  kasayaFront.rotation.z = -0.52
  // Dải chéo sau lưng
  const kasayaBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.25, 0.08), kasayaMat)
  kasayaBack.position.set(0.04, 1.52, -0.32)
  kasayaBack.rotation.z = 0.52
  // Chốt cài Cà Sa mạ vàng trước vai trái
  const broochMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    metalness: 0.65,
    roughness: 0.2
  })
  const brooch = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 20), broochMat)
  brooch.position.set(-0.2, 1.82, 0.36)
  kasayaGroup.add(kasayaFront, kasayaBack, brooch)
  g.add(kasayaGroup)

  // 5. CHUỖI TRÀNG HẠT BỒ ĐỀ 108 HẠT (acc_trang_hat)
  const beadsGroup = new THREE.Group()
  beadsGroup.name = 'PrayerBeadsGroup'
  const beadWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.8
  })
  const necklaceRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.024, 8, 28), beadWoodMat)
  necklaceRing.position.set(0, 1.88, 0.2)
  necklaceRing.rotation.x = -0.42
  // Hạt hồ lô & tua chỉ đỏ
  const guruBead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), beadWoodMat)
  guruBead.position.set(0, 1.7, 0.39)
  const tasselMat = new THREE.MeshStandardMaterial({
    color: 0xb71c1c,
    roughness: 0.7
  })
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.024, 0.12, 6), tasselMat)
  tassel.position.set(0, 1.62, 0.4)
  beadsGroup.add(necklaceRing, guruBead, tassel)
  g.add(beadsGroup)

  // 6. NÓN LÁ TRÚC THIỀN MÔN (acc_non_la)
  const hatGroup = new THREE.Group()
  hatGroup.name = 'ConicalHatGroup'
  const hatMat = new THREE.MeshStandardMaterial({
    color: 0xe5cf94,
    roughness: 0.9,
    side: THREE.DoubleSide
  })
  const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.22, 32, 1, true), hatMat)
  hatCone.position.set(0, 2.66, -0.02)
  hatCone.rotation.x = 0.08
  // Đỉnh chóp nón
  const hatTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), hatMat)
  hatTip.position.set(0, 2.78, 0)
  // Quai nón lá màu lam ngọc
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x80cbc4,
    roughness: 0.6
  })
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.008, 4, 16), strapMat)
  strap.position.set(0, 2.3, 0.04)
  strap.rotation.x = Math.PI / 2
  hatGroup.add(hatCone, hatTip, strap)
  g.add(hatGroup)

  // Cập nhật hiển thị theo bộ trang phục & phụ kiện
  function applyAppearance() {
    if (customNumericColor !== null) {
      robeMat.color.setHex(customNumericColor)
      skirtMat.color.setHex(new THREE.Color(customNumericColor).multiplyScalar(0.82).getHex())
      sashMat.color.setHex(0xd9b24a)
      sashMat.metalness = 0.2
      sashMat.roughness = 0.6
      goldTrimGroup.visible = false
      kasayaGroup.visible = false
      beadsGroup.visible = currentAccessories.includes('acc_trang_hat')
      hatGroup.visible = currentAccessories.includes('acc_non_la')
      return
    }

    const def = getOutfitById(currentOutfitId) || OUTFITS_CATALOG[0]

    // Cập nhật màu vải áo
    robeMat.color.setHex(def.robeColor)
    const skirtCol = def.skirtColor ?? new THREE.Color(def.robeColor).multiplyScalar(0.82).getHex()
    skirtMat.color.setHex(skirtCol)

    // Cập nhật đai thắt lưng
    sashMat.color.setHex(def.sashColor)
    sashMat.metalness = def.sashMetalness ?? 0.2
    sashMat.roughness = def.sashRoughness ?? 0.6

    // Viền chỉ vàng
    goldTrimGroup.visible = currentOutfitId === 'robe_chivang' || currentOutfitId === 'robe_ca_sa'

    // Dải cà sa
    kasayaGroup.visible = currentOutfitId === 'robe_ca_sa'

    // Phụ kiện
    beadsGroup.visible = currentAccessories.includes('acc_trang_hat')
    hatGroup.visible = currentAccessories.includes('acc_non_la')
  }

  applyAppearance()

  function setOutfit(outfitId: string | number, accessories?: string[]) {
    if (typeof outfitId === 'number') {
      customNumericColor = outfitId
      currentOutfitId = 'custom'
    } else {
      customNumericColor = null
      currentOutfitId = outfitId
    }
    if (accessories !== undefined) {
      currentAccessories = [...accessories]
    }
    applyAppearance()
  }

  return {
    group: g,
    legL,
    legR,
    setOutfit,
    getCurrentOutfit: () => currentOutfitId,
    getActiveAccessories: () => currentAccessories
  }
}

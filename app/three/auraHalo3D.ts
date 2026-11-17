import * as THREE from 'three'

/**
 * HỆ THỐNG HÀO QUANG 3D THEO 5 CẤP BẬC CÔNG ĐỨC (PHASE 3)
 * - Cấp 1: Sơ Tâm Thiện Lành (Không hào quang)
 * - Cấp 2: Tinh Tấn Tu Tập (Vòng hào quang bạc ấm sau gáy)
 * - Cấp 3: Bồ Đề Tâm Khởi (Hào quang vàng kim 2 tầng & 8 hạt bụi sáng bay lượn)
 * - Cấp 4: Thanh Tịnh Quang Minh (Luân xa Đài Sen 12 cánh xoay 3D & vòng sáng dưới chân)
 * - Cấp 5: Đại Trí Viên Mãn (Hào quang Thất Sắc Quang Minh đổi màu cầu vồng & sen nở từng bước chân)
 */

export interface AuraController {
  group: THREE.Group
  update: (dt: number, walkAmt: number, avatarWorldPos: THREE.Vector3) => void
  setTier: (tier: number, showAura?: boolean) => void
  setShowAura: (show: boolean) => void
  dispose: () => void
}

interface FootstepLotus {
  mesh: THREE.Group
  age: number
  maxAge: number
}

export function createAuraHalo(
  initialTier: number = 1,
  initialShowAura: boolean = true,
  parentScene?: THREE.Scene
): AuraController {
  const rootGroup = new THREE.Group()
  rootGroup.name = 'AvatarAuraRoot'

  let currentTier = initialTier
  let isVisible = initialShowAura

  // Thời gian trôi (giây) cho animation
  let elapsed = 0

  // 1. TẦNG CẤP 2: VÒNG HÀO QUANG BẠC ẤM
  const tier2Group = new THREE.Group()
  const silverHaloMat = new THREE.MeshBasicMaterial({
    color: 0xf0f4f8,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const silverRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 36), silverHaloMat)
  silverRing.position.set(0, 2.32, -0.16)
  tier2Group.add(silverRing)

  // 2. TẦNG CẤP 3: HÀO QUANG VÀNG KIM & 8 HẠT BỤI SÁNG
  const tier3Group = new THREE.Group()
  const goldInnerMat = new THREE.MeshBasicMaterial({
    color: 0xffd54f,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const goldOuterMat = new THREE.MeshBasicMaterial({
    color: 0xfff176,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const goldRingInner = new THREE.Mesh(new THREE.RingGeometry(0.30, 0.44, 36), goldInnerMat)
  const goldRingOuter = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.54, 36), goldOuterMat)
  goldRingInner.position.set(0, 2.32, -0.16)
  goldRingOuter.position.set(0, 2.32, -0.165)
  tier3Group.add(goldRingInner, goldRingOuter)

  // 8 hạt bụi sáng bay quanh đầu
  const sparkles: THREE.Mesh[] = []
  const sparkleGeo = new THREE.SphereGeometry(0.025, 8, 8)
  const sparkleMat = new THREE.MeshBasicMaterial({
    color: 0xfff9c4,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  })
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Mesh(sparkleGeo, sparkleMat)
    tier3Group.add(sp)
    sparkles.push(sp)
  }

  // 3. TẦNG CẤP 4: LUÂN XA ĐÀI SEN 12 CÁNH XOAY 3D & VÒNG SÁNG DƯỚI CHÂN
  const tier4Group = new THREE.Group()
  const lotusWheel = new THREE.Group()
  lotusWheel.position.set(0, 2.32, -0.17)

  // Tâm đài sen phát quang
  const wheelCenterMat = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  lotusWheel.add(new THREE.Mesh(new THREE.RingGeometry(0.24, 0.35, 36), wheelCenterMat))

  // 12 cánh sen quanh vành bánh xe pháp luân
  const petalMat = new THREE.MeshBasicMaterial({
    color: 0x81d4fa,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), petalMat)
    petal.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, 0)
    petal.rotation.z = angle - Math.PI / 2
    lotusWheel.add(petal)
  }
  tier4Group.add(lotusWheel)

  // Vòng hào quang phát sáng dưới mặt đất quanh chân
  const groundHaloMat = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const groundHalo = new THREE.Mesh(new THREE.RingGeometry(0.65, 1.15, 36), groundHaloMat)
  groundHalo.rotation.x = -Math.PI / 2
  groundHalo.position.set(0, 0.04, 0)
  tier4Group.add(groundHalo)

  // 4. TẦNG CẤP 5: THẤT SẮC QUANG MINH (RAINBOW CELESTIAL AURA)
  const tier5Group = new THREE.Group()
  const rainbowWheel1 = new THREE.Group()
  const rainbowWheel2 = new THREE.Group()
  rainbowWheel1.position.set(0, 2.32, -0.17)
  rainbowWheel2.position.set(0, 2.32, -0.175)

  const rainbowMat1 = new THREE.MeshBasicMaterial({
    color: 0xff4081,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const rainbowMat2 = new THREE.MeshBasicMaterial({
    color: 0x7c4dff,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false
  })

  rainbowWheel1.add(new THREE.Mesh(new THREE.RingGeometry(0.28, 0.46, 36), rainbowMat1))
  rainbowWheel2.add(new THREE.Mesh(new THREE.RingGeometry(0.50, 0.64, 36), rainbowMat2))

  // 16 cánh sen thất sắc lớn
  const rainbowPetalMat = new THREE.MeshBasicMaterial({
    color: 0xffeb3b,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const p = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5), rainbowPetalMat)
    p.position.set(Math.cos(a) * 0.58, Math.sin(a) * 0.58, 0)
    p.rotation.z = a - Math.PI / 2
    rainbowWheel1.add(p)
  }

  // 12 hạt tinh tú quay quỹ đạo đa chiều
  const stars: THREE.Mesh[] = []
  const starGeo = new THREE.SphereGeometry(0.028, 8, 8)
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  })
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(starGeo, starMat)
    tier5Group.add(s)
    stars.push(s)
  }

  // Vòng sáng ngũ sắc dưới chân
  const rainbowGroundMat = new THREE.MeshBasicMaterial({
    color: 0xba68c8,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const rainbowGround = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.35, 36), rainbowGroundMat)
  rainbowGround.rotation.x = -Math.PI / 2
  rainbowGround.position.set(0, 0.04, 0)
  tier5Group.add(rainbowGround)

  tier5Group.add(rainbowWheel1, rainbowWheel2)

  // Thêm tất cả vào root group
  rootGroup.add(tier2Group, tier3Group, tier4Group, tier5Group)

  // Quản lý hạt dấu chân hoa sen Cấp 5
  const footsteps: FootstepLotus[] = []
  let footstepTimer = 0
  const footstepSceneGroup = new THREE.Group()
  footstepSceneGroup.name = 'LotusFootstepsGroup'
  if (parentScene) {
    parentScene.add(footstepSceneGroup)
  }

  function spawnLotusFootstep(worldPos: THREE.Vector3) {
    const g = new THREE.Group()
    const color = new THREE.Color().setHSL((elapsed * 0.2) % 1, 0.85, 0.6)
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const center = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.22, 16), mat)
    center.rotation.x = -Math.PI / 2
    g.add(center)

    // 8 cánh sen nhỏ
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const pet = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 4), mat)
      pet.position.set(Math.cos(a) * 0.25, 0.01, Math.sin(a) * 0.25)
      pet.rotation.x = -Math.PI / 2
      pet.rotation.z = -a + Math.PI / 2
      g.add(pet)
    }

    g.position.set(worldPos.x, worldPos.y + 0.03, worldPos.z)
    g.scale.set(0.6, 0.6, 0.6)
    footstepSceneGroup.add(g)

    footsteps.push({
      mesh: g,
      age: 0,
      maxAge: 1.6
    })

    // Giữ tối đa 12 dấu chân
    if (footsteps.length > 12) {
      const old = footsteps.shift()
      if (old) {
        footstepSceneGroup.remove(old.mesh)
      }
    }
  }

  function applyVisibility() {
    tier2Group.visible = false
    tier3Group.visible = false
    tier4Group.visible = false
    tier5Group.visible = false

    if (!isVisible || currentTier <= 1) return

    if (currentTier === 2) tier2Group.visible = true
    else if (currentTier === 3) tier3Group.visible = true
    else if (currentTier === 4) tier4Group.visible = true
    else if (currentTier >= 5) tier5Group.visible = true
  }

  applyVisibility()

  // HÀM CẬP NHẬT TRONG ANIMATE LOOP
  function update(dt: number, walkAmt: number, avatarWorldPos: THREE.Vector3) {
    elapsed += dt

    if (isVisible && currentTier >= 2) {
      // 1. Nhịp thở phát quang hình sin êm dịu (Breathing Glow)
      const breath = 0.65 + Math.sin(elapsed * 2.2) * 0.22

      // Cấp 2
      if (currentTier === 2) {
        silverHaloMat.opacity = breath * 0.95
      }

      // Cấp 3
      if (currentTier === 3) {
        goldInnerMat.opacity = breath
        goldOuterMat.opacity = breath * 0.65

        // Xoay 8 hạt bụi sáng
        for (let i = 0; i < sparkles.length; i++) {
          const a = elapsed * 1.6 + (i * Math.PI) / 4
          const r = 0.44 + Math.sin(elapsed * 3.0 + i) * 0.06
          sparkles[i].position.set(
            Math.cos(a) * r,
            2.32 + Math.sin(elapsed * 2.5 + i * 1.5) * 0.12,
            Math.sin(a) * 0.32 - 0.16
          )
        }
      }

      // Cấp 4
      if (currentTier === 4) {
        wheelCenterMat.opacity = breath
        petalMat.opacity = breath * 0.85
        lotusWheel.rotation.z += dt * 0.42
        groundHaloMat.opacity = 0.28 + Math.sin(elapsed * 1.8) * 0.12
      }

      // Cấp 5
      if (currentTier >= 5) {
        // Chu kỳ màu sắc cầu vồng nhiệm màu (HSV Rainbow Cycle)
        const hue1 = (elapsed * 0.12) % 1
        const hue2 = (elapsed * 0.12 + 0.33) % 1
        const hue3 = (elapsed * 0.12 + 0.66) % 1

        rainbowMat1.color.setHSL(hue1, 0.85, 0.6)
        rainbowMat2.color.setHSL(hue2, 0.85, 0.6)
        rainbowPetalMat.color.setHSL(hue3, 0.9, 0.65)
        rainbowGroundMat.color.setHSL(hue1, 0.8, 0.55)

        rainbowMat1.opacity = breath
        rainbowMat2.opacity = breath * 0.75
        rainbowGroundMat.opacity = 0.32 + Math.sin(elapsed * 2.0) * 0.14

        // 2 luân xa sen xoay ngược chiều nhau
        rainbowWheel1.rotation.z += dt * 0.45
        rainbowWheel2.rotation.z -= dt * 0.3

        // 12 hạt tinh tú quay đa chiều
        for (let i = 0; i < stars.length; i++) {
          const a = elapsed * 1.8 + (i * Math.PI) / 6
          const r = 0.62 + Math.sin(elapsed * 2.8 + i) * 0.08
          stars[i].position.set(
            Math.cos(a) * r,
            2.32 + Math.sin(elapsed * 3.2 + i * 2.0) * 0.18,
            Math.sin(a) * 0.42 - 0.17
          )
        }

        // Tạo dấu chân hoa sen khi bước đi
        if (walkAmt > 0.35 && parentScene) {
          footstepTimer += dt
          if (footstepTimer >= 0.32) {
            footstepTimer = 0
            spawnLotusFootstep(avatarWorldPos)
          }
        }
      }
    }

    // Cập nhật và làm mờ dần các dấu chân hoa sen Cấp 5
    for (let i = footsteps.length - 1; i >= 0; i--) {
      const f = footsteps[i]
      f.age += dt
      const progress = f.age / f.maxAge
      if (progress >= 1) {
        footstepSceneGroup.remove(f.mesh)
        footsteps.splice(i, 1)
      } else {
        const sc = 0.6 + progress * 0.5
        f.mesh.scale.set(sc, sc, sc)
        f.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.opacity = (1 - progress) * 0.75
          }
        })
      }
    }
  }

  function setTier(tier: number, showAura?: boolean) {
    currentTier = tier
    if (showAura !== undefined) isVisible = showAura
    applyVisibility()
  }

  function setShowAura(show: boolean) {
    isVisible = show
    applyVisibility()
  }

  function dispose() {
    if (parentScene) {
      parentScene.remove(footstepSceneGroup)
    }
    footsteps.forEach((f) => footstepSceneGroup.remove(f.mesh))
    footsteps.length = 0
  }

  return {
    group: rootGroup,
    update,
    setTier,
    setShowAura,
    dispose
  }
}

/**
 * Định nghĩa kiểu dữ liệu cho module Sinh thái & Bản đồ (Phase 2)
 */

export interface FishSpecies {
  id: string
  name: string
  varietyName: string
  symbolism: string // Ý nghĩa biểu trưng: cát tường, trường thọ, trí tuệ
  colors: {
    primary: string
    secondary?: string
    accent?: string
  }
  swimSpeedRange: [number, number]
  growthDurationDays: number
  description: string
}

export interface PondFishItem {
  id: string
  speciesId: string
  name: string
  releaserName: string
  wishNote?: string
  releasedAt: number // Timestamp ms
  feedCount: number
  lastFedAt?: number
  // Vị trí và góc bơi mô phỏng
  x?: number
  y?: number
  angle?: number
  speed?: number
  sizeMultiplier?: number // 0.45 (cá con) -> 1.0 (trưởng thành)
}

export interface BodhiRibbon {
  id: string
  wish: string
  author: string
  color: 'red' | 'yellow' | 'white'
  createdAt: number
}

export interface BodhiTreeState {
  id: string
  treeName: string
  plantedAt: number // Timestamp ms
  waterCount: number
  lastWateredDate: string // YYYY-MM-DD
  stage: 'seed' | 'sprout' | 'sapling' | 'grown' | 'ancient'
  ribbons: BodhiRibbon[]
}

export interface LanternItem {
  id: string
  senderName: string
  prayerText: string
  category: 'peace' | 'health' | 'family' | 'rebirth' // An lạc, Cầu sức khỏe, Gia đạo, Hồi hướng
  lanternType: 'lotus_pink' | 'lotus_gold' | 'lotus_white'
  createdAt: number
  // Tọa độ trên sông
  xPercent: number // 5 đến 95
  yPercent: number // 10 đến 90
  speed: number
  driftPhase: number
  sizeScale: number
}

export interface TempleZone {
  id: string
  name: string
  eyebrow: string
  description: string
  icon: string
  category: 'worship' | 'nature' | 'practice' | 'merit'
  badge?: string
  // Tọa độ trên bản đồ isometric (tỉ lệ %)
  posX: number
  posY: number
  targetAction: 'modal_incense' | 'modal_bell' | 'modal_beads' | 'modal_meditation' | 'modal_sutras' | 'modal_fish' | 'modal_bodhi' | 'modal_lanterns' | 'modal_fortune' | 'route_3d' | 'route_chua'
}


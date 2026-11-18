import { ref, reactive, computed } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { useSound } from './useSound'

export interface MeritLogItem {
  id: string
  action: string
  amount: number
  description: string
  timestamp: number
}

export interface MeritProfile {
  totalMerit: number
  currentMerit: number
  currentTier: 1 | 2 | 3 | 4 | 5
  streakDays: number
  lastCheckInDate: string
  todayPoints: number
  lastPointsResetDate: string
  unlockedOutfits: string[]
  currentOutfit: string
  activeAccessories: string[]
  showAura: boolean
  history: MeritLogItem[]
}

export interface TierInfo {
  tier: 1 | 2 | 3 | 4 | 5
  name: string
  title: string
  description: string
  minPoints: number
  nextPoints: number | null
  badge: string
  color: string
}

export const MERIT_TIERS: TierInfo[] = [
  {
    tier: 1,
    name: 'Sơ Tâm',
    title: 'Sơ Tâm Thiện Lành',
    description: 'Tâm niệm hướng thiện, mộc mạc chất phác trên bước đầu vào cửa Phật.',
    minPoints: 0,
    nextPoints: 100,
    badge: '🌿',
    color: '#90a4ae'
  },
  {
    tier: 2,
    name: 'Tinh Tấn',
    title: 'Tinh Tấn Tu Tập',
    description: 'Cần cù siêng năng tu tập, tỏa vầng hào quang ánh bạc thanh tịnh sau gáy.',
    minPoints: 100,
    nextPoints: 300,
    badge: '✨',
    color: '#eceff1'
  },
  {
    tier: 3,
    name: 'Bồ Đề',
    title: 'Bồ Đề Tâm Khởi',
    description: 'Khởi tâm đại bi phóng sinh cứu vật, hào quang kim sắc rạng rỡ tỏa bụi sáng.',
    minPoints: 300,
    nextPoints: 700,
    badge: '🌟',
    color: '#ffd54f'
  },
  {
    tier: 4,
    name: 'Thanh Tịnh',
    title: 'Thanh Tịnh Quang Minh',
    description: 'Đoạn trừ phiền não, luân xa đài sen 12 cánh xoay 3D quang minh soi rạng bước chân.',
    minPoints: 700,
    nextPoints: 1500,
    badge: '🌸',
    color: '#4fc3f7'
  },
  {
    tier: 5,
    name: 'Viên Mãn',
    title: 'Đại Trí Viên Mãn',
    description: 'Đại thiện tri thức công đức vô lượng, hào quang Thất Sắc Quang Minh tỏa chiếu toàn thân.',
    minPoints: 1500,
    nextPoints: null,
    badge: '🌌',
    color: '#ba68c8'
  }
]

export interface LeaderboardEntry {
  id: string
  dharmaName: string
  totalMerit: number
  tier: 1 | 2 | 3 | 4 | 5
  streakDays: number
  outfitId: string
  isCurrentUser?: boolean
  rank?: number
}

export interface TempleContribution {
  id: string
  donorName: string
  purpose: string
  amountMerit: number
  date: string
  badge: string
}

export const COMMUNITY_LEADERBOARD_SEED: LeaderboardEntry[] = [
  { id: 'lb_1', dharmaName: 'Thích Tuệ Đăng', totalMerit: 3240, tier: 5, streakDays: 108, outfitId: 'robe_ca_sa' },
  { id: 'lb_2', dharmaName: 'Diệu Thiện Tâm', totalMerit: 2680, tier: 5, streakDays: 84, outfitId: 'robe_bach_y' },
  { id: 'lb_3', dharmaName: 'Quang Giác Cư Sĩ', totalMerit: 2150, tier: 5, streakDays: 72, outfitId: 'robe_ca_sa' },
  { id: 'lb_4', dharmaName: 'Thích Nhuận Tâm', totalMerit: 1480, tier: 4, streakDays: 49, outfitId: 'robe_chivang' },
  { id: 'lb_5', dharmaName: 'Liên Hoa Tịnh Xá', totalMerit: 1220, tier: 4, streakDays: 42, outfitId: 'robe_bach_y' },
  { id: 'lb_6', dharmaName: 'Minh Trí Cư Sĩ', totalMerit: 980, tier: 4, streakDays: 35, outfitId: 'robe_chivang' },
  { id: 'lb_7', dharmaName: 'Tuệ Tâm An', totalMerit: 640, tier: 3, streakDays: 21, outfitId: 'robe_nau' },
  { id: 'lb_8', dharmaName: 'Viên Chiếu Thiền Sinh', totalMerit: 510, tier: 3, streakDays: 18, outfitId: 'robe_nau' },
  { id: 'lb_9', dharmaName: 'Thiện Duyên Phật Tử', totalMerit: 430, tier: 3, streakDays: 14, outfitId: 'robe_nau' },
  { id: 'lb_10', dharmaName: 'Bồ Đề Tâm', totalMerit: 280, tier: 2, streakDays: 9, outfitId: 'robe_lam' },
  { id: 'lb_11', dharmaName: 'Tịnh Tấn Cư Sĩ', totalMerit: 220, tier: 2, streakDays: 7, outfitId: 'robe_lam' },
  { id: 'lb_12', dharmaName: 'Sơ Tâm Học Phật', totalMerit: 140, tier: 2, streakDays: 5, outfitId: 'robe_lam' }
]

export const TEMPLE_CONTRIBUTIONS_SEED: TempleContribution[] = [
  { id: 'c_1', donorName: 'Thích Tuệ Đăng', purpose: 'Đúc Đại Hồng Chung Hòa Bình', amountMerit: 500, date: '15/11/2026', badge: '🔔' },
  { id: 'c_2', donorName: 'Diệu Thiện Tâm', purpose: 'Chăm Sóc & Tưới Nước Cội Bồ Đề Cổ Thụ', amountMerit: 350, date: '16/11/2026', badge: '🌳' },
  { id: 'c_3', donorName: 'Quang Giác Cư Sĩ', purpose: 'Phóng Sinh Đàn Cá Koi Hồ Sen', amountMerit: 300, date: '16/11/2026', badge: '🐟' },
  { id: 'c_4', donorName: 'Minh Trí Cư Sĩ', purpose: 'Tu Bổ Cầu Đá Vòm & Lát Thềm Ngũ Cấp', amountMerit: 250, date: '17/11/2026', badge: '🌉' },
  { id: 'c_5', donorName: 'Liên Hoa Tịnh Xá', purpose: 'Thắp Sáng Đèn Hoa Đăng Cầu An Sông Trăng', amountMerit: 200, date: '17/11/2026', badge: '🏮' },
  { id: 'c_6', donorName: 'Thích Nhuận Tâm', purpose: 'Ấn Tống Kinh Sách & Pháp Bảo Thiền Môn', amountMerit: 200, date: '18/11/2026', badge: '📜' },
  { id: 'c_7', donorName: 'Tuệ Tâm An', purpose: 'Cúng Dường Hương Trầm & Đèn Dầu Tam Bảo', amountMerit: 150, date: '18/11/2026', badge: '🪔' }
]

const STORAGE_KEY = 'dco_merit_profile_v1'
const MAX_DAILY_REGULAR_POINTS = 120

function getTodayString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function calculateTier(points: number): TierInfo {
  for (let i = MERIT_TIERS.length - 1; i >= 0; i--) {
    if (points >= MERIT_TIERS[i].minPoints) {
      return MERIT_TIERS[i]
    }
  }
  return MERIT_TIERS[0]
}

export interface DailyBlessing {
  id: number
  quote: string
  author: string
  meaning: string
}

export const BUDDHIST_BLESSINGS: DailyBlessing[] = [
  {
    id: 1,
    quote: 'Tâm bình thế giới bình, tâm an vạn sự an.',
    author: 'Lời Phật Dạy',
    meaning: 'Khi giữ được tâm thái an tịnh trước sóng gió, vạn vật xung quanh tự khắc sẽ an hòa.'
  },
  {
    id: 2,
    quote: 'Hạnh phúc không nằm ở đích đến, mà ở từng bước chân chánh niệm hôm nay.',
    author: 'Thiền Sư Thích Nhất Hạnh',
    meaning: 'Hãy trân trọng giây phút hiện tại, mỗi hơi thở là một phép mầu của cuộc sống.'
  },
  {
    id: 3,
    quote: 'Lấy từ bi xóa bỏ hận thù, lấy nhẫn nhục chuyển hóa nghịch cảnh.',
    author: 'Kinh Pháp Cú',
    meaning: 'Oán kết không thể giải bằng oán kết, chỉ có lòng từ bi mới dập tắt được lửa sân hận.'
  },
  {
    id: 4,
    quote: 'Mỗi buổi sớm mai thức dậy, hãy mỉm cười đón nhận 24 giờ tinh khôi để tu học.',
    author: 'Lời Phật Dạy',
    meaning: 'Mỗi ngày mới là một cơ hội thiện lành để gieo trồng phước đức và tình thương yêu.'
  },
  {
    id: 5,
    quote: 'Nước trong nhờ lắng cặn, lòng thanh tịnh nhờ biết buông bỏ.',
    author: 'Kinh Kim Cang',
    meaning: 'Buông bỏ những phiền muộn vướng mắc để tâm hồn được nhẹ nhàng, thanh thoát.'
  },
  {
    id: 6,
    quote: 'Một ngọn nến có thể thắp sáng hàng ngàn ngọn nến khác mà không bị hao mòn.',
    author: 'Kinh Di Giáo',
    meaning: 'Hạnh phúc và lòng tốt khi được sẻ chia sẽ nhân lên gấp bội trong cộng đồng.'
  },
  {
    id: 7,
    quote: 'Hãy làm hòn đảo nương tựa cho chính mình, thắp sáng ngọn đèn chánh pháp nội tâm.',
    author: 'Kinh Đại Bát Niết Bàn',
    meaning: 'Tự mình nỗ lực tinh tấn mỗi ngày, đó là bến đỗ bình an và vững chãi nhất.'
  }
]

export function getTodayBlessing(): DailyBlessing {
  const d = new Date()
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  return BUDDHIST_BLESSINGS[dayOfYear % BUDDHIST_BLESSINGS.length]
}

export interface WeekDayStatus {
  dayIndex: number     // 1 to 7
  label: string        // "Ngày 1" ... "Ngày 7"
  points: number       // 20, 20, 30, 20, 20, 20, 50
  bonus: number        // 0, 0, 10, 0, 0, 0, 30
  status: 'completed' | 'today' | 'upcoming'
}

export function getWeekStreakDays(streakDays: number, canCheckIn: boolean): WeekDayStatus[] {
  const completedInCycle = canCheckIn ? (streakDays % 7) : ((streakDays - 1) % 7) + 1
  const todayCycleIndex = canCheckIn ? completedInCycle + 1 : completedInCycle

  const days: WeekDayStatus[] = []
  for (let i = 1; i <= 7; i++) {
    const bonus = i === 3 ? 10 : i === 7 ? 30 : 0
    let status: 'completed' | 'today' | 'upcoming' = 'upcoming'
    if (canCheckIn) {
      if (i <= completedInCycle) status = 'completed'
      else if (i === todayCycleIndex) status = 'today'
      else status = 'upcoming'
    } else {
      if (i <= todayCycleIndex) status = 'completed'
      else status = 'upcoming'
    }

    days.push({
      dayIndex: i,
      label: `Ngày ${i}`,
      points: 20 + bonus,
      bonus,
      status
    })
  }
  return days
}

export interface MeritToastData {
  id: number
  amount: number
  action: string
  description: string
  badge: string
  capped?: boolean
}

// Global reactive state
const profile = reactive<MeritProfile>({
  totalMerit: 0,
  currentMerit: 0,
  currentTier: 1,
  streakDays: 0,
  lastCheckInDate: '',
  todayPoints: 0,
  lastPointsResetDate: '',
  unlockedOutfits: ['robe_lam'],
  currentOutfit: 'robe_lam',
  activeAccessories: [],
  showAura: true,
  history: []
})

const initialized = ref(false)
export const activeMeritToast = ref<MeritToastData | null>(null)
export const checkInModalOpen = ref(false)
export const outfitShopModalOpen = ref(false)
export const leaderboardModalOpen = ref(false)
let toastTimer: any = null

const levelUpModal = ref<{
  show: boolean
  oldTier: number
  newTier: TierInfo
} | null>(null)

export function useMeritSystem() {
  const { client, isConfigured } = useSupabase()
  const { current: authUser } = useAuth()
  const sound = useSound()

  function init() {
    if (initialized.value || !import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        Object.assign(profile, parsed)
      }
    } catch (e) {
      console.warn('[MeritSystem] Failed to parse local storage:', e)
    }

    if (!profile.unlockedOutfits || !profile.unlockedOutfits.length) {
      profile.unlockedOutfits = ['robe_lam']
    }
    if (!profile.activeAccessories) {
      profile.activeAccessories = []
    }
    if (!profile.currentOutfit) {
      profile.currentOutfit = 'robe_lam'
    }

    // Kiểm tra reset trần điểm ngày mới
    const today = getTodayString()
    if (profile.lastPointsResetDate !== today) {
      profile.todayPoints = 0
      profile.lastPointsResetDate = today
      saveLocal()
    }

    // Đảm bảo cấp bậc khớp với tổng điểm
    const correctTier = calculateTier(profile.totalMerit).tier
    if (profile.currentTier !== correctTier) {
      profile.currentTier = correctTier
      saveLocal()
    }

    initialized.value = true
    syncWithCloud()
  }

  function saveLocal() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {}
  }

  async function syncWithCloud() {
    if (!isConfigured || !client || !authUser.value || authUser.value.guest) return
    try {
      const userId = authUser.value.id
      const { data, error } = await client
        .from('user_merit_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') return

      if (data) {
        // Đồng bộ điểm cao hơn giữa cloud và local
        if (data.total_merit > profile.totalMerit) {
          profile.totalMerit = data.total_merit
          profile.currentMerit = data.current_merit
          profile.streakDays = data.streak_days || profile.streakDays
          profile.lastCheckInDate = data.last_check_in || profile.lastCheckInDate
          profile.unlockedOutfits = data.unlocked_outfits || profile.unlockedOutfits
          profile.currentOutfit = data.current_outfit || profile.currentOutfit
          profile.currentTier = calculateTier(profile.totalMerit).tier
          saveLocal()
        } else if (profile.totalMerit > data.total_merit) {
          await client.from('user_merit_profiles').upsert({
            user_id: userId,
            total_merit: profile.totalMerit,
            current_merit: profile.currentMerit,
            tier: profile.currentTier,
            streak_days: profile.streakDays,
            last_check_in: profile.lastCheckInDate || null,
            unlocked_outfits: profile.unlockedOutfits,
            current_outfit: profile.currentOutfit,
            updated_at: new Date().toISOString()
          })
        }
      } else {
        // Tạo profile mới trên cloud
        await client.from('user_merit_profiles').insert({
          user_id: userId,
          dharma_name: authUser.value.name,
          total_merit: profile.totalMerit,
          current_merit: profile.currentMerit,
          tier: profile.currentTier,
          streak_days: profile.streakDays,
          last_check_in: profile.lastCheckInDate || null,
          unlocked_outfits: profile.unlockedOutfits,
          current_outfit: profile.currentOutfit
        })
      }
    } catch (e) {
      console.warn('[MeritSystem] Cloud sync notice:', e)
    }
  }

  /**
   * Tích lũy công đức từ các hành vi thiện lành
   */
  function earnMerit(
    action: string,
    rawAmount: number,
    description: string
  ): { earned: number; capped: boolean; leveledUp: boolean; newTier?: TierInfo } {
    init()
    const today = getTodayString()
    if (profile.lastPointsResetDate !== today) {
      profile.todayPoints = 0
      profile.lastPointsResetDate = today
    }

    let earned = rawAmount
    let capped = false

    // Cúng dường Tam Bảo và thưởng điểm danh chuỗi không tính vào giới hạn ngày
    const bypassCap = action === 'merit_donation' || action.startsWith('check_in')
    if (!bypassCap) {
      const remaining = Math.max(0, MAX_DAILY_REGULAR_POINTS - profile.todayPoints)
      if (remaining <= 0) {
        showToastNotification(0, action, 'Hôm nay bạn đã đạt mức trần công đức (120/120 điểm). Hãy trở lại ngày mai nhé!', '⏳', true)
        return { earned: 0, capped: true, leveledUp: false }
      }
      if (earned > remaining) {
        earned = remaining
        capped = true
      }
      profile.todayPoints += earned
    }

    const oldTier = profile.currentTier
    profile.totalMerit += earned
    profile.currentMerit += earned

    // Ghi log
    profile.history.unshift({
      id: Math.random().toString(36).slice(2, 9),
      action,
      amount: earned,
      description,
      timestamp: Date.now()
    })
    if (profile.history.length > 50) {
      profile.history.length = 50
    }

    // Kiểm tra thăng cấp hào quang
    const nextTierInfo = calculateTier(profile.totalMerit)
    let leveledUp = false
    if (nextTierInfo.tier > oldTier) {
      profile.currentTier = nextTierInfo.tier
      leveledUp = true
      sound.playBell()
      levelUpModal.value = {
        show: true,
        oldTier,
        newTier: nextTierInfo
      }
    }

    if (earned > 0) {
      sound.playMeritChime()
      showToastNotification(earned, action, description, nextTierInfo.badge, capped)
    }

    saveLocal()
    syncWithCloud()

    return {
      earned,
      capped,
      leveledUp,
      newTier: leveledUp ? nextTierInfo : undefined
    }
  }

  /**
   * Kiểm tra xem hôm nay người chơi đã điểm danh chưa
   */
  function canCheckInToday(): boolean {
    init()
    return profile.lastCheckInDate !== getTodayString()
  }

  /**
   * Thực hiện điểm danh đầu ngày và cộng điểm chuỗi streak
   */
  function performCheckIn(): {
    success: boolean
    earned: number
    streak: number
    bonus: number
    leveledUp: boolean
    newTier?: TierInfo
  } {
    init()
    const today = getTodayString()
    if (profile.lastCheckInDate === today) {
      return { success: false, earned: 0, streak: profile.streakDays, bonus: 0, leveledUp: false }
    }

    const yesterday = getYesterdayString()
    if (profile.lastCheckInDate === yesterday) {
      profile.streakDays += 1
    } else {
      profile.streakDays = 1
    }

    profile.lastCheckInDate = today

    const basePoints = 20
    let bonus = 0
    if (profile.streakDays === 3) bonus = 10
    else if (profile.streakDays === 7) bonus = 30
    else if (profile.streakDays === 14) bonus = 60
    else if (profile.streakDays === 30 || (profile.streakDays > 30 && profile.streakDays % 30 === 0)) bonus = 150
    else if (profile.streakDays > 7 && profile.streakDays % 7 === 0) bonus = 30

    const totalCheckIn = basePoints + bonus
    const desc = bonus > 0
      ? `Điểm danh chuỗi ${profile.streakDays} ngày (+${basePoints} gốc, +${bonus} thưởng tinh tấn)`
      : `Điểm danh ngày ${profile.streakDays}`

    const res = earnMerit('check_in', totalCheckIn, desc)
    saveLocal()
    syncWithCloud()

    return {
      success: true,
      earned: totalCheckIn,
      streak: profile.streakDays,
      bonus,
      leveledUp: res.leveledUp,
      newTier: res.newTier
    }
  }

  function showToastNotification(
    amount: number,
    action: string,
    description: string,
    badge: string,
    capped = false
  ) {
    activeMeritToast.value = {
      id: Date.now(),
      amount,
      action,
      description,
      badge,
      capped
    }
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      activeMeritToast.value = null
    }, 3800)
  }

  function dismissMeritToast() {
    activeMeritToast.value = null
    if (toastTimer) clearTimeout(toastTimer)
  }

  function closeLevelUpModal() {
    if (levelUpModal.value) levelUpModal.value.show = false
  }

  function toggleAura() {
    profile.showAura = !profile.showAura
    saveLocal()
  }

  function setOutfit(outfitId: string) {
    if (profile.unlockedOutfits.includes(outfitId)) {
      profile.currentOutfit = outfitId
      saveLocal()
      syncWithCloud()
      return true
    }
    return false
  }

  function toggleAccessory(accId: string): boolean {
    if (!profile.unlockedOutfits.includes(accId)) return false
    if (!profile.activeAccessories) profile.activeAccessories = []
    const idx = profile.activeAccessories.indexOf(accId)
    if (idx >= 0) {
      profile.activeAccessories.splice(idx, 1)
    } else {
      profile.activeAccessories.push(accId)
    }
    saveLocal()
    syncWithCloud()
    return true
  }

  function unlockOutfit(outfitId: string, cost: number): boolean {
    if (profile.unlockedOutfits.includes(outfitId)) {
      if (outfitId.startsWith('acc_')) {
        toggleAccessory(outfitId)
      } else {
        setOutfit(outfitId)
      }
      return true
    }
    if (profile.currentMerit >= cost) {
      profile.currentMerit -= cost
      profile.unlockedOutfits.push(outfitId)
      if (outfitId.startsWith('acc_')) {
        if (!profile.activeAccessories) profile.activeAccessories = []
        if (!profile.activeAccessories.includes(outfitId)) {
          profile.activeAccessories.push(outfitId)
        }
      } else {
        profile.currentOutfit = outfitId
      }
      saveLocal()
      syncWithCloud()
      return true
    }
    return false
  }

  const currentTierInfo = computed(() => calculateTier(profile.totalMerit))
  const dailyRemainingPoints = computed(() => Math.max(0, MAX_DAILY_REGULAR_POINTS - profile.todayPoints))

  function openCheckInModal() {
    checkInModalOpen.value = true
  }

  function closeCheckInModal() {
    checkInModalOpen.value = false
  }

  function openOutfitShopModal() {
    outfitShopModalOpen.value = true
  }

  function closeOutfitShopModal() {
    outfitShopModalOpen.value = false
  }

  function openLeaderboardModal() {
    leaderboardModalOpen.value = true
  }

  function closeLeaderboardModal() {
    leaderboardModalOpen.value = false
  }

  async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const list: LeaderboardEntry[] = []

    // 1. Thử lấy từ Supabase nếu có kết nối
    if (isConfigured && client) {
      try {
        const { data } = await client
          .from('user_merit_profiles')
          .select('user_id, dharma_name, total_merit, tier, streak_days, current_outfit')
          .order('total_merit', { ascending: false })
          .limit(25)

        if (data && data.length) {
          data.forEach((row: any) => {
            list.push({
              id: row.user_id,
              dharmaName: row.dharma_name || 'Phật tử tinh tấn',
              totalMerit: row.total_merit || 0,
              tier: (row.tier || 1) as any,
              streakDays: row.streak_days || 0,
              outfitId: row.current_outfit || 'robe_lam'
            })
          })
        }
      } catch (e) {
        console.warn('[Leaderboard] Cloud notice:', e)
      }
    }

    // 2. Bổ sung từ seed cộng đồng nếu danh sách chưa đủ dài
    if (list.length < 5) {
      for (const item of COMMUNITY_LEADERBOARD_SEED) {
        if (!list.some((x) => x.dharmaName === item.dharmaName)) {
          list.push({ ...item })
        }
      }
    }

    // 3. Đưa người chơi hiện tại vào bảng xếp hạng
    const myName = authUser.value?.name || 'Bạn (Tôi)'
    const myId = authUser.value?.id || 'current_user'
    const existingIdx = list.findIndex((x) => x.id === myId || x.dharmaName === myName)
    if (existingIdx >= 0) {
      list[existingIdx].totalMerit = Math.max(list[existingIdx].totalMerit, profile.totalMerit)
      list[existingIdx].streakDays = Math.max(list[existingIdx].streakDays, profile.streakDays)
      list[existingIdx].tier = profile.currentTier
      list[existingIdx].outfitId = profile.currentOutfit
      list[existingIdx].isCurrentUser = true
    } else {
      list.push({
        id: myId,
        dharmaName: myName,
        totalMerit: profile.totalMerit,
        tier: profile.currentTier,
        streakDays: profile.streakDays,
        outfitId: profile.currentOutfit,
        isCurrentUser: true
      })
    }

    // 4. Sắp xếp giảm dần theo totalMerit và gán rank
    list.sort((a, b) => b.totalMerit - a.totalMerit)
    list.forEach((entry, idx) => {
      entry.rank = idx + 1
    })

    return list
  }

  return {
    profile,
    init,
    earnMerit,
    canCheckInToday,
    performCheckIn,
    checkInModalOpen,
    openCheckInModal,
    closeCheckInModal,
    outfitShopModalOpen,
    openOutfitShopModal,
    closeOutfitShopModal,
    leaderboardModalOpen,
    openLeaderboardModal,
    closeLeaderboardModal,
    getLeaderboard,
    TEMPLE_CONTRIBUTIONS_SEED,
    currentTierInfo,
    dailyRemainingPoints,
    activeMeritToast,
    dismissMeritToast,
    levelUpModal,
    closeLevelUpModal,
    toggleAura,
    setOutfit,
    toggleAccessory,
    unlockOutfit,
    calculateTier,
    getWeekStreakDays,
    getTodayBlessing,
    MAX_DAILY_REGULAR_POINTS
  }
}

import { ref, computed } from 'vue'
import type { LanternItem } from '~/types/ecosystem'
import { usePracticeJournal } from './usePracticeJournal'
import { useSupabase } from './useSupabase'
import { solarToLunar } from './useLunar'

const LS_KEY = 'dco_lanterns_v1'

const DEFAULT_LANTERNS: LanternItem[] = [
  {
    id: 'lan-seed-1',
    senderName: 'Phật tử Diệu Âm',
    prayerText: 'Nguyện cầu cha mẹ hai bên sống lâu trăm tuổi, thân tâm an lạc không lo âu.',
    category: 'family',
    lanternType: 'lotus_pink',
    createdAt: Date.now() - 3600000,
    xPercent: 25,
    yPercent: 35,
    speed: 0.25,
    driftPhase: 0.5,
    sizeScale: 0.75
  },
  {
    id: 'lan-seed-2',
    senderName: 'Khách thập phương',
    prayerText: 'Nguyện quốc thái dân an, mưa thuận gió hòa, muôn nhà ấm no hạnh phúc.',
    category: 'peace',
    lanternType: 'lotus_gold',
    createdAt: Date.now() - 7200000,
    xPercent: 65,
    yPercent: 20,
    speed: 0.2,
    driftPhase: 1.2,
    sizeScale: 0.6
  },
  {
    id: 'lan-seed-3',
    senderName: 'Tịnh Tuệ',
    prayerText: 'Hồi hướng công đức cửu huyền thất tổ, thân bằng quyến thuộc vãng sanh tịnh độ.',
    category: 'rebirth',
    lanternType: 'lotus_white',
    createdAt: Date.now() - 10800000,
    xPercent: 42,
    yPercent: 50,
    speed: 0.3,
    driftPhase: 2.1,
    sizeScale: 0.85
  },
  {
    id: 'lan-seed-4',
    senderName: 'Ẩn danh',
    prayerText: 'Cầu mong bản thân luôn giữ được tâm hướng thiện, bao dung và bớt nóng giận.',
    category: 'health',
    lanternType: 'lotus_pink',
    createdAt: Date.now() - 14400000,
    xPercent: 80,
    yPercent: 45,
    speed: 0.28,
    driftPhase: 3.4,
    sizeScale: 0.8
  },
  {
    id: 'lan-seed-5',
    senderName: 'Thiện Duyên',
    prayerText: 'Nguyện đem ánh sáng từ bi xua tan bóng đêm tăm tối trong lòng người.',
    category: 'peace',
    lanternType: 'lotus_gold',
    createdAt: Date.now() - 18000000,
    xPercent: 18,
    yPercent: 65,
    speed: 0.35,
    driftPhase: 4.5,
    sizeScale: 0.95
  }
]

const lanterns = ref<LanternItem[]>([])
const isInitialized = ref(false)
let realtimeChannel: any = null
const isRealtimeConnected = ref(false)

export function useLanterns() {
  const journal = usePracticeJournal()
  const { client, isConfigured } = useSupabase()

  function init() {
    if (!import.meta.client || isInitialized.value) return
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          lanterns.value = parsed
          isInitialized.value = true
          setupRealtime()
          return
        }
      }
    } catch {}

    lanterns.value = [...DEFAULT_LANTERNS]
    persist()
    isInitialized.value = true
    setupRealtime()
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(lanterns.value))
    } catch {}
  }

  // Kết nối Supabase Realtime Broadcast cho sự kiện thả hoa đăng
  function setupRealtime() {
    if (!import.meta.client || !isConfigured || !client || realtimeChannel) return
    try {
      realtimeChannel = client.channel('realtime:lanterns_event', {
        config: { broadcast: { self: false } }
      })

      realtimeChannel.on('broadcast', { event: 'new_lantern' }, (payload: any) => {
        if (payload?.payload) {
          const item: LanternItem = payload.payload
          // Thêm hoa đăng của người khác vào sông
          lanterns.value.unshift(item)
          if (lanterns.value.length > 50) {
            lanterns.value.pop()
          }
        }
      })

      realtimeChannel.subscribe((status: string) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
      })
    } catch (e) {
      console.warn('Lỗi kết nối Realtime hoa đăng:', e)
    }
  }

  // Kiểm tra xem hôm nay có phải đêm Rằm (ngày 14, 15 âm lịch) hoặc Mùng Một
  const lunarFestivalInfo = computed(() => {
    const now = new Date()
    const lunar = solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear())
    const isFullMoon = lunar.day === 14 || lunar.day === 15
    const isNewMoon = lunar.day === 1

    return {
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      isFullMoon,
      isNewMoon,
      isFestivalToday: isFullMoon || isNewMoon,
      festivalTitle: isFullMoon
        ? `Đêm Hội Hoa Đăng Rằm Tháng ${lunar.month}`
        : isNewMoon
        ? `Đêm Thắp Đèn Mùng Một Đầu Tháng`
        : null
    }
  })

  function releaseLantern(
    senderName: string,
    prayerText: string,
    category: 'peace' | 'health' | 'family' | 'rebirth' = 'peace',
    lanternType: 'lotus_pink' | 'lotus_gold' | 'lotus_white' = 'lotus_pink'
  ): LanternItem {
    init()

    const newLantern: LanternItem = {
      id: 'lan-' + Math.random().toString(36).slice(2, 9),
      senderName: senderName.trim() || 'Phật tử ẩn danh',
      prayerText: prayerText.trim() || 'Nguyện muôn loài an lạc, thân tâm tự tại.',
      category,
      lanternType,
      createdAt: Date.now(),
      xPercent: 20 + Math.random() * 60,
      yPercent: 75 + Math.random() * 15,
      speed: 0.25 + Math.random() * 0.15,
      driftPhase: Math.random() * Math.PI * 2,
      sizeScale: 1.0
    }

    lanterns.value.unshift(newLantern)
    if (lanterns.value.length > 50) {
      lanterns.value.pop()
    }
    persist()

    journal.addPrayer()

    // 1. Phát sóng qua Supabase Realtime Broadcast cho mọi người cùng thấy
    if (isConfigured && client && realtimeChannel) {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'new_lantern',
          payload: newLantern
        })

        // 2. Lưu vào bảng river_lanterns nếu có cloud
        client.from('river_lanterns').insert({
          sender_name: newLantern.senderName,
          prayer_text: newLantern.prayerText,
          category: newLantern.category,
          lantern_type: newLantern.lanternType
        }).then(() => {})
      } catch {}
    }

    return newLantern
  }

  return {
    lanterns,
    isRealtimeConnected,
    lunarFestivalInfo,
    init,
    releaseLantern
  }
}

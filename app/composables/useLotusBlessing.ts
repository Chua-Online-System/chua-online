import { ref } from 'vue'
import type { LotusBlessingItem, LotusType } from '~/types/lotus'

const STORAGE_KEY = 'dco_lotus_blessings'

const DEFAULT_BLESSINGS: LotusBlessingItem[] = [
  {
    id: 'lotus_init_1',
    sender: 'Đạo hữu Diệu Âm',
    recipient: 'Thân mẫu',
    wish: 'Nguyện cầu thân mẫu thân tâm an lạc, phước thọ miên trường, tật bệnh tiêu trừ.',
    lotusType: 'pink',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'lotus_init_2',
    sender: 'Cư sĩ Trí Quang',
    recipient: 'Bách gia trăm họ',
    wish: 'Nguyện cho quốc thái dân an, mưa thuận gió hòa, chúng sinh dứt trừ khổ não, sớm trọn Phật đạo.',
    lotusType: 'gold',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'lotus_init_3',
    sender: 'Phật tử Huệ Tâm',
    recipient: 'Bạn hữu phương xa',
    wish: 'Chúc bạn lòng luôn thanh tịnh như đóa sen trắng, vượt qua mọi sóng gió nơi trần thế.',
    lotusType: 'white',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
]

export function useLotusBlessing() {
  const blessings = ref<LotusBlessingItem[]>([])

  function init() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        blessings.value = JSON.parse(saved)
      } else {
        blessings.value = [...DEFAULT_BLESSINGS]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blessings.value))
      }
    } catch {
      blessings.value = [...DEFAULT_BLESSINGS]
    }
  }

  function sendBlessing(sender: string, recipient: string, wish: string, lotusType: LotusType): LotusBlessingItem {
    const newItem: LotusBlessingItem = {
      id: `lotus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: sender.trim() || 'Người gửi ẩn danh',
      recipient: recipient.trim() || 'Người thân yêu',
      wish: wish.trim(),
      lotusType,
      createdAt: new Date().toISOString()
    }

    blessings.value.unshift(newItem)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blessings.value))
    }
    return newItem
  }

  function getLotusTypeInfo(type: LotusType) {
    switch (type) {
      case 'white':
        return { name: 'Bạch Liên', meaning: 'Thanh tịnh vô nhiễm & Bình an', icon: '🪷', color: '#FFFFFF', border: '#D4AF37' }
      case 'pink':
        return { name: 'Hồng Liên', meaning: 'Từ bi hỷ xả & Sức khỏe an khang', icon: '🌸', color: '#FFB7B2', border: '#E27D60' }
      case 'gold':
        return { name: 'Kim Liên', meaning: 'Trí tuệ viên mãn & Phước đức quang minh', icon: '✨', color: '#FFE066', border: '#C9A356' }
    }
  }

  return {
    blessings,
    init,
    sendBlessing,
    getLotusTypeInfo
  }
}


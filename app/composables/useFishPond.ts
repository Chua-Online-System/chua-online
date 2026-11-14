import { ref, computed } from 'vue'
import type { FishSpecies, PondFishItem } from '~/types/ecosystem'
import { usePracticeJournal } from './usePracticeJournal'

const LS_KEY = 'dco_pond_fish_v1'

export const FISH_SPECIES: FishSpecies[] = [
  {
    id: 'koi-kohaku',
    name: 'Cá Koi Kohaku (Bạch Đỏ)',
    varietyName: 'Kohaku',
    symbolism: 'Cát Tường & Thuần Khiết',
    colors: {
      primary: '#F5F2EB', // Trắng sứ
      secondary: '#D33E2B', // Đỏ son
      accent: '#E65100'
    },
    swimSpeedRange: [1.2, 2.0],
    growthDurationDays: 30,
    description: 'Thân trắng ngọc điểm đốm đỏ son quý phái. Đứng đầu trong các dòng cá chép Nhật Bản, biểu trưng cho sự viên mãn và bình an.'
  },
  {
    id: 'koi-taisho',
    name: 'Cá Koi Taisho Sanke (Tam Sắc)',
    varietyName: 'Taisho Sanke',
    symbolism: 'Trí Tuệ & Chuyển Nghiệp',
    colors: {
      primary: '#F8F6F0',
      secondary: '#C83226',
      accent: '#262421' // Đốm sumi đen tuyền
    },
    swimSpeedRange: [1.0, 1.8],
    growthDurationDays: 30,
    description: 'Hòa quyện ba sắc Trắng - Đỏ - Đen tượng trưng cho Giới - Định - Tuệ, vượt qua ba độc Tham - Sân - Si.'
  },
  {
    id: 'koi-yamabuki',
    name: 'Cá Koi Yamabuki (Hoàng Kim)',
    varietyName: 'Yamabuki Ogon',
    symbolism: 'Phước Báu & Hưng Thịnh',
    colors: {
      primary: '#F5B82E', // Vàng hoàng kim
      secondary: '#E6A11C',
      accent: '#FFE680'
    },
    swimSpeedRange: [0.9, 1.6],
    growthDurationDays: 30,
    description: 'Vảy cá vàng óng ánh như dát vàng dưới ánh nắng, mang lại năng lượng hoan hỷ, sung túc và vạn sự hanh thông.'
  },
  {
    id: 'ca-chep-do',
    name: 'Cá Chép Đỏ Cát Tường',
    varietyName: 'Chép Đỏ Việt',
    symbolism: 'Vượt Vũ Môn & Kiên Định',
    colors: {
      primary: '#E04A2F', // Đỏ cam truyền thống
      secondary: '#BA3118',
      accent: '#F78C58'
    },
    swimSpeedRange: [1.3, 2.2],
    growthDurationDays: 25,
    description: 'Loài cá gắn liền với văn hóa phóng sinh lễ Phật và tiễn Táo quân của người Việt, tượng trưng cho chí kiên nhẫn vượt sóng gió.'
  }
]

// Dữ liệu cá mẫu thả sẵn trong hồ ban đầu
const DEFAULT_FISH: PondFishItem[] = [
  {
    id: 'fish-seed-1',
    speciesId: 'koi-kohaku',
    name: 'An Nhiên',
    releaserName: 'Phật tử Tịnh Tâm',
    wishNote: 'Nguyện cầu cha mẹ bình an, thân tâm thanh thản.',
    releasedAt: Date.now() - 15 * 86400000, // 15 ngày trước
    feedCount: 12
  },
  {
    id: 'fish-seed-2',
    speciesId: 'koi-yamabuki',
    name: 'Như Ý',
    releaserName: 'Khách thập phương',
    wishNote: 'Cầu mong công việc thuận lợi, gia đạo hòa thuận êm ấm.',
    releasedAt: Date.now() - 25 * 86400000, // 25 ngày trước
    feedCount: 20
  },
  {
    id: 'fish-seed-3',
    speciesId: 'koi-taisho',
    name: 'Tuệ Giác',
    releaserName: 'Diệu Hạnh',
    wishNote: 'Nguyện con sáng suốt trong học tập, biết tha thứ và yêu thương.',
    releasedAt: Date.now() - 6 * 86400000,
    feedCount: 5
  },
  {
    id: 'fish-seed-4',
    speciesId: 'ca-chep-do',
    name: 'Cát Tường',
    releaserName: 'Ẩn danh',
    wishNote: 'Hồi hướng công đức cho khắp pháp giới chúng sinh vãng sanh tịnh độ.',
    releasedAt: Date.now() - 32 * 86400000, // Đã trưởng thành
    feedCount: 30
  },
  {
    id: 'fish-seed-5',
    speciesId: 'koi-kohaku',
    name: 'Hỷ Lạc',
    releaserName: 'Thiện Tâm',
    wishNote: 'Nguyện muôn loài vượt thoát khổ đau, sống trong tình thương yêu.',
    releasedAt: Date.now() - 2 * 86400000,
    feedCount: 3
  }
]

const fishList = ref<PondFishItem[]>([])
const isInitialized = ref(false)

export function useFishPond() {
  const journal = usePracticeJournal()

  function init() {
    if (!import.meta.client || isInitialized.value) return
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          fishList.value = parsed
          isInitialized.value = true
          return
        }
      }
    } catch {}

    // Khởi tạo mặc định
    fishList.value = [...DEFAULT_FISH]
    persist()
    isInitialized.value = true
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(fishList.value))
    } catch {}
  }

  // Tính hệ số tăng trưởng của cá dựa trên thời gian thực
  function getFishGrowthScale(releasedAt: number): number {
    const ageDays = (Date.now() - releasedAt) / (1000 * 60 * 60 * 24)
    // Từ 0.45 (mới thả) đến 1.0 (sau 30 ngày)
    return Math.min(1.0, 0.45 + (ageDays / 30) * 0.55)
  }

  // Phóng sinh một chú cá mới vào hồ
  function releaseFish(
    speciesId: string,
    fishName: string,
    releaserName: string,
    wishNote: string
  ): PondFishItem {
    init()

    const newFish: PondFishItem = {
      id: 'fish-' + Math.random().toString(36).slice(2, 9),
      speciesId,
      name: fishName.trim() || 'Cá An Lạc',
      releaserName: releaserName.trim() || 'Phật tử ẩn danh',
      wishNote: wishNote.trim() || 'Nguyện muôn loài tự tại an vui.',
      releasedAt: Date.now(),
      feedCount: 0
    }

    fishList.value.unshift(newFish)
    persist()

    // Ghi nhận vào nhật ký
    journal.addPrayer()

    return newFish
  }

  // Cho cá ăn
  function feedFish(fishId: string) {
    init()
    const fish = fishList.value.find((f) => f.id === fishId)
    if (fish) {
      fish.feedCount = (fish.feedCount || 0) + 1
      fish.lastFedAt = Date.now()
      persist()
    }
  }

  // Tổng số cá trong hồ
  const totalFishCount = computed(() => {
    init()
    return fishList.value.length
  })

  return {
    fishList,
    totalFishCount,
    speciesList: FISH_SPECIES,
    init,
    releaseFish,
    feedFish,
    getFishGrowthScale
  }
}


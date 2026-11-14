import { ref, computed } from 'vue'
import type { BodhiTreeState, BodhiRibbon } from '~/types/ecosystem'
import { usePracticeJournal } from './usePracticeJournal'

const LS_KEY = 'dco_bodhi_tree_v1'

function getTodayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function createDefaultTree(): BodhiTreeState {
  return {
    id: 'bodhi-' + Math.random().toString(36).slice(2, 9),
    treeName: 'Cây Bồ Đề Tâm',
    plantedAt: Date.now() - 7 * 86400000, // Khởi đầu cách đây 7 ngày
    waterCount: 5,
    lastWateredDate: '',
    stage: 'sprout',
    ribbons: [
      {
        id: 'ribbon-1',
        wish: 'Cầu mong cha mẹ sống lâu trăm tuổi, thân tâm an lạc.',
        author: 'Con',
        color: 'red',
        createdAt: Date.now() - 5 * 86400000
      },
      {
        id: 'ribbon-2',
        wish: 'Nguyện tâm bồ đề kiên cố, hướng thiện mỗi ngày.',
        author: 'Tịnh Tâm',
        color: 'yellow',
        createdAt: Date.now() - 2 * 86400000
      }
    ]
  }
}

const tree = ref<BodhiTreeState>(createDefaultTree())
const isInitialized = ref(false)

export function useBodhiTree() {
  const journal = usePracticeJournal()

  function init() {
    if (!import.meta.client || isInitialized.value) return
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          tree.value = parsed
          isInitialized.value = true
          return
        }
      }
    } catch {}

    tree.value = createDefaultTree()
    persist()
    isInitialized.value = true
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tree.value))
    } catch {}
  }

  // Xác định giai đoạn sinh trưởng dựa trên số lần tưới nước
  const currentStage = computed<'seed' | 'sprout' | 'sapling' | 'grown' | 'ancient'>(() => {
    init()
    const c = tree.value.waterCount || 0
    if (c <= 1) return 'seed'
    if (c <= 5) return 'sprout'
    if (c <= 14) return 'sapling'
    if (c <= 29) return 'grown'
    return 'ancient'
  })

  const stageName = computed(() => {
    switch (currentStage.value) {
      case 'seed': return 'Hạt Mầm Ươm Trong Đất'
      case 'sprout': return 'Chồi Non Nhú Hai Lá Mầm'
      case 'sapling': return 'Cây Bồ Đề Non Xanh Tươi'
      case 'grown': return 'Cây Bồ Đề Trưởng Thành Sum Suê'
      case 'ancient': return 'Cây Bồ Đề Đại Thụ Tỏa Bóng Mát'
    }
  })

  // Kiểm tra hôm nay đã tưới nước chưa
  const canWaterToday = computed(() => {
    init()
    const todayStr = getTodayString()
    return tree.value.lastWateredDate !== todayStr
  })

  const daysPlanted = computed(() => {
    init()
    const diff = Date.now() - (tree.value.plantedAt || Date.now())
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  })

  function waterTree(): boolean {
    init()
    if (!canWaterToday.value) return false

    tree.value.waterCount = (tree.value.waterCount || 0) + 1
    tree.value.lastWateredDate = getTodayString()
    tree.value.stage = currentStage.value
    persist()

    journal.today.value.treeWatered = true
    return true
  }

  function attachRibbon(wish: string, author: string, color: 'red' | 'yellow' | 'white'): BodhiRibbon {
    init()
    const newRibbon: BodhiRibbon = {
      id: 'ribbon-' + Math.random().toString(36).slice(2, 9),
      wish: wish.trim(),
      author: author.trim() || 'Ẩn danh',
      color,
      createdAt: Date.now()
    }
    tree.value.ribbons.unshift(newRibbon)
    persist()

    journal.addPrayer()
    return newRibbon
  }

  function renameTree(name: string) {
    init()
    tree.value.treeName = name.trim() || 'Cây Bồ Đề Tâm'
    persist()
  }

  return {
    tree,
    currentStage,
    stageName,
    canWaterToday,
    daysPlanted,
    init,
    waterTree,
    attachRibbon,
    renameTree
  }
}


import type { PracticeDayRecord } from '~/types/practice'

const LS_KEY = 'dco_journal_v1'

function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createEmptyRecord(dateStr: string): PracticeDayRecord {
  return {
    date: dateStr,
    incenseCount: 0,
    chantingCount: 0,
    meditationMinutes: 0,
    sutraReadCount: 0,
    treeWatered: false,
    dharmaRead: false,
    prayersCount: 0,
    meritDedication: ''
  }
}

// Global reactive store in module scope for cross-component sync
const records = ref<Record<string, PracticeDayRecord>>({})
const isInitialized = ref(false)

export function usePracticeJournal() {
  function init() {
    if (!import.meta.client || isInitialized.value) return
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        records.value = JSON.parse(raw)
      }
    } catch (e) {
      console.warn('Lỗi đọc nhật ký tu tập từ localStorage:', e)
    }

    const todayStr = getTodayString()
    if (!records.value[todayStr]) {
      records.value[todayStr] = createEmptyRecord(todayStr)
    }
    isInitialized.value = true
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(records.value))
    } catch (e) {
      console.error('Lỗi lưu nhật ký tu tập:', e)
    }
  }

  const today = computed<PracticeDayRecord>(() => {
    init()
    const todayStr = getTodayString()
    if (!records.value[todayStr]) {
      records.value[todayStr] = createEmptyRecord(todayStr)
    }
    return records.value[todayStr]
  })

  function addIncense(count = 1) {
    init()
    const t = today.value
    t.incenseCount = (t.incenseCount || 0) + count
    persist()
  }

  function addChanting(count: number) {
    init()
    const t = today.value
    t.chantingCount = (t.chantingCount || 0) + count
    persist()
  }

  function addMeditation(minutes: number) {
    init()
    const t = today.value
    t.meditationMinutes = (t.meditationMinutes || 0) + minutes
    persist()
  }

  function addSutraRead() {
    init()
    const t = today.value
    t.sutraReadCount = (t.sutraReadCount || 0) + 1
    persist()
  }

  function addPrayer() {
    init()
    const t = today.value
    t.prayersCount = (t.prayersCount || 0) + 1
    persist()
  }

  function markDharmaRead() {
    init()
    const t = today.value
    t.dharmaRead = true
    persist()
  }

  function saveDedication(text: string) {
    init()
    const t = today.value
    t.meritDedication = text.trim()
    persist()
  }

  // Tính số ngày tịnh tâm liên tục (Mindfulness Streak)
  const streak = computed<number>(() => {
    init()
    const keys = Object.keys(records.value).sort().reverse()
    if (keys.length === 0) return 0

    let currentStreak = 0
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate)
      checkDate.setDate(todayDate.getDate() - i)
      const y = checkDate.getFullYear()
      const m = String(checkDate.getMonth() + 1).padStart(2, '0')
      const d = String(checkDate.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`

      const rec = records.value[dateStr]
      const hasPracticed = rec && (
        rec.chantingCount > 0 ||
        rec.meditationMinutes > 0 ||
        rec.incenseCount > 0 ||
        rec.sutraReadCount > 0 ||
        rec.dharmaRead ||
        (rec.prayersCount && rec.prayersCount > 0)
      )

      if (hasPracticed) {
        currentStreak++
      } else {
        // Cho phép hôm nay chưa thực hành thì vẫn giữ streak từ ngày hôm qua
        if (i === 0) continue
        break
      }
    }
    return currentStreak
  })

  // Thống kê tổng hợp toàn bộ quá trình
  const totalStats = computed(() => {
    init()
    let totalIncense = 0
    let totalChanting = 0
    let totalMeditation = 0
    let totalSutras = 0
    let totalDaysPracticed = 0

    for (const rec of Object.values(records.value)) {
      totalIncense += rec.incenseCount || 0
      totalChanting += rec.chantingCount || 0
      totalMeditation += rec.meditationMinutes || 0
      totalSutras += rec.sutraReadCount || 0
      if (
        rec.incenseCount > 0 ||
        rec.chantingCount > 0 ||
        rec.meditationMinutes > 0 ||
        rec.sutraReadCount > 0
      ) {
        totalDaysPracticed++
      }
    }

    return {
      totalIncense,
      totalChanting,
      totalMeditation,
      totalSutras,
      totalDaysPracticed,
      totalMalas: Math.floor(totalChanting / 108)
    }
  })

  function exportData(): string {
    init()
    return JSON.stringify(records.value, null, 2)
  }

  function importData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr)
      if (typeof parsed === 'object' && parsed !== null) {
        records.value = { ...records.value, ...parsed }
        persist()
        return true
      }
    } catch {}
    return false
  }

  return {
    today,
    records,
    streak,
    totalStats,
    addIncense,
    addChanting,
    addMeditation,
    addSutraRead,
    addPrayer,
    markDharmaRead,
    saveDedication,
    exportData,
    importData,
    init
  }
}


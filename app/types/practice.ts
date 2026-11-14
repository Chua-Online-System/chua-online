/**
 * Định nghĩa kiểu dữ liệu cho module Tu tập & Nhật ký thực hành (Phase 1)
 */

export interface PracticeDayRecord {
  date: string // Định dạng YYYY-MM-DD
  incenseCount: number // Số nén hương đã thắp
  chantingCount: number // Tổng số biến niệm Phật
  meditationMinutes: number // Số phút ngồi thiền
  sutraReadCount: number // Số bài kinh đã đọc
  treeWatered?: boolean // Đã tưới cây Bồ Đề
  dharmaRead?: boolean // Đã đọc Pháp thoại hôm nay
  prayersCount?: number // Số lời nguyện cầu an
  meritDedication?: string // Lời hồi hướng công đức trong ngày
}

export interface MeditationConfig {
  durationMinutes: number
  ambientSound: 'silence' | 'rain' | 'stream' | 'temple_bell' | 'wind'
  guidanceVoice: boolean
  bellIntervalMinutes?: number
}

export interface SutraDetail {
  id: string
  title: string
  transliterationTitle?: string
  category: 'daily' | 'repentance' | 'mahayana' | 'mantra'
  summary: string
  estimatedMinutes: number
  paragraphs: Array<{
    heading?: string
    lines: string[]
    note?: string
  }>
}

export interface DharmaQuote {
  id: number
  quote: string
  source: string
  author?: string
  category: 'peace' | 'compassion' | 'letting_go' | 'karma' | 'mindfulness'
}

export interface MantraOption {
  id: string
  name: string
  sanskrit?: string
  description: string
  color: string
}


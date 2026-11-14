import { PROFANITY_WORDS, SPAM_KEYWORDS, URL_REGEX, PHONE_REGEX } from '~/data/badwords'

interface ModerationResult {
  isValid: boolean
  cleaned: string
  error?: string
}

interface RateLimitResult {
  allowed: boolean
  remainingSeconds?: number
}

// Lưu trữ lịch sử gửi để kiểm tra rate limit
const submissionTimestamps: Record<string, number[]> = {}

export function useModeration() {
  /**
   * Chuẩn hóa và kiểm duyệt nội dung lời cầu an, tên cá, hoa đăng
   */
  function sanitize(text: string): ModerationResult {
    const raw = (text || '').trim()
    if (!raw) {
      return { isValid: false, cleaned: '', error: 'Xin nhập nội dung.' }
    }

    if (raw.length > 250) {
      return { isValid: false, cleaned: '', error: 'Nội dung tối đa 250 ký tự.' }
    }

    // 1. Kiểm tra URL quảng cáo / lừa đảo
    if (URL_REGEX.test(raw)) {
      return {
        isValid: false,
        cleaned: '',
        error: 'Nơi tôn nghiêm xin vui lòng không chèn liên kết trang web hay quảng cáo.'
      }
    }

    // 2. Kiểm tra số điện thoại spam
    if (PHONE_REGEX.test(raw)) {
      return {
        isValid: false,
        cleaned: '',
        error: 'Vui lòng không để lại số điện thoại để bảo mật thông tin cá nhân.'
      }
    }

    // 3. Kiểm tra từ khóa cờ bạc / tín dụng / tệ nạn
    const lower = raw.toLowerCase()
    for (const kw of SPAM_KEYWORDS) {
      if (lower.includes(kw)) {
        return {
          isValid: false,
          cleaned: '',
          error: 'Nội dung chứa từ khóa không phù hợp với chốn thanh tịnh thiền môn.'
        }
      }
    }

    // 4. Lọc từ ngữ thô tục (thay bằng hoa sen 🪷)
    let cleaned = raw
    let hasProfanity = false

    for (const word of PROFANITY_WORDS) {
      const reg = new RegExp(`\\b${word}\\b|${word}`, 'gi')
      if (reg.test(cleaned)) {
        hasProfanity = true
        cleaned = cleaned.replace(reg, '🪷')
      }
    }

    // Nếu toàn bộ câu chỉ là từ chửi thề
    if (cleaned.replace(/🪷|\s/g, '').length === 0 && hasProfanity) {
      return {
        isValid: false,
        cleaned: '',
        error: 'Xin giữ lòng thanh tịnh và dùng lời nói ái ngữ nơi thiền tự.'
      }
    }

    return {
      isValid: true,
      cleaned
    }
  }

  /**
   * Giới hạn tần suất gửi (Rate limit): tối đa 3 lần trong 5 phút
   */
  function checkRateLimit(action: string, maxAllowed = 3, windowSeconds = 300): RateLimitResult {
    if (!import.meta.client) return { allowed: true }

    const now = Date.now()
    if (!submissionTimestamps[action]) {
      submissionTimestamps[action] = []
    }

    // Lọc các lần gửi còn trong khung thời gian
    const cutoff = now - windowSeconds * 1000
    submissionTimestamps[action] = submissionTimestamps[action].filter((t) => t > cutoff)

    if (submissionTimestamps[action].length >= maxAllowed) {
      const oldest = submissionTimestamps[action][0]
      const remainingSeconds = Math.ceil((oldest + windowSeconds * 1000 - now) / 1000)
      return {
        allowed: false,
        remainingSeconds: Math.max(1, remainingSeconds)
      }
    }

    submissionTimestamps[action].push(now)
    return { allowed: true }
  }

  return {
    sanitize,
    checkRateLimit
  }
}


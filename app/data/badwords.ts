/**
 * Danh sách từ ngữ nhạy cảm, thô tục và từ khóa cấm nhằm bảo vệ sự tôn nghiêm chốn thiền môn.
 */

export const PROFANITY_WORDS = [
  'địt', 'đụ', 'đéo', 'lồn', 'cặc', 'buồi', 'đĩ', 'chó chết', 'mẹ kiếp',
  'khốn nạn', 'chết tiệt', 'ngu lol', 'óc chó', 'thằng chó', 'đồ chó',
  'bitch', 'fuck', 'shit', 'asshole', 'bastard', 'cunt', 'dick'
]

export const SPAM_KEYWORDS = [
  'đánh bạc', 'tài xỉu', 'cá độ', 'lô đề', 'soi cầu', 'ku bet', 'thabet',
  'cho vay', 'vay tiền', 'tín dụng đen', 'đáo hạn', 'lãi suất thấp',
  'mua bán acc', 'nạp thẻ', 'hack game', 'gái gọi', 'massage a-z'
]

export const URL_REGEX = /(https?:\/\/|www\.|t\.me\/|zalo\.me\/|bit\.ly\/|tinyurl\.com\/)/i

export const PHONE_REGEX = /(0[35789]\d{8}|0[35789][\s.-]?\d{3}[\s.-]?\d{4}|\+84[\s.-]?\d{9})/


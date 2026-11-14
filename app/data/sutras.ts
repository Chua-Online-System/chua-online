export interface Sutra {
  id: string
  ten: string
  mota: string
  nhip: number // mili-giây mỗi câu (nhịp mõ)
  cau: string[]
}

export interface DetailedSutra {
  id: string
  title: string
  subtitle?: string
  category: 'mantra' | 'daily' | 'repentance' | 'mahayana'
  summary: string
  estimatedMinutes: number
  paragraphs: Array<{
    heading?: string
    lines: string[]
    note?: string
  }>
}

/**
 * Các bài kinh/chú truyền thống (phổ biến trong nghi thức tụng niệm).
 * Trình bày dạng từng câu để chạy chữ theo nhịp mõ trong SutraChanting.
 */
export const SUTRAS: Sutra[] = [
  {
    id: 'niem-phat',
    ten: 'Niệm Phật A Di Đà',
    mota: 'Nhất tâm xưng niệm hồng danh Đức Phật A Di Đà.',
    nhip: 2000,
    cau: [
      'Nam Mô A Di Đà Phật',
      'Nam Mô A Di Đà Phật',
      'Nam Mô A Di Đà Phật',
      'Nam Mô A Di Đà Phật',
      'Nam Mô A Di Đà Phật',
      'Nam Mô A Di Đà Phật'
    ]
  },
  {
    id: 'quan-am',
    ten: 'Niệm Quán Thế Âm',
    mota: 'Xưng niệm danh hiệu Bồ Tát Quán Thế Âm, cầu bình an.',
    nhip: 2200,
    cau: [
      'Nam Mô Đại Từ Đại Bi',
      'Cứu khổ cứu nạn',
      'Quán Thế Âm Bồ Tát',
      'Nam Mô Quán Thế Âm Bồ Tát',
      'Nam Mô Quán Thế Âm Bồ Tát',
      'Nam Mô Quán Thế Âm Bồ Tát'
    ]
  },
  {
    id: 'vang-sanh',
    ten: 'Chú Vãng Sanh',
    mota: 'Vãng sanh Tịnh độ thần chú (Bạt nhất thiết nghiệp chướng…).',
    nhip: 2400,
    cau: [
      'Nam mô a di đa bà dạ',
      'Đa tha già đa dạ',
      'Đa địa dạ tha',
      'A di rị đô bà tỳ',
      'A di rị đa, tất đam bà tỳ',
      'A di rị đa, tỳ ca lan đế',
      'A di rị đa, tỳ ca lan đa',
      'Già di nị, già già na',
      'Chỉ đa ca lệ, ta bà ha'
    ]
  },
  {
    id: 'tam-kinh',
    ten: 'Bát Nhã Tâm Kinh',
    mota: 'Tinh yếu trí tuệ Bát Nhã Ba La Mật Đa (trích lược).',
    nhip: 3000,
    cau: [
      'Quán Tự Tại Bồ Tát,',
      'hành thâm Bát Nhã Ba La Mật Đa thời,',
      'chiếu kiến ngũ uẩn giai không,',
      'độ nhất thiết khổ ách.',
      'Xá Lợi Tử! Sắc bất dị không,',
      'không bất dị sắc;',
      'sắc tức thị không, không tức thị sắc.',
      'Thọ, tưởng, hành, thức diệc phục như thị.',
      'Yết đế, yết đế, ba la yết đế,',
      'ba la tăng yết đế, bồ đề tát bà ha.'
    ]
  }
]

/**
 * Thư viện kinh điển toàn văn chuyên sâu cho chức năng Đọc Kinh (SutraReader).
 */
export const DETAILED_SUTRAS: DetailedSutra[] = [
  {
    id: 'dai-bi-tam-da-ra-ni',
    title: 'Chú Đại Bi (Thiên Thủ Thiên Nhãn Đà La Ni)',
    subtitle: 'Nghi thức thần chú gia trì từ bi vô lượng của Bồ Tát Quán Thế Âm',
    category: 'mantra',
    summary: 'Bài chú linh ứng với 84 câu hiển lộ 84 hóa thân cứu khổ ban vui của Bồ Tát Quán Thế Âm, giúp thanh lọc tâm ý và tiêu trừ nghiệp chướng.',
    estimatedMinutes: 5,
    paragraphs: [
      {
        heading: 'Nguyện Hương & Phát Nguyện',
        lines: [
          'Nam mô Đại Bi Quán Thế Âm Bồ Tát (3 lần)',
          'Nguyện con sớm biết tất cả pháp,',
          'Nguyện con sớm được mắt trí tuệ,',
          'Nguyện con sớm độ muôn loài chúng,',
          'Nguyện con sớm được phương tiện lành,',
          'Nguyện con sớm ngồi thuyền Bát Nhã,',
          'Nguyện con sớm vượt biển khổ đau,',
          'Nguyện con sớm được giới định đạo,',
          'Nguyện con sớm lên núi Niết Bàn,',
          'Nguyện con sớm về nhà vô vi,',
          'Nguyện con sớm đồng thân pháp tánh.'
        ]
      },
      {
        heading: 'Chánh Văn Thần Chú (84 Câu)',
        lines: [
          '1. Nam mô hắc ra đát na, đa ra dạ da',
          '2. Nam mô a rị da',
          '3. Bà lô kiết đế, thước bát ra da',
          '4. Bồ Đề tát đỏa bà da',
          '5. Ma ha tát đỏa bà da',
          '6. Ma ha ca lô ni ca da',
          '7. Án, tát bàn ra phạt duệ',
          '8. Số đát na đát tỏa',
          '9. Nam mô tất kiết lật đỏa y mông a rị da',
          '10. Bà lô kiết đế thất Phật ra lăng đà bà',
          '11. Nam mô na ra cẩn trì',
          '12. Hê rị ma ha bàn đa sa mế',
          '13. Tát bà a tha đậu du bằng',
          '14. A thệ dựng',
          '15. Tát bà tát đa, na ma bà tát đa, na ma bà già',
          '16. Ma phạt đạt đậu',
          '17. Đát điệt tha: Án, a bà lô hê',
          '18. Lô ca đế',
          '19. Ca ra đế',
          '20. Di hê rị',
          '21. Ma ha bồ đề tát đỏa',
          '22. Tát bà tát bà',
          '23. Ma ra ma ra',
          '24. Ma hê ma hê, rị đà dựng',
          '25. Cu lô cu lô kiết mông',
          '26. Độ lô độ lô phạt xà da đế',
          '27. Ma ha phạt xà da đế',
          '28. Đà ra đà ra',
          '29. Địa rị ni',
          '30. Thất Phật ra da',
          '31. Giá ra giá ra',
          '32. Mạ mạ phạt ma ra',
          '33. Mục đế lệ',
          '34. Y hê di hê',
          '35. Thất na thất na',
          '36. A ra sâm, Phật ra xá lợi',
          '37. Phạt sa phạt sâm',
          '38. Phật ra xá da',
          '39. Hô lô hô lô ma ra',
          '40. Hô lô hô lô hê rị',
          '41. Ta ra ta ra',
          '42. Tất rị tất rị',
          '43. Tô rô tô rô',
          '44. Bồ Đề dạ, bồ đề dạ',
          '45. Bồ đà dạ, bồ đà dạ',
          '46. Di đế rị dạ',
          '47. Na ra cẩn trì',
          '48. Địa rị sắc ni na',
          '49. Ba dạ ma na',
          '50. Ta bà ha',
          '51. Tất đà dạ',
          '52. Ta bà ha',
          '53. Ma ha tất đà dạ',
          '54. Ta bà ha',
          '55. Tất đà dũ nghệ',
          '56. Thất bàn ra dạ',
          '57. Ta bà ha',
          '58. Na ra cẩn trì',
          '59. Ta bà ha',
          '60. Ma ra na ra',
          '61. Ta bà ha',
          '62. Tất ra tăng, a mục khư da',
          '63. Ta bà ha',
          '64. Ta bà ma ha, a tất đà dạ',
          '65. Ta bà ha',
          '66. Giả kiết ra, a tất đà dạ',
          '67. Ta bà ha',
          '68. Ba đà ma yết tất đà dạ',
          '69. Ta bà ha',
          '70. Na ra cẩn trì, bàn đà ra dạ',
          '71. Ta bà ha',
          '72. Ma bà lị thắng yết ra dạ',
          '73. Ta bà ha',
          '74. Nam mô hắc ra đát na, đa ra dạ da',
          '75. Nam mô a rị da',
          '76. Bà lô kiết đế',
          '77. Thước bàn ra dạ',
          '78. Ta bà ha',
          '79. Án, tất điện đô',
          '80. Mạn đà ra',
          '81. Bạt đà da',
          '82. Ta bà ha.',
          '83. Án, tất điện đô',
          '84. Mạn đà ra bạt đà da, ta bà ha.'
        ]
      }
    ]
  },
  {
    id: 'bat-nha-tam-kinh-toan-van',
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh',
    subtitle: 'Tinh túy của Tuệ giác Bát Nhã soi chiếu Vô ngã và Chân không diệu hữu',
    category: 'mahayana',
    summary: 'Bộ kinh cốt tủy của Phật giáo Đại thừa, chỉ rõ bản chất các pháp là KHÔNG (duyên sinh vô ngã), vượt thoát mọi lo sợ và khổ ải.',
    estimatedMinutes: 4,
    paragraphs: [
      {
        heading: 'Chánh Văn Bản Dịch Hán Việt',
        lines: [
          'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
          'Xá Lợi Tử! Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc; thọ, tưởng, hành, thức diệc phục như thị.',
          'Xá Lợi Tử! Thị chư pháp không tướng: bất sanh, bất diệt, bất cấu, bất tịnh, bất tăng, bất giảm.',
          'Thị cố không trung vô sắc, vô thọ, tưởng, hành, thức; vô nhãn, nhĩ, tỷ, thiệt, thân, ý; vô sắc, thanh, hương, vị, xúc, pháp; vô nhãn giới nãi chí vô ý thức giới;',
          'vô vô minh diệc, vô vô minh tận, nãi chí vô lão tử, diệc vô lão tử tận; vô Khổ, Tập, Diệt, Đạo; vô trí diệc vô đắc.',
          'Dĩ vô sở đắc cố, Bồ Đề tát đỏa y Bát Nhã Ba La Mật Đa cố, tâm vô quái ngại; vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.',
          'Tam thế chư Phật y Bát Nhã Ba La Mật Đa cố, đắc A Nậu Đa La Tam Miệu Tam Bồ Đề.',
          'Cố tri Bát Nhã Ba La Mật Đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.',
          'Cố thuyết Bát Nhã Ba La Mật Đa chú, tức thuyết chú viết:',
          'Yết đế, yết đế, ba la yết đế, ba la tăng yết đế, bồ đề tát bà ha. (3 lần)'
        ]
      }
    ]
  },
  {
    id: 'chu-duoc-su',
    title: 'Dược Sư Quán Đảnh Chân Ngôn',
    subtitle: 'Cầu an, tiêu trừ bệnh tật, thân tâm an lạc',
    category: 'mantra',
    summary: 'Thần chú của Đức Phật Dược Sư Lưu Ly Quang Vương Như Lai, ban rải năng lượng an lành giải trừ khổ nạn thân tâm.',
    estimatedMinutes: 3,
    paragraphs: [
      {
        heading: 'Chánh Văn Thần Chú',
        lines: [
          'Nam mô bạc già phạt đế, bệ sát xã, lũ lô thích lưu ly,',
          'bát lạt bà, hắt ra xà dã,',
          'đát tha yết đa da, a ra ha đế, tam miệu tam bột đà da.',
          'Đát điệt tha: Án,',
          'bệ sát thệ, bệ sát thệ, bệ sát xã,',
          'tam một yết đế tát ha. (Tụng 7 biến hoặc 21 biến)'
        ]
      }
    ]
  },
  {
    id: 'sam-hoi-hong-danh',
    title: 'Kinh Sám Hối Hồng Danh (Trích yếu)',
    subtitle: 'Nghi thức sám trừ ba nghiệp thân - miệng - ý',
    category: 'repentance',
    summary: 'Bài sám nguyện xưng tán công đức Phật và chân thành sám hối mọi lỗi lầm, đưa tâm về nẻo thiện thanh tịnh.',
    estimatedMinutes: 6,
    paragraphs: [
      {
        heading: 'Lời Sám Nguyện',
        lines: [
          'Đệ tử hôm nay quỳ trước Phật đài,',
          'Thành tâm sám hối tội lỗi từ xưa.',
          'Do lòng tham lam, sân hận, si mê,',
          'Gây nên lỗi lầm từ thân miệng ý.',
          'Hôm nay một lòng chí thành quy mạng,',
          'Cầu xin chư Phật từ bi gia hộ,',
          'Cho tiêu tội chướng, dứt trừ nghiệp duyên,',
          'Tâm bồ đề kiên cố không thoái chuyển.',
          'Nam mô Cầu Sám Hối Bồ Tát Ma Ha Tát (3 lần)'
        ]
      }
    ]
  }
]

/** 学校 research科条目 id → 列表/卡片用简称（与 MentorPage 相关导师一致） */
export const SCHOOL_SHORT_NAMES = {
  'todai-bunkei': '东大人文',
  'todai-sogo': '东大综文',
  hitotsubashi: '一桥',
  waseda: '早大',
}

export function getSchoolShortName(id) {
  return SCHOOL_SHORT_NAMES[id] ?? id
}

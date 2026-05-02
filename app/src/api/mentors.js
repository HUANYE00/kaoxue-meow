import mentorsData from '../data/mentors.json'

/** 旧数据或书签可能仍使用 hit-u，查询时归一到 schools.json 的 id */
function normalizeSchoolQueryId(schoolId) {
  if (schoolId === 'hit-u') return 'hitotsubashi'
  return schoolId
}

export async function getMentors() {
  return mentorsData
}

export async function getMentorById(id) {
  return mentorsData.find((m) => m.id === id) ?? null
}

export async function getMentorsBySchoolId(schoolId) {
  const id = normalizeSchoolQueryId(schoolId)
  return mentorsData.filter((m) => m.school_id === id)
}

export async function getMentorsByIds(ids) {
  const set = new Set(ids)
  return mentorsData.filter((m) => set.has(m.id))
}


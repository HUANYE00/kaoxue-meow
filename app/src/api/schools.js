import schoolsData from '../data/schools.json'

export async function getSchools() {
  return schoolsData
}

export async function getSchoolById(id) {
  return schoolsData.find((s) => s.id === id) ?? null
}


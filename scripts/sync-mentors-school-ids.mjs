/**
 * 将 Perplexity / 旧版 mentors.json 中的 school_id 对齐到 schools.json 的 id。
 * 规则：utokyo → 按 faculty_zh 分流人文社会系 / 総合文化；hit-u → hitotsubashi。
 * 同步写入：仓库根目录 data/mentors.json 与 app/src/data/mentors.json。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const CANONICAL = new Set([
  'todai-bunkei',
  'todai-sogo',
  'hitotsubashi',
  'waseda',
])

const CHANGELOG_LINE =
  '2026-05-02: school_id 对齐 schools.json（旧 utokyo/hit-u 已映射为 canonical id）'

function mapSchoolId(m) {
  const sid = m.school_id
  if (CANONICAL.has(sid)) return sid

  if (sid === 'hit-u') return 'hitotsubashi'

  if (sid === 'waseda') return 'waseda'

  if (sid === 'utokyo') {
    const f = String(m.faculty_zh ?? '')
    if (f.includes('人文社会系')) return 'todai-bunkei'
    if (f.includes('総合文化')) return 'todai-sogo'
    throw new Error(
      `无法映射 utokyo 导师 ${m.id}：faculty_zh="${m.faculty_zh}"`,
    )
  }

  throw new Error(`未知 school_id "${sid}"（导师 ${m.id}）`)
}

function main() {
  const src = path.join(root, 'data/mentors.json')
  const raw = JSON.parse(fs.readFileSync(src, 'utf8'))
  if (!Array.isArray(raw)) throw new Error('mentors.json 应为数组')

  const out = raw.map((m) => {
    const newSid = mapSchoolId(m)
    if (newSid === m.school_id) return m
    const changelog = [...(m.changelog ?? []), CHANGELOG_LINE]
    return { ...m, school_id: newSid, changelog }
  })

  const json = JSON.stringify(out, null, 2) + '\n'
  fs.writeFileSync(src, json)
  fs.writeFileSync(path.join(root, 'app/src/data/mentors.json'), json)
  console.log(`已写入 ${out.length} 条导师 → data/mentors.json 与 app/src/data/mentors.json`)
}

main()

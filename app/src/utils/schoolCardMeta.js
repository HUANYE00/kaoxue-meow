import {
  getSeasonDdl,
  seasonIsListedForUi,
} from './schools.js'

/** 未在数据中写 `region` 时的默认（本站当前条目均在关东） */
const REGION_FALLBACK = {
  'todai-bunkei': '关东',
  'todai-sogo': '关东',
  hitotsubashi: '关东',
  waseda: '关东',
}

const OUEN_RE = /出愿|願書|书类提交|書類|书留|郵送/

function hasBoshuPdfUrl(school) {
  for (const key of ['summer', 'winter']) {
    const se = school.seasons?.[key]
    if (!seasonIsListedForUi(se)) continue
    const u = se?.boshu_pdf_url
    if (typeof u === 'string' && u.trim().length > 0) return true
  }
  return false
}

function pickHighlightDdl(school) {
  const order =
    school.activeSeason === 'winter' ? ['winter', 'summer'] : ['summer', 'winter']
  for (const key of order) {
    const season = school.seasons?.[key]
    if (!seasonIsListedForUi(season)) continue
    const items = getSeasonDdl(season)
    const hit = items.find((i) => OUEN_RE.test(String(i.event ?? '')))
    const pick = hit ?? items[0]
    if (pick) {
      return {
        seasonLabel: key === 'summer' ? '夏季' : '冬季',
        event: pick.event,
        when: pick.displayText || pick.date || '',
      }
    }
  }
  return null
}

/**
 * 首页研究科卡片：地区、专攻大类、出愿周期、募集要项 PDF 标记。
 */
export function getSchoolCardMeta(school) {
  const region = school.region ?? REGION_FALLBACK[school.id] ?? '—'
  const broadField = school.broad_field ?? '社会学'

  const ddl = pickHighlightDdl(school)
  const ouenCycleLine = ddl
    ? `出愿·周期：${ddl.when}`
    : '出愿·周期：整理中'

  const boshuReady = hasBoshuPdfUrl(school)

  return {
    region,
    broadField,
    ouenCycleLine,
    boshuReady,
  }
}

function tryParseISODate(dateStr) {
  if (typeof dateStr !== 'string') return null
  const iso = /^\d{4}-\d{2}-\d{2}$/
  if (!iso.test(dateStr)) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d
}

/** 新 schema：`ddl`；兼容旧字段 `deadlines` */
export function getSeasonDdl(season) {
  if (!season) return []
  const raw = season.ddl ?? season.deadlines
  return Array.isArray(raw) ? raw : []
}

/**
 * 季节是否在 UI 中展示（非 inactive）。
 * 新 schema：`verified` | `pending` | `inactive`；旧：`active` | `inactive`
 */
export function seasonIsListedForUi(season) {
  if (!season) return false
  const st = season.status
  if (st === 'inactive') return false
  return true
}

/** `materials` 可为数组或 `"same_as_summer"` */
export function resolveSeasonMaterials(season, summerSeason) {
  const m = season?.materials
  if (m === 'same_as_summer') {
    const sm = summerSeason?.materials
    return Array.isArray(sm) ? sm : []
  }
  if (Array.isArray(m)) return m
  return []
}

export function getDaysUntil(dateStr, now = new Date()) {
  const d = tryParseISODate(dateStr)
  if (!d) return null
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  )
  const diffMs = d.getTime() - startOfToday.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function pickNearestISODateFromSchools(schools) {
  let best = null
  for (const s of schools) {
    for (const seasonKey of ['summer', 'winter']) {
      const season = s.seasons?.[seasonKey]
      if (!seasonIsListedForUi(season)) continue
      const ddlItems = getSeasonDdl(season)
      for (const item of ddlItems) {
        const dateStr = item.date
        if (typeof dateStr !== 'string') continue
        const days = getDaysUntil(dateStr)
        if (days == null) continue
        if (best == null || days < best.days) {
          best = {
            schoolId: s.id,
            season: seasonKey,
            event: item.event,
            date: dateStr,
            days,
          }
        }
      }
    }
  }
  return best
}

export function getSchoolVerificationSummary(school) {
  const seasons = school?.seasons ?? {}
  const keys = ['summer', 'winter'].filter((k) =>
    seasonIsListedForUi(seasons[k]),
  )
  if (keys.length === 0) return { label: '—', tone: 'muted' }

  const items = keys.flatMap((k) => getSeasonDdl(seasons[k]))
  if (items.length === 0) return { label: '待补齐', tone: 'warn' }

  const verifiedCount = items.filter((i) => i.dataStatus === 'verified').length
  const uncertainCount = items.filter((i) => i.dataStatus !== 'verified').length

  if (verifiedCount > 0 && uncertainCount === 0)
    return { label: '✅ 已核验（DDL抽样）', tone: 'ok' }
  if (verifiedCount > 0 && uncertainCount > 0)
    return { label: '✅/⚠️ 部分核验', tone: 'mixed' }
  return { label: '⚠️ 待核验', tone: 'warn' }
}

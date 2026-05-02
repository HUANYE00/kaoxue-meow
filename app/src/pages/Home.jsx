import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSchools } from '../api/schools.js'
import {
  pickNearestISODateFromSchools,
  seasonIsListedForUi,
} from '../utils/schools.js'

function SeasonPills({ seasons }) {
  const summer = seasons?.summer
  const winter = seasons?.winter
  const items = []
  if (seasonIsListedForUi(summer))
    items.push({ key: 'summer', label: '夏季入试' })
  if (seasonIsListedForUi(winter))
    items.push({ key: 'winter', label: '冬季入试' })

  if (items.length === 0) {
    return (
      <span className="text-xs text-black/45">当季：—</span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it.key}
          className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-black/70"
        >
          {it.label}
        </span>
      ))}
    </div>
  )
}

function SchoolCard({ school }) {
  return (
    <Link
      to={`/school/${school.id}`}
      className="block rounded-xl border border-black/5 bg-white p-5 shadow-sm hover:shadow transition"
    >
      <div className="text-sm text-black/60">{school.name}</div>
      <div className="mt-1 text-lg font-semibold text-brand-text">
        {school.department}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SeasonPills seasons={school.seasons} />
      </div>
      <div className="mt-1 text-sm text-black/60">校区：{school.campus}</div>
      <div className="mt-4 text-sm text-brand-primary">查看出愿日程与材料 →</div>
    </Link>
  )
}

export function Home() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const nearest = useMemo(
    () => (schools.length ? pickNearestISODateFromSchools(schools) : null),
    [schools],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSchools()
      .then((data) => {
        if (!cancelled) setSchools(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSchools = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return schools
    return schools.filter((s) => {
      const hay = `${s.name} ${s.department} ${s.campus}`.toLowerCase()
      return hay.includes(t)
    })
  }, [schools, q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-text">考学喵</h1>
        <p className="mt-2 text-sm text-black/70 leading-relaxed max-w-2xl">
          面向<strong>日本大学院社会学方向修士</strong>申请者：整理各校研究科的
          <strong>出愿截止与考试节点</strong>、<strong>材料清单要点</strong>与
          <strong>官网入口</strong>；部分学校附<strong>精选导师参考</strong>（证据来自官网摘要）。
          本站不替代募集要项原文，请以 PDF 为准。
        </p>
      </div>

      <section
        id="schools"
        className="rounded-xl border border-black/5 bg-white p-4 shadow-sm"
      >
        <div className="text-sm font-medium text-brand-text">在本页选校</div>
        <p className="mt-1 text-xs text-black/55">
          下方卡片即各校研究科入口；点进去可看日程、材料与链接。可用搜索缩小范围。
        </p>
        <label className="mt-3 block">
          <span className="sr-only">搜索学校或研究科</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索学校名、研究科、校区…"
            className="mt-1 w-full max-w-md rounded-lg border border-black/10 bg-brand-bg px-3 py-2 text-sm text-brand-text placeholder:text-black/40"
          />
        </label>
      </section>

      {!loading && nearest && nearest.days >= 0 ? (
        <div className="rounded-xl border border-black/8 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-black/50">
            近期关键日（有明确日历日的条目）
          </div>
          <div className="mt-1 text-sm text-brand-text">
            <Link
              to={`/school/${nearest.schoolId}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {(() => {
                const s = schools.find((x) => x.id === nearest.schoolId)
                return s ? `${s.name} · ${s.department}` : nearest.schoolId
              })()}
            </Link>
            <span className="text-black/60">
              {' · '}
              {nearest.season === 'summer' ? '夏季' : '冬季'}
            </span>
          </div>
          <div className="mt-2 text-sm text-black/80">{nearest.event}</div>
          <div className="mt-1 text-xs text-black/55">
            {nearest.date} · 距今约{' '}
            <span className="font-semibold text-brand-text">{nearest.days}</span>{' '}
            天
          </div>
          <p className="mt-2 text-xs leading-relaxed text-black/50">
            仅用于提醒「还有多久到这一条」；若官网写的是区间或「详见要项」，请以要项原文为准。
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-black/60">加载中…</div>
      ) : filteredSchools.length === 0 ? (
        <div className="rounded-lg border border-black/5 bg-white p-6 text-sm text-black/60">
          没有匹配的学校，请换个关键词再试。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchools.map((s) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </div>
      )}
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MiniCalendar } from '../components/ui/MiniCalendar.jsx'
import { PageShell } from '../components/layout/PageShell.jsx'
import { getSchools } from '../api/schools.js'
import {
  pickNearestISODateFromSchools,
  seasonIsListedForUi,
} from '../utils/schools.js'
import { getSchoolCardMeta } from '../utils/schoolCardMeta.js'
import { getSchoolShortName } from '../utils/schoolLabels.js'

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

const CARD_ACCENTS = [
  'bg-gradient-to-r from-brand-accent to-emerald-600/80',
  'bg-gradient-to-r from-brand-primary to-amber-400',
  'bg-gradient-to-r from-sky-500 to-indigo-500',
]

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function SchoolCard({ school, index }) {
  const bar = CARD_ACCENTS[index % CARD_ACCENTS.length]
  const meta = getSchoolCardMeta(school)
  const short = getSchoolShortName(school.id)
  const fullLine = `${school.name} · ${school.department}`
  return (
    <Link
      to={`/school/${school.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-black/5 bg-white p-5 pt-6 font-sans shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${bar}`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-medium text-black/70">
          {meta.region}
        </span>
        <span className="rounded-full border border-black/10 bg-brand-bg px-2.5 py-0.5 text-xs font-medium text-brand-text">
          {meta.broadField}
        </span>
        {meta.boshuReady ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
            募集要项✅
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200/70">
            要项链接待核
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-bold leading-tight tracking-tight text-brand-text">
        {short}
      </div>
      <div className="mt-1.5 text-sm font-medium leading-snug text-black/55">
        {fullLine}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeasonPills seasons={school.seasons} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-black/55 line-clamp-2">
        {meta.ouenCycleLine}
      </p>
      <div className="mt-4 inline-flex items-center rounded-full bg-brand-primary px-3 py-1.5 text-sm font-semibold text-brand-text transition group-hover:opacity-90">
        出愿与材料 →
      </div>
    </Link>
  )
}

const SCOPES = [
  { id: 'mentor', label: '导师' },
  { id: 'school', label: '学校·研究科' },
  { id: 'tag', label: '标签' },
]

function scopePlaceholder(scope) {
  if (scope === 'school') return '学校名、研究科、简称如东大人文…'
  if (scope === 'tag') return '标签或关键词，如 Gender、社会福祉…'
  return '导师姓名、研究方向、学校名…'
}

export function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState('mentor')
  const [query, setQuery] = useState('')

  const sqFromUrl = searchParams.get('sq') ?? ''

  useEffect(() => {
    if (sqFromUrl) {
      setScope('school')
      setQuery(sqFromUrl)
    }
  }, [sqFromUrl])

  useEffect(() => {
    if (!sqFromUrl || typeof window === 'undefined') return
    if (window.location.hash !== '#schools') return
    const id = window.requestAnimationFrame(() => {
      document.getElementById('schools')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(id)
  }, [sqFromUrl])

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
    const t = sqFromUrl.trim().toLowerCase()
    if (!t) return schools
    return schools.filter((s) => {
      const meta = getSchoolCardMeta(s)
      const short = getSchoolShortName(s.id)
      const hay =
        `${s.name} ${s.department} ${short} ${meta.region} ${meta.broadField} ${meta.ouenCycleLine}`.toLowerCase()
      return hay.includes(t)
    })
  }, [schools, sqFromUrl])

  const uniCount = useMemo(
    () => new Set(schools.map((s) => s.name)).size,
    [schools],
  )

  function submitSearch(e) {
    e.preventDefault()
    const t = query.trim()
    if (scope === 'mentor') {
      navigate(t ? `/mentors?q=${encodeURIComponent(t)}` : '/mentors')
      return
    }
    if (scope === 'school') {
      if (t) {
        navigate({
          pathname: '/',
          search: `?sq=${encodeURIComponent(t)}`,
          hash: '#schools',
        })
      } else {
        navigate({ pathname: '/', hash: '#schools' })
      }
      return
    }
    if (scope === 'tag') {
      navigate(
        t
          ? `/mentors?q=${encodeURIComponent(t)}&mode=tag`
          : '/mentors?mode=tag',
      )
    }
  }

  return (
    <PageShell className="space-y-10 pb-12 pt-8 md:space-y-14 md:pb-16 md:pt-10">
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-6">
        <div className="flex min-h-0 min-w-0 flex-col justify-center md:min-h-[220px]">
          <h1 className="text-center font-serif text-[1.85rem] font-semibold leading-[1.4] tracking-[0.08em] text-brand-text sm:text-4xl md:text-left md:text-[2.35rem] md:leading-[1.38] md:tracking-[0.1em]">
            考学一路顺风
          </h1>
        </div>

        <div className="min-w-0">
          <MiniCalendar className="mx-auto h-full md:mx-0" />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col justify-center md:min-h-[220px]">
          <form onSubmit={submitSearch} className="w-full space-y-3">
            <div
              className="flex w-full rounded-full bg-black/[0.06] p-0.5 text-[11px] font-semibold sm:text-xs"
              role="tablist"
              aria-label="搜索范围"
            >
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={scope === s.id}
                  onClick={() => setScope(s.id)}
                  className={[
                    'min-w-0 flex-1 rounded-full px-1.5 py-2 transition sm:px-2',
                    scope === s.id
                      ? 'bg-white text-brand-text shadow-sm ring-1 ring-black/10'
                      : 'text-black/55 hover:text-brand-text',
                  ].join(' ')}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className="block w-full">
              <span className="sr-only">{scopePlaceholder(scope)}</span>
              <div className="flex w-full items-center gap-1 rounded-full border border-black/10 bg-white py-1 pl-4 pr-1 shadow-sm ring-1 ring-black/[0.03]">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={scopePlaceholder(scope)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-brand-text placeholder:text-black/40 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  aria-label="搜索"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:opacity-90"
                >
                  <SearchIcon />
                </button>
              </div>
            </label>
            <p className="text-center text-xs leading-relaxed text-black/50 md:text-left">
              {scope === 'mentor' && '支持姓名、方向、学校与简称等，与导师列表检索一致。'}
              {scope === 'school' &&
                '在本页筛选研究科卡片；可搜学校名、研究科名或东大人文等简称。'}
              {scope === 'tag' &&
                '仅匹配导师的主要方向、相关标签与关键词（不含姓名）。'}
              {schools.length > 0 ? (
                <span className="mt-1 block text-black/40">
                  {uniCount} 所院校 · {schools.length} 条研究科
                </span>
              ) : null}
            </p>
          </form>
        </div>
      </section>

      {!loading && nearest && nearest.days >= 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-md ring-1 ring-black/[0.04]">
          <div className="text-xs font-semibold text-black/45">
            近期关键日
          </div>
          <div className="mt-2 text-sm text-brand-text">
            <Link
              to={`/school/${nearest.schoolId}`}
              className="font-semibold text-brand-text no-underline hover:underline hover:text-brand-primary"
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
            <span className="font-bold text-brand-text">{nearest.days}</span> 天
          </div>
          <p className="mt-3 text-xs leading-relaxed text-black/50">
            仅作日程提醒；区间或「详见要项」类表述请以要项原文为准。
          </p>
          <div className="mt-4">
            <Link
              to={`/school/${nearest.schoolId}`}
              className="inline-flex items-center justify-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-text no-underline shadow-sm transition hover:opacity-90"
            >
              前往对应研究科 →
            </Link>
          </div>
        </div>
      ) : null}

      <section id="schools" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-brand-text">研究科条目</h2>
          {sqFromUrl ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                navigate({ pathname: '/' })
              }}
              className="text-xs font-medium text-brand-primary no-underline hover:underline"
            >
              清除筛选
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="text-sm text-black/60">加载中…</div>
        ) : filteredSchools.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-sm text-black/60 shadow-sm">
            {sqFromUrl
              ? '没有匹配的研究科，请换个关键词或清除筛选。'
              : '暂无研究科数据。'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {filteredSchools.map((s, i) => (
              <SchoolCard key={s.id} school={s} index={i} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

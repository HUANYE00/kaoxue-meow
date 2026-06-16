import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell.jsx'
import { getMentors } from '../api/mentors.js'
import { getSchools } from '../api/schools.js'
import { getSchoolShortName } from '../utils/schoolLabels.js'

function schoolNameMap(schools) {
  const m = new Map()
  for (const s of schools) m.set(s.id, `${s.name} · ${s.department}`)
  return m
}

const CARD_ACCENTS = [
  'bg-gradient-to-r from-brand-accent to-emerald-600/75',
  'bg-gradient-to-r from-brand-primary to-amber-400',
  'bg-gradient-to-r from-sky-500 to-indigo-500',
  'bg-gradient-to-r from-violet-500 to-fuchsia-500/80',
]

export function MentorsBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mentors, setMentors] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')

  const modeTag = searchParams.get('mode') === 'tag'
  const tagFilter = searchParams.get('tag') ?? ''

  useEffect(() => {
    const fromUrl = searchParams.get('q') ?? ''
    setQ(fromUrl)
  }, [searchParams])

  useEffect(() => {
    let c = false
    setLoading(true)
    Promise.all([getMentors(), getSchools()])
      .then(([ms, ss]) => {
        if (!c) {
          setMentors(ms)
          setSchools(ss)
        }
      })
      .finally(() => {
        if (!c) setLoading(false)
      })
    return () => {
      c = true
    }
  }, [])

  const names = useMemo(() => schoolNameMap(schools), [schools])

  const primaryTags = useMemo(() => {
    const set = new Set()
    for (const m of mentors) {
      if (m.tag_primary && String(m.tag_primary).trim())
        set.add(String(m.tag_primary).trim())
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'base' }),
    )
  }, [mentors])

  const filtered = useMemo(() => {
    let list = mentors
    if (tagFilter) {
      list = list.filter((m) => m.tag_primary === tagFilter)
    }

    const t = q.trim().toLowerCase()
    if (!t) return list

    if (modeTag) {
      return list.filter((m) => {
        const parts = [
          m.tag_primary,
          ...(m.tags_secondary ?? []),
          ...(m.keywords ?? []),
        ]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
        return parts.some((p) => p.includes(t))
      })
    }

    return list.filter((m) => {
      const hay = [
        m.name_zh,
        m.name_ja,
        m.faculty_zh,
        m.tag_primary,
        ...(m.tags_secondary ?? []),
        ...(m.keywords ?? []),
        names.get(m.school_id),
        getSchoolShortName(m.school_id),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(t)
    })
  }, [mentors, q, names, modeTag, tagFilter])

  function setTagInUrl(next) {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (!next) p.delete('tag')
        else p.set('tag', next)
        return p
      },
      { replace: true },
    )
  }

  return (
    <PageShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            按导师查找
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/65">
            卡片浏览；先用标签缩小范围，再用搜索框细搜。支持姓名、学校/研究科、简称与关键词。
            {modeTag ? (
              <span className="mt-1 block text-xs font-medium text-brand-accent">
                当前为「仅标签/关键词」文本模式（URL 含 mode=tag）。
              </span>
            ) : null}
          </p>
        </div>

        {!loading && primaryTags.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-black/45">
              按主要方向筛选
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTagInUrl('')}
                className={[
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                  !tagFilter
                    ? 'bg-black text-white shadow-sm'
                    : 'border border-black/10 bg-white text-black/70 hover:border-black/20 hover:text-brand-text',
                ].join(' ')}
              >
                全部
              </button>
              {primaryTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagInUrl(tag)}
                  className={[
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                    tagFilter === tag
                      ? 'bg-brand-primary text-brand-text shadow-sm ring-2 ring-black/10'
                      : 'border border-black/10 bg-white text-black/75 hover:border-black/20',
                  ].join(' ')}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <label className="block max-w-2xl">
          <span className="sr-only">搜索导师</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const v = e.target.value
              setQ(v)
              setSearchParams(
                (prev) => {
                  const p = new URLSearchParams(prev)
                  if (v.trim()) p.set('q', v)
                  else p.delete('q')
                  return p
                },
                { replace: true },
              )
            }}
            placeholder="姓名、标签、关键词、研究科、学校简称…"
            className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-brand-text shadow-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/35"
          />
        </label>

        {loading ? (
          <div className="text-sm text-black/60">加载中…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-sm text-black/60 shadow-sm">
            没有匹配的导师。试试清除标签筛选或更换关键词。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
            {filtered.map((m, i) => {
              const bar = CARD_ACCENTS[i % CARD_ACCENTS.length]
              return (
                <Link
                  key={m.id}
                  to={`/mentor/${m.id}`}
                  className="group relative flex min-h-[140px] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-5 pt-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${bar}`}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl font-bold tracking-tight text-brand-text group-hover:text-brand-primary">
                        {m.name_zh}
                      </div>
                      <div className="mt-1 text-sm font-medium text-black/55">
                        {getSchoolShortName(m.school_id)}
                      </div>
                    </div>
                    {m.tag_primary ? (
                      <span className="shrink-0 rounded-full bg-black/[0.06] px-2.5 py-1 text-xs font-semibold text-black/75">
                        {m.tag_primary}
                      </span>
                    ) : null}
                  </div>
                  {(m.tags_secondary ?? []).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(m.tags_secondary ?? []).slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-black/[0.08] bg-brand-bg/80 px-2 py-0.5 text-[11px] text-black/60"
                        >
                          {t}
                        </span>
                      ))}
                      {(m.tags_secondary ?? []).length > 4 ? (
                        <span className="text-[11px] text-black/40">
                          +{m.tags_secondary.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <span className="text-xs text-black/45">社会学修士 · 导师参考</span>
                    <span className="text-sm font-semibold text-brand-text group-hover:underline">
                      查看详情 →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <p className="text-sm text-black/55">
          <Link to="/" className="font-medium text-brand-text no-underline hover:underline">
            ← 返回首页
          </Link>
        </p>
      </div>
    </PageShell>
  )
}

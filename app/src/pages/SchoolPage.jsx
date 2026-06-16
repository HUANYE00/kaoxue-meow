import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell.jsx'
import { getMentorsBySchoolId } from '../api/mentors.js'
import { getSchoolById } from '../api/schools.js'
import { pickPrimaryPdfUrl, verificationCopyForApplicant } from '../utils/copy.js'
import {
  getDaysUntil,
  getSchoolVerificationSummary,
  getSeasonDdl,
  pickNearestISODateFromSchools,
  resolveSeasonMaterials,
  seasonIsListedForUi,
} from '../utils/schools.js'
import { getSchoolShortName } from '../utils/schoolLabels.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function PriorContactNote({ value }) {
  const map = {
    yes: '是否建议事前联系：以当年要项/专攻说明为准。',
    no: '是否必须事前联系：以当年要项为准。',
    optional: '事前联系常见为可选或分专攻而异。',
    unknown: '是否建议事前联系：请查阅当年募集要项与专攻说明。',
  }
  return (
    <p className="text-sm leading-relaxed text-black/80">
      {map[value] ?? map.unknown}
    </p>
  )
}

function collectWarnings(school) {
  const out = []
  for (const key of ['summer', 'winter']) {
    const se = school?.seasons?.[key]
    if (!seasonIsListedForUi(se)) continue
    for (const w of se.warnings ?? []) {
      out.push({ ...w, season: key })
    }
  }
  return out.sort((a, b) => {
    const pa = a.level === 'high' ? 0 : 1
    const pb = b.level === 'high' ? 0 : 1
    return pa - pb
  })
}

/** 去重后至多 maxLines 条，供单卡片展示；同文以「高风险」优先 */
function aggregateWarningsForCard(items, maxLines = 3) {
  const severity = new Map()
  const order = []
  for (const w of items) {
    const t = String(w.text ?? '').trim()
    if (!t) continue
    const hi = w.level === 'high'
    if (!severity.has(t)) {
      severity.set(t, hi)
      order.push(t)
    } else if (hi) {
      severity.set(t, true)
    }
  }
  const lines = order.slice(0, maxLines).map((text) => ({
    text,
    level: severity.get(text) ? 'high' : 'normal',
  }))
  return {
    lines,
    omitted: Math.max(0, order.length - maxLines),
  }
}

function ddlPrimaryLine(item) {
  if (item.displayText) return item.displayText
  if (item.date != null && item.date !== '') return String(item.date)
  return '日期待官网更新'
}

/** 与 resolveSeasonMaterials 一致：冬季 same_as_summer 继承夏季的整体提交方式 */
function resolveSubmissionMethodOverall(season, summerSeason) {
  if (!season) return null
  const direct = season.submission_method_overall
  if (direct != null && String(direct).trim() !== '') return direct.trim()
  if (season.materials === 'same_as_summer' && summerSeason) {
    const inherited = summerSeason.submission_method_overall
    if (inherited != null && String(inherited).trim() !== '')
      return String(inherited).trim()
  }
  return null
}

/**
 * 固定材料槽位（顺序即匹配优先级）：先按名称归入其一，未命中归入「その他」。
 * 与各校 `materials[].name` 做启发式对齐，最终以要项 PDF 为准。
 */
const MATERIAL_SLOT_DEFS = [
  {
    id: 'application',
    label: '願書',
    match: (n) => /願書|志願|出愿書|出願書|申込書/i.test(n),
  },
  {
    id: 'research_plan',
    label: '研究計画',
    match: (n) => /研究計画|研究计划/i.test(n),
  },
  {
    id: 'transcript',
    label: '成績',
    match: (n) =>
      /成績|成绩|成績証明|成绩单|GPA|grading|transcript/i.test(n) &&
      !/卒業|毕业|学位/i.test(n),
  },
  {
    id: 'degree',
    label: '卒業・学位',
    match: (n) => /卒業|毕业|学位|卒業証明|毕业证明|diploma/i.test(n),
  },
  {
    id: 'lang_jp',
    label: '日本語',
    match: (n) => /日本語|日语|JLPT|日語|外国語.*日|日语能力/i.test(n),
  },
  {
    id: 'lang_en',
    label: '英語',
    match: (n) => /英語|英语|TOEFL|TOEIC|IELTS/i.test(n),
  },
  {
    id: 'recommendation',
    label: '推薦',
    match: (n) => /推薦|推荐信|レター|recommendation/i.test(n),
  },
  {
    id: 'photo',
    label: '写真',
    match: (n) => /写真|照片/i.test(n),
  },
  {
    id: 'fee',
    label: '検定料',
    match: (n) => /検定料|振込|出愿费|报名费|納付|決済/i.test(n),
  },
  {
    id: 'checklist',
    label: '確認表',
    match: (n) => /チェックリスト|チェック|確認表|封筒|郵送|配付/i.test(n),
  },
  { id: 'other', label: 'その他', match: null },
]

function assignMaterialToSlotId(name) {
  const n = String(name ?? '')
  for (const def of MATERIAL_SLOT_DEFS) {
    if (def.id === 'other') break
    if (def.match(n)) return def.id
  }
  return 'other'
}

function buildMaterialSlotRows(mats) {
  const byId = Object.fromEntries(
    MATERIAL_SLOT_DEFS.map((d) => [d.id, []]),
  )
  for (const m of mats) {
    const id = assignMaterialToSlotId(m.name)
    byId[id].push(m)
  }
  return MATERIAL_SLOT_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    active: byId[def.id].length > 0,
    items: byId[def.id],
  }))
}

/** 扁平线框图标，与全站描边风格一致 */
function MaterialSlotIcon({ id, className = 'h-4 w-4' }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (id) {
    case 'application':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="1.5" {...stroke} />
          <path d="M8 8h8M8 11.5h8M8 15h5" {...stroke} />
        </svg>
      )
    case 'research_plan':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M7 3h8l5 5v13a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 19V4.5A1.5 1.5 0 017 3z"
            {...stroke}
          />
          <path d="M15 3v5h4.5" {...stroke} />
          <path d="M8 14h8M8 17h5" {...stroke} />
        </svg>
      )
    case 'transcript':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="1.5" {...stroke} />
          <path d="M4 9.5h16M4 14.5h16M12 4v16" {...stroke} />
        </svg>
      )
    case 'degree':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path d="M6 7h12v12H6z" {...stroke} />
          <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" {...stroke} />
          <path d="M8 12h8M8 15h6" {...stroke} />
        </svg>
      )
    case 'lang_jp':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="5" width="14" height="12" rx="1.5" {...stroke} />
          <path d="M12 8v7M9 11.5h6" {...stroke} />
        </svg>
      )
    case 'lang_en':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5l4.5 14h-2l-.9-3h-5.2l-.9 3H5.5L10 5h2z" {...stroke} />
          <path d="M9.3 13h5.4" {...stroke} />
        </svg>
      )
    case 'recommendation':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="5" width="14" height="12" rx="1.5" {...stroke} />
          <path d="M5 10l7 3.5L19 10" {...stroke} />
        </svg>
      )
    case 'photo':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="6" width="14" height="12" rx="1.5" {...stroke} />
          <circle cx="12" cy="11" r="2" {...stroke} />
          <path d="M5 16l4-4 3 3 4-5 3 3" {...stroke} />
        </svg>
      )
    case 'fee':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="7" width="14" height="10" rx="1.5" {...stroke} />
          <circle cx="12" cy="12" r="2.5" {...stroke} />
          <path d="M12 9.5v5" {...stroke} />
        </svg>
      )
    case 'checklist':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <rect x="6" y="4" width="12" height="16" rx="1.5" {...stroke} />
          <path d="M9 9l2 2 4-4M9 14h6M9 17h4" {...stroke} />
        </svg>
      )
    case 'other':
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
          <circle cx="7" cy="12" r="1.35" fill="currentColor" />
          <circle cx="12" cy="12" r="1.35" fill="currentColor" />
          <circle cx="17" cy="12" r="1.35" fill="currentColor" />
        </svg>
      )
  }
}

function MaterialSlotStrip({ slots, seasonKey }) {
  const activeSlots = slots.filter((s) => s.active)
  return (
    <div className="mt-1.5">
      <div
        className="flex flex-wrap gap-1"
        role="list"
        aria-label="本季材料类型（固定槽位，高亮表示数据中有对应记载）"
      >
        {slots.map((s) => (
          <div
            key={s.id}
            role="listitem"
            title={`${s.label}${s.active ? '：本季有记载' : '：未拆出或未命中'}`}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
              s.active
                ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-text'
                : 'border-black/[0.07] bg-transparent text-black/20'
            }`}
          >
            <MaterialSlotIcon id={s.id} className="h-3.5 w-3.5" />
          </div>
        ))}
      </div>
      {activeSlots.length > 0 ? (
        <details className="group mt-2 overflow-hidden rounded-md border border-black/[0.06] bg-black/[0.02] open:bg-white">
          <summary className="cursor-pointer list-none px-2 py-1.5 text-[11px] font-medium text-black/55 marker:hidden [&::-webkit-details-marker]:hidden hover:text-brand-text">
            <span className="inline-flex w-full items-center justify-between gap-2">
              形式与备注
              <span className="text-[10px] text-black/35 transition group-open:rotate-180">
                ▼
              </span>
            </span>
          </summary>
          <div className="border-t border-black/[0.05] px-2 py-2 space-y-2.5">
            {activeSlots.map((s) => (
              <div key={`${seasonKey}-${s.id}`}>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-text">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      s.active
                        ? 'border-brand-primary/45 bg-brand-primary/10 text-brand-text'
                        : 'border-black/10 text-black/30'
                    }`}
                  >
                    <MaterialSlotIcon id={s.id} className="h-3 w-3" />
                  </span>
                  {s.label}
                </div>
                <ul className="mt-1 space-y-1.5 border-l border-black/[0.06] pl-2.5 ml-1">
                  {s.items.map((m, i) => (
                    <li key={`${m.name}-${i}`} className="text-[11px] leading-snug text-black/65">
                      <span className="font-medium text-black/80">{m.name}</span>
                      <span className="text-black/40"> · </span>
                      <span>{m.format ?? '—'}</span>
                      {m.note?.trim() ? (
                        <span className="mt-0.5 block text-[10px] text-black/50">
                          {m.note.trim()}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  )
}

export function SchoolPage() {
  const { schoolId } = useParams()
  const [school, setSchool] = useState(null)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getSchoolById(schoolId), getMentorsBySchoolId(schoolId)])
      .then(([s, m]) => {
        if (cancelled) return
        setSchool(s)
        setMentors(m)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [schoolId])

  const nearestOnPage = useMemo(
    () => (school ? pickNearestISODateFromSchools([school]) : null),
    [school],
  )

  const verificationSummary = useMemo(
    () => (school ? getSchoolVerificationSummary(school) : null),
    [school],
  )

  const primaryPdfUrl = useMemo(
    () => (school ? pickPrimaryPdfUrl(school) : null),
    [school],
  )

  const warningSummary = useMemo(() => {
    if (!school) return { lines: [], omitted: 0 }
    return aggregateWarningsForCard(collectWarnings(school), 3)
  }, [school])

  const officialUrlsFiltered = useMemo(() => {
    if (!school) return []
    if (!primaryPdfUrl) return school.officialUrls ?? []
    const p = primaryPdfUrl.trim()
    return (school.officialUrls ?? []).filter(
      (o) => (o.url ?? '').trim() !== p,
    )
  }, [school, primaryPdfUrl])

  if (loading)
    return (
      <PageShell>
        <div className="text-sm text-black/60">加载中…</div>
      </PageShell>
    )
  if (!school) {
    return (
      <PageShell>
      <div className="rounded-xl border border-black/5 bg-white p-6">
        <div className="font-medium text-brand-text">未找到学校条目</div>
        <div className="mt-2 text-sm text-black/60">
          <Link to="/" className="text-brand-text hover:underline hover:text-brand-primary">
            返回首页搜索
          </Link>
        </div>
      </div>
      </PageShell>
    )
  }

  const hasLibrary = Boolean(school.has_mentor_library)
  const facultyFromField = school.facultyListingUrl
  const facultyLink =
    facultyFromField?.url ??
    (school.officialUrls ?? []).find((u) =>
      /教员|教員|faculty/i.test(String(u.label ?? '')),
    )?.url ??
    (school.officialUrls ?? []).find((u) =>
      String(u.label).includes('查看全部教员'),
    )?.url

  const hasLegacyStructuredLinks = Boolean(
    school.pdfUrl?.url ||
      school.admissionPageUrl?.url ||
      facultyFromField?.url,
  )

  const sumSe = school.seasons?.summer

  const seasonOrder = [
    { key: 'summer', title: '夏季入试' },
    { key: 'winter', title: '冬季入试' },
  ]

  return (
    <PageShell>
    <div className="space-y-10">
      {/* 1 基础介绍 */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-brand-text shadow-sm">
            {getSchoolShortName(school.id)}
          </span>
          <span className="text-sm text-black/55">{school.name}</span>
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-brand-text md:text-4xl">
          {school.department}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-black/70">
          {verificationCopyForApplicant(verificationSummary)}
        </p>
      </header>

      {/* 最近节点（置顶） + 可展开完整时间线 */}
      <section className="space-y-3 scroll-mt-24" aria-labelledby="ddl-hero-title">
        <h2 id="ddl-hero-title" className="sr-only">
          关键日程
        </h2>
        {nearestOnPage && nearestOnPage.days >= 0 ? (
          <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-brand-bg/40 p-5 shadow-md ring-1 ring-black/[0.04] md:p-6">
            <div className="text-[11px] font-bold tracking-wide text-black/45">
              最近关键节点
            </div>
            <p className="mt-2 text-2xl font-black leading-snug tracking-tight text-brand-text md:text-3xl">
              {nearestOnPage.event}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-black/70">
              <span className="font-semibold text-brand-text">
                {nearestOnPage.date}
              </span>
              <span className="text-black/50">·</span>
              <span>
                距今约{' '}
                <strong className="text-brand-text">{nearestOnPage.days}</strong> 天
              </span>
              <span className="text-black/50">·</span>
              <span>{nearestOnPage.season === 'summer' ? '夏季入试' : '冬季入试'}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-black/50">
              区间、消印或「详见要项」类表述以募集要项 PDF 原文为准。
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/60 shadow-sm">
            <p>暂无已写入日历的节点日期；日程与材料请以募集要项为准。</p>
          </div>
        )}

        <details className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm open:ring-2 open:ring-brand-primary/25">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-bold text-brand-text marker:hidden [&::-webkit-details-marker]:hidden">
            <span>展开完整时间线（夏季 / 冬季）</span>
            <span className="text-xs text-black/45 transition group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-black/5 px-5 py-4">
            <p className="mb-4 text-xs leading-relaxed text-black/55">
              下列为从官网要项整理的拆条节点，便于对照；最终以 PDF 为准。
            </p>
            <div className="space-y-4">
              {seasonOrder.map(({ key, title }) => {
                const se = school.seasons?.[key]
                if (!seasonIsListedForUi(se)) return null
                const ddl = getSeasonDdl(se)
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-black/5 bg-brand-bg/40 p-4"
                  >
                    <div className="text-sm font-bold text-brand-text">{title}</div>
                    {ddl.length === 0 ? (
                      <div className="mt-2 text-sm text-black/55">
                        暂无拆条节点，请直接查阅募集要项 PDF。
                      </div>
                    ) : (
                      <ul className="mt-3 space-y-4">
                        {ddl.map((item, i) => {
                          const dateStr =
                            typeof item.date === 'string' ? item.date : null
                          const iso = dateStr ? ISO_DATE.test(dateStr) : false
                          const days =
                            iso && dateStr ? getDaysUntil(dateStr) : null
                          return (
                            <li key={`${item.event}-${i}`} className="text-sm">
                              <div className="font-medium text-brand-text">
                                {item.event}
                              </div>
                              <div className="mt-1 text-black/75">
                                {ddlPrimaryLine(item)}
                                {iso && days != null && days >= 0 ? (
                                  <span className="text-black/45">
                                    {' '}
                                    · 距今约 {days} 天
                                  </span>
                                ) : null}
                              </div>
                              {item.referenceNote ? (
                                <p className="mt-1 text-xs leading-relaxed text-black/50">
                                  {item.referenceNote}
                                </p>
                              ) : null}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </details>
      </section>

      {/* 常用入口 — Bento */}
      <section id="entry" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-brand-text">
          常用入口
        </h2>
        <p className="text-xs text-black/55">
          募集要项与官网链接；主 PDF 与下方卡片重复的链接已自动隐藏。
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {primaryPdfUrl ? (
            <a
              href={primaryPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[4.5rem] items-center justify-center rounded-2xl bg-brand-primary px-5 py-4 text-center text-base font-bold text-brand-text shadow-sm transition hover:opacity-95 sm:col-span-2"
            >
              打开募集要项 PDF ↗
            </a>
          ) : null}

          {officialUrlsFiltered.length > 0
            ? officialUrlsFiltered.map((o) => (
                <a
                  key={o.url}
                  href={o.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[5rem] flex-col justify-center rounded-2xl border border-black/8 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-sm font-bold text-brand-text">
                    {o.label}
                  </span>
                  <span className="mt-2 text-xs font-medium text-brand-primary">
                    在官网打开 ↗
                  </span>
                </a>
              ))
            : null}

          {hasLegacyStructuredLinks ? (
            <>
              {school.pdfUrl?.url && school.pdfUrl.url !== primaryPdfUrl ? (
                <a
                  href={school.pdfUrl.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[5rem] flex-col justify-center rounded-2xl border border-dashed border-black/15 bg-white/80 p-4 transition hover:shadow-sm"
                >
                  <span className="text-sm font-semibold text-brand-text">
                    {school.pdfUrl.label ?? '募集要项 PDF（备用）'}
                  </span>
                  <span className="mt-2 text-xs text-black/50">↗</span>
                </a>
              ) : null}
              {school.admissionPageUrl?.url ? (
                <a
                  href={school.admissionPageUrl.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[5rem] flex-col justify-center rounded-2xl border border-black/8 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-sm font-bold text-brand-text">
                    {school.admissionPageUrl.label ?? '官网入试信息'}
                  </span>
                  <span className="mt-2 text-xs font-medium text-brand-primary">
                    打开 ↗
                  </span>
                </a>
              ) : null}
              {facultyFromField?.url ? (
                <a
                  href={facultyFromField.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[5rem] flex-col justify-center rounded-2xl border border-black/8 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-sm font-bold text-brand-text">
                    {facultyFromField.label ?? '教员一览'}
                  </span>
                  <span className="mt-2 text-xs font-medium text-brand-primary">
                    在官网打开 ↗
                  </span>
                </a>
              ) : null}
            </>
          ) : null}
        </div>
        {officialUrlsFiltered.length === 0 &&
        !hasLegacyStructuredLinks ? (
          <p className="text-sm text-black/55">暂无额外官网入口。</p>
        ) : null}
      </section>

      {/* 3 精选导师 */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-brand-text">精选导师参考</h2>
        <p className="text-xs text-black/55">
          以下为站内整理条目，可与该校官网教员列表对照。
        </p>

        {hasLibrary ? (
          <div className="space-y-3">
            {mentors.length === 0 ? (
              <div className="rounded-lg border border-black/5 bg-white p-4 text-sm text-black/60">
                精选导师条目整理中。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-black/5 bg-white p-4 shadow-sm"
                  >
                    <div className="font-medium text-brand-text">{m.name_zh}</div>
                    <div className="text-sm text-black/60">
                      {getSchoolShortName(m.school_id)}
                    </div>
                    <div className="mt-2 text-xs text-black/55">
                      {m.tag_primary ?? '—'}
                    </div>
                    <div className="mt-3">
                      <Link
                        to={`/mentor/${m.id}`}
                        className="text-sm font-medium text-brand-text hover:underline hover:text-brand-primary"
                      >
                        查看导师详情 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {facultyLink ? (
              <a
                href={facultyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-brand-text hover:shadow-sm"
              >
                该校教员完整列表（官网）→
              </a>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-black/5 bg-white p-4 text-sm text-black/60">
              本站暂未维护该校精选导师条目，请使用官网教员列表。
            </div>
            {facultyLink ? (
              <a
                href={facultyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-brand-text hover:shadow-sm"
              >
                该校教员完整列表（官网）→
              </a>
            ) : null}
          </div>
        )}
      </section>

      {/* 4 出愿材料 */}
      <section id="materials" className="space-y-2 scroll-mt-24">
        <h2 className="text-sm font-semibold text-brand-text">出愿材料（要点）</h2>
        <p className="text-[11px] leading-relaxed text-black/50">
          下列为固定 11 类材料槽位；本校本季数据里命中则高亮。细则在「形式与备注」中展开。若夏季/冬季另有独立
          PDF，仍在对应季节卡片上方显示。
        </p>
        <div className="space-y-2.5">
          {seasonOrder.map(({ key, title }) => {
            const se = school.seasons?.[key]
            if (!seasonIsListedForUi(se)) return null
            const mats = resolveSeasonMaterials(se, sumSe)
            const slotRows = buildMaterialSlotRows(mats)
            const noteSame =
              se.materials === 'same_as_summer' && key === 'winter'
            const pdfRaw =
              se.boshu_pdf_url != null && typeof se.boshu_pdf_url === 'string'
                ? se.boshu_pdf_url.trim()
                : ''
            const primary = primaryPdfUrl?.trim() ?? ''
            const showAltPdf =
              pdfRaw.length > 0 &&
              primary.length > 0 &&
              pdfRaw !== primary
            const showOnlySeasonPdf =
              pdfRaw.length > 0 && primary.length === 0
            const overall = resolveSubmissionMethodOverall(se, sumSe)
            return (
              <div
                key={key}
                className="rounded-lg border border-black/5 bg-white p-3 shadow-sm"
              >
                <div className="text-xs font-semibold text-brand-text">{title}</div>
                {showAltPdf ? (
                  <a
                    href={pdfRaw}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center rounded-full border border-black/10 bg-brand-bg/60 px-2.5 py-1 text-[11px] font-semibold text-brand-text transition hover:bg-brand-primary/15"
                  >
                    本季补充募集要项 PDF ↗
                  </a>
                ) : null}
                {showOnlySeasonPdf ? (
                  <a
                    href={pdfRaw}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-block rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-text transition hover:opacity-90"
                  >
                    下载本季募集要项 PDF ↗
                  </a>
                ) : null}
                {!pdfRaw && !primary ? (
                  <p className="mt-1.5 text-[11px] text-black/50">
                    本季要项 PDF 未在数据中拆出，请从官网入口查找。
                  </p>
                ) : null}
                {overall ? (
                  <p className="mt-1.5 text-[11px] text-black/60">提交方式：{overall}</p>
                ) : null}
                {noteSame ? (
                  <p className="mt-1.5 text-[11px] text-black/50">
                    冬季入试材料与夏季相同。
                  </p>
                ) : null}
                {mats.length === 0 ? (
                  <div className="mt-1.5 text-[11px] text-black/55">
                    本季未拆条；请以募集要项中的材料表为准。
                  </div>
                ) : (
                  <MaterialSlotStrip slots={slotRows} seasonKey={key} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 6 风险提示（聚合为单卡，至多三条） */}
      {warningSummary.lines.length > 0 ? (
        <section className="space-y-2 scroll-mt-24">
          <h2 className="text-sm font-semibold text-brand-text">风险提示</h2>
          <div
            className={`rounded-lg border border-black/8 bg-white p-4 shadow-sm ${
              warningSummary.lines.some((l) => l.level === 'high')
                ? 'border-l-4 border-l-brand-warning'
                : 'border-l-4 border-l-yellow-500/90'
            }`}
          >
            <p className="text-[11px] leading-relaxed text-black/50">
              以下为高风险与一般提示的合并摘要（同文去重），最多展示 3
              条；细节仍以募集要项与官网为准。
            </p>
            <ol className="mt-3 list-none space-y-3 p-0">
              {warningSummary.lines.map((row, idx) => (
                <li key={`${idx}-${row.text.slice(0, 24)}`} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-brand-bg/50 text-[11px] font-bold text-brand-text">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 text-sm leading-relaxed text-black/80">
                    <span
                      className={`mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-bold ${
                        row.level === 'high'
                          ? 'bg-brand-warning/20 text-brand-text'
                          : 'bg-black/[0.06] text-black/55'
                      }`}
                    >
                      {row.level === 'high' ? '高风险' : '提示'}
                    </span>
                    {row.text}
                  </div>
                </li>
              ))}
            </ol>
            {warningSummary.omitted > 0 ? (
              <p className="mt-3 border-t border-black/[0.06] pt-3 text-[11px] text-black/45">
                另有 {warningSummary.omitted} 条去重后的提示未列出，请直接查阅要项全文。
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 套磁说明（若有） */}
      {school.contact ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-brand-text">
            事前联系 / 套磁（参考）
          </h2>
          <div className="rounded-lg border border-black/5 bg-white p-4 shadow-sm">
            <PriorContactNote value={school.contact?.require_prior_contact} />
            {school.contact?.notes ? (
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                {school.contact.notes}
              </p>
            ) : null}
            {school.contact?.sourceUrl ? (
              <a
                href={school.contact.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-brand-text hover:underline hover:text-brand-primary"
              >
                相关说明页 ↗
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      <p className="text-sm text-black/55">
        <Link to="/" className="text-brand-text hover:underline hover:text-brand-primary">
          ← 返回首页
        </Link>
      </p>
    </div>
    </PageShell>
  )
}

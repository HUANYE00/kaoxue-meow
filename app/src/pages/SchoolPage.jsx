import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMentorsBySchoolId } from '../api/mentors.js'
import { getSchoolById } from '../api/schools.js'
import { pickPrimaryPdfUrl, verificationCopyForApplicant } from '../utils/copy.js'
import { WarningCard } from '../components/ui/WarningCard.jsx'
import {
  getDaysUntil,
  getSchoolVerificationSummary,
  getSeasonDdl,
  pickNearestISODateFromSchools,
  resolveSeasonMaterials,
  seasonIsListedForUi,
} from '../utils/schools.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function SimpleDocLink({ href, label }) {
  return (
    <div className="border-b border-black/[0.06] py-3 last:border-0">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-brand-primary hover:underline"
      >
        {label} ↗
      </a>
    </div>
  )
}

function PriorContactNote({ value }) {
  const map = {
    yes: '是否建议事前联系：以当年要项/专攻说明为准；本站仅作信息提示。',
    no: '是否必须事前联系：以当年要项为准。',
    optional: '事前联系：常见为可选或分专攻而异，请以要项为准。',
    unknown: '是否建议事前联系：请直接查阅当年募集要项与专攻说明。',
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

function ddlPrimaryLine(item) {
  if (item.displayText) return item.displayText
  if (item.date != null && item.date !== '') return String(item.date)
  return '日期待官网更新'
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

  const warningItems = useMemo(
    () => (school ? collectWarnings(school) : []),
    [school],
  )

  if (loading) return <div className="text-sm text-black/60">加载中…</div>
  if (!school) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-6">
        <div className="font-medium text-brand-text">未找到学校条目</div>
        <div className="mt-2 text-sm text-black/60">
          <Link to="/" className="text-brand-primary">
            返回首页
          </Link>
        </div>
      </div>
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
    <div className="space-y-6">
      <div>
        <div className="text-sm text-black/60">{school.name}</div>
        <h1 className="text-2xl font-semibold text-brand-text">
          {school.department}
        </h1>
        <div className="text-sm text-black/60">校区：{school.campus}</div>
        {school.activeSeason ? (
          <div className="mt-1 text-xs text-black/50">
            本站编排侧重：
            {school.activeSeason === 'summer' ? '夏季入试' : '冬季入试'}节奏
          </div>
        ) : null}
      </div>

      <section className="rounded-xl border border-black/8 bg-white p-4 shadow-sm space-y-3">
        <div className="text-sm font-medium text-brand-text">使用前请先读</div>
        <p className="text-sm leading-relaxed text-black/75">
          {verificationCopyForApplicant(verificationSummary)}
        </p>
        {primaryPdfUrl ? (
          <p>
            <a
              href={primaryPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              打开募集要项 PDF（申请务必以官网最新版为准）↗
            </a>
          </p>
        ) : null}

        {nearestOnPage && nearestOnPage.days >= 0 ? (
          <div className="pt-3 mt-1 border-t border-black/5">
            <div className="text-xs font-medium text-black/50">
              近期一条「有明确日历」的节点（倒数）
            </div>
            <div className="mt-1 text-sm text-black/85">{nearestOnPage.event}</div>
            <div className="mt-1 text-xs text-black/55">
              {nearestOnPage.date} · 距今约{' '}
              <span className="font-semibold text-brand-text">
                {nearestOnPage.days}
              </span>{' '}
              天 · {nearestOnPage.season === 'summer' ? '夏季' : '冬季'}
            </div>
          </div>
        ) : null}
      </section>

      {warningItems.length ? (
        <section className="space-y-3">
          <div className="text-sm font-medium text-brand-text">风险提示</div>
          <div className="space-y-3">
            {warningItems.map((w, idx) => (
              <WarningCard key={`${w.season}-${idx}`} level={w.level} text={w.text} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="text-sm font-medium text-brand-text">
          出愿期间与关键日程
        </div>
        <p className="text-xs leading-relaxed text-black/55">
          下表整理自募集要项；若官网写的是区间、星期或「详见别纸」，请以 PDF
          原文为准。本站不对倒计时承担法律责任。
        </p>
        <div className="space-y-4">
          {seasonOrder.map(({ key, title }) => {
            const se = school.seasons?.[key]
            if (!seasonIsListedForUi(se)) return null
            const ddl = getSeasonDdl(se)
            return (
              <div
                key={key}
                className="rounded-lg border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="text-sm font-medium text-brand-text">{title}</div>
                {ddl.length === 0 ? (
                  <div className="mt-2 text-sm text-black/55">
                    暂无整理成表的节点；请直接打开上方募集要项 PDF。
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
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium text-brand-text">文书与材料清单</div>
        <p className="text-xs leading-relaxed text-black/55">
          下列为材料名称与常见注意点；具体纸张、份数、用语请以募集要项为准。
        </p>
        <div className="space-y-4">
          {seasonOrder.map(({ key, title }) => {
            const se = school.seasons?.[key]
            if (!seasonIsListedForUi(se)) return null
            const mats = resolveSeasonMaterials(se, sumSe)
            const noteSame =
              se.materials === 'same_as_summer' && key === 'winter'
            return (
              <div
                key={key}
                className="rounded-lg border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="text-sm font-medium text-brand-text">{title}</div>
                {noteSame ? (
                  <p className="mt-2 text-xs text-black/55">
                    冬季入试所须材料与夏季入试相同（整理策略：沿用夏季清单）。
                  </p>
                ) : null}
                {mats.length === 0 ? (
                  <div className="mt-2 text-sm text-black/55">
                    本季暂未拆条列出；请使用上方募集要项 PDF 中的材料表。
                  </div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {mats.map((m, i) => (
                      <li key={`${m.name}-${i}`}>
                        <div className="text-sm font-medium text-brand-text">
                          {m.name}
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs leading-relaxed text-black/60">
                          {m.format ? <div>形式：{m.format}</div> : null}
                          {m.medium ? <div>提交方式：{m.medium}</div> : null}
                          {m.riskLevel ? (
                            <div>
                              容易踩坑程度参考：
                              <span className="font-medium">{m.riskLevel}</span>
                            </div>
                          ) : null}
                          {m.note ? <div>{m.note}</div> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {school.contact ? (
        <section className="space-y-3">
          <div className="text-sm font-medium text-brand-text">
            套磁 / 事前联系（说明）
          </div>
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
                className="mt-3 inline-block text-sm text-brand-primary hover:underline"
              >
                相关说明页 ↗
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasLegacyStructuredLinks ? (
        <section className="space-y-3">
          <div className="text-sm font-medium text-brand-text">更多链接（整理字段）</div>
          <div className="rounded-lg border border-black/5 bg-white px-4 shadow-sm">
            {school.pdfUrl?.url ? (
              <SimpleDocLink
                href={school.pdfUrl.url}
                label={school.pdfUrl.label ?? '募集要项 PDF'}
              />
            ) : null}
            {school.admissionPageUrl?.url ? (
              <SimpleDocLink
                href={school.admissionPageUrl.url}
                label={school.admissionPageUrl.label ?? '官网入试信息'}
              />
            ) : null}
            {facultyFromField?.url ? (
              <SimpleDocLink
                href={facultyFromField.url}
                label={facultyFromField.label ?? '教员一览'}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {(school.officialUrls?.length ?? 0) > 0 ? (
        <section className="space-y-3">
          <div className="text-sm font-medium text-brand-text">官网常用入口</div>
          <p className="text-xs text-black/50">
            下列为招生页、教员检索等备用入口；是否最新请以官网为准。
          </p>
          <div className="rounded-lg border border-black/5 bg-white p-4">
            <ul className="space-y-2">
              {(school.officialUrls ?? []).map((o) => (
                <li key={o.url}>
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-brand-primary hover:underline"
                  >
                    {o.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="text-sm text-black/60">精选导师参考</div>

        {hasLibrary ? (
          <div className="space-y-3">
            {mentors.length === 0 ? (
              <div className="rounded-lg border border-black/5 bg-white p-4 text-sm text-black/60">
                精选导师条目整理中
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-black/5 bg-white p-4 shadow-sm"
                  >
                    <div className="font-medium text-brand-text">
                      {m.name_zh}
                    </div>
                    <div className="text-sm text-black/60">
                      {m.title ? `${m.title} · ` : ''}
                      {m.faculty_zh}
                    </div>
                    <div className="mt-2 text-xs text-black/60">
                      官网摘要：{m.evidence?.[0]?.title_zh ?? '—'}
                    </div>
                    <div className="mt-3">
                      <Link
                        to={`/mentor/${m.id}`}
                        className="text-sm text-brand-primary"
                      >
                        查看导师卡 →
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
              本站暂未为该校维护精选导师条目。请使用官网教员列表自行检索。
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
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell.jsx'
import { getMentorById, getMentors } from '../api/mentors.js'
import { getSchoolById } from '../api/schools.js'
import { getSchoolShortName } from '../utils/schoolLabels.js'

function pickRelatedMentors(all, current, limit = 6) {
  if (!current) return []
  const primary = current.tag_primary
  const secondary = new Set(current.tags_secondary ?? [])
  const scored = all
    .filter((m) => m.id !== current.id)
    .map((m) => {
      let score = 0
      if (m.tag_primary === primary) score += 4
      for (const t of m.tags_secondary ?? []) {
        if (secondary.has(t)) score += 2
      }
      if (m.school_id === current.school_id) score += 1
      return { m, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length > 0) {
    return scored.slice(0, limit).map((x) => x.m)
  }

  return all
    .filter((m) => m.id !== current.id && m.school_id === current.school_id)
    .slice(0, limit)
}

export function MentorPage() {
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)
  const [school, setSchool] = useState(null)
  const [allMentors, setAllMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getMentorById(mentorId), getMentors()])
      .then(([m, list]) => {
        if (cancelled) return
        setMentor(m)
        setAllMentors(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mentorId])

  useEffect(() => {
    let cancelled = false
    setSchool(null)
    if (!mentor?.school_id) return undefined
    getSchoolById(mentor.school_id).then((s) => {
      if (!cancelled) setSchool(s)
    })
    return () => {
      cancelled = true
    }
  }, [mentor])

  const related = useMemo(
    () => pickRelatedMentors(allMentors, mentor, 6),
    [allMentors, mentor],
  )

  if (loading)
    return (
      <PageShell>
        <div className="text-sm text-black/60">加载中…</div>
      </PageShell>
    )
  if (!mentor) {
    return (
      <PageShell>
      <div className="rounded-xl border border-black/5 bg-white p-6">
        <div className="font-medium text-brand-text">导师未建档</div>
        <div className="mt-2 text-sm text-black/60">
          <Link to="/mentors" className="text-brand-text hover:underline hover:text-brand-primary">
            浏览导师列表
          </Link>
          {' · '}
          <Link to="/" className="text-brand-text hover:underline hover:text-brand-primary">
            返回首页
          </Link>
        </div>
      </div>
      </PageShell>
    )
  }

  const schoolMaterialsHref = `/school/${mentor.school_id}#materials`

  return (
    <PageShell>
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
          {school ? (
            <>
              <Link
                to={`/school/${mentor.school_id}`}
                className="text-brand-text hover:underline hover:text-brand-primary"
              >
                {school.name} · {school.department}
              </Link>
              <span className="text-black/35">·</span>
              <Link
                to={schoolMaterialsHref}
                className="text-brand-text hover:underline hover:text-brand-primary"
              >
                该校出愿材料要点
              </Link>
            </>
          ) : (
            <span>{mentor.school_id}</span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">
          {mentor.name_zh}
        </h1>
        <div className="text-sm text-black/60">
          {mentor.title ? `${mentor.title} · ` : ''}
          {mentor.faculty_zh}
          {mentor.specialization_zh ? ` · ${mentor.specialization_zh}` : ''}
        </div>
      </div>

      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm space-y-3">
        <div className="font-medium text-brand-text">研究领域与标签</div>
        <p className="text-sm leading-relaxed text-black/75">
          {mentor.tag_primary ? (
            <>
              主要方向：<strong className="text-brand-text">{mentor.tag_primary}</strong>
            </>
          ) : (
            '主要方向待补充。'
          )}
          {(mentor.tags_secondary ?? []).length > 0 ? (
            <>
              {' '}
              相关：
              {(mentor.tags_secondary ?? []).join('、')}
            </>
          ) : null}
        </p>
        {(mentor.keywords ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(mentor.keywords ?? []).map((k) => (
              <span
                key={k}
                className="rounded-full border border-black/10 bg-brand-bg px-2.5 py-0.5 text-xs text-black/70"
              >
                {k}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {mentor.url_homepage ? (
            <a
              href={mentor.url_homepage}
              target="_blank"
              rel="noreferrer"
              className="text-brand-text hover:underline hover:text-brand-primary"
            >
              研究室主页 ↗
            </a>
          ) : null}
          {mentor.url_faculty_listing ? (
            <a
              href={mentor.url_faculty_listing}
              target="_blank"
              rel="noreferrer"
              className="text-brand-text hover:underline hover:text-brand-primary"
            >
              教员页（官网）↗
            </a>
          ) : null}
          {mentor.url_researchmap ? (
            <a
              href={mentor.url_researchmap}
              target="_blank"
              rel="noreferrer"
              className="text-brand-text hover:underline hover:text-brand-primary"
            >
              researchmap ↗
            </a>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm space-y-2">
        <div className="font-medium text-brand-text">官网摘录（研究领域出处）</div>
        <p className="text-xs text-black/55">
          以下为官网公开页面摘引，用于对照研究方向；报考资格与材料仍以募集要项为准。
        </p>
        {(mentor.evidence ?? []).length === 0 ? (
          <div className="text-sm text-black/60">暂无摘录条目</div>
        ) : (
          <ul className="space-y-3">
            {mentor.evidence.map((e, idx) => (
              <li key={idx} className="text-sm border-b border-black/[0.06] pb-3 last:border-0 last:pb-0">
                <div className="text-black/85">{e.title_zh}</div>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-brand-text hover:underline hover:text-brand-primary"
                >
                  打开来源页面 ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-amber-100 bg-amber-50/40 p-5 text-sm leading-relaxed text-black/75">
        <div className="font-medium text-brand-text">套磁与邮件</div>
        <p className="mt-2">
          每位导师页不再重复粘贴同一套步骤说明；请查看全站统一的撰写与注意事项。
        </p>
        <Link
          to="/guide"
          className="mt-3 inline-block font-medium text-brand-text hover:underline hover:text-brand-primary"
        >
          打开考学经验（套磁与邮件）→
        </Link>
      </section>

      {related.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-brand-text">
            相关导师（同方向或同校）
          </h2>
          <ul className="divide-y divide-black/5 rounded-lg border border-black/5 bg-white">
            {related.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <div>
                  <Link
                    to={`/mentor/${m.id}`}
                    className="font-medium text-brand-text hover:underline hover:text-brand-primary"
                  >
                    {m.name_zh}
                  </Link>
                  <span className="text-sm text-black/55">
                    {' '}
                    · {getSchoolShortName(m.school_id)} · {m.tag_primary ?? '—'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-black/55">
        <Link to="/mentors" className="text-brand-text hover:underline hover:text-brand-primary">
          浏览全部导师
        </Link>
        {' · '}
        <Link to="/" className="text-brand-text hover:underline hover:text-brand-primary">
          返回首页
        </Link>
      </p>
    </div>
    </PageShell>
  )
}

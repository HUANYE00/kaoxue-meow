import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMentorById } from '../api/mentors.js'
import { getSchoolById } from '../api/schools.js'
import { SUBMISSION_GUIDE } from '../constants/submissionGuide.js'

export function MentorPage() {
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMentorById(mentorId)
      .then((m) => {
        if (!cancelled) setMentor(m)
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

  if (loading) return <div className="text-sm text-black/60">加载中…</div>
  if (!mentor) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-6">
        <div className="font-medium text-brand-text">导师未建档</div>
        <div className="mt-2 text-sm text-black/60">
          <Link to="/" className="text-brand-primary">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-black/60">
          {school ? (
            <Link
              to={`/school/${mentor.school_id}`}
              className="text-brand-primary hover:underline"
            >
              {school.name} · {school.department}
            </Link>
          ) : (
            <span>{mentor.school_id}</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-brand-text">
          {mentor.name_zh}
        </h1>
        <div className="text-sm text-black/60">
          {mentor.title ? `${mentor.title} · ` : ''}
          {mentor.faculty_zh}
        </div>
      </div>

      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm space-y-2">
        <div className="font-medium text-brand-text">证据</div>
        {(mentor.evidence ?? []).length === 0 ? (
          <div className="text-sm text-black/60">暂无</div>
        ) : (
          <ul className="space-y-2">
            {mentor.evidence.map((e, idx) => (
              <li key={idx} className="text-sm">
                <div className="text-black/80">{e.title_zh}</div>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-primary"
                >
                  打开来源 ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm space-y-3">
        <div className="font-medium text-brand-text">套磁动作建议（固定模板）</div>
        <div className="space-y-3">
          {SUBMISSION_GUIDE.map((g) => (
            <div key={g.title} className="rounded-lg border border-black/10 p-4">
              <div className="font-medium text-brand-text">
                {g.icon} {g.title}
              </div>
              <div className="mt-1 text-sm text-black/70">{g.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


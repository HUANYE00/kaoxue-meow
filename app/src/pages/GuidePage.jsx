import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell.jsx'
import { SUBMISSION_GUIDE } from '../constants/submissionGuide.js'

export function GuidePage() {
  return (
    <PageShell>
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-brand-text">考学经验</h1>
        <p className="mt-2 text-sm text-black/65 leading-relaxed">
          套磁与邮件撰写：以下为全站统一的参考步骤，适用于每位导师；具体能否报考请以各校募集要项及研究室页面为准。
        </p>
      </div>

      <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm space-y-4">
        {SUBMISSION_GUIDE.map((g) => (
          <div key={g.title} className="rounded-lg border border-black/10 p-4">
            <div className="font-medium text-brand-text">
              {g.icon} {g.title}
            </div>
            <div className="mt-1 text-sm text-black/75 leading-relaxed">{g.body}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-black/55">
        <Link to="/" className="text-brand-text hover:underline hover:text-brand-primary">
          ← 返回首页
        </Link>
      </p>
    </div>
    </PageShell>
  )
}

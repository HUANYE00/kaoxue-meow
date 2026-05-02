export function DataStatusBadge({ status, verifiedAt }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/80">
        <span aria-hidden>✅</span> 已核验
        {verifiedAt ? (
          <span className="text-black/50">（{verifiedAt}）</span>
        ) : null}
      </span>
    )
  }

  if (status === 'updating') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-900/90">
        <span aria-hidden>🔄</span> 待官网更新
        {verifiedAt ? (
          <span className="text-black/45">（登记：{verifiedAt}）</span>
        ) : null}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60">
      <span aria-hidden>⚠️</span> 待核验
      {verifiedAt ? (
        <span className="text-black/45">（{verifiedAt}）</span>
      ) : null}
    </span>
  )
}

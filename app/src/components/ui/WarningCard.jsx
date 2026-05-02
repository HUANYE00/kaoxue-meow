export function WarningCard({ level, text }) {
  const isHigh = level === 'high'
  const base =
    'w-full rounded-lg border-l-4 p-4 bg-white shadow-sm text-sm leading-relaxed'
  const color = isHigh
    ? 'border-brand-warning text-brand-text'
    : 'border-yellow-500 text-brand-text'

  return (
    <div className={`${base} ${color}`}>
      <div className="font-medium mb-1">{isHigh ? '高风险提示' : '提示'}</div>
      <div className="text-black/80">{text}</div>
    </div>
  )
}

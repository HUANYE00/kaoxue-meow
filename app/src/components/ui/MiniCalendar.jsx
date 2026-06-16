import { useMemo } from 'react'

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const last = new Date(year, monthIndex + 1, 0)
  const daysInMonth = last.getDate()
  // Monday-first: JS Sunday=0 → Monday=0 index
  const mondayIndex = (first.getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < mondayIndex; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  while (cells.length < 42) cells.push(null)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

/** 轻量月历（参考系统日历：白底、圆角、今日强调） */
export function MiniCalendar({ className = '' }) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const today = now.getDate()

  const label = `${y} 年 ${m + 1} 月`

  const grid = useMemo(() => buildMonthGrid(y, m), [y, m])

  return (
    <div
      className={`w-full min-w-0 rounded-2xl border border-black/[0.08] bg-white p-3 shadow-md ring-1 ring-black/[0.04] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2 px-0.5 pb-2">
        <span className="text-sm font-semibold text-brand-text">{label}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-black/40">
          本月
        </span>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-black/45">
        {WEEK.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="mt-0.5 space-y-0.5">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
            {row.map((cell, ci) => {
              const isToday = cell === today
              return (
                <div key={ci} className="flex h-7 items-center justify-center">
                  {cell == null ? (
                    <span className="text-transparent">0</span>
                  ) : (
                    <span
                      className={[
                        'flex h-7 w-7 items-center justify-center rounded-full font-medium tabular-nums',
                        isToday
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-black/80',
                      ].join(' ')}
                    >
                      {cell}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

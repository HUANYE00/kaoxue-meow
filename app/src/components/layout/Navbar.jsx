import { NavLink } from 'react-router-dom'

function linkClass({ isActive }) {
  return [
    'px-3 py-2 rounded-md text-sm font-medium',
    isActive
      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
      : 'text-brand-text hover:bg-white hover:shadow-sm border border-transparent',
  ].join(' ')
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-brand-bg/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-black text-white flex items-center justify-center font-semibold">
            喵
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-brand-text">考学喵</div>
            <div className="text-xs text-black/50">
              社会学修士方向 · 出愿信息与材料参考
            </div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-2 flex-wrap justify-end text-sm text-black/55">
          <span className="hidden sm:inline">先看首页说明，再点学校卡片进详情</span>
          <NavLink to="/" className={linkClass} end>
            首页 / 选校
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

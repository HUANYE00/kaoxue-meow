import { Link, NavLink } from 'react-router-dom'

function textLinkClass({ isActive }) {
  return [
    'text-sm font-medium no-underline transition',
    isActive ? 'text-brand-text' : 'text-black/55 hover:text-brand-text',
  ].join(' ')
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5 no-underline">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
            喵
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-tight text-brand-text">
              考学喵
            </div>
            <div className="hidden text-xs text-black/50 sm:block">
              社会学修士 · 出愿与材料参考
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <NavLink to="/" className={textLinkClass} end>
            首页
          </NavLink>
          <span className="hidden text-black/25 sm:inline">·</span>
          <NavLink to="/guide" className={textLinkClass}>
            考学经验
          </NavLink>
          <span className="mx-0.5 hidden w-px self-stretch bg-black/10 sm:block" aria-hidden />
          <NavLink
            to="/mentors"
            className={({ isActive }) =>
              [
                'rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition sm:px-4',
                isActive
                  ? 'bg-black text-white ring-2 ring-brand-primary/40 ring-offset-2 ring-offset-brand-bg'
                  : 'bg-black text-white hover:bg-black/85',
              ].join(' ')
            }
          >
            找导师
          </NavLink>
          <Link
            to="/#schools"
            className="rounded-full bg-brand-primary px-3.5 py-2 text-sm font-semibold text-brand-text shadow-sm no-underline transition hover:opacity-90 sm:px-4"
          >
            搜学校 →
          </Link>
        </nav>
      </div>
    </header>
  )
}

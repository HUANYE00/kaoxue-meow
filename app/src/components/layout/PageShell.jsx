/** 主内容区宽度与内边距（首页通栏条等可放在 PageShell 外） */
export function PageShell({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}

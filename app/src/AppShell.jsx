import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer.jsx'
import { Navbar } from './components/layout/Navbar.jsx'
import { ProductValueBar } from './components/layout/ProductValueBar.jsx'

export function AppShell() {
  const { pathname } = useLocation()
  const showValueBar = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      {showValueBar ? <ProductValueBar /> : null}
      <Navbar />
      <main className="min-w-0 w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './components/layout/Footer.jsx'
import { Navbar } from './components/layout/Navbar.jsx'
import { Home } from './pages/Home.jsx'
import { MentorPage } from './pages/MentorPage.jsx'
import { SchoolPage } from './pages/SchoolPage.jsx'

function routerBasename() {
  const base = import.meta.env.BASE_URL
  if (base === '/') return undefined
  return base.replace(/\/$/, '')
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/school/:schoolId" element={<SchoolPage />} />
            <Route path="/mentor/:mentorId" element={<MentorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

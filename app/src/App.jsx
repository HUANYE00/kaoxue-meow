import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell.jsx'
import { GuidePage } from './pages/GuidePage.jsx'
import { Home } from './pages/Home.jsx'
import { MentorPage } from './pages/MentorPage.jsx'
import { MentorsBrowsePage } from './pages/MentorsBrowsePage.jsx'
import { SchoolPage } from './pages/SchoolPage.jsx'

function routerBasename() {
  const base = import.meta.env.BASE_URL
  if (base === '/') return undefined
  return base.replace(/\/$/, '')
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/mentors" element={<MentorsBrowsePage />} />
          <Route path="/school/:schoolId" element={<SchoolPage />} />
          <Route path="/mentor/:mentorId" element={<MentorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from './store/authStore'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Upload from './pages/Upload'
import About from './pages/About'
import AdminLogin from './pages/AdminLogin'
import AdminOverview from './pages/admin/Overview'
import AdminSubmissions from './pages/admin/Submissions'
import AdminFiles from './pages/admin/Files'
import AdminSettings from './pages/admin/Settings'
import { ToastContainer } from './utils/toast'

function Protected({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return null
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  useEffect(() => { fetchMe() }, [fetchMe])
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
        <Route index element={<AdminOverview />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="files" element={<AdminFiles />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
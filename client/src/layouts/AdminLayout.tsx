import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Database, LayoutDashboard, FileText, Image as ImageIcon, Trash2, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function AdminLayout() {
  const loc = useLocation()
  const nav = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const items = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/submissions', label: 'All Submissions', icon: FileText },
    { to: '/admin/files?type=text', label: 'Text Files', icon: FileText },
    { to: '/admin/files?type=image', label: 'Images', icon: ImageIcon },
    { to: '/admin/files', label: 'Trash', icon: Trash2 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]
  const handleLogout = async () => { await logout(); nav('/admin/login') }
  const Sidebar = (
    <aside className="w-60 shrink-0 border-r border-border bg-panel flex flex-col h-full">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <Database className="text-accent" size={20} />
        <span className="font-bold bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">SQLVault</span>
        <span className="text-xs text-gray-500 ml-auto">admin</span>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const Icon = it.icon
          const active = loc.pathname === it.to.split('?')[0]
          return (
            <Link key={it.to} to={it.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${active ? 'bg-accent/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={16} /> {it.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <div className="text-xs text-gray-500 mb-2 truncate">{user?.username}</div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full px-3 py-2 rounded-md hover:bg-white/5">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
  return (
    <div className="h-screen flex bg-bg text-gray-200 overflow-hidden">
      <div className="hidden md:flex">{Sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative">{Sidebar}</div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-border bg-panel/80 flex items-center px-4 gap-3">
          <button className="md:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <span className="text-sm text-gray-400 font-mono">workspace / {loc.pathname}</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
        <footer className="h-7 border-t border-border bg-panel/80 flex items-center px-4 text-[10px] text-gray-500 font-mono">
          <span>SQLVault v1.0</span>
          <span className="ml-auto">status: connected</span>
        </footer>
      </div>
    </div>
  )
}
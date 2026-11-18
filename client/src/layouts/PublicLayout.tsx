import { Outlet, Link, useLocation } from 'react-router-dom'
import { Database, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const nav = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Upload Files' },
    { to: '/about', label: 'About' },
  ]
  return (
    <div className="min-h-screen flex flex-col bg-bg text-gray-200">
      <nav className="sticky top-0 z-40 border-b border-border bg-panel/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Database className="text-accent" size={22} />
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">SQLVault</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`text-sm hover:text-white ${loc.pathname === n.to ? 'text-white' : 'text-gray-400'}`}>{n.label}</Link>
            ))}
            <Link to="/admin/login" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"><LogIn size={16} /> Admin Login</Link>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-panel px-4 py-3 flex flex-col gap-3">
            {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm">{n.label}</Link>)}
            <Link to="/admin/login" onClick={() => setOpen(false)} className="text-sm">Admin Login</Link>
          </div>
        )}
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-panel/50 py-6 text-center text-xs text-gray-500">
        SQLVault — Your files, directly to the database.
      </footer>
    </div>
  )
}
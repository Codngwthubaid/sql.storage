import { useEffect, useState } from 'react'
import { Database, FileText, Image as ImageIcon, HardDrive, Inbox, Clock } from 'lucide-react'
import api from '../../services/api'

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard/stats').then((r) => setStats(r.data.data)).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Submissions', value: stats.totalSubmissions, icon: Inbox },
    { label: 'Total Files', value: stats.totalFiles, icon: Database },
    { label: 'Images', value: stats.images, icon: ImageIcon },
    { label: 'Text Files', value: stats.texts, icon: FileText },
    { label: 'Storage Used', value: formatBytes(stats.storageUsed), icon: HardDrive },
  ] : []

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Overview</h1>
      {loading && <div className="text-gray-400">Loading...</div>}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{c.label}</span>
              <c.icon size={16} className="text-accent" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Clock size={14} /> Recent Submissions</h2>
        <div className="space-y-2">
          {(stats?.recent || []).map((s: any) => (
            <div key={s._id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
              <div>
                <div className="font-medium">{s.senderName || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{s.description || 'No description'}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {!stats?.recent?.length && <div className="text-gray-500 text-sm">No submissions yet.</div>}
        </div>
      </div>
    </div>
  )
}

function formatBytes(b: number) {
  if (!b) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}
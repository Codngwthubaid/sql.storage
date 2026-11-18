import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react'
import api from '../../services/api'
import { toast } from '../../utils/toast'
import Modal from '../../components/Modal'
import type { Submission } from '../../types'

export default function AdminSubmissions() {
  const [items, setItems] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState<Submission | null>(null)
  const limit = 10

  const load = async () => {
    try {
      const { data } = await api.get('/admin/submissions', { params: { page, limit, search, sort } })
      setItems(data.data.items)
      setTotal(data.data.total)
      setPages(data.data.pages)
    } catch (e: any) {
      toast(e?.response?.data?.error || 'Failed', 'error')
    }
  }
  useEffect(() => { load() }, [page, sort])
  useEffect(() => { const t = setTimeout(() => { setPage(1); load() }, 400); return () => clearTimeout(t) }, [search])

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Submissions</h1>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sender/desc..."
            className="pl-7 pr-3 py-1.5 rounded-md bg-panel border border-border text-sm focus:border-accent outline-none w-56" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-2 py-1.5 rounded-md bg-panel border border-border text-sm">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <span className="text-xs text-gray-500">{total} submissions</span>
      </div>

      <div className="space-y-3">
        {items.map((s) => (
          <div key={s._id} className="rounded-xl border border-border bg-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-sm">{s.senderName || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{s.description || 'No description'}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(s.files || []).map((f: any) => (
                <button key={f._id} onClick={() => setSelected(s)} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg border border-border text-xs hover:border-accent">
                  {f.fileType === 'image' ? <ImageIcon size={12} className="text-accent2" /> : <FileText size={12} className="text-accent3" />}
                  <span className="truncate max-w-[120px]">{f.originalName}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-gray-600 font-mono">id: {s._id}</div>
          </div>
        ))}
        {!items.length && <div className="text-gray-500 text-sm">No submissions.</div>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded border border-border disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm text-gray-400">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-1.5 rounded border border-border disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Submission Details">
        {selected && (
          <div className="space-y-3">
            <div className="text-sm"><span className="text-gray-400">Sender:</span> {selected.senderName || 'Anonymous'}</div>
            <div className="text-sm"><span className="text-gray-400">Description:</span> {selected.description || '—'}</div>
            <div className="text-xs text-gray-500 font-mono">id: {selected._id}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {(selected.files || []).map((f: any) => (
                <a key={f._id} href={`${apiBase.replace('/api', '')}/api/admin/files/${f._id}/download`} target="_blank" rel="noreferrer"
                  className="rounded-lg border border-border bg-bg p-2 text-xs hover:border-accent">
                  {f.fileType === 'image' ? (
                    <img src={`${apiBase.replace('/api', '')}/api/admin/files/${f._id}/download`} className="w-full aspect-square object-cover rounded mb-1" />
                  ) : (
                    <div className="aspect-square flex items-center justify-center"><FileText size={32} className="text-accent3" /></div>
                  )}
                  <div className="truncate">{f.originalName}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
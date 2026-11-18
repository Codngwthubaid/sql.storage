import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Grid, List, Trash2, Download, Eye, ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react'
import api from '../../services/api'
import { toast } from '../../utils/toast'
import Modal from '../../components/Modal'
import type { FileItem } from '../../types'

export default function AdminFiles() {
  const [searchParams] = useSearchParams()
  const [files, setFiles] = useState<FileItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  useEffect(() => {
    const t = searchParams.get('type')
    if (t) setType(t)
  }, [searchParams])
  const [sort, setSort] = useState('newest')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('table')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const limit = 12

  const load = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit, search, type, sort }
      if (from) params.from = from
      if (to) params.to = to
      const { data } = await api.get('/admin/files', { params })
      setFiles(data.data.items)
      setTotal(data.data.total)
      setPages(data.data.pages)
    } catch (e: any) {
      toast(e?.response?.data?.error || 'Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, type, sort, from, to])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const openPreview = async (f: FileItem) => {
    const { data } = await api.get(`/admin/files/${f._id}`)
    setPreview(data.data)
  }

  const download = async (f: FileItem) => {
    const res = await api.get(`/admin/files/${f._id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = f.originalName
    a.click()
    URL.revokeObjectURL(url)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await api.delete(`/admin/files/${id}`)
    toast('Deleted', 'success')
    load()
  }

  const bulkDel = async () => {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} files?`)) return
    await api.delete('/admin/files/bulk', { data: { ids: Array.from(selected) } })
    toast('Deleted', 'success')
    setSelected(new Set())
    load()
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const imgSrc = (f: FileItem) => `${apiBase.replace('/api', '')}/api/admin/files/${f._id}/download`

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">Files</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name..."
              className="pl-7 pr-3 py-1.5 rounded-md bg-panel border border-border text-sm focus:border-accent outline-none w-48" />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="px-2 py-1.5 rounded-md bg-panel border border-border text-sm">
            <option value="all">All types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-2 py-1.5 rounded-md bg-panel border border-border text-sm">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className="px-2 py-1.5 rounded-md bg-panel border border-border text-sm" />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className="px-2 py-1.5 rounded-md bg-panel border border-border text-sm" />
          <button onClick={() => setView(view === 'grid' ? 'table' : 'grid')} className="p-1.5 rounded-md border border-border hover:bg-white/5">
            {view === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
          {selected.size > 0 && (
            <button onClick={bulkDel} className="px-3 py-1.5 rounded-md bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30">
              Delete ({selected.size})
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3">{total} files</div>

      {loading && <div className="text-gray-400">Loading...</div>}

      {view === 'table' ? (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-gray-400 text-xs">
              <tr>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Uploaded</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f._id} className="border-t border-border/50 hover:bg-white/5">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(f._id)} onChange={() => toggleSelect(f._id)} />
                  </td>
                  <td className="px-3 py-2 truncate max-w-xs">{f.originalName}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs ${f.fileType === 'image' ? 'text-accent2' : 'text-accent3'}`}>
                      {f.fileType === 'image' ? <ImageIcon size={12} /> : <FileText size={12} />} {f.fileType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{(f.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button onClick={() => openPreview(f)} className="p-1.5 hover:text-accent" title="View"><Eye size={14} /></button>
                    <button onClick={() => download(f)} className="p-1.5 hover:text-accent2" title="Download"><Download size={14} /></button>
                    <button onClick={() => del(f._id)} className="p-1.5 hover:text-red-400" title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {!files.length && !loading && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">No files</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((f) => (
            <div key={f._id} className="rounded-xl border border-border bg-panel p-3 hover:border-accent/40 transition">
              <div className="aspect-square bg-bg rounded-md mb-2 overflow-hidden flex items-center justify-center">
                {f.fileType === 'image' ? (
                  <img src={imgSrc(f)} alt={f.originalName} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={40} className="text-accent3" />
                )}
              </div>
              <div className="text-xs truncate mb-1">{f.originalName}</div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">{(f.fileSize / 1024).toFixed(1)} KB</span>
                <div className="flex gap-1">
                  <button onClick={() => openPreview(f)} className="p-1 hover:text-accent"><Eye size={12} /></button>
                  <button onClick={() => download(f)} className="p-1 hover:text-accent2"><Download size={12} /></button>
                  <button onClick={() => del(f._id)} className="p-1 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded border border-border disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm text-gray-400">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-1.5 rounded border border-border disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.file?.originalName}>
        {preview && <FilePreview data={preview} onDownload={() => download(preview.file)} />}
      </Modal>
    </div>
  )
}

function FilePreview({ data, onDownload }: { data: any; onDownload: () => void }) {
  const f = data.file
  const [zoom, setZoom] = useState(1)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  if (f.fileType === 'image') {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const src = `${apiBase.replace('/api', '')}/api/admin/files/${f._id}/download`
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{f.mimeType}</span>
          <span>·</span>
          <span>{(f.fileSize / 1024).toFixed(1)} KB</span>
          {dims && <><span>·</span><span>{dims.w}×{dims.h}</span></>}
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="ml-auto px-2 py-1 border border-border rounded">Zoom +</button>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="px-2 py-1 border border-border rounded">Zoom -</button>
          <button onClick={onDownload} className="px-2 py-1 border border-border rounded flex items-center gap-1"><Download size={12} /> Download</button>
        </div>
        <div className="overflow-auto bg-bg rounded-lg border border-border p-2 max-h-[70vh]">
          <img src={src} alt={f.originalName} onLoad={(e) => setDims({ w: (e.target as HTMLImageElement).naturalWidth, h: (e.target as HTMLImageElement).naturalHeight })} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="max-w-none" />
        </div>
      </div>
    )
  }
  // text
  const content: string = data.content || ''
  const lines = content.split('\n')
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{f.mimeType}</span>
        <span>·</span>
        <span>{lines.length} lines</span>
        <button onClick={() => { navigator.clipboard.writeText(content); toast('Copied', 'success') }} className="ml-auto px-2 py-1 border border-border rounded">Copy</button>
        <button onClick={onDownload} className="px-2 py-1 border border-border rounded flex items-center gap-1"><Download size={12} /> Download</button>
      </div>
      <div className="bg-[#0d1117] rounded-lg border border-border font-mono text-xs overflow-auto max-h-[70vh]">
        <table className="w-full">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="select-none text-gray-600 text-right px-3 py-0.5 w-12 border-r border-border/50">{i + 1}</td>
                <td className="px-3 py-0.5 whitespace-pre text-gray-200">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
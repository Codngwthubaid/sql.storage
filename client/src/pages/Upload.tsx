import { useState, useRef, useCallback } from 'react'
import { Upload as UploadIcon, X, FileText, Image as ImageIcon } from 'lucide-react'
import api from '../services/api'
import { toast } from '../utils/toast'

// We won't use react-dropzone (not installed). Implement native drag/drop.
export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [senderName, setSenderName] = useState('')
  const [description, setDescription] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = ['.txt', '.png', '.jpg', '.jpeg', '.webp', '.gif']
  const maxFiles = 10
  const maxSize = 10 * 1024 * 1024

  const addFiles = (newFiles: File[]) => {
    const valid: File[] = []
    for (const f of newFiles) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      if (!accept.includes(ext)) { toast('Unsupported file type: ' + f.name, 'error'); continue }
      if (f.size > maxSize) { toast('File too large: ' + f.name, 'error'); continue }
      valid.push(f)
    }
    setFiles((prev) => {
      const combined = [...prev, ...valid]
      if (combined.length > maxFiles) {
        toast(`Max ${maxFiles} files`, 'error')
        return combined.slice(0, maxFiles)
      }
      return combined
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [])

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const submit = async () => {
    if (!files.length) { toast('Select at least one file', 'error'); return }
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    if (senderName) fd.append('senderName', senderName)
    if (description) fd.append('description', description)
    setUploading(true)
    setProgress(0)
    try {
      const { data } = await api.post('/uploads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      toast(`Uploaded ${data.data.fileCount} file(s). Submission ${data.data.submissionId}`, 'success')
      setFiles([])
      setSenderName('')
      setDescription('')
      setProgress(0)
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Upload Files</h1>
      <p className="text-gray-400 mb-6 text-sm">Drag and drop text files or images. No account required.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver ? 'border-accent bg-accent/5' : 'border-border bg-panel/40 hover:border-accent/50'}`}
      >
        <UploadIcon className="mx-auto mb-3 text-accent" size={40} />
        <p className="font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-gray-500 mt-1">.txt .png .jpg .jpeg .webp .gif — max {maxSize / 1024 / 1024}MB each, up to {maxFiles} files</p>
        <input ref={inputRef} type="file" multiple accept={accept.join(',')} className="hidden" onChange={(e) => addFiles(Array.from(e.target.files || []))} />
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-panel p-3">
              {f.type.startsWith('image/') ? <ImageIcon size={18} className="text-accent2" /> : <FileText size={18} className="text-accent3" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{f.name}</div>
                <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</div>
              </div>
              {f.type.startsWith('image/') && (
                <img src={URL.createObjectURL(f)} alt="" className="w-12 h-12 object-cover rounded border border-border" />
              )}
              <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-400"><X size={16} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Sender Name (optional)</label>
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-panel border border-border text-sm focus:border-accent outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-panel border border-border text-sm focus:border-accent outline-none" />
        </div>
      </div>

      {uploading && (
        <div className="mt-6">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">{progress}%</div>
        </div>
      )}

      <button onClick={submit} disabled={uploading || !files.length}
        className="mt-6 px-6 py-3 rounded-lg bg-accent hover:bg-blue-600 disabled:opacity-50 text-white font-medium transition">
        {uploading ? 'Uploading...' : 'Submit Files'}
      </button>
    </div>
  )
}
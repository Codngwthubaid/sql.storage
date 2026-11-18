import { create } from 'zustand'

interface Toast { id: number; msg: string; type: 'success' | 'error' | 'info' }
interface S { toasts: Toast[]; show: (msg: string, type?: Toast['type']) => void; remove: (id: number) => void }

export const useToastStore = create<S>((set) => ({
  toasts: [],
  show: (msg, type = 'info') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function toast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  useToastStore.getState().show(msg, type)
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)
  const color = (t: string) => t === 'success' ? 'border-green-500/50 bg-green-500/10' : t === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-border bg-panel'
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} className={`px-4 py-3 rounded-lg border text-sm cursor-pointer ${color(t.type)}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
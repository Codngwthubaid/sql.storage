import { useAuthStore } from '../../store/authStore'

export default function AdminSettings() {
  const user = useAuthStore((s) => s.user)
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <div className="rounded-xl border border-border bg-panel p-6 max-w-lg space-y-3">
        <div className="text-sm"><span className="text-gray-400">Username:</span> {user?.username}</div>
        <div className="text-sm"><span className="text-gray-400">Storage:</span> local</div>
        <div className="text-sm text-gray-500">Configure additional settings via environment variables on the server.</div>
      </div>
    </div>
  )
}
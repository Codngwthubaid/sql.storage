import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User { id: string; username: string }
interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      login: async (username, password) => {
        set({ loading: true })
        try {
          const { data } = await api.post('/admin/login', { username, password })
          set({ user: data.data, loading: false })
        } catch (e) {
          set({ loading: false })
          throw e
        }
      },
      logout: async () => {
        await api.post('/admin/logout')
        set({ user: null })
      },
      fetchMe: async () => {
        try {
          const { data } = await api.get('/admin/me')
          set({ user: data.data })
        } catch {
          set({ user: null })
        }
      },
    }),
    { name: 'sqlvault-auth' }
  )
)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    title: string | null
    location: string | null
    website: string | null
}

interface UserStore {
    user: UserProfile | null
    setUser: (user: UserProfile | null) => void
    updateUser: (updates: Partial<UserProfile>) => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
        }),
        {
            name: 'user-storage',
        }
    )
)

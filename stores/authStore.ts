import type { StateStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AUTH_STATE_STORAGE_KEY } from '@/constants/auth'

export interface AuthUser {
  id: number
  needUpdate: boolean
  userType: string
}

interface AuthStore {
  authUser: AuthUser | null
  shouldAutoOpenAnnouncement: boolean
  setLoginSession: (authUser: AuthUser) => void
  markPasswordUpdated: () => void
  consumeAnnouncementAutoOpen: () => boolean
  clearLoginSession: () => void
}

type PersistedAuthState = Pick<AuthStore, 'authUser'>

function createAuthStorage() {
  if (typeof window === 'undefined')
    return undefined

  return window.localStorage
}

function resolvePersistStorage() {
  return createJSONStorage<PersistedAuthState>(() => createAuthStorage() as StateStorage)
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      shouldAutoOpenAnnouncement: false,
      setLoginSession: (authUser) => {
        set({
          authUser,
          shouldAutoOpenAnnouncement: true,
        })
      },
      markPasswordUpdated: () => {
        set(state => ({
          authUser: state.authUser
            ? {
                ...state.authUser,
                needUpdate: false,
              }
            : null,
        }))
      },
      consumeAnnouncementAutoOpen: () => {
        const shouldAutoOpenAnnouncement = get().shouldAutoOpenAnnouncement
        if (shouldAutoOpenAnnouncement) {
          set({
            shouldAutoOpenAnnouncement: false,
          })
        }
        return shouldAutoOpenAnnouncement
      },
      clearLoginSession: () => {
        set({
          authUser: null,
          shouldAutoOpenAnnouncement: false,
        })
      },
    }),
    {
      name: AUTH_STATE_STORAGE_KEY,
      storage: resolvePersistStorage(),
      partialize: state => ({
        authUser: state.authUser,
      }),
    },
  ),
)

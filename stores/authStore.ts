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
  setLoginSession: (authUser: AuthUser) => void
  markPasswordUpdated: () => void
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
    set => ({
      authUser: null,
      setLoginSession: (authUser) => {
        set({
          authUser,
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
      clearLoginSession: () => {
        set({
          authUser: null,
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

import { AUTH_USER_STORAGE_KEY } from '@/constants/auth'
import { useAuthStore } from '@/stores/authStore'

export interface LoginSessionPayload {
  id: number
  needUpdate: boolean
  userType: string
}

interface StoredAuthUser {
  id: number
  needUpdate: boolean
  userType: string
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function persistLoginSession(payload: LoginSessionPayload) {
  useAuthStore.getState().setLoginSession({
    id: payload.id,
    needUpdate: payload.needUpdate,
    userType: payload.userType,
  })

  if (!canUseStorage())
    return

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify({
    id: payload.id,
    needUpdate: payload.needUpdate,
    userType: payload.userType,
  }))
}

export function readAuthUser() {
  const authUser = useAuthStore.getState().authUser
  if (authUser)
    return authUser

  if (!canUseStorage())
    return null

  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
  if (!raw)
    return null

  try {
    const payload = JSON.parse(raw) as Partial<{ id: number, needUpdate: boolean, userType: string }>
    if (
      typeof payload.id !== 'number'
      || typeof payload.needUpdate !== 'boolean'
      || typeof payload.userType !== 'string'
    ) {
      return null
    }

    return payload as StoredAuthUser
  }
  catch {
    return null
  }
}

export function markPasswordUpdated() {
  useAuthStore.getState().markPasswordUpdated()

  if (!canUseStorage())
    return

  const authUser = readAuthUser()
  if (!authUser)
    return

  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      ...authUser,
      needUpdate: false,
    }),
  )
}

export function clearLoginSession() {
  useAuthStore.getState().clearLoginSession()

  if (!canUseStorage())
    return

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

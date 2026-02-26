import { ACCESS_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from '@/constants/auth'

export interface LoginSessionPayload {
  id: number
  needUpdate: boolean
  token: string
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
  if (!canUseStorage())
    return

  const authUser: StoredAuthUser = {
    id: payload.id,
    needUpdate: payload.needUpdate,
    userType: payload.userType,
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.token)
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser))
}

export function readAuthUser() {
  if (!canUseStorage())
    return null

  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
  if (!raw)
    return null

  try {
    const payload = JSON.parse(raw) as Partial<StoredAuthUser>
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

export function updateAccessToken(token: string) {
  if (!canUseStorage())
    return

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

export function markPasswordUpdated() {
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
  if (!canUseStorage())
    return

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

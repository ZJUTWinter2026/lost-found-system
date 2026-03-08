import { clearLoginSession } from '@/utils/auth'

export const UNAUTHORIZED_ERROR_CODE = 20000

const LOGIN_PATH = '/login'
const UNAUTHORIZED_REASON = 'unauthorized'
let hasRedirected = false

export function isUnauthorizedCode(code: unknown): code is number {
  return code === UNAUTHORIZED_ERROR_CODE
}

export function handleUnauthorized() {
  if (typeof window === 'undefined')
    return

  clearLoginSession()

  if (window.location.pathname === LOGIN_PATH)
    return

  if (hasRedirected)
    return

  hasRedirected = true
  const loginUrl = new URL(LOGIN_PATH, window.location.origin)
  loginUrl.searchParams.set('reason', UNAUTHORIZED_REASON)
  window.location.replace(loginUrl.toString())
}

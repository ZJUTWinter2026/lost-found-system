import { clearLoginSession } from '@/utils/auth'

export const ACCOUNT_DISABLED_ERROR_CODE = 30017

const LOGIN_PATH = '/login'
const DISABLED_REASON = 'disabled'
let hasRedirected = false

export function isAccountDisabledCode(code: unknown): code is number {
  return code === ACCOUNT_DISABLED_ERROR_CODE
}

export function handleAccountDisabled() {
  if (typeof window === 'undefined')
    return

  clearLoginSession()

  if (window.location.pathname === LOGIN_PATH)
    return

  if (hasRedirected)
    return

  hasRedirected = true
  const loginUrl = new URL(LOGIN_PATH, window.location.origin)
  loginUrl.searchParams.set('reason', DISABLED_REASON)
  window.location.replace(loginUrl.toString())
}

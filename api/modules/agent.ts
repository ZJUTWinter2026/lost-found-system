import { handleAccountDisabled, isAccountDisabledCode } from '@/api/accountDisabled'
import { request } from '@/api/request'
import { ApiRequestError } from '@/api/types'

interface CreateAgentSessionData {
  session_id?: unknown
}

interface AgentSessionsData {
  sessions?: unknown
}

interface AgentHistoryData {
  messages?: unknown
}

export interface AgentSession {
  session_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface AgentHistoryMessage {
  role: 'user' | 'assistant'
  content: string
  images: string[]
  created_at: string
}

export interface AgentHistoryParams {
  session_id: string
}

export interface CreateAgentSessionPayload {
  title?: string
}

export interface AgentStreamPayload {
  session_id: string
  message: string
  images?: string[]
}

export interface AgentStreamEvent {
  event_id: string
  seq: number
  ts: number
  content: string
}

interface AgentStreamCallbacks {
  onEvent: (event: AgentStreamEvent) => void
  onDone?: () => void
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toText(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.trim()
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value))
    return value

  if (typeof value !== 'string')
    return undefined

  const parsed = Number(value)
  if (!Number.isFinite(parsed))
    return undefined

  return parsed
}

function toTextArray(value: unknown) {
  if (!Array.isArray(value))
    return []

  return value
    .map(item => toText(item))
    .filter(Boolean)
}

function toOptionalText(value: unknown) {
  const text = toText(value)
  return text || undefined
}

function toAgentSession(value: unknown): AgentSession | null {
  if (!isObject(value))
    return null

  const sessionId = toText(value.session_id)
  if (!sessionId)
    return null

  return {
    session_id: sessionId,
    title: toText(value.title),
    created_at: toText(value.created_at),
    updated_at: toText(value.updated_at),
  }
}

function toAgentHistoryMessage(value: unknown): AgentHistoryMessage | null {
  if (!isObject(value))
    return null

  const role = toText(value.role) === 'user' ? 'user' : 'assistant'
  const content = toText(value.content)
  const createdAt = toText(value.created_at)

  if (!content)
    return null

  return {
    role,
    content,
    images: toTextArray(value.images),
    created_at: createdAt,
  }
}

function toAgentStreamEvent(raw: string): AgentStreamEvent | null {
  try {
    const parsed = JSON.parse(raw)
    if (!isObject(parsed))
      return null

    // 兼容旧格式：仅消费 type=content；新格式不再返回 type 字段
    const legacyType = toText(parsed.type)
    if (legacyType && legacyType !== 'content')
      return null

    return {
      event_id: toText(parsed.event_id),
      seq: toNumber(parsed.seq) || 0,
      ts: toNumber(parsed.ts) || Date.now(),
      content: typeof parsed.content === 'string' ? parsed.content : '',
    }
  }
  catch {
    return null
  }
}

function extractSSEData(frame: string) {
  const dataLines = frame
    .split(/\r?\n/)
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trimStart())
    .filter(Boolean)

  if (!dataLines.length)
    return ''

  return dataLines.join('\n')
}

function handleSSEFrame(frame: string, callbacks: AgentStreamCallbacks) {
  const data = extractSSEData(frame)
  if (!data)
    return false

  if (data === '[DONE]') {
    callbacks.onDone?.()
    return true
  }

  const event = toAgentStreamEvent(data)
  if (event)
    callbacks.onEvent(event)

  return false
}

async function resolveStreamError(response: Response) {
  const status = response.status
  const fallbackMessage = status ? `请求失败（${status}）` : '请求失败'

  try {
    const payload = await response.json()
    if (!isObject(payload))
      return new ApiRequestError(fallbackMessage, { status })

    const message = toOptionalText(payload.message) || fallbackMessage
    const code = typeof payload.code === 'number' ? payload.code : undefined
    if (isAccountDisabledCode(code))
      handleAccountDisabled()
    return new ApiRequestError(message, { code, status })
  }
  catch {
    return new ApiRequestError(fallbackMessage, { status })
  }
}

export async function createAgentSession(payload: CreateAgentSessionPayload = {}) {
  const title = toOptionalText(payload.title)

  const data = await request<CreateAgentSessionData>({
    url: '/agent/session',
    method: 'POST',
    data: title ? { title } : {},
  })

  const sessionId = toText(data.session_id)
  if (!sessionId)
    throw new ApiRequestError('创建会话失败：未返回会话 ID')

  return sessionId
}

export async function getAgentSessions() {
  const data = await request<AgentSessionsData>({
    url: '/agent/sessions',
    method: 'GET',
  })

  const list = Array.isArray(data.sessions) ? data.sessions : []
  return list
    .map(toAgentSession)
    .filter((item): item is AgentSession => item !== null)
}

export async function getAgentHistory(sessionId: string) {
  const normalizedSessionId = toText(sessionId)
  if (!normalizedSessionId)
    throw new ApiRequestError('sessionId 不能为空')

  const data = await request<AgentHistoryData>({
    url: '/agent/history',
    method: 'GET',
    params: { session_id: normalizedSessionId },
  })

  const list = Array.isArray(data.messages) ? data.messages : []
  return list
    .map(toAgentHistoryMessage)
    .filter((item): item is AgentHistoryMessage => item !== null)
}

export async function streamAgentMessage(
  payload: AgentStreamPayload,
  callbacks: AgentStreamCallbacks,
  signal?: AbortSignal,
) {
  const sessionId = toText(payload.session_id)
  const content = toText(payload.message)

  if (!sessionId)
    throw new ApiRequestError('sessionId 不能为空')
  if (!content)
    throw new ApiRequestError('消息不能为空')

  const response = await fetch('/api/agent/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      session_id: sessionId,
      message: content,
      images: toTextArray(payload.images),
    }),
    signal,
  })

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || contentType.includes('application/json'))
    throw await resolveStreamError(response)

  if (!response.body)
    throw new ApiRequestError('流式响应不可用', { status: response.status })

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split(/\r?\n\r?\n/)
    buffer = frames.pop() || ''

    for (const frame of frames) {
      if (handleSSEFrame(frame, callbacks))
        return
    }
  }

  const tail = `${buffer}${decoder.decode()}`
  if (tail.trim()) {
    const frames = tail.split(/\r?\n\r?\n/)
    for (const frame of frames) {
      if (handleSSEFrame(frame, callbacks))
        return
    }
  }

  callbacks.onDone?.()
}

export interface ApiEnvelope<T> {
  code?: number
  message?: string
  data: T
}

interface ApiRequestErrorMeta {
  code?: number
  status?: number
}

export class ApiRequestError extends Error {
  readonly code?: number
  readonly status?: number

  constructor(message: string, meta: ApiRequestErrorMeta = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = meta.code
    this.status = meta.status
  }
}

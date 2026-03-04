import type { AxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '@/api/types'
import { AxiosError } from 'axios'
import { handleAccountDisabled, isAccountDisabledCode } from '@/api/accountDisabled'
import { apiClient } from '@/api/client'
import { ApiRequestError } from '@/api/types'

interface ResponseMessagePayload {
  message?: string
  code?: number
}

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return typeof payload === 'object'
    && payload !== null
    && 'data' in payload
    && ('code' in payload || 'message' in payload)
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = (payload as ResponseMessagePayload).message
    if (typeof message === 'string' && message)
      return message
  }

  return fallback
}

function resolveErrorCode(payload: unknown) {
  if (typeof payload !== 'object' || payload === null || !('code' in payload))
    return undefined

  const code = (payload as ResponseMessagePayload).code
  if (typeof code !== 'number')
    return undefined

  return code
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiEnvelope<T> | T>(config)
    const payload = response.data

    if (!isApiEnvelope<T>(payload))
      return payload as T

    const { code, data, message } = payload
    if (typeof code === 'number' && code !== 0) {
      if (isAccountDisabledCode(code))
        handleAccountDisabled()
      throw new ApiRequestError(message || '请求失败', { code, status: response.status })
    }

    return data
  }
  catch (error) {
    if (error instanceof ApiRequestError)
      throw error

    if (error instanceof AxiosError) {
      const errorCode = resolveErrorCode(error.response?.data)
      if (isAccountDisabledCode(errorCode))
        handleAccountDisabled()

      throw new ApiRequestError(
        resolveErrorMessage(error.response?.data, error.message || '网络请求失败'),
        { status: error.response?.status, code: errorCode },
      )
    }

    throw new ApiRequestError('未知请求错误')
  }
}

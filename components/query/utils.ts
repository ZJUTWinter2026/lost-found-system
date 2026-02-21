import type { TimeRangeValue } from './types'
import { TIME_RANGE_HOUR_MAP } from './constants'

const pad = (value: number) => String(value).padStart(2, '0')

export function formatDateTime(dateText: string) {
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime()))
    return '-'

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function toTimestamp(dateText: string) {
  const date = new Date(dateText)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export function isWithinTimeRange(dateText: string, timeRange?: TimeRangeValue) {
  if (!timeRange)
    return true

  const target = toTimestamp(dateText)
  if (!target)
    return false

  const hours = TIME_RANGE_HOUR_MAP[timeRange]
  const threshold = Date.now() - hours * 60 * 60 * 1000
  return target >= threshold
}

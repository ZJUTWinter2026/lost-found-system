import type { ItemStatus, TimeRangeValue } from './types'
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

const ITEM_STATUS_TAG_COLOR_MAP: Record<ItemStatus, string> = {
  待审核: 'gold',
  已通过: 'blue',
  已归还: 'blue',
  已找回: 'blue',
  已取消: 'default',
  被驳回: 'error',
  已归档: 'default',
  寻找中: 'gold',
  待认领: 'processing',
}

export function resolveItemStatusTagColor(status: ItemStatus) {
  return ITEM_STATUS_TAG_COLOR_MAP[status] || 'default'
}

import type { ItemPostType, ItemStatus } from '@/components/query/types'

export type LostFoundStatusCode
  = 'PENDING'
    | 'APPROVED'
    | 'SOLVED'
    | 'CANCELLED'
    | 'REJECTED'
    | 'ARCHIVED'

export const LOST_FOUND_STATUS_TEXT_MAP: Record<LostFoundStatusCode, string> = {
  PENDING: '待审核',
  APPROVED: '寻找中',
  SOLVED: '已归还/已找回',
  CANCELLED: '已取消',
  REJECTED: '被驳回',
  ARCHIVED: '已归档',
}

const LOST_FOUND_STATUS_ALIASES: Record<LostFoundStatusCode, string[]> = {
  PENDING: ['0', 'PENDING', '待审核'],
  APPROVED: ['1', '2', 'APPROVED', 'MATCHED', '已通过', '已匹配', '寻找中', '待认领'],
  SOLVED: ['3', 'SOLVED', 'CLAIMED', '已认领', '已归还', '已找回', '已解决'],
  CANCELLED: ['4', 'CANCELLED', 'CANCELED', '已取消'],
  REJECTED: ['5', 'REJECTED', '已驳回', '被驳回', '已拒绝'],
  ARCHIVED: ['6', 'ARCHIVED', '已归档'],
}

const STATUS_ALIAS_TO_CODE = new Map<string, LostFoundStatusCode>(
  Object.entries(LOST_FOUND_STATUS_ALIASES).flatMap(([status, aliases]) =>
    aliases.map(alias => [alias, status as LostFoundStatusCode] as const),
  ),
)

function toText(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.trim()
}

function toStatusToken(value: unknown) {
  return toText(value).toUpperCase()
}

function resolvePostType(value: unknown): ItemPostType {
  const normalized = toText(value)
  const upper = normalized.toUpperCase()
  if (normalized === '2' || normalized === '招领' || upper === 'FOUND')
    return '招领'

  return '失物'
}

export function normalizeLostFoundStatus(value: unknown): LostFoundStatusCode | undefined {
  const token = toStatusToken(value)
  if (!token)
    return undefined

  return STATUS_ALIAS_TO_CODE.get(token)
}

export function mapLostFoundStatusToItemStatus(
  status: unknown,
  options: {
    publishType?: unknown
    statusText?: unknown
  } = {},
): ItemStatus {
  const normalizedStatus
    = normalizeLostFoundStatus(options.statusText) ?? normalizeLostFoundStatus(status)
  const postType = resolvePostType(options.publishType)

  if (normalizedStatus === 'PENDING')
    return '待审核'

  if (normalizedStatus === 'APPROVED')
    return postType === '招领' ? '待认领' : '寻找中'

  if (normalizedStatus === 'SOLVED')
    return postType === '招领' ? '已归还' : '已找回'

  if (normalizedStatus === 'CANCELLED')
    return '已取消'

  if (normalizedStatus === 'REJECTED')
    return '被驳回'

  if (normalizedStatus === 'ARCHIVED')
    return '已归档'

  const normalizedText = toText(options.statusText) || toText(status)
  if (normalizedText === '待认领')
    return '待认领'

  if (normalizedText === '寻找中')
    return '寻找中'

  return postType === '招领' ? '待认领' : '寻找中'
}

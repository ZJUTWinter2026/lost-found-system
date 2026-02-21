import type { ItemPostType, ItemStatus, ReviewStatus, TimeRangeValue } from '@/components/query/types'

export interface PublishFormValues {
  postType?: ItemPostType
  itemType?: string
  location?: string
  timeRange?: TimeRangeValue
  status?: ItemStatus
  itemName?: string
  occurredAt?: string
  features?: string
  contactName?: string
  contactPhone?: string
  hasReward?: boolean
  rewardRemark?: string
}

export interface PublishDraft {
  postType?: ItemPostType
  itemType?: string
  location?: string
  timeRange?: TimeRangeValue
  status?: ItemStatus
  itemName?: string
  occurredAt?: string
  features?: string
  contactName?: string
  contactPhone?: string
  hasReward: boolean
  rewardRemark?: string
  photos: string[]
}

export interface SubmitPublishPayload {
  postType: ItemPostType
  itemType: string
  location: string
  timeRange: TimeRangeValue
  status: ItemStatus
  itemName: string
  occurredAt: string
  features: string
  contactName: string
  contactPhone: string
  hasReward: boolean
  rewardRemark?: string
  photos: string[]
}

export interface PublishRecord extends SubmitPublishPayload {
  id: string
  createdAt: string
  reviewStatus: ReviewStatus
}

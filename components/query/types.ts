export type ItemStatus = '寻找中' | '待认领' | '已归还'

export type ItemPostType = '失物' | '招领'
export type CampusCode = 'ZHAO_HUI' | 'PING_FENG' | 'MO_GAN_SHAN'

export type ClaimAction = '找回' | '归还'

export type ReviewStatus = '待审核' | '处理中' | '已处理'

export type TimeRangeValue = '24h' | '3d' | '7d' | '30d'

export interface QueryFilters {
  publishType?: ItemPostType
  itemType?: string
  campus?: CampusCode
  location?: string
  timeRange?: TimeRangeValue
  status?: ItemStatus
}

export interface LostFoundItem {
  id: string
  name: string
  itemType: string
  location: string
  occurredAt: string
  status: ItemStatus
  postType: ItemPostType
  description: string
  features: string
  storageLocation: string
  claimCount: number
  contact: string
  hasReward: boolean
  rewardRemark?: string
  photos: string[]
}

export interface ClaimRequest {
  id: string
  itemId: string
  itemName: string
  action: ClaimAction
  requestCategory: ItemPostType
  detail: string
  photos: string[]
  createdAt: string
  status: ReviewStatus
}

export interface FeedbackRecord {
  id: string
  types: string[]
  description: string
  createdAt: string
  status: ReviewStatus
  source: '意见箱' | '物品详情' | '反馈页'
}

export interface SubmitClaimPayload {
  itemId: string
  action: ClaimAction
  detail: string
  photos: string[]
}

export interface SubmitFeedbackPayload {
  types: string[]
  description: string
  source: FeedbackRecord['source']
  postId?: string | number
}

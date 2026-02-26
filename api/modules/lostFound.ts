import type { PublishRecord, PublishReviewStatus } from '@/components/publish/types'
import type { ItemPostType, ItemStatus, LostFoundItem, SubmitClaimPayload } from '@/components/query/types'
import { request } from '@/api/request'

export type PostPublishType = 'LOST' | 'FOUND'
export type PostCampus = 'ZHAO_HUI' | 'PING_FENG' | 'MO_GAN_SHAN'
export type PostStatus = '0' | '1' | '2'
export type MyPostReviewStatus = '0' | '1' | '2' | '3' | '4' | '5'

interface PostStatusValueMap {
  0: '0'
  1: '1'
  2: '2'
}

type NumericPostStatus = keyof PostStatusValueMap

interface MyPostStatusValueMap {
  0: '0'
  1: '1'
  2: '2'
  3: '3'
  4: '4'
  5: '5'
}

type NumericMyPostStatus = keyof MyPostStatusValueMap

export interface LostFoundListParams {
  publish_type?: PostPublishType
  item_type?: string
  campus?: PostCampus
  location?: string
  status?: PostStatus | NumericPostStatus
  start_time?: string
  end_time?: string
  page?: number
  page_size?: number
}

export interface LostFoundListItem {
  campus: string
  event_time: string
  features: string
  id: number
  images: string[]
  item_name: string
  item_type: string
  item_type_other?: string
  location: string
  publish_type: string
  status: string
}

export interface LostFoundListData {
  list: LostFoundListItem[]
  page: number
  page_size: number
  total: number
}

export interface PublishPostPayload {
  publish_type: PostPublishType
  item_name: string
  item_type: string
  item_type_other: string
  campus: PostCampus
  location: string
  storage_location: string
  event_time: string
  features: string
  contact_name: string
  contact_phone: string
  has_reward: boolean
  images: string[]
}

interface PublishPostData {
  id: number
}

export interface MyPostListParams {
  publish_type?: PostPublishType
  status?: MyPostReviewStatus | NumericMyPostStatus
  page?: number
  page_size?: number
}

export interface MyPostListItem {
  cancel_reason?: string
  created_at: string
  event_time: string
  id: number
  item_name: string
  item_type: string
  item_type_other?: string
  location: string
  publish_type: string
  reject_reason?: string
  status: string
  status_text?: string
}

export interface MyPostListData {
  list: MyPostListItem[]
  page: number
  page_size: number
  total: number
}

export interface LostFoundDetailData {
  archive_method: string
  campus: string
  cancel_reason: string
  claim_count: number
  contact_name: string
  contact_phone: string
  created_at: string
  event_time: string
  features: string
  has_reward: boolean
  id: number
  images: string[]
  item_name: string
  item_type: string
  item_type_other: string
  location: string
  processed_at: string
  publish_type: string
  reject_reason: string
  status: string
  storage_location: string
}

export interface UpdateMyPostPayload {
  post_id: number
  item_name: string
  item_type: string
  item_type_other: string
  campus: PostCampus
  location: string
  storage_location: string
  event_time: string
  features: string
  contact_name: string
  contact_phone: string
  has_reward: boolean
  images: string[]
}

export interface CancelMyPostPayload {
  post_id: number
  reason: string
}

export interface DeleteMyPostPayload {
  post_id: number
}

export interface ClaimApplyPayload {
  post_id: number
  description: string
  proof_images: string[]
}

interface ClaimApplyData {
  claim_id: number
}

export interface ClaimListItem {
  created_at: string
  description: string
  id: number
  post_id: number
  proof_images: string[]
  status: string
}

interface ClaimListData {
  list: ClaimListItem[]
}

export interface ReviewClaimPayload {
  claim_id: number
  action: 1 | 2
}

interface PostActionResult {
  success: boolean
}

function toText(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.trim()
}

function resolvePostType(value: string): ItemPostType {
  const normalized = toText(value)
  const upper = normalized.toUpperCase()
  if (normalized === '2' || upper === 'FOUND' || normalized === '招领')
    return '招领'

  return '失物'
}

function resolveLostFoundItemStatus(value: string): ItemStatus {
  const normalized = toText(value)
  const upper = normalized.toUpperCase()

  if (
    normalized === '2'
    || normalized === '已认领'
    || normalized === '已归还'
    || upper === 'CLAIMED'
    || upper === 'ARCHIVED'
  ) {
    return '已归还'
  }

  if (
    normalized === '1'
    || normalized === '待认领'
    || normalized === '已发布'
    || upper === 'PUBLISHED'
  ) {
    return '待认领'
  }

  return '寻找中'
}

function resolveReviewStatus(value: string, statusText?: string): PublishReviewStatus {
  const normalizedText = toText(statusText)
  if (
    normalizedText === '待审核'
    || normalizedText === '已通过'
    || normalizedText === '已匹配'
    || normalizedText === '已认领'
    || normalizedText === '已驳回'
    || normalizedText === '已取消'
  ) {
    return normalizedText
  }

  const normalized = toText(value).toUpperCase()
  if (normalized === '1' || normalized === 'APPROVED')
    return '已通过'
  if (normalized === '2' || normalized === 'MATCHED')
    return '已匹配'
  if (normalized === '3' || normalized === 'CLAIMED')
    return '已认领'
  if (normalized === '4' || normalized === 'CANCELED' || normalized === 'CANCELLED')
    return '已取消'
  if (normalized === '5' || normalized === 'REJECTED')
    return '已驳回'

  return '待审核'
}

function resolveMyPostItemStatus(postType: ItemPostType, reviewStatus: PublishReviewStatus): ItemStatus {
  if (reviewStatus === '已认领')
    return '已归还'

  return postType === '招领' ? '待认领' : '寻找中'
}

export function mapPostListItemToLostFoundItem(item: LostFoundListItem): LostFoundItem {
  return {
    id: String(item.id),
    name: item.item_name,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    occurredAt: item.event_time,
    status: resolveLostFoundItemStatus(item.status),
    postType: resolvePostType(item.publish_type),
    description: item.features,
    features: item.features,
    storageLocation: item.location,
    claimCount: 0,
    contact: '',
    hasReward: false,
    photos: item.images,
  }
}

export function mapPostDetailToLostFoundItem(item: LostFoundDetailData): LostFoundItem {
  const contactName = toText(item.contact_name)
  const contactPhone = toText(item.contact_phone)

  return {
    id: String(item.id),
    name: item.item_name,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    occurredAt: item.event_time,
    status: resolveLostFoundItemStatus(item.status),
    postType: resolvePostType(item.publish_type),
    description: item.features,
    features: item.features,
    storageLocation: toText(item.storage_location) || item.location,
    claimCount: item.claim_count,
    contact: [contactName, contactPhone].filter(Boolean).join(' '),
    hasReward: item.has_reward,
    photos: item.images,
  }
}

export function mapPostDetailToPublishRecord(item: LostFoundDetailData): PublishRecord {
  const postType = resolvePostType(item.publish_type)
  const reviewStatus = resolveReviewStatus(item.status)

  return {
    id: String(item.id),
    postType,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    timeRange: '7d',
    status: resolveMyPostItemStatus(postType, reviewStatus),
    itemName: item.item_name,
    occurredAt: item.event_time,
    features: item.features,
    contactName: toText(item.contact_name),
    contactPhone: toText(item.contact_phone),
    hasReward: item.has_reward,
    photos: item.images.slice(0, 3),
    createdAt: item.created_at,
    reviewStatus,
    rejectReason: toText(item.reject_reason) || undefined,
    updatedAt: toText(item.processed_at) || undefined,
  }
}

export function mapMyPostListItemToPublishRecord(item: MyPostListItem): PublishRecord {
  const postType = resolvePostType(item.publish_type)
  const reviewStatus = resolveReviewStatus(item.status, item.status_text)

  return {
    id: String(item.id),
    postType,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    timeRange: '7d',
    status: resolveMyPostItemStatus(postType, reviewStatus),
    itemName: item.item_name,
    occurredAt: item.event_time,
    features: '',
    contactName: '',
    contactPhone: '',
    hasReward: false,
    photos: [],
    createdAt: item.created_at,
    reviewStatus,
    rejectReason: toText(item.reject_reason) || undefined,
    updatedAt: undefined,
  }
}

function toPostStatus(status: LostFoundListParams['status']) {
  if (status === undefined)
    return undefined

  return String(status) as PostStatus
}

function toMyPostStatus(status: MyPostListParams['status']) {
  if (status === undefined)
    return undefined

  return String(status) as MyPostReviewStatus
}

export function getLostFoundList(params: LostFoundListParams = {}) {
  return request<LostFoundListData>({
    url: '/post/list',
    method: 'GET',
    params: {
      ...params,
      item_type: params.item_type?.trim() || undefined,
      location: params.location?.trim() || undefined,
      status: toPostStatus(params.status),
    },
  })
}

export function getPostDetailData(postId: string | number) {
  const id = String(postId).trim()

  return request<LostFoundDetailData>({
    url: `/post/detail/${encodeURIComponent(id)}`,
    method: 'GET',
    params: { id },
  })
}

export function getLostFoundItemDetail(itemId: string) {
  return getPostDetailData(itemId).then(mapPostDetailToLostFoundItem)
}

export function getMyPostList(params: MyPostListParams = {}) {
  return request<MyPostListData>({
    url: '/post/my-list',
    method: 'GET',
    params: {
      ...params,
      status: toMyPostStatus(params.status),
    },
  })
}

export function publishPost(payload: PublishPostPayload) {
  return request<PublishPostData>({
    url: '/post/publish',
    method: 'POST',
    data: payload,
  })
}

export function updateMyPost(payload: UpdateMyPostPayload) {
  return request<PostActionResult>({
    url: '/post/update',
    method: 'PUT',
    data: payload,
  })
}

export function cancelMyPost(payload: CancelMyPostPayload) {
  return request<PostActionResult>({
    url: '/post/cancel',
    method: 'POST',
    data: payload,
  })
}

export function deleteMyPost(payload: DeleteMyPostPayload) {
  return request<PostActionResult>({
    url: '/post/delete',
    method: 'DELETE',
    data: payload,
  })
}

export function submitClaimRequest(payload: SubmitClaimPayload) {
  const postId = Number(payload.itemId)

  return request<ClaimApplyData>({
    url: '/claim/apply',
    method: 'POST',
    data: {
      post_id: Number.isFinite(postId) ? postId : 0,
      description: payload.detail.trim(),
      proof_images: payload.photos.slice(0, 3),
    },
  })
}

export function getClaimList(postId: string | number) {
  const id = String(postId).trim()

  return request<ClaimListData>({
    url: `/claim/list/${encodeURIComponent(id)}`,
    method: 'GET',
    params: { post_id: id },
  })
}

export function reviewClaim(payload: ReviewClaimPayload) {
  return request<PostActionResult>({
    url: '/claim/review',
    method: 'POST',
    data: payload,
  })
}

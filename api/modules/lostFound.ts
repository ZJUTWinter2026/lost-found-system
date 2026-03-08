import type { PublishRecord, PublishReviewStatus } from '@/components/publish/types'
import type { ItemPostType, LostFoundItem, SubmitClaimPayload } from '@/components/query/types'
import { request } from '@/api/request'
import { mapLostFoundStatusToItemStatus, normalizeLostFoundStatus } from '@/utils/lostFoundStatus'

export type PostPublishType = 'LOST' | 'FOUND'
export type PostCampus = 'ZHAO_HUI' | 'PING_FENG' | 'MO_GAN_SHAN'
export type PostStatus
  = 'PENDING'
    | 'APPROVED'
    | 'SOLVED'
    | 'CANCELLED'
    | 'REJECTED'
    | 'ARCHIVED'
export type MyPostReviewStatus
  = 'PENDING'
    | 'APPROVED'
    | 'SOLVED'
    | 'CANCELLED'
    | 'REJECTED'

export interface LostFoundListParams {
  publish_type?: PostPublishType
  item_type?: string
  campus?: PostCampus
  location?: string
  start_time?: string
  end_time?: string
  page?: number
  page_size?: number
}

export interface LostFoundListItem {
  campus: string
  event_time: string
  features: string
  has_reward: boolean
  id: number
  images: string[]
  item_name: string
  item_type: string
  item_type_other?: string
  location: string
  publish_type: string
  reward_description: string
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
  campus: PostCampus
  location: string
  storage_location?: string
  event_time: string
  features: string
  contact_name: string
  contact_phone: string
  has_reward?: boolean
  reward_description?: string
  images: string[]
}

interface PublishPostData {
  id: number
}

export interface MyPostListParams {
  publish_type?: PostPublishType
  status?: MyPostReviewStatus
  page?: number
  page_size?: number
}

export interface MyPostListItem {
  cancel_reason?: string
  created_at: string
  event_time: string
  has_reward?: boolean
  id: number
  item_name: string
  item_type: string
  item_type_other?: string
  location: string
  publish_type: string
  reject_reason?: string
  reward_description?: string
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
  reward_description: string
  status: string
  storage_location?: string
}

export interface UpdateMyPostPayload {
  post_id: number
  item_name: string
  item_type: string
  item_type_other: string
  campus: PostCampus
  location: string
  storage_location?: string
  event_time: string
  features: string
  contact_name: string
  contact_phone: string
  has_reward: boolean
  reward_description?: string
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
  proof_images?: string[]
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

export interface MyClaimListParams {
  page?: number
  page_size?: number
}

export interface MyClaimListItem {
  created_at: string
  description: string
  id: number
  item_name: string
  post_id: number
  proof_images: string[]
  publish_type: string
  status: string
}

export interface MyClaimListData {
  list: MyClaimListItem[]
  page: number
  page_size: number
  total: number
}

export interface ReviewClaimPayload {
  claim_id: number
  approve: boolean
}

interface PostActionResult {
  success: boolean
}

export interface CancelClaimPayload {
  id: number
}

function toText(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.trim()
}

function toLimitedText(value: unknown, maxLength: number) {
  const normalized = toText(value)
  if (!normalized)
    return undefined

  return normalized.slice(0, maxLength)
}

function toPositiveInteger(value: unknown, fallback: number) {
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue))
    return fallback

  const parsed = Math.trunc(numericValue)
  return parsed >= 1 ? parsed : fallback
}

function toPageSize(value: unknown, fallback = 10) {
  const parsed = toPositiveInteger(value, fallback)
  return parsed > 50 ? 50 : parsed
}

function toQueryId(value: unknown) {
  if (typeof value === 'number')
    return String(Math.trunc(value))

  return String(value || '').trim()
}

function toLimitedRequiredText(value: unknown, maxLength: number) {
  return toText(value).slice(0, maxLength)
}

function resolvePostType(value: string): ItemPostType {
  const normalized = toText(value)
  const upper = normalized.toUpperCase()
  if (normalized === '2' || upper === 'FOUND' || normalized === '招领')
    return '招领'

  return '失物'
}

function resolveReviewStatus(value: string, statusText?: string): PublishReviewStatus {
  const normalizedText = toText(statusText)
  if (normalizedText === '待审核' || normalizedText === '已通过' || normalizedText === '已匹配')
    return normalizedText
  if (normalizedText === '已认领' || normalizedText === '已解决')
    return '已认领'
  if (normalizedText === '已驳回')
    return '已驳回'
  if (normalizedText === '已取消')
    return '已取消'
  if (normalizedText === '已归档')
    return '已归档'

  const normalized = toText(value).toUpperCase()
  if (normalized === '0' || normalized === 'PENDING')
    return '待审核'
  if (normalized === '1' || normalized === 'APPROVED')
    return '已通过'
  if (normalized === '2' || normalized === 'MATCHED')
    return '已匹配'
  const mappedStatus = normalizeLostFoundStatus(value)
  if (mappedStatus === 'SOLVED')
    return '已认领'
  if (mappedStatus === 'CANCELLED')
    return '已取消'
  if (mappedStatus === 'REJECTED')
    return '已驳回'
  if (mappedStatus === 'ARCHIVED')
    return '已归档'

  return '待审核'
}

export function mapPostListItemToLostFoundItem(item: LostFoundListItem): LostFoundItem {
  const postType = resolvePostType(item.publish_type)

  return {
    id: String(item.id),
    name: item.item_name,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    occurredAt: item.event_time,
    status: mapLostFoundStatusToItemStatus(item.status, { publishType: item.publish_type }),
    postType,
    description: item.features,
    features: item.features,
    storageLocation: postType === '招领' ? item.location : '',
    claimCount: 0,
    contact: '',
    hasReward: item.has_reward,
    rewardRemark: toText(item.reward_description) || undefined,
    photos: item.images,
  }
}

export function mapPostDetailToLostFoundItem(item: LostFoundDetailData): LostFoundItem {
  const contactName = toText(item.contact_name)
  const contactPhone = toText(item.contact_phone)
  const postType = resolvePostType(item.publish_type)

  return {
    id: String(item.id),
    name: item.item_name,
    itemType: toText(item.item_type_other) || item.item_type,
    location: item.location,
    occurredAt: item.event_time,
    status: mapLostFoundStatusToItemStatus(item.status, { publishType: item.publish_type }),
    postType,
    description: item.features,
    features: item.features,
    storageLocation: postType === '招领'
      ? (toText(item.storage_location) || item.location)
      : '',
    claimCount: item.claim_count,
    contact: [contactName, contactPhone].filter(Boolean).join(' '),
    hasReward: item.has_reward,
    rewardRemark: toText(item.reward_description) || undefined,
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
    status: mapLostFoundStatusToItemStatus(item.status, { publishType: item.publish_type }),
    itemName: item.item_name,
    occurredAt: item.event_time,
    features: item.features,
    contactName: toText(item.contact_name),
    contactPhone: toText(item.contact_phone),
    hasReward: item.has_reward,
    rewardRemark: toText(item.reward_description) || undefined,
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
    status: mapLostFoundStatusToItemStatus(item.status, {
      publishType: item.publish_type,
      statusText: item.status_text,
    }),
    itemName: item.item_name,
    occurredAt: item.event_time,
    features: '',
    contactName: '',
    contactPhone: '',
    hasReward: !!item.has_reward,
    rewardRemark: toText(item.reward_description) || undefined,
    photos: [],
    createdAt: item.created_at,
    reviewStatus,
    rejectReason: toText(item.reject_reason) || undefined,
    updatedAt: undefined,
  }
}

export function getLostFoundList(params: LostFoundListParams = {}) {
  const page = toPositiveInteger(params.page, 1)
  const pageSize = toPageSize(params.page_size, 10)

  return request<LostFoundListData>({
    url: '/post/list',
    method: 'GET',
    params: {
      ...params,
      item_type: toLimitedText(params.item_type, 20),
      location: toLimitedText(params.location, 100),
      page,
      page_size: pageSize,
    },
  })
}

export function getPostDetailData(postId: string | number) {
  const id = toQueryId(postId)

  return request<LostFoundDetailData>({
    url: '/post/detail',
    method: 'GET',
    params: { id },
  })
}

export function getLostFoundItemDetail(itemId: string) {
  return getPostDetailData(itemId).then(mapPostDetailToLostFoundItem)
}

export function getMyPostList(params: MyPostListParams = {}) {
  const page = toPositiveInteger(params.page, 1)
  const pageSize = toPageSize(params.page_size, 10)

  return request<MyPostListData>({
    url: '/post/my-list',
    method: 'GET',
    params: {
      ...params,
      page,
      page_size: pageSize,
    },
  })
}

export function publishPost(payload: PublishPostPayload) {
  const storageLocation = toLimitedText(payload.storage_location, 100)

  const normalizedPayload: PublishPostPayload = {
    publish_type: payload.publish_type,
    item_name: toLimitedRequiredText(payload.item_name, 50),
    item_type: toLimitedRequiredText(payload.item_type, 20),
    campus: payload.campus,
    location: toLimitedRequiredText(payload.location, 100),
    ...(storageLocation ? { storage_location: storageLocation } : {}),
    event_time: payload.event_time,
    features: toLimitedRequiredText(payload.features, 255),
    contact_name: toLimitedRequiredText(payload.contact_name, 30),
    contact_phone: toLimitedRequiredText(payload.contact_phone, 20),
    has_reward: !!payload.has_reward,
    reward_description: payload.has_reward
      ? toLimitedRequiredText(payload.reward_description, 255)
      : '',
    images: (payload.images || []).map(item => toText(item)).filter(Boolean).slice(0, 3),
  }

  return request<PublishPostData>({
    url: '/post/publish',
    method: 'POST',
    data: normalizedPayload,
  })
}

export function updateMyPost(payload: UpdateMyPostPayload) {
  const storageLocation = toLimitedText(payload.storage_location, 100)

  const normalizedPayload: UpdateMyPostPayload = {
    post_id: payload.post_id,
    item_name: toLimitedRequiredText(payload.item_name, 50),
    item_type: toLimitedRequiredText(payload.item_type, 20),
    item_type_other: toLimitedRequiredText(payload.item_type_other, 15),
    campus: payload.campus,
    location: toLimitedRequiredText(payload.location, 100),
    ...(storageLocation ? { storage_location: storageLocation } : {}),
    event_time: payload.event_time,
    features: toLimitedRequiredText(payload.features, 200),
    contact_name: toLimitedRequiredText(payload.contact_name, 30),
    contact_phone: toLimitedRequiredText(payload.contact_phone, 20),
    has_reward: !!payload.has_reward,
    reward_description: payload.has_reward
      ? toLimitedRequiredText(payload.reward_description, 255)
      : '',
    images: (payload.images || []).map(item => toText(item)).filter(Boolean).slice(0, 3),
  }

  return request<PostActionResult>({
    url: '/post/update',
    method: 'PUT',
    data: normalizedPayload,
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
  const postId = Number(payload.postId)
  const proofImages = payload.proofImages
    .map(item => toText(item))
    .filter(Boolean)
    .slice(0, 3)

  return request<ClaimApplyData>({
    url: '/claim/apply',
    method: 'POST',
    data: {
      post_id: Number.isFinite(postId) ? postId : 0,
      description: toLimitedRequiredText(payload.description, 500),
      ...(proofImages.length ? { proof_images: proofImages } : {}),
    },
  })
}

export function getClaimList(postId: string | number) {
  const id = toQueryId(postId)

  return request<ClaimListData>({
    url: '/claim/list',
    method: 'GET',
    params: { post_id: id },
  })
}

export function getMyClaimList(params: MyClaimListParams = {}) {
  const page = toPositiveInteger(params.page, 1)
  const pageSize = toPageSize(params.page_size, 10)

  return request<MyClaimListData>({
    url: '/claim/my-list',
    method: 'GET',
    params: {
      ...params,
      page,
      page_size: pageSize,
    },
  })
}

export function cancelClaimRequest(payload: CancelClaimPayload) {
  return request<PostActionResult>({
    url: '/claim/cancel',
    method: 'POST',
    data: payload,
  })
}

export function reviewClaim(payload: ReviewClaimPayload) {
  return request<PostActionResult>({
    url: '/claim/review',
    method: 'POST',
    data: payload,
  })
}

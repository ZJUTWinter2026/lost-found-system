'use client'

import type {
  PublishEditablePayload,
  PublishRecord,
  SubmitPublishPayload,
} from '@/components/publish/types'
import type {
  ClaimRequest,
  FeedbackRecord,
  LostFoundItem,
  SubmitClaimPayload,
  SubmitFeedbackPayload,
} from '@/components/query/types'
import { create } from 'zustand'
import { INITIAL_FEEDBACK_RECORDS, MOCK_LOST_FOUND_ITEMS } from '@/components/query/constants'

interface LostFoundStore {
  items: LostFoundItem[]
  claimRequests: ClaimRequest[]
  publishRecords: PublishRecord[]
  feedbackRecords: FeedbackRecord[]
  submitClaim: (payload: SubmitClaimPayload) => boolean
  submitFeedback: (payload: SubmitFeedbackPayload) => boolean
  submitPublish: (payload: SubmitPublishPayload) => boolean
  updatePublishRecord: (recordId: string, payload: PublishEditablePayload) => boolean
  deletePublishRecord: (recordId: string) => boolean
  supplementPublishRecord: (recordId: string, payload: PublishEditablePayload) => boolean
  cancelPublishRecord: (recordId: string) => boolean
}

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000

function createRecordId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function toIsoByHoursAgo(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * HOUR_IN_MILLISECONDS).toISOString()
}

function toIsoDateText(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime()))
    return new Date().toISOString()

  return parsed.toISOString()
}

function normalizeEditablePayload(payload: PublishEditablePayload): PublishEditablePayload {
  return {
    itemType: payload.itemType.trim(),
    location: payload.location.trim(),
    itemName: payload.itemName.trim(),
    occurredAt: toIsoDateText(payload.occurredAt),
    features: payload.features.trim(),
    contactName: payload.contactName.trim(),
    contactPhone: payload.contactPhone.trim(),
    hasReward: payload.hasReward,
    rewardRemark: payload.rewardRemark?.trim() || undefined,
    photos: payload.photos.slice(0, 3),
  }
}

const INITIAL_PUBLISH_RECORDS: PublishRecord[] = [
  {
    id: 'POST-DEMO-001',
    postType: '失物',
    itemType: '电子设备',
    location: '图书馆一楼',
    timeRange: '24h',
    status: '寻找中',
    itemName: '白色 AirPods 充电盒',
    occurredAt: toIsoByHoursAgo(6),
    features: '保护壳上贴有蓝色贴纸。',
    contactName: '王同学',
    contactPhone: '13800138001',
    hasReward: true,
    rewardRemark: '核对无误后酬谢 50 元',
    photos: ['/globe.svg'],
    createdAt: toIsoByHoursAgo(3),
    reviewStatus: '待审核',
  },
  {
    id: 'POST-DEMO-002',
    postType: '失物',
    itemType: '证件卡类',
    location: '一食堂门口',
    timeRange: '3d',
    status: '寻找中',
    itemName: '校园卡',
    occurredAt: toIsoByHoursAgo(18),
    features: '蓝色卡套，背面有白色星星贴纸。',
    contactName: '张同学',
    contactPhone: '13800138002',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(8),
    reviewStatus: '已通过',
  },
  {
    id: 'POST-DEMO-003',
    postType: '失物',
    itemType: '钥匙门禁',
    location: '宿舍3号楼',
    timeRange: '7d',
    status: '寻找中',
    itemName: '门禁卡钥匙串',
    occurredAt: toIsoByHoursAgo(42),
    features: '银色钥匙圈，挂蓝色卡通吊坠。',
    contactName: '李同学',
    contactPhone: '13800138003',
    hasReward: false,
    photos: ['/next.svg'],
    createdAt: toIsoByHoursAgo(36),
    reviewStatus: '已匹配',
  },
  {
    id: 'POST-DEMO-004',
    postType: '失物',
    itemType: '衣物配饰',
    location: '体育馆入口',
    timeRange: '30d',
    status: '已归还',
    itemName: '灰色运动外套',
    occurredAt: toIsoByHoursAgo(80),
    features: '袖口有轻微磨损，内侧写有姓名缩写。',
    contactName: '陈同学',
    contactPhone: '13800138004',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(70),
    reviewStatus: '已认领',
  },
  {
    id: 'POST-DEMO-005',
    postType: '失物',
    itemType: '生活用品',
    location: '教学楼A区',
    timeRange: '24h',
    status: '寻找中',
    itemName: '黑色保温杯',
    occurredAt: toIsoByHoursAgo(26),
    features: '杯身印有 CHEM 字样。',
    contactName: '赵同学',
    contactPhone: '13800138005',
    hasReward: false,
    photos: [],
    createdAt: toIsoByHoursAgo(22),
    reviewStatus: '已驳回',
    rejectReason: '物品特征描述过于笼统，请补充可识别细节后重新发布。',
  },
  {
    id: 'POST-DEMO-006',
    postType: '失物',
    itemType: '书籍资料',
    location: '教学楼A区',
    timeRange: '7d',
    status: '寻找中',
    itemName: '高数笔记本',
    occurredAt: toIsoByHoursAgo(120),
    features: '封面右下角有蓝色贴纸。',
    contactName: '教学办',
    contactPhone: '010-62348888',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(110),
    reviewStatus: '已取消',
  },
  {
    id: 'POST-DEMO-007',
    postType: '招领',
    itemType: '电子设备',
    location: '图书馆一楼',
    timeRange: '24h',
    status: '待认领',
    itemName: '黑色蓝牙耳机',
    occurredAt: toIsoByHoursAgo(5),
    features: '耳机盒外壳有磨砂保护套。',
    contactName: '图书馆服务台',
    contactPhone: '13800138006',
    hasReward: false,
    photos: ['/globe.svg', '/next.svg'],
    createdAt: toIsoByHoursAgo(2),
    reviewStatus: '待审核',
  },
  {
    id: 'POST-DEMO-008',
    postType: '招领',
    itemType: '证件卡类',
    location: '东门快递点',
    timeRange: '3d',
    status: '待认领',
    itemName: '身份证',
    occurredAt: toIsoByHoursAgo(20),
    features: '证件表面完好，已单独封存。',
    contactName: '快递点值班',
    contactPhone: '13800138007',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(12),
    reviewStatus: '已通过',
  },
  {
    id: 'POST-DEMO-009',
    postType: '招领',
    itemType: '钥匙门禁',
    location: '宿舍3号楼',
    timeRange: '7d',
    status: '待认领',
    itemName: '钥匙串',
    occurredAt: toIsoByHoursAgo(33),
    features: '金属钥匙圈，含两把钥匙和门禁卡。',
    contactName: '宿管中心',
    contactPhone: '13800138008',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(24),
    reviewStatus: '已匹配',
  },
  {
    id: 'POST-DEMO-010',
    postType: '招领',
    itemType: '书籍资料',
    location: '教学楼A区',
    timeRange: '30d',
    status: '已归还',
    itemName: '计算机网络教材',
    occurredAt: toIsoByHoursAgo(88),
    features: '封面蓝白色，扉页写有班级信息。',
    contactName: '教学楼值班室',
    contactPhone: '13800138009',
    hasReward: false,
    photos: ['/file.svg'],
    createdAt: toIsoByHoursAgo(76),
    reviewStatus: '已认领',
  },
  {
    id: 'POST-DEMO-011',
    postType: '招领',
    itemType: '衣物配饰',
    location: '体育馆入口',
    timeRange: '24h',
    status: '待认领',
    itemName: '黑框眼镜',
    occurredAt: toIsoByHoursAgo(30),
    features: '镜腿内侧刻有品牌字样。',
    contactName: '体育馆前台',
    contactPhone: '13800138010',
    hasReward: false,
    photos: ['/globe.svg'],
    createdAt: toIsoByHoursAgo(28),
    reviewStatus: '已驳回',
    rejectReason: '上传照片不清晰，请补充 1-3 张清晰近照后重新提交。',
  },
  {
    id: 'POST-DEMO-012',
    postType: '招领',
    itemType: '生活用品',
    location: '一食堂门口',
    timeRange: '7d',
    status: '待认领',
    itemName: '银色保温杯',
    occurredAt: toIsoByHoursAgo(96),
    features: '杯盖有细小划痕。',
    contactName: '食堂服务台',
    contactPhone: '13800138011',
    hasReward: false,
    photos: ['/next.svg'],
    createdAt: toIsoByHoursAgo(90),
    reviewStatus: '已取消',
  },
]

export const useLostFoundStore = create<LostFoundStore>(set => ({
  items: MOCK_LOST_FOUND_ITEMS,
  claimRequests: [],
  publishRecords: INITIAL_PUBLISH_RECORDS,
  feedbackRecords: INITIAL_FEEDBACK_RECORDS,
  submitClaim: (payload) => {
    let isSubmitted = false
    set((state) => {
      const postId = String(payload.postId).trim()
      const target = state.items.find(item => item.id === postId)
      if (!target)
        return state

      const action = target.postType === '失物' ? '找回' : '归还'
      const newClaim: ClaimRequest = {
        id: createRecordId('CLAIM'),
        itemId: target.id,
        itemName: target.name,
        action,
        requestCategory: action === '找回' ? '失物' : '招领',
        detail: payload.description.trim(),
        photos: payload.proofImages.slice(0, 3),
        createdAt: new Date().toISOString(),
        status: '待审核',
      }
      isSubmitted = true

      return {
        claimRequests: [newClaim, ...state.claimRequests],
        items: state.items.map(item =>
          item.id === target.id
            ? { ...item, claimCount: item.claimCount + 1 }
            : item,
        ),
      }
    })
    return isSubmitted
  },
  submitFeedback: (payload) => {
    set(state => ({
      feedbackRecords: [
        {
          id: createRecordId('FDBK'),
          types: payload.types,
          description: payload.description.trim(),
          createdAt: new Date().toISOString(),
          status: '待审核',
          source: payload.source,
        },
        ...state.feedbackRecords,
      ],
    }))
    return true
  },
  submitPublish: (payload) => {
    let isSubmitted = false
    set((state) => {
      if (payload.postType === '招领' && payload.photos.length === 0)
        return state

      const record: PublishRecord = {
        id: createRecordId('POST'),
        postType: payload.postType,
        itemType: payload.itemType.trim(),
        location: payload.location.trim(),
        timeRange: payload.timeRange,
        status: payload.status,
        itemName: payload.itemName.trim(),
        occurredAt: payload.occurredAt,
        features: payload.features.trim(),
        contactName: payload.contactName.trim(),
        contactPhone: payload.contactPhone.trim(),
        hasReward: payload.hasReward,
        rewardRemark: payload.rewardRemark?.trim() || undefined,
        photos: payload.photos.slice(0, 3),
        createdAt: new Date().toISOString(),
        reviewStatus: '待审核',
      }

      isSubmitted = true

      return {
        publishRecords: [record, ...state.publishRecords],
      }
    })

    return isSubmitted
  },
  updatePublishRecord: (recordId, payload) => {
    let isUpdated = false
    const editable = normalizeEditablePayload(payload)

    set((state) => {
      const target = state.publishRecords.find(record => record.id === recordId)
      if (!target || target.reviewStatus !== '待审核')
        return state

      isUpdated = true
      return {
        publishRecords: state.publishRecords.map(record =>
          record.id === recordId
            ? {
                ...record,
                ...editable,
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      }
    })

    return isUpdated
  },
  deletePublishRecord: (recordId) => {
    let isDeleted = false

    set((state) => {
      const target = state.publishRecords.find(record => record.id === recordId)
      if (!target || target.reviewStatus !== '待审核')
        return state

      isDeleted = true
      return {
        publishRecords: state.publishRecords.filter(record => record.id !== recordId),
      }
    })

    return isDeleted
  },
  supplementPublishRecord: (recordId, payload) => {
    let isUpdated = false
    const editable = normalizeEditablePayload(payload)

    set((state) => {
      const target = state.publishRecords.find(record => record.id === recordId)
      if (!target || target.reviewStatus !== '已通过')
        return state

      isUpdated = true
      return {
        publishRecords: state.publishRecords.map(record =>
          record.id === recordId
            ? {
                ...record,
                ...editable,
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      }
    })

    return isUpdated
  },
  cancelPublishRecord: (recordId) => {
    let isCanceled = false

    set((state) => {
      const target = state.publishRecords.find(record => record.id === recordId)
      if (!target || target.reviewStatus !== '已通过')
        return state

      isCanceled = true
      return {
        publishRecords: state.publishRecords.map(record =>
          record.id === recordId
            ? {
                ...record,
                reviewStatus: '已取消',
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      }
    })

    return isCanceled
  },
}))

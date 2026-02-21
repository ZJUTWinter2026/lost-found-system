'use client'

import type { PublishDraft, PublishFormValues, SubmitPublishPayload } from '@/components/publish/types'
import type { ItemPostType, ItemStatus, TimeRangeValue } from '@/components/query/types'
import { Alert, Button, Card, Flex, Form, Input, message, Modal, Radio, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { CONTACT_PHONE_PATTERN, PUBLISH_DRAFT_STORAGE_KEY } from '@/components/publish/constants'
import OtherTypeModal from '@/components/publish/OtherTypeModal'
import PhotoUploader from '@/components/publish/PhotoUploader'
import PublishFilters from '@/components/publish/PublishFilters'
import PublishTypeSwitch from '@/components/publish/PublishTypeSwitch'
import {
  ITEM_TYPE_OPTIONS,
  ITEM_TYPE_OPTIONS_WITH_OTHER,
  ITEM_TYPE_OTHER_VALUE,
  LOCATION_OPTIONS,
  STATUS_OPTIONS,
  TIME_RANGE_OPTIONS,
} from '@/components/query/constants'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { Text } = Typography
const { TextArea } = Input

const DRAFT_RESTORED_MESSAGE_KEY = 'publish-draft-restored'
const VALID_POST_TYPES = new Set<ItemPostType>(['失物', '招领'])
const VALID_TIME_RANGE = new Set<TimeRangeValue>(TIME_RANGE_OPTIONS.map(option => option.value))
const VALID_STATUS = new Set<ItemStatus>(STATUS_OPTIONS.map(option => option.value))

function toStringArray(value: unknown) {
  if (!Array.isArray(value))
    return []

  return value.filter(item => typeof item === 'string').slice(0, 3)
}

function toOptionalString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function toDateTimeLocalValue(value?: string) {
  if (!value)
    return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return undefined

  const pad = (input: number) => String(input).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoDateText(value?: string) {
  if (!value)
    return new Date().toISOString()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function toOptionalPostType(value: unknown) {
  if (typeof value !== 'string')
    return undefined

  return VALID_POST_TYPES.has(value as ItemPostType) ? (value as ItemPostType) : undefined
}

function toOptionalTimeRange(value: unknown) {
  if (typeof value !== 'string')
    return undefined

  return VALID_TIME_RANGE.has(value as TimeRangeValue) ? (value as TimeRangeValue) : undefined
}

function toOptionalStatus(value: unknown) {
  if (typeof value !== 'string')
    return undefined

  return VALID_STATUS.has(value as ItemStatus) ? (value as ItemStatus) : undefined
}

function readDraft() {
  if (typeof window === 'undefined')
    return null

  try {
    const raw = window.localStorage.getItem(PUBLISH_DRAFT_STORAGE_KEY)
    if (!raw)
      return null

    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return null

    const draft: PublishDraft = {
      postType: toOptionalPostType(parsed.postType),
      itemType: toOptionalString(parsed.itemType),
      location: toOptionalString(parsed.location),
      timeRange: toOptionalTimeRange(parsed.timeRange),
      status: toOptionalStatus(parsed.status),
      itemName: toOptionalString(parsed.itemName),
      occurredAt: toOptionalString(parsed.occurredAt),
      features: toOptionalString(parsed.features),
      contactName: toOptionalString(parsed.contactName),
      contactPhone: toOptionalString(parsed.contactPhone),
      hasReward: typeof parsed.hasReward === 'boolean' ? parsed.hasReward : false,
      rewardRemark: toOptionalString(parsed.rewardRemark),
      photos: toStringArray(parsed.photos),
    }

    return draft
  }
  catch {
    return null
  }
}

function clearDraft() {
  if (typeof window === 'undefined')
    return

  window.localStorage.removeItem(PUBLISH_DRAFT_STORAGE_KEY)
}

function writeDraft(draft: PublishDraft) {
  if (typeof window === 'undefined')
    return

  window.localStorage.setItem(PUBLISH_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

function buildDraft(values: PublishFormValues, photos: string[]): PublishDraft {
  return {
    postType: values.postType,
    itemType: values.itemType,
    location: values.location,
    timeRange: values.timeRange,
    status: values.status,
    itemName: values.itemName,
    occurredAt: values.occurredAt,
    features: values.features,
    contactName: values.contactName,
    contactPhone: values.contactPhone,
    hasReward: !!values.hasReward,
    rewardRemark: values.rewardRemark,
    photos: photos.slice(0, 3),
  }
}

function isDraftEmpty(draft: PublishDraft) {
  return !(
    draft.postType
    || draft.itemType
    || draft.location
    || draft.timeRange
    || draft.status
    || draft.itemName
    || draft.occurredAt
    || draft.features
    || draft.contactName
    || draft.contactPhone
    || draft.hasReward
    || draft.rewardRemark
    || draft.photos.length
  )
}

function PublishPage() {
  const [form] = Form.useForm<PublishFormValues>()
  const submitPublish = useLostFoundStore(state => state.submitPublish)

  const [otherTypeOpen, setOtherTypeOpen] = useState(false)
  const [otherTypeInput, setOtherTypeInput] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draftReady, setDraftReady] = useState(false)

  const watchedValues = Form.useWatch([], form) as PublishFormValues | undefined
  const postType = Form.useWatch('postType', form)
  const hasReward = Form.useWatch('hasReward', form)
  const itemType = Form.useWatch('itemType', form)
  const location = Form.useWatch('location', form)
  const timeRange = Form.useWatch('timeRange', form)
  const status = Form.useWatch('status', form)

  const hasCustomItemType = useMemo(
    () => !!itemType && !ITEM_TYPE_OPTIONS.some(option => option.value === itemType),
    [itemType],
  )

  const itemTypeOptions = useMemo(() => {
    if (!hasCustomItemType || !itemType)
      return ITEM_TYPE_OPTIONS_WITH_OTHER

    return [
      { label: `其它：${itemType}`, value: itemType },
      ...ITEM_TYPE_OPTIONS_WITH_OTHER,
    ]
  }, [hasCustomItemType, itemType])

  useEffect(() => {
    const draft = readDraft()
    if (!draft) {
      queueMicrotask(() => {
        setDraftReady(true)
      })
      return
    }

    form.setFieldsValue({
      ...draft,
      occurredAt: toDateTimeLocalValue(draft.occurredAt),
    })
    queueMicrotask(() => {
      setPhotos(draft.photos)
      setDraftReady(true)
    })
    message.open({
      type: 'info',
      key: DRAFT_RESTORED_MESSAGE_KEY,
      content: '已恢复未提交的编辑内容',
    })
  }, [form])

  useEffect(() => {
    if (!draftReady || !watchedValues)
      return

    const draft = buildDraft(watchedValues, photos)
    if (isDraftEmpty(draft)) {
      clearDraft()
      return
    }

    writeDraft(draft)
  }, [draftReady, photos, watchedValues])

  useEffect(() => {
    if (hasReward === false)
      form.setFieldValue('rewardRemark', undefined)
  }, [form, hasReward])

  const handleItemTypeChange = (value?: string) => {
    setSubmitted(false)

    if (!value) {
      form.setFieldValue('itemType', undefined)
      return
    }

    if (value === ITEM_TYPE_OTHER_VALUE) {
      setOtherTypeInput(hasCustomItemType && itemType ? itemType : '')
      setOtherTypeOpen(true)
      return
    }

    form.setFieldValue('itemType', value)
  }

  const handleConfirmOtherType = () => {
    const nextType = otherTypeInput.trim()
    if (!nextType) {
      message.warning('请先输入其它物品类型')
      return
    }

    form.setFieldValue('itemType', nextType)
    setSubmitted(false)
    setOtherTypeOpen(false)
  }

  const handleCancelOtherType = () => {
    setOtherTypeInput('')
    setOtherTypeOpen(false)
  }

  const handleReset = () => {
    Modal.confirm({
      title: '确认取消当前填写？',
      content: '取消后会清空当前编辑内容。',
      okText: '确认取消',
      cancelText: '继续编辑',
      onOk: () => {
        form.resetFields()
        setPhotos([])
        setSubmitted(false)
        setOtherTypeInput('')
        clearDraft()
      },
    })
  }

  const handleSubmit = async () => {
    setSubmitted(false)

    try {
      const values = await form.validateFields()
      if (values.postType === '招领' && photos.length === 0) {
        message.warning('发布招领信息时，请至少上传 1 张物品清晰照片')
        return
      }

      setSubmitting(true)
      const payload: SubmitPublishPayload = {
        postType: values.postType as ItemPostType,
        itemType: (values.itemType ?? '').trim(),
        location: (values.location ?? '').trim(),
        timeRange: values.timeRange as TimeRangeValue,
        status: values.status as ItemStatus,
        itemName: (values.itemName ?? '').trim(),
        occurredAt: toIsoDateText(values.occurredAt),
        features: (values.features ?? '').trim(),
        contactName: (values.contactName ?? '').trim(),
        contactPhone: (values.contactPhone ?? '').trim(),
        hasReward: !!values.hasReward,
        rewardRemark: values.rewardRemark?.trim() || undefined,
        photos: photos.slice(0, 3),
      }

      const ok = submitPublish(payload)
      if (!ok) {
        message.error('提交失败，请稍后重试')
        return
      }

      message.success('已提交信息，等待审核中...')
      setSubmitted(true)
      form.resetFields()
      setPhotos([])
      clearDraft()
    }
    catch {
      message.warning('请先完善必填项并确认联系方式格式')
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <Flex vertical gap={12} align="center" className="w-full">
      <Card
        className="w-full max-w-5xl rounded-lg border-blue-100"
        styles={{ body: { padding: 16 } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hasReward: false }}
          onValuesChange={() => setSubmitted(false)}
        >
          <Flex vertical gap={12}>
            <Flex vertical gap={8}>
              <div className="text-sm font-medium text-blue-900">
                <span className="mr-1 text-red-500">*</span>
                发布类型
              </div>
              <Form.Item
                name="postType"
                className="!mb-0"
                rules={[{ required: true, message: '请选择发布类型' }]}
              >
                <PublishTypeSwitch
                  value={postType}
                  onChange={value => form.setFieldValue('postType', value)}
                />
              </Form.Item>
            </Flex>

            <PublishFilters
              itemType={itemType}
              location={location}
              timeRange={timeRange}
              status={status}
              itemTypeOptions={itemTypeOptions}
              locationOptions={LOCATION_OPTIONS}
              timeRangeOptions={TIME_RANGE_OPTIONS}
              statusOptions={STATUS_OPTIONS}
              onItemTypeChange={handleItemTypeChange}
              onLocationChange={(value) => {
                setSubmitted(false)
                form.setFieldValue('location', value)
              }}
              onTimeRangeChange={(value) => {
                setSubmitted(false)
                form.setFieldValue('timeRange', value)
              }}
              onStatusChange={(value) => {
                setSubmitted(false)
                form.setFieldValue('status', value)
              }}
            />

            <Form.Item
              name="itemType"
              hidden
              rules={[{ required: true, message: '请选择物品类型' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="location"
              hidden
              rules={[{ required: true, message: '请选择丢失/拾取地点' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="timeRange"
              hidden
              rules={[{ required: true, message: '请选择时间范围' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="status"
              hidden
              rules={[{ required: true, message: '请选择物品状态' }]}
            >
              <Input />
            </Form.Item>

            <Flex gap={8} wrap>
              <Form.Item
                name="itemName"
                label="物品名称"
                className="!mb-0 w-full md:w-[calc(50%-4px)]"
                rules={[{ required: true, message: '请输入物品名称' }]}
              >
                <Input
                  maxLength={30}
                  placeholder="请输入物品名称"
                />
              </Form.Item>

              <Form.Item
                name="occurredAt"
                label="丢失/拾取时间"
                className="!mb-0 w-full md:w-[calc(50%-4px)]"
                rules={[{ required: true, message: '请选择丢失/拾取时间' }]}
              >
                <Input
                  type="datetime-local"
                  className="w-full"
                  placeholder="请选择时间"
                />
              </Form.Item>
            </Flex>

            <Form.Item
              name="features"
              label="物品特征"
              className="!mb-0"
              rules={[{ required: true, message: '请输入物品特征' }]}
            >
              <TextArea
                rows={4}
                maxLength={200}
                showCount
                placeholder="请输入可识别的外观、贴纸、划痕等特征"
              />
            </Form.Item>

            <Flex gap={8} wrap>
              <Form.Item
                name="contactName"
                label="联系人"
                className="!mb-0 w-full md:w-[calc(50%-4px)]"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input
                  maxLength={20}
                  placeholder="请输入联系人"
                />
              </Form.Item>

              <Form.Item
                name="contactPhone"
                label="联系电话"
                className="!mb-0 w-full md:w-[calc(50%-4px)]"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: CONTACT_PHONE_PATTERN, message: '请输入正确的手机号或电话' },
                ]}
              >
                <Input
                  maxLength={20}
                  placeholder="请输入联系电话"
                />
              </Form.Item>
            </Flex>

            <Form.Item
              name="hasReward"
              label="是否有悬赏（可选）"
              className="!mb-0"
            >
              <Radio.Group
                options={[
                  { label: '无', value: false },
                  { label: '有', value: true },
                ]}
              />
            </Form.Item>

            {hasReward && (
              <Form.Item
                name="rewardRemark"
                label="悬赏说明（可选）"
                className="!mb-0"
              >
                <Input
                  maxLength={30}
                  placeholder="例如：酬谢50元 / 现金答谢"
                />
              </Form.Item>
            )}

            <Flex vertical gap={6}>
              <Text className="text-sm font-medium text-blue-900">物品照片（最多3张）</Text>
              <PhotoUploader
                photos={photos}
                onChange={(nextPhotos) => {
                  setSubmitted(false)
                  setPhotos(nextPhotos)
                }}
              />
              {!photos.length && (
                <Text className="text-xs text-blue-900/50">
                  当前暂无图片，可点击上传图标添加。
                </Text>
              )}
              {postType === '招领' && (
                <Text className="text-xs text-amber-600">
                  发布招领信息时，必须上传物品清晰照片，便于失主确认。
                </Text>
              )}
            </Flex>

            <Flex justify="end" gap={8} wrap>
              <Button
                className="rounded-lg"
                onClick={handleReset}
              >
                取消
              </Button>
              <Button
                type="primary"
                className="rounded-lg"
                loading={submitting}
                onClick={handleSubmit}
              >
                确认
              </Button>
            </Flex>

            {submitted && (
              <Alert
                showIcon
                type="success"
                message="已提交信息，等待审核中..."
              />
            )}
          </Flex>
        </Form>
      </Card>

      <OtherTypeModal
        open={otherTypeOpen}
        value={otherTypeInput}
        onChange={setOtherTypeInput}
        onCancel={handleCancelOtherType}
        onConfirm={handleConfirmOtherType}
      />
    </Flex>
  )
}

export default PublishPage

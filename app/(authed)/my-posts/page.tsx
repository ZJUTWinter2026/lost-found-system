'use client'

import type { LostFoundDetailData, PostCampus, UpdateMyPostPayload } from '@/api/modules/lostFound'
import type {
  PublishEditablePayload,
  PublishRecord,
  PublishReviewStatus,
} from '@/components/publish/types'
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  AutoComplete,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  List,
  message,
  Modal,
  Radio,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import {
  getPostDetailData,
  mapMyPostListItemToPublishRecord,
  mapPostDetailToPublishRecord,
} from '@/api/modules/lostFound'
import ClaimReviewModal from '@/components/publish/ClaimReviewModal'
import { CONTACT_PHONE_PATTERN } from '@/components/publish/constants'
import PhotoUploader from '@/components/publish/PhotoUploader'
import { ITEM_TYPE_OPTIONS, LOCATION_OPTIONS } from '@/components/query/constants'
import { formatDateTime, toTimestamp } from '@/components/query/utils'
import { usePublicConfigQuery } from '@/hooks/queries/usePublicQueries'
import {
  useCancelMyPostMutation,
  useDeleteMyPostMutation,
  useMyPostListQuery,
  useUpdateMyPostMutation,
} from '@/hooks/queries/useUserPostQueries'

const { Text } = Typography
const { TextArea } = Input

type PostTypeTab = '失物' | '招领'
type EditorMode = 'edit' | 'supplement'

interface ManageFormValues {
  itemType?: string
  location?: string
  itemName?: string
  occurredAt?: string
  features?: string
  contactName?: string
  contactPhone?: string
  hasReward?: boolean
  rewardRemark?: string
}

interface StatusSectionProps {
  status: PublishReviewStatus
  records: PublishRecord[]
  onEdit: (record: PublishRecord) => void
  onDelete: (record: PublishRecord) => void
  onSupplement: (record: PublishRecord) => void
  onReviewClaim: (record: PublishRecord) => void
  onCancelPublish: (record: PublishRecord) => void
}

interface RecordEditorModalProps {
  open: boolean
  mode: EditorMode
  record?: PublishRecord
  itemTypePresetOptions: Array<{ label: string, value: string }>
  submitting?: boolean
  onCancel: () => void
  onSubmit: (payload: PublishEditablePayload) => Promise<void> | void
}

const STATUS_ORDER: PublishReviewStatus[] = ['待审核', '已通过', '已匹配', '已认领', '已驳回', '已取消']

const STATUS_TAG_COLOR: Record<PublishReviewStatus, string> = {
  待审核: 'gold',
  已通过: 'blue',
  已匹配: 'purple',
  已认领: 'green',
  已驳回: 'red',
  已取消: 'default',
}

const DEFAULT_ITEM_TYPE_AUTOCOMPLETE_OPTIONS = ITEM_TYPE_OPTIONS.map(option => ({
  label: option.label,
  value: option.value,
}))

const LOCATION_AUTOCOMPLETE_OPTIONS = LOCATION_OPTIONS.map(option => ({
  label: option.label,
  value: option.value,
}))

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

function resolveCampus(value: string): PostCampus {
  const normalized = value.trim()
  const upper = normalized.toUpperCase()
  if (upper === 'ZHAO_HUI' || normalized === '朝晖')
    return 'ZHAO_HUI'
  if (upper === 'PING_FENG' || normalized === '屏峰')
    return 'PING_FENG'
  if (upper === 'MO_GAN_SHAN' || normalized === '莫干山')
    return 'MO_GAN_SHAN'

  return 'PING_FENG'
}

function buildMergedAutocompleteOptions(value?: string, presetOptions: Array<{ label: string, value: string }> = []) {
  if (!value)
    return presetOptions

  const existed = presetOptions.some(option => option.value === value)
  if (existed)
    return presetOptions

  return [{ label: value, value }, ...presetOptions]
}

function RecordEditorModal({
  open,
  mode,
  record,
  itemTypePresetOptions,
  submitting,
  onCancel,
  onSubmit,
}: RecordEditorModalProps) {
  const [form] = Form.useForm<ManageFormValues>()
  const [photos, setPhotos] = useState<string[]>([])
  const hasReward = Form.useWatch('hasReward', form)
  const itemType = Form.useWatch('itemType', form)
  const location = Form.useWatch('location', form)

  const itemTypeOptions = useMemo(
    () => buildMergedAutocompleteOptions(itemType, itemTypePresetOptions),
    [itemType, itemTypePresetOptions],
  )
  const locationOptions = useMemo(
    () => buildMergedAutocompleteOptions(location, LOCATION_AUTOCOMPLETE_OPTIONS),
    [location],
  )

  useEffect(() => {
    if (!open || !record)
      return

    form.setFieldsValue({
      itemType: record.itemType,
      location: record.location,
      itemName: record.itemName,
      occurredAt: toDateTimeLocalValue(record.occurredAt),
      features: record.features,
      contactName: record.contactName,
      contactPhone: record.contactPhone,
      hasReward: record.hasReward,
      rewardRemark: record.rewardRemark,
    })
    queueMicrotask(() => {
      setPhotos(record.photos.slice(0, 3))
    })
  }, [form, open, record])

  useEffect(() => {
    if (!open)
      return

    if (hasReward === false)
      form.setFieldValue('rewardRemark', undefined)
  }, [form, hasReward, open])

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit({
        itemType: values.itemType ?? '',
        location: values.location ?? '',
        itemName: values.itemName ?? '',
        occurredAt: values.occurredAt ?? '',
        features: values.features ?? '',
        contactName: values.contactName ?? '',
        contactPhone: values.contactPhone ?? '',
        hasReward: !!values.hasReward,
        rewardRemark: values.rewardRemark,
        photos: photos.slice(0, 3),
      })
    }
    catch {
      message.warning('请先完善必填项并确认联系方式格式')
    }
  }

  return (
    <Modal
      title={mode === 'edit' ? '修改发布信息' : '补充说明'}
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      confirmLoading={submitting}
      okText="确认"
      cancelText="取消"
      width={760}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ hasReward: false }}
      >
        <Flex vertical gap={8}>
          <Form.Item
            name="itemName"
            label="物品名称"
            className="!mb-0"
            rules={[{ required: true, message: '请输入物品名称' }]}
          >
            <Input
              maxLength={30}
              placeholder="请输入物品名称"
            />
          </Form.Item>

          <Form.Item
            name="itemType"
            label="类型"
            className="!mb-0"
            rules={[{ required: true, message: '请输入或选择物品类型' }]}
          >
            <AutoComplete
              options={itemTypeOptions}
              placeholder="请输入或选择物品类型"
              filterOption={(input, option) =>
                String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={mode === 'edit' ? '丢失地点' : '拾取地点'}
            className="!mb-0"
            rules={[{ required: true, message: `请输入${mode === 'edit' ? '丢失' : '拾取'}地点` }]}
          >
            <AutoComplete
              options={locationOptions}
              placeholder={`请输入${mode === 'edit' ? '丢失' : '拾取'}地点`}
              filterOption={(input, option) =>
                String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          <Form.Item
            name="occurredAt"
            label={mode === 'edit' ? '丢失时间' : '拾取时间'}
            className="!mb-0"
            rules={[{ required: true, message: `请选择${mode === 'edit' ? '丢失' : '拾取'}时间` }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

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
              className="!mb-0 w-full sm:w-[calc(50%-4px)]"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input
                maxLength={20}
                placeholder="请输入联系人"
              />
            </Form.Item>

            <Form.Item
              name="contactPhone"
              label="联系电话"
              className="!mb-0 w-full sm:w-[calc(50%-4px)]"
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
            <PhotoUploader photos={photos} onChange={setPhotos} />
            <Text className="text-xs text-blue-900/60">
              已上传照片将居左排列展示。
            </Text>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  )
}

function StatusSection({
  status,
  records,
  onEdit,
  onDelete,
  onSupplement,
  onReviewClaim,
  onCancelPublish,
}: StatusSectionProps) {
  return (
    <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 12 } }}>
      <Flex align="center" justify="space-between" className="mb-1">
        <Space size={8}>
          <Tag color={STATUS_TAG_COLOR[status]} className="!mr-0">
            {status}
          </Tag>
          <Text className="text-xs text-blue-900/60">{`共 ${records.length} 条`}</Text>
        </Space>
      </Flex>

      <List
        dataSource={records}
        renderItem={record => (
          <List.Item className="!px-0 !py-2">
            <Flex
              vertical
              gap={10}
              className="w-full rounded-lg border border-blue-100 bg-blue-50"
              style={{ padding: 16 }}
            >
              <Flex align="center" justify="space-between" wrap gap={8}>
                <Space size={8} wrap>
                  <Text className="text-sm font-semibold text-blue-900">{record.itemName}</Text>
                  <Tag color={STATUS_TAG_COLOR[record.reviewStatus]} className="!mr-0">
                    {record.reviewStatus}
                  </Tag>
                </Space>
                <Text className="text-xs text-blue-900/60">{`发布时间：${formatDateTime(record.createdAt)}`}</Text>
              </Flex>

              <Text className="block text-sm text-blue-900/80">{`类型：${record.itemType}`}</Text>
              <Text className="block text-sm text-blue-900/80">{`地点：${record.location}`}</Text>
              <Text className="block text-sm text-blue-900/80">{`发生时间：${formatDateTime(record.occurredAt)}`}</Text>
              <Text className="block text-sm text-blue-900/80">{`物品特征：${record.features || '-'}`}</Text>
              <Text className="block text-sm text-blue-900/80">
                {`联系人：${record.contactName || '-'}${record.contactPhone ? ` ${record.contactPhone}` : ''}`}
              </Text>
              {record.hasReward && record.rewardRemark && (
                <Text className="block text-sm text-amber-700">{`悬赏说明：${record.rewardRemark}`}</Text>
              )}
              {!!record.updatedAt && (
                <Text className="block text-xs text-blue-900/60">{`最近更新：${formatDateTime(record.updatedAt)}`}</Text>
              )}
              {record.reviewStatus === '已驳回' && record.rejectReason && (
                <Text className="block text-sm text-red-600">{`驳回原因：${record.rejectReason}`}</Text>
              )}

              {(record.reviewStatus === '待审核' || record.reviewStatus === '已通过') && (
                <Flex justify="end" gap={8} wrap className="pt-1">
                  {record.reviewStatus === '待审核' && (
                    <>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        className="rounded-lg"
                        onClick={() => onEdit(record)}
                      >
                        修改
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="rounded-lg"
                        onClick={() => onDelete(record)}
                      >
                        删除
                      </Button>
                    </>
                  )}
                  {record.reviewStatus === '已通过' && (
                    <>
                      <Button
                        size="small"
                        className="rounded-lg"
                        onClick={() => onReviewClaim(record)}
                      >
                        认领申请
                      </Button>
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        className="rounded-lg"
                        onClick={() => onSupplement(record)}
                      >
                        补充说明
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<StopOutlined />}
                        className="rounded-lg"
                        onClick={() => onCancelPublish(record)}
                      >
                        取消发布
                      </Button>
                    </>
                  )}
                </Flex>
              )}
            </Flex>
          </List.Item>
        )}
      />
    </Card>
  )
}

function MyPostsPage() {
  const myPostListQuery = useMyPostListQuery({ page: 1, page_size: 10 })
  const publicConfigQuery = usePublicConfigQuery()
  const updateMyPostMutation = useUpdateMyPostMutation()
  const deleteMyPostMutation = useDeleteMyPostMutation()
  const cancelMyPostMutation = useCancelMyPostMutation()
  const [activeTab, setActiveTab] = useState<PostTypeTab>('失物')
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [editorSubmitting, setEditorSubmitting] = useState(false)
  const [editorState, setEditorState] = useState<{
    mode: EditorMode
    record: PublishRecord
    detail: LostFoundDetailData
  } | null>(null)
  const [claimReviewRecord, setClaimReviewRecord] = useState<PublishRecord | null>(null)
  const publishRecords = useMemo(
    () => (myPostListQuery.data?.list || []).map(mapMyPostListItemToPublishRecord),
    [myPostListQuery.data?.list],
  )
  const itemTypePresetOptions = useMemo(() => {
    const itemTypes = (publicConfigQuery.data?.itemTypes || [])
      .map(type => type.trim())
      .filter(Boolean)

    if (!itemTypes.length)
      return DEFAULT_ITEM_TYPE_AUTOCOMPLETE_OPTIONS

    return itemTypes.map(type => ({
      label: type,
      value: type,
    }))
  }, [publicConfigQuery.data?.itemTypes])
  const presetItemTypeValues = useMemo(
    () => itemTypePresetOptions.map(option => option.value),
    [itemTypePresetOptions],
  )

  const { lostRecords, foundRecords } = useMemo(() => {
    const lost = publishRecords.filter(record => record.postType === '失物')
    const found = publishRecords.filter(record => record.postType === '招领')
    return {
      lostRecords: lost,
      foundRecords: found,
    }
  }, [publishRecords])

  const currentRecords = activeTab === '失物' ? lostRecords : foundRecords

  const groupedRecords = useMemo(
    () =>
      STATUS_ORDER
        .map(status => ({
          status,
          records: currentRecords
            .filter(record => record.reviewStatus === status)
            .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt)),
        }))
        .filter(group => group.records.length > 0),
    [currentRecords],
  )

  const openEditor = async (mode: EditorMode, record: PublishRecord) => {
    setLoadingDetailId(record.id)

    try {
      const detail = await getPostDetailData(record.id)
      setEditorState({
        mode,
        record: mapPostDetailToPublishRecord(detail),
        detail,
      })
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '加载详情失败，请稍后重试')
    }
    finally {
      setLoadingDetailId(null)
    }
  }

  const handleDelete = (record: PublishRecord) => {
    Modal.confirm({
      title: '确认删除该条发布信息？',
      content: '删除后不可恢复，同时会同步更新该物品详情。',
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          await deleteMyPostMutation.mutateAsync({ post_id: Number(record.id) })
          message.success('已删除该条发布信息')
        }
        catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败，请稍后重试')
        }
      },
    })
  }

  const handleCancelPublish = (record: PublishRecord) => {
    Modal.confirm({
      title: '确认取消发布？',
      content: '确认后该记录会标记为“已取消”，并同步更新该物品详情。',
      okText: '确认取消发布',
      cancelText: '继续保留',
      okType: 'danger',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          await cancelMyPostMutation.mutateAsync({
            post_id: Number(record.id),
            reason: '用户主动取消发布',
          })
          message.success('已取消发布')
        }
        catch (error) {
          message.error(error instanceof Error ? error.message : '取消发布失败，请稍后重试')
        }
      },
    })
  }

  const handleEditorSubmit = async (payload: PublishEditablePayload) => {
    if (!editorState)
      return

    const normalizedItemType = payload.itemType.trim()
    const isPresetType = presetItemTypeValues.includes(normalizedItemType)
    const item_type = isPresetType ? normalizedItemType : '其它'
    const item_type_other = isPresetType ? '' : normalizedItemType

    const updatePayload: UpdateMyPostPayload = {
      post_id: Number(editorState.record.id),
      item_name: payload.itemName.trim(),
      item_type,
      item_type_other,
      campus: resolveCampus(editorState.detail.campus) as PostCampus,
      location: payload.location.trim(),
      storage_location: editorState.detail.storage_location.trim() || payload.location.trim(),
      event_time: toIsoDateText(payload.occurredAt),
      features: payload.features.trim(),
      contact_name: payload.contactName.trim(),
      contact_phone: payload.contactPhone.trim(),
      has_reward: payload.hasReward,
      reward_description: payload.hasReward ? (payload.rewardRemark ?? '').trim() : '',
      images: payload.photos.slice(0, 3),
    }

    setEditorSubmitting(true)
    try {
      await updateMyPostMutation.mutateAsync(updatePayload)
      message.success(editorState.mode === 'edit' ? '修改成功，已同步更新' : '补充说明成功，已同步更新')
      setEditorState(null)
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
    }
    finally {
      setEditorSubmitting(false)
    }
  }

  return (
    <Flex vertical gap={12} align="center" className="w-full">
      <Card className="w-full max-w-5xl rounded-lg border-blue-100" styles={{ body: { padding: 12 } }}>
        <Flex vertical gap={12}>
          <Segmented
            block
            value={activeTab}
            options={[
              {
                label: `失物 ${lostRecords.length}`,
                value: '失物',
              },
              {
                label: `招领 ${foundRecords.length}`,
                value: '招领',
              },
            ]}
            onChange={value => setActiveTab(value as PostTypeTab)}
          />

          {myPostListQuery.isPending && (
            <Flex justify="center" className="py-8">
              <Text className="text-sm text-blue-900/70">加载中...</Text>
            </Flex>
          )}

          {myPostListQuery.isError && (
            <Flex vertical align="center" gap={8} className="py-4">
              <Text className="text-sm text-red-500">
                {myPostListQuery.error instanceof Error
                  ? myPostListQuery.error.message
                  : '加载失败，请稍后重试'}
              </Text>
              <Button className="rounded-lg" onClick={() => myPostListQuery.refetch()}>
                重试
              </Button>
            </Flex>
          )}

          {!myPostListQuery.isPending && !myPostListQuery.isError && !currentRecords.length && (
            <Empty description={`暂无${activeTab}记录`} />
          )}

          {!myPostListQuery.isPending && !myPostListQuery.isError && !!currentRecords.length && (
            <Flex vertical gap={10}>
              {groupedRecords.map(group => (
                <StatusSection
                  key={group.status}
                  status={group.status}
                  records={group.records}
                  onEdit={(record) => {
                    void openEditor('edit', record)
                  }}
                  onDelete={handleDelete}
                  onReviewClaim={setClaimReviewRecord}
                  onSupplement={(record) => {
                    void openEditor('supplement', record)
                  }}
                  onCancelPublish={handleCancelPublish}
                />
              ))}
            </Flex>
          )}
        </Flex>
      </Card>

      <RecordEditorModal
        open={!!editorState}
        mode={editorState?.mode ?? 'edit'}
        record={editorState?.record}
        itemTypePresetOptions={itemTypePresetOptions}
        submitting={editorSubmitting || loadingDetailId === editorState?.record.id}
        onCancel={() => setEditorState(null)}
        onSubmit={handleEditorSubmit}
      />

      <ClaimReviewModal
        open={!!claimReviewRecord}
        postId={claimReviewRecord?.id}
        postName={claimReviewRecord?.itemName}
        onClose={() => setClaimReviewRecord(null)}
      />
    </Flex>
  )
}

export default MyPostsPage

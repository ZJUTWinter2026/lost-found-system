'use client'

import type { LostFoundItem } from './types'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Image, Tag, Typography } from 'antd'
import { formatDateTime, resolveItemStatusTagColor } from './utils'

const { Text } = Typography
const CAMPUS_LABEL_MAP: Record<string, string> = {
  ZHAO_HUI: '朝晖',
  PING_FENG: '屏峰',
  MO_GAN_SHAN: '莫干山',
}

interface ItemDetailCardProps {
  item: LostFoundItem
  onBack: () => void
}

function resolveText(value?: string) {
  const normalized = String(value || '').trim()
  return normalized || undefined
}

function resolveDateTimeText(value?: string) {
  if (!value)
    return undefined

  const formatted = formatDateTime(value)
  return formatted === '-' ? undefined : formatted
}

function ItemDetailCard({ item, onBack }: ItemDetailCardProps) {
  const rewardText = item.hasReward
    ? `有${item.rewardRemark ? `（${item.rewardRemark.trim()}）` : ''}`
    : '无'
  const campusText = item.campus ? CAMPUS_LABEL_MAP[item.campus] || item.campus : undefined
  const featuresText = resolveText(item.features) || resolveText(item.description)
  const locationText = resolveText(item.location)
  const occurredAtText = resolveDateTimeText(item.occurredAt)
  const storageLocationText = resolveText(item.storageLocation)
  const contactText = resolveText([item.contactName, item.contactPhone].filter(Boolean).join(' '))
    || resolveText(item.contact)
  const createdAtText = resolveDateTimeText(item.createdAt)
  const processedAtText = resolveDateTimeText(item.processedAt)
  const rejectReasonText = resolveText(item.rejectReason)
  const cancelReasonText = resolveText(item.cancelReason)
  const archiveMethodText = resolveText(item.archiveMethod)
  const claimCount = Number.isFinite(item.claimCount) ? Math.max(0, item.claimCount) : 0
  const detailItems = [
    { key: 'postType', label: '发布类型', children: item.postType },
    ...(resolveText(item.itemType)
      ? [{ key: 'itemType', label: '物品类型', children: resolveText(item.itemType) }]
      : []),
    ...(campusText ? [{ key: 'campus', label: '校区', children: campusText }] : []),
    ...(locationText
      ? [{
          key: 'location',
          label: item.postType === '招领' ? '拾取地点' : '丢失地点',
          children: locationText,
        }]
      : []),
    ...(occurredAtText
      ? [{ key: 'occurredAt', label: '拾取/丢失时间', children: occurredAtText }]
      : []),
    ...(item.postType === '招领' && storageLocationText
      ? [{ key: 'storageLocation', label: '存放地点', children: storageLocationText }]
      : []),
    ...(featuresText
      ? [{ key: 'features', label: '特征', children: featuresText }]
      : []),
    { key: 'claimCount', label: '认领人数', children: `${claimCount} 人` },
    ...(contactText ? [{ key: 'contact', label: '联系方式', children: contactText }] : []),
    { key: 'reward', label: '有无悬赏', children: rewardText },
    ...(createdAtText ? [{ key: 'createdAt', label: '发布时间', children: createdAtText }] : []),
    ...(processedAtText ? [{ key: 'processedAt', label: '处理时间', children: processedAtText }] : []),
    ...(rejectReasonText ? [{ key: 'rejectReason', label: '驳回原因', children: rejectReasonText }] : []),
    ...(cancelReasonText ? [{ key: 'cancelReason', label: '取消原因', children: cancelReasonText }] : []),
    ...(archiveMethodText ? [{ key: 'archiveMethod', label: '归档方式', children: archiveMethodText }] : []),
  ]

  return (
    <Card
      className="w-full max-w-5xl rounded-lg border-blue-100"
      styles={{ body: { padding: 16 } }}
      title={(
        <Flex align="center" justify="space-between" gap={8}>
          <Flex align="center" gap={8}>
            <Button
              type="text"
              shape="circle"
              icon={<LeftOutlined />}
              aria-label="返回"
              className="!text-blue-700"
              onClick={onBack}
            />
            <Text className="text-base font-medium text-blue-700">
              {resolveText(item.name) || '未命名物品'}
            </Text>
          </Flex>
          <Flex align="center" gap={6} wrap>
            <Tag color={item.postType === '失物' ? 'blue' : 'cyan'}>
              {item.postType}
            </Tag>
            <Tag color={resolveItemStatusTagColor(item.status)}>
              {item.status}
            </Tag>
          </Flex>
        </Flex>
      )}
    >
      <Flex vertical gap={14}>
        <Descriptions
          column={1}
          size="small"
          colon={false}
          styles={{
            label: {
              color: 'rgba(30, 58, 138, 0.9)',
              fontSize: 14,
              fontWeight: 500,
            },
            content: {
              color: 'rgba(30, 58, 138, 0.78)',
              fontSize: 14,
            },
          }}
          items={detailItems}
        />

        <Flex vertical gap={8}>
          <Text className="text-sm font-medium text-blue-900">照片</Text>
          {item.photos.length
            ? (
                <Flex gap={8} wrap>
                  {item.photos.slice(0, 3).map((photo, index) => (
                    <Image
                      key={`${item.id}-${photo}-${index + 1}`}
                      src={photo}
                      alt={`${item.name}-${index + 1}`}
                      width={92}
                      height={92}
                      className="rounded-lg border border-blue-100 object-cover"
                    />
                  ))}
                </Flex>
              )
            : (
                <Text className="text-sm text-blue-900/60">暂无照片</Text>
              )}
        </Flex>
      </Flex>
    </Card>
  )
}

export default ItemDetailCard

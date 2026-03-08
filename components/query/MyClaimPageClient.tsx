'use client'

import type { MyClaimListItem } from '@/api/modules/lostFound'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Image, message, Modal, Pagination, Tag, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { formatDateTime } from '@/components/query/utils'
import { useCancelClaimMutation, useMyClaimListQuery } from '@/hooks/queries/useLostFoundQueries'

const { Paragraph, Text } = Typography

const PAGE_SIZE = 10

type ClaimStatusColor = 'default' | 'processing' | 'success' | 'error' | 'warning'

interface ClaimStatusInfo {
  text: string
  color: ClaimStatusColor
  canCancel: boolean
}

interface ClaimRecordCardProps {
  record: MyClaimListItem
  cancelling: boolean
  onCancel: (record: MyClaimListItem) => void
  onViewDetail: (record: MyClaimListItem) => void
}

function toText(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.trim()
}

function toImageList(value: unknown) {
  if (!Array.isArray(value))
    return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
}

function toPostTypeLabel(publishType: string) {
  const normalized = toText(publishType)
  const upper = normalized.toUpperCase()
  if (normalized === '2' || normalized === '招领' || upper === 'FOUND')
    return '招领'

  return '失物'
}

function toClaimStatusInfo(status: string): ClaimStatusInfo {
  const normalized = toText(status)
  const upper = normalized.toUpperCase()

  if (
    normalized === '待确认'
    || normalized === '待审核'
    || normalized === '待处理'
    || upper === 'PENDING'
    || upper === 'WAITING'
  ) {
    return { text: '待确认', color: 'processing', canCancel: true }
  }

  if (
    normalized === '已匹配'
    || normalized === '已认领'
    || normalized === '已通过'
    || normalized === '已解决'
    || upper === 'MATCHED'
    || upper === 'APPROVED'
    || upper === 'CLAIMED'
    || upper === 'SOLVED'
  ) {
    return { text: '已匹配', color: 'success', canCancel: false }
  }

  if (normalized === '已拒绝' || normalized === '已驳回' || upper === 'REJECTED')
    return { text: '已拒绝', color: 'error', canCancel: false }

  if (normalized === '已失效' || normalized === '已过期' || upper === 'EXPIRED')
    return { text: '已失效', color: 'warning', canCancel: false }

  if (normalized === '已取消' || upper === 'CANCELLED' || upper === 'CANCELED')
    return { text: '已取消', color: 'default', canCancel: false }

  return {
    text: normalized || '未知状态',
    color: 'default',
    canCancel: false,
  }
}

function ClaimRecordCard({ record, cancelling, onCancel, onViewDetail }: ClaimRecordCardProps) {
  const postTypeLabel = toPostTypeLabel(record.publish_type)
  const claimTypeLabel = postTypeLabel === '失物' ? '归还申请' : '认领申请'
  const statusInfo = toClaimStatusInfo(record.status)
  const proofImages = toImageList(record.proof_images)
  const itemName = toText(record.item_name) || '未命名物品'
  const description = toText(record.description) || '无补充说明'
  const createdAt = toText(record.created_at)

  return (
    <Card
      className="w-full rounded-lg border-blue-100"
      styles={{ body: { padding: 12 } }}
    >
      <Flex vertical gap={10}>
        <Flex justify="space-between" align="start" wrap gap={8}>
          <Flex vertical gap={6}>
            <Text strong className="text-base text-blue-900">
              {itemName}
            </Text>
            <Flex wrap gap={8}>
              <Tag color="blue">{postTypeLabel}</Tag>
              <Tag>{claimTypeLabel}</Tag>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </Flex>
          </Flex>
          <Text className="text-xs text-blue-900/55">
            提交时间：
            {formatDateTime(createdAt)}
          </Text>
        </Flex>

        <Paragraph
          className="!mb-0 !text-sm !text-blue-900/80"
          ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
        >
          {description}
        </Paragraph>

        {!!proofImages.length && (
          <Flex wrap gap={8}>
            {proofImages.slice(0, 3).map((image, index) => (
              <Image
                key={`${record.id}-${index + 1}`}
                src={image}
                alt={`认领证明图-${index + 1}`}
                width={84}
                height={84}
                className="rounded-lg border border-blue-100"
                style={{ objectFit: 'cover' }}
              />
            ))}
          </Flex>
        )}

        <Flex justify="end" gap={8} wrap>
          <Button
            className="rounded-lg"
            onClick={() => onViewDetail(record)}
          >
            查看物品
          </Button>
          {statusInfo.canCancel && (
            <Button
              danger
              className="rounded-lg"
              loading={cancelling}
              onClick={() => onCancel(record)}
            >
              取消认领
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}

function MyClaimPageClient() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const listParams = useMemo(
    () => ({ page, page_size: PAGE_SIZE }),
    [page],
  )
  const myClaimListQuery = useMyClaimListQuery(listParams)
  const cancelClaimMutation = useCancelClaimMutation()

  const records = myClaimListQuery.data?.list || []
  const total = myClaimListQuery.data?.total || 0

  const handleViewDetail = (record: MyClaimListItem) => {
    router.push(`/query/detail?itemId=${encodeURIComponent(String(record.post_id))}`)
  }

  const handleCancel = (record: MyClaimListItem) => {
    Modal.confirm({
      title: '确认取消认领申请？',
      content: '取消后若仍需认领，可重新提交申请。',
      okText: '确认取消',
      cancelText: '再想想',
      okType: 'danger',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          await cancelClaimMutation.mutateAsync({ id: record.id })
          message.success('认领申请已取消')
        }
        catch (error) {
          message.error(error instanceof Error ? error.message : '取消失败，请稍后重试')
        }
      },
    })
  }

  return (
    <Flex vertical gap={12} align="center" className="w-full">
      {myClaimListQuery.isError && (
        <Card className="w-full max-w-5xl rounded-lg border-blue-100" styles={{ body: { padding: 16 } }}>
          <Flex vertical gap={8}>
            <Paragraph className="!mb-0 !text-red-500">
              {myClaimListQuery.error instanceof Error
                ? myClaimListQuery.error.message
                : '加载失败，请稍后重试'}
            </Paragraph>
            <Flex>
              <Button className="rounded-lg" onClick={() => myClaimListQuery.refetch()}>
                重试
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {!myClaimListQuery.isError && (
        <Card
          className="w-full max-w-5xl rounded-lg border-blue-100"
          styles={{ body: { padding: 12 } }}
          loading={myClaimListQuery.isFetching && !records.length}
        >
          {!!records.length && (
            <Flex vertical gap={12}>
              {records.map((record, index) => (
                <ClaimRecordCard
                  key={`${record.id}-${index + 1}`}
                  record={record}
                  cancelling={cancelClaimMutation.isPending}
                  onCancel={handleCancel}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </Flex>
          )}

          {!records.length && !myClaimListQuery.isFetching && (
            <Flex justify="center" className="py-10">
              <Empty description="暂无认领申请记录" />
            </Flex>
          )}

          {total > PAGE_SIZE && (
            <Flex justify="end" className="pt-1">
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={nextPage => setPage(nextPage)}
              />
            </Flex>
          )}
        </Card>
      )}
    </Flex>
  )
}

export default MyClaimPageClient

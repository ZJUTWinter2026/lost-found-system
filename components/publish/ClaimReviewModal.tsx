'use client'

import { Button, Empty, Flex, Image, List, message, Modal, Tag, Typography } from 'antd'
import { formatDateTime } from '@/components/query/utils'
import { useClaimListQuery, useReviewClaimMutation } from '@/hooks/queries/useLostFoundQueries'

const { Paragraph, Text } = Typography

interface ClaimReviewModalProps {
  open: boolean
  postId?: string
  postName?: string
  onClose: () => void
}

function normalizeClaimStatus(value: string) {
  const normalized = value.trim().toUpperCase()
  if (
    !normalized
    || normalized === '0'
    || normalized === 'PENDING'
    || normalized === 'WAITING'
    || value.includes('待')
  ) {
    return '待审核'
  }

  if (
    normalized === '1'
    || normalized === 'APPROVED'
    || normalized === 'MATCHED'
    || value.includes('通过')
    || value.includes('匹配')
  ) {
    return '已通过'
  }

  if (
    normalized === '2'
    || normalized === 'REJECTED'
    || value.includes('拒绝')
    || value.includes('驳回')
  ) {
    return '已拒绝'
  }

  return value || '-'
}

function isPendingClaimStatus(value: string) {
  return normalizeClaimStatus(value) === '待审核'
}

function resolveStatusColor(status: string) {
  if (status === '已通过')
    return 'green'
  if (status === '已拒绝')
    return 'red'
  return 'gold'
}

function ClaimReviewModal({ open, postId, postName, onClose }: ClaimReviewModalProps) {
  const claimListQuery = useClaimListQuery(postId, open && !!postId)
  const reviewClaimMutation = useReviewClaimMutation()

  const handleReview = async (claimId: number, action: 1 | 2) => {
    try {
      await reviewClaimMutation.mutateAsync({
        claim_id: claimId,
        action,
      })
      message.success(action === 1 ? '已同意该认领申请' : '已拒绝该认领申请')
      await claimListQuery.refetch()
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败，请稍后重试')
    }
  }

  return (
    <Modal
      title={postName ? `认领申请 - ${postName}` : '认领申请'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={760}
    >
      <Flex vertical gap={10}>
        {claimListQuery.isError && (
          <Flex vertical gap={8}>
            <Text className="text-sm text-red-500">
              {claimListQuery.error instanceof Error
                ? claimListQuery.error.message
                : '认领申请加载失败，请稍后重试'}
            </Text>
            <Flex>
              <Button className="rounded-lg" onClick={() => claimListQuery.refetch()}>
                重试
              </Button>
            </Flex>
          </Flex>
        )}

        {!claimListQuery.isError && (
          <List
            loading={claimListQuery.isFetching}
            locale={{ emptyText: <Empty description="暂无认领申请" /> }}
            dataSource={claimListQuery.data?.list || []}
            renderItem={(item) => {
              const normalizedStatus = normalizeClaimStatus(item.status)
              const isPending = isPendingClaimStatus(item.status)
              return (
                <List.Item className="!px-0">
                  <Flex vertical gap={8} className="w-full rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <Flex align="center" justify="space-between" wrap gap={8}>
                      <Text className="text-sm font-semibold text-blue-900">{`申请 #${item.id}`}</Text>
                      <Tag color={resolveStatusColor(normalizedStatus)} className="!mr-0">
                        {normalizedStatus}
                      </Tag>
                    </Flex>

                    <Paragraph className="!mb-0 !text-sm !text-blue-900/80">
                      {item.description || '无补充说明'}
                    </Paragraph>

                    {!!item.proof_images.length && (
                      <Flex wrap gap={8}>
                        {item.proof_images.map((image, index) => (
                          <Image
                            key={`${item.id}-${index + 1}`}
                            src={image}
                            alt={`认领证明图-${index + 1}`}
                            width={86}
                            height={86}
                            className="rounded-lg object-cover"
                          />
                        ))}
                      </Flex>
                    )}

                    <Flex align="center" justify="space-between" wrap gap={8}>
                      <Text className="text-xs text-blue-900/60">
                        {`提交时间：${formatDateTime(item.created_at)}`}
                      </Text>
                      {isPending && (
                        <Flex gap={8}>
                          <Button
                            danger
                            size="small"
                            loading={reviewClaimMutation.isPending}
                            onClick={() => {
                              void handleReview(item.id, 2)
                            }}
                          >
                            拒绝
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            loading={reviewClaimMutation.isPending}
                            onClick={() => {
                              void handleReview(item.id, 1)
                            }}
                          >
                            同意
                          </Button>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                </List.Item>
              )
            }}
          />
        )}
      </Flex>
    </Modal>
  )
}

export default ClaimReviewModal

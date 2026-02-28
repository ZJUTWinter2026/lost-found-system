'use client'

import { Button, Card, Empty, Flex, List, Modal, Tag, Typography } from 'antd'
import { useMemo } from 'react'
import { formatDateTime, toTimestamp } from '@/components/query/utils'
import { useAnnouncementListQuery } from '@/hooks/queries/useAnnouncementQueries'

const { Paragraph, Text } = Typography

interface AnnouncementModalProps {
  open: boolean
  onClose: () => void
}

function resolveTypeColor(type: string) {
  const normalized = type.trim().toUpperCase()
  if (normalized === 'NOTICE')
    return 'blue'
  if (normalized === 'URGENT')
    return 'red'
  if (normalized === 'ACTIVITY')
    return 'green'
  return 'processing'
}

function AnnouncementModal({ open, onClose }: AnnouncementModalProps) {
  const announcementListQuery = useAnnouncementListQuery({ page: 1, page_size: 20 }, open)

  const list = useMemo(
    () =>
      (announcementListQuery.data?.list || [])
        .slice()
        .sort((left, right) => toTimestamp(right.created_at) - toTimestamp(left.created_at)),
    [announcementListQuery.data?.list],
  )

  return (
    <Modal
      title="系统公告"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={680}
    >
      <Flex vertical gap={10}>
        {announcementListQuery.isError && (
          <Flex vertical gap={8}>
            <Text className="text-sm text-red-500">
              {announcementListQuery.error instanceof Error
                ? announcementListQuery.error.message
                : '公告加载失败，请稍后重试'}
            </Text>
            <Flex>
              <Button onClick={() => announcementListQuery.refetch()} className="rounded-lg">
                重试
              </Button>
            </Flex>
          </Flex>
        )}

        {!announcementListQuery.isError && (
          <List
            loading={announcementListQuery.isFetching}
            locale={{ emptyText: <Empty description="暂无公告" /> }}
            dataSource={list}
            renderItem={item => (
              <List.Item className="!px-0 hover:!bg-transparent">
                <Card
                  className="w-full rounded-lg"
                  hoverable={false}
                  style={{ backgroundColor: '#f5faff', borderColor: '#dbeafe', boxShadow: 'none', transition: 'none' }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Flex vertical gap={8}>
                    <Flex align="center" justify="space-between" wrap gap={8}>
                      <Text className="text-sm font-semibold text-blue-900">{item.title}</Text>
                      <Tag color={resolveTypeColor(item.type)} className="!mr-0">
                        {item.type || '公告'}
                      </Tag>
                    </Flex>
                    <Paragraph className="!mb-0 !text-sm !leading-6 !text-blue-900/80">
                      {item.content}
                    </Paragraph>
                    <Flex justify="end">
                      <Text className="text-xs text-blue-900/60">
                        {formatDateTime(item.created_at)}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Flex>
    </Modal>
  )
}

export default AnnouncementModal

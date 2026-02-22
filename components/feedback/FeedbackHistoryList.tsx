'use client'

import type { FeedbackRecord } from '@/components/query/types'
import { Card, Empty, Flex, List, Tag, Typography } from 'antd'
import { formatDateTime } from '@/components/query/utils'

const { Text } = Typography

interface FeedbackHistoryListProps {
  records: FeedbackRecord[]
}

function FeedbackHistoryList({ records }: FeedbackHistoryListProps) {
  return (
    <Card
      size="small"
      className="rounded-lg border-blue-100 bg-blue-50"
      styles={{ body: { padding: 8 } }}
    >
      {records.length
        ? (
            <List
              dataSource={records}
              renderItem={record => (
                <List.Item className="!px-3 !py-3">
                  <Flex vertical gap={8} className="w-full">
                    <Flex align="center" justify="space-between" gap={10}>
                      <Text className="text-xs text-blue-900/60">{record.id}</Text>
                      <Tag
                        color={
                          record.status === '已处理'
                            ? 'blue'
                            : record.status === '处理中'
                              ? 'processing'
                              : 'gold'
                        }
                      >
                        {record.status}
                      </Tag>
                    </Flex>
                    <Text className="text-sm text-blue-900">
                      {`类型：${record.types.join('、')}`}
                    </Text>
                    {record.description && (
                      <Text className="text-sm text-blue-900/80">{`说明：${record.description}`}</Text>
                    )}
                    <Flex align="center" justify="space-between" gap={8}>
                      <Text className="text-xs text-blue-900/60">
                        {`来源：${record.source}`}
                      </Text>
                      <Text className="text-xs text-blue-900/60">
                        {formatDateTime(record.createdAt)}
                      </Text>
                    </Flex>
                  </Flex>
                </List.Item>
              )}
            />
          )
        : (
            <Empty description="暂无历史反馈" />
          )}
    </Card>
  )
}

export default FeedbackHistoryList

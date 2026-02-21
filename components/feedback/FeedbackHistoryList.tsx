'use client'

import type { FeedbackRecord } from '@/components/query/types'
import { Empty, Flex, List, Tag } from 'antd'
import { formatDateTime } from '@/components/query/utils'

interface FeedbackHistoryListProps {
  records: FeedbackRecord[]
}

function FeedbackHistoryList({ records }: FeedbackHistoryListProps) {
  return (
    <div className="rounded-lg bg-blue-50 p-2">
      {records.length
        ? (
            <List
              dataSource={records}
              renderItem={record => (
                <List.Item className="!px-3 !py-3">
                  <Flex vertical gap={8} className="w-full">
                    <Flex align="center" justify="space-between" gap={10}>
                      <span className="text-xs text-blue-900/60">{record.id}</span>
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
                    <p className="text-sm text-blue-900">
                      {`类型：${record.types.join('、')}`}
                    </p>
                    {record.description && (
                      <p className="text-sm text-blue-900/80">{`说明：${record.description}`}</p>
                    )}
                    <Flex align="center" justify="space-between" gap={8}>
                      <span className="text-xs text-blue-900/60">
                        {`来源：${record.source}`}
                      </span>
                      <span className="text-xs text-blue-900/60">
                        {formatDateTime(record.createdAt)}
                      </span>
                    </Flex>
                  </Flex>
                </List.Item>
              )}
            />
          )
        : (
            <Empty description="暂无历史反馈" />
          )}
    </div>
  )
}

export default FeedbackHistoryList

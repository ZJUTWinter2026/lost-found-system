'use client'

import type { PublishRecord } from '@/components/publish/types'
import { Card, Empty, Flex, List, Tabs, Tag, Typography } from 'antd'
import { formatDateTime } from '@/components/query/utils'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { Paragraph, Title } = Typography

interface PendingListProps {
  records: PublishRecord[]
  emptyText: string
}

function PendingList({ records, emptyText }: PendingListProps) {
  if (!records.length)
    return <Empty description={emptyText} />

  return (
    <List
      dataSource={records}
      renderItem={record => (
        <List.Item className="!px-1 !py-3">
          <Flex vertical gap={8} className="w-full rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
            <Flex align="center" justify="space-between" gap={8}>
              <span className="text-sm font-medium text-blue-900">{record.itemName}</span>
              <Tag color="gold">{record.reviewStatus}</Tag>
            </Flex>
            <span className="text-sm text-blue-900/70">{`类型：${record.itemType} | 地点：${record.location}`}</span>
            <span className="text-sm text-blue-900/70">{`状态：${record.status}`}</span>
            <span className="text-xs text-blue-900/60">{formatDateTime(record.createdAt)}</span>
          </Flex>
        </List.Item>
      )}
    />
  )
}

function MyPostsPage() {
  const publishRecords = useLostFoundStore(state => state.publishRecords)
  const lostRecords = publishRecords.filter(record => record.postType === '失物')
  const foundRecords = publishRecords.filter(record => record.postType === '招领')

  return (
    <Flex vertical gap={12} className="mx-auto w-full max-w-4xl">
      <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 16 } }}>
        <Title level={4} className="!mb-2 !text-blue-700">
          我的发布
        </Title>
        <Paragraph className="!mb-0 !text-blue-900/70">
          发布信息提交成功后，会在对应分组新增一条“待审核”记录。
        </Paragraph>
      </Card>

      <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 12 } }}>
        <Tabs
          items={[
            {
              key: 'lost',
              label: `失物（找回）${lostRecords.length ? ` ${lostRecords.length}` : ''}`,
              children: (
                <PendingList
                  records={lostRecords}
                  emptyText="暂无失物待审核记录"
                />
              ),
            },
            {
              key: 'found',
              label: `招领（归还）${foundRecords.length ? ` ${foundRecords.length}` : ''}`,
              children: (
                <PendingList
                  records={foundRecords}
                  emptyText="暂无招领待审核记录"
                />
              ),
            },
          ]}
        />
      </Card>
    </Flex>
  )
}

export default MyPostsPage

'use client'

import type { ClaimRequest } from '@/components/query/types'
import { Card, Empty, Flex, List, Tabs, Tag, Typography } from 'antd'
import { formatDateTime } from '@/components/query/utils'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { Paragraph, Title } = Typography

interface PendingListProps {
  records: ClaimRequest[]
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
              <Tag color="gold">{record.status}</Tag>
            </Flex>
            <span className="text-sm text-blue-900/70">{`申请类型：${record.action}`}</span>
            <span className="text-xs text-blue-900/60">{formatDateTime(record.createdAt)}</span>
          </Flex>
        </List.Item>
      )}
    />
  )
}

function MyPostsPage() {
  const claimRequests = useLostFoundStore(state => state.claimRequests)
  const lostRequests = claimRequests.filter(record => record.requestCategory === '失物')
  const foundRequests = claimRequests.filter(record => record.requestCategory === '招领')

  return (
    <Flex vertical gap={12} className="mx-auto w-full max-w-4xl">
      <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 16 } }}>
        <Title level={4} className="!mb-2 !text-blue-700">
          我的发布
        </Title>
        <Paragraph className="!mb-0 !text-blue-900/70">
          认领申请提交成功后，会在对应分组中新增一条“待审核”记录。
        </Paragraph>
      </Card>

      <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 12 } }}>
        <Tabs
          items={[
            {
              key: 'lost',
              label: `失物（找回）${lostRequests.length ? ` ${lostRequests.length}` : ''}`,
              children: (
                <PendingList
                  records={lostRequests}
                  emptyText="暂无失物待审核记录"
                />
              ),
            },
            {
              key: 'found',
              label: `招领（归还）${foundRequests.length ? ` ${foundRequests.length}` : ''}`,
              children: (
                <PendingList
                  records={foundRequests}
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

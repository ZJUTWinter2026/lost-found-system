'use client'

import { Button, Card, Flex, Typography } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import QueryDetailPageClient from './QueryDetailPageClient'

const { Paragraph, Title } = Typography

function QueryDetailRouteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')?.trim()

  if (!itemId) {
    return (
      <Flex align="center" className="w-full">
        <Card
          className="w-full max-w-5xl rounded-lg border-blue-100"
          styles={{ body: { padding: 20 } }}
        >
          <Flex vertical gap={12}>
            <Title level={4} className="!mb-0 !text-blue-700">
              缺少物品编号
            </Title>
            <Paragraph className="!mb-0 !text-blue-900/70">
              当前详情链接无效，请返回查询列表后重新进入。
            </Paragraph>
            <Flex>
              <Button type="primary" className="rounded-lg" onClick={() => router.push('/query')}>
                返回查询页
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    )
  }

  return <QueryDetailPageClient itemId={itemId} />
}

export default QueryDetailRouteClient

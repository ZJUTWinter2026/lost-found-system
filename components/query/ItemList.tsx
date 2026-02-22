'use client'

import type { LostFoundItem } from './types'
import { Card, Empty, Flex, List, Tag, Typography } from 'antd'
import { formatDateTime } from './utils'

const { Text } = Typography

interface ItemListProps {
  items: LostFoundItem[]
  onSelectItem: (itemId: string) => void
}

function ItemList({ items, onSelectItem }: ItemListProps) {
  return (
    <Card
      className="w-full max-w-5xl rounded-lg border-blue-100"
      styles={{ body: { padding: 12 } }}
      title={(
        <Flex align="center" justify="space-between">
          <Text className="text-base font-medium text-blue-700">物品信息列表</Text>
          <Text className="text-xs text-blue-900/60">{`共 ${items.length} 条`}</Text>
        </Flex>
      )}
    >
      {items.length
        ? (
            <Flex vertical className="max-h-[64dvh] overflow-y-auto">
              <List
                dataSource={items}
                renderItem={item => (
                  <List.Item className="!border-none !px-0 !py-1">
                    <Card
                      hoverable
                      size="small"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectItem(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelectItem(item.id)
                        }
                      }}
                      className="w-full rounded-lg border-blue-100"
                      styles={{ body: { padding: 12 } }}
                    >
                      <Flex vertical gap={8}>
                        <Flex align="center" justify="space-between" gap={8}>
                          <Text className="text-base font-medium text-blue-900">{item.name}</Text>
                          <Tag color={item.status === '已归还' ? 'blue' : item.status === '待认领' ? 'processing' : 'gold'}>
                            {item.status}
                          </Tag>
                        </Flex>
                        <Text className="text-sm text-blue-900/70">{`地点：${item.location}`}</Text>
                        <Text className="text-sm text-blue-900/70">
                          {`时间：${formatDateTime(item.occurredAt)}`}
                        </Text>
                      </Flex>
                    </Card>
                  </List.Item>
                )}
              />
            </Flex>
          )
        : (
            <Empty description="暂无符合条件的信息" />
          )}
    </Card>
  )
}

export default ItemList

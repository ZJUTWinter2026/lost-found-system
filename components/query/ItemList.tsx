'use client'

import type { LostFoundItem } from './types'
import { Card, Empty, Flex, List, Tag } from 'antd'
import { formatDateTime } from './utils'

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
          <span className="text-base font-medium text-blue-700">物品信息列表</span>
          <span className="text-xs text-blue-900/60">{`共 ${items.length} 条`}</span>
        </Flex>
      )}
    >
      {items.length
        ? (
            <div className="max-h-[64dvh] overflow-y-auto">
              <List
                dataSource={items}
                renderItem={item => (
                  <List.Item className="!border-none !px-0 !py-1">
                    <button
                      type="button"
                      onClick={() => onSelectItem(item.id)}
                      className="w-full rounded-lg border border-blue-100 bg-white px-3 py-3 text-left transition hover:border-blue-300"
                    >
                      <Flex vertical gap={8}>
                        <Flex align="center" justify="space-between" gap={8}>
                          <span className="text-base font-medium text-blue-900">{item.name}</span>
                          <Tag color={item.status === '已归还' ? 'blue' : item.status === '待认领' ? 'processing' : 'gold'}>
                            {item.status}
                          </Tag>
                        </Flex>
                        <span className="text-sm text-blue-900/70">{`地点：${item.location}`}</span>
                        <span className="text-sm text-blue-900/70">
                          {`时间：${formatDateTime(item.occurredAt)}`}
                        </span>
                      </Flex>
                    </button>
                  </List.Item>
                )}
              />
            </div>
          )
        : (
            <Empty description="暂无符合条件的信息" />
          )}
    </Card>
  )
}

export default ItemList

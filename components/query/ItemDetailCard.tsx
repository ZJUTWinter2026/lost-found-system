'use client'

import type { LostFoundItem } from './types'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Image, Tag, Typography } from 'antd'
import { formatDateTime } from './utils'

const { Text } = Typography

interface ItemDetailCardProps {
  item: LostFoundItem
  onBack: () => void
}

function ItemDetailCard({ item, onBack }: ItemDetailCardProps) {
  const rewardText = item.hasReward ? `有${item.rewardRemark ? `（${item.rewardRemark}）` : ''}` : '无'

  return (
    <Card
      className="w-full max-w-5xl rounded-lg border-blue-100"
      styles={{ body: { padding: 16 } }}
      title={(
        <Flex align="center" justify="space-between" gap={8}>
          <Flex align="center" gap={8}>
            <Button
              type="text"
              shape="circle"
              icon={<LeftOutlined />}
              aria-label="返回"
              className="!text-blue-700"
              onClick={onBack}
            />
            <Text className="text-base font-medium text-blue-700">{item.name}</Text>
          </Flex>
          <Tag color={item.status === '已归还' ? 'blue' : item.status === '待认领' ? 'processing' : 'gold'}>
            {item.status}
          </Tag>
        </Flex>
      )}
    >
      <Flex vertical gap={14}>
        <Descriptions
          column={1}
          size="small"
          colon={false}
          labelStyle={{
            color: 'rgba(30, 58, 138, 0.9)',
            fontSize: 14,
            fontWeight: 500,
          }}
          contentStyle={{
            color: 'rgba(30, 58, 138, 0.78)',
            fontSize: 14,
          }}
          items={[
            { key: 'description', label: '物品描述', children: item.description },
            { key: 'features', label: '特征', children: item.features },
            { key: 'occurredAt', label: '拾取/丢失时间', children: formatDateTime(item.occurredAt) },
            { key: 'storageLocation', label: '存放地点', children: item.storageLocation },
            { key: 'claimCount', label: '认领人数', children: `${item.claimCount} 人` },
            { key: 'contact', label: '联系方式', children: '仅管理员和失主/拾主可见' },
            { key: 'reward', label: '有无悬赏', children: rewardText },
          ]}
        />

        <Flex vertical gap={8}>
          <Text className="text-sm font-medium text-blue-900">照片</Text>
          {item.photos.length
            ? (
                <Flex gap={8} wrap>
                  {item.photos.slice(0, 3).map((photo, index) => (
                    <Image
                      key={`${item.id}-${photo}-${index + 1}`}
                      src={photo}
                      alt={`${item.name}-${index + 1}`}
                      width={92}
                      height={92}
                      className="rounded-lg border border-blue-100 object-cover"
                    />
                  ))}
                </Flex>
              )
            : (
                <Text className="text-sm text-blue-900/60">暂无照片</Text>
              )}
        </Flex>
      </Flex>
    </Card>
  )
}

export default ItemDetailCard

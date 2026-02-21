'use client'

import type { LostFoundItem } from './types'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Image, Tag } from 'antd'
import { formatDateTime } from './utils'

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Flex vertical gap={4}>
      <span className="text-sm font-medium text-blue-900">{label}</span>
      <span className="text-sm text-blue-900/80">{value}</span>
    </Flex>
  )
}

interface ItemDetailCardProps {
  item: LostFoundItem
  onBack: () => void
}

function ItemDetailCard({ item, onBack }: ItemDetailCardProps) {
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
            <span className="text-base font-medium text-blue-700">{item.name}</span>
          </Flex>
          <Tag color={item.status === '已归还' ? 'blue' : item.status === '待认领' ? 'processing' : 'gold'}>
            {item.status}
          </Tag>
        </Flex>
      )}
    >
      <Flex vertical gap={14}>
        <DetailRow label="物品描述" value={item.description} />
        <DetailRow label="特征" value={item.features} />
        <DetailRow label="拾取/丢失时间" value={formatDateTime(item.occurredAt)} />
        <DetailRow label="存放地点" value={item.storageLocation} />
        <DetailRow label="认领人数" value={`${item.claimCount} 人`} />
        <DetailRow label="联系方式" value="仅管理员和失主/拾主可见" />
        <DetailRow
          label="有无悬赏"
          value={item.hasReward ? `有${item.rewardRemark ? `（${item.rewardRemark}）` : ''}` : '无'}
        />

        <Flex vertical gap={8}>
          <span className="text-sm font-medium text-blue-900">照片</span>
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
                <span className="text-sm text-blue-900/60">暂无照片</span>
              )}
        </Flex>
      </Flex>
    </Card>
  )
}

export default ItemDetailCard

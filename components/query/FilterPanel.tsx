'use client'

import type { QueryFilters } from './types'
import { Button, Card, Flex, Input, message, Modal, Select, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { usePublicConfigQuery } from '@/hooks/queries/usePublicQueries'
import {
  CAMPUS_OPTIONS,
  ITEM_TYPE_OPTIONS,
  ITEM_TYPE_OTHER_VALUE,
  PUBLISH_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TIME_RANGE_OPTIONS,
} from './constants'

const { Text } = Typography

interface FilterPanelProps {
  filters: QueryFilters
  onFiltersChange: (nextFilters: QueryFilters) => void
  onView: () => void
}

function FilterLabel({ text }: { text: string }) {
  return (
    <Text className="text-sm font-medium text-blue-900">{text}</Text>
  )
}

function FilterPanel({
  filters,
  onFiltersChange,
  onView,
}: FilterPanelProps) {
  const [otherTypeOpen, setOtherTypeOpen] = useState(false)
  const [otherTypeInput, setOtherTypeInput] = useState('')
  const publicConfigQuery = usePublicConfigQuery()

  const baseItemTypeOptions = useMemo(() => {
    const itemTypes = (publicConfigQuery.data?.itemTypes || [])
      .map(item => item.trim())
      .filter(Boolean)

    if (!itemTypes.length)
      return ITEM_TYPE_OPTIONS

    return itemTypes.map(itemType => ({
      label: itemType,
      value: itemType,
    }))
  }, [publicConfigQuery.data?.itemTypes])

  const itemTypeOptionsWithOther = useMemo(
    () => [...baseItemTypeOptions, { label: '其它', value: ITEM_TYPE_OTHER_VALUE }],
    [baseItemTypeOptions],
  )

  const hasAnyFilter = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters],
  )
  const hasCustomItemType = useMemo(
    () =>
      !!filters.itemType
      && !baseItemTypeOptions.some(option => option.value === filters.itemType),
    [baseItemTypeOptions, filters.itemType],
  )
  const itemTypeOptions = useMemo(() => {
    if (!hasCustomItemType || !filters.itemType)
      return itemTypeOptionsWithOther

    return [
      { label: `其它：${filters.itemType}`, value: filters.itemType },
      ...itemTypeOptionsWithOther,
    ]
  }, [filters.itemType, hasCustomItemType, itemTypeOptionsWithOther])

  const patchFilters = (patch: Partial<QueryFilters>) => {
    onFiltersChange({
      ...filters,
      ...patch,
    })
  }

  const handleItemTypeChange = (value?: string) => {
    if (!value) {
      patchFilters({ itemType: undefined })
      return
    }

    if (value === ITEM_TYPE_OTHER_VALUE) {
      setOtherTypeInput(hasCustomItemType && filters.itemType ? filters.itemType : '')
      setOtherTypeOpen(true)
      return
    }

    patchFilters({ itemType: value })
  }

  const handleConfirmOtherType = () => {
    const trimmed = otherTypeInput.trim()
    if (!trimmed) {
      message.warning('请先输入其它物品类型')
      return
    }

    patchFilters({ itemType: trimmed })
    setOtherTypeOpen(false)
    message.success('其它物品类型已确认')
  }

  const handleCancelOtherType = () => {
    setOtherTypeInput('')
    setOtherTypeOpen(false)
  }

  return (
    <>
      <Card
        className="w-full max-w-5xl rounded-lg border-blue-100"
        styles={{ body: { padding: 12 } }}
      >
        <Flex vertical gap={10}>
          <Flex align="end" gap={8} wrap>
            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="发布类型" />
              <Select
                value={filters.publishType}
                allowClear
                placeholder="请选择"
                options={PUBLISH_TYPE_OPTIONS}
                onChange={value => patchFilters({ publishType: value })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="物品类型" />
              <Select
                value={filters.itemType}
                allowClear
                placeholder="请选择"
                options={itemTypeOptions}
                onChange={handleItemTypeChange}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="校区" />
              <Select
                value={filters.campus}
                allowClear
                placeholder="请选择"
                options={CAMPUS_OPTIONS}
                onChange={value => patchFilters({ campus: value })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="丢失/拾取地点" />
              <Input
                value={filters.location}
                allowClear
                maxLength={100}
                placeholder="请输入地点"
                onChange={event => patchFilters({ location: event.target.value || undefined })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="时间范围" />
              <Select
                value={filters.timeRange}
                allowClear
                placeholder="请选择"
                options={TIME_RANGE_OPTIONS}
                onChange={value => patchFilters({ timeRange: value })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
              <FilterLabel text="物品状态" />
              <Select
                value={filters.status}
                allowClear
                placeholder="请选择"
                options={STATUS_OPTIONS}
                onChange={value => patchFilters({ status: value })}
              />
            </Flex>
          </Flex>

          <Flex justify="end">
            <Button
              type="primary"
              className="rounded-lg"
              disabled={!hasAnyFilter}
              onClick={onView}
            >
              查看
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Modal
        title="填写其它物品类型"
        open={otherTypeOpen}
        onCancel={handleCancelOtherType}
        onOk={handleConfirmOtherType}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Flex vertical gap={8}>
          <Input
            value={otherTypeInput}
            placeholder="请输入物品类型（最多20字）"
            maxLength={20}
            onChange={event => setOtherTypeInput(event.target.value)}
          />
          <Flex justify="end">
            <Text className="text-xs text-blue-900/50">
              {`${otherTypeInput.length} / 20`}
            </Text>
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}

export default FilterPanel

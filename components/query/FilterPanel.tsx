'use client'

import type { QueryFilters } from './types'
import { Button, Card, Flex, Input, message, Modal, Select } from 'antd'
import { useMemo, useState } from 'react'
import {
  ITEM_TYPE_OPTIONS,
  ITEM_TYPE_OPTIONS_WITH_OTHER,
  ITEM_TYPE_OTHER_VALUE,
  LOCATION_OPTIONS,
  STATUS_OPTIONS,
  TIME_RANGE_OPTIONS,
} from './constants'

interface FilterPanelProps {
  filters: QueryFilters
  onFiltersChange: (nextFilters: QueryFilters) => void
  onView: () => void
}

function FilterPanel({
  filters,
  onFiltersChange,
  onView,
}: FilterPanelProps) {
  const [otherTypeOpen, setOtherTypeOpen] = useState(false)
  const [otherTypeInput, setOtherTypeInput] = useState('')

  const hasAnyFilter = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters],
  )
  const hasCustomItemType = useMemo(
    () =>
      !!filters.itemType
      && !ITEM_TYPE_OPTIONS.some(option => option.value === filters.itemType),
    [filters.itemType],
  )
  const itemTypeOptions = useMemo(() => {
    if (!hasCustomItemType || !filters.itemType)
      return ITEM_TYPE_OPTIONS_WITH_OTHER

    return [
      { label: `其它：${filters.itemType}`, value: filters.itemType },
      ...ITEM_TYPE_OPTIONS_WITH_OTHER,
    ]
  }, [filters.itemType, hasCustomItemType])

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
            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
              <div className="text-sm font-medium text-blue-900">物品类型</div>
              <Select
                value={filters.itemType}
                allowClear
                placeholder="请选择"
                options={itemTypeOptions}
                onChange={handleItemTypeChange}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
              <div className="text-sm font-medium text-blue-900">丢失/拾取地点</div>
              <Select
                value={filters.location}
                allowClear
                placeholder="请选择"
                options={LOCATION_OPTIONS}
                onChange={value => patchFilters({ location: value })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
              <div className="text-sm font-medium text-blue-900">时间范围</div>
              <Select
                value={filters.timeRange}
                allowClear
                placeholder="请选择"
                options={TIME_RANGE_OPTIONS}
                onChange={value => patchFilters({ timeRange: value })}
              />
            </Flex>

            <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
              <div className="text-sm font-medium text-blue-900">物品状态</div>
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
            placeholder="请输入物品类型（最多15字）"
            maxLength={15}
            onChange={event => setOtherTypeInput(event.target.value)}
          />
          <Flex justify="end">
            <span className="text-xs text-blue-900/50">
              {`${otherTypeInput.length} / 15`}
            </span>
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}

export default FilterPanel

import type { ItemStatus, TimeRangeValue } from '@/components/query/types'
import { Flex, Select, Typography } from 'antd'

const { Text } = Typography

interface Option {
  label: string
  value: string
}

interface PublishFiltersProps {
  itemType?: string
  location?: string
  timeRange?: TimeRangeValue
  status?: ItemStatus
  itemTypeOptions: Option[]
  locationOptions: Option[]
  timeRangeOptions: Option[]
  statusOptions: Option[]
  onItemTypeChange: (value?: string) => void
  onLocationChange: (value?: string) => void
  onTimeRangeChange: (value?: TimeRangeValue) => void
  onStatusChange: (value?: ItemStatus) => void
}

function Label({ text }: { text: string }) {
  return (
    <Flex align="center" gap={4}>
      <Text className="text-red-500">*</Text>
      <Text className="text-sm font-medium text-blue-900">{text}</Text>
    </Flex>
  )
}

function PublishFilters({
  itemType,
  location,
  timeRange,
  status,
  itemTypeOptions,
  locationOptions,
  timeRangeOptions,
  statusOptions,
  onItemTypeChange,
  onLocationChange,
  onTimeRangeChange,
  onStatusChange,
}: PublishFiltersProps) {
  return (
    <Flex align="end" gap={8} wrap>
      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
        <Label text="物品类型" />
        <Select
          value={itemType}
          placeholder="请选择"
          options={itemTypeOptions}
          onChange={value => onItemTypeChange(value)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
        <Label text="丢失/拾取地点" />
        <Select
          value={location}
          placeholder="请选择"
          options={locationOptions}
          onChange={value => onLocationChange(value)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
        <Label text="时间范围" />
        <Select
          value={timeRange}
          placeholder="请选择"
          options={timeRangeOptions}
          onChange={value => onTimeRangeChange(value as TimeRangeValue)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]">
        <Label text="物品状态" />
        <Select
          value={status}
          placeholder="请选择"
          options={statusOptions}
          onChange={value => onStatusChange(value as ItemStatus)}
        />
      </Flex>
    </Flex>
  )
}

export default PublishFilters

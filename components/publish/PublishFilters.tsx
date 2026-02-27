import type { CampusCode, ItemStatus, TimeRangeValue } from '@/components/query/types'
import { Flex, Input, Select, Typography } from 'antd'

const { Text } = Typography

interface Option {
  label: string
  value: string
}

interface PublishFiltersProps {
  campus?: CampusCode
  itemType?: string
  location?: string
  timeRange?: TimeRangeValue
  status?: ItemStatus
  campusOptions: Option[]
  itemTypeOptions: Option[]
  timeRangeOptions: Option[]
  statusOptions: Option[]
  onCampusChange: (value?: CampusCode) => void
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
  campus,
  itemType,
  location,
  timeRange,
  status,
  campusOptions,
  itemTypeOptions,
  timeRangeOptions,
  statusOptions,
  onCampusChange,
  onItemTypeChange,
  onLocationChange,
  onTimeRangeChange,
  onStatusChange,
}: PublishFiltersProps) {
  return (
    <Flex align="end" gap={8} wrap>
      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(20%-7px)]">
        <Label text="校区" />
        <Select
          value={campus}
          placeholder="请选择"
          options={campusOptions}
          onChange={value => onCampusChange(value as CampusCode)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(20%-7px)]">
        <Label text="物品类型" />
        <Select
          value={itemType}
          placeholder="请选择"
          options={itemTypeOptions}
          onChange={value => onItemTypeChange(value)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(20%-7px)]">
        <Label text="丢失/拾取地点" />
        <Input
          value={location}
          allowClear
          maxLength={100}
          placeholder="请输入地点"
          onChange={event => onLocationChange(event.target.value || undefined)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(20%-7px)]">
        <Label text="时间范围" />
        <Select
          value={timeRange}
          placeholder="请选择"
          options={timeRangeOptions}
          onChange={value => onTimeRangeChange(value as TimeRangeValue)}
        />
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(20%-7px)]">
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

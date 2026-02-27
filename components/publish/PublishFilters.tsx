import type { CampusCode } from '@/components/query/types'
import { Flex, Form, Input, Select, Typography } from 'antd'

const { Text } = Typography

interface Option {
  label: string
  value: string
}

interface PublishFiltersProps {
  campus?: CampusCode
  itemType?: string
  location?: string
  campusOptions: Option[]
  itemTypeOptions: Option[]
  onCampusChange: (value?: CampusCode) => void
  onItemTypeChange: (value?: string) => void
  onLocationChange: (value?: string) => void
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
  campusOptions,
  itemTypeOptions,
  onCampusChange,
  onItemTypeChange,
  onLocationChange,
}: PublishFiltersProps) {
  return (
    <Flex align="start" gap={8} wrap>
      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
        <Label text="校区" />
        <Form.Item
          name="campus"
          className="!mb-0"
          rules={[{ required: true, message: '请选择校区' }]}
        >
          <Select
            value={campus}
            placeholder="请选择"
            options={campusOptions}
            onChange={value => onCampusChange(value as CampusCode)}
          />
        </Form.Item>
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
        <Label text="物品类型" />
        <Form.Item
          name="itemType"
          className="!mb-0"
          rules={[
            { required: true, message: '请选择或输入物品类型' },
            { max: 20, message: '物品类型最多 20 个字符' },
          ]}
        >
          <Select
            value={itemType}
            placeholder="请选择"
            options={itemTypeOptions}
            onChange={value => onItemTypeChange(value)}
          />
        </Form.Item>
      </Flex>

      <Flex vertical gap={6} className="w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-6px)]">
        <Label text="丢失/拾取地点" />
        <Form.Item
          name="location"
          className="!mb-0"
          rules={[
            { required: true, message: '请输入丢失/拾取地点' },
            { max: 100, message: '地点最多 100 个字符' },
          ]}
        >
          <Input
            value={location}
            allowClear
            maxLength={100}
            placeholder="请输入地点"
            onChange={event => onLocationChange(event.target.value || undefined)}
          />
        </Form.Item>
      </Flex>

    </Flex>
  )
}

export default PublishFilters

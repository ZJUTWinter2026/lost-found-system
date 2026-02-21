import type { ItemPostType } from '@/components/query/types'
import { Segmented } from 'antd'

interface PublishTypeSwitchProps {
  value?: ItemPostType
  onChange: (value: ItemPostType) => void
}

const TYPE_OPTIONS: Array<{ label: ItemPostType, value: ItemPostType }> = [
  { label: '失物', value: '失物' },
  { label: '招领', value: '招领' },
]

function PublishTypeSwitch({ value, onChange }: PublishTypeSwitchProps) {
  return (
    <Segmented
      block
      options={TYPE_OPTIONS}
      value={value}
      onChange={nextValue => onChange(nextValue as ItemPostType)}
      className="w-full"
    />
  )
}

export default PublishTypeSwitch

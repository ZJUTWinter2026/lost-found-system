'use client'

import { Button, Card, Flex, Input, message, Modal, Radio, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { TextArea } = Input
const { Text } = Typography

const COMPLAINT_OTHER_TYPE_VALUE = '__item_detail_complaint_other_type__'

const COMPLAINT_TYPE_OPTIONS = [
  { label: '信息不全', value: '信息不全' },
  { label: '不实消息', value: '不实消息' },
  { label: '恶心血腥', value: '恶心血腥' },
  { label: '涉黄信息', value: '涉黄信息' },
  { label: '其它类型', value: COMPLAINT_OTHER_TYPE_VALUE },
]

interface ComplaintModalProps {
  open: boolean
  onClose: () => void
}

function ComplaintModal({ open, onClose }: ComplaintModalProps) {
  const submitFeedback = useLostFoundStore(state => state.submitFeedback)
  const [selectedType, setSelectedType] = useState('')
  const [customType, setCustomType] = useState('')
  const [description, setDescription] = useState('')

  const trimmedCustomType = useMemo(() => customType.trim(), [customType])
  const hasSelectedOtherType = useMemo(
    () => selectedType === COMPLAINT_OTHER_TYPE_VALUE,
    [selectedType],
  )
  const resolvedType = useMemo(
    () => (hasSelectedOtherType ? trimmedCustomType : selectedType),
    [hasSelectedOtherType, selectedType, trimmedCustomType],
  )
  const canSubmit = useMemo(() => !!resolvedType, [resolvedType])

  const resetForm = () => {
    setSelectedType('')
    setCustomType('')
    setDescription('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)

    if (value !== COMPLAINT_OTHER_TYPE_VALUE)
      setCustomType('')
  }

  const handleSubmit = () => {
    if (!selectedType) {
      message.warning('请选择投诉类型')
      return
    }

    if (hasSelectedOtherType && !trimmedCustomType) {
      message.warning('请选择“其它类型”时请填写具体类型')
      return
    }

    const isSubmitted = submitFeedback({
      types: [resolvedType],
      description: description.trim(),
      source: '物品详情',
    })

    if (!isSubmitted) {
      message.error('提交失败，请稍后重试')
      return
    }

    message.success('投诉与反馈已提交，等待管理员审核')
    handleClose()
  }

  return (
    <Modal
      title="投诉与反馈"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={640}
    >
      <Flex vertical gap={14}>
        <Flex vertical gap={8}>
          <Flex align="center" gap={4}>
            <Text className="text-sm text-blue-900">投诉类型</Text>
            <Text className="text-red-500">*</Text>
          </Flex>
          <Radio.Group
            value={selectedType}
            onChange={event => handleTypeChange(event.target.value)}
            className="w-full"
          >
            <Flex vertical gap={10}>
              {COMPLAINT_TYPE_OPTIONS.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Flex>
          </Radio.Group>
        </Flex>

        {hasSelectedOtherType && (
          <Card
            size="small"
            className="rounded-lg border-blue-100"
            styles={{ body: { padding: 10, backgroundColor: '#eff6ff' } }}
          >
            <Flex vertical gap={6}>
              <Text className="text-sm text-blue-900">其它类型说明</Text>
              <Input
                value={customType}
                onChange={event => setCustomType(event.target.value)}
                placeholder="请输入其它投诉类型（最多15字）"
                maxLength={15}
              />
              <Flex justify="end">
                <Text className="text-xs text-blue-900/50">{`${customType.length} / 15`}</Text>
              </Flex>
            </Flex>
          </Card>
        )}

        <Flex vertical gap={8}>
          <Text className="text-sm text-blue-900">投诉说明（可选）</Text>
          <TextArea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="请补充投诉详情，便于管理员核查（可选）"
            autoSize={{ minRows: 4, maxRows: 8 }}
            maxLength={500}
          />
        </Flex>

        <Flex justify="end">
          <Text className="text-xs text-blue-900/50">{`${description.length} / 500`}</Text>
        </Flex>

        <Flex justify="end" gap={8}>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="rounded-lg"
            disabled={!canSubmit}
          >
            确认提交
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ComplaintModal

'use client'

import { Button, Card, Checkbox, Flex, Input, message, Typography } from 'antd'
import { useMemo, useState } from 'react'
import {
  FEEDBACK_TYPE_OPTIONS,
  FEEDBACK_TYPE_OTHER_VALUE,
} from '@/components/query/constants'

const { TextArea } = Input
const { Text } = Typography

interface FeedbackSubmitFormProps {
  onSubmit: (payload: { types: string[], description: string }) => Promise<boolean | void> | boolean | void
  onCancel?: () => void
  submitText?: string
  submitting?: boolean
}

function FeedbackSubmitForm({
  onSubmit,
  onCancel,
  submitText = '确认',
  submitting = false,
}: FeedbackSubmitFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [otherTypeInput, setOtherTypeInput] = useState('')
  const [confirmedOtherType, setConfirmedOtherType] = useState('')
  const [feedbackDescription, setFeedbackDescription] = useState('')

  const trimmedOtherTypeInput = useMemo(
    () => otherTypeInput.trim(),
    [otherTypeInput],
  )
  const hasSelectedOtherType = useMemo(
    () => selectedTypes.includes(FEEDBACK_TYPE_OTHER_VALUE),
    [selectedTypes],
  )
  const isOtherTypeConfirmed = useMemo(
    () =>
      !!confirmedOtherType
      && confirmedOtherType === trimmedOtherTypeInput,
    [confirmedOtherType, trimmedOtherTypeInput],
  )
  const resolvedTypeList = useMemo(
    () =>
      selectedTypes.flatMap(type =>
        type === FEEDBACK_TYPE_OTHER_VALUE
          ? (isOtherTypeConfirmed ? [confirmedOtherType] : [])
          : [type],
      ),
    [confirmedOtherType, isOtherTypeConfirmed, selectedTypes],
  )
  const canSubmit = useMemo(() => {
    if (!selectedTypes.length)
      return false

    if (hasSelectedOtherType && !isOtherTypeConfirmed)
      return false

    return resolvedTypeList.length > 0
  }, [
    hasSelectedOtherType,
    isOtherTypeConfirmed,
    resolvedTypeList.length,
    selectedTypes.length,
  ])

  const resetState = () => {
    setSelectedTypes([])
    setOtherTypeInput('')
    setConfirmedOtherType('')
    setFeedbackDescription('')
  }

  const handleCancel = () => {
    resetState()
    onCancel?.()
  }

  const handleTypeChange = (values: string[]) => {
    setSelectedTypes(values)

    if (!values.includes(FEEDBACK_TYPE_OTHER_VALUE)) {
      setOtherTypeInput('')
      setConfirmedOtherType('')
    }
  }

  const handleOtherTypeConfirm = () => {
    if (!trimmedOtherTypeInput) {
      message.warning('请先输入其它类型')
      return
    }

    setConfirmedOtherType(trimmedOtherTypeInput)
    message.success('其它类型已确认')
  }

  const handleOtherTypeCancel = () => {
    setSelectedTypes(prev => prev.filter(type => type !== FEEDBACK_TYPE_OTHER_VALUE))
    setOtherTypeInput('')
    setConfirmedOtherType('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning('请至少勾选一种投诉与反馈类型')
      return
    }

    const isSuccess = await onSubmit({
      types: resolvedTypeList,
      description: feedbackDescription.trim(),
    })
    if (isSuccess === false)
      return

    resetState()
  }

  const handleOtherTypeInputChange = (value: string) => {
    setOtherTypeInput(value)

    if (confirmedOtherType && value.trim() !== confirmedOtherType)
      setConfirmedOtherType('')
  }

  return (
    <Flex vertical gap={14}>
      <Flex vertical gap={8}>
        <Flex align="center" gap={4}>
          <Text className="text-sm text-blue-900">投诉与反馈类型</Text>
          <Text className="text-red-500">*</Text>
        </Flex>
        <Text className="text-xs text-blue-900/60">
          请勾选投诉与反馈类型，至少选择一项。
        </Text>
        <Checkbox.Group
          value={selectedTypes}
          onChange={values => handleTypeChange(values as string[])}
          className="w-full"
        >
          <Flex vertical gap={10}>
            {FEEDBACK_TYPE_OPTIONS.map(option => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </Flex>
        </Checkbox.Group>
      </Flex>

      {hasSelectedOtherType && (
        <Card
          size="small"
          className="rounded-lg border-blue-100"
          styles={{ body: { padding: 10, backgroundColor: '#eff6ff' } }}
        >
          <Flex vertical gap={8}>
            <Flex align="center" justify="space-between" gap={8}>
              <Text className="text-sm text-blue-900">其它类型说明</Text>
              <Text className="text-xs text-blue-900/50">
                {`${otherTypeInput.length} / 15`}
              </Text>
            </Flex>
            <Input
              value={otherTypeInput}
              onChange={event => handleOtherTypeInputChange(event.target.value)}
              placeholder="请输入其它类型（最多15字）"
              maxLength={15}
            />
            <Flex align="center" justify="space-between" gap={8} wrap>
              {isOtherTypeConfirmed
                ? (
                    <Text className="text-xs text-blue-700">
                      {`已确认其它类型：${confirmedOtherType}`}
                    </Text>
                  )
                : (
                    <Text className="text-xs text-blue-900/60">
                      请输入后点击“确认”，否则无法提交
                    </Text>
                  )}
              <Flex gap={8}>
                <Button onClick={handleOtherTypeCancel}>取消</Button>
                <Button type="primary" onClick={handleOtherTypeConfirm}>
                  确认
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      )}

      <Flex vertical gap={8}>
        <Text className="text-sm text-blue-900">投诉与反馈说明（可选）</Text>
        <TextArea
          value={feedbackDescription}
          onChange={event => setFeedbackDescription(event.target.value)}
          placeholder="请填写投诉与反馈说明，如物品编号、时间和具体经过（可选）"
          autoSize={{ minRows: 4, maxRows: 8 }}
          maxLength={500}
        />
      </Flex>

      <Flex justify="end">
        <Text className="text-xs text-blue-900/50">
          {`${feedbackDescription.length} / 500`}
        </Text>
      </Flex>

      <Flex justify="end" gap={8}>
        {onCancel && <Button onClick={handleCancel}>取消</Button>}
        <Button
          type="primary"
          onClick={() => {
            void handleSubmit()
          }}
          className="rounded-lg"
          disabled={!canSubmit || submitting}
          loading={submitting}
        >
          {submitText}
        </Button>
      </Flex>
    </Flex>
  )
}

export default FeedbackSubmitForm

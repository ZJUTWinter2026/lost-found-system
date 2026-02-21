'use client'

import { Button, Checkbox, Flex, Input, message } from 'antd'
import { useMemo, useState } from 'react'
import {
  FEEDBACK_TYPE_OPTIONS,
  FEEDBACK_TYPE_OTHER_VALUE,
} from '@/components/query/constants'

const { TextArea } = Input

interface FeedbackSubmitFormProps {
  onSubmit: (payload: { types: string[], description: string }) => boolean | void
  onCancel?: () => void
  submitText?: string
}

function FeedbackSubmitForm({
  onSubmit,
  onCancel,
  submitText = '确认',
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

  const handleSubmit = () => {
    if (!canSubmit) {
      message.warning('请至少勾选一种投诉与反馈类型')
      return
    }

    const isSuccess = onSubmit({
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
        <div className="text-sm text-blue-900">
          投诉与反馈类型
          <span className="ml-1 text-red-500">*</span>
        </div>
        <span className="text-xs text-blue-900/60">
          请选择最接近的问题类型，例如信息不实、认领争议、处理进度慢等。
        </span>
        <Checkbox.Group
          value={selectedTypes}
          options={FEEDBACK_TYPE_OPTIONS}
          onChange={values => handleTypeChange(values as string[])}
        />
      </Flex>

      {hasSelectedOtherType && (
        <Flex vertical gap={8} className="rounded-lg bg-blue-50 p-3">
          <Input
            value={otherTypeInput}
            onChange={event => handleOtherTypeInputChange(event.target.value)}
            placeholder="请输入其它类型（最多15字）"
            maxLength={15}
          />
          <Flex justify="end">
            <span className="text-xs text-blue-900/50">
              {`${otherTypeInput.length} / 15`}
            </span>
          </Flex>
          <Flex justify="end" gap={8}>
            <Button onClick={handleOtherTypeCancel}>取消</Button>
            <Button type="primary" onClick={handleOtherTypeConfirm}>
              确认
            </Button>
          </Flex>
          {isOtherTypeConfirmed
            ? (
                <span className="text-xs text-blue-700">
                  {`已确认其它类型：${confirmedOtherType}`}
                </span>
              )
            : (
                <span className="text-xs text-blue-900/60">
                  请输入后点击“确认”，否则无法提交
                </span>
              )}
        </Flex>
      )}

      <Flex vertical gap={8}>
        <div className="text-sm text-blue-900">投诉与反馈说明（可选）</div>
        <TextArea
          value={feedbackDescription}
          onChange={event => setFeedbackDescription(event.target.value)}
          placeholder="请填写投诉与反馈说明，如物品编号、时间和具体经过（可选）"
          autoSize={{ minRows: 4, maxRows: 8 }}
          maxLength={500}
        />
      </Flex>

      <Flex justify="end">
        <span className="text-xs text-blue-900/50">
          {`${feedbackDescription.length} / 500`}
        </span>
      </Flex>

      <Flex justify="end" gap={8}>
        {onCancel && <Button onClick={handleCancel}>取消</Button>}
        <Button
          type="primary"
          onClick={handleSubmit}
          className="rounded-lg"
          disabled={!canSubmit}
        >
          {submitText}
        </Button>
      </Flex>
    </Flex>
  )
}

export default FeedbackSubmitForm

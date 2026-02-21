'use client'

import type { FeedbackRecord } from './types'
import { Button, Checkbox, Empty, Flex, Input, List, message, Modal, Tabs, Tag } from 'antd'
import { useMemo, useState } from 'react'

const { TextArea } = Input
const OTHER_TYPE_VALUE = '__other_type__'
const FEEDBACK_TYPE_OPTIONS = [
  { label: '功能建议', value: '功能建议' },
  { label: '界面体验', value: '界面体验' },
  { label: '异常报错', value: '异常报错' },
  { label: '投诉建议', value: '投诉建议' },
  { label: '其它类型', value: OTHER_TYPE_VALUE },
]

const MOCK_HISTORY: FeedbackRecord[] = [
  {
    id: 'F-20260115-01',
    content: '希望查询页可以增加按时间筛选，查找效率会更高。',
    createdAt: '2026-01-15 10:20',
    status: '处理中',
  },
  {
    id: 'F-20260110-02',
    content: '发布信息时建议支持上传多张图片。',
    createdAt: '2026-01-10 16:42',
    status: '已处理',
  },
  {
    id: 'F-20260106-03',
    content: '移动端顶部按钮区域建议再加大点击范围。',
    createdAt: '2026-01-06 09:08',
    status: '已处理',
  },
]

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [historyRecords, setHistoryRecords] = useState<FeedbackRecord[]>(MOCK_HISTORY)
  const [activeKey, setActiveKey] = useState('submit')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [otherTypeInput, setOtherTypeInput] = useState('')
  const [confirmedOtherType, setConfirmedOtherType] = useState('')
  const [feedbackDescription, setFeedbackDescription] = useState('')

  const hasSelectedOtherType = useMemo(
    () => selectedTypes.includes(OTHER_TYPE_VALUE),
    [selectedTypes],
  )
  const resolvedTypeList = useMemo(
    () =>
      selectedTypes.flatMap(type =>
        type === OTHER_TYPE_VALUE
          ? (confirmedOtherType ? [confirmedOtherType] : [])
          : [type],
      ),
    [confirmedOtherType, selectedTypes],
  )
  const canSubmit = useMemo(() => {
    if (!selectedTypes.length)
      return false

    if (hasSelectedOtherType && !confirmedOtherType)
      return false

    return resolvedTypeList.length > 0
  }, [confirmedOtherType, hasSelectedOtherType, resolvedTypeList.length, selectedTypes.length])

  const resetState = () => {
    setActiveKey('submit')
    setSelectedTypes([])
    setOtherTypeInput('')
    setConfirmedOtherType('')
    setFeedbackDescription('')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleTypeChange = (values: string[]) => {
    setSelectedTypes(values)

    if (!values.includes(OTHER_TYPE_VALUE)) {
      setOtherTypeInput('')
      setConfirmedOtherType('')
    }
  }

  const handleOtherTypeConfirm = () => {
    const trimmed = otherTypeInput.trim()
    if (!trimmed) {
      message.warning('请先输入其它类型')
      return
    }

    setConfirmedOtherType(trimmed)
    message.success('其它类型已确认')
  }

  const handleOtherTypeCancel = () => {
    setSelectedTypes(prev => prev.filter(type => type !== OTHER_TYPE_VALUE))
    setOtherTypeInput('')
    setConfirmedOtherType('')
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      message.warning('请至少勾选一种投诉与反馈类型')
      return
    }

    const detail = feedbackDescription.trim()
    const typeText = resolvedTypeList.join('、')
    const now = new Date()
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newRecord: FeedbackRecord = {
      id: `F-${now.getTime()}`,
      content: detail
        ? `类型：${typeText}；说明：${detail}`
        : `类型：${typeText}`,
      createdAt,
      status: '待审核',
    }

    setHistoryRecords(prev => [newRecord, ...prev])
    message.success('投诉与反馈已提交，等待管理员审核')
    resetState()
    setActiveKey('history')
  }

  const historyNode = (
    <div className="rounded-lg bg-blue-50 p-2">
      {historyRecords.length
        ? (
            <List
              dataSource={historyRecords}
              renderItem={record => (
                <List.Item className="!px-3 !py-3">
                  <Flex vertical gap={8} className="w-full">
                    <Flex align="center" justify="space-between" gap={10}>
                      <span className="text-xs text-blue-900/60">{record.id}</span>
                      <Tag
                        color={
                          record.status === '已处理'
                            ? 'blue'
                            : record.status === '处理中'
                              ? 'processing'
                              : 'gold'
                        }
                      >
                        {record.status}
                      </Tag>
                    </Flex>
                    <p className="text-sm text-blue-900">{record.content}</p>
                    <span className="text-xs text-blue-900/60">{record.createdAt}</span>
                  </Flex>
                </List.Item>
              )}
            />
          )
        : (
            <Empty description="暂无历史反馈" />
          )}
    </div>
  )

  return (
    <Modal
      title="意见反馈"
      open={open}
      onCancel={handleClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      width={640}
    >
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            key: 'submit',
            label: '提交反馈',
            children: (
              <Flex vertical gap={14}>
                <Flex vertical gap={8}>
                  <div className="text-sm text-blue-900">
                    投诉与反馈类型
                    <span className="ml-1 text-red-500">*</span>
                  </div>
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
                      onChange={event => setOtherTypeInput(event.target.value)}
                      placeholder="请输入其它类型（最多15字）"
                      maxLength={15}
                    />
                    <Flex justify="end">
                      <span className="text-xs text-blue-900/50">
                        {`${otherTypeInput.length} / 15`}
                      </span>
                    </Flex>
                    <Flex justify="end" gap={8}>
                      <Button onClick={handleOtherTypeCancel}>
                        取消
                      </Button>
                      <Button type="primary" onClick={handleOtherTypeConfirm}>
                        确认
                      </Button>
                    </Flex>
                    {confirmedOtherType && (
                      <Tag color="blue">{`已确认其它类型：${confirmedOtherType}`}</Tag>
                    )}
                  </Flex>
                )}

                <Flex vertical gap={8}>
                  <div className="text-sm text-blue-900">投诉与反馈说明（可选）</div>
                  <TextArea
                    value={feedbackDescription}
                    onChange={event => setFeedbackDescription(event.target.value)}
                    placeholder="请填写投诉与反馈说明（可选）"
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
                  <Button onClick={handleClose}>取消</Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    className="rounded-lg"
                    disabled={!canSubmit}
                  >
                    确认
                  </Button>
                </Flex>
              </Flex>
            ),
          },
          {
            key: 'history',
            label: '历史记录',
            children: historyNode,
          },
        ]}
      />
    </Modal>
  )
}

export default FeedbackModal

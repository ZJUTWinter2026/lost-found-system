'use client'

import { message, Modal, Tabs } from 'antd'
import { useState } from 'react'
import FeedbackHistoryList from '@/components/feedback/FeedbackHistoryList'
import FeedbackSubmitForm from '@/components/feedback/FeedbackSubmitForm'
import { useLostFoundStore } from '@/stores/lostFoundStore'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const feedbackRecords = useLostFoundStore(state => state.feedbackRecords)
  const submitFeedback = useLostFoundStore(state => state.submitFeedback)
  const [activeKey, setActiveKey] = useState('submit')

  const handleClose = () => {
    setActiveKey('submit')
    onClose()
  }

  return (
    <Modal
      title="意见反馈"
      open={open}
      onCancel={handleClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      width={640}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            key: 'submit',
            label: '提交反馈',
            children: (
              <FeedbackSubmitForm
                onCancel={handleClose}
                onSubmit={(payload) => {
                  submitFeedback({
                    types: payload.types,
                    description: payload.description,
                    source: '意见箱',
                  })
                  message.success('投诉与反馈已提交，等待管理员审核')
                  setActiveKey('history')
                  return true
                }}
              />
            ),
          },
          {
            key: 'history',
            label: '历史记录',
            children: <FeedbackHistoryList records={feedbackRecords} />,
          },
        ]}
      />
    </Modal>
  )
}

export default FeedbackModal

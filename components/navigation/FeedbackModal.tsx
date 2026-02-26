'use client'

import { message, Modal, Tabs } from 'antd'
import { useState } from 'react'
import FeedbackHistoryList from '@/components/feedback/FeedbackHistoryList'
import FeedbackSubmitForm from '@/components/feedback/FeedbackSubmitForm'
import { useFeedbackRecordsQuery, useSubmitFeedbackMutation } from '@/hooks/queries/useFeedbackQueries'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const feedbackRecordsQuery = useFeedbackRecordsQuery({ page: 1, page_size: 20 }, open)
  const submitFeedbackMutation = useSubmitFeedbackMutation()
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
                submitting={submitFeedbackMutation.isPending}
                onSubmit={async (payload) => {
                  try {
                    await submitFeedbackMutation.mutateAsync({
                      types: payload.types,
                      description: payload.description,
                      source: '意见箱',
                    })
                    message.success('投诉与反馈已提交，等待管理员审核')
                    setActiveKey('history')
                    return true
                  }
                  catch (error) {
                    message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
                    return false
                  }
                }}
              />
            ),
          },
          {
            key: 'history',
            label: '历史记录',
            children: <FeedbackHistoryList records={feedbackRecordsQuery.data || []} />,
          },
        ]}
      />
    </Modal>
  )
}

export default FeedbackModal

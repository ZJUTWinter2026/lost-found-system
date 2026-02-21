'use client'

import { message, Modal } from 'antd'
import FeedbackSubmitForm from '@/components/feedback/FeedbackSubmitForm'
import { useLostFoundStore } from '@/stores/lostFoundStore'

interface ComplaintModalProps {
  open: boolean
  onClose: () => void
}

function ComplaintModal({ open, onClose }: ComplaintModalProps) {
  const submitFeedback = useLostFoundStore(state => state.submitFeedback)

  return (
    <Modal
      title="投诉与反馈"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={640}
    >
      <FeedbackSubmitForm
        onCancel={onClose}
        onSubmit={(payload) => {
          submitFeedback({
            types: payload.types,
            description: payload.description,
            source: '物品详情',
          })
          message.success('投诉与反馈已提交，等待管理员审核')
          onClose()
          return true
        }}
      />
    </Modal>
  )
}

export default ComplaintModal

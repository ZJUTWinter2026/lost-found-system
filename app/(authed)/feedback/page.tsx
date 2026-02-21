'use client'

import { Card, Flex, message, Typography } from 'antd'
import FeedbackHistoryList from '@/components/feedback/FeedbackHistoryList'
import FeedbackSubmitForm from '@/components/feedback/FeedbackSubmitForm'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { Paragraph, Title } = Typography

function FeedbackPage() {
  const feedbackRecords = useLostFoundStore(state => state.feedbackRecords)
  const submitFeedback = useLostFoundStore(state => state.submitFeedback)

  return (
    <Flex vertical gap={12} className="mx-auto w-full max-w-4xl">
      <Card className="rounded-lg border-blue-100" styles={{ body: { padding: 16 } }}>
        <Title level={4} className="!mb-2 !text-blue-700">
          意见与反馈
        </Title>
        <Paragraph className="!mb-0 !text-blue-900/70">
          投诉与反馈类型为必选，说明为可选，提交后将进入待审核状态。
        </Paragraph>
      </Card>

      <Card
        title="提交反馈"
        className="rounded-lg border-blue-100"
        styles={{ body: { padding: 16 } }}
      >
        <FeedbackSubmitForm
          submitText="确认提交"
          onSubmit={(payload) => {
            submitFeedback({
              types: payload.types,
              description: payload.description,
              source: '反馈页',
            })
            message.success('投诉与反馈已提交，等待管理员审核')
            return true
          }}
        />
      </Card>

      <Card
        title="查看历史记录"
        className="rounded-lg border-blue-100"
        styles={{ body: { padding: 12 } }}
      >
        <FeedbackHistoryList records={feedbackRecords} />
      </Card>
    </Flex>
  )
}

export default FeedbackPage

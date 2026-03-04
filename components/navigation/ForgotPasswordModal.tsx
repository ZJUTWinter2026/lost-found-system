'use client'

import { Alert, Button, Flex, Form, Input, message, Modal } from 'antd'
import { useEffect } from 'react'
import { useForgotPasswordMutation } from '@/hooks/queries/useUserAuthMutations'

interface ForgotPasswordModalProps {
  open: boolean
  initialUsername?: string
  onClose: () => void
}

interface FormValues {
  username: string
  idCard: string
}

function ForgotPasswordModal({
  open,
  initialUsername,
  onClose,
}: ForgotPasswordModalProps) {
  const [form] = Form.useForm<FormValues>()
  const forgotPasswordMutation = useForgotPasswordMutation()

  useEffect(() => {
    if (!open || !initialUsername)
      return

    form.setFieldValue('username', initialUsername.trim())
  }, [form, initialUsername, open])

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const result = await forgotPasswordMutation.mutateAsync({
        username: values.username.trim(),
        id_card: values.idCard.trim(),
      })

      if (!result.success) {
        message.error('重置失败，请稍后重试')
        return
      }

      message.success('密码重置成功，请使用新密码登录')
      handleClose()
    }
    catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error)
        return

      message.error(error instanceof Error ? error.message : '重置失败，请稍后重试')
    }
  }

  return (
    <Modal
      title="忘记密码"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={520}
    >
      <Flex vertical gap={12} style={{ marginTop: 8 }}>
        <Alert
          showIcon
          type="info"
          message="请填写账号和身份证号进行身份校验，校验通过后将重置密码。"
        />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[
              { required: true, message: '请输入账号' },
            ]}
          >
            <Input maxLength={50} placeholder="请输入学号/工号" />
          </Form.Item>

          <Form.Item
            label="身份证号"
            name="idCard"
            rules={[
              { required: true, message: '请输入身份证号' },
              { len: 18, message: '身份证号长度需为18位' },
              {
                pattern: /^\d{17}[\dX]$/i,
                message: '请输入有效的18位身份证号',
              },
            ]}
          >
            <Input maxLength={18} placeholder="请输入18位身份证号" />
          </Form.Item>
        </Form>

        <Flex justify="end" gap={8}>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            loading={forgotPasswordMutation.isPending}
            onClick={() => {
              void handleSubmit()
            }}
          >
            确认重置
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ForgotPasswordModal

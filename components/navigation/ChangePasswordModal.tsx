'use client'

import { Alert, Button, Flex, Form, Input, message, Modal } from 'antd'
import { useUpdatePasswordMutation } from '@/hooks/queries/useUserAuthMutations'
import { markPasswordUpdated } from '@/utils/auth'

interface ChangePasswordModalProps {
  open: boolean
  required?: boolean
  onClose: () => void
  onUpdated?: () => void
}

interface FormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

function ChangePasswordModal({
  open,
  required = false,
  onClose,
  onUpdated,
}: ChangePasswordModalProps) {
  const [form] = Form.useForm<FormValues>()
  const updatePasswordMutation = useUpdatePasswordMutation()

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      await updatePasswordMutation.mutateAsync({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      })

      markPasswordUpdated()
      message.success('密码修改成功')
      onUpdated?.()
      handleClose()
    }
    catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error)
        return

      message.error(error instanceof Error ? error.message : '修改失败，请稍后重试')
    }
  }

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={handleClose}
      footer={null}
      maskClosable={!required}
      keyboard={!required}
      closable={!required}
      destroyOnHidden
      width={560}
    >
      <Flex vertical gap={12}>
        {required && (
          <Alert
            showIcon
            type="warning"
            message="检测到您正在使用初始密码，请先完成修改以保障账号安全。"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[
              { required: true, message: '请输入原密码' },
              { min: 6, max: 18, message: '原密码长度需为 6-18 位' },
            ]}
          >
            <Input.Password maxLength={18} placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, max: 12, message: '新密码长度需为 6-12 位' },
              {
                validator: (_, value) => {
                  const oldPassword = form.getFieldValue('oldPassword') as string | undefined
                  if (!value || !oldPassword || value !== oldPassword)
                    return Promise.resolve()

                  return Promise.reject(new Error('新密码不能与原密码一致'))
                },
              },
            ]}
          >
            <Input.Password maxLength={12} placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (!value || value === getFieldValue('newPassword'))
                    return Promise.resolve()

                  return Promise.reject(new Error('两次输入的新密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password maxLength={12} placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>

        <Flex justify="end" gap={8}>
          {!required && <Button onClick={handleClose}>取消</Button>}
          <Button
            type="primary"
            loading={updatePasswordMutation.isPending}
            onClick={() => {
              void handleSubmit()
            }}
          >
            确认修改
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ChangePasswordModal

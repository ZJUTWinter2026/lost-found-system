'use client'

import type { ClaimAction, LostFoundItem } from './types'
import { Button, Flex, Input, message, Modal, Segmented, Typography } from 'antd'
import { useState } from 'react'
import PhotoUploader from '@/components/publish/PhotoUploader'
import { useSubmitClaimMutation } from '@/hooks/queries/useLostFoundQueries'

const { TextArea } = Input
const { Text } = Typography

interface ClaimRequestModalProps {
  open: boolean
  item: LostFoundItem
  onClose: () => void
}

function getDefaultAction(postType: LostFoundItem['postType']): ClaimAction {
  return postType === '失物' ? '找回' : '归还'
}

function ClaimRequestModal({ open, item, onClose }: ClaimRequestModalProps) {
  const submitClaimMutation = useSubmitClaimMutation()
  const [action, setAction] = useState<ClaimAction>(() => getDefaultAction(item.postType))
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const handleClose = () => {
    setAction(getDefaultAction(item.postType))
    setDescription('')
    setPhotos([])
    onClose()
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      message.warning('请填写补充说明')
      return
    }

    try {
      await submitClaimMutation.mutateAsync({
        itemId: item.id,
        action,
        detail: description,
        photos: photos.slice(0, 3),
      })
      message.success('认领申请已提交，等待管理员审核')
      handleClose()
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
    }
  }

  return (
    <Modal
      title="认领与沟通"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={640}
    >
      <Flex vertical gap={14}>
        <Segmented
          block
          value={action}
          options={[
            { label: '归还', value: '归还' },
            { label: '找回', value: '找回' },
          ]}
          onChange={value => setAction(value as ClaimAction)}
        />

        <Flex vertical gap={8}>
          <Text className="text-sm text-blue-900">物品额外特征或相关证明</Text>
          <TextArea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="请输入补充信息（最多500字）"
            autoSize={{ minRows: 4, maxRows: 8 }}
            maxLength={500}
          />
        </Flex>

        <Flex justify="end">
          <Text className="text-xs text-blue-900/50">{`${description.length} / 500`}</Text>
        </Flex>

        <Flex vertical gap={8}>
          <Text className="text-sm text-blue-900">提交照片（最多3张）</Text>
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </Flex>

        <Flex justify="end" gap={8}>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={() => {
              void handleSubmit()
            }}
            className="rounded-lg"
            loading={submitClaimMutation.isPending}
          >
            确认
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ClaimRequestModal

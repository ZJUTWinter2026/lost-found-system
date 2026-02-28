'use client'

import type { LostFoundItem } from './types'
import { Button, Flex, Input, message, Modal, Typography } from 'antd'
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

function getClaimApplyTitle(postType: LostFoundItem['postType']) {
  return postType === '失物' ? '归还申请' : '认领申请'
}

function ClaimRequestModal({ open, item, onClose }: ClaimRequestModalProps) {
  const submitClaimMutation = useSubmitClaimMutation()
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const claimApplyTitle = getClaimApplyTitle(item.postType)

  const handleClose = () => {
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
        postId: item.id,
        description,
        proofImages: photos.slice(0, 3),
      })
      message.success(`${claimApplyTitle}已提交，等待管理员审核`)
      handleClose()
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
    }
  }

  return (
    <Modal
      title={claimApplyTitle}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={640}
    >
      <Flex vertical gap={14} style={{ marginTop: 18 }}>
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

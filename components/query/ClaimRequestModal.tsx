'use client'

import type { UploadFile, UploadProps } from 'antd'
import type { ClaimAction, LostFoundItem } from './types'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Flex, Input, message, Modal, Upload } from 'antd'
import { useState } from 'react'
import { useLostFoundStore } from '@/stores/lostFoundStore'

const { TextArea } = Input

interface ClaimRequestModalProps {
  open: boolean
  item: LostFoundItem
  onClose: () => void
}

function getDefaultAction(postType: LostFoundItem['postType']): ClaimAction {
  return postType === '失物' ? '找回' : '归还'
}

function ClaimRequestModal({ open, item, onClose }: ClaimRequestModalProps) {
  const submitClaim = useLostFoundStore(state => state.submitClaim)
  const [action, setAction] = useState<ClaimAction>(() => getDefaultAction(item.postType))
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleUploadBefore: UploadProps['beforeUpload'] = () => {
    if (fileList.length >= 3) {
      message.warning('最多提交3张照片')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    if (info.fileList.length > 3)
      message.warning('最多提交3张照片')

    setFileList(info.fileList.slice(0, 3))
  }

  const handleSubmit = () => {
    const isSubmitted = submitClaim({
      itemId: item.id,
      action,
      detail: description,
      photos: fileList.map(file => file.name),
    })
    if (!isSubmitted) {
      message.error('提交失败，请稍后重试')
      return
    }

    message.success('认领申请已提交，等待管理员审核')
    onClose()
  }

  return (
    <Modal
      title="认领与沟通"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={640}
    >
      <Flex vertical gap={14}>
        <Flex align="center" gap={8}>
          <Button
            type={action === '归还' ? 'primary' : 'default'}
            onClick={() => setAction('归还')}
            className="rounded-lg"
          >
            归还
          </Button>
          <Button
            type={action === '找回' ? 'primary' : 'default'}
            onClick={() => setAction('找回')}
            className="rounded-lg"
          >
            找回
          </Button>
        </Flex>

        <Flex vertical gap={8}>
          <div className="text-sm text-blue-900">物品额外特征或相关证明</div>
          <TextArea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="请输入补充信息（最多500字）"
            autoSize={{ minRows: 4, maxRows: 8 }}
            maxLength={500}
          />
        </Flex>

        <Flex justify="end">
          <span className="text-xs text-blue-900/50">{`${description.length} / 500`}</span>
        </Flex>

        <Flex vertical gap={8}>
          <div className="text-sm text-blue-900">提交照片（最多3张）</div>
          <Upload
            listType="picture-card"
            accept="image/*"
            fileList={fileList}
            beforeUpload={handleUploadBefore}
            onChange={handleUploadChange}
          >
            {fileList.length >= 3
              ? null
              : (
                  <Flex vertical align="center" gap={4}>
                    <UploadOutlined />
                    <span className="text-xs">上传图片</span>
                  </Flex>
                )}
          </Upload>
        </Flex>

        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit} className="rounded-lg">
            确认
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ClaimRequestModal

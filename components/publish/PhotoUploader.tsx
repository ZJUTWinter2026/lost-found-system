'use client'

import type { UploadProps } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Image, message, Upload } from 'antd'
import { useUploadImagesMutation } from '@/hooks/queries/useUserAuthMutations'

interface PhotoUploaderProps {
  photos: string[]
  maxCount?: number
  onChange: (nextPhotos: string[]) => void
}

function PhotoUploader({ photos, maxCount = 3, onChange }: PhotoUploaderProps) {
  const uploadImagesMutation = useUploadImagesMutation()

  const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
    if (!file.type.startsWith('image/')) {
      message.warning('仅支持上传图片文件')
      return Upload.LIST_IGNORE
    }

    if (photos.length >= maxCount) {
      message.warning(`最多上传 ${maxCount} 张图片`)
      return Upload.LIST_IGNORE
    }

    if (!(file instanceof File)) {
      message.error('图片文件无效，请重试')
      return Upload.LIST_IGNORE
    }

    try {
      const urls = await uploadImagesMutation.mutateAsync([file])
      if (!urls.length) {
        message.error('图片上传失败，请重试')
        return Upload.LIST_IGNORE
      }

      onChange([...photos, urls[0]])
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '图片上传失败，请重试')
    }

    return Upload.LIST_IGNORE
  }

  const removePhoto = (indexToRemove: number) => {
    onChange(photos.filter((_, index) => index !== indexToRemove))
  }

  return (
    <Flex vertical gap={8} align="start">
      <Upload
        accept="image/*"
        multiple
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
      >
        <Button
          icon={<UploadOutlined />}
          className="rounded-lg"
          disabled={photos.length >= maxCount || uploadImagesMutation.isPending}
        >
          {uploadImagesMutation.isPending ? '上传中...' : '上传图片'}
        </Button>
      </Upload>

      {!!photos.length && (
        <Flex gap={8} wrap className="w-full">
          {photos.map((photo, index) => (
            <Card
              key={`${photo.slice(0, 20)}-${index + 1}`}
              size="small"
              className="rounded-lg border-blue-100"
              styles={{ body: { padding: 8 } }}
            >
              <Flex vertical gap={6}>
                <Image
                  src={photo}
                  alt={`上传图片-${index + 1}`}
                  width={92}
                  height={92}
                  className="rounded-lg object-cover"
                />
                <Button
                  size="small"
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removePhoto(index)}
                >
                  删除
                </Button>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  )
}

export default PhotoUploader

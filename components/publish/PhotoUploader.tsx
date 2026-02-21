import type { UploadProps } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Flex, Image, message, Upload } from 'antd'

interface PhotoUploaderProps {
  photos: string[]
  maxCount?: number
  onChange: (nextPhotos: string[]) => void
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

function PhotoUploader({ photos, maxCount = 3, onChange }: PhotoUploaderProps) {
  const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
    if (!file.type.startsWith('image/')) {
      message.warning('仅支持上传图片文件')
      return Upload.LIST_IGNORE
    }

    if (photos.length >= maxCount) {
      message.warning(`最多上传 ${maxCount} 张图片`)
      return Upload.LIST_IGNORE
    }

    try {
      const dataUrl = await fileToDataUrl(file as File)
      onChange([...photos, dataUrl])
    }
    catch {
      message.error('图片处理失败，请重试')
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
          disabled={photos.length >= maxCount}
        >
          上传图片
        </Button>
      </Upload>

      {!!photos.length && (
        <Flex gap={8} wrap className="w-full">
          {photos.map((photo, index) => (
            <Flex
              key={`${photo.slice(0, 20)}-${index + 1}`}
              vertical
              gap={6}
              className="rounded-lg border border-blue-100 bg-white p-2"
            >
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
          ))}
        </Flex>
      )}
    </Flex>
  )
}

export default PhotoUploader

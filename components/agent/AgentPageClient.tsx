'use client'

import type { BubbleItemType, ConversationItemType } from '@ant-design/x'
import type { UploadProps } from 'antd'
import type { ComponentRef } from 'react'
import { DeleteOutlined, PlusOutlined, RobotOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import { Bubble, Conversations, Sender, Welcome } from '@ant-design/x'
import XMarkdown from '@ant-design/x-markdown'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Card, Flex, Image, message, Spin, Typography, Upload } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { streamAgentMessage } from '@/api/modules/agent'
import { queryKeys } from '@/api/queryKeys'
import {
  useAgentHistoryQuery,
  useAgentSessionsQuery,
  useCreateAgentSessionMutation,
} from '@/hooks/queries/useAgentQueries'
import { useUploadImagesMutation } from '@/hooks/queries/useUserAuthMutations'
import { useAuthStore } from '@/stores/authStore'

const { Text } = Typography
const MAX_SENDER_IMAGE_COUNT = 3

interface BubbleMediaContent {
  text: string
  images: string[]
}

function toDisplayText(value: string, fallback: string) {
  const normalized = value.trim()
  return normalized || fallback
}

function toSessionTimeLabel(value: string) {
  const normalized = value.trim()
  return normalized || '刚刚更新'
}

function createBubbleKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toMarkdownContent(content: unknown) {
  if (typeof content === 'string')
    return content

  if (content === undefined || content === null)
    return ''

  return String(content)
}

function toImageList(value: unknown) {
  if (!Array.isArray(value))
    return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
}

function isBubbleMediaContent(value: unknown): value is BubbleMediaContent {
  return typeof value === 'object'
    && value !== null
    && 'text' in value
    && 'images' in value
}

function toBubbleText(value: unknown) {
  if (isBubbleMediaContent(value))
    return toMarkdownContent(value.text)

  return toMarkdownContent(value)
}

function toBubbleImages(value: unknown) {
  if (!isBubbleMediaContent(value))
    return []

  return toImageList(value.images)
}

function buildUserBubbleContent(text: string, images: string[]): BubbleMediaContent {
  return {
    text: text.trim(),
    images: toImageList(images),
  }
}

function AgentPageClient() {
  const queryClient = useQueryClient()
  const authUserId = useAuthStore(state => state.authUser?.id)
  const bubbleListRef = useRef<ComponentRef<typeof Bubble.List> | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [senderValue, setSenderValue] = useState('')
  const [senderImages, setSenderImages] = useState<string[]>([])
  const [bubbleItems, setBubbleItems] = useState<BubbleItemType[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const sessionsQuery = useAgentSessionsQuery()
  const resolvedActiveSessionId = selectedSessionId || sessionsQuery.data?.[0]?.session_id || ''
  const historyQuery = useAgentHistoryQuery(
    resolvedActiveSessionId,
    !!resolvedActiveSessionId,
  )
  const createSessionMutation = useCreateAgentSessionMutation()
  const uploadImagesMutation = useUploadImagesMutation()
  const isInputDisabled = createSessionMutation.isPending || historyQuery.isLoading
  const isUploadDisabled = isInputDisabled || isStreaming || uploadImagesMutation.isPending

  const roleConfig = useMemo(
    () => ({
      ai: (item: BubbleItemType) => ({
        placement: 'start' as const,
        variant: 'shadow' as const,
        shape: 'default' as const,
        avatar: <Avatar size={28} icon={<RobotOutlined />} className="!bg-blue-600" />,
        typing: false,
        contentRender: (content: unknown) => (
          <XMarkdown
            content={toBubbleText(content)}
            streaming={{ hasNextChunk: !!item.streaming }}
            className="text-blue-900"
            openLinksInNewTab
          />
        ),
      }),
      user: {
        placement: 'end' as const,
        variant: 'filled' as const,
        shape: 'default' as const,
        avatar: <Avatar size={28} icon={<UserOutlined />} className="!bg-blue-400" />,
        contentRender: (content: unknown) => {
          const text = toBubbleText(content)
          const images = toBubbleImages(content)

          return (
            <Flex vertical gap={2}>
              {!!images.length && (
                <Flex gap={6} wrap className="max-w-[220px]">
                  {images.map((image, index) => (
                    <Image
                      key={`${image.slice(0, 20)}-${index + 1}`}
                      src={image}
                      alt={`消息图片-${index + 1}`}
                      width={72}
                      height={72}
                      className="rounded-md border border-white/40 object-cover"
                    />
                  ))}
                </Flex>
              )}
              {!!text && (
                <div className="whitespace-pre-wrap break-words text-sm leading-6">
                  {text}
                </div>
              )}
            </Flex>
          )
        },
      },
    }),
    [],
  )

  const conversationItems = useMemo<ConversationItemType[]>(
    () =>
      (sessionsQuery.data || []).map((session, index) => {
        const title = toDisplayText(session.title, `会话 ${index + 1}`)
        const timeLabel = toSessionTimeLabel(session.updated_at || session.created_at)

        return {
          key: session.session_id,
          label: (
            <Flex vertical gap={2} className="min-w-0">
              <Text
                className="!text-blue-900"
                ellipsis={{ tooltip: title }}
              >
                {title}
              </Text>
              <Text className="!text-xs !text-blue-900/55">
                {timeLabel}
              </Text>
            </Flex>
          ),
        }
      }),
    [sessionsQuery.data],
  )

  const historyBubbleItems = useMemo<BubbleItemType[]>(
    () =>
      (historyQuery.data || []).map((record) => {
        if (record.role !== 'user') {
          return {
            key: createBubbleKey('history-ai'),
            role: 'ai',
            content: record.content,
          }
        }

        return {
          key: createBubbleKey('history-user'),
          role: 'user',
          content: buildUserBubbleContent(record.content, record.images),
        }
      }),
    [historyQuery.data],
  )

  const displayBubbleItems = useMemo(
    () => (bubbleItems.length ? bubbleItems : historyBubbleItems),
    [bubbleItems, historyBubbleItems],
  )

  useEffect(
    () => () => {
      streamAbortRef.current?.abort()
    },
    [],
  )

  useEffect(() => {
    if (!displayBubbleItems.length)
      return

    const frameId = window.requestAnimationFrame(() => {
      const bubbleList = bubbleListRef.current
      if (!bubbleList?.scrollBoxNativeElement)
        return

      bubbleList.scrollTo({ top: 'bottom', behavior: 'smooth' })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [displayBubbleItems])

  const handleCreateSession = async () => {
    if (isStreaming) {
      message.warning('当前回复进行中，请稍后再新建会话')
      return
    }

    try {
      const sessionId = await createSessionMutation.mutateAsync({})
      setSelectedSessionId(sessionId)
      setSenderValue('')
      setSenderImages([])
      setBubbleItems([])
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '新建会话失败，请稍后重试')
    }
  }

  const handleSessionChange = (sessionId: string | number) => {
    if (isStreaming) {
      message.warning('当前回复进行中，请稍后再切换会话')
      return
    }

    setSenderValue('')
    setSenderImages([])
    setBubbleItems([])
    setSelectedSessionId(String(sessionId))
  }

  const handleSubmit = async (inputValue: string) => {
    const normalizedMessage = inputValue.trim()
    const normalizedImages = toImageList(senderImages).slice(0, MAX_SENDER_IMAGE_COUNT)
    if (!normalizedMessage || isStreaming)
      return

    setSenderValue('')
    setSenderImages([])
    let nextSessionId = resolvedActiveSessionId
    let assistantKey = ''
    let assistantContent = ''

    try {
      if (!nextSessionId) {
        nextSessionId = await createSessionMutation.mutateAsync({
          title: normalizedMessage.slice(0, 20),
        })
        setSelectedSessionId(nextSessionId)
        setBubbleItems([])
      }

      assistantKey = createBubbleKey('assistant')
      const userKey = createBubbleKey('user')

      setBubbleItems((prev) => {
        const baseItems = prev.length ? prev : historyBubbleItems

        return [
          ...baseItems,
          {
            key: userKey,
            role: 'user',
            content: buildUserBubbleContent(normalizedMessage, normalizedImages),
          },
          {
            key: assistantKey,
            role: 'ai',
            content: '',
            loading: true,
          },
        ]
      })

      setIsStreaming(true)
      const abortController = new AbortController()
      streamAbortRef.current = abortController

      await streamAgentMessage(
        {
          session_id: nextSessionId,
          message: normalizedMessage,
          images: normalizedImages,
        },
        {
          onEvent: (event) => {
            if (!event.content)
              return

            assistantContent += event.content
            setBubbleItems((prev) => {
              return prev.map((item) => {
                if (item.key !== assistantKey)
                  return item

                return {
                  ...item,
                  content: assistantContent,
                  loading: false,
                  streaming: true,
                }
              })
            })
          },
        },
        abortController.signal,
      )

      setBubbleItems((prev) => {
        return prev.map((item) => {
          if (item.key !== assistantKey)
            return item

          return {
            ...item,
            content: assistantContent || '已收到你的问题，暂时没有生成可展示内容。',
            loading: false,
            streaming: false,
          }
        })
      })

      void queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions(authUserId) })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.agent.history({ session_id: nextSessionId }, authUserId),
      })
    }
    catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        message.error(error instanceof Error ? error.message : '发送失败，请稍后重试')
      }

      if (assistantKey) {
        setBubbleItems((prev) => {
          return prev.map((item) => {
            if (item.key !== assistantKey)
              return item

            return {
              ...item,
              content: assistantContent || '请求失败，请稍后重试。',
              loading: false,
              streaming: false,
            }
          })
        })
      }
    }
    finally {
      streamAbortRef.current = null
      setIsStreaming(false)
    }
  }

  const handleSenderImageUpload: UploadProps['beforeUpload'] = async (file) => {
    if (isUploadDisabled)
      return Upload.LIST_IGNORE

    if (!file.type.startsWith('image/')) {
      message.warning('仅支持上传图片文件')
      return Upload.LIST_IGNORE
    }

    if (senderImages.length >= MAX_SENDER_IMAGE_COUNT) {
      message.warning(`最多上传 ${MAX_SENDER_IMAGE_COUNT} 张图片`)
      return Upload.LIST_IGNORE
    }

    if (!(file instanceof File)) {
      message.error('图片文件无效，请重试')
      return Upload.LIST_IGNORE
    }

    try {
      const urls = await uploadImagesMutation.mutateAsync([file])
      const uploadedUrl = urls[0]?.trim()
      if (!uploadedUrl) {
        message.error('图片上传失败，请重试')
        return Upload.LIST_IGNORE
      }

      setSenderImages(prev => [...prev, uploadedUrl].slice(0, MAX_SENDER_IMAGE_COUNT))
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : '图片上传失败，请重试')
    }

    return Upload.LIST_IGNORE
  }

  return (
    <Flex className="mx-auto w-full max-w-[1820px] items-center justify-center lg:min-h-[calc(100dvh-108px)]">
      <Flex
        gap={12}
        className="w-full flex-col lg:h-[calc(100dvh-108px)] lg:min-h-[700px] lg:flex-row lg:items-stretch"
      >
        <Card
          className="w-full rounded-lg border-blue-100 lg:h-full lg:w-[320px] lg:shrink-0"
          styles={{ body: { padding: 12, height: '100%' } }}
        >
          <Flex vertical gap={10} className="h-full">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {sessionsQuery.isLoading
                ? (
                    <Flex align="center" justify="center" className="h-full py-8">
                      <Spin size="small" />
                    </Flex>
                  )
                : (
                    <Conversations
                      items={conversationItems}
                      activeKey={resolvedActiveSessionId || undefined}
                      onActiveChange={handleSessionChange}
                      creation={{
                        icon: <PlusOutlined />,
                        label: '新建会话',
                        onClick: () => {
                          void handleCreateSession()
                        },
                        disabled: createSessionMutation.isPending || isStreaming,
                      }}
                      className="rounded-lg"
                    />
                  )}
            </div>

            {sessionsQuery.isError && (
              <Flex vertical gap={8}>
                <Text className="!text-xs !text-red-500">
                  {sessionsQuery.error instanceof Error
                    ? sessionsQuery.error.message
                    : '获取会话失败，请稍后重试'}
                </Text>
                <Button
                  size="small"
                  onClick={() => {
                    void sessionsQuery.refetch()
                  }}
                >
                  重试
                </Button>
              </Flex>
            )}
          </Flex>
        </Card>

        <Card
          className="w-full rounded-lg border-blue-100 lg:h-full lg:min-w-0 lg:flex-1"
          styles={{ body: { padding: 12, height: '100%' } }}
        >
          <Flex vertical gap={10} className="h-[74dvh] min-h-[540px] lg:h-full">
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg bg-blue-50/70 p-2">
              {historyQuery.isLoading && resolvedActiveSessionId
                ? (
                    <Flex align="center" justify="center" className="h-full">
                      <Spin />
                    </Flex>
                  )
                : historyQuery.isError
                  ? (
                      <Flex vertical gap={8} align="center" justify="center" className="h-full">
                        <Text className="!text-red-500">
                          {historyQuery.error instanceof Error
                            ? historyQuery.error.message
                            : '加载历史消息失败'}
                        </Text>
                        <Button
                          onClick={() => {
                            void historyQuery.refetch()
                          }}
                        >
                          重试
                        </Button>
                      </Flex>
                    )
                  : displayBubbleItems.length
                    ? (
                        <Bubble.List
                          ref={bubbleListRef}
                          items={displayBubbleItems}
                          role={roleConfig}
                          className="h-full"
                          styles={{ scroll: { paddingInlineEnd: 4, paddingBlock: 6 } }}
                        />
                      )
                    : (
                        <Welcome
                          variant="borderless"
                          icon={<Avatar icon={<RobotOutlined />} className="!bg-blue-600" />}
                          title={resolvedActiveSessionId ? '开始继续对话' : '新建会话并开始提问'}
                          description="例如：帮我整理一条失物招领信息；或查询黑色水杯相关记录。"
                        />
                      )}
            </div>

            <Sender
              value={senderValue}
              onChange={value => setSenderValue(value)}
              onSubmit={(value) => {
                void handleSubmit(value)
              }}
              header={senderImages.length
                ? (
                    <div className="pl-[15px] pr-2 pt-2">
                      <div className="flex max-w-full flex-wrap gap-2">
                        {senderImages.map((photo, index) => (
                          <div
                            key={`${photo.slice(0, 20)}-${index + 1}`}
                            className="group relative overflow-hidden rounded-md border border-blue-100 bg-white p-1"
                          >
                            <Image
                              src={photo}
                              alt={`对话图片-${index + 1}`}
                              width={38}
                              height={38}
                              preview={false}
                              className="rounded object-cover"
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              disabled={isUploadDisabled}
                              className="!absolute !right-0.5 !top-0.5 !h-5 !w-5 !min-w-0 !rounded-full !bg-white/90 !p-0 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => {
                                setSenderImages(prev => prev.filter((_, imageIndex) => imageIndex !== index))
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                : null}
              suffix={actionNode => (
                <Flex align="center" gap={8} className="pl-[15px]">
                  <Upload
                    accept="image/*"
                    multiple
                    showUploadList={false}
                    disabled={isUploadDisabled || senderImages.length >= MAX_SENDER_IMAGE_COUNT}
                    beforeUpload={handleSenderImageUpload}
                  >
                    <Button
                      type="text"
                      icon={<UploadOutlined />}
                      className="rounded-lg !px-2 text-blue-700"
                      disabled={isUploadDisabled || senderImages.length >= MAX_SENDER_IMAGE_COUNT}
                    >
                      {uploadImagesMutation.isPending
                        ? '上传中...'
                        : senderImages.length >= MAX_SENDER_IMAGE_COUNT
                          ? '已满'
                          : '上传'}
                    </Button>
                  </Upload>
                  {actionNode}
                </Flex>
              )}
              loading={isStreaming}
              onCancel={() => streamAbortRef.current?.abort()}
              disabled={isInputDisabled}
              placeholder="输入问题并回车发送"
              className="rounded-lg border border-blue-100 bg-white"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Flex>
        </Card>
      </Flex>
    </Flex>
  )
}

export default AgentPageClient

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ReactQueryProvider from '@/components/providers/ReactQueryProvider'
import 'antd/dist/reset.css'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: '校园失物招领平台',
    template: '%s | 校园失物招领平台',
  },
  description: '面向校园场景的失物招领与认领平台，帮助同学更快找回遗失物品。',
  keywords: ['校园', '失物招领', '认领', '校园服务', '拾金不昧'],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '컷꾸 | 나만의 포토부스 프레임',
  description: '포토부스 프레임을 꾸미고 사진을 합성해 다운로드하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic&family=Nanum+Myeongjo&family=Do+Hyeon&family=Black+Han+Sans&display=swap"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}

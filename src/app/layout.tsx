import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://cut-kku.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: '컷꾸 | 나만의 포토부스 프레임 꾸미기',
  description: '포토부스 사진에 스티커·텍스트·필터를 더해 나만의 프레임을 만들고 PNG로 다운로드하세요. 인생네컷 스타일 커스텀 프레임 제작 무료 서비스.',
  keywords: ['포토부스', '인생네컷', '프레임꾸미기', '사진편집', '스티커', '컷꾸'],
  authors: [{ name: 'Sumin', url: BASE_URL }],
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: '컷꾸',
    title: '컷꾸 | 나만의 포토부스 프레임 꾸미기',
    description: '포토부스 사진에 스티커·텍스트·필터를 더해 나만의 프레임을 만들고 PNG로 다운로드하세요.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '컷꾸 - 포토부스 프레임 꾸미기' }],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '컷꾸 | 나만의 포토부스 프레임 꾸미기',
    description: '포토부스 사진에 스티커·텍스트·필터를 더해 나만의 프레임을 만들어보세요.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
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

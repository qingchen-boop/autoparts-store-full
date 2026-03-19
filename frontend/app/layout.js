// Root Layout
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'AutoParts - 专业汽车配件商城',
  description: '专业汽车配件供应商,刹车片、滤芯、发动机零件等。全球配送,专家支持。',
  keywords: '汽车配件,刹车片,滤芯,发动机零件,汽车用品',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="__className_f367f3">
        <LanguageProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}

// Client Layout Wrapper
'use client'

import { useLanguage } from '@/context/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientLayout({ children }) {
  const { dir } = useLanguage()

  return (
    <div dir={dir}>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  )
}

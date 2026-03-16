// Root Layout
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'AutoParts Store - Quality Auto Parts Online',
  description: 'Professional auto parts supplier. Find brake pads, filters, engine parts, and more. Global shipping available.',
  keywords: 'auto parts, car parts, brake pads, oil filters, automotive parts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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

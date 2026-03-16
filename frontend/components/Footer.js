// Footer Component with i18n
'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t, dir } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">AutoParts</h3>
            <p className="text-gray-400 mb-4">
              {dir === 'rtl' 
                ? 'مصدرك الموثوق لقطع غيار السيارات عالية الجودة. الشحن العالمي متاح.'
                : 'Your trusted source for quality auto parts. Global shipping available.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">📘</a>
              <a href="#" className="text-gray-400 hover:text-white">📸</a>
              <a href="#" className="text-gray-400 hover:text-white">💬</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/products" className="hover:text-white">{t('allProducts')}</Link></li>
              <li><Link href="/categories" className="hover:text-white">{t('browseByCategory')}</Link></li>
              <li><Link href="/vin-lookup" className="hover:text-white">{t('vinLookup')}</Link></li>
              <li><Link href="/rfq" className="hover:text-white">{t('getQuote')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">{t('customerService')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white">{t('contactUs')}</Link></li>
              <li><Link href="/shipping" className="hover:text-white">{t('shippingInfo')}</Link></li>
              <li><Link href="/returns" className="hover:text-white">{t('returns')}</Link></li>
              <li><Link href="/faq" className="hover:text-white">{t('faq')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('contactUs')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 info@autoparts.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>
                📍 {dir === 'rtl' ? '123 شارع قطع الغيار' : '123 Auto Parts Ave'}<br/>
                {dir === 'rtl' ? 'لوس انجلوس' : 'Los Angeles, CA 90001'}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2024 AutoParts Store. {t('allRightsReserved')}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-white">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

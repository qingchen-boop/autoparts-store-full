// Header Component with i18n
'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLanguage()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-gray-900">汽配商城</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <form className="flex" action="/products">
              <input
                type="text"
                placeholder={t('search')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:border-primary-500"
                name="search"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
              >
                {t('searchBtn')}
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/vin-lookup" className="text-gray-600 hover:text-primary-600">
              {t('vinLookup')}
            </Link>
            <Link href="/rfq" className="text-gray-600 hover:text-primary-600">
              {t('getQuote')}
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-primary-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-primary-600">
              {t('signIn')}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t py-3 flex gap-8 text-sm">
          <Link href="/products" className="hover:text-primary-600">{t('allProducts')}</Link>
          <Link href="/categories/brake-systems" className="hover:text-primary-600">{t('brakes')}</Link>
          <Link href="/categories/engine-parts" className="hover:text-primary-600">{t('engine')}</Link>
          <Link href="/categories/suspension" className="hover:text-primary-600">{t('suspension')}</Link>
          <Link href="/categories/electrical" className="hover:text-primary-600">{t('electrical')}</Link>
          <Link href="/categories/transmission" className="hover:text-primary-600">{t('transmission')}</Link>
          <Link href="/rfq" className="hover:text-primary-600 text-primary-600 font-medium">{t('bulkQuote')}</Link>
        </nav>
      </div>
    </header>
  )
}

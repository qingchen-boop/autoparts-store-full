'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useEffect } from 'react'

export default function Home() {
  const { t, dir, language } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50"></div>
  }

  const categories = [
    { name: t('brakes'), slug: 'brake-systems', icon: '🛑' },
    { name: t('engine'), slug: 'engine-parts', icon: '⚙️' },
    { name: t('suspension'), slug: 'suspension', icon: '🔧' },
    { name: t('electrical'), slug: 'electrical', icon: '🔌' },
    { name: t('transmission'), slug: 'transmission', icon: '⚡' },
    { name: t('allProducts'), slug: 'products', icon: '🔧' },
  ]

  return (
    <div dir={dir}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('heroTitle')}</h1>
            <p className="text-xl mb-8 text-gray-200">{t('heroDesc')}</p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/products" className="btn-primary">
                {t('shopNow')}
              </Link>
              <Link href="/vin-lookup" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900">
                {t('startVinLookup')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">{t('browseByCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="font-medium text-gray-900">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">{t('featuredProducts')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-6xl">🚗</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">
                    {language === 'zh' ? `优质刹车片 ${i}` : language === 'ar' ? `صفائح فرامل عالية الجودة ${i}` : `Premium Brake Pad Set ${i}`}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {language === 'zh' ? 'OEM品质，原装配件' : language === 'ar' ? 'جودة OEM قطع غيار أصلية' : 'OEM Quality, Genuine Parts'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">${49 + i * 10}</span>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                      {t('addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn-secondary">
              {t('viewAllProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold mb-2">{t('globalShipping')}</h3>
              <p className="text-sm text-gray-600">{t('globalShippingDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold mb-2">{t('qualityGuaranteed')}</h3>
              <p className="text-sm text-gray-600">{t('qualityGuaranteedDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2">{t('expertSupport')}</h3>
              <p className="text-sm text-gray-600">{t('expertSupportDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold mb-2">{t('easyReturns')}</h3>
              <p className="text-sm text-gray-600">{t('easyReturnsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t('findRightParts')}</h2>
            <p className="text-xl mb-8 text-primary-100">{t('enterVinFind')}</p>
            <Link href="/vin-lookup" className="btn bg-white text-primary-600 hover:bg-gray-100">
              {t('startVinLookup')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

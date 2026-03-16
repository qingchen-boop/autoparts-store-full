// Language Switcher Component
'use client'

import { useLanguage } from '@/context/LanguageContext'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
]

export default function LanguageSwitcher() {
  const { language, changeLanguage, t } = useLanguage()

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
        style={{ direction: 'ltr' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

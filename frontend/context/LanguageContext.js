// Language Context for i18n
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    // Header
    search: 'Search parts by name, SKU, or brand...',
    searchBtn: 'Search',
    vinLookup: 'VIN Lookup',
    getQuote: 'Get Quote',
    cart: 'Cart',
    signIn: 'Sign In',
    
    // Nav
    allProducts: 'All Products',
    brakes: 'Brakes',
    engine: 'Engine',
    suspension: 'Suspension',
    electrical: 'Electrical',
    transmission: 'Transmission',
    bulkQuote: 'Bulk Quote',
    
    // Hero
    heroTitle: 'Premium Auto Parts for Your Vehicle',
    heroDesc: 'Quality brake pads, filters, engine parts and more. Global shipping available. Expert support.',
    shopNow: 'Shop Now',
    startVinLookup: 'Start VIN Lookup',
    
    // Categories
    browseByCategory: 'Browse by Category',
    
    // Features
    globalShipping: 'Global Shipping',
    globalShippingDesc: 'Fast delivery worldwide',
    qualityGuaranteed: 'Quality Guaranteed',
    qualityGuaranteedDesc: 'OEM quality parts',
    expertSupport: 'Expert Support',
    expertSupportDesc: '24/7 customer service',
    easyReturns: 'Easy Returns',
    easyReturnsDesc: '30-day return policy',
    
    // CTA
    findRightParts: 'Find the Right Parts for Your Vehicle',
    enterVinFind: 'Enter your VIN to find compatible parts instantly',
    
    // Footer
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    contactUs: 'Contact Us',
    shippingInfo: 'Shipping Info',
    returns: 'Returns',
    faq: 'FAQ',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    allRightsReserved: 'All rights reserved.',
    
    // Products
    featuredProducts: 'Featured Products',
    viewAllProducts: 'View All Products',
    addToCart: 'Add to Cart',
    requestQuote: 'Request Quote',
    
    // Languages
    selectLanguage: 'Select Language',
  },
  zh: {
    // Header
    search: '按名称、SKU或品牌搜索配件...',
    searchBtn: '搜索',
    vinLookup: 'VIN查询',
    getQuote: '获取报价',
    cart: '购物车',
    signIn: '登录',
    
    // Nav
    allProducts: '所有产品',
    brakes: '刹车系统',
    engine: '发动机',
    suspension: '悬挂系统',
    electrical: '电气系统',
    transmission: '变速箱',
    bulkQuote: '批量报价',
    
    // Hero
    heroTitle: '优质汽车配件',
    heroDesc: '优质刹车片、滤芯、发动机零件等。全球配送，专业支持。',
    shopNow: '立即购物',
    startVinLookup: '开始VIN查询',
    
    // Categories
    browseByCategory: '按分类浏览',
    
    // Features
    globalShipping: '全球配送',
    globalShippingDesc: '快速送达全球',
    qualityGuaranteed: '品质保证',
    qualityGuaranteedDesc: '原厂品质配件',
    expertSupport: '专家支持',
    expertSupportDesc: '24/7客户服务',
    easyReturns: '轻松退换',
    easyReturnsDesc: '30天退换政策',
    
    // CTA
    findRightParts: '为您的车辆找到合适的配件',
    enterVinFind: '输入VIN码立即查找兼容配件',
    
    // Footer
    quickLinks: '快速链接',
    customerService: '客户服务',
    contactUs: '联系我们',
    shippingInfo: '配送信息',
    returns: '退换货',
    faq: '常见问题',
    privacy: '隐私政策',
    terms: '服务条款',
    allRightsReserved: '版权所有。',
    
    // Products
    featuredProducts: '精选产品',
    viewAllProducts: '查看全部产品',
    addToCart: '加入购物车',
    requestQuote: '请求报价',
    
    // Languages
    selectLanguage: '选择语言',
  },
  ar: {
    // Header
    search: 'البحث عن قطع الغيار بالاسم أو SKU أو العلامة التجارية...',
    searchBtn: 'بحث',
    vinLookup: 'استعلام VIN',
    getQuote: 'احصل على عرض سعر',
    cart: 'السلة',
    signIn: 'تسجيل الدخول',
    
    // Nav
    allProducts: 'جميع المنتجات',
    brakes: 'الفرامل',
    engine: 'المحرك',
    suspension: 'التعليق',
    electrical: 'النظام الكهربائي',
    transmission: 'ناقل الحركة',
    bulkQuote: 'عرض سعر بالجملة',
    
    // Hero
    heroTitle: 'قطع غيار سيارات عالية الجودة',
    heroDesc: 'صفائح الفرامل والمرشحات وأجزاء المحرك والمزيد. الشحن العالمي متاح. دعم الخبراء.',
    shopNow: 'تسوق الآن',
    startVinLookup: 'بدء استعلام VIN',
    
    // Categories
    browseByCategory: 'تصفح حسب الفئة',
    
    // Features
    globalShipping: 'الشحن العالمي',
    globalShippingDesc: 'توصيل سريع لجميع أنحاء العالم',
    qualityGuaranteed: 'جودة مضمونة',
    qualityGuaranteedDesc: 'قطع غيار أصلية',
    expertSupport: 'دعم الخبراء',
    expertSupportDesc: 'خدمة عملاء على مدار الساعة',
    easyReturns: 'إرجاع سهل',
    easyReturnsDesc: 'سياسة إرجاع 30 يوم',
    
    // CTA
    findRightParts: 'اعثر على القطع المناسبة لسيارتك',
    enterVinFind: 'أدخل رقم VIN للعثور على القطع المتوافقة فوراً',
    
    // Footer
    quickLinks: 'روابط سريعة',
    customerService: 'خدمة العملاء',
    contactUs: 'اتصل بنا',
    shippingInfo: 'معلومات الشحن',
    returns: 'الإرجاع',
    faq: 'الأسئلة الشائعة',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    allRightsReserved: 'جميع الحقوق محفوظة.',
    
    // Products
    featuredProducts: 'منتجات مميزة',
    viewAllProducts: 'عرض جميع المنتجات',
    addToCart: 'أضف إلى السلة',
    requestQuote: 'اطلب عرض سعر',
    
    // Languages
    selectLanguage: 'اختر اللغة',
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh')
  const [dir, setDir] = useState('ltr')

  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved) {
      setLanguage(saved)
      setDir(saved === 'ar' ? 'rtl' : 'ltr')
    }
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    setDir(lang === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('language', lang)
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)

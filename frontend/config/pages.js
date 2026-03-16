// 页面结构设计
// ============================================

export const pageStructure = {
  // 首页
  '/': {
    title: 'Home',
    components: [
      'HeroSection',      // 主Banner
      'CategoryGrid',    // 分类网格
      'FeaturedProducts', // 推荐产品
      'FitmentSearch',   // 车型搜索
      'OEMSearch',       // OEM搜索
      'Benefits',        // 优势展示
      'Certificates',    // 证书展示
      'BlogPreview',     // 博客预览
      'ContactCTA'       // 联系CTA
    ],
    seo: {
      title: 'AutoParts B2B - Quality Automotive Parts Supplier',
      description: 'Professional auto parts wholesaler. Brake pads, filters, spark plugs, and more. OEM numbers supported. Global shipping.',
      keywords: 'auto parts, brake pads, oil filters, spark plugs, automotive parts wholesale'
    }
  },

  // 产品分类页
  '/products': {
    title: 'Products',
    components: [
      'CategorySidebar',
      'ProductGrid',
      'FilterSidebar',
      'Pagination'
    ],
    seo: {
      title: '{Category} - AutoParts B2B',
      description: 'Wholesale {category}. OEM numbers available. Competitive prices for B2B customers.'
    }
  },

  // 分类页 (Slug)
  '/{category-slug}': {
    title: 'Category',
    components: [
      'CategoryBanner',
      'SubCategoryNav',
      'ProductGrid',
      'FilterPanel'
    ],
    seo: {
      title: '{Category Name} - Wholesale Auto Parts',
      description: 'Browse our selection of {category}. Premium quality, OEM compatible, bulk pricing available.'
    }
  },

  // 产品详情页 (SEO优化)
  '/product/{product-slug}': {
    title: 'Product Detail',
    components: [
      'ProductGallery',
      'ProductInfo',
      'PriceDisplay',
      'StockStatus',
      'AddToCart',
      'RFQButton',
      'ProductTabs', // Description, Specifications, OEM, Fitment
      'RelatedProducts'
    ],
    seo: {
      title: '{Product Name} - {Brand} | AutoParts B2B',
      description: '{Short description}. OEM: {OEM numbers}. Compatible with {vehicles}. Bulk pricing available.',
      structuredData: 'Product'
    }
  },

  // OEM搜索
  '/oem-search': {
    title: 'OEM Number Search',
    components: [
      'OEMSearchForm',
      'OEMResults',
      'ProductCards'
    ],
    seo: {
      title: 'Search by OEM Number - Find Compatible Parts',
      description: 'Enter OEM number to find compatible auto parts. Supports Bosch, Denso, Valeo, and more.',
      keywords: 'OEM number search, part number, cross reference, compatible parts'
    }
  },

  // 车型适配
  '/fitment': {
    title: 'Vehicle Fitment',
    components: [
      'VehicleSelector', // Brand > Model > Year > Engine
      'FitmentResults',
      'CompatibleProducts'
    ],
    seo: {
      title: 'Find Parts for Your Vehicle',
      description: 'Select your vehicle to find compatible auto parts. Guaranteed fit or your money back.'
    }
  },

  // 博客
  '/blog': {
    title: 'Blog',
    components: [
      'BlogHeader',
      'FeaturedPost',
      'PostGrid',
      'CategoryFilter',
      'Newsletter'
    ],
    seo: {
      title: 'Auto Parts Blog - Technical Articles & Guides',
      description: 'Technical articles, product guides, and industry insights for automotive professionals.'
    }
  },

  '/blog/{post-slug}': {
    title: 'Blog Post',
    components: [
      'PostHeader',
      'PostContent',
      'ShareButtons',
      'RelatedPosts',
      'Comments'
    ],
    seo: {
      title: '{Post Title} - AutoParts Blog',
      description: '{Excerpt}'
    }
  },

  // 关于
  '/about': {
    title: 'About Us',
    components: [
      'CompanyIntro',
      'History',
      'Certifications',
      'Factory',
      'Team'
    ],
    seo: {
      title: 'About Us - AutoParts B2B Supplier',
      description: 'Learn about our company, history, and commitment to quality automotive parts.'
    }
  },

  // 证书
  '/certificates': {
    title: 'Certificates',
    components: [
      'CertificateGrid',
      'CertificateViewer'
    ],
    seo: {
      title: 'Quality Certificates - ISO, CE, ROHS',
      description: 'Our products meet international quality standards. View our certifications.'
    }
  },

  // 询盘
  '/rfq': {
    title: 'Request for Quote',
    components: [
      'RFQForm',
      'ProductSelector',
      'CompanyInfo',
      'FileUpload'
    ],
    seo: {
      title: 'Request a Quote - Bulk Orders',
      description: 'Get a quote for bulk orders. Competitive B2B pricing, global shipping available.'
    }
  },

  // 联系
  '/contact': {
    title: 'Contact Us',
    components: [
      'ContactForm',
      'CompanyInfo',
      'Map',
      'FAQ'
    ],
    seo: {
      title: 'Contact Us - AutoParts B2B',
      description: 'Contact us for product inquiries, bulk orders, and partnerships.'
    }
  }
}

// SEO URL 结构
export const seoUrls = {
  categories: [
    '/brake-pads',
    '/brake-rotors',
    '/oil-filters',
    '/air-filters',
    '/spark-plugs',
    '/brake-system',
    '/filters'
  ],
  products: [
    '/product/toyota-camry-brake-pads',
    '/product/bmw-brake-rotors',
    '/product/premium-oil-filter'
  ],
  pages: [
    '/about',
    '/contact',
    '/certificates',
    '/rfq',
    '/blog',
    '/oem-search',
    '/fitment'
  ]
}

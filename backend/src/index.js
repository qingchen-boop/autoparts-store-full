const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// 路由
const productRoutes = require('./routes/productController')
const categoryRoutes = require('./routes/categoryController')
const authRoutes = require('./routes/authController')
const cartRoutes = require('./routes/cartController')
const orderRoutes = require('./routes/orderController')
const rfqRoutes = require('./routes/rfqController')
const vehicleRoutes = require('./routes/vehicleController')
const userRoutes = require('./routes/userController')
const fitmentRoutes = require('./routes/fitment')
const importRoutes = require('./routes/import')

const app = express()
const PORT = process.env.PORT || 3000

// ============================================
// 安全中间件
// ============================================

// Helmet - 安全 headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
})
app.use('/api/', limiter)

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ============================================
// API 路由
// ============================================

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 产品
app.use('/api/v1/products', productRoutes)

// 分类
app.use('/api/v1/categories', categoryRoutes)

// 认证
app.use('/api/v1/auth', authRoutes)

// 购物车
app.use('/api/v1/cart', cartRoutes)

// 订单
app.use('/api/v1/orders', orderRoutes)

// 询价
app.use('/api/v1/rfq', rfqRoutes)

// 车辆
app.use('/api/v1/vehicles', vehicleRoutes)

// 用户
app.use('/api/v1/users', userRoutes)

// 适配 & 搜索 (新增)
app.use('/api/v1/fitment', fitmentRoutes)

// 批量导入 (新增)
app.use('/api/v1/import', importRoutes)

// ============================================
// SEO: 静态页面路由
// ============================================

// 产品详情页 SEO
app.get('/api/v1/seo/product/:slug', async (req, res) => {
  const { Pool } = require('pg')
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'autoparts',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  })

  try {
    const result = await pool.query(`
      SELECT 
        p.name, p.name_zh, p.name_ar, p.slug,
        p.meta_title, p.meta_description, p.meta_keywords,
        p.price, p.description, p.brand,
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [req.params.slug])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = result.rows[0]
    
    // 构建 SEO 数据
    const seo = {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description?.substring(0, 160),
      keywords: product.meta_keywords || product.brand,
      canonical: `${process.env.SITE_URL}/products/${product.slug}`,
      og: {
        title: product.name,
        description: product.meta_description,
        image: product.image,
        url: `${process.env.SITE_URL}/products/${product.slug}`,
        type: 'product',
        price: product.price,
        currency: 'USD'
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.meta_description,
        brand: product.brand,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }
    }

    res.json(seo)
  } catch (error) {
    console.error('SEO error:', error)
    res.status(500).json({ error: 'Server error' })
  } finally {
    pool.end()
  }
})

// ============================================
// 错误处理
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  
  // Rate limit 错误
  if (err.message === 'Too many requests') {
    return res.status(429).json({ error: err.message })
  }

  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
  })
})

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 AutoParts API Server running on port ${PORT}`)
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`)
})

module.exports = app

const express = require('express')
const router = express.Router()

// 导入服务
const fitmentService = require('../../services/fitment-service')
const searchService = require('../../services/search-service')

// ============================================
// 搜索 API
// ============================================

// 搜索产品
router.get('/search', async (req, res) => {
  try {
    const { 
      q,           // 搜索关键词
      category,    // 分类 slug
      brand,       // 品牌
      price_min,   // 最低价
      price_max,   // 最高价
      in_stock,    // 有库存
      page = 1,
      limit = 20
    } = req.query

    const results = await searchService.searchProducts({
      query: q,
      category,
      brand,
      priceMin: price_min,
      priceMax: price_max,
      inStock: in_stock === 'true',
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100)
    })

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ success: false, error: 'Search failed' })
  }
})

// 搜索建议 (自动补全)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] })
    }

    const suggestions = await searchService.getSearchSuggestions(q)
    res.json({ success: true, data: suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    res.status(500).json({ success: false, error: 'Failed to get suggestions' })
  }
})

// 通过 Slug 获取产品 (SEO)
router.get('/products/slug/:slug', async (req, res) => {
  try {
    const product = await searchService.getProductBySlug(req.params.slug)
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    console.error('Product by slug error:', error)
    res.status(500).json({ success: false, error: 'Failed to get product' })
  }
})

// ============================================
// 车型适配 API
// ============================================

// VIN 解码
router.post('/fitment/decode-vin', async (req, res) => {
  try {
    const { vin } = req.body
    
    if (!vin) {
      return res.status(400).json({ success: false, error: 'VIN is required' })
    }

    const vehicleInfo = await fitmentService.decodeVIN(vin)
    res.json({ success: true, data: vehicleInfo })
  } catch (error) {
    console.error('VIN decode error:', error)
    res.status(400).json({ success: false, error: error.message })
  }
})

// 通过车型获取适配产品
router.get('/fitment/vehicles/:brand/:model/:year/products', async (req, res) => {
  try {
    const { brand, model, year } = req.params
    const { engine } = req.query

    const products = await fitmentService.getProductsByVehicle(brand, model, parseInt(year), engine)
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Fitment products error:', error)
    res.status(500).json({ success: false, error: 'Failed to get fitment products' })
  }
})

// 获取所有品牌
router.get('/fitment/brands', async (req, res) => {
  try {
    const brands = await fitmentService.getAllBrands()
    res.json({ success: true, data: brands })
  } catch (error) {
    console.error('Brands error:', error)
    res.status(500).json({ success: false, error: 'Failed to get brands' })
  }
})

// 获取品牌的车型
router.get('/fitment/brands/:brandSlug/models', async (req, res) => {
  try {
    const models = await fitmentService.getModelsByBrand(req.params.brandSlug)
    res.json({ success: true, data: models })
  } catch (error) {
    console.error('Models error:', error)
    res.status(500).json({ success: false, error: 'Failed to get models' })
  }
})

// 获取车型的年份
router.get('/fitment/models/:modelSlug/years', async (req, res) => {
  try {
    const years = await fitmentService.getYearsByModel(req.params.modelSlug)
    res.json({ success: true, data: years })
  } catch (error) {
    console.error('Years error:', error)
    res.status(500).json({ success: false, error: 'Failed to get years' })
  }
})

// ============================================
// 分类 API (多级)
// ============================================

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'autoparts',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    })

    // 构建分类树
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.name_zh,
        c.name_ar,
        c.slug,
        c.parent_id,
        c.image,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = true) as product_count
      FROM categories c
      WHERE c.is_active = true
      ORDER BY c.sort_order, c.name
    `)

    // 转换为树结构
    const categories = result.rows
    const tree = []
    const map = {}

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] }
    })

    categories.forEach(cat => {
      if (cat.parent_id) {
        map[cat.parent_id]?.children.push(map[cat.id])
      } else {
        tree.push(map[cat.id])
      }
    })

    res.json({ success: true, data: tree })
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ success: false, error: 'Failed to get categories' })
  }
})

// 获取分类及其子分类的产品
router.get('/categories/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params
    const { page = 1, limit = 20, sort = 'featured' } = req.query

    const { Pool } = require('pg')
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'autoparts',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    })

    // 获取分类及其子分类 ID
    const catResult = await pool.query(`
      WITH RECURSIVE category_tree AS (
        SELECT id FROM categories WHERE slug = $1
        UNION ALL
        SELECT c.id FROM categories c
        JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT id FROM category_tree
    `, [slug])

    const categoryIds = catResult.rows.map(r => r.id)

    if (categoryIds.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    // 排序
    let orderBy = 'p.is_featured DESC, p.created_at DESC'
    if (sort === 'price_asc') orderBy = 'p.price ASC'
    if (sort === 'price_desc') orderBy = 'p.price DESC'
    if (sort === 'name') orderBy = 'p.name ASC'

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const result = await pool.query(`
      SELECT 
        p.id, p.sku, p.name, p.name_zh, p.name_ar, p.slug,
        p.price, p.msrp, p.stock_quantity, p.brand,
        c.name as category_name, c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ANY($1) AND p.is_active = true
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `, [categoryIds, parseInt(limit), offset])

    res.json({ 
      success: true, 
      data: {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          category_count: categoryIds.length
        }
      }
    })
  } catch (error) {
    console.error('Category products error:', error)
    res.status(500).json({ success: false, error: 'Failed to get products' })
  }
})

module.exports = router

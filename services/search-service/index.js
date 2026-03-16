// Search Service - 搜索服务
// 支持：SKU、OEM、产品名、车型适配搜索
// 可扩展至 Meilisearch/Elasticsearch

const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'autoparts',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
})

/**
 * 高级搜索
 */
async function searchProducts({
  query,
  category,
  brand,
  priceMin,
  priceMax,
  inStock,
  page = 1,
  limit = 20
}) {
  const conditions = ['p.is_active = true']
  const params = []
  let paramIndex = 1

  // 文本搜索 (SKU, OEM, 产品名)
  if (query) {
    conditions.push(`
      (p.sku ILIKE $${paramIndex} 
       OR p.name ILIKE $${paramIndex} 
       OR EXISTS (
         SELECT 1 FROM product_oem_map pom
         JOIN oem_numbers o ON pom.oem_id = o.id
         WHERE pom.product_id = p.id AND o.oem_number ILIKE $${paramIndex}
       ))
    `)
    params.push(`%${query}%`)
    paramIndex++
  }

  // 分类筛选
  if (category) {
    conditions.push(`c.slug = $${paramIndex}`)
    params.push(category)
    paramIndex++
  }

  // 品牌筛选
  if (brand) {
    conditions.push(`p.brand ILIKE $${paramIndex}`)
    params.push(`%${brand}%`)
    paramIndex++
  }

  // 价格范围
  if (priceMin) {
    conditions.push(`p.price >= $${paramIndex}`)
    params.push(priceMin)
    paramIndex++
  }

  if (priceMax) {
    conditions.push(`p.price <= $${paramIndex}`)
    params.push(priceMax)
    paramIndex++
  }

  // 库存筛选
  if (inStock) {
    conditions.push('p.stock_quantity > 0')
  }

  const offset = (page - 1) * limit

  // 主查询
  const whereClause = conditions.join(' AND ')
  
  const sql = `
    SELECT 
      p.id,
      p.sku,
      p.name,
      p.name_zh,
      p.name_ar,
      p.slug,
      p.price,
      p.msrp,
      p.stock_quantity,
      p.brand,
      p.short_description,
      c.name as category_name,
      c.slug as category_slug,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image,
      array_agg(DISTINCT o.oem_number) FILTER (WHERE o.oem_number IS NOT NULL) as oem_numbers
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_oem_map pom ON p.id = pom.product_id
    LEFT JOIN oem_numbers o ON pom.oem_id = o.id
    WHERE ${whereClause}
    GROUP BY p.id, c.name, c.slug
    ORDER BY p.is_featured DESC, p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  
  params.push(limit, offset)

  // Count 查询
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_oem_map pom ON p.id = pom.product_id
    LEFT JOIN oem_numbers o ON pom.oem_id = o.id
    WHERE ${whereClause}
  `

  const [results, countResult] = await Promise.all([
    pool.query(sql, params),
    pool.query(countSql, params.slice(0, -2))
  ])

  return {
    products: results.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].total),
      pages: Math.ceil(countResult.rows[0].total / limit)
    }
  }
}

/**
 * 搜索建议 (自动补全)
 */
async function getSearchSuggestions(query) {
  const sql = `
    SELECT 
      p.id,
      p.sku as value,
      p.name as label,
      'product' as type
    FROM products p
    WHERE p.is_active = true 
      AND (p.sku ILIKE $1 OR p.name ILIKE $1)
    LIMIT 5
    
    UNION ALL
    
    SELECT 
      o.id,
      o.oem_number as value,
      o.oem_number as label,
      'oem' as type
    FROM oem_numbers o
    WHERE o.oem_number ILIKE $1
    LIMIT 3
    
    UNION ALL
    
    SELECT 
      c.id,
      c.name as value,
      c.name as label,
      'category' as type
    FROM categories c
    WHERE c.is_active = true AND c.name ILIKE $1
    LIMIT 3
  `
  
  const result = await pool.query(sql, [`%${query}%`])
  return result.rows
}

/**
 * 热门搜索
 */
async function getPopularSearches(limit = 10) {
  // 简化版：返回热门分类的产品
  const sql = `
    SELECT 
      p.name,
      p.slug,
      COUNT(pvf.id) as fitment_count
    FROM products p
    LEFT JOIN product_vehicle_fitment pvf ON p.id = pvf.product_id
    WHERE p.is_active = true
    GROUP BY p.id
    ORDER BY fitment_count DESC, p.stock_quantity DESC
    LIMIT $1
  `
  
  const result = await pool.query(sql, [limit])
  return result.rows
}

/**
 * SEO 友好搜索 (通过 slug)
 */
async function getProductBySlug(slug) {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      c.name_zh as category_name_zh,
      c.name_ar as category_name_ar,
      json_agg(
        DISTINCT jsonb_build_object(
          'id', pi.id,
          'url', pi.url,
          'alt', pi.alt_text,
          'is_primary', pi.is_primary
        )
      ) FILTER (WHERE pi.id IS NOT NULL) as images,
      json_agg(
        DISTINCT o.oem_number
      ) FILTER (WHERE o.oem_number IS NOT NULL) as oem_numbers,
      json_agg(
        DISTINCT jsonb_build_object(
          'brand', vb.name,
          'model', vm.name,
          'year', vy.year,
          'engine', ve.engine_type
        )
      ) FILTER (WHERE vb.name IS NOT NULL) as fitments
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_oem_map pom ON p.id = pom.product_id
    LEFT JOIN oem_numbers o ON pom.oem_id = o.id
    LEFT JOIN product_vehicle_fitment pvf ON p.id = pvf.product_id
    LEFT JOIN vehicles v ON pvf.vehicle_id = v.id
    LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
    LEFT JOIN vehicle_models vm ON v.model_id = vm.id
    LEFT JOIN vehicle_years vy ON v.year_id = vy.id
    LEFT JOIN vehicle_engines ve ON v.engine_id = ve.id
    WHERE p.slug = $1 AND p.is_active = true
    GROUP BY p.id, c.name, c.slug, c.name_zh, c.name_ar
  `
  
  const result = await pool.query(sql, [slug])
  return result.rows[0] || null
}

module.exports = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  getProductBySlug,
  pool
}

// Bulk Import Routes - 批量导入
const express = require('express')
const router = express.Router()
const multer = require('multer')
const { Pool } = require('pg')
const path = require('path')
const fs = require('fs')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'autoparts',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
})

// Multer 配置 (CSV 上传)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = '/tmp/uploads'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files allowed'))
    }
  }
})

// 解析 CSV 行
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// ============================================
// 产品批量导入
// ============================================

router.post('/import/products', upload.single('file'), async (req, res) => {
  const client = await pool.connect()
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return res.status(400).json({ success: false, error: 'CSV file is empty' })
    }

    // 解析表头
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
    
    // 验证必需字段
    const requiredFields = ['sku', 'name']
    const missingFields = requiredFields.filter(f => !headers.includes(f))
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      })
    }

    // 开始事务
    await client.query('BEGIN')
    
    let inserted = 0
    let skipped = 0
    const errors = []

    // 逐行处理
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        const row = {}
        headers.forEach((header, idx) => {
          row[header] = values[idx] || ''
        })

        // 生成 slug
        const slug = row.slug || row.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        // 查找或创建分类
        let categoryId = null
        if (row.category) {
          const catResult = await client.query(
            'SELECT id FROM categories WHERE name ILIKE $1 OR slug = $1 LIMIT 1',
            [row.category]
          )
          categoryId = catResult.rows[0]?.id
        }

        // 插入/更新产品
        const productResult = await client.query(`
          INSERT INTO products (sku, name, name_zh, name_ar, slug, category_id, brand, price, cost, msrp, stock_quantity, description, meta_title, meta_description, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
          ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name,
            name_zh = EXCLUDED.name_zh,
            name_ar = EXCLUDED.name_ar,
            slug = EXCLUDED.slug,
            category_id = COALESCE(EXCLUDED.category_id, products.category_id),
            brand = COALESCE(EXCLUDED.brand, products.brand),
            price = COALESCE(EXCLUDED.price, products.price),
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [
          row.sku,
          row.name,
          row.name_zh || row.name,
          row.name_ar || row.name,
          slug,
          categoryId,
          row.brand,
          parseFloat(row.price) || 0,
          parseFloat(row.cost) || 0,
          parseFloat(row.msrp) || 0,
          parseInt(row.stock_quantity) || 0,
          row.description || '',
          row.meta_title || row.name,
          row.meta_description || row.description
        ])

        inserted++
      } catch (rowError) {
        skipped++
        errors.push({ row: i, error: rowError.message })
      }
    }

    await client.query('COMMIT')

    // 清理上传文件
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      data: {
        inserted,
        skipped,
        errors: errors.slice(0, 10)  // 最多返回10个错误
      }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Import error:', error)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    client.release()
  }
})

// ============================================
// OEM 批量导入
// ============================================

router.post('/import/oem', upload.single('file'), async (req, res) => {
  const client = await pool.connect()
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    await client.query('BEGIN')
    
    let inserted = 0

    for (let i = 1; i < lines.length; i++) {
      const [oemNumber, brand, productSku] = parseCSVLine(lines[i])
      
      if (!oemNumber) continue

      // 插入 OEM
      const oemResult = await client.query(`
        INSERT INTO oem_numbers (oem_number, brand)
        VALUES ($1, $2)
        ON CONFLICT (oem_number) DO NOTHING
        RETURNING id
      `, [oemNumber, brand])

      // 如果有产品 SKU，建立映射
      if (productSku && oemResult.rows[0]) {
        const productResult = await client.query('SELECT id FROM products WHERE sku = $1', [productSku])
        
        if (productResult.rows[0]) {
          await client.query(`
            INSERT INTO product_oem_map (product_id, oem_id, is_primary)
            VALUES ($1, $2, true)
            ON CONFLICT DO NOTHING
          `, [productResult.rows[0].id, oemResult.rows[0].id])
        }
      }

      inserted++
    }

    await client.query('COMMIT')
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      data: { inserted }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ success: false, error: error.message })
  } finally {
    client.release()
  }
})

// ============================================
// 车型适配批量导入
// ============================================

router.post('/import/fitment', upload.single('file'), async (req, res) => {
  const client = await pool.connect()
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    await client.query('BEGIN')
    
    let inserted = 0

    for (let i = 1; i < lines.length; i++) {
      const [productSku, brandName, modelName, year, engineType] = parseCSVLine(lines[i])
      
      if (!productSku || !brandName || !modelName || !year) continue

      // 查找/创建品牌
      let brandResult = await client.query(
        'SELECT id FROM vehicle_brands WHERE name ILIKE $1',
        [brandName]
      )
      
      let brandId
      if (brandResult.rows[0]) {
        brandId = brandResult.rows[0].id
      } else {
        const newBrand = await client.query(`
          INSERT INTO vehicle_brands (name, slug)
          VALUES ($1, LOWER(REPLACE($1, ' ', '-')))
          RETURNING id
        `, [brandName])
        brandId = newBrand.rows[0].id
      }

      // 查找/创建车型
      let modelResult = await client.query(
        'SELECT id FROM vehicle_models WHERE brand_id = $1 AND name ILIKE $2',
        [brandId, modelName]
      )
      
      let modelId
      if (modelResult.rows[0]) {
        modelId = modelResult.rows[0].id
      } else {
        const newModel = await client.query(`
          INSERT INTO vehicle_models (brand_id, name, slug)
          VALUES ($1, $2, LOWER(REPLACE($2, ' ', '-')))
          RETURNING id
        `, [brandId, modelName])
        modelId = newModel.rows[0].id
      }

      // 查找/创建年份
      let yearResult = await client.query(
        'SELECT id FROM vehicle_years WHERE model_id = $1 AND year = $2',
        [modelId, parseInt(year)]
      )
      
      let yearId
      if (yearResult.rows[0]) {
        yearId = yearResult.rows[0].id
      } else {
        const newYear = await client.query(`
          INSERT INTO vehicle_years (model_id, year)
          VALUES ($1, $2)
          RETURNING id
        `, [modelId, parseInt(year)])
        yearId = newYear.rows[0].id
      }

      // 创建/查找发动机
      let engineId = null
      if (engineType) {
        let engineResult = await client.query(
          'SELECT id FROM vehicle_engines WHERE year_id = $1 AND engine_type ILIKE $2',
          [yearId, engineType]
        )
        
        if (engineResult.rows[0]) {
          engineId = engineResult.rows[0].id
        } else {
          const newEngine = await client.query(`
            INSERT INTO vehicle_engines (year_id, engine_type)
            VALUES ($1, $2)
            RETURNING id
          `, [yearId, engineType])
          engineId = newEngine.rows[0].id
        }
      }

      // 创建车辆
      let vehicleResult = await client.query(`
        INSERT INTO vehicles (brand_id, model_id, year_id, engine_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (brand_id, model_id, year_id, engine_id) DO NOTHING
        RETURNING id
      `, [brandId, modelId, yearId, engineId])

      if (!vehicleResult.rows[0]) {
        vehicleResult = await client.query(
          'SELECT id FROM vehicles WHERE brand_id = $1 AND model_id = $2 AND year_id = $3 AND engine_id IS NOT DISTINCT FROM $4',
          [brandId, modelId, yearId, engineId]
        )
      }

      if (vehicleResult.rows[0]) {
        const vehicleId = vehicleResult.rows[0].id

        // 查找产品
        const productResult = await client.query('SELECT id FROM products WHERE sku = $1', [productSku])
        
        if (productResult.rows[0]) {
          // 建立适配关系
          await client.query(`
            INSERT INTO product_vehicle_fitment (product_id, vehicle_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [productResult.rows[0].id, vehicleId])
          
          inserted++
        }
      }
    }

    await client.query('COMMIT')
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      data: { inserted }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Fitment import error:', error)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    client.release()
  }
})

module.exports = router

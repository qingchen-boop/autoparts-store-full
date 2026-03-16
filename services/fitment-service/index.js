// Fitment Service - 车型适配服务
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'autoparts',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
})

/**
 * 通过 VIN 获取车辆信息
 * VIN 解析 (NHTSA 标准)
 */
async function decodeVIN(vin) {
  const cleanVIN = vin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  
  if (cleanVIN.length !== 17) {
    throw new Error('Invalid VIN format')
  }

  // 简化的 VIN 解析 (实际应调用 NHTSA API)
  const wmi = cleanVIN.substring(0, 3)  // World Manufacturer Identifier
  
  // 品牌映射 (简化版)
  const brandMap = {
    'JTD': 'Toyota',
    'JHM': 'Honda',
    'WBA': 'BMW',
    'WDB': 'Mercedes-Benz',
    '1FA': 'Ford',
    '1GC': 'Chevrolet'
  }
  
  const brand = brandMap[wmi.substring(0, 3)] || 'Unknown'
  
  // 车型年份 (第10位)
  const yearCodes = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025
  }
  const yearCode = cleanVIN[9]
  const year = yearCodes[yearCode] || 2020

  return {
    vin: cleanVIN,
    brand,
    year,
    model: `${brand} Model ${year}`,
    vinPrefix: cleanVIN.substring(0, 8)
  }
}

/**
 * 通过车型获取适配产品
 */
async function getProductsByVehicle(brand, model, year, engine) {
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.name,
      p.name_zh,
      p.name_ar,
      p.slug,
      p.price,
      p.stock_quantity,
      p.brand as manufacturer_brand,
      p.meta_description,
      c.name as category_name,
      c.slug as category_slug,
      array_agg(DISTINCT o.oem_number) as oem_numbers
    FROM products p
    JOIN product_vehicle_fitment pvf ON p.id = pvf.product_id
    JOIN vehicles v ON pvf.vehicle_id = v.id
    JOIN vehicle_brands vb ON v.brand_id = vb.id
    JOIN vehicle_models vm ON v.model_id = vm.id
    JOIN vehicle_years vy ON v.year_id = vy.id
    LEFT JOIN vehicle_engines ve ON v.engine_id = ve.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_oem_map pom ON p.id = pom.product_id
    LEFT JOIN oem_numbers o ON pom.oem_id = o.id
    WHERE vb.name ILIKE $1
      AND vm.name ILIKE $2
      AND vy.year = $3
      AND p.is_active = true
    GROUP BY p.id, c.name, c.slug
    ORDER BY p.is_featured DESC, p.price ASC
  `
  
  const result = await pool.query(query, [brand, model, year])
  return result.rows
}

/**
 * 通过 SKU/OEM 搜索产品
 */
async function searchBySKUorOEM(searchTerm) {
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.name,
      p.name_zh,
      p.name_ar,
      p.slug,
      p.price,
      p.stock_quantity,
      p.brand as manufacturer_brand,
      array_agg(DISTINCT o.oem_number) as oem_numbers
    FROM products p
    LEFT JOIN product_oem_map pom ON p.id = pom.product_id
    LEFT JOIN oem_numbers o ON pom.oem_id = o.id
    WHERE p.sku ILIKE $1
      OR p.name ILIKE $1
      OR o.oem_number ILIKE $1
      AND p.is_active = true
    GROUP BY p.id
    ORDER BY p.is_featured DESC
    LIMIT 50
  `
  
  const result = await pool.query(query, [`%${searchTerm}%`])
  return result.rows
}

/**
 * 获取所有品牌
 */
async function getAllBrands() {
  const result = await pool.query(`
    SELECT id, name, slug, logo 
    FROM vehicle_brands 
    ORDER BY name
  `)
  return result.rows
}

/**
 * 获取品牌下的车型
 */
async function getModelsByBrand(brandSlug) {
  const result = await pool.query(`
    SELECT vm.id, vm.name, vm.slug
    FROM vehicle_models vm
    JOIN vehicle_brands vb ON vm.brand_id = vb.id
    WHERE vb.slug = $1
    ORDER BY vm.name
  `, [brandSlug])
  return result.rows
}

/**
 * 获取车型的年份
 */
async function getYearsByModel(modelSlug) {
  const result = await pool.query(`
    SELECT DISTINCT vy.year
    FROM vehicle_years vy
    JOIN vehicle_models vm ON vy.model_id = vm.id
    WHERE vm.slug = $1
    ORDER BY vy.year DESC
  `, [modelSlug])
  return result.rows.map(r => r.year)
}

/**
 * 检查产品是否适配某车型
 */
async function checkFitment(productId, vehicleId) {
  const result = await pool.query(`
    SELECT * FROM product_vehicle_fitment
    WHERE product_id = $1 AND vehicle_id = $2
  `, [productId, vehicleId])
  return result.rows.length > 0
}

module.exports = {
  decodeVIN,
  getProductsByVehicle,
  searchBySKUorOEM,
  getAllBrands,
  getModelsByBrand,
  getYearsByModel,
  checkFitment,
  pool
}

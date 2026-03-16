const db = require('../db/db');

// Category Controller
exports.getAll = async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
      FROM categories c
      WHERE c.is_active = TRUE
      ORDER BY c.sort_order, c.name
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = 'SELECT * FROM categories WHERE slug = $1 AND is_active = TRUE';
    const result = await db.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.category_id = $1 AND p.status = 'active'
      ORDER BY p.${sort} ${order.toUpperCase()}
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [id, limit, offset]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const query = 'SELECT * FROM brands WHERE is_active = TRUE ORDER BY name';
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch brands' });
  }
};

exports.getBrandProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = `
      SELECT p.*, b.name as brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE b.slug = $1 AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    const result = await db.query(query, [slug]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch brand products' });
  }
};

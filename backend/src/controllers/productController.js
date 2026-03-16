const db = require('../db/db');

// Get all products with filtering, pagination, sorting
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = 'created_at',
      order = 'DESC',
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE p.status = $1';
    params.push('active');

    // Category filter
    if (category) {
      params.push(category);
      whereClause += ` AND p.category_id = $${params.length}`;
    }

    // Brand filter
    if (brand) {
      params.push(brand);
      whereClause += ` AND p.brand_id = $${params.length}`;
    }

    // Price range
    if (minPrice) {
      params.push(minPrice);
      whereClause += ` AND p.price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      whereClause += ` AND p.price <= $${params.length}`;
    }

    // Stock filter
    if (inStock === 'true') {
      whereClause += ' AND p.stock_quantity > 0';
    }

    // Search
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    // Sorting
    const validSorts = ['created_at', 'price', 'name', 'stock_quantity'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM products p
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const dataQuery = `
      SELECT 
        p.id, p.sku, p.name, p.slug, p.short_description,
        p.price, p.compare_price, p.stock_quantity,
        p.thumbnail_url, p.created_at,
        c.name as category_name, c.slug as category_slug,
        b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const result = await db.query(dataQuery, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Search products
exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [], message: 'Query too short' });
    }

    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        p.id, p.sku, p.name, p.slug, p.short_description,
        p.price, p.compare_price, p.stock_quantity,
        p.thumbnail_url,
        c.name as category_name, c.slug as category_slug,
        b.name as brand_name,
        ts_rank(p.search_vector, plainto_tsquery('english', $1)) as rank
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'active'
        AND (p.name ILIKE $1 OR p.sku ILIKE $1 OR p.description ILIKE $1)
      ORDER BY rank DESC, p.name ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [`%${q}%`, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      search: q
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// Get featured products
exports.getFeatured = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.sku, p.name, p.slug,
        p.price, p.compare_price, p.stock_quantity,
        p.thumbnail_url,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'active' AND p.stock_quantity > 0
      ORDER BY p.created_at DESC
      LIMIT 12
    `;
    
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};

// Get latest products
exports.getLatest = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.sku, p.name, p.slug,
        p.price, p.compare_price, p.stock_quantity,
        p.thumbnail_url, p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest products' });
  }
};

// Get product by slug
exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name, c.slug as category_slug,
        b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo,
        (
          SELECT json_agg(json_build_object(
            'id', pv.id,
            'sku', pv.sku,
            'name', pv.name,
            'price', pv.price,
            'stock_quantity', pv.stock_quantity,
            'attributes', pv.attributes,
            'image_url', pv.image_url
          ))
          FROM product_variants pv
          WHERE pv.product_id = p.id AND pv.is_active = TRUE
        ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = $1 AND p.status = 'active'
    `;

    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Get product vehicles (fitment)
exports.getVehicles = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        v.id, v.make, v.model, v.year, v.engine,
        v.fuel_type, v.transmission, v.body_style, v.drive_type,
        pv.notes
      FROM product_vehicles pv
      JOIN vehicles v ON pv.vehicle_id = v.id
      WHERE pv.product_id = $1
      ORDER BY v.make, v.model, v.year DESC
    `;

    const result = await db.query(query, [id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
};

// Get product reviews
exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [id, limit, offset]);
    
    // Get average rating
    const avgQuery = `
      SELECT 
        COUNT(*) as total,
        AVG(rating)::NUMERIC(2,1) as average,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE product_id = $1 AND is_approved = TRUE
    `;
    const avgResult = await db.query(avgQuery, [id]);

    res.json({
      success: true,
      data: result.rows,
      stats: avgResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to write a review' });
    }

    const query = `
      INSERT INTO reviews (product_id, user_id, rating, title, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [id, userId, rating, title, content]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};

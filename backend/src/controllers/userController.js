const db = require('../db/db');

// User Controller
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT id, email, first_name, last_name, company_name, phone, role, created_at
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, companyName, phone } = req.body;

    const query = `
      UPDATE users SET first_name = $1, last_name = $2, company_name = $3, phone = $4
      WHERE id = $5
      RETURNING id, email, first_name, last_name, company_name, phone
    `;
    const result = await db.query(query, [firstName, lastName, companyName, phone, userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get addresses' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }

    const query = `
      INSERT INTO addresses (user_id, first_name, last_name, company, address_line1, address_line2, city, state, postal_code, country, phone, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const result = await db.query(query, [userId, firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }

    const query = `
      UPDATE addresses SET first_name = $1, last_name = $2, company = $3, address_line1 = $4, 
      address_line2 = $5, city = $6, state = $7, postal_code = $8, country = $9, phone = $10, is_default = $11
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `;
    const result = await db.query(query, [firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault, id, userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT w.*, p.name, p.slug, p.price, p.thumbnail_url, p.stock_quantity
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.wishlist_id IN (SELECT id FROM wishlists WHERE user_id = $1)
    `;
    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get wishlist' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, note } = req.body;

    // Get or create default wishlist
    let wishlist = await db.query('SELECT id FROM wishlists WHERE user_id = $1 LIMIT 1', [userId]);
    let wishlistId;

    if (wishlist.rows.length === 0) {
      const newWishlist = await db.query('INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id', [userId]);
      wishlistId = newWishlist.rows[0].id;
    } else {
      wishlistId = wishlist.rows[0].id;
    }

    await db.query('INSERT INTO wishlist_items (wishlist_id, product_id, note) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [wishlistId, productId, note]);
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    await db.query('DELETE FROM wishlist_items WHERE product_id = $1 AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = $2)', [productId, userId]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};

const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

// Cart Controller
exports.getCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || uuidv4();
    const userId = req.user?.id;

    let query = `
      SELECT ci.*, p.name, p.slug, p.price, p.stock_quantity, p.thumbnail_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND ci.cart_id IN (SELECT id FROM carts WHERE user_id = $1)';
      params.push(userId);
    } else {
      query += ' AND ci.cart_id IN (SELECT id FROM carts WHERE session_id = $2)';
      params.push(sessionId);
    }

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id;

    // Get or create cart
    let cartQuery = userId 
      ? 'SELECT id FROM carts WHERE user_id = $1'
      : 'SELECT id FROM carts WHERE session_id = $1';
    let cartParams = userId ? [userId] : [sessionId];
    
    let cartResult = await db.query(cartQuery, cartParams);
    let cartId;

    if (cartResult.rows.length === 0) {
      const newCart = await db.query(
        'INSERT INTO carts (session_id, user_id) VALUES ($1, $2) RETURNING id',
        [sessionId || uuidv4(), userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Add or update item
    const existItem = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3',
      [cartId, productId, variantId]
    );

    if (existItem.rows.length > 0) {
      await db.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existItem.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)',
        [cartId, productId, variantId, quantity]
      );
    }

    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, id]);
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM cart_items WHERE id = $1', [id]);
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id;
    
    if (userId) {
      await db.query('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)', [userId]);
    } else if (sessionId) {
      await db.query('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE session_id = $1)', [sessionId]);
    }
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};

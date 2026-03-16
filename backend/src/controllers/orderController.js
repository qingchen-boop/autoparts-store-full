const db = require('../db/db');

// Order Controller
exports.create = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, customerNotes } = req.body;
    const userId = req.user?.id;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.query('SELECT price, name, sku FROM products WHERE id = $1', [item.productId]);
      if (product.rows.length === 0) continue;
      
      const price = product.rows[0].price;
      const total = price * item.quantity;
      subtotal += total;
      
      orderItems.push({
        productId: item.productId,
        sku: product.rows[0].sku,
        name: product.rows[0].name,
        quantity: item.quantity,
        price,
        total
      });
    }

    const totalAmount = subtotal; // Add tax, shipping etc in production

    // Create order
    const orderQuery = `
      INSERT INTO orders (user_id, subtotal, total_amount, shipping_address, billing_address, payment_method, customer_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const order = await db.query(orderQuery, [
      userId, subtotal, totalAmount, 
      JSON.stringify(shippingAddress), 
      JSON.stringify(billingAddress || shippingAddress),
      paymentMethod, customerNotes
    ]);

    // Create order items
    for (const item of orderItems) {
      await db.query(`
        INSERT INTO order_items (order_id, product_id, sku, product_name, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [order.rows[0].id, item.productId, item.sku, item.name, item.quantity, item.price, item.total]);
    }

    res.status(201).json({ success: true, data: order.rows[0] });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20
    `;
    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const orderQuery = 'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = true)';
    const orderResult = await db.query(orderQuery, [id, userId, req.user?.role === 'admin']);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
    const itemsResult = await db.query(itemsQuery, [id]);

    res.json({ 
      success: true, 
      data: { ...orderResult.rows[0], items: itemsResult.rows } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

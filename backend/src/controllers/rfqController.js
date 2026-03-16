const db = require('../db/db');

// RFQ Controller
exports.create = async (req, res) => {
  try {
    const { firstName, lastName, companyName, phone, email, projectDescription, targetPrice, quantity, requiredDate } = req.body;
    const userId = req.user?.id;

    const query = `
      INSERT INTO rfqs (user_id, first_name, last_name, company_name, phone, email, project_description, target_price, quantity, required_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await db.query(query, [userId, firstName, lastName, companyName, phone, email, projectDescription, targetPrice, quantity, requiredDate]);

    res.status(201).json({ success: true, data: result.rows[0], message: 'RFQ submitted successfully' });
  } catch (error) {
    console.error('RFQ error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit RFQ' });
  }
};

exports.createBulk = async (req, res) => {
  try {
    const { firstName, lastName, companyName, phone, email, items } = req.body;
    const userId = req.user?.id;

    // Create RFQ
    const rfqQuery = `
      INSERT INTO rfqs (user_id, first_name, last_name, company_name, phone, email, project_description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const rfqResult = await db.query(rfqQuery, [userId, firstName, lastName, companyName, phone, email, 'Bulk RFQ']);
    const rfqId = rfqResult.rows[0].id;

    // Add items
    for (const item of items) {
      await db.query(`
        INSERT INTO rfq_items (rfq_id, product_name, part_number, quantity, target_price, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [rfqId, item.productName, item.partNumber, item.quantity, item.targetPrice, item.notes]);
    }

    res.status(201).json({ success: true, data: rfqResult.rows[0], message: 'Bulk RFQ submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit bulk RFQ' });
  }
};

exports.getUserRFQs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const query = 'SELECT * FROM rfqs WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFQs' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM rfqs WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    const itemsQuery = 'SELECT * FROM rfq_items WHERE rfq_id = $1';
    const itemsResult = await db.query(itemsQuery, [id]);

    res.json({ success: true, data: { ...result.rows[0], items: itemsResult.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFQ' });
  }
};

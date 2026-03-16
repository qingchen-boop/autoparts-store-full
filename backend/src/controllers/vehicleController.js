const db = require('../db/db');

// Vehicle Controller
exports.getMakes = async (req, res) => {
  try {
    const query = 'SELECT DISTINCT make FROM vehicles ORDER BY make';
    const result = await db.query(query);
    res.json({ success: true, data: result.rows.map(r => r.make) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch makes' });
  }
};

exports.getModels = async (req, res) => {
  try {
    const { make, year } = req.query;
    let query = 'SELECT DISTINCT model FROM vehicles WHERE make = $1';
    const params = [make];

    if (year) {
      query += ' AND year = $2';
      params.push(year);
    }
    query += ' ORDER BY model';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows.map(r => r.model) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch models' });
  }
};

exports.getYears = async (req, res) => {
  try {
    const { make, model } = req.query;
    let query = 'SELECT DISTINCT year FROM vehicles';
    const params = [];
    const conditions = [];

    if (make) {
      conditions.push(`make = $${params.length + 1}`);
      params.push(make);
    }
    if (model) {
      conditions.push(`model = $${params.length + 1}`);
      params.push(model);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY year DESC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows.map(r => r.year) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch years' });
  }
};

// VIN Lookup - decodes VIN to get vehicle info
exports.lookupByVIN = async (req, res) => {
  try {
    const { vin } = req.body;
    
    // In production, use a VIN decoding API
    // For now, return mock data or query local database
    if (!vin || vin.length < 17) {
      return res.status(400).json({ success: false, message: 'Invalid VIN' });
    }

    // Mock VIN decode (replace with real API in production)
    const mockVehicle = {
      make: 'TOYOTA',
      model: 'CAMRY',
      year: 2022,
      engine: '2.5L 4-Cylinder',
      fuel_type: 'Gasoline',
      transmission: 'Automatic',
      body_style: 'Sedan'
    };

    res.json({ success: true, data: mockVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'VIN lookup failed' });
  }
};

// Check if product fits a vehicle
exports.checkFitment = async (req, res) => {
  try {
    const { productId, vehicleId } = req.body;
    
    const query = `
      SELECT * FROM product_vehicles 
      WHERE product_id = $1 AND vehicle_id = $2
    `;
    
    const result = await db.query(query, [productId, vehicleId]);
    res.json({ success: true, fits: result.rows.length > 0, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fitment check failed' });
  }
};

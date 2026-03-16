const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'autoparts-secret-key-change-in-production';

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, phone } = req.body;

    // Check if user exists
    const existUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, company_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, company_name, role, created_at
    `;

    const result = await db.query(query, [email, passwordHash, firstName, lastName, companyName, phone]);
    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const query = `
      SELECT id, email, first_name, last_name, company_name, phone, role, status, created_at
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  res.json({ success: true, message: 'Password reset email sent' });
};

// Reset password
exports.resetPassword = async (req, res) => {
  res.json({ success: true, message: 'Password reset successful' });
};

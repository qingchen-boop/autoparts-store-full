const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'autoparts-secret-key-change-in-production';

/**
 * Require authentication - returns 401 if not authenticated
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Optional authentication - sets req.user if token present but doesn't block
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    }
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { requireAuth, optionalAuth, requireAdmin, JWT_SECRET };

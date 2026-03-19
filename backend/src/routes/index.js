const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Import Controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const rfqController = require('../controllers/rfqController');
const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const userController = require('../controllers/userController');

// Auth Routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.me);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Categories Routes (public)
router.get('/categories', categoryController.getAll);
router.get('/categories/:slug', categoryController.getBySlug);
router.get('/categories/:id/products', categoryController.getProducts);

// Brands Routes (public)
router.get('/brands', categoryController.getBrands);
router.get('/brands/:slug/products', categoryController.getBrandProducts);

// Products Routes (public - optional auth for review creation)
router.get('/products', productController.getAll);
router.get('/products/search', productController.search);
router.get('/products/featured', productController.getFeatured);
router.get('/products/latest', productController.getLatest);
router.get('/products/:slug', productController.getBySlug);
router.get('/products/:id/vehicles', productController.getVehicles);
router.get('/products/:id/reviews', productController.getReviews);
router.post('/products/:id/reviews', optionalAuth, productController.createReview);

// Vehicle Fitment Routes (public)
router.get('/vehicles/makes', vehicleController.getMakes);
router.get('/vehicles/models', vehicleController.getModels);
router.get('/vehicles/years', vehicleController.getYears);
router.post('/vehicles/lookup', vehicleController.lookupByVIN);
router.get('/vehicles/fitment', vehicleController.checkFitment);

// Cart Routes (authenticated)
router.get('/cart', requireAuth, cartController.getCart);
router.post('/cart/items', requireAuth, cartController.addItem);
router.put('/cart/items/:id', requireAuth, cartController.updateItem);
router.delete('/cart/items/:id', requireAuth, cartController.removeItem);
router.delete('/cart', requireAuth, cartController.clearCart);

// Order Routes (authenticated)
router.post('/orders', requireAuth, orderController.create);
router.get('/orders', requireAuth, orderController.getUserOrders);
router.get('/orders/:id', requireAuth, orderController.getById);
router.put('/orders/:id/status', orderController.updateStatus);

// RFQ Routes (authenticated - B2B)
router.post('/rfq', requireAuth, rfqController.create);
router.get('/rfq', requireAuth, rfqController.getUserRFQs);
router.get('/rfq/:id', requireAuth, rfqController.getById);
router.post('/rfq/bulk', requireAuth, rfqController.createBulk);

// User Routes (authenticated)
router.get('/users/profile', requireAuth, userController.getProfile);
router.put('/users/profile', requireAuth, userController.updateProfile);
router.get('/users/addresses', requireAuth, userController.getAddresses);
router.post('/users/addresses', requireAuth, userController.addAddress);
router.put('/users/addresses/:id', requireAuth, userController.updateAddress);
router.delete('/users/addresses/:id', requireAuth, userController.deleteAddress);

// Wishlist Routes (authenticated)
router.get('/wishlist', requireAuth, userController.getWishlist);
router.post('/wishlist', requireAuth, userController.addToWishlist);
router.delete('/wishlist/:productId', requireAuth, userController.removeFromWishlist);

// SEO
const seoController = require('../controllers/seoController');
router.get('/seo/product/:slug', seoController.getProductSeo);

// AI Chat (placeholder)
router.post('/ai/chat', async (req, res) => {
  res.json({
    success: true,
    message: 'AI Chat endpoint - configure OpenAI API to enable'
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Import Controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const rfqController = require('../controllers/rfqController');
const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const userController = require('../controllers/userController');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.me);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// User Routes
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);
router.get('/users/addresses', userController.getAddresses);
router.post('/users/addresses', userController.addAddress);
router.put('/users/addresses/:id', userController.updateAddress);
router.delete('/users/addresses/:id', userController.deleteAddress);

// Categories Routes
router.get('/categories', categoryController.getAll);
router.get('/categories/:slug', categoryController.getBySlug);
router.get('/categories/:id/products', categoryController.getProducts);

// Brands Routes
router.get('/brands', categoryController.getBrands);
router.get('/brands/:slug/products', categoryController.getBrandProducts);

// Products Routes
router.get('/products', productController.getAll);
router.get('/products/search', productController.search);
router.get('/products/featured', productController.getFeatured);
router.get('/products/latest', productController.getLatest);
router.get('/products/:slug', productController.getBySlug);
router.get('/products/:id/vehicles', productController.getVehicles);

// Vehicle Fitment Routes
router.get('/vehicles/makes', vehicleController.getMakes);
router.get('/vehicles/models', vehicleController.getModels);
router.get('/vehicles/years', vehicleController.getYears);
router.post('/vehicles/lookup', vehicleController.lookupByVIN);
router.get('/vehicles/fitment', vehicleController.checkFitment);

// Cart Routes
router.get('/cart', cartController.getCart);
router.post('/cart/items', cartController.addItem);
router.put('/cart/items/:id', cartController.updateItem);
router.delete('/cart/items/:id', cartController.removeItem);
router.delete('/cart', cartController.clearCart);

// Order Routes
router.post('/orders', orderController.create);
router.get('/orders', orderController.getUserOrders);
router.get('/orders/:id', orderController.getById);
router.put('/orders/:id/status', orderController.updateStatus);

// RFQ Routes (B2B)
router.post('/rfq', rfqController.create);
router.get('/rfq', rfqController.getUserRFQs);
router.get('/rfq/:id', rfqController.getById);
router.post('/rfq/bulk', rfqController.createBulk);

// Wishlist Routes
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);

// Reviews Routes
router.get('/products/:id/reviews', productController.getReviews);
router.post('/products/:id/reviews', productController.createReview);

// AI Chat (Future)
router.post('/ai/chat', async (req, res) => {
  res.json({
    success: true,
    message: 'AI Chat endpoint - configure OpenAI API to enable'
  });
});

module.exports = router;

// AutoParts B2B API Documentation
// Base URL: /api/v1
// ============================================

export const apiEndpoints = {
  // ----------------------------------------
  // Products
  // ----------------------------------------
  'GET /products' - List products with filters
  'GET /products/:id' - Get product by ID
  'GET /products/slug/:slug' - Get product by SEO slug
  'GET /products/search' - Search products
  'POST /products' - Create product (admin)
  'PUT /products/:id' - Update product (admin)
  'DELETE /products/:id' - Delete product (admin)

  // Product Images
  'POST /products/:id/images' - Upload images
  'DELETE /products/:images/:id' - Delete image

  // ----------------------------------------
  // Categories
  // ----------------------------------------
  'GET /categories' - List all categories (tree)
  'GET /categories/:slug' - Get category by slug
  'GET /categories/:slug/products' - Products in category
  'POST /categories' - Create category (admin)
  'PUT /categories/:id' - Update category (admin)

  // ----------------------------------------
  // OEM
  // ----------------------------------------
  'GET /oem/search' - Search by OEM number
  'GET /oem/:number' - Get OEM details
  'GET /products/:id/oem' - Product OEM numbers
  'POST /oem/import' - Bulk import OEM (admin)

  // ----------------------------------------
  // Fitment (Vehicle Compatibility)
  // ----------------------------------------
  'GET /fitment/brands' - List vehicle brands
  'GET /fitment/brands/:slug/models' - Models by brand
  'GET /fitment/models/:slug/years' - Years by model
  'GET /fitment/years/:year/engines' - Engines by year
  'GET /fitment/vehicles/:id/products' - Products for vehicle
  'POST /fitment/decode-vin' - Decode VIN
  'GET /products/:id/fitment' - Product fitment list

  // ----------------------------------------
  // Search
  // ----------------------------------------
  'GET /search' - Global search
  'GET /search/suggestions' - Search suggestions
  'GET /search/popular' - Popular searches

  // ----------------------------------------
  // RFQ (Requests for Quote)
  // ----------------------------------------
  'GET /rfq' - List RFQs (admin)
  'GET /rfq/:id' - Get RFQ details
  'POST /rfq' - Submit new RFQ
  'PUT /rfq/:id/status' - Update RFQ status (admin)
  'POST /rfq/:id/quote' - Send quote (admin)
  'POST /rfq/:id/message' - Add message

  // ----------------------------------------
  // Blog
  // ----------------------------------------
  'GET /posts' - List posts
  'GET /posts/:slug' - Get post by slug
  'GET /posts/category/:slug' - Posts by category
  'POST /posts' - Create post (admin)
  'PUT /posts/:id' - Update post (admin)

  // ----------------------------------------
  // Pages
  // ----------------------------------------
  'GET /pages' - List pages
  'GET /pages/:slug' - Get page by slug

  // ----------------------------------------
  // Certificates
  // ----------------------------------------
  'GET /certificates' - List certificates

  // ----------------------------------------
  // Settings
  // ----------------------------------------
  'GET /settings' - Get all settings
  'GET /settings/:key' - Get setting

  // ----------------------------------------
  // Auth
  // ----------------------------------------
  'POST /auth/register' - Register
  'POST /auth/login' - Login
  'POST /auth/logout' - Logout
  'GET /auth/me' - Current user

  // ----------------------------------------
  // Import (Admin)
  // ----------------------------------------
  'POST /import/products' - Import products CSV
  'POST /import/oem' - Import OEM CSV
  'POST /import/fitment' - Import fitment CSV
  'GET /import/status' - Import status
}

// Query Parameters Examples
export const queryExamples = {
  'GET /products?category=brake-pads&brand=Bosch&price_min=10&price_max=100&in_stock=true&page=1&limit=20&sort=price_asc':
    'List brake pads from Bosch between $10-100',

  'GET /search?q=04466-0R010':
    'Search by OEM number',

  'GET /products?featured=true':
    'Featured products only',

  'GET /oem/search?number=0986AF':
    'Search OEM starting with 0986AF'
}

// Request/Response Examples
export const examples = {
  product: {
    request: 'GET /api/v1/products/slug/toyota-camry-brake-pads',
    response: {
      success: true,
      data: {
        id: 1,
        sku: 'BRK-TYT-001',
        name: 'Toyota Camry Brake Pads Ceramic',
        slug: 'toyota-camry-brake-pads-ceramic',
        price: 45.99,
        stock_quantity: 500,
        brand: 'Bosch',
        oem_numbers: ['04466-0R010', 'MD865131'],
        fitments: [
          { brand: 'Toyota', model: 'Camry', year: '2015-2020' }
        ],
        images: [...],
        specifications: {...},
        meta_title: 'Toyota Camry Brake Pads | Bosch',
        meta_description: 'Premium ceramic brake pads...'
      }
    }
  },

  rfq: {
    request: 'POST /api/v1/rfq',
    body: {
      name: 'John Smith',
      email: 'john@company.com',
      company: 'Auto Parts Inc',
      country: 'USA',
      message: 'Need quote for 500 brake pads',
      items: [
        { product_id: 1, quantity: 500 }
      ]
    },
    response: {
      success: true,
      data: {
        rfq_number: 'RFQ-2024-001',
        status: 'pending'
      }
    }
  }
}

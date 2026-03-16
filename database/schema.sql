-- Auto Parts Store Database Schema
-- PostgreSQL 14+
-- Supports 100K+ SKUs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'customer', -- customer, admin
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- USER ADDRESSES
-- ============================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================
-- PRODUCT CATEGORIES
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================
-- BRANDS
-- ============================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    
    -- Pricing
    price DECIMAL(12, 2),
    compare_price DECIMAL(12, 2),
    cost_price DECIMAL(12, 2),
    moq INT DEFAULT 1, -- Minimum Order Quantity
    
    -- Inventory
    stock_quantity INT DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    
    -- Weight & Dimensions
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    dimension_unit VARCHAR(10) DEFAULT 'cm',
    
    -- Images
    images JSONB DEFAULT '[]',
    thumbnail_url VARCHAR(500),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));

-- Full text search index
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))) STORED;

CREATE INDEX idx_products_search ON products USING gin(search_vector);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    price DECIMAL(12, 2),
    stock_quantity INT DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ============================================
-- VEHICLE FITMENT (VIN System)
-- ============================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    engine VARCHAR(100),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    body_style VARCHAR(50),
    drive_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model, year, engine)
);

CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_year ON vehicles(year);

CREATE TABLE product_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, vehicle_id)
);

CREATE INDEX idx_product_vehicles_product ON product_vehicles(product_id);
CREATE INDEX idx_product_vehicles_vehicle ON product_vehicles(vehicle_id);

-- ============================================
-- SHOPPING CART
-- ============================================

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Order Status
    status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    payment_status VARCHAR(30) DEFAULT 'pending', -- pending, paid, failed, refunded
    fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled',
    
    -- Pricing
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    shipping_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Shipping
    shipping_address JSONB,
    billing_address JSONB,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- REQUEST FOR QUOTE (RFQ) - B2B Feature
-- ============================================

CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    
    status VARCHAR(30) DEFAULT 'pending', -- pending, reviewed, quoted, accepted, rejected, expired
    
    -- Contact Info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    
    -- Details
    project_description TEXT,
    target_price DECIMAL(12, 2),
    quantity INT,
    required_date DATE,
    
    -- Response
    quoted_price DECIMAL(12, 2),
    quoted_notes TEXT,
    quoted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rfqs_user ON rfqs(user_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_number ON rfqs(rfq_number);

-- RFQ Line Items (for bulk RFQ)
CREATE TABLE rfq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(500),
    part_number VARCHAR(100),
    quantity INT NOT NULL,
    target_price DECIMAL(12, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rfq_items_rfq ON rfq_items(rfq_id);

-- ============================================
-- WISHLIST
-- ============================================

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'My Wishlist',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wishlist_id, product_id)
);

CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- ADMIN: ACTIVITY LOG
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to main tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    count_part VARCHAR(6);
BEGIN
    year_part := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    SELECT TO_CHAR(COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8 FOR 6) AS INT)), 0) + 1, 'FM000000')
    INTO count_part
    FROM orders
    WHERE order_number LIKE year_part || '-%';
    
    NEW.order_number := year_part || '-' || count_part;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
FOR EACH ROW WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();

-- Generate RFQ number
CREATE OR REPLACE FUNCTION generate_rfq_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    count_part VARCHAR(6);
BEGIN
    year_part := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    SELECT TO_CHAR(COALESCE(MAX(CAST(SUBSTRING(rfq_number FROM 8 FOR 6) AS INT)), 0) + 1, 'FM000000')
    INTO count_part
    FROM rfqs
    WHERE rfq_number LIKE 'RFQ-' || year_part || '-%';
    
    NEW.rfq_number := 'RFQ-' || year_part || '-' || count_part;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_rfq_number_trigger BEFORE INSERT ON rfqs
FOR EACH ROW WHEN (NEW.rfq_number IS NULL)
EXECUTE FUNCTION generate_rfq_number();

-- ============================================
-- SEED DATA
-- ============================================

-- Sample Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Brake Systems', 'brake-systems', 'Brake pads, rotors, calipers and more', 1),
('Engine Parts', 'engine-parts', 'Filters, pumps, belts and components', 2),
('Suspension', 'suspension', 'Shocks, struts, springs and bushings', 3),
('Electrical', 'electrical', 'Batteries, alternators, starters and sensors', 4),
('Transmission', 'transmission', 'Clutches, gears and transmission parts', 5),
('Cooling', 'cooling', 'Radiators, water pumps and hoses', 6),
('Exhaust', 'exhaust', 'Mufflers, catalytic converters and exhaust parts', 7),
('Body Parts', 'body-parts', 'Mirrors, lights, bumpers and body panels', 8);

-- Sample Brands
INSERT INTO brands (name, slug, description) VALUES
('Bosch', 'bosch', 'German automotive technology'),
('Denso', 'denso', 'Japanese automotive components'),
('Monroe', 'monroe', 'American suspension experts'),
('ACDelco', 'acdelco', 'General Motors original equipment'),
('NGK', 'ngk', 'Ignition parts specialist'),
('Magna', 'magna', 'Global automotive supplier');


-- Auto Parts Store Database Schema (Professional)
-- Version: 2.0

-- ============================================
-- VEHICLE TABLES (核心：车型适配)
-- ============================================

-- 品牌
CREATE TABLE vehicle_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 车系
CREATE TABLE vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES vehicle_brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, slug)
);

-- 年份
CREATE TABLE vehicle_years (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES vehicle_models(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, year)
);

-- 发动机
CREATE TABLE vehicle_engines (
    id SERIAL PRIMARY KEY,
    year_id INTEGER REFERENCES vehicle_years(id) ON DELETE CASCADE,
    engine_type VARCHAR(100),  -- e.g., "2.5L", "3.0T"
    fuel_type VARCHAR(50),    -- gasoline, diesel, electric, hybrid
    horsepower INTEGER,
    transmission VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 完整车型（用于快速查询）
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vin_prefix VARCHAR(8),  -- VIN 前8位
    brand_id INTEGER REFERENCES vehicle_brands(id),
    model_id INTEGER REFERENCES vehicle_models(id),
    year_id INTEGER REFERENCES vehicle_years(id),
    engine_id INTEGER REFERENCES vehicle_engines(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, model_id, year_id, engine_id)
);

-- ============================================
-- CATEGORY TABLES (多级分类)
-- ============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCT TABLES (专业产品结构)
-- ============================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_zh VARCHAR(255),
    name_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords TEXT,
    
    -- 基本信息
    category_id INTEGER REFERENCES categories(id),
    brand VARCHAR(100),
    
    -- 价格
    price DECIMAL(12, 2),
    cost DECIMAL(12, 2),
    msrp DECIMAL(12, 2),
    
    -- 库存
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    is_in_stock BOOLEAN DEFAULT true,
    
    -- 产品属性
    weight DECIMAL(10, 2),  -- kg
    dimensions VARCHAR(100), -- LxWxH
    
    -- 描述
    short_description TEXT,
    description TEXT,
    description_ai TEXT,  -- AI生成描述
    
    -- 状态
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- 时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品变体（尺寸、颜色等）
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    price DECIMAL(12, 2),
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB,  -- {"size": "XL", "color": "red"}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品图片
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品属性定义
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    type VARCHAR(50),  -- text, number, select, boolean
    options JSONB,     -- ["S", "M", "L"] for select type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品属性值
CREATE TABLE product_attribute_values (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    attribute_id INTEGER REFERENCES product_attributes(id),
    value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OEM TABLES (OEM交叉参考 - 汽车配件核心)
-- ============================================

CREATE TABLE oem_numbers (
    id SERIAL PRIMARY KEY,
    oem_number VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100),  -- Bosch, Denso, Valeo, Delphi, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品-OEM映射
CREATE TABLE product_oem_map (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    oem_id INTEGER REFERENCES oem_numbers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, oem_id)
);

-- ============================================
-- FITMENT TABLES (车型适配 - 汽车配件核心)
-- ============================================

CREATE TABLE product_vehicle_fitment (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    fitment_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, vehicle_id)
);

-- 快速适配查询视图
CREATE VIEW fitment_quick AS
SELECT 
    p.id as product_id,
    p.sku,
    p.name,
    p.price,
    p.stock_quantity,
    v.id as vehicle_id,
    vb.name as brand_name,
    vm.name as model_name,
    vy.year,
    ve.engine_type
FROM products p
JOIN product_vehicle_fitment pvf ON p.id = pvf.product_id
JOIN vehicles v ON pvf.vehicle_id = v.id
JOIN vehicle_brands vb ON v.brand_id = vb.id
JOIN vehicle_models vm ON v.model_id = vm.id
JOIN vehicle_years vy ON v.year_id = vy.id
JOIN vehicle_engines ve ON v.engine_id = ve.id
WHERE p.is_active = true;

-- ============================================
-- USER & AUTH
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    company VARCHAR(255),  -- B2B客户
    user_type VARCHAR(20) DEFAULT 'customer',  -- customer, b2b, admin
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 地址
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20),  -- shipping, billing
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CART & ORDERS
-- ============================================

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    
    -- 订单信息
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    
    -- 金额
    subtotal DECIMAL(12, 2),
    tax DECIMAL(12, 2),
    shipping_cost DECIMAL(12, 2),
    discount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2),
    
    -- 地址
    shipping_address_id INTEGER REFERENCES addresses(id),
    billing_address_id INTEGER REFERENCES addresses(id),
    
    -- 备注
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    sku VARCHAR(100),
    product_name VARCHAR(255),
    quantity INTEGER,
    unit_price DECIMAL(12, 2),
    total DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RFQ (询价系统)
-- ============================================

CREATE TABLE rfq_requests (
    id SERIAL PRIMARY KEY,
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',  -- pending, quoted, accepted, rejected
    
    -- 客户信息
    company_name VARCHAR(255),
    contact_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- 需求
    message TEXT,
    target_price DECIMAL(12, 2),
    quantity INTEGER,
    shipping_country VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfq_requests(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    oem_number VARCHAR(100),
    product_name VARCHAR(255),
    quantity INTEGER,
    target_price DECIMAL(12, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfq_quotes (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfq_requests(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    valid_until DATE,
    subtotal DECIMAL(12, 2),
    shipping_cost DECIMAL(12, 2),
    total DECIMAL(12, 2),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES (性能优化)
-- ============================================

-- 产品搜索索引
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);

-- OEM索引
CREATE INDEX idx_oem_number ON oem_numbers(oem_number);
CREATE INDEX idx_product_oem ON product_oem_map(oem_id);

-- 车型索引
CREATE INDEX idx_vehicle_brand ON vehicles(brand_id);
CREATE INDEX idx_vehicle_model ON vehicles(model_id);
CREATE INDEX idx_vehicle_year ON vehicles(year_id);
CREATE INDEX idx_vehicle_vin ON vehicles(vin_prefix);

-- 适配查询索引
CREATE INDEX idx_fitment_product ON product_vehicle_fitment(product_id);
CREATE INDEX idx_fitment_vehicle ON product_vehicle_fitment(vehicle_id);

-- 订单索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);

-- ============================================
-- SEED DATA (示例)
-- ============================================

-- 品牌
INSERT INTO vehicle_brands (name, slug) VALUES 
('Toyota', 'toyota'),
('Honda', 'honda'),
('BMW', 'bmw'),
('Mercedes-Benz', 'mercedes-benz'),
('Ford', 'ford'),
('Chevrolet', 'chevrolet');

-- 分类
INSERT INTO categories (name, name_zh, name_ar, slug, parent_id) VALUES
('Brake System', '刹车系统', 'نظام الفرامل', 'brake-system', NULL),
('Engine Parts', '发动机零件', 'قطع المحرك', 'engine-parts', NULL),
('Suspension', '悬挂系统', 'التعليق', 'suspension', NULL),
('Electrical', '电气系统', 'النظام الكهربائي', 'electrical', NULL),
('Transmission', '变速箱', 'ناقل الحركة', 'transmission', NULL),
('Filters', '滤芯', 'المرشحات', 'filters', NULL),
('Spark Plugs', '火花塞', 'شمعات الإشعال', 'spark-plugs', NULL),
('Oil', '机油', 'الزيت', 'oil', NULL);

-- 产品示例
INSERT INTO products (sku, name, name_zh, name_ar, slug, category_id, brand, price, stock_quantity, meta_description) VALUES
('BRK-001', 'Premium Ceramic Brake Pads', '优质陶瓷刹车片', 'صفائح فرامل سيراميك عالية الجودة', 'premium-ceramic-brake-pads', 1, 'Bosch', 49.99, 100, 'Premium ceramic brake pads for Toyota Camry 2015-2020'),
('BRK-002', 'Performance Brake Rotors', '高性能刹车盘', 'قرص فرامل عالي الأداء', 'performance-brake-rotors', 1, 'Brembo', 89.99, 50, 'Drilled and slotted brake rotors for BMW 3 Series'),
('ENG-001', 'Oil Filter', '机油滤芯', 'فلتر الزيت', 'oil-filter', 6, 'Mann', 12.99, 500, 'Premium oil filter compatible with Honda engines'),
('ENG-002', 'Air Filter', '空气滤芯', 'فلتر الهواء', 'air-filter', 6, 'K&N', 24.99, 300, 'High-flow air filter for Ford F-150'),
('SPK-001', 'Iridium Spark Plugs', '铱金火花塞', 'شمعات إشعال إيريديوم', 'iridium-spark-plugs', 7, 'Denso', 8.99, 1000, 'Long-life iridium spark plugs set of 4');

-- OEM
INSERT INTO oem_numbers (oem_number, brand) VALUES
('04466-0R010', 'Toyota'),
('MD865131', 'Mitsubishi'),
('12345678', 'Bosch'),
('SP-493', 'Denso');

-- 产品-OEM映射
INSERT INTO product_oem_map (product_id, oem_id, is_primary) VALUES
(1, 1, true),
(3, 3, true),
(5, 4, true);

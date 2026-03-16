-- =====================================================
-- AutoParts B2B Platform - Complete Database Schema
-- Version: 3.0 (Production)
-- =====================================================

-- =====================================================
-- 1. VEHICLE TABLES (车型系统)
-- =====================================================

-- 品牌
CREATE TABLE vehicle_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(500),
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 车系
CREATE TABLE vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES vehicle_brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
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
    engine_type VARCHAR(100),    -- "2.5L", "3.0T"
    fuel_type VARCHAR(50),       -- gasoline, diesel, electric, hybrid
    horsepower INTEGER,
    transmission VARCHAR(50),    -- automatic, manual, cvt
    drivetrain VARCHAR(50),      -- fwd, rwd, awd, 4wd
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 完整车型
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vin_prefix VARCHAR(8),
    brand_id INTEGER REFERENCES vehicle_brands(id),
    model_id INTEGER REFERENCES vehicle_models(id),
    year_id INTEGER REFERENCES vehicle_years(id),
    engine_id INTEGER REFERENCES vehicle_engines(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, model_id, year_id, engine_id)
);

-- 索引
CREATE INDEX idx_vehicle_brand ON vehicles(brand_id);
CREATE INDEX idx_vehicle_model ON vehicles(model_id);
CREATE INDEX idx_vehicle_year ON vehicles(year_id);

-- =====================================================
-- 2. CATEGORY TABLES (多级分类)
-- =====================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    description_zh TEXT,
    description_ar TEXT,
    image VARCHAR(500),
    icon VARCHAR(100),
    banner VARCHAR(500),
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分类关系表 (多对多)
CREATE TABLE category_relations (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(parent_id, child_id)
);

-- =====================================================
-- 3. PRODUCT TABLES (产品系统)
-- =====================================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    
    -- 名称 (多语言)
    name VARCHAR(255) NOT NULL,
    name_zh VARCHAR(255),
    name_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords TEXT,
    
    -- 分类
    category_id INTEGER REFERENCES categories(id),
    
    -- 品牌 & 制造商
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    
    -- 价格
    price USD_CURRENCY,
    cost USD_CURRENCY,
    msrp USD_CURRENCY,
    moq INTEGER DEFAULT 1,           -- Minimum Order Quantity
    price_tiers JSONB,             -- [{"qty": 100, "price": 10}, {"qty": 500, "price": 9}]
    
    -- 库存
    stock_quantity INTEGER DEFAULT 0,
    stock_status VARCHAR(20) DEFAULT 'in_stock',  -- in_stock, low_stock, out_of_stock, pre_order
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- 产品属性
    weight DECIMAL(10, 2),          -- kg
    dimensions VARCHAR(100),        -- "500x400x300mm"
    material VARCHAR(100),
    color VARCHAR(100),
    warranty_months INTEGER,
    
    -- 描述
    short_description VARCHAR(500),
    description TEXT,
    description_ai TEXT,            -- AI 生成
    description_zh TEXT,
    description_ar TEXT,
    
    -- 技术规格
    specifications JSONB,           -- {"voltage": "12V", "wattage": "100W"}
    
    -- 状态
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    
    -- 认证
    certifications TEXT[],          -- ["ISO9001", "CE", "ROHS"]
    
    -- 物流
    hs_code VARCHAR(20),
    lead_time_days INTEGER,
    
    -- 时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- 产品变体
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    price USD_CURRENCY,
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB,               -- {"size": "XL", "color": "red"}
    image_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品图片
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    alt_text_zh VARCHAR(255),
    alt_text_ar VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品文档
CREATE TABLE product_documents (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),               -- datasheet, manual, certificate
    url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品属性定义
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    type VARCHAR(50),               -- text, number, select, boolean, date
    options JSONB,                 -- ["S", "M", "L"]
    unit VARCHAR(20),                -- "mm", "kg", "V"
    is_filterable BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
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

-- 产品标签
CREATE TABLE product_tags (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));

-- =====================================================
-- 4. OEM TABLES (OEM 交叉参考)
-- =====================================================

CREATE TABLE oem_numbers (
    id SERIAL PRIMARY KEY,
    oem_number VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100),             -- Bosch, Denso, Valeo, Delphi
    part_type VARCHAR(100),         -- brake pad, filter, spark plug
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_oem_map (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    oem_id INTEGER REFERENCES oem_numbers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    is_alternative BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, oem_id)
);

CREATE INDEX idx_oem_number ON oem_numbers(oem_number);
CREATE INDEX idx_product_oem ON product_oem_map(product_id);
CREATE INDEX idx_oem_product ON product_oem_map(oem_id);

-- =====================================================
-- 5. FITMENT TABLES (车型适配)
-- =====================================================

CREATE TABLE product_vehicle_fitment (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    fitment_type VARCHAR(50),       -- direct_fit, compatible, universal
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, vehicle_id)
);

-- 快速适配视图
CREATE VIEW v_fitment_quick AS
SELECT 
    p.id as product_id,
    p.sku,
    p.name,
    p.slug,
    p.price,
    p.stock_quantity,
    p.brand,
    vb.id as brand_id,
    vb.name as brand_name,
    vm.id as model_id,
    vm.name as model_name,
    vy.year,
    ve.engine_type,
    ve.fuel_type
FROM products p
JOIN product_vehicle_fitment pvf ON p.id = pvf.product_id
JOIN vehicles v ON pvf.vehicle_id = v.id
JOIN vehicle_brands vb ON v.brand_id = vb.id
JOIN vehicle_models vm ON v.model_id = vm.id
JOIN vehicle_years vy ON v.year_id = vy.id
JOIN vehicle_engines ve ON v.engine_id = ve.id
WHERE p.is_active = true;

CREATE INDEX idx_fitment_product ON product_vehicle_fitment(product_id);
CREATE INDEX idx_fitment_vehicle ON product_vehicle_fitment(vehicle_id);

-- =====================================================
-- 6. BLOG TABLES (内容系统)
-- =====================================================

CREATE TABLE post_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_zh VARCHAR(100),
    name_ar VARCHAR(100),
    description TEXT,
    image VARCHAR(500),
    parent_id INTEGER REFERENCES post_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_zh VARCHAR(255),
    title_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords TEXT,
    
    -- 内容
    excerpt TEXT,
    content TEXT,
    content_zh TEXT,
    content_ar TEXT,
    featured_image VARCHAR(500),
    
    -- 分类
    category_id INTEGER REFERENCES post_categories(id),
    
    -- 作者
    author_name VARCHAR(100),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'draft',  -- draft, published, archived
    is_featured BOOLEAN DEFAULT false,
    
    -- 统计
    views INTEGER DEFAULT 0,
    
    -- 时间
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);

-- =====================================================
-- 7. RFQ TABLES (询盘系统)
-- =====================================================

CREATE TABLE rfq_requests (
    id SERIAL PRIMARY KEY,
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- 客户信息
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    country_code VARCHAR(10),
    
    -- 公司类型
    company_type VARCHAR(50),       -- distributor, retailer, workshop, individual
    
    -- 需求
    message TEXT,
    urgency VARCHAR(50),           -- normal, urgent, very_urgent
    
    -- 状态
    status VARCHAR(50) DEFAULT 'pending',  -- pending, reviewed, quoted, accepted, rejected, closed
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- 跟进
    assigned_to INTEGER REFERENCES users(id),
    internal_notes TEXT,
    
    -- 来源
    source VARCHAR(50),            -- website, email, phone, referral
    
    -- 时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfq_requests(id) ON DELETE CASCADE,
    
    -- 产品信息
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255),
    product_sku VARCHAR(100),
    
    -- OEM 信息
    oem_number VARCHAR(100),
    
    -- 需求
    quantity INTEGER NOT NULL,
    target_price USD_CURRENCY,
    target_delivery DATE,
    
    -- 备注
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfq_quotes (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfq_requests(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- 价格
    subtotal USD_CURRENCY,
    shipping_cost USD_CURRENCY,
    tax USD_CURRENCY,
    discount DECIMAL(5, 2),         -- percentage
    total USD_CURRENCY,
    
    -- 有效期
    valid_from DATE,
    valid_until DATE,
    
    -- 条款
    payment_terms VARCHAR(100),
    delivery_terms VARCHAR(100),
    
    -- 备注
    notes TEXT,
    
    -- 状态
    status VARCHAR(50) DEFAULT 'pending',  -- pending, sent, accepted, rejected, expired
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE TABLE rfq_messages (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES rfq_requests(id) ON DELETE CASCADE,
    
    sender_type VARCHAR(20),        -- customer, admin
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),
    
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rfq_status ON rfq_requests(status);
CREATE INDEX idx_rfq_email ON rfq_requests(email);
CREATE INDEX idx_rfq_created ON rfq_requests(created_at);

-- =====================================================
-- 8. USER & AUTH
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- 个人信息
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    avatar VARCHAR(500),
    
    -- 公司信息 (B2B)
    company_name VARCHAR(255),
    company_website VARCHAR(255),
    company_address TEXT,
    tax_id VARCHAR(50),
    
    -- 角色
    role VARCHAR(20) DEFAULT 'customer',  -- customer, b2b, agent, admin
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- 设置
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- 时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20),       -- shipping, billing
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    country_code VARCHAR(10),
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. ORDER TABLES
-- =====================================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    
    -- 状态
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    fulfillment_status VARCHAR(50) DEFAULT 'pending',
    
    -- 金额
    subtotal USD_CURRENCY,
    shipping_cost USD_CURRENCY,
    tax USD_CURRENCY,
    discount USD_CURRENCY DEFAULT 0,
    total USD_CURRENCY,
    
    -- 货币
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10, 6),
    
    -- 地址
    shipping_address_id INTEGER REFERENCES addresses(id),
    billing_address_id INTEGER REFERENCES addresses(id),
    
    -- 备注
    customer_notes TEXT,
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
    unit_price USD_CURRENCY,
    total USD_CURRENCY,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- =====================================================
-- 10. CERTIFICATES (企业认证)
-- =====================================================

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),               -- iso, ce, rohs, e-mark
    number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuer VARCHAR(255),
    document_url VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. PAGES (自定义页面)
-- =====================================================

CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    content TEXT,
    content_zh TEXT,
    content_ar TEXT,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    
    -- 状态
    is_published BOOLEAN DEFAULT false,
    is_homepage BOOLEAN DEFAULT false,
    
    template VARCHAR(50),          -- default, about, contact, faq
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. SETTINGS
-- =====================================================

CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    type VARCHAR(50),               -- string, number, boolean, json
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 默认设置
INSERT INTO settings (key, value, type) VALUES
('site_name', 'AutoParts B2B', 'string'),
('site_email', 'info@autoparts.com', 'string'),
('site_phone', '+1-555-0123', 'string'),
('site_address', '123 Auto Street, Detroit, MI', 'string'),
('currency', 'USD', 'string'),
('languages', '["en", "zh", "ar"]', 'json'),
('default_language', 'en', 'string'),
('timezone', 'America/New_York', 'string'),
('tax_rate', '0', 'number'),
('free_shipping_threshold', '1000', 'number'),
('low_stock_threshold', '10', 'number');

-- =====================================================
-- 13. SEO URL REDIRECTS
-- =====================================================

CREATE TABLE seo_redirects (
    id SERIAL PRIMARY KEY,
    from_url VARCHAR(500) NOT NULL,
    to_url VARCHAR(500) NOT NULL,
    status_code INTEGER DEFAULT 301,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- 车辆品牌
INSERT INTO vehicle_brands (name, slug, name_zh) VALUES
('Toyota', 'toyota', '丰田'),
('Honda', 'honda', '本田'),
('BMW', 'bmw', '宝马'),
('Mercedes-Benz', 'mercedes-benz', '奔驰'),
('Ford', 'ford', '福特'),
('Chevrolet', 'chevrolet', '雪佛兰'),
('Nissan', 'nissan', '日产'),
('Volkswagen', 'volkswagen', '大众'),
('Hyundai', 'hyundai', '现代'),
('Kia', 'kia', '起亚');

-- 产品分类
INSERT INTO categories (name, name_zh, name_ar, slug, parent_id, is_featured) VALUES
('Brake System', '刹车系统', 'نظام الفرامل', 'brake-system', NULL, true),
('Engine Parts', '发动机零件', 'قطع المحرك', 'engine-parts', NULL, true),
('Suspension', '悬挂系统', 'التعليق', 'suspension', NULL, false),
('Electrical', '电气系统', 'النظام الكهربائي', 'electrical', NULL, false),
('Transmission', '变速箱', 'ناقل الحركة', 'transmission', NULL, false),
('Filters', '滤芯', 'المرشحات', 'filters', NULL, true),
('Spark Plugs', '火花塞', 'شمعات الإشعال', 'spark-plugs', NULL, false),
('Lighting', '车灯', 'الإضاءة', 'lighting', NULL, false),
('Cooling System', '冷却系统', 'نظام التبريد', 'cooling-system', NULL, false),
('Exhaust', '排气系统', 'نظام العادم', 'exhaust', NULL, false);

-- 子分类
INSERT INTO categories (name, name_zh, name_ar, slug, parent_id) VALUES
('Brake Pads', '刹车片', 'صفائح الفرامل', 'brake-pads', 1),
('Brake Rotors', '刹车盘', 'قرص الفرامل', 'brake-rotors', 1),
('Brake Calipers', '刹车卡钳', 'كالipers الفرامل', 'brake-calipers', 1),
('Oil Filters', '机油滤芯', 'فلتر الزيت', 'oil-filters', 6),
('Air Filters', '空气滤芯', 'فلتر الهواء', 'air-filters', 6),
('Cabin Filters', '空调滤芯', 'فلتر المقصورة', 'cabin-filters', 6);

-- 示例产品
INSERT INTO products (sku, name, name_zh, name_ar, slug, category_id, brand, price, stock_quantity, meta_description) VALUES
('BRK-TYT-001', 'Toyota Camry Brake Pads Ceramic', '丰田凯美瑞陶瓷刹车片', 'صفائح فرامل سيراميك تويوتا كامري', 'toyota-camry-brake-pads-ceramic', 1, 'Bosch', 45.99, 500, 'Premium ceramic brake pads for Toyota Camry 2015-2020. Low noise, excellent stopping power.'),
('BRK-BMW-001', 'BMW 3 Series Brake Rotors', '宝马3系刹车盘', 'قرص فرامل بي ام دبليو سلسلة 3', 'bmw-3-series-brake-rotors', 2, 'Brembo', 129.99, 200, 'High-performance drilled and slotted brake rotors for BMW 3 Series E90 F30.'),
('FLT-OIL-001', 'Premium Oil Filter', '优质机油滤芯', 'فلتر زيت عالي الجودة', 'premium-oil-filter', 4, 'Mann', 12.99, 2000, 'Premium oil filter compatible with most Japanese and American vehicles.'),
('FLT-AIR-001', 'K&N High-Flow Air Filter', 'K&N高流量空气滤芯', 'فلتر هواء عالي التدفق كن', 'kn-high-flow-air-filter', 5, 'K&N', 54.99, 800, 'Washable and reusable high-flow air filter. Improves horsepower.'),
('SPK-DEN-001', 'Denso Iridium Spark Plugs', '电装铱金火花塞', 'شمعات إشعال إيريديوم دenso', 'denso-iridium-spark-plugs', 7, 'Denso', 8.99, 5000, 'Long-life iridium spark plugs. Set of 4. Compatible with most vehicles.'),
('BRK-HON-001', 'Honda Accord Brake Pads', '本田雅阁刹车片', 'صفائح فرامل هوندا أكورد', 'honda-accord-brake-pads', 1, 'ACDelco', 39.99, 350, 'OEM quality brake pads for Honda Accord. Ceramic formula for quiet operation.');

-- OEM 编号
INSERT INTO oem_numbers (oem_number, brand, part_type) VALUES
('04466-0R010', 'Toyota', 'brake_pads'),
('MD865131', 'Mitsubishi', 'brake_pads'),
('12345678', 'Bosch', 'oil_filter'),
('SP-493', 'Denso', 'spark_plug'),
('90915-YZZE1', 'Toyota', 'air_filter'),
('234-9001', 'Nissan', 'oil_filter');

-- 产品-OEM 映射
INSERT INTO product_oem_map (product_id, oem_id, is_primary) VALUES
(1, 1, true),
(1, 2, false),
(3, 3, true),
(5, 4, true),
(4, 5, true),
(3, 6, false);

-- 博客分类
INSERT INTO post_categories (name, slug, name_zh) VALUES
('News', 'news', '新闻'),
('Technical Articles', 'technical-articles', '技术文章'),
('Product Guides', 'product-guides', '产品指南'),
('Industry Insights', 'industry-insights', '行业洞察');

-- 示例博客
INSERT INTO posts (title, title_zh, slug, excerpt, content, category_id, status, published_at) VALUES
('How to Choose the Right Brake Pads', '如何选择合适的刹车片', 'how-to-choose-brake-pads', 'Learn about the different types of brake pads and how to choose the right one for your vehicle.', '<p>Choosing the right brake pads is crucial for your safety...</p>', 3, 'published', CURRENT_TIMESTAMP),
('Oil Filter Replacement Guide', '机油滤芯更换指南', 'oil-filter-replacement-guide', 'A step-by-step guide to replacing your oil filter.', '<p>Regular oil filter replacement is essential...</p>', 3, 'published', CURRENT_TIMESTAMP);

-- 证书
INSERT INTO certificates (name, type, number, issuer) VALUES
('ISO 9001:2015', 'iso', 'ISO-2023-001', 'SGS'),
('CE Certification', 'ce', 'CE-2023-001', 'TUV'),
('ROHS Compliance', 'rohs', 'ROHS-2023-001', 'Intertek');

-- 首页 About 页面
INSERT INTO pages (title, slug, content, is_published, is_homepage) VALUES
('AutoParts B2B - Your Trusted Supplier', 'home', '<h1>Welcome to AutoParts B2B</h1><p>We are a professional auto parts supplier...</p>', true, true),
('About Us', 'about', '<h1>About Us</h1><p>Founded in 2010, we specialize in automotive parts...</p>', true, false),
('Contact Us', 'contact', '<h1>Contact Us</h1><p>Email: info@autoparts.com</p>', true, false);

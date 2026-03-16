# 🚗 AutoParts B2B Platform

> 专业汽车配件 B2B 外贸独立站系统

![Version](https://img.shields.io/badge/version-3.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)

## 📋 目录

- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [核心模块](#核心模块)
- [SEO 优化](#seo-优化)
- [API 文档](#api-文档)
- [部署指南](#部署指南)

---

## ✨ 功能特性

### 核心功能
- ✅ **产品管理系统** - 支持多语言、变体、属性
- ✅ **OEM 搜索** - 通过 OEM 编号查询产品
- ✅ **车型适配 (Fitment)** - 品牌→车型→年份→发动机
- ✅ **RFQ 询盘系统** - 完整询盘流程
- ✅ **多级分类** - 支持无限级分类
- ✅ **博客系统** - 内容营销

### SEO
- ✅ **SEO 友好 URL** - `/product/toyota-brake-pads`
- ✅ **Meta 标签** - title, description, keywords
- ✅ **Structured Data** - JSON-LD Product/Article
- ✅ **Sitemap** - 自动生成
- ✅ **Robots.txt** - 搜索引擎配置

### B2B 功能
- ✅ **批量报价** - Tier pricing
- ✅ **最小起订量** - MOQ
- ✅ **公司认证** - B2B 用户系统
- ✅ **询盘管理** - CRM 集成

### 技术
- ✅ **多语言** - 中文、英文、阿拉伯语 (RTL)
- ✅ **响应式** - 完美支持移动端
- ✅ **搜索** - Meilisearch 集成
- ✅ **缓存** - Redis 缓存
- ✅ **Docker** - 一键部署

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                │
│                    SSL Termination + Cache                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Frontend│   │  Admin  │   │ Backend │
   │  (Next) │   │  (Next) │   │ (Node)  │
   └────┬────┘   └────┬────┘   └────┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
        ┌─────────────┬─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │PostgreSQL│  │  Redis   │  │Meilisearch│
   │   (14)  │  │   (7)    │  │   (1.6)  │
   └─────────┘  └──────────┘  └──────────┘
```

---

## 📁 项目结构

```
autoparts-platform/

├── apps/
│   ├── web/                    # 前端网站 (Next.js 14)
│   │   ├── app/
│   │   │   ├── page.js         # 首页
│   │   │   ├── products/       # 产品页面
│   │   │   ├── oem-search/     # OEM 搜索
│   │   │   ├── fitment/        # 车型适配
│   │   │   ├── blog/           # 博客
│   │   │   └── rfq/            # 询盘
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   │
│   └── admin/                  # 后台管理 (Next.js 14)
│       ├── app/
│       │   ├── dashboard/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── oem/
│       │   ├── fitment/
│       │   ├── rfq/
│       │   ├── blog/
│       │   └── imports/
│       └── components/
│
├── services/                   # 微服务
│   ├── product-service/
│   ├── search-service/
│   ├── fitment-service/
│   ├── oem-service/
│   ├── rfq-service/
│   └── blog-service/
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── schema.sql
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.admin
│   │   └── Dockerfile.backend
│   └── nginx/
│       └── nginx.conf
│
└── scripts/
    ├── import-products.js
    ├── import-fitment.js
    └── import-oem.js
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/qingchen-boop/autoparts-store-full.git
cd autoparts-store-full

# 2. 启动基础设施
docker-compose -f docker/docker-compose.yml up -d postgres redis meilisearch

# 3. 安装前端依赖
cd frontend && npm install && npm run dev

# 4. 安装后端依赖 (新终端)
cd backend && npm install && npm run dev
```

### Docker 部署

```bash
# 生产环境部署
docker-compose -f docker/docker-compose.prod.yml up -d
```

---

## 🔧 核心模块

### 1. OEM 搜索系统

```javascript
// API: GET /api/v1/oem/search?number=0986AF
// 支持: 0986AF0021, 234-9001, 90915-YZZE1
```

**数据库查询:**
```sql
SELECT p.*, o.oem_number 
FROM products p
JOIN product_oem_map pom ON p.id = pom.product_id
JOIN oem_numbers o ON pom.oem_id = o.id
WHERE o.oem_number LIKE '%0986AF%'
```

### 2. Fitment 系统

```
用户流程:
1. 选择品牌 (Toyota)
2. 选择车型 (Camry)
3. 选择年份 (2020)
4. 选择发动机 (2.5L)
→ 显示适配产品
```

**数据库:**
- `vehicle_brands` - 品牌
- `vehicle_models` - 车型
- `vehicle_years` - 年份
- `vehicle_engines` - 发动机
- `product_vehicle_fitment` - 适配关系

### 3. RFQ 询盘系统

```
RFQ 流程:
1. 客户提交询盘 (产品/OEM/数量)
2. 管理员收到邮件通知
3. 管理员报价
4. 客户收到报价
5. 协商/成交
```

**数据库表:**
- `rfq_requests` - 询盘主表
- `rfq_items` - 询盘产品
- `rfq_quotes` - 报价
- `rfq_messages` - 沟通记录

---

## 🔍 SEO 优化

### URL 结构

| 页面 | URL |
|------|-----|
| 首页 | `/` |
| 分类 | `/brake-pads` |
| 子分类 | `/brake-pads/ceramic` |
| 产品 | `/product/toyota-camry-brake-pads` |
| OEM搜索 | `/oem-search` |
| 车型适配 | `/fitment/toyota/camry/2020` |
| 博客 | `/blog/how-to-choose-brake-pads` |
| 询盘 | `/rfq` |

### Meta 标签

```html
<title>Toyota Camry Brake Pads | AutoParts B2B</title>
<meta name="description" content="Premium ceramic brake pads for Toyota Camry. OEM: 04466-0R010. Compatible with 2015-2020 models.">
<meta name="keywords" content="brake pads, Toyota Camry, 04466-0R010, automotive parts">
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Toyota Camry Brake Pads",
  "description": "Premium ceramic brake pads...",
  "brand": { "@type": "Brand", "name": "Bosch" },
  "offers": {
    "@type": "Offer",
    "price": "45.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "gtin13": "4047024012345"
}
```

---

## 📚 API 文档

### 产品

```bash
# 获取产品
GET /api/v1/products?category=brake-pads&page=1&limit=20

# SEO slug
GET /api/v1/products/slug/toyota-camry-brake-pads

# 搜索
GET /api/v1/search?q=brake+pad&brand=Bosch
```

### OEM

```bash
# OEM 搜索
GET /api/v1/oem/search?number=04466
```

### Fitment

```bash
# 获取品牌
GET /api/v1/fitment/brands

# 车型适配产品
GET /api/v1/fitment/vehicles/toyota/camry/2020/products

# VIN 解码
POST /api/v1/fitment/decode-vin
{"vin": "1HGCM82633A123456"}
```

### RFQ

```bash
# 提交询盘
POST /api/v1/rfq
{
  "name": "John",
  "email": "john@company.com",
  "company": "Auto Parts Inc",
  "country": "USA",
  "items": [{"product_id": 1, "quantity": 500}]
}
```

---

## 🐳 部署

### 环境变量

```bash
# .env
DB_PASSWORD=Autoparts2024!
JWT_SECRET=your-secret-key
MEILI_KEY=autoparts-master-key
SITE_URL=https://autoparts.example.com
FRONTEND_URL=https://autoparts.example.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
OPENAI_API_KEY=sk-xxx
```

### Docker Compose

```bash
# 启动所有服务
docker-compose -f docker/docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker/docker-compose.prod.yml logs -f

# 停止
docker-compose -f docker/docker-compose.prod.yml down
```

### 端口映射

| 服务 | 端口 |
|------|------|
| Frontend | 3002 |
| Backend | 3001 |
| Admin | 3003 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Meilisearch | 7700 |
| Nginx | 80/443 |

---

## 📄 许可证

MIT License

---

## 👤 作者

AutoParts B2B Team

---

## 🔗 链接

- 🌐 网站: [autoparts.example.com](https://autoparts.example.com)
- 📦 GitHub: [qingchen-boop/autoparts-store-full](https://github.com/qingchen-boop/autoparts-store-full)
- 📧 邮箱: info@autoparts.example.com

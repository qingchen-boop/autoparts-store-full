const db = require('../db/db');

// Get product SEO data
exports.getProductSeo = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await db.query(`
      SELECT
        p.name, p.name_zh, p.name_ar, p.slug,
        p.meta_title, p.meta_description, p.meta_keywords,
        p.price, p.description, p.brand,
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];

    const seo = {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description?.substring(0, 160),
      keywords: product.meta_keywords || product.brand,
      canonical: `${process.env.SITE_URL}/products/${product.slug}`,
      og: {
        title: product.name,
        description: product.meta_description,
        image: product.image,
        url: `${process.env.SITE_URL}/products/${product.slug}`,
        type: 'product',
        price: product.price,
        currency: 'USD'
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.meta_description,
        brand: product.brand,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }
    };

    res.json(seo);
  } catch (error) {
    console.error('SEO error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

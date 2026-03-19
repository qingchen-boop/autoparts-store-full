'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { t, language } = useLanguage()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/products/${slug}`)
      const data = await res.json()
      if (data.success) {
        setProduct(data.data)
        if (data.data.variants?.length > 0) {
          setSelectedVariant(data.data.variants[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch product:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/v1/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          variantId: selectedVariant?.id
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(t('addedToCart') || 'Added to cart!')
      } else {
        alert(data.message || 'Failed to add to cart')
      }
    } catch (err) {
      alert('Please login to add items to cart')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>

  const images = [
    product.thumbnail_url,
    ...(product.images || []).map(i => i.url),
    ...(product.variants || []).map(v => v.image_url).filter(Boolean)
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/">Home</Link> /{' '}
          <Link href="/products">Products</Link> /{' '}
          <Link href={`/categories/${product.category_slug}`}>{product.category_name}</Link> /{' '}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <div className="h-96 flex items-center justify-center bg-gray-100">
                {images[activeImage] ? (
                  <img src={images[activeImage]} alt={product.name} className="max-h-full object-contain" />
                ) : (
                  <span className="text-8xl">🚗</span>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === i ? 'border-primary-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-gray-500 mb-1">{product.brand_name} | SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-primary-600">${selectedVariant?.price || product.price}</span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.compare_price}</span>
                  <span className="text-sm text-red-500">
                    {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <label className="block font-medium mb-2">Options:</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 border rounded-lg ${selectedVariant?.id === v.id ? 'border-primary-600 bg-primary-50' : ''}`}
                    >
                      {v.name} - ${v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-medium">✓ In Stock ({product.stock_quantity})</span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.short_description || product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="border rounded-lg px-4 py-2 w-24 text-center"
              />
              <button
                onClick={addToCart}
                disabled={product.stock_quantity <= 0}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {t('addToCart') || 'Add to Cart'}
              </button>
              <button className="px-4 py-3 border rounded-lg hover:bg-gray-50">♡ Wishlist</button>
            </div>

            <Link href="/rfq" className="text-primary-600 underline text-sm">
              Request bulk quote (RFQ) →
            </Link>
          </div>
        </div>

        {/* Vehicle Fitment */}
        {product.fitment && product.fitment.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Vehicle Fitment</h2>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Make</th>
                    <th className="px-4 py-3 text-left">Model</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-left">Engine</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {product.fitment.map((f, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-3">{f.make}</td>
                      <td className="px-4 py-3">{f.model}</td>
                      <td className="px-4 py-3">{f.year}</td>
                      <td className="px-4 py-3">{f.engine}</td>
                      <td className="px-4 py-3 text-gray-500">{f.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

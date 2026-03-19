'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ProductsPage() {
  const { t, language } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ brand: '', category: '', inStock: false, search: '' })
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchFilters()
  }, [page, filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (filters.brand) params.set('brand', filters.brand)
      if (filters.category) params.set('category', filters.category)
      if (filters.inStock) params.set('inStock', 'true')
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`${API_URL}/api/v1/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilters = async () => {
    try {
      const [brandsRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/brands`),
        fetch(`${API_URL}/api/v1/categories`)
      ])
      const brandsData = await brandsRes.json()
      const catsData = await catsRes.json()
      if (brandsData.success) setBrands(brandsData.data)
      if (catsData.success) setCategories(catsData.data)
    } catch (err) {
      console.error('Failed to fetch filters:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">{t('allProducts')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-8 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder={t('searchProducts') || 'Search products...'}
            className="border rounded-lg px-4 py-2 flex-1 min-w-[200px]"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.brand}
            onChange={(e) => setFilters(f => ({ ...f, brand: e.target.value }))}
          >
            <option value="">{t('allBrands') || 'All Brands'}</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">{t('allCategories') || 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters(f => ({ ...f, inStock: e.target.checked }))}
            />
            {t('inStock') || 'In Stock'}
          </label>
          <button
            onClick={() => { setPage(1); fetchProducts() }}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('applyFilters') || 'Apply'}
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🚗</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.brand_name} / {product.category_name}</p>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">${product.price}</span>
                    {product.stock_quantity > 0 ? (
                      <span className="text-xs text-green-600">✓ {t('inStock')}</span>
                    ) : (
                      <span className="text-xs text-red-500">{t('outOfStock')}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              ←
            </button>
            <span className="px-4 py-2">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

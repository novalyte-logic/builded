'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Package, Eye, EyeOff } from 'lucide-react'
import { MarketplaceProduct } from '@/lib/types/marketplace'

interface ProductListProps {
  onSelectProduct: (id: string) => void
  selectedProductId?: string | null
}

export default function ProductList({ onSelectProduct, selectedProductId }: ProductListProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    for_who: '',
    recurring: '',
    price_band: '',
    tag: '',
    search: '',
  })

  useEffect(() => {
    fetchProducts()
    const interval = setInterval(fetchProducts, 30000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.for_who) params.set('for_who', filters.for_who)
      if (filters.recurring) params.set('recurring', filters.recurring)
      if (filters.price_band) params.set('price_band', filters.price_band)
      if (filters.tag) params.set('tag', filters.tag)
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/marketplace?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInventoryColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-status-live'
      case 'low':
        return 'text-yellow-400'
      case 'out_of_stock':
        return 'text-status-offline'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-dark-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            <option value="Supplements">Supplements</option>
            <option value="Equipment">Equipment</option>
            <option value="Diagnostics">Diagnostics</option>
            <option value="Digital Health">Digital Health</option>
            <option value="Home Gym">Home Gym</option>
            <option value="Health Tech Devices">Health Tech Devices</option>
          </select>

          <select
            value={filters.for_who}
            onChange={(e) => setFilters({ ...filters, for_who: e.target.value })}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Audiences</option>
            <option value="Patient">Patient</option>
            <option value="Men's Clinic">Men's Clinic</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No products found</div>
        ) : (
          <div className="divide-y divide-dark-border">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className={`p-4 hover:bg-dark-hover cursor-pointer transition-colors ${
                  selectedProductId === product.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{product.name}</h4>
                  <div className="flex items-center gap-1">
                    {product.is_featured && (
                      <span className="text-xs text-primary">★</span>
                    )}
                    {!product.show_in_marketplace && (
                      <EyeOff className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-2">
                  {product.category} {product.subcategory && `• ${product.subcategory}`}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">
                    ${product.price.toFixed(2)}
                    {product.recurring && <span className="text-gray-500">/mo</span>}
                  </span>
                  <span className={getInventoryColor(product.inventory_status)}>
                    {product.inventory_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


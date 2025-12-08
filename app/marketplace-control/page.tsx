'use client'

import { useState } from 'react'
import { ShoppingBag, Plus, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import MarketplaceCategoryOverview from '@/components/marketplace/MarketplaceCategoryOverview'
import ProductList from '@/components/marketplace/ProductList'
import ProductEditor from '@/components/marketplace/ProductEditor'

export default function MarketplaceControlPage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeView, setActiveView] = useState<'categories' | 'products'>('categories')

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              Marketplace Control
            </h1>
            <p className="text-gray-400 mt-2">
              Full control panel for managing products, categories, SEO, and marketplace visibility
            </p>
          </div>
          <StatusBadge status="live" />
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">
              You are editing LIVE production data
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Changes sync immediately to app.novalyte.io. All edits are logged with audit trail.
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveView('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'categories'
              ? 'bg-primary text-white'
              : 'bg-dark-accent text-gray-300 hover:text-white'
          }`}
        >
          Category Overview
        </button>
        <button
          onClick={() => setActiveView('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'products'
              ? 'bg-primary text-white'
              : 'bg-dark-accent text-gray-300 hover:text-white'
          }`}
        >
          Product List
        </button>
      </div>

      {activeView === 'categories' ? (
        <MarketplaceCategoryOverview />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product List */}
          <div className="lg:col-span-1">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4">
              <button
                onClick={() => {
                  setShowCreate(true)
                  setSelectedProductId(null)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Product
              </button>
            </div>
            <ProductList
              onSelectProduct={(id) => {
                setSelectedProductId(id)
                setShowCreate(false)
              }}
              selectedProductId={selectedProductId}
            />
          </div>

          {/* Right: Editor */}
          <div className="lg:col-span-2">
            {showCreate ? (
              <ProductEditor
                productId={null}
                onSave={() => {
                  setShowCreate(false)
                  setSelectedProductId(null)
                }}
                onCancel={() => setShowCreate(false)}
              />
            ) : selectedProductId ? (
              <ProductEditor
                productId={selectedProductId}
                onSave={() => {
                  // Refresh list
                }}
                onCancel={() => setSelectedProductId(null)}
              />
            ) : (
              <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center h-full flex items-center justify-center">
                <div>
                  <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a product to edit or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


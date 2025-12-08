'use client'

import { useEffect, useState } from 'react'
import { X, Save, History, Copy, TrendingUp } from 'lucide-react'
import { MarketplaceProduct } from '@/lib/types/marketplace'
import Explainer from '../Explainer'
import VersionHistoryModal from '../VersionHistoryModal'
import { VersionHistory } from '@/lib/types/audit'

interface ProductEditorProps {
  productId: string | null
  onSave: () => void
  onCancel: () => void
}

export default function ProductEditor({ productId, onSave, onCancel }: ProductEditorProps) {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'seo' | 'performance'>('overview')
  const [formData, setFormData] = useState<Partial<MarketplaceProduct>>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    } else {
      // Initialize new product
      setFormData({
        category: 'Supplements',
        for_who: 'Both',
        price_band: '$',
        recurring: false,
        protocol_type: 'Baseline',
        inventory_status: 'in_stock',
        show_in_marketplace: true,
        is_featured: false,
        use_case_tags: [],
        recommended_stack_ids: [],
      })
    }
  }, [productId])

  const fetchProduct = async () => {
    if (!productId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/marketplace/${productId}`)
      if (!response.ok) throw new Error('Failed to fetch product')
      const data = await response.json()
      setProduct(data.product)
      setFormData(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const url = productId ? `/api/admin/marketplace/${productId}` : '/api/admin/marketplace'
      const method = productId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          create_version_snapshot: true,
          version_label: 'Manual update',
        }),
      })

      if (!response.ok) throw new Error('Failed to save product')

      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRevert = async (version: VersionHistory) => {
    try {
      // Restore from version snapshot
      const snapshot = version.snapshot_json as MarketplaceProduct
      setFormData(snapshot)

      // Save the reverted version
      const response = await fetch(`/api/admin/marketplace/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...snapshot,
          create_version_snapshot: true,
          version_label: `Reverted to version ${version.version_number}`,
          reason: `Reverted to version ${version.version_number}${version.label ? ` (${version.label})` : ''}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to revert product')

      await fetchProduct()
      alert(`Product reverted to version ${version.version_number}`)
    } catch (error) {
      console.error('Error reverting product:', error)
      alert('Failed to revert product. Please try again.')
    }
  }

  const handleClone = async () => {
    if (!product) return

    try {
      const cloned = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy`,
        id: undefined,
      }

      const response = await fetch('/api/admin/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloned),
      })

      if (!response.ok) throw new Error('Failed to clone product')

      alert('Product cloned successfully!')
      onSave() // Refresh list
    } catch (error) {
      console.error('Error cloning product:', error)
      alert('Failed to clone product. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading product...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {productId ? `Edit: ${product?.name || 'Product'}` : 'Create New Product'}
            </h2>
            {product && (
              <p className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(product.updated_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border">
          {(['overview', 'details', 'seo', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-3xl">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="auto-generated"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category *</label>
                  <select
                    value={formData.category || 'Supplements'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Supplements">Supplements</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Digital Health">Digital Health</option>
                    <option value="Home Gym">Home Gym</option>
                    <option value="Health Tech Devices">Health Tech Devices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value || null })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">For Who *</label>
                  <select
                    value={formData.for_who || 'Both'}
                    onChange={(e) => setFormData({ ...formData, for_who: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Men's Clinic">Men&apos;s Clinic</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Brief product description..."
                />
              </div>
            </div>

            {/* Status Controls */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status & Visibility</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price Band</label>
                  <select
                    value={formData.price_band || '$'}
                    onChange={(e) => setFormData({ ...formData, price_band: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Inventory Status</label>
                  <select
                    value={formData.inventory_status || 'in_stock'}
                    onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="preorder">Preorder</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_marketplace ?? true}
                    onChange={(e) => setFormData({ ...formData, show_in_marketplace: e.target.checked })}
                    className="w-4 h-4 bg-dark-accent border-dark-border rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">Show in Marketplace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured ?? false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 bg-dark-accent border-dark-border rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recurring ?? false}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="w-4 h-4 bg-dark-accent border-dark-border rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">Recurring</span>
                </label>
              </div>
            </div>

            {/* Use Case Tags */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Use Case Tags</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.use_case_tags || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    use_case_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="TRT, GLP-1, Longevity, Recovery"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Long Description</label>
              <textarea
                value={formData.long_description || ''}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                rows={8}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Rich text description of the product..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Vendor Name</label>
              <input
                type="text"
                value={formData.vendor_name || ''}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Vendor Email</label>
              <input
                type="email"
                value={formData.vendor_contact_email || ''}
                onChange={(e) => setFormData({ ...formData, vendor_contact_email: e.target.value || null })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4">SEO & Discovery</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.seo_title || ''}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value || null })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Optimized page title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
              <textarea
                value={formData.seo_meta_description || ''}
                onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value || null })}
                rows={3}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="SEO meta description (150-160 characters)"
              />
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </h3>
            {product?.metrics_snapshot_json ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Impressions</p>
                  <p className="text-xl font-semibold text-white">
                    {product.metrics_snapshot_json.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Detail Views</p>
                  <p className="text-xl font-semibold text-white">
                    {product.metrics_snapshot_json.product_detail_views.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">CTR</p>
                  <p className="text-xl font-semibold text-white">
                    {(product.metrics_snapshot_json.ctr * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">AI Attach Rate</p>
                  <p className="text-xl font-semibold text-white">
                    {(product.metrics_snapshot_json.attach_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Performance data not available yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
              {productId && (
              <>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                Version History
              </button>
              <button
                onClick={handleClone}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Clone
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Version History Modal */}
      {productId && (
        <VersionHistoryModal
          entityType="MarketplaceProduct"
          entityId={productId}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRevert={handleRevert}
        />
      )}
    </div>
  )
}


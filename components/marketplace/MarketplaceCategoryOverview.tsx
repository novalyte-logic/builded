'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { AdminCategory } from '@/lib/types/marketplace'
import Explainer from '../Explainer'

type InlineEdit = {
  id: string
  value: number
}

export default function MarketplaceCategoryOverview() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<InlineEdit | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN

  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.priority - b.priority),
    [categories]
  )

  useEffect(() => {
    fetchCategories()
    const interval = setInterval(fetchCategories, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/marketplace/categories', {
        headers: adminToken ? { 'x-novalyte-admin': adminToken } : undefined,
      })
      if (!res.ok) throw new Error('Failed to load categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Unable to load categories right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isVisible: !isVisible } : c)))
    try {
      const res = await fetch(`/api/admin/marketplace/categories/${id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-novalyte-admin': adminToken } : {}),
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      })
      if (!res.ok) throw new Error('Failed to update visibility')
      const data = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)))
    } catch (err) {
      console.error(err)
      setError('Failed to toggle visibility. Reverted change.')
      // revert
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isVisible } : c)))
    }
  }

  const handlePriorityCommit = async (id: string, value: number) => {
    setSavingId(id)
    const previous = categories.find((c) => c.id === id)
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, priority: value } : c)))
    try {
      const res = await fetch(`/api/admin/marketplace/categories/${id}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-novalyte-admin': adminToken } : {}),
        },
        body: JSON.stringify({ priority: value }),
      })
      if (!res.ok) throw new Error('Failed to update priority')
      const data = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)))
    } catch (err) {
      console.error(err)
      setError('Failed to update priority. Reverted change.')
      if (previous) {
        setCategories((prev) => prev.map((c) => (c.id === id ? previous : c)))
      }
    } finally {
      setSavingId(null)
      setEditing(null)
    }
  }

  const skeletonRows = Array.from({ length: 6 })

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-xl font-semibold text-white">Category Overview</h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage category visibility, priority order, and view performance metrics
        </p>
        {error && <p className="text-xs text-status-offline mt-2">{error}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Add-to-Stack
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visibility
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading
              ? skeletonRows.map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-10 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-14 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 bg-dark-border rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-8 bg-dark-border rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              : sortedCategories.map((category) => {
                  const isEditing = editing?.id === category.id
                  return (
                    <tr key={category.id} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {category.productCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {category.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {(category.ctr * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {(category.addToStack * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {isEditing ? (
                          <input
                            autoFocus
                            type="number"
                            defaultValue={category.priority}
                            className="w-16 bg-dark-accent border border-dark-border rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary"
                            onBlur={(e) => handlePriorityCommit(category.id, Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePriorityCommit(category.id, Number((e.target as HTMLInputElement).value))
                              }
                              if (e.key === 'Escape') setEditing(null)
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => setEditing({ id: category.id, value: category.priority })}
                            className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-white"
                            disabled={savingId === category.id}
                          >
                            {savingId === category.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              category.priority
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Explainer
                          title="Category Visibility"
                          what="Toggle whether this category appears on the public marketplace."
                          why="Control which product categories are visible to users."
                          how={[
                            'Click to toggle visibility',
                            'Hidden categories remain accessible via direct links',
                            'Useful for seasonal or testing categories',
                          ]}
                        >
                          <button
                            onClick={() => handleToggleVisibility(category.id, category.isVisible)}
                            className={`p-2 rounded-lg transition-colors ${
                              category.isVisible
                                ? 'bg-status-live/20 text-status-live hover:bg-status-live/30'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }`}
                            disabled={savingId === category.id}
                          >
                            {savingId === category.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : category.isVisible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        </Explainer>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


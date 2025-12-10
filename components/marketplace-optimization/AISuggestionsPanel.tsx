'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkles, Check, X, Edit, RefreshCw, AlertCircle, Loader2, PanelRightOpen } from 'lucide-react'
import { MarketplaceOptimizationSuggestion } from '@/lib/types/marketplace-optimization'
import Explainer from '../Explainer'

export default function AISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<MarketplaceOptimizationSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/marketplace/ai/suggestions', {
        headers: adminToken ? { 'x-novalyte-admin': adminToken } : undefined,
      })
      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      if (data.lastScan) setLastScan(data.lastScan)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (suggestionId: string) => {
    setActionLoading(suggestionId)
    try {
      const response = await fetch(`/api/admin/marketplace/ai/suggestions/${suggestionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-novalyte-admin': adminToken } : {}),
        },
      })

      if (!response.ok) throw new Error('Failed to apply suggestion')

      await fetchSuggestions()
    } catch (error) {
      console.error('Error applying suggestion:', error)
    }
    setActionLoading(null)
  }

  const handleReject = async (suggestionId: string) => {
    setActionLoading(suggestionId)
    try {
      const response = await fetch(`/api/admin/marketplace/ai/suggestions/${suggestionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-novalyte-admin': adminToken } : {}),
        },
      })

      if (!response.ok) throw new Error('Failed to dismiss suggestion')

      await fetchSuggestions()
    } catch (error) {
      console.error('Error dismissing suggestion:', error)
    }
    setActionLoading(null)
  }

  const handleGenerateNew = async () => {
    try {
      const response = await fetch('/api/admin/marketplace/ai/suggestions', {
        method: 'POST',
        headers: adminToken ? { 'x-novalyte-admin': adminToken } : undefined,
      })

      if (!response.ok) throw new Error('Failed to generate suggestions')

      await fetchSuggestions()
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'boost_visibility':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'demote':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'attach_to_assessment':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'create_bundle':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'attach_to_clinic':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'boost_visibility':
        return 'Boost Visibility'
      case 'demote':
        return 'Demote'
      case 'attach_to_assessment':
        return 'Attach to Assessment'
      case 'attach_to_clinic':
        return 'Attach to Clinic'
      case 'create_bundle':
        return 'Create Bundle'
      default:
        return type
    }
  }

  const selected = useMemo(() => suggestions.find((s) => s.id === selectedId), [selectedId, suggestions])

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Optimization Suggestions
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {suggestions.length} pending suggestion{suggestions.length !== 1 ? 's' : ''}
            </p>
            {lastScan && (
              <p className="text-xs text-gray-500">Last AI Scan: {new Date(lastScan).toLocaleString()}</p>
            )}
          </div>
          <Explainer
            title="Generate New Suggestions"
            what="Run the AI optimization engine to generate new suggestions based on current marketplace performance."
            why="Get fresh recommendations as marketplace behavior evolves."
            how={['Click to trigger AI analysis', 'Engine analyzes recent performance data', 'New suggestions appear in the panel']}
          >
            <button
              onClick={handleGenerateNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Run AI Scan Now
            </button>
          </Explainer>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <div className="text-gray-400">Loading suggestions...</div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No pending suggestions</p>
          <button
            onClick={handleGenerateNew}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Generate Suggestions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-dark-surface border border-dark-border rounded-lg p-6"
              onClick={() => setSelectedId(suggestion.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getTypeBadgeColor(suggestion.suggestionType)}`}>
                    {getTypeLabel(suggestion.suggestionType)}
                  </span>
                  <span className="text-sm text-gray-400">{suggestion.productName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Explainer
                    title="Impact Estimate"
                    what={`Expected revenue impact: $${suggestion.expectedRevenueImpact.toLocaleString()}`}
                    why="Prioritize suggestions with higher impact scores for maximum optimization."
                    how={['Higher score = greater potential impact', 'Focus on largest lifts first']}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-dark-accent rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(10, suggestion.expectedRevenueImpact / 300))}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">
                        {`$${Math.round(suggestion.expectedRevenueImpact / 1000)}k`}
                      </span>
                    </div>
                  </Explainer>
                </div>
              </div>

              {/* Rationale */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">{suggestion.reasoning}</p>
                {suggestion.attachTargets?.length ? (
                  <p className="text-xs text-gray-400 mt-2">Targets: {suggestion.attachTargets.join(', ')}</p>
                ) : null}
                {suggestion.bundleComponents?.length ? (
                  <p className="text-xs text-gray-400 mt-1">
                    Bundle components: {suggestion.bundleComponents.join(', ')}
                  </p>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApprove(suggestion.id)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-status-live/20 text-status-live border border-status-live/30 rounded-lg hover:bg-status-live/30 transition-colors text-sm"
                  disabled={actionLoading === suggestion.id}
                >
                  {actionLoading === suggestion.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReject(suggestion.id)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
                  disabled={actionLoading === suggestion.id}
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit Then Apply
                </button>
                <div className="ml-auto text-xs text-gray-500 flex items-center gap-2">
                  <PanelRightOpen className="w-4 h-4" />
                  View reasoning
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">AI Reasoning</p>
              <h3 className="text-lg text-white font-semibold">{selected.productName}</h3>
              <p className="text-sm text-gray-400">{getTypeLabel(selected.suggestionType)}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{selected.reasoning}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <div className="p-3 rounded-lg bg-dark-accent border border-dark-border">
              <p className="text-xs text-gray-400">Expected revenue lift</p>
              <p className="text-white font-semibold">
                ${selected.expectedRevenueImpact.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-dark-accent border border-dark-border">
              <p className="text-xs text-gray-400">Targets / Cohorts</p>
              <p className="text-white">
                {selected.attachTargets?.length ? selected.attachTargets.join(', ') : 'General'}
              </p>
            </div>
          </div>
          {selected.bundleComponents?.length ? (
            <div className="mt-3 text-sm text-gray-300">
              Bundle Components: {selected.bundleComponents.join(', ')}
            </div>
          ) : null}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => handleApprove(selected.id)}
              className="flex items-center gap-2 px-4 py-2 bg-status-live/20 text-status-live border border-status-live/30 rounded-lg hover:bg-status-live/30 transition-colors text-sm"
              disabled={actionLoading === selected.id}
            >
              {actionLoading === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => handleReject(selected.id)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              disabled={actionLoading === selected.id}
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


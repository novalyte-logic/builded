'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Check, X, Edit, RefreshCw, AlertCircle } from 'lucide-react'
import { MarketplaceOptimizationSuggestion } from '@/lib/types/marketplace-optimization'
import Explainer from '../Explainer'

export default function AISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<MarketplaceOptimizationSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
    const interval = setInterval(fetchSuggestions, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/marketplace-optimization/suggestions?status=PENDING')
      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/admin/marketplace-optimization/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply' }),
      })

      if (!response.ok) throw new Error('Failed to apply suggestion')

      await fetchSuggestions()
      alert('Suggestion applied successfully!')
    } catch (error) {
      console.error('Error applying suggestion:', error)
      alert('Failed to apply suggestion. Please try again.')
    }
  }

  const handleDismiss = async (suggestionId: string) => {
    if (!confirm('Dismiss this suggestion? It will be hidden from future views.')) return

    try {
      const response = await fetch(`/api/admin/marketplace-optimization/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      })

      if (!response.ok) throw new Error('Failed to dismiss suggestion')

      await fetchSuggestions()
    } catch (error) {
      console.error('Error dismissing suggestion:', error)
      alert('Failed to dismiss suggestion. Please try again.')
    }
  }

  const handleGenerateNew = async () => {
    try {
      const response = await fetch('/api/admin/marketplace-optimization/suggestions', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to generate suggestions')

      const data = await response.json()
      await fetchSuggestions()
      alert(`Generated ${data.suggestions?.length || 0} new suggestions`)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      alert('Failed to generate suggestions. Please try again.')
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'FEATURE_PRODUCT':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'DOWNRANK_PRODUCT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'REORDER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'CREATE_STACK':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'CATEGORY_PRIORITY_CHANGE':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FEATURE_PRODUCT':
        return 'Feature'
      case 'DOWNRANK_PRODUCT':
        return 'Downrank'
      case 'REORDER':
        return 'Reorder'
      case 'CREATE_STACK':
        return 'Create Stack'
      case 'CATEGORY_PRIORITY_CHANGE':
        return 'Category Priority'
      default:
        return type
    }
  }

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
              Generate New Suggestions
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
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getTypeBadgeColor(suggestion.type)}`}>
                    {getTypeLabel(suggestion.type)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {suggestion.target_entity_type}: {suggestion.target_id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Impact Score */}
                  <Explainer
                    title="Impact Estimate"
                    what={`Estimated impact score: ${suggestion.impact_estimate_score}/100. Higher scores indicate greater potential revenue impact.`}
                    why="Prioritize suggestions with higher impact scores for maximum optimization."
                    how={['Higher score = greater potential impact', 'Focus on 70+ scores first', 'Lower scores may still be valuable']}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-dark-accent rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${suggestion.impact_estimate_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">
                        {suggestion.impact_estimate_score}
                      </span>
                    </div>
                  </Explainer>
                </div>
              </div>

              {/* Rationale */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">{suggestion.rationale_text}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
                <button
                  onClick={() => handleApply(suggestion.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-status-live/20 text-status-live border border-status-live/30 rounded-lg hover:bg-status-live/30 transition-colors text-sm"
                >
                  <Check className="w-4 h-4" />
                  Apply Change
                </button>
                <button
                  onClick={() => handleDismiss(suggestion.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit Then Apply
                </button>
              </div>

              {/* Metadata */}
              {suggestion.metadata && Object.keys(suggestion.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-border">
                  <p className="text-xs text-gray-400">
                    Additional context: {JSON.stringify(suggestion.metadata, null, 2)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


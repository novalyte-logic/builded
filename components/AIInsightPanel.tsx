'use client'

import { useEffect, useState } from 'react'
import { Brain, AlertTriangle, TrendingUp, MapPin } from 'lucide-react'

interface AIInsightPanelProps {
  insightType: 'score_lead' | 'recommend_channels' | 'weekly_brief'
  inputData?: any
  autoRefresh?: boolean
}

export default function AIInsightPanel({
  insightType,
  inputData,
  autoRefresh = true,
}: AIInsightPanelProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: insightType,
          data: inputData,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`)
      }

      const result = await response.json()
      setInsights(result)
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights')
      console.error('AI insights error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()

    if (autoRefresh) {
      const interval = setInterval(fetchInsights, 300000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [insightType, JSON.stringify(inputData), autoRefresh])

  if (loading && !insights) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm text-gray-400">Generating AI insights...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2 text-status-offline">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Error: {error}</span>
        </div>
      </div>
    )
  }

  if (!insights) return null

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">Gemini AI Insights</h3>
      </div>
      {/* Render insights based on type */}
      <div className="text-sm text-gray-300">{JSON.stringify(insights, null, 2)}</div>
    </div>
  )
}


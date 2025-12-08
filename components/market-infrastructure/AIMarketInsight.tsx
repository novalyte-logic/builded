'use client'

import { Brain, TrendingUp, FileText, ShoppingBag, Sparkles } from 'lucide-react'

interface MarketInsight {
  insight: string
  type: 'opportunity' | 'warning' | 'performance'
}

interface AIMarketInsightProps {
  insights: MarketInsight[]
  timeRange: '7d' | '30d' | '90d'
  onBoostCategory?: () => void
  onCreateBlog?: () => void
  onOfferBundle?: () => void
}

export default function AIMarketInsight({
  insights,
  timeRange,
  onBoostCategory,
  onCreateBlog,
  onOfferBundle,
}: AIMarketInsightProps) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-status-live/10 border-status-live/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'performance':
        return 'bg-primary/10 border-primary/30'
      default:
        return 'bg-dark-accent border-dark-border'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'warning':
        return <Sparkles className="w-4 h-4 text-yellow-400" />
      case 'performance':
        return <Brain className="w-4 h-4 text-primary" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 flex flex-col" style={{ minHeight: '600px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">AI Read on Men&apos;s Health Marketplace</h3>
      </div>

      <div className="text-xs text-gray-400 mb-4">
        Analysis based on last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
      </div>

      {/* Insights */}
      <div className="space-y-3 mb-6 flex-1 overflow-y-auto">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getInsightColor(item.type)}`}
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(item.type)}
              <p className="text-sm text-gray-200 leading-relaxed">{item.insight}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-dark-border space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
        <button
          onClick={onBoostCategory}
          className="w-full flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          Boost This Category in UI
        </button>
        <button
          onClick={onCreateBlog}
          className="w-full flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <FileText className="w-4 h-4" />
          Create Blog Angle Around This Product
        </button>
        <button
          onClick={onOfferBundle}
          className="w-full flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Offer Clinic Bundle Pricing
        </button>
      </div>
    </div>
  )
}


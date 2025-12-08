'use client'

import { useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import LivePerformanceOverview from '@/components/marketplace-optimization/LivePerformanceOverview'
import AISuggestionsPanel from '@/components/marketplace-optimization/AISuggestionsPanel'

export default function MarketplaceOptimizationPage() {
  const [activeView, setActiveView] = useState<'performance' | 'suggestions'>('performance')

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8" />
              Marketplace AI Optimization Engine
            </h1>
            <p className="text-gray-400 mt-2">
              AI-powered insights to optimize product positioning, featuring, and bundling for maximum revenue impact
            </p>
          </div>
          <StatusBadge status="live" />
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">
              AI Suggestions Require Superadmin Approval
            </p>
            <p className="text-xs text-gray-400 mt-1">
              All optimization suggestions are reviewed before applying. No automatic changes are made to live marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveView('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'performance'
              ? 'bg-primary text-white'
              : 'bg-dark-accent text-gray-300 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Live Performance Overview
        </button>
        <button
          onClick={() => setActiveView('suggestions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'suggestions'
              ? 'bg-primary text-white'
              : 'bg-dark-accent text-gray-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Suggestions
        </button>
      </div>

      {/* Content */}
      {activeView === 'performance' ? (
        <LivePerformanceOverview />
      ) : (
        <AISuggestionsPanel />
      )}
    </div>
  )
}


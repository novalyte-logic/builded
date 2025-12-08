'use client'

import { Brain, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface ForecastNarrativeProps {
  scenario: 'optimistic' | 'base' | 'downside'
  forecast: {
    revenue30d: number
    revenue60d: number
    revenue90d: number
    growthRate: number
    keyInsights: string[]
    risks: string[]
    opportunities: string[]
  }
}

export default function ForecastNarrative({ scenario, forecast }: ForecastNarrativeProps) {
  const scenarioColors = {
    optimistic: 'border-status-live bg-status-live/10',
    base: 'border-primary bg-primary/10',
    downside: 'border-status-offline bg-status-offline/10',
  }

  return (
    <div className={`border rounded-lg p-6 ${scenarioColors[scenario]}`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">AI-Generated Forecast Summary</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Revenue Projections</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-dark-accent rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">30 Days</p>
              <p className="text-sm font-bold text-white">${(forecast.revenue30d / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-dark-accent rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">60 Days</p>
              <p className="text-sm font-bold text-white">${(forecast.revenue60d / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-dark-accent rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">90 Days</p>
              <p className="text-sm font-bold text-white">${(forecast.revenue90d / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-status-live" />
            <h4 className="text-xs font-medium text-gray-400">Key Insights</h4>
          </div>
          <ul className="space-y-1">
            {forecast.keyInsights.map((insight, idx) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-status-live mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {forecast.opportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium text-gray-400">Opportunities</h4>
            </div>
            <ul className="space-y-1">
              {forecast.opportunities.map((opp, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {forecast.risks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-status-degraded" />
              <h4 className="text-xs font-medium text-gray-400">Risks</h4>
            </div>
            <ul className="space-y-1">
              {forecast.risks.map((risk, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-status-degraded mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import { Zap, TrendingUp, TrendingDown, Pause, RefreshCw, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AutopilotAction {
  id: string
  timestamp: Date
  type: 'budget_scale' | 'budget_throttle' | 'budget_kill' | 'creative_pause' | 'creative_rotate' | 'budget_reallocate'
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  reason: string
  dataUsed: string[]
  forecastImpact: {
    revenue: number
    spend: number
    netProfit: number
    timeframe: string
  }
  riskRating: 'low' | 'medium' | 'high'
  status: 'executed' | 'pending' | 'rejected'
  mode: 'assist' | 'copilot' | 'full'
}

interface AutopilotActionLogProps {
  actions: AutopilotAction[]
}

export default function AutopilotActionLog({ actions }: AutopilotActionLogProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'budget_scale':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'budget_throttle':
      case 'budget_kill':
        return <TrendingDown className="w-4 h-4 text-status-offline" />
      case 'creative_pause':
        return <Pause className="w-4 h-4 text-yellow-400" />
      case 'creative_rotate':
        return <RefreshCw className="w-4 h-4 text-primary" />
      case 'budget_reallocate':
        return <Zap className="w-4 h-4 text-primary" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'text-status-live bg-status-live/20 border-status-live/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-6 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white">Autopilot Action Log</h3>
      </div>
      <div className="divide-y divide-dark-border max-h-[600px] overflow-y-auto">
        {actions.map((action) => (
          <div key={action.id} className="p-6 hover:bg-dark-hover transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1">{getActionIcon(action.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {action.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300 uppercase">
                    {action.platform}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(action.riskRating)}`}>
                    {action.riskRating} risk
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    action.status === 'executed'
                      ? 'bg-status-live/20 text-status-live'
                      : action.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-status-offline/20 text-status-offline'
                  }`}>
                    {action.status}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {action.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{action.reason}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Forecast Revenue</p>
                    <p className="text-sm font-medium text-status-live">
                      {formatCurrency(action.forecastImpact.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Forecast Spend</p>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(action.forecastImpact.spend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Net Profit</p>
                    <p className="text-sm font-medium text-status-live">
                      {formatCurrency(action.forecastImpact.netProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Timeframe</p>
                    <p className="text-sm font-medium text-white">{action.forecastImpact.timeframe}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-dark-border">
                  <p className="text-xs text-gray-400 mb-1">Data Used:</p>
                  <div className="flex flex-wrap gap-2">
                    {action.dataUsed.map((data, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-dark-accent border border-dark-border rounded text-gray-300"
                      >
                        {data}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


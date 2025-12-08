'use client'

import { TrendingUp, TrendingDown, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface ScalingAction {
  id: string
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  action: 'scale_up' | 'scale_down' | 'freeze' | 'kill' | 'throttle'
  magnitude: 'micro' | 'medium' | 'hard'
  amount: number
  reason: string
  confidence: number
  timestamp: Date
  status: 'pending' | 'executed' | 'rejected'
  impact?: {
    expectedRevenue: number
    expectedSpend: number
    expectedROI: number
  }
}

interface BudgetScalingActionProps {
  action: ScalingAction
  onExecute?: (id: string) => void
  onReject?: (id: string) => void
}

export default function BudgetScalingAction({ action, onExecute, onReject }: BudgetScalingActionProps) {
  const getActionIcon = () => {
    switch (action.action) {
      case 'scale_up':
        return <TrendingUp className="w-5 h-5 text-status-live" />
      case 'scale_down':
      case 'throttle':
        return <TrendingDown className="w-5 h-5 text-status-degraded" />
      case 'freeze':
        return <Pause className="w-5 h-5 text-yellow-400" />
      case 'kill':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const getMagnitudeColor = () => {
    switch (action.magnitude) {
      case 'hard':
        return 'border-red-500/30 bg-red-500/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-status-live/30 bg-status-live/10'
    }
  }

  const getActionLabel = () => {
    const labels = {
      scale_up: 'Scale Up',
      scale_down: 'Scale Down',
      freeze: 'Freeze',
      kill: 'Kill',
      throttle: 'Throttle',
    }
    return labels[action.action]
  }

  const getMagnitudeLabel = () => {
    const amounts = {
      micro: '5-10%',
      medium: '15-30%',
      hard: '50%+',
    }
    return amounts[action.magnitude]
  }

  return (
    <div className={`border rounded-lg p-4 ${getMagnitudeColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {getActionIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white uppercase">
                {getActionLabel()}
              </span>
              <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300">
                {action.platform}
              </span>
              <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300">
                {getMagnitudeLabel()}
              </span>
              {action.status === 'executed' && (
                <CheckCircle2 className="w-4 h-4 text-status-live" />
              )}
            </div>
            <p className="text-xs text-gray-300 mb-2">{action.reason}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400">
                Amount: <span className="text-white font-medium">{formatCurrency(Math.abs(action.amount))}</span>
              </span>
              <span className="text-gray-400">
                Confidence: <span className="text-white font-medium">{(action.confidence * 100).toFixed(0)}%</span>
              </span>
              <span className="text-gray-500">
                {action.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {action.impact && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Expected Revenue</p>
              <p className="text-status-live font-medium">{formatCurrency(action.impact.expectedRevenue)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Expected Spend</p>
              <p className="text-white font-medium">{formatCurrency(action.impact.expectedSpend)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Expected ROI</p>
              <p className="text-status-live font-medium">{action.impact.expectedROI.toFixed(2)}x</p>
            </div>
          </div>
        </div>
      )}

      {action.status === 'pending' && onExecute && onReject && (
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-2">
          <button
            onClick={() => onExecute(action.id)}
            className="flex-1 px-3 py-2 bg-status-live text-white rounded-lg hover:bg-status-live/80 transition-colors text-xs font-medium"
          >
            Execute
          </button>
          <button
            onClick={() => onReject(action.id)}
            className="flex-1 px-3 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-xs font-medium"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}


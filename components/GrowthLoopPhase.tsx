'use client'

import { Activity, Brain, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface PhaseData {
  id: string
  phase: 1 | 2 | 3 | 4
  name: string
  status: 'active' | 'processing' | 'complete'
  metrics: {
    label: string
    value: string | number
    change?: number
  }[]
  insights: string[]
  nextPhaseSignal?: string
}

interface GrowthLoopPhaseProps {
  data: PhaseData
  nextPhase?: PhaseData | null
}

export default function GrowthLoopPhase({ data, nextPhase }: GrowthLoopPhaseProps) {
  const phaseConfig = {
    1: {
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Traffic Ingestion',
    },
    2: {
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      label: 'Data Digestion',
    },
    3: {
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      label: 'Optimization',
    },
    4: {
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      label: 'Scale',
    },
  }

  const config = phaseConfig[data.phase]
  const Icon = config.icon

  return (
    <div className={`border rounded-lg p-6 ${config.border} ${config.bg}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-dark-accent ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Phase {data.phase}: {config.label}
            </h3>
            <p className="text-xs text-gray-400 mt-1">{data.name}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.status === 'active' 
            ? 'bg-status-live/20 text-status-live' 
            : data.status === 'processing'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {data.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className="bg-dark-accent rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-bold text-white">
                {typeof metric.value === 'number' && metric.value > 1000
                  ? formatNumber(metric.value)
                  : metric.value}
              </p>
              {metric.change !== undefined && (
                <span className={`text-xs ${
                  metric.change >= 0 ? 'text-status-live' : 'text-status-offline'
                }`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.insights.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 mb-2">Key Insights:</p>
          <ul className="space-y-1">
            {data.insights.map((insight, idx) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className={`${config.color} mt-1`}>•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.nextPhaseSignal && (
        <div className="mt-4 pt-4 border-t border-dark-border flex items-center gap-2">
          <span className="text-xs text-gray-400">Signal to Phase {data.phase + 1}:</span>
          <span className="text-xs text-white font-medium">{data.nextPhaseSignal}</span>
          {nextPhase && (
            <ArrowRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      )}
    </div>
  )
}


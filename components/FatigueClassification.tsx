'use client'

import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

export type FatigueLevel = 'green' | 'yellow' | 'orange' | 'red'

interface FatigueClassificationProps {
  level: FatigueLevel
  creativeName: string
  platform: 'google' | 'tiktok' | 'meta'
  signals: {
    ctrDecay: number
    cpmInflation: number
    frequency: number
    engagementDecay: number
  }
  score: number
}

export default function FatigueClassification({
  level,
  creativeName,
  platform,
  signals,
  score,
}: FatigueClassificationProps) {
  const levelConfig = {
    green: {
      color: 'text-status-live',
      bg: 'bg-status-live/20',
      border: 'border-status-live/30',
      icon: CheckCircle2,
      label: 'Fresh & Converting',
    },
    yellow: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      icon: Clock,
      label: 'Early Decay',
    },
    orange: {
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
      label: 'Fatigue Onset',
    },
    red: {
      color: 'text-status-offline',
      bg: 'bg-status-offline/20',
      border: 'border-status-offline/30',
      icon: XCircle,
      label: 'Creative Dead',
    },
  }

  const config = levelConfig[level]
  const Icon = config.icon

  return (
    <div className={`border rounded-lg p-4 ${config.border} ${config.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{creativeName}</span>
              <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300 uppercase">
                {platform}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color} ${config.bg}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs mt-2">
              <div>
                <span className="text-gray-400">Fatigue Score: </span>
                <span className={`font-medium ${config.color}`}>{score}/100</span>
              </div>
              <div>
                <span className="text-gray-400">CTR Decay: </span>
                <span className={`font-medium ${signals.ctrDecay > 0 ? 'text-status-offline' : 'text-status-live'}`}>
                  {signals.ctrDecay > 0 ? '+' : ''}{signals.ctrDecay.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">CPM Inflation: </span>
                <span className={`font-medium ${signals.cpmInflation > 0 ? 'text-status-offline' : 'text-status-live'}`}>
                  {signals.cpmInflation > 0 ? '+' : ''}{signals.cpmInflation.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Frequency: </span>
                <span className="font-medium text-white">{signals.frequency.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dark-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Engagement Decay</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-dark-accent rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  signals.engagementDecay > 0.15
                    ? 'bg-status-offline'
                    : signals.engagementDecay > 0.08
                    ? 'bg-orange-500'
                    : signals.engagementDecay > 0.03
                    ? 'bg-yellow-500'
                    : 'bg-status-live'
                }`}
                style={{ width: `${Math.min(signals.engagementDecay * 500, 100)}%` }}
              />
            </div>
            <span className={`font-medium ${
              signals.engagementDecay > 0.15 ? 'text-status-offline' : 
              signals.engagementDecay > 0.08 ? 'text-orange-400' : 
              signals.engagementDecay > 0.03 ? 'text-yellow-400' : 'text-status-live'
            }`}>
              {(signals.engagementDecay * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


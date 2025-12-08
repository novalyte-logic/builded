'use client'

import StatusBadge from './StatusBadge'
import { Power, RefreshCw, Settings } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface AIModuleCardProps {
  name: string
  status: 'live' | 'degraded' | 'offline'
  queries24h: number
  avgLatency: number
  accuracy: number
  driftScore: number
  onRestart?: () => void
  onConfigure?: () => void
}

export default function AIModuleCard({
  name,
  status,
  queries24h,
  avgLatency,
  accuracy,
  driftScore,
  onRestart,
  onConfigure,
}: AIModuleCardProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold text-white">{name}</h3>
            <StatusBadge status={status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Queries (24h)</p>
              <p className="text-sm font-medium text-white">{formatNumber(queries24h)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Avg Latency</p>
              <p className="text-sm font-medium text-white">{avgLatency}ms</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Accuracy</p>
              <p className="text-sm font-medium text-white">{(accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Drift Score</p>
              <p
                className={`text-sm font-medium ${
                  driftScore > 0.1 ? 'text-status-degraded' : 'text-status-live'
                }`}
              >
                {(driftScore * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="p-2 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
            title="Restart Module"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onConfigure}
            className="p-2 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}


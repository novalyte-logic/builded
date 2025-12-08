'use client'

import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Signal {
  name: string
  value: number | string
  target?: number
  status: 'healthy' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
}

interface InputSignalMonitorProps {
  signals: Signal[]
  title?: string
}

export default function InputSignalMonitor({ signals, title = 'Input Signals' }: InputSignalMonitorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-status-live'
      case 'warning':
        return 'text-status-degraded'
      case 'critical':
        return 'text-status-offline'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-status-live/20 border-status-live/30'
      case 'warning':
        return 'bg-status-degraded/20 border-status-degraded/30'
      case 'critical':
        return 'bg-status-offline/20 border-status-offline/30'
      default:
        return 'bg-dark-accent border-dark-border'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      {title && <h3 className="text-sm font-medium text-white mb-4">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((signal, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getStatusBg(signal.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{signal.name}</span>
              {signal.status === 'critical' && (
                <AlertCircle className="w-4 h-4 text-status-offline" />
              )}
              {signal.status === 'warning' && (
                <AlertCircle className="w-4 h-4 text-status-degraded" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold ${getStatusColor(signal.status)}`}>
                {signal.value}
              </span>
              {signal.trend === 'up' && (
                <TrendingUp className="w-3 h-3 text-status-live" />
              )}
              {signal.trend === 'down' && (
                <TrendingDown className="w-3 h-3 text-status-offline" />
              )}
            </div>
            {signal.target && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Target</span>
                  <span className="text-gray-400">{signal.target}</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      signal.status === 'healthy'
                        ? 'bg-status-live'
                        : signal.status === 'warning'
                        ? 'bg-status-degraded'
                        : 'bg-status-offline'
                    }`}
                    style={{
                      width: `${Math.min((Number(signal.value) / signal.target) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


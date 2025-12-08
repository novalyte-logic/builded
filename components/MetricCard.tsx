'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  subtitle?: string
  status?: 'live' | 'degraded' | 'offline'
  icon?: React.ReactNode
  filters?: {
    serviceLine: string
    dateRange: string
    region: string
  }
}

export default function MetricCard({
  title,
  value,
  change,
  subtitle,
  status = 'live',
  icon,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {change !== undefined && mounted && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  change >= 0 ? 'text-status-live' : 'text-status-offline'
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && <div className="text-gray-600">{icon}</div>}
      </div>
      {status && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          <div
            className={`inline-flex items-center gap-2 text-xs ${
              status === 'live'
                ? 'text-status-live'
                : status === 'degraded'
                ? 'text-status-degraded'
                : 'text-status-offline'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'live'
                  ? 'bg-status-live'
                  : status === 'degraded'
                  ? 'bg-status-degraded'
                  : 'bg-status-offline'
              } glow-pulse`}
            />
            {status.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  )
}


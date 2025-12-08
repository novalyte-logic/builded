'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface MetricWithSparklineProps {
  title: string
  value: string | number
  delta1h?: number
  delta24h?: number
  delta7d?: number
  trend?: 'up' | 'down' | 'neutral'
  sparklineData?: number[]
}

export default function MetricWithSparkline({
  title,
  value,
  delta1h,
  delta24h,
  delta7d,
  trend = 'neutral',
  sparklineData = [],
}: MetricWithSparklineProps) {
  const [sparkData, setSparkData] = useState(
    sparklineData.length > 0
      ? sparklineData
      : Array.from({ length: 20 }, () => Math.random() * 100)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkData((prev) => {
        const newData = [...prev.slice(1)]
        newData.push(prev[prev.length - 1] + (Math.random() - 0.5) * 10)
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getDeltaColor = (delta?: number) => {
    if (!delta) return 'text-gray-400'
    return delta >= 0 ? 'text-status-live' : 'text-status-offline'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-status-live" />
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-status-offline" />
    return null
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-2xl font-bold text-white">{value}</p>
            {getTrendIcon()}
          </div>
          <div className="flex items-center gap-4 text-xs">
            {delta1h !== undefined && (
              <div>
                <span className="text-gray-500">1h: </span>
                <span className={getDeltaColor(delta1h)}>{delta1h >= 0 ? '+' : ''}{delta1h.toFixed(1)}%</span>
              </div>
            )}
            {delta24h !== undefined && (
              <div>
                <span className="text-gray-500">24h: </span>
                <span className={getDeltaColor(delta24h)}>{delta24h >= 0 ? '+' : ''}{delta24h.toFixed(1)}%</span>
              </div>
            )}
            {delta7d !== undefined && (
              <div>
                <span className="text-gray-500">7d: </span>
                <span className={getDeltaColor(delta7d)}>{delta7d >= 0 ? '+' : ''}{delta7d.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-12">
        <ResponsiveContainer width="100%" height={48}>
          <LineChart data={sparkData.map((val, idx) => ({ value: val, index: idx }))}>
            <Tooltip content={() => null} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#3b82f6'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


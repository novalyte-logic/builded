'use client'

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ForecastData {
  date: string
  base: number
  optimistic?: number
  downside?: number
  actual?: number
}

interface ForecastCurveProps {
  data: ForecastData[]
  title?: string
  height?: number
}

export default function ForecastCurve({ data, title, height = 300 }: ForecastCurveProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      {title && <h3 className="text-sm font-medium text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradientBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientDownside" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          {data[0]?.optimistic && (
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="#10b981"
              fill="url(#gradientOptimistic)"
              strokeWidth={2}
            />
          )}
          <Area
            type="monotone"
            dataKey="base"
            stroke="#3b82f6"
            fill="url(#gradientBase)"
            strokeWidth={2}
          />
          {data[0]?.downside && (
            <Area
              type="monotone"
              dataKey="downside"
              stroke="#ef4444"
              fill="url(#gradientDownside)"
              strokeWidth={2}
            />
          )}
          {data[0]?.actual && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          <Legend
            wrapperStyle={{ color: '#fff', fontSize: '12px' }}
            iconType="line"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


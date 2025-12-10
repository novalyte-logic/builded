'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { generateTimeSeriesData } from '@/lib/utils'

interface RealtimeChartProps {
  dataKey: string
  color?: string
  type?: 'line' | 'area'
  height?: number
  refreshInterval?: number
  initialValue?: number
  staticData?: { timestamp: string; value: number }[]
  filters?: {
    serviceLine: string
    dateRange: string
    region: string
  }
}

export default function RealtimeChart({
  dataKey,
  color = '#3b82f6',
  type = 'area',
  height = 200,
  refreshInterval = 3000,
  initialValue = 1000,
  staticData,
  filters,
}: RealtimeChartProps) {
  const [data, setData] = useState(
    staticData
      ? staticData.map((d) => ({ time: d.timestamp, value: d.value }))
      : generateTimeSeriesData(20, initialValue)
  )

  // Update when static data changes
  useEffect(() => {
    if (staticData) {
      setData(staticData.map((d) => ({ time: d.timestamp, value: d.value })))
    }
  }, [staticData])

  useEffect(() => {
    if (staticData) return

    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        newData.push({
          time: new Date().toISOString(),
          value: initialValue + (Math.random() - 0.5) * initialValue * 0.1,
        })
        return newData
      })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, initialValue, filters?.serviceLine, filters?.dateRange, filters?.region, staticData])

  const ChartComponent = type === 'area' ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="time"
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          stroke="#666"
          fontSize={12}
        />
        <YAxis stroke="#666" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111',
            border: '1px solid #1a1a1a',
            borderRadius: '6px',
            color: '#fff',
          }}
          labelFormatter={(value) => new Date(value).toLocaleString()}
        />
        {type === 'area' ? (
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${dataKey})`}
            strokeWidth={2}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}


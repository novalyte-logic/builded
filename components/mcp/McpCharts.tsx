'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Activity, AlertTriangle, Clock } from 'lucide-react'
import clsx from 'clsx'
import { McpTraceEvent, McpServer } from '@/lib/mcp/types'

export interface McpChartsProps {
  traces: McpTraceEvent[]
  servers: McpServer[]
  onServerClick?: (serverId: string) => void
  onTimeRangeClick?: (startTime: string, endTime: string) => void
  lastUpdated?: Date
}

/**
 * Group traces by time buckets (5-minute intervals)
 */
function groupTracesByTime(traces: McpTraceEvent[], minutes: number = 60) {
  const now = Date.now()
  const bucketSize = 5 * 60 * 1000 // 5 minutes in ms
  const buckets: Record<string, number> = {}
  
  // Initialize buckets
  for (let i = minutes; i >= 0; i -= 5) {
    const bucketTime = now - i * 60 * 1000
    const bucketKey = Math.floor(bucketTime / bucketSize) * bucketSize
    buckets[bucketKey] = 0
  }
  
  // Count traces in each bucket
  traces.forEach((trace) => {
    const traceTime = new Date(trace.timestamp).getTime()
    const bucketKey = Math.floor(traceTime / bucketSize) * bucketSize
    if (buckets.hasOwnProperty(bucketKey)) {
      buckets[bucketKey]++
    }
  })
  
  // Convert to array format
  return Object.entries(buckets)
    .map(([time, count]) => ({
      time: new Date(parseInt(time)).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: parseInt(time),
      calls: count,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Calculate error rate by server from traces
 */
function calculateErrorRateByServer(
  traces: McpTraceEvent[],
  servers: McpServer[]
): Array<{ server: string; errorRate: number; totalCalls: number; errors: number }> {
  const serverStats: Record<
    string,
    { total: number; errors: number }
  > = {}

  traces.forEach((trace) => {
    if (!serverStats[trace.serverName]) {
      serverStats[trace.serverName] = { total: 0, errors: 0 }
    }
    serverStats[trace.serverName].total++
    if (trace.status === 'ERROR') {
      serverStats[trace.serverName].errors++
    }
  })

  return servers.map((server) => {
    const stats = serverStats[server.name] || { total: 0, errors: 0 }
    const errorRate = stats.total > 0 ? (stats.errors / stats.total) * 100 : 0
    return {
      server: server.name,
      errorRate: parseFloat(errorRate.toFixed(2)),
      totalCalls: stats.total,
      errors: stats.errors,
    }
  })
}

/**
 * Group latencies into buckets
 */
function groupLatenciesByBucket(traces: McpTraceEvent[]) {
  const buckets = {
    '0-200ms': 0,
    '200-400ms': 0,
    '400-800ms': 0,
    '800ms+': 0,
  }

  traces.forEach((trace) => {
    const latency = trace.durationMs
    if (latency < 200) {
      buckets['0-200ms']++
    } else if (latency < 400) {
      buckets['200-400ms']++
    } else if (latency < 800) {
      buckets['400-800ms']++
    } else {
      buckets['800ms+']++
    }
  })

  return Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }))
}

/**
 * Calculate p95 and p99 latency
 */
function calculatePercentiles(traces: McpTraceEvent[]): {
  p95: number
  p99: number
} {
  if (traces.length === 0) return { p95: 0, p99: 0 }

  const latencies = traces
    .map((t) => t.durationMs)
    .sort((a, b) => a - b)

  const p95Index = Math.floor(latencies.length * 0.95)
  const p99Index = Math.floor(latencies.length * 0.99)

  return {
    p95: latencies[p95Index] || 0,
    p99: latencies[p99Index] || 0,
  }
}

export default function McpCharts({
  traces,
  servers,
  onServerClick,
  onTimeRangeClick,
  lastUpdated,
}: McpChartsProps) {
  const callsOverTime = useMemo(
    () => groupTracesByTime(traces, 60),
    [traces]
  )

  const errorRateByServer = useMemo(
    () => calculateErrorRateByServer(traces, servers),
    [traces, servers]
  )

  const latencyDistribution = useMemo(
    () => groupLatenciesByBucket(traces),
    [traces]
  )

  const percentiles = useMemo(() => calculatePercentiles(traces), [traces])

  // Detect spikes (if last bucket is > 50% over average)
  const averageCalls = useMemo(() => {
    if (callsOverTime.length === 0) return 0
    const sum = callsOverTime.reduce((acc, item) => acc + item.calls, 0)
    return sum / callsOverTime.length
  }, [callsOverTime])

  const lastBucketCalls = callsOverTime[callsOverTime.length - 1]?.calls || 0
  const hasSpike = lastBucketCalls > averageCalls * 1.5 && averageCalls > 0

  return (
    <div className="space-y-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-white">Live Monitoring</h2>
        </div>
        {lastUpdated && (
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Chart A: Agent Calls Over Time */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Agent Calls Over Time
            </h3>
            <p className="text-sm text-gray-400">Last 60 minutes (5-minute intervals)</p>
          </div>
          {hasSpike && (
            <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium">
              Spike detected
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={callsOverTime}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCalls)"
              name="Calls"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart B: Error Rate by Server */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            Error Rate by Server
          </h3>
          <p className="text-sm text-gray-400">Last 24 hours</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={errorRateByServer}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="server"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${props.payload.errors}/${props.payload.totalCalls} errors)`,
                'Error Rate',
              ]}
            />
            <Legend />
            <Bar
              dataKey="errorRate"
              fill="#ef4444"
              name="Error Rate (%)"
              onClick={(data: any) => {
                const server = servers.find((s) => s.name === data.server)
                if (server && onServerClick) {
                  onServerClick(server.id)
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart C: Latency Distribution */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            Latency Distribution
          </h3>
          <p className="text-sm text-gray-400">
            p95: {percentiles.p95}ms • p99: {percentiles.p99}ms
          </p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={latencyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="range"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Request Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import { Brain, Shield, Zap, AlertTriangle, Power, Settings2 } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface AIModule {
  id: string
  name: string
  status: 'enabled' | 'disabled'
  queries24h: number
  avgLatency: number
  safetyFlags: number
}

interface ReasoningLog {
  id: string
  timestamp: string
  query: string
  reasoning: string
  confidence: number
  safetyCheck: 'passed' | 'flagged' | 'override'
}

export default function AICorePage() {
  const [metrics, setMetrics] = useState({
    totalQueries: 3421000,
    avgLatency: 124,
    safetyFlags: 23,
    overrideCount: 2,
    activeModules: 12,
    reasoningAccuracy: 96.8,
  })

  const [modules] = useState<AIModule[]>([
    {
      id: '1',
      name: 'Patient Assessment Engine',
      status: 'enabled',
      queries24h: 124700,
      avgLatency: 98,
      safetyFlags: 5,
    },
    {
      id: '2',
      name: 'Treatment Recommendation',
      status: 'enabled',
      queries24h: 89200,
      avgLatency: 145,
      safetyFlags: 3,
    },
    {
      id: '3',
      name: 'Clinical Decision Support',
      status: 'enabled',
      queries24h: 67100,
      avgLatency: 178,
      safetyFlags: 8,
    },
    {
      id: '4',
      name: 'Natural Language Processing',
      status: 'enabled',
      queries24h: 342100,
      avgLatency: 89,
      safetyFlags: 2,
    },
  ])

  const [reasoningLogs] = useState<ReasoningLog[]>([
    {
      id: '1',
      timestamp: '2 minutes ago',
      query: 'Patient age 45, symptoms suggest...',
      reasoning: 'Analyzed patient profile, cross-referenced with...',
      confidence: 0.94,
      safetyCheck: 'passed',
    },
    {
      id: '2',
      timestamp: '5 minutes ago',
      query: 'Treatment protocol recommendation',
      reasoning: 'Considered contraindications, verified...',
      confidence: 0.87,
      safetyCheck: 'passed',
    },
    {
      id: '3',
      timestamp: '8 minutes ago',
      query: 'High-risk case evaluation',
      reasoning: 'Flagged potential interaction, escalated...',
      confidence: 0.92,
      safetyCheck: 'flagged',
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        totalQueries: prev.totalQueries + Math.floor(Math.random() * 50),
        avgLatency: 100 + Math.random() * 100,
        safetyFlags: prev.safetyFlags + Math.floor(Math.random() * 2) - 1,
        overrideCount: prev.overrideCount,
        activeModules: prev.activeModules,
        reasoningAccuracy: 95 + Math.random() * 3,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Reasoning & Safety Controls</h1>
        <p className="text-gray-400">AI logs, reasoning chains, and safety override management</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Queries (24h)"
          value={formatNumber(metrics.totalQueries)}
          change={8.7}
          icon={<Brain className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Latency"
          value={`${Math.round(metrics.avgLatency)}ms`}
          change={-2.3}
          icon={<Zap className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Flags"
          value={metrics.safetyFlags}
          change={-5.2}
          subtitle="Active warnings"
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Manual Overrides"
          value={metrics.overrideCount}
          change={0}
          subtitle="Last 24 hours"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Modules"
          value={metrics.activeModules}
          change={0}
          icon={<Power className="w-5 h-5" />}
        />
        <MetricCard
          title="Reasoning Accuracy"
          value={`${metrics.reasoningAccuracy.toFixed(1)}%`}
          change={0.3}
        />
      </div>

      {/* Control Panel */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">AI Module Controls</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm">
            <Settings2 className="w-4 h-4" />
            Recalibrate AI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-dark-accent border border-dark-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">{module.name}</h3>
                <button
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    module.status === 'enabled'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {module.status === 'enabled' ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Queries (24h)</p>
                  <p className="text-white font-medium">{formatNumber(module.queries24h)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Avg Latency</p>
                  <p className="text-white font-medium">{module.avgLatency}ms</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Safety Flags</p>
                  <p className="text-white font-medium">{module.safetyFlags}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Query Volume (24h)</h2>
          <RealtimeChart
            dataKey="queries"
            color="#10b981"
            type="area"
            height={250}
            initialValue={15000}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latency Trends</h2>
          <RealtimeChart
            dataKey="latency"
            color="#3b82f6"
            type="line"
            height={250}
            initialValue={120}
          />
        </div>
      </div>

      {/* Reasoning Logs */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Recent Reasoning Chains</h2>
        </div>

        <div className="divide-y divide-dark-border">
          {reasoningLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-dark-hover transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.safetyCheck === 'passed'
                          ? 'bg-green-500/20 text-green-400'
                          : log.safetyCheck === 'flagged'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {log.safetyCheck}
                    </span>
                    <span className="text-xs text-gray-400">
                      Confidence: {(log.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-gray-500">Query:</span> {log.query}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Reasoning:</span> {log.reasoning}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button className="text-xs text-primary hover:text-primary-light transition-colors">
                  View Full Chain
                </button>
                {log.safetyCheck === 'flagged' && (
                  <button className="text-xs text-status-degraded hover:text-status-degraded/80 transition-colors">
                    Review Safety Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


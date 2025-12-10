'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import { Brain, Shield, Zap, AlertTriangle, Power, Settings2 } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { AICoreMetrics, AIModuleState, ReasoningChain } from '@/lib/types/ai-core'

type ModuleState = AIModuleState
type Chain = ReasoningChain

export default function AICorePage() {
  const [metrics, setMetrics] = useState<AICoreMetrics | null>(null)
  const [modules, setModules] = useState<ModuleState[]>([])
  const [chains, setChains] = useState<Chain[]>([])
  const [loading, setLoading] = useState(false)
  const [recalStatus, setRecalStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [moduleError, setModuleError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai/metrics', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load metrics')
      const json = await res.json()
      setMetrics(json.metrics)
      setModules(json.modules)
      setChains(json.chains)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    setModuleError(null)
    setModules((prev) => prev.map((m) => (m.key === moduleKey ? { ...m, enabled } : m)))
    try {
      const res = await fetch('/api/admin/ai/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, enabled }),
      })
      if (!res.ok) throw new Error('Failed to update module')
    } catch (err) {
      setModuleError('Failed to update module. Reverting.')
      setModules((prev) => prev.map((m) => (m.key === moduleKey ? { ...m, enabled: !enabled } : m)))
    }
  }

  const handleRecalibrate = async () => {
    setRecalStatus('idle')
    try {
      const res = await fetch('/api/admin/ai/recalibrate', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      setRecalStatus('success')
    } catch {
      setRecalStatus('error')
    }
  }

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
          value={formatNumber(metrics?.totalQueries24h || 0)}
          change={metrics?.totalQueriesChangePct}
          icon={<Brain className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Latency"
          value={`${Math.round(metrics?.avgLatencyMs || 0)}ms`}
          change={metrics?.avgLatencyChangePct}
          icon={<Zap className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Flags"
          value={metrics?.safetyFlags || 0}
          change={metrics?.safetyFlagsChangePct}
          subtitle="Active warnings"
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Manual Overrides"
          value={metrics?.manualOverrides || 0}
          change={metrics?.manualOverridesChangePct}
          subtitle="Last 24 hours"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Modules"
          value={metrics?.activeModules || 0}
          change={metrics?.activeModulesChangePct}
          icon={<Power className="w-5 h-5" />}
        />
        <MetricCard
          title="Reasoning Accuracy"
          value={`${(metrics?.reasoningAccuracy || 0).toFixed(1)}%`}
          change={metrics?.reasoningAccuracyChangePct}
        />
      </div>

      {/* Control Panel */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">AI Module Controls</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalibrate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50"
            >
              <Settings2 className="w-4 h-4" />
              {loading ? 'Working...' : 'Recalibrate AI'}
            </button>
            {recalStatus === 'success' && <span className="text-xs text-green-400">Recalibration triggered</span>}
            {recalStatus === 'error' && <span className="text-xs text-status-offline">Failed. Try again.</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
            <div
                  key={module.key}
              className="bg-dark-accent border border-dark-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">{module.name}</h3>
                <button
                  onClick={() => toggleModule(module.key, !module.enabled)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    module.enabled
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {module.enabled ? 'Disable' : 'Enable'}
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
            dataKey="value"
            color="#10b981"
            type="area"
            height={250}
            staticData={metrics?.queryVolumeSeries || []}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latency Trends</h2>
          <RealtimeChart
            dataKey="value"
            color="#3b82f6"
            type="line"
            height={250}
            staticData={metrics?.latencySeries || []}
          />
        </div>
      </div>

      {/* Reasoning Logs */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Recent Reasoning Chains</h2>
        </div>

        <div className="divide-y divide-dark-border">
          {chains.map((log) => (
            <div key={log.id} className="p-6 hover:bg-dark-hover transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.status === 'passed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-xs text-gray-400">Confidence: {log.confidence.toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-gray-500">Query:</span> {log.query}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Reasoning:</span> {log.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Link href={`/ai-core/chains/${log.id}`} className="text-xs text-primary hover:text-primary-light transition-colors">
                  View Full Chain
                </Link>
                {log.status === 'flagged' && (
                  <Link
                    href={`/ai-core/safety-flags?chainId=${log.id}`}
                    className="text-xs text-status-degraded hover:text-status-degraded/80 transition-colors"
                  >
                    Review Safety Flag
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
            {moduleError && <p className="text-xs text-status-offline mt-2">{moduleError}</p>}
      </div>
    </div>
  )
}


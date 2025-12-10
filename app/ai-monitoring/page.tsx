'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import ReasoningTree from '@/components/ReasoningTree'
import FeatureWeights from '@/components/FeatureWeights'
import ConfidenceDistribution from '@/components/ConfidenceDistribution'
import AIModuleCard from '@/components/AIModuleCard'
import InferenceLog from '@/components/InferenceLog'
import {
  Brain,
  Zap,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  Power,
  Activity,
  TrendingDown,
  TrendingUp,
  Shield,
  Database,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import {
  AIModuleStatus,
  AIMonitoringMetrics,
  ExplainabilityPayload,
  InferenceLogDetail,
  InferenceLogItem,
  MonitoringControlAction,
} from '@/lib/types/ai-monitoring'

export default function AIMonitoringPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<AIMonitoringMetrics | null>(null)
  const [aiModules, setAiModules] = useState<AIModuleStatus[]>([])
  const [explainability, setExplainability] = useState<ExplainabilityPayload | null>(null)
  const [inferenceLogs, setInferenceLogs] = useState<InferenceLogItem[]>([])
  const [logCursor, setLogCursor] = useState<string | undefined>()
  const [remainingLogs, setRemainingLogs] = useState<number | undefined>()
  const [controlMessage, setControlMessage] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<MonitoringControlAction | null>(null)
  const [selectedLog, setSelectedLog] = useState<InferenceLogDetail | null>(null)

  const loadMetrics = async () => {
    const res = await fetch('/api/admin/ai/monitoring/metrics', { cache: 'no-store' })
    if (res.ok) setMetrics(await res.json())
  }

  const loadModules = async () => {
    const res = await fetch('/api/admin/ai/monitoring/modules', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      setAiModules(json.modules || [])
    }
  }

  const loadExplainability = async () => {
    const res = await fetch('/api/admin/ai/monitoring/explainability', { cache: 'no-store' })
    if (res.ok) setExplainability(await res.json())
  }

  const loadLogs = async (cursor?: string) => {
    const url = new URL('/api/admin/ai/monitoring/logs', window.location.origin)
    if (cursor) url.searchParams.set('cursor', cursor)
    url.searchParams.set('limit', '10')
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      setInferenceLogs((prev) => (cursor ? [...prev, ...json.items] : json.items))
      setLogCursor(json.nextCursor)
      setRemainingLogs(json.remainingCount)
    }
  }

  const loadLogDetail = async (id: string) => {
    const res = await fetch(`/api/admin/ai/monitoring/logs/${id}`, { cache: 'no-store' })
    if (res.ok) setSelectedLog(await res.json())
  }

  useEffect(() => {
    loadMetrics()
    loadModules()
    loadExplainability()
    loadLogs()
  }, [])

  const handleControl = async (action: MonitoringControlAction) => {
    setLoadingAction(action)
    setControlMessage(null)
    try {
      const res = await fetch('/api/admin/ai/monitoring/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (action === 'EXPORT_REASONING' && json.downloadUrl) {
        window.open(json.downloadUrl, '_blank')
      }
      setControlMessage('Action completed')
      if (action === 'REFRESH_DATA') {
        loadMetrics()
        loadModules()
        loadLogs()
      }
    } catch (e) {
      setControlMessage('Action failed')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleExportReport = () => {
    window.open('/api/admin/ai/monitoring/export-report', '_blank')
  }

  const handleModuleRestart = async (key: string) => {
    await fetch('/api/admin/ai/monitoring/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, action: 'RESTART' }),
    })
  }

  const handleConfigure = (key: string) => {
    router.push(`/admin/ai-modules/${key}`)
  }

  const reasoningTreeData = {
    id: 'root',
    label: 'Patient Assessment Decision',
    value: 0.87,
    confidence: 0.87,
    status: 'passed' as const,
    children: [
      {
        id: 'symptoms',
        label: 'Symptom Analysis',
        value: 0.92,
        confidence: 0.92,
        status: 'passed' as const,
        children: [
          {
            id: 'fatigue',
            label: 'Fatigue Score',
            value: 0.85,
            confidence: 0.85,
            status: 'passed' as const,
          },
          {
            id: 'libido',
            label: 'Libido Score',
            value: 0.78,
            confidence: 0.78,
            status: 'warning' as const,
          },
        ],
      },
      {
        id: 'risk',
        label: 'Risk Evaluation',
        value: 0.81,
        confidence: 0.81,
        status: 'passed' as const,
        children: [
          {
            id: 'age',
            label: 'Age Factor',
            value: 0.88,
            confidence: 0.88,
            status: 'passed' as const,
          },
          {
            id: 'history',
            label: 'Family History',
            value: 0.76,
            confidence: 0.76,
            status: 'passed' as const,
          },
        ],
      },
    ],
  }

  const featureWeights = [
    { name: 'Age Factor', weight: 0.28, impact: 'positive' as const, value: '45 years' },
    { name: 'Symptom Severity', weight: 0.24, impact: 'positive' as const, value: 'Moderate-High' },
    { name: 'Testosterone Level', weight: -0.19, impact: 'negative' as const, value: 'Low' },
    { name: 'BMI Index', weight: 0.15, impact: 'positive' as const, value: '32.1' },
    { name: 'Activity Level', weight: 0.12, impact: 'positive' as const, value: 'Sedentary' },
    { name: 'Sleep Quality', weight: -0.08, impact: 'negative' as const, value: 'Poor' },
  ]

  const confidenceDistribution = [
    { range: '0-20%', count: 12 },
    { range: '20-40%', count: 45 },
    { range: '40-60%', count: 234 },
    { range: '60-80%', count: 1247 },
    { range: '80-90%', count: 3421 },
    { range: '90-100%', count: 8924 },
  ]

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Monitoring + Explainability</h1>
            <p className="text-gray-400 mt-1">
              AI Flight Deck for Men's Health Intelligence Network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Inferences (24h)"
          value={formatNumber(metrics?.totalInferences24h || 0)}
          change={metrics?.totalInferencesChangePct}
          icon={<Brain className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Latency"
          value={`${Math.round(metrics?.avgLatencyMs || 0)}ms`}
          change={metrics?.avgLatencyChangePct}
          icon={<Zap className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Confidence"
          value={`${(metrics?.avgConfidencePct || 0).toFixed(1)}%`}
          change={metrics?.avgConfidenceChangePct}
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Flags"
          value={metrics?.safetyFlags || 0}
          change={metrics?.safetyFlagsChangePct}
          subtitle="Active warnings"
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Drift Warnings"
          value={metrics?.driftWarnings || 0}
          change={metrics?.driftWarningsChangePct}
          subtitle="Model drift alerts"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Models"
          value={metrics?.activeModels || 0}
          change={metrics?.activeModelsChangePct}
          icon={<Power className="w-5 h-5" />}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${(metrics?.cacheHitRatePct || 0).toFixed(1)}%`}
          change={metrics?.cacheHitRateChangePct}
        />
        <MetricCard
          title="Data Freshness"
          value={`${(metrics?.dataFreshnessPct || 0).toFixed(1)}%`}
          change={metrics?.dataFreshnessChangePct}
        />
      </div>

      {/* Superadmin Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Superadmin Control Panel</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleControl('CLEAR_CACHES')}
            disabled={loadingAction === 'CLEAR_CACHES'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Caches
          </button>
          <button
            onClick={() => handleControl('RESTART_ALL_MODULES')}
            disabled={loadingAction === 'RESTART_ALL_MODULES'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Restart All Modules
          </button>
          <button
            onClick={() => handleControl('TOGGLE_FALLBACKS')}
            disabled={loadingAction === 'TOGGLE_FALLBACKS'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <Power className="w-4 h-4" />
            Toggle Fallbacks
          </button>
          <button
            onClick={() => handleControl('TRIGGER_RECALIBRATION')}
            disabled={loadingAction === 'TRIGGER_RECALIBRATION'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <Activity className="w-4 h-4" />
            Trigger Recalibration
          </button>
          <button
            onClick={() => handleControl('EXPORT_REASONING')}
            disabled={loadingAction === 'EXPORT_REASONING'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Reasoning
          </button>
          <button
            onClick={() => handleControl('REFRESH_DATA')}
            disabled={loadingAction === 'REFRESH_DATA'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
        {controlMessage && <p className="text-xs text-gray-400 mt-3">{controlMessage}</p>}
      </div>

      {/* AI Systems Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Systems Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiModules.map((module) => (
            <AIModuleCard
              key={module.key}
              name={module.name}
              status={module.status}
              queries24h={module.queries24h}
              avgLatency={module.avgLatencyMs}
              accuracy={module.accuracyPct / 100}
              driftScore={module.driftScorePct / 100}
              onRestart={() => handleModuleRestart(module.key)}
              onConfigure={() => handleConfigure(module.key)}
            />
          ))}
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Model Latency (24h)</h2>
          <RealtimeChart
            dataKey="value"
            color="#3b82f6"
            type="area"
            height={250}
            staticData={metrics?.latencySeries || []}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Prediction Volatility</h2>
          <RealtimeChart
            dataKey="value"
            color="#f59e0b"
            type="line"
            height={250}
            staticData={metrics?.volatilitySeries || []}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Inference Volume (24h)</h2>
          <RealtimeChart
            dataKey="value"
            color="#10b981"
            type="area"
            height={250}
            staticData={metrics?.inferenceVolumeSeries || []}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Safety Exclusion Triggers</h2>
          <RealtimeChart
            dataKey="value"
            color="#ef4444"
            type="line"
            height={250}
            staticData={metrics?.safetyExclusionSeries || []}
          />
        </div>
      </div>

      {/* Explainability Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Explainability Layer</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReasoningTree
              data={{
                id: 'root',
                label: 'Patient Assessment Decision',
                value: (explainability?.reasoningTree.patientAssessmentDecisionPct || 0) / 100,
                confidence: (explainability?.reasoningTree.patientAssessmentDecisionPct || 0) / 100,
                status: 'passed',
                children: [
                  {
                    id: 'symptoms',
                    label: 'Symptom Analysis',
                    value: (explainability?.reasoningTree.symptomAnalysisPct || 0) / 100,
                    confidence: (explainability?.reasoningTree.symptomAnalysisPct || 0) / 100,
                    status: 'passed',
                    children: [
                      {
                        id: 'fatigue',
                        label: 'Fatigue Score',
                        value: (explainability?.reasoningTree.fatigueScorePct || 0) / 100,
                        confidence: (explainability?.reasoningTree.fatigueScorePct || 0) / 100,
                        status: 'passed',
                      },
                      {
                        id: 'libido',
                        label: 'Libido Score',
                        value: (explainability?.reasoningTree.libidoScorePct || 0) / 100,
                        confidence: (explainability?.reasoningTree.libidoScorePct || 0) / 100,
                        status: 'warning',
                      },
                    ],
                  },
                  {
                    id: 'risk',
                    label: 'Risk Evaluation',
                    value: (explainability?.reasoningTree.riskEvaluationPct || 0) / 100,
                    confidence: (explainability?.reasoningTree.riskEvaluationPct || 0) / 100,
                    status: 'passed',
                    children: [],
                  },
                ],
              }}
            />
          </div>
          <div>
            <ConfidenceDistribution
              data={
                explainability?.confidenceDistribution.map((c) => ({
                  range: c.rangeLabel,
                  count: c.count,
                })) || []
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FeatureWeights
          features={
            explainability?.topInfluencingFactors.map((f) => ({
              name: f.label,
              weight: f.contributionPct / 100,
              impact: f.sign,
              value: f.value,
            })) || []
          }
        />
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Decision Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Final Decision</span>
                <span className="text-sm font-medium text-white">
                  {explainability?.decisionBreakdown.finalDecision || 'High Risk Detected'}
                </span>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-2">
                <div className="bg-status-degraded h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Safety Gates Activated</span>
                <span className="text-xs text-status-degraded">
                  {explainability?.decisionBreakdown.safetyGatesActivated || '2 of 5'}
                </span>
              </div>
              <div className="flex gap-2">
                {['Age Check', 'Risk Threshold', 'Contraindication', 'Clinical Validation', 'Final Review'].map((gate, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded ${
                      idx < 2 ? 'bg-status-degraded' : 'bg-dark-accent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-dark-border">
              <h4 className="text-xs font-medium text-gray-400 mb-3">What-If Projections</h4>
              <div className="space-y-2 text-xs">
                {(explainability?.whatIfProjections || []).map((proj, idx) => (
                  <div key={idx} className="flex items-center justify-between text-gray-300">
                    <span>{proj.scenarioLabel}</span>
                    <span className="text-status-live">
                      Risk: {proj.riskScore.toFixed(2)} ({proj.deltaPct > 0 ? '+' : ''}
                      {proj.deltaPct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inference Logs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Inference Logs</h2>
        <InferenceLog
          entries={inferenceLogs.map((log) => ({
            id: log.id,
            timestamp: log.timestamp,
            model: log.modelName,
            input: log.inputPreview,
            output: log.outputPreview,
            confidence: log.confidencePct / 100,
            latency: log.latencyMs,
            safetyFlags: log.safetyFlags || [],
            onViewDetails: () => loadLogDetail(log.id),
          }))}
          onLoadMore={() => logCursor && loadLogs(logCursor)}
          remainingCount={remainingLogs}
        />
      </div>
      {selectedLog && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Log Details</h3>
            <button className="text-xs text-primary" onClick={() => setSelectedLog(null)}>
              Close
            </button>
          </div>
          <div className="text-xs text-gray-300 space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <span>{new Date(selectedLog.timestamp).toLocaleString()}</span>
              <span className="text-gray-500">·</span>
              <span>{selectedLog.modelName}</span>
              {selectedLog.relatedChainId && (
                <button
                  className="text-primary underline underline-offset-2"
                  onClick={() => router.push(`/ai-core/chains/${selectedLog.relatedChainId}`)}
                >
                  View full chain in AI Core
                </button>
              )}
            </div>
            <div>
              <p className="text-gray-400">Input Payload</p>
              <pre className="bg-dark-accent border border-dark-border rounded p-3 overflow-x-auto text-[11px] text-gray-200">
                {JSON.stringify(selectedLog.inputPayload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-gray-400">Output Payload</p>
              <pre className="bg-dark-accent border border-dark-border rounded p-3 overflow-x-auto text-[11px] text-gray-200">
                {JSON.stringify(selectedLog.outputPayload, null, 2)}
              </pre>
            </div>
            <div className="text-gray-400">
              Safety: {selectedLog.safety.flags?.join(', ') || 'None'} · Fallbacks:{' '}
              {selectedLog.safety.fallbacksUsed ? 'Yes' : 'No'} · Retries: {selectedLog.safety.retries}
            </div>
          </div>
        </div>
      )}

      {/* Model Health Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Model Health & Drift Detection</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Drift Detection Curves</h3>
            <RealtimeChart
              dataKey="drift"
              color="#f59e0b"
              type="line"
              height={200}
              initialValue={0.05}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Drift</span>
                <span className="text-status-degraded font-medium">{(metrics?.currentDriftPct || 0) * 100}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Threshold</span>
                <span className="text-gray-300">{(metrics?.driftThresholdPct || 0) * 100}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <StatusBadge status="live" label={metrics?.driftStatus || 'WITHIN RANGE'} />
              </div>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Bias Deviation Monitor</h3>
            <RealtimeChart
              dataKey="bias"
              color="#ef4444"
              type="area"
              height={200}
              initialValue={0.02}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Age Bias</span>
                <span className="text-status-live font-medium">{metrics?.ageBias ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Gender Bias</span>
                <span className="text-status-live font-medium">{metrics?.genderBias ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Geographic Bias</span>
                <span className="text-status-degraded font-medium">{metrics?.geographicBias ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Prediction Accuracy Decay</h3>
            <RealtimeChart
              dataKey="accuracy"
              color="#10b981"
              type="line"
              height={200}
                staticData={metrics?.latencySeries || []}
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Current Accuracy</p>
                  <p className="text-lg font-bold text-white">{(metrics?.currentAccuracyPct || 0).toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Baseline</p>
                  <p className="text-lg font-bold text-gray-400">{(metrics?.baselineAccuracyPct || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Dataset Freshness Score</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Training Data</span>
                <span className="text-sm text-white font-medium">
                  {(metrics?.datasetFreshness.trainingDataPct || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-3">
                <div
                  className="bg-status-live h-3 rounded-full"
                  style={{ width: '96.2%' }}
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Validation Data</span>
                <span className="text-sm text-white font-medium">
                  {(metrics?.datasetFreshness.validationDataPct || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-3">
                <div
                  className="bg-status-live h-3 rounded-full"
                  style={{ width: '94.8%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Synthetic Validation</span>
                <span className="text-sm text-white font-medium">
                  {(metrics?.datasetFreshness.syntheticValidationPct || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-3">
                <div
                  className="bg-status-live h-3 rounded-full"
                  style={{ width: '98.1%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Freshness Meters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Data Freshness Meters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              name: 'Patient Data',
              freshness: (metrics?.dataFreshnessMeters.patient.freshnessPct || 0) / 100,
              lastUpdate: metrics?.dataFreshnessMeters.patient.lastUpdated
                ? new Date(metrics.dataFreshnessMeters.patient.lastUpdated).toLocaleString()
                : '—',
            },
            {
              name: 'Clinic Data',
              freshness: (metrics?.dataFreshnessMeters.clinic.freshnessPct || 0) / 100,
              lastUpdate: metrics?.dataFreshnessMeters.clinic.lastUpdated
                ? new Date(metrics.dataFreshnessMeters.clinic.lastUpdated).toLocaleString()
                : '—',
            },
            {
              name: 'Marketplace Data',
              freshness: (metrics?.dataFreshnessMeters.marketplace.freshnessPct || 0) / 100,
              lastUpdate: metrics?.dataFreshnessMeters.marketplace.lastUpdated
                ? new Date(metrics.dataFreshnessMeters.marketplace.lastUpdated).toLocaleString()
                : '—',
            },
            {
              name: 'AI Training Data',
              freshness: (metrics?.dataFreshnessMeters.aiTraining.freshnessPct || 0) / 100,
              lastUpdate: metrics?.dataFreshnessMeters.aiTraining.lastUpdated
                ? new Date(metrics.dataFreshnessMeters.aiTraining.lastUpdated).toLocaleString()
                : '—',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-dark-accent rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{item.name}</span>
                <span className="text-xs text-gray-500">{item.lastUpdate}</span>
              </div>
              <div className="w-full bg-dark-border rounded-full h-2 mb-2">
                <div
                  className="bg-status-live h-2 rounded-full"
                  style={{ width: `${item.freshness * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">
                {(item.freshness * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


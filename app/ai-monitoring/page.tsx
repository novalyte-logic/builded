'use client'

import { useEffect, useState } from 'react'
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

interface AIModule {
  id: string
  name: string
  status: 'live' | 'degraded' | 'offline'
  queries24h: number
  avgLatency: number
  accuracy: number
  driftScore: number
}

interface InferenceEntry {
  id: string
  timestamp: Date
  model: string
  input: string
  output: string
  confidence: number
  latency: number
  safetyFlags: string[]
}

export default function AIMonitoringPage() {
  const [metrics, setMetrics] = useState({
    totalInferences: 3421000,
    avgLatency: 124,
    avgConfidence: 0.92,
    safetyFlags: 23,
    driftWarnings: 2,
    activeModels: 8,
    cacheHitRate: 0.87,
    dataFreshness: 0.96,
  })

  const [aiModules] = useState<AIModule[]>([
    {
      id: '1',
      name: 'Men\'s Health Symptom Classifier',
      status: 'live',
      queries24h: 89200,
      avgLatency: 98,
      accuracy: 0.94,
      driftScore: 0.03,
    },
    {
      id: '2',
      name: 'Hormone Risk Engine',
      status: 'live',
      queries24h: 67100,
      avgLatency: 145,
      accuracy: 0.91,
      driftScore: 0.05,
    },
    {
      id: '3',
      name: 'Provider Matching AI',
      status: 'live',
      queries24h: 124700,
      avgLatency: 112,
      accuracy: 0.96,
      driftScore: 0.02,
    },
    {
      id: '4',
      name: 'Marketplace ROI AI',
      status: 'live',
      queries24h: 45600,
      avgLatency: 89,
      accuracy: 0.88,
      driftScore: 0.08,
    },
    {
      id: '5',
      name: 'Vendor Demand Prediction',
      status: 'live',
      queries24h: 34200,
      avgLatency: 156,
      accuracy: 0.87,
      driftScore: 0.12,
    },
    {
      id: '6',
      name: 'Abuse / Anomaly Detection',
      status: 'live',
      queries24h: 289000,
      avgLatency: 67,
      accuracy: 0.93,
      driftScore: 0.04,
    },
    {
      id: '7',
      name: 'Forecasting Neural Models',
      status: 'degraded',
      queries24h: 12400,
      avgLatency: 234,
      accuracy: 0.82,
      driftScore: 0.18,
    },
    {
      id: '8',
      name: 'Model Drift & Health Checks',
      status: 'live',
      queries24h: 0,
      avgLatency: 0,
      accuracy: 1.0,
      driftScore: 0.02,
    },
  ])

  const [inferenceLogs, setInferenceLogs] = useState<InferenceEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      model: 'Symptom Classifier',
      input: 'Patient: Age 45, symptoms: fatigue, low libido',
      output: 'High confidence for testosterone deficiency (87%)',
      confidence: 0.87,
      latency: 98,
      safetyFlags: [],
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 120000),
      model: 'Risk Engine',
      input: 'Patient profile: Age 52, BMI 32, family history...',
      output: 'Moderate risk profile, recommend screening',
      confidence: 0.91,
      latency: 145,
      safetyFlags: [],
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 300000),
      model: 'Provider Matching',
      input: 'Location: Los Angeles, preferences:...',
      output: 'Matched 3 providers (confidence: 94%)',
      confidence: 0.94,
      latency: 112,
      safetyFlags: [],
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        totalInferences: prev.totalInferences + Math.floor(Math.random() * 50),
        avgLatency: 100 + Math.random() * 100,
        avgConfidence: 0.88 + Math.random() * 0.08,
        safetyFlags: prev.safetyFlags + Math.floor(Math.random() * 2) - 1,
        driftWarnings: prev.driftWarnings,
        activeModels: prev.activeModels,
        cacheHitRate: 0.85 + Math.random() * 0.1,
        dataFreshness: 0.94 + Math.random() * 0.04,
      }))

      // Add new inference log entry
      const newEntry: InferenceEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        model: ['Symptom Classifier', 'Risk Engine', 'Provider Matching', 'Marketplace ROI'][
          Math.floor(Math.random() * 4)
        ],
        input: 'Patient query or data input',
        output: 'Model prediction output',
        confidence: 0.85 + Math.random() * 0.1,
        latency: 80 + Math.random() * 150,
        safetyFlags: Math.random() > 0.9 ? ['High risk detected'] : [],
      }
      setInferenceLogs((prev) => [newEntry, ...prev.slice(0, 49)])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm">
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
          value={formatNumber(metrics.totalInferences)}
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
          title="Avg Confidence"
          value={`${(metrics.avgConfidence * 100).toFixed(1)}%`}
          change={1.2}
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Flags"
          value={metrics.safetyFlags}
          change={-5.2}
          subtitle="Active warnings"
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Drift Warnings"
          value={metrics.driftWarnings}
          change={0}
          subtitle="Model drift alerts"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Models"
          value={metrics.activeModels}
          change={0}
          icon={<Power className="w-5 h-5" />}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${(metrics.cacheHitRate * 100).toFixed(1)}%`}
          change={2.1}
        />
        <MetricCard
          title="Data Freshness"
          value={`${(metrics.dataFreshness * 100).toFixed(1)}%`}
          change={0.3}
        />
      </div>

      {/* Superadmin Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Superadmin Control Panel</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <Trash2 className="w-4 h-4" />
            Clear Caches
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <RefreshCw className="w-4 h-4" />
            Restart All Modules
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <Power className="w-4 h-4" />
            Toggle Fallbacks
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <Activity className="w-4 h-4" />
            Trigger Recalibration
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <Download className="w-4 h-4" />
            Export Reasoning
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300">
            <Database className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* AI Systems Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Systems Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiModules.map((module) => (
            <AIModuleCard
              key={module.id}
              {...module}
              onRestart={() => console.log(`Restarting ${module.name}`)}
              onConfigure={() => console.log(`Configuring ${module.name}`)}
            />
          ))}
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Model Latency (24h)</h2>
          <RealtimeChart
            dataKey="latency"
            color="#3b82f6"
            type="area"
            height={250}
            initialValue={120}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Prediction Volatility</h2>
          <RealtimeChart
            dataKey="volatility"
            color="#f59e0b"
            type="line"
            height={250}
            initialValue={0.05}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Inference Volume (24h)</h2>
          <RealtimeChart
            dataKey="inferences"
            color="#10b981"
            type="area"
            height={250}
            initialValue={15000}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Safety Exclusion Triggers</h2>
          <RealtimeChart
            dataKey="safety"
            color="#ef4444"
            type="line"
            height={250}
            initialValue={5}
          />
        </div>
      </div>

      {/* Explainability Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Explainability Layer</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReasoningTree data={reasoningTreeData} />
          </div>
          <div>
            <ConfidenceDistribution data={confidenceDistribution} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FeatureWeights features={featureWeights} />
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Decision Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Final Decision</span>
                <span className="text-sm font-medium text-white">High Risk Detected</span>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-2">
                <div className="bg-status-degraded h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Safety Gates Activated</span>
                <span className="text-xs text-status-degraded">2 of 5</span>
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
                <div className="flex items-center justify-between text-gray-300">
                  <span>If age = 35 (vs 45):</span>
                  <span className="text-status-live">Risk: 0.72 (-15%)</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>If testosterone normal:</span>
                  <span className="text-status-live">Risk: 0.61 (-26%)</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>If BMI = 25 (vs 32):</span>
                  <span className="text-status-live">Risk: 0.79 (-8%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inference Logs */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Inference Logs</h2>
        <InferenceLog entries={inferenceLogs} />
      </div>

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
                <span className="text-status-degraded font-medium">0.12%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Threshold</span>
                <span className="text-gray-300">0.15%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <StatusBadge status="live" label="WITHIN RANGE" />
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
                <span className="text-status-live font-medium">-0.003</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Gender Bias</span>
                <span className="text-status-live font-medium">0.001</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Geographic Bias</span>
                <span className="text-status-degraded font-medium">0.008</span>
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
              initialValue={0.92}
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Current Accuracy</p>
                <p className="text-lg font-bold text-white">92.4%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Baseline</p>
                <p className="text-lg font-bold text-gray-400">93.1%</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Dataset Freshness Score</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Training Data</span>
                <span className="text-sm text-white font-medium">96.2%</span>
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
                <span className="text-sm text-white font-medium">94.8%</span>
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
                <span className="text-sm text-white font-medium">98.1%</span>
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
            { name: 'Patient Data', freshness: 0.98, lastUpdate: '2 hours ago' },
            { name: 'Clinic Data', freshness: 0.95, lastUpdate: '4 hours ago' },
            { name: 'Marketplace Data', freshness: 0.97, lastUpdate: '1 hour ago' },
            { name: 'AI Training Data', freshness: 0.94, lastUpdate: '6 hours ago' },
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


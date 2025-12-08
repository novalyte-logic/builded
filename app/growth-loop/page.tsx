'use client'

import { useEffect, useState } from 'react'
import GrowthLoopPhase from '@/components/GrowthLoopPhase'
import LoopTimeline from '@/components/LoopTimeline'
import GeminiCentralBrain from '@/components/GeminiCentralBrain'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  Repeat,
  Activity,
  Brain,
  Zap,
  TrendingUp,
  Download,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface PhaseData {
  id: string
  phase: 1 | 2 | 3 | 4
  name: string
  status: 'active' | 'processing' | 'complete'
  metrics: {
    label: string
    value: string | number
    change?: number
  }[]
  insights: string[]
  nextPhaseSignal?: string
}

interface LoopEvent {
  id: string
  timestamp: Date
  phase: 1 | 2 | 3 | 4
  action: string
  impact: string
  status: 'active' | 'complete'
}

interface BrainDecision {
  id: string
  timestamp: Date
  question: string
  answer: string
  metrics: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
  }[]
  action?: string
  confidence: number
}

export default function GrowthLoopPage() {
  const [loopPhases, setLoopPhases] = useState<PhaseData[]>([
    {
      id: '1',
      phase: 1,
      name: 'Traffic Ingestion',
      status: 'active',
      metrics: [
        { label: 'Total Traffic', value: 34200, change: 12.4 },
        { label: 'Paid Traffic', value: 18900, change: 18.2 },
        { label: 'Organic Traffic', value: 8900, change: 8.7 },
        { label: 'Referral Traffic', value: 6400, change: 5.3 },
      ],
      insights: [
        'Intent signals captured: 24,500 (72% of traffic)',
        'Commercial readiness score: 8.4/10 (high)',
        'Behavioral fingerprints collected: 31,200',
      ],
      nextPhaseSignal: 'Sufficient data volume reached. Ready for digestion phase.',
    },
    {
      id: '2',
      phase: 2,
      name: 'Data Digestion',
      status: 'processing',
      metrics: [
        { label: 'Behaviors Analyzed', value: 31200, change: 15.3 },
        { label: 'Friction Points Found', value: 12 },
        { label: 'Optimization Signals', value: 47 },
        { label: 'Drop-off Clusters', value: 8 },
      ],
      insights: [
        'Scroll depth analysis: 67% reach CTA, 43% complete assessment',
        'Price sensitivity detected: 18% abandon at pricing step',
        'Time-to-decision: Average 4.2 minutes for high-intent users',
      ],
      nextPhaseSignal: '12 friction points identified. Optimization targets ready.',
    },
    {
      id: '3',
      phase: 3,
      name: 'Optimization',
      status: 'active',
      metrics: [
        { label: 'Optimizations Deployed', value: 23, change: 8 },
        { label: 'Conversion Lift', value: '18.4%', change: 12.3 },
        { label: 'LTV Improvement', value: '12.2%', change: 8.7 },
        { label: 'Drop-off Reduction', value: '15.6%', change: -15.6 },
      ],
      insights: [
        'CTA behavior adjusted: +23% click-through on optimized pages',
        'Funnel order refined: Assessment completion up 18%',
        'Assessment routing improved: Clinic match precision +14%',
      ],
      nextPhaseSignal: 'Optimizations proven. Ready to scale winning funnels.',
    },
    {
      id: '4',
      phase: 4,
      name: 'Scale',
      status: 'active',
      metrics: [
        { label: 'Funnels Scaled', value: 8, change: 3 },
        { label: 'Traffic Increase', value: '22.4%', change: 22.4 },
        { label: 'Revenue Impact', value: 89400, change: 18.7 },
        { label: 'Geo Expansion', value: 3 },
      ],
      insights: [
        'TikTok Miami funnel scaled 25% - generating +$42K revenue',
        '3 new geos launched: Phoenix, Denver, Seattle',
        'Winning creative cloned to 5 new campaigns',
      ],
    },
  ])

  const [loopEvents] = useState<LoopEvent[]>([
    {
      id: '1',
      timestamp: new Date(),
      phase: 1,
      action: 'Traffic ingested: 1,247 visitors',
      impact: 'Intent signals captured, behavioral fingerprints collected',
      status: 'active',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 120000),
      phase: 2,
      action: 'Data digestion: 12 friction points identified',
      impact: 'Optimization targets ready for Phase 3',
      status: 'complete',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 300000),
      phase: 3,
      action: 'Optimization deployed: CTA behavior adjusted',
      impact: 'Conversion lift: +18.4%, ready to scale',
      status: 'complete',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 600000),
      phase: 4,
      action: 'Scale triggered: TikTok Miami funnel +25%',
      impact: 'Generating +$42K additional revenue',
      status: 'active',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 900000),
      phase: 1,
      action: 'Traffic ingested: 2,189 visitors (scaled traffic)',
      impact: 'Loop continues - more data feeding Phase 2',
      status: 'complete',
    },
  ])

  const [brainDecisions] = useState<BrainDecision[]>([
    {
      id: '1',
      timestamp: new Date(),
      question: 'What is growing fastest?',
      answer:
        'TikTok Miami funnel showing 45% faster growth vs network average. Hook retention stable at 78%, conversion velocity increasing 12% week-over-week. Traffic quality score: 92/100. This funnel deserves immediate scale.',
      metrics: [
        { label: 'Growth Rate', value: '45%', trend: 'up' },
        { label: 'Conversion Velocity', value: '+12%', trend: 'up' },
        { label: 'Quality Score', value: '92/100', trend: 'stable' },
        { label: 'Revenue Potential', value: 42300, trend: 'up' },
      ],
      action: 'Scale TikTok Miami funnel by 25%. Increase budget allocation immediately.',
      confidence: 0.94,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1800000),
      question: 'What is decaying silently?',
      answer:
        'Google Display retargeting campaigns showing silent decay. CTR dropped 34% over 14 days, frequency at 6.2x (threshold: 3.5x), ad blindness confirmed. Revenue decoupled from spend (+12% spend, flat revenue). Creative fatigue score: 92/100.',
      metrics: [
        { label: 'CTR Decay', value: '-34%', trend: 'down' },
        { label: 'Frequency', value: '6.2x', trend: 'down' },
        { label: 'Revenue Trend', value: 'Flat', trend: 'down' },
        { label: 'Fatigue Score', value: '92/100', trend: 'down' },
      ],
      action: 'Kill Google Display retargeting. Reallocate budget to high-performing search campaigns.',
      confidence: 0.91,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3600000),
      question: 'Where is the easiest next $100k?',
      answer:
        'Marketplace cross-sell optimization. Current cross-sell rate: 12%. Behavioral data shows 34% of clinic leads browse marketplace but don\'t purchase. Price sensitivity analysis reveals optimal bundling opportunity. Estimated impact: +$124K revenue with minimal spend increase.',
      metrics: [
        { label: 'Current Cross-sell', value: '12%', trend: 'stable' },
        { label: 'Opportunity', value: '34%', trend: 'up' },
        { label: 'Revenue Impact', value: 124000, trend: 'up' },
        { label: 'Effort', value: 'Low', trend: 'stable' },
      ],
      action: 'Deploy marketplace bundling optimization. Target clinic leads with personalized product recommendations.',
      confidence: 0.87,
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 5400000),
      question: 'Which funnel deserves more traffic TODAY?',
      answer:
        'Google Search + Hormone Assessment funnel. ROAS: 4.2x, LTV: $3,420, conversion rate: 3.8%, traffic quality: 92/100. Assessment completion rate: 72%. Clinic match precision: 89%. This funnel has capacity for 3x current traffic volume without quality degradation.',
      metrics: [
        { label: 'ROAS', value: '4.2x', trend: 'up' },
        { label: 'LTV', value: 3420, trend: 'up' },
        { label: 'Conversion Rate', value: '3.8%', trend: 'stable' },
        { label: 'Quality Score', value: '92/100', trend: 'stable' },
      ],
      action: 'Signal Ads Autopilot to increase Google Search budget by 30% immediately. Expand to adjacent keyword clusters.',
      confidence: 0.93,
    },
  ])

  const [compoundingMetrics, setCompoundingMetrics] = useState({
    totalOptimizations: 127,
    cumulativeRevenueLift: 1247000,
    loopsCompleted: 47,
    compoundingRate: 1.18,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCompoundingMetrics((prev) => ({
        ...prev,
        loopsCompleted: prev.loopsCompleted + 1,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Core AI Growth Loop Engine</h1>
            <p className="text-gray-400">
              A living organism that feeds on data and grows on command
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg">
              <Repeat className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">
                {compoundingMetrics.loopsCompleted} loops completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Loop Phases */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Self-Reinforcing Growth Loop</h2>
        <div className="space-y-4">
          {loopPhases.map((phase, idx) => (
            <div key={phase.id}>
              <GrowthLoopPhase
                data={phase}
                nextPhase={idx < loopPhases.length - 1 ? loopPhases[idx + 1] : null}
              />
              {idx < loopPhases.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compounding Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Total Optimizations</p>
          <p className="text-2xl font-bold text-white">{compoundingMetrics.totalOptimizations}</p>
          <p className="text-xs text-status-live mt-1">+23 this week</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Cumulative Revenue Lift</p>
          <p className="text-2xl font-bold text-status-live">
            {formatCurrency(compoundingMetrics.cumulativeRevenueLift)}
          </p>
          <p className="text-xs text-gray-500 mt-1">From optimizations</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Loops Completed</p>
          <p className="text-2xl font-bold text-white">{compoundingMetrics.loopsCompleted}</p>
          <p className="text-xs text-status-live mt-1">Never stops</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Compounding Rate</p>
          <p className="text-2xl font-bold text-status-live">
            {compoundingMetrics.compoundingRate.toFixed(2)}x
          </p>
          <p className="text-xs text-gray-500 mt-1">Per loop cycle</p>
        </div>
      </div>

      {/* Gemini Central Brain */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Gemini AI Central Brain</h2>
        <GeminiCentralBrain decisions={brainDecisions} />
      </div>

      {/* Compounding Revenue Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Compounding Revenue Curve</h3>
          <RealtimeChart
            dataKey="compounding"
            color="#10b981"
            type="area"
            height={300}
            initialValue={1200000}
          />
          <div className="mt-4 text-xs text-gray-400">
            Revenue growth accelerating through optimization loops. Each loop compounds the previous.
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Optimization Impact Score</h3>
          <RealtimeChart
            dataKey="impact"
            color="#3b82f6"
            type="line"
            height={300}
            initialValue={18.4}
          />
          <div className="mt-4 text-xs text-gray-400">
            Impact score measures conversion lift, LTV improvement, and drop-off reduction.
          </div>
        </div>
      </div>

      {/* Live Growth Loop Timeline */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Live Growth Loop Timeline</h2>
        <LoopTimeline events={loopEvents} />
      </div>

      {/* Pre vs Post Scaling Delta */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <h3 className="text-sm font-medium text-white mb-4">Pre vs Post Scaling Delta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-2">Before Optimization</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Conversion Rate</span>
                <span className="text-white">2.4%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">LTV</span>
                <span className="text-white">{formatCurrency(3050)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Drop-off Rate</span>
                <span className="text-white">42.3%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">After Optimization</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Conversion Rate</span>
                <span className="text-status-live">2.84%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">LTV</span>
                <span className="text-status-live">{formatCurrency(3420)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Drop-off Rate</span>
                <span className="text-status-live">35.7%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Delta (Improvement)</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Conversion Rate</span>
                <span className="text-status-live font-medium">+18.4%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">LTV</span>
                <span className="text-status-live font-medium">+12.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Drop-off Rate</span>
                <span className="text-status-live font-medium">-15.6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loop Status */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Loop Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Traffic → Data</span>
              <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            </div>
            <p className="text-sm text-white font-medium">Active</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Data → Optimization</span>
              <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            </div>
            <p className="text-sm text-white font-medium">Processing</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Optimization → Scale</span>
              <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            </div>
            <p className="text-sm text-white font-medium">Active</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Scale → Traffic</span>
              <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            </div>
            <p className="text-sm text-white font-medium">Active</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-gray-400 text-center">
            <Repeat className="w-4 h-4 inline mx-2 text-primary" />
            The loop never stops. Traffic feeds Data. Data feeds Optimization. Optimization feeds Scale. Scale feeds more Traffic.
          </p>
        </div>
      </div>
    </div>
  )
}


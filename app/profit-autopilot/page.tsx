'use client'

import { useEffect, useState } from 'react'
import AutopilotModeSelector, { type AutopilotMode } from '@/components/AutopilotModeSelector'
import AutopilotActionLog from '@/components/AutopilotActionLog'
import GeminiAutopilotBrain from '@/components/GeminiAutopilotBrain'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import ConversionFunnel from '@/components/ConversionFunnel'
import {
  Rocket,
  Power,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Download,
  Pause,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface AutopilotAction {
  id: string
  timestamp: Date
  type: 'budget_scale' | 'budget_throttle' | 'budget_kill' | 'creative_pause' | 'creative_rotate' | 'budget_reallocate'
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  reason: string
  dataUsed: string[]
  forecastImpact: {
    revenue: number
    spend: number
    netProfit: number
    timeframe: string
  }
  riskRating: 'low' | 'medium' | 'high'
  status: 'executed' | 'pending' | 'rejected'
  mode: 'assist' | 'copilot' | 'full'
}

interface AutopilotDecision {
  id: string
  timestamp: Date
  decision: string
  reasoning: string
  causality: {
    attribution: string
    revenuePath: string
    expectedOutcome: string
  }
  simulation: {
    scenario: string
    projectedRevenue: number
    projectedSpend: number
    projectedNetProfit: number
    confidence: number
  }
  risks: string[]
  opportunities: string[]
  recommendation: string
}

export default function ProfitAutopilotPage() {
  const [autopilotMode, setAutopilotMode] = useState<AutopilotMode>('observe')
  const [isAutopilotActive, setIsAutopilotActive] = useState(false)

  const [metrics, setMetrics] = useState({
    totalBudgetDeployed: 84700,
    totalRevenueAttributed: 321400,
    netProfit: 236700,
    roi: 3.8,
    activeCampaigns: 24,
    fatiguedCreatives: 3,
    riskScore: 0.12,
  })

  const [funnelData] = useState([
    { name: 'Impressions', value: 1247800, color: '#3b82f6' },
    { name: 'Clicks', value: 34200, color: '#10b981' },
    { name: 'Landing Page', value: 28900, color: '#f59e0b' },
    { name: 'Assessment Started', value: 12400, color: '#ef4444' },
    { name: 'Assessment Completed', value: 8900, color: '#8b5cf6' },
    { name: 'Clinic Lead', value: 3400, color: '#ec4899' },
    { name: 'Revenue', value: 2890, color: '#14b8a6' },
  ])

  const [autopilotActions] = useState<AutopilotAction[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'budget_scale',
      platform: 'tiktok',
      reason: 'ROAS > 3.5x for 3 consecutive windows. Conversion velocity increasing. Hook retention stable.',
      dataUsed: ['ROAS (3.8x)', 'Conversion velocity (+12%)', 'Hook retention (78%)', 'CPA ($72)'],
      forecastImpact: {
        revenue: 42300,
        spend: 12400,
        netProfit: 29900,
        timeframe: '6 days',
      },
      riskRating: 'low',
      status: autopilotMode === 'full' ? 'executed' : 'pending',
      mode: autopilotMode as 'assist' | 'copilot' | 'full',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1800000),
      type: 'creative_rotate',
      platform: 'meta',
      reason: 'Creative fatigue detected. Hook retention collapsed from 78% to 34%. Engagement velocity decay 24%.',
      dataUsed: ['Hook retention (34%)', 'Engagement decay (24%)', 'Frequency (4.8x)', 'CTR decay (18.5%)'],
      forecastImpact: {
        revenue: 31200,
        spend: 8900,
        netProfit: 22300,
        timeframe: '48 hours',
      },
      riskRating: 'low',
      status: 'executed',
      mode: 'copilot',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3600000),
      type: 'budget_reallocate',
      platform: 'global',
      reason: 'Instagram oversaturated in LA. TikTok Miami showing 45% lower CPA. Reallocating budget to highest LTV funnel.',
      dataUsed: ['Geo CPA variance (Miami -45%)', 'Market saturation (LA 78%)', 'LTV funnel analysis', 'Revenue attribution'],
      forecastImpact: {
        revenue: 89400,
        spend: 24200,
        netProfit: 65200,
        timeframe: '7 days',
      },
      riskRating: 'medium',
      status: 'executed',
      mode: 'full',
    },
  ])

  const [geminiDecisions] = useState<AutopilotDecision[]>([
    {
      id: '1',
      timestamp: new Date(),
      decision: 'Scaling TikTok campaign 18% yields +$42,300 net over 6 days',
      reasoning:
        'Revenue causality chain: Impression → Click → Assessment → Clinic Lead → Revenue. Current TikTok campaign shows 3.8x ROAS with stable hook retention (78%). Conversion velocity increasing 12% over 7d. Attribution data confirms 67% of revenue traced to TikTok funnel. Budget increase from $52K to $61.4K (+18%) projected to generate $42.3K additional revenue with $12.4K spend, netting $29.9K profit.',
      causality: {
        attribution: '67% of TikTok impressions convert through clinic lead funnel',
        revenuePath: 'Click ($2.89 CPC) → Assessment Start (36% rate) → Completion (72% rate) → Clinic Lead (38% rate) → Revenue ($342 avg LTV)',
        expectedOutcome: '+$29.9K net profit over 6 days with 91% confidence',
      },
      simulation: {
        scenario: 'Scale TikTok budget 18% (micro-ramp). Maintain current creative mix. Expand targeting to age 35-45 in Miami geo-pocket.',
        projectedRevenue: 42300,
        projectedSpend: 12400,
        projectedNetProfit: 29900,
        confidence: 0.91,
      },
      risks: [
        'Audience saturation may accelerate with increased spend',
        'CPM inflation possible in Miami market (currently stable)',
      ],
      opportunities: [
        'Miami geo-pocket showing 45% lower CPA vs network average',
        'Untapped age 35-45 demographic in Miami with high LTV potential',
        'Competitor pullback detected - market share opportunity',
      ],
      recommendation: 'Execute budget scale immediately. Monitor hook retention and frequency closely.',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000),
      decision: 'Instagram audience fatigue will destroy ROI in 36 hours if not rotated',
      reasoning:
        'Silent loss detection: Instagram Reels creative showing hook retention collapse from 78% to 34% over 14 days. Engagement velocity decay at 24%. Frequency at 4.8x exceeds optimal 2.5x threshold. Revenue attribution shows decoupling - spend up 12% but revenue flat. Creative lifespan expired. Psychological burnout confirmed.',
      causality: {
        attribution: '42% of Instagram spend no longer converting due to creative fatigue',
        revenuePath: 'Click → Assessment Start (declining 18%) → Completion (declining 12%) → Revenue (flat despite spend increase)',
        expectedOutcome: 'ROI will drop below 2.0x within 36 hours without creative rotation',
      },
      simulation: {
        scenario: 'Rotate to backup creative with different hook structure. Reduce frequency to 2.0x via targeting refinement.',
        projectedRevenue: 31200,
        projectedSpend: 8900,
        projectedNetProfit: 22300,
        confidence: 0.94,
      },
      risks: [
        'Backup creative may not perform at same level initially',
        'Audience may have broader platform fatigue beyond single creative',
      ],
      opportunities: [
        'Fresh creative expected to restore hook retention to 65-70%',
        'Frequency reduction will improve engagement velocity',
        'Protected $22.3K in potential lost revenue',
      ],
      recommendation: 'Rotate creative immediately. Freeze budget until new creative stabilizes.',
    },
  ])

  useEffect(() => {
    if (autopilotMode === 'full' && !isAutopilotActive) {
      setIsAutopilotActive(true)
    } else if (autopilotMode === 'observe') {
      setIsAutopilotActive(false)
    }
  }, [autopilotMode])

  const handleModeChange = async (newMode: AutopilotMode) => {
    await createAuditEntry('autopilot_mode_change', {
      oldMode: autopilotMode,
      newMode,
      timestamp: new Date(),
    })
    setAutopilotMode(newMode)
  }

  const handleKillSwitch = async (platform?: 'google' | 'tiktok' | 'meta') => {
    await createAuditEntry('autopilot_kill_switch', {
      platform: platform || 'global',
      mode: autopilotMode,
      timestamp: new Date(),
    })
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Ads Profit Autopilot System</h1>
            <p className="text-gray-400">
              A hedge fund, a growth team, and a data science lab combined into one brain
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={isAutopilotActive ? 'live' : 'offline'} />
            <button
              onClick={() => handleKillSwitch()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              <Power className="w-4 h-4" />
              Global Kill Switch
            </button>
          </div>
        </div>
      </div>

      {/* Autopilot Mode Selector */}
      <div className="mb-8">
        <AutopilotModeSelector mode={autopilotMode} onChange={handleModeChange} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Budget Deployed (Today)</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalBudgetDeployed)}</p>
          <p className="text-xs text-status-live mt-1">+12.3% vs yesterday</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Revenue Attributed</p>
          <p className="text-2xl font-bold text-status-live">{formatCurrency(metrics.totalRevenueAttributed)}</p>
          <p className="text-xs text-gray-500 mt-1">Real-time tracking</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Net Profit</p>
          <p className="text-2xl font-bold text-status-live">{formatCurrency(metrics.netProfit)}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.roi.toFixed(2)}x ROI</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Risk Score</p>
          <p className="text-2xl font-bold text-white">{(metrics.riskScore * 100).toFixed(1)}%</p>
          <p className="text-xs text-status-live mt-1">Low risk</p>
        </div>
      </div>

      {/* Unified Attribution Funnel */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Unified Attribution Engine: Impression → Revenue
        </h2>
        <ConversionFunnel data={funnelData} title="End-to-End Revenue Attribution" />
      </div>

      {/* Gemini Autopilot Brain */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Gemini Autopilot Brain</h2>
        <GeminiAutopilotBrain decisions={geminiDecisions} />
      </div>

      {/* Real-Time Capital Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Budget Allocation by Platform</h3>
          <RealtimeChart
            dataKey="allocation"
            color="#3b82f6"
            type="area"
            height={250}
            initialValue={85000}
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Google</p>
              <p className="text-white font-medium">47.4%</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">TikTok</p>
              <p className="text-white font-medium">30.4%</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Meta</p>
              <p className="text-white font-medium">22.2%</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Profit Velocity</h3>
          <RealtimeChart
            dataKey="profit"
            color="#10b981"
            type="line"
            height={250}
            initialValue={250000}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">24h Profit</p>
              <p className="text-status-live font-medium">{formatCurrency(236700)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">7d Trend</p>
              <p className="text-status-live font-medium">+18.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Autopilot Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Real-Time Autopilot Actions</h2>
        <AutopilotActionLog actions={autopilotActions} />
      </div>

      {/* Risk Control Dashboard */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Risk Control Engine</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-2">Max Daily Loss Limit</p>
            <p className="text-lg font-bold text-white">{formatCurrency(50000)}</p>
            <div className="mt-2 w-full bg-dark-accent rounded-full h-2">
              <div className="bg-status-live h-2 rounded-full" style={{ width: '23%' }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Platform Drawdown Cap</p>
            <p className="text-lg font-bold text-white">15%</p>
            <p className="text-xs text-status-live mt-1">All platforms within limit</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Emergency Stop-Loss</p>
            <p className="text-lg font-bold text-white">25%</p>
            <p className="text-xs text-status-live mt-1">Not triggered</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Volatility Dampening</p>
            <p className="text-lg font-bold text-white">0.85x</p>
            <p className="text-xs text-status-live mt-1">Active</p>
          </div>
        </div>
      </div>

      {/* Superadmin Control Layer */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Superadmin Control Layer</h2>
          <button
            onClick={() => createAuditEntry('export_autopilot_log', {})}
            className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export Change Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleKillSwitch('google')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300"
          >
            <Pause className="w-4 h-4" />
            Kill Google Ads
          </button>
          <button
            onClick={() => handleKillSwitch('tiktok')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300"
          >
            <Pause className="w-4 h-4" />
            Kill TikTok Ads
          </button>
          <button
            onClick={() => handleKillSwitch('meta')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300"
          >
            <Pause className="w-4 h-4" />
            Kill Meta Ads
          </button>
          <button
            onClick={() => createAuditEntry('manual_budget_override', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors text-sm text-gray-300"
          >
            <Zap className="w-4 h-4" />
            Manual Override
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-gray-400">
            Every AI decision includes: Reason, Data Used, Forecast Impact, Risk Rating. All actions logged with SHA-256 signatures.
          </p>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import BudgetScalingAction from '@/components/BudgetScalingAction'
import InputSignalMonitor from '@/components/InputSignalMonitor'
import GeminiPrediction from '@/components/GeminiPrediction'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  Zap,
  AlertTriangle,
  Power,
  Settings,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Pause,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface ScalingAction {
  id: string
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  action: 'scale_up' | 'scale_down' | 'freeze' | 'kill' | 'throttle'
  magnitude: 'micro' | 'medium' | 'hard'
  amount: number
  reason: string
  confidence: number
  timestamp: Date
  status: 'pending' | 'executed' | 'rejected'
  impact?: {
    expectedRevenue: number
    expectedSpend: number
    expectedROI: number
  }
}

interface Prediction {
  id: string
  timeframe: '24h' | '72h' | '7d'
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  prediction: string
  confidence: number
  recommendations: string[]
  risks: string[]
  opportunities: string[]
  expectedImpact?: {
    revenue: number
    spend: number
    roas: number
  }
}

export default function BudgetAutoScalingPage() {
  const [isAutoScalingEnabled, setIsAutoScalingEnabled] = useState(true)
  const [pendingActions, setPendingActions] = useState<ScalingAction[]>([
    {
      id: '1',
      platform: 'tiktok',
      action: 'scale_up',
      magnitude: 'medium',
      amount: 5200,
      reason: 'ROAS > 3.5x for 3 consecutive windows. Conversion velocity increasing.',
      confidence: 0.91,
      timestamp: new Date(),
      status: 'pending',
      impact: {
        expectedRevenue: 22400,
        expectedSpend: 5200,
        expectedROI: 4.31,
      },
    },
    {
      id: '2',
      platform: 'google',
      action: 'throttle',
      magnitude: 'micro',
      amount: -1800,
      reason: 'CPA rising past threshold. Quality Score declining on 5 keywords.',
      confidence: 0.87,
      timestamp: new Date(Date.now() - 120000),
      status: 'pending',
      impact: {
        expectedRevenue: 7200,
        expectedSpend: 1800,
        expectedROI: 4.0,
      },
    },
  ])

  const [executedActions] = useState<ScalingAction[]>([
    {
      id: '3',
      platform: 'meta',
      action: 'freeze',
      magnitude: 'medium',
      amount: 0,
      reason: 'Creative fatigue detected. CTR dropping 18% over 48h.',
      confidence: 0.94,
      timestamp: new Date(Date.now() - 3600000),
      status: 'executed',
    },
  ])

  const [inputSignals] = useState([
    { name: 'Avg CPA', value: '$89', target: 85, status: 'warning' as const, trend: 'up' as const },
    { name: 'Avg ROAS', value: '3.8x', target: 3.5, status: 'healthy' as const, trend: 'up' as const },
    { name: 'Conversion Velocity', value: '247/hr', target: 200, status: 'healthy' as const, trend: 'up' as const },
    { name: 'Revenue per Click', value: '$9.31', target: 8.0, status: 'healthy' as const, trend: 'stable' as const },
    { name: 'Time-to-Convert', value: '28 min', target: 30, status: 'healthy' as const, trend: 'down' as const },
    { name: 'Funnel Drop-off', value: '34.2%', target: 35, status: 'healthy' as const, trend: 'down' as const },
    { name: 'Creative Fatigue Score', value: '0.12', target: 0.15, status: 'healthy' as const, trend: 'stable' as const },
    { name: 'Platform Volatility', value: 'Low', target: 1, status: 'healthy' as const, trend: 'stable' as const },
    { name: 'Market Saturation', value: 'Medium', target: 1, status: 'warning' as const, trend: 'up' as const },
    { name: 'Geo ROI Variance', value: '18%', target: 20, status: 'healthy' as const, trend: 'stable' as const },
  ])

  const [riskControls, setRiskControls] = useState({
    maxDailyLoss: 50000,
    perPlatformDrawdown: 0.15,
    emergencyStopLoss: 0.25,
    volatilityDampening: 0.85,
  })

  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      timeframe: '24h',
      platform: 'tiktok',
      prediction:
        'Scale TikTok +22% in Miami. IG is oversaturated. Expected CPA: $92, ROAS: 4.1x. Market fatigue detected in Los Angeles geo-pocket.',
      confidence: 0.89,
      recommendations: [
        'Increase Miami budget allocation by 22%',
        'Reduce Instagram spend in oversaturated markets',
        'Launch 3 new creative variants for Miami campaigns',
      ],
      risks: ['Audience saturation may accelerate with increased spend', 'CPM inflation possible in Miami market'],
      opportunities: [
        'Miami shows 45% lower CPA vs network average',
        'Untapped age 35-45 demographic in Miami',
        'Competitor pullback detected - market share opportunity',
      ],
      expectedImpact: {
        revenue: 31200,
        spend: 7600,
        roas: 4.1,
      },
    },
    {
      id: '2',
      timeframe: '72h',
      platform: 'google',
      prediction:
        'Google Search ROI will decay in 48 hours unless creative refresh occurs. Quality Score declining on "testosterone therapy" keyword cluster. Recommendation: Pause underperforming ad groups, refresh creative on top performers.',
      confidence: 0.92,
      recommendations: [
        'Refresh creative on top 5 ad groups within 24h',
        'Pause 12 underperforming ad groups with QS <6',
        'Increase bid adjustments on high-intent keywords',
      ],
      risks: ['Creative fatigue may accelerate', 'Competition intensifying on core keywords', 'Quality Score decline may continue'],
      opportunities: [
        'New ad format testing window opens in 48h',
        'Competitor campaign pause detected - market share gain',
        'Seasonal search volume increase expected',
      ],
      expectedImpact: {
        revenue: 145000,
        spend: 38000,
        roas: 3.82,
      },
    },
    {
      id: '3',
      timeframe: '7d',
      platform: 'meta',
      prediction:
        'Meta Reels showing strong momentum. Lookalike 1% audience performing 1.8x better than feed. Recommend scaling Reels budget by 30%, reducing feed spend by 15%.',
      confidence: 0.85,
      recommendations: [
        'Shift 30% of feed budget to Reels format',
        'Expand lookalike 1% audience targeting',
        'Pause 8 fatigued feed creatives',
      ],
      risks: ['Reels CPM may increase with increased competition', 'Ad frequency may exceed optimal threshold'],
      opportunities: [
        'Reels format showing 67% higher engagement',
        'Lookalike 1% audience has 45% lower CPA',
        'Platform algorithm favoring video content',
      ],
      expectedImpact: {
        revenue: 89400,
        spend: 24800,
        roas: 3.6,
      },
    },
  ])

  const handleExecuteAction = async (id: string) => {
    const action = pendingActions.find((a) => a.id === id)
    if (!action) return

    await createAuditEntry('execute_scaling_action', {
      actionId: id,
      platform: action.platform,
      action: action.action,
      amount: action.amount,
      reason: action.reason,
    })

    setPendingActions((prev) => prev.filter((a) => a.id !== id))
  }

  const handleRejectAction = async (id: string) => {
    const action = pendingActions.find((a) => a.id === id)
    if (!action) return

    await createAuditEntry('reject_scaling_action', {
      actionId: id,
      platform: action.platform,
      reason: 'Superadmin override',
    })

    setPendingActions((prev) => prev.filter((a) => a.id !== id))
  }

  const handleToggleAutoScaling = async () => {
    const newState = !isAutoScalingEnabled
    setIsAutoScalingEnabled(newState)
    await createAuditEntry('toggle_auto_scaling', {
      enabled: newState,
      timestamp: new Date(),
    })
  }

  const handleRiskControlUpdate = async (field: string, value: number) => {
    setRiskControls((prev) => {
      const oldValue = prev[field as keyof typeof prev]
      const newControls = { ...prev, [field]: value }
      createAuditEntry('update_risk_control', {
        field,
        oldValue,
        newValue: value,
        timestamp: new Date(),
      })
      return newControls
    })
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Budget Auto-Scaling Engine</h1>
            <p className="text-gray-400">
              Automated hedge-fund logic controlling paid traffic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={isAutoScalingEnabled ? 'live' : 'offline'} />
            <button
              onClick={handleToggleAutoScaling}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isAutoScalingEnabled
                  ? 'bg-status-live/20 text-status-live border border-status-live/30 hover:bg-status-live/30'
                  : 'bg-dark-accent text-gray-300 border border-dark-border hover:text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {isAutoScalingEnabled ? 'Auto-Scaling ON' : 'Auto-Scaling OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Total Budget Managed</p>
          <p className="text-2xl font-bold text-white">$84.7K</p>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Actions Executed (24h)</p>
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-status-live mt-1">+3 pending</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Avg ROAS</p>
          <p className="text-2xl font-bold text-status-live">3.8x</p>
          <p className="text-xs text-gray-500 mt-1">Network average</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Risk Score</p>
          <p className="text-2xl font-bold text-status-live">Low</p>
          <p className="text-xs text-gray-500 mt-1">All controls active</p>
        </div>
      </div>

      {/* Input Signals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Input Signal Monitoring</h2>
        <InputSignalMonitor signals={inputSignals} />
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Pending Scaling Actions</h2>
            <span className="text-sm text-gray-400">{pendingActions.length} actions require approval</span>
          </div>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <BudgetScalingAction
                key={action.id}
                action={action}
                onExecute={handleExecuteAction}
                onReject={handleRejectAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Executed Actions History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Executed Actions</h2>
        <div className="space-y-3">
          {executedActions.map((action) => (
            <BudgetScalingAction key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Gemini Predictions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Gemini AI Predictive Budgeting</h2>
        <GeminiPrediction predictions={predictions} />
      </div>

      {/* Risk Control System */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">Risk Control System</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Max Daily Loss Limit</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10000"
                max="100000"
                step="5000"
                value={riskControls.maxDailyLoss}
                onChange={(e) =>
                  handleRiskControlUpdate('maxDailyLoss', parseInt(e.target.value))
                }
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-white w-20 text-right">
                {formatCurrency(riskControls.maxDailyLoss)}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Per-Platform Drawdown Cap</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={riskControls.perPlatformDrawdown}
                onChange={(e) =>
                  handleRiskControlUpdate('perPlatformDrawdown', parseFloat(e.target.value))
                }
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-white w-16 text-right">
                {(riskControls.perPlatformDrawdown * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Emergency Stop-Loss Trigger</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={riskControls.emergencyStopLoss}
                onChange={(e) =>
                  handleRiskControlUpdate('emergencyStopLoss', parseFloat(e.target.value))
                }
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-white w-16 text-right">
                {(riskControls.emergencyStopLoss * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Volatility Dampening Factor</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={riskControls.volatilityDampening}
                onChange={(e) =>
                  handleRiskControlUpdate('volatilityDampening', parseFloat(e.target.value))
                }
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-white w-16 text-right">
                {riskControls.volatilityDampening.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Scaling Rules Visualization */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Auto-Scaling Rules Engine</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Scaling Triggers</h3>
            <div className="space-y-3">
              {[
                {
                  rule: 'If ROAS > 3.5x for 3 consecutive windows',
                  action: 'Scale up (micro: 5-10%)',
                  status: 'active',
                },
                {
                  rule: 'If CPA rises past $95 threshold',
                  action: 'Throttle spend (micro: 5-10%)',
                  status: 'active',
                },
                {
                  rule: 'If revenue decouples from spend (>20% variance)',
                  action: 'Kill instantly',
                  status: 'active',
                },
                {
                  rule: 'If creative fatigue detected (CTR drop >15%)',
                  action: 'Freeze creative only',
                  status: 'active',
                },
                {
                  rule: 'If lead quality degrades (conversion rate drop >10%)',
                  action: 'Reduce traffic source (medium: 15-30%)',
                  status: 'active',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-dark-accent border border-dark-border rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-status-live mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-white mb-1">{item.rule}</p>
                    <p className="text-xs text-gray-400">→ {item.action}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-status-live/20 text-status-live rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Budget Allocation Trend</h3>
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
        </div>
      </div>

      {/* Superadmin Override Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Superadmin Override Controls</h2>
          <button
            onClick={() => createAuditEntry('export_autoscaling_log', {})}
            className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-xs font-medium text-white mb-3">Manual Budget Override</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Platform</label>
                <select className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
                  <option>Google Ads</option>
                  <option>TikTok Ads</option>
                  <option>Meta Ads</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Budget Amount</label>
                <input
                  type="number"
                  placeholder="$50,000"
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                onClick={() =>
                  createAuditEntry('manual_budget_override', {
                    platform: 'google',
                    amount: 50000,
                    reason: 'Superadmin override',
                  })
                }
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-xs font-medium"
              >
                Apply Override
              </button>
            </div>
          </div>

          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-xs font-medium text-white mb-3">Hard Budget Locks</h3>
            <div className="space-y-2">
              {[
                { platform: 'Google Ads', locked: false },
                { platform: 'TikTok Ads', locked: false },
                { platform: 'Meta Ads', locked: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{item.platform}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.locked}
                      onChange={() =>
                        createAuditEntry('toggle_budget_lock', {
                          platform: item.platform,
                          locked: !item.locked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-xs font-medium text-white mb-3">Platform-Level Controls</h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  createAuditEntry('platform_kill', { platform: 'google', action: 'pause' })
                }
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-xs text-left"
              >
                <Pause className="w-3 h-3 inline mr-2" />
                Pause Google Ads
              </button>
              <button
                onClick={() =>
                  createAuditEntry('platform_kill', { platform: 'tiktok', action: 'pause' })
                }
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-xs text-left"
              >
                <Pause className="w-3 h-3 inline mr-2" />
                Pause TikTok Ads
              </button>
              <button
                onClick={() =>
                  createAuditEntry('platform_kill', { platform: 'meta', action: 'pause' })
                }
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-xs text-left"
              >
                <Pause className="w-3 h-3 inline mr-2" />
                Pause Meta Ads
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-gray-400">
            All override actions are logged with SHA-256 signatures. Immutable audit trail maintained.
          </p>
        </div>
      </div>
    </div>
  )
}


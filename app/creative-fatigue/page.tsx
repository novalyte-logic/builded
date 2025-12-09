'use client'

import { useEffect, useState } from 'react'
import FatigueClassification from '@/components/FatigueClassification'
import CreativeLeaderboard from '@/components/CreativeLeaderboard'
import FatigueAnalysis from '@/components/FatigueAnalysis'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  AlertCircle,
  RefreshCw,
  Pause,
  Play,
  TrendingDown,
  Activity,
  Zap,
  Download,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'
import type { FatigueLevel } from '@/components/FatigueClassification'

interface Creative {
  id: string
  name: string
  platform: 'google' | 'tiktok' | 'meta'
  fatigueLevel: FatigueLevel
  fatigueScore: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  conversions: number
  cpa: number
  roas: number
  spend: number
  revenue: number
  frequency: number
  engagementRate: number
  status: 'active' | 'paused' | 'pending_rotation'
  signals: {
    ctrDecay: number
    cpmInflation: number
    frequency: number
    engagementDecay: number
    hookRetention?: number
    watchTime?: number
    scrollThrough?: number
    dwellTime?: number
  }
}

interface FatigueAnalysis {
  id: string
  creativeId: string
  creativeName: string
  platform: 'google' | 'tiktok' | 'meta'
  analysis: string
  rootCause: 'psychological_burnout' | 'targeting_problem' | 'message_exhaustion' | 'platform_saturation' | 'over_exposure'
  confidence: number
  recommendations: string[]
  urgency: 'high' | 'medium' | 'low'
}

export default function CreativeFatiguePage() {
  const [creatives, setCreatives] = useState<Creative[]>([
    {
      id: '1',
      name: 'TikTok - TRT Testimonial #1247',
      platform: 'tiktok',
      fatigueLevel: 'red',
      fatigueScore: 87,
      impressions: 234000,
      clicks: 4200,
      ctr: 0.018,
      cpm: 3.45,
      conversions: 124,
      cpa: 98,
      roas: 2.8,
      spend: 12150,
      revenue: 34020,
      frequency: 4.8,
      engagementRate: 0.12,
      status: 'active',
      signals: {
        ctrDecay: 18.5,
        cpmInflation: 23.2,
        frequency: 4.8,
        engagementDecay: 0.24,
        hookRetention: 0.34,
        watchTime: 8.2,
      },
    },
    {
      id: '2',
      name: 'Google - Search Ad "Testosterone Therapy"',
      platform: 'google',
      fatigueLevel: 'orange',
      fatigueScore: 68,
      impressions: 456000,
      clicks: 8900,
      ctr: 0.0195,
      cpm: 2.12,
      conversions: 267,
      cpa: 76,
      roas: 3.9,
      spend: 20300,
      revenue: 79170,
      frequency: 3.2,
      engagementRate: 0.18,
      status: 'active',
      signals: {
        ctrDecay: 12.3,
        cpmInflation: 8.7,
        frequency: 3.2,
        engagementDecay: 0.15,
      },
    },
    {
      id: '3',
      name: 'Instagram Reels - Before/After Transformation',
      platform: 'meta',
      fatigueLevel: 'yellow',
      fatigueScore: 42,
      impressions: 189000,
      clicks: 5100,
      ctr: 0.027,
      cpm: 4.12,
      conversions: 178,
      cpa: 89,
      roas: 4.2,
      spend: 15840,
      revenue: 66528,
      frequency: 2.1,
      engagementRate: 0.23,
      status: 'active',
      signals: {
        ctrDecay: 5.2,
        cpmInflation: 4.3,
        frequency: 2.1,
        engagementDecay: 0.08,
        scrollThrough: 0.67,
      },
    },
    {
      id: '4',
      name: 'TikTok - Men\'s Health Tips Hook',
      platform: 'tiktok',
      fatigueLevel: 'green',
      fatigueScore: 18,
      impressions: 156000,
      clicks: 3200,
      ctr: 0.0205,
      cpm: 2.89,
      conversions: 145,
      cpa: 72,
      roas: 4.5,
      spend: 10440,
      revenue: 46980,
      frequency: 1.8,
      engagementRate: 0.28,
      status: 'active',
      signals: {
        ctrDecay: -2.1,
        cpmInflation: -1.2,
        frequency: 1.8,
        engagementDecay: 0.02,
        hookRetention: 0.78,
        watchTime: 24.5,
      },
    },
    {
      id: '5',
      name: 'Google Display - Retargeting Banner',
      platform: 'google',
      fatigueLevel: 'red',
      fatigueScore: 92,
      impressions: 678000,
      clicks: 3400,
      ctr: 0.005,
      cpm: 1.45,
      conversions: 89,
      cpa: 145,
      roas: 1.8,
      spend: 12900,
      revenue: 23220,
      frequency: 6.2,
      engagementRate: 0.08,
      status: 'paused',
      signals: {
        ctrDecay: 34.5,
        cpmInflation: 12.8,
        frequency: 6.2,
        engagementDecay: 0.42,
      },
    },
  ])

  const [analyses] = useState<FatigueAnalysis[]>([
    {
      id: '1',
      creativeId: '1',
      creativeName: 'TikTok - TRT Testimonial #1247',
      platform: 'tiktok',
      analysis:
        'Creative fatigue detected. Messaging no longer creating novelty. Hook retention dropped from 78% to 34% over 14 days. Watch-time collapsed from 28s to 8.2s. Psychological burnout confirmed - audience has seen this messaging 4.8x on average. Creative message exhausted.',
      rootCause: 'psychological_burnout',
      confidence: 0.94,
      recommendations: [
        'Pause creative immediately to prevent further audience burn',
        'Rotate to backup creative with different hook structure',
        'Narrow targeting to reduce frequency to <2x',
        'Launch A/B test with 3 new hook variants',
      ],
      urgency: 'high',
    },
    {
      id: '2',
      creativeId: '2',
      creativeName: 'Google - Search Ad "Testosterone Therapy"',
      platform: 'google',
      analysis:
        'Audience fatigue due to over-frequency. Quality Score declining from 8.2 to 6.4. Ad blindness setting in after 3.2x exposure. CTR decay accelerating (12.3% over 7d). Not a targeting issue - search intent remains strong. Recommendation: Rotate ad copy variations or implement frequency capping.',
      rootCause: 'over_exposure',
      confidence: 0.91,
      recommendations: [
        'Implement frequency cap at 2.5x per user',
        'Rotate ad copy with new value propositions',
        'A/B test headline variations to maintain novelty',
      ],
      urgency: 'medium',
    },
    {
      id: '3',
      creativeId: '3',
      creativeName: 'Instagram Reels - Before/After Transformation',
      platform: 'meta',
      analysis:
        'Early decay signals detected. Reels format still performing but scroll-through rate declining from 78% to 67%. Frequency at healthy 2.1x but engagement velocity slowing. Monitor closely - fatigue onset expected in 5-7 days if trend continues.',
      rootCause: 'message_exhaustion',
      confidence: 0.78,
      recommendations: [
        'Prepare backup creative variants',
        'Test new hook in next 48h',
        'Monitor frequency closely',
      ],
      urgency: 'low',
    },
  ])

  const [autoActions, setAutoActions] = useState([
    {
      id: '1',
      creativeId: '5',
      creativeName: 'Google Display - Retargeting Banner',
      action: 'auto_paused',
      reason: 'Fatigue score exceeded 90 threshold. ROAS below 2.0x',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '2',
      creativeId: '1',
      creativeName: 'TikTok - TRT Testimonial #1247',
      action: 'alert_sent',
      reason: 'Fatigue score: 87. Hook retention collapse detected.',
      timestamp: new Date(Date.now() - 3600000),
    },
  ])

  const handlePauseCreative = async (id: string) => {
    const creative = creatives.find((c) => c.id === id)
    if (!creative) return

    await createAuditEntry('pause_creative', {
      creativeId: id,
      creativeName: creative.name,
      platform: creative.platform,
      fatigueScore: creative.fatigueScore,
      reason: 'Manual pause due to fatigue',
    })

    setCreatives((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paused' as const } : c))
    )
  }

  const handleRotateCreative = async (id: string) => {
    const creative = creatives.find((c) => c.id === id)
    if (!creative) return

    await createAuditEntry('rotate_creative', {
      creativeId: id,
      creativeName: creative.name,
      platform: creative.platform,
      fatigueScore: creative.fatigueScore,
      reason: 'Creative rotation triggered',
    })

    setCreatives((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'pending_rotation' as const } : c))
    )
  }

  const fatigueDistribution = {
    green: creatives.filter((c) => c.fatigueLevel === 'green').length,
    yellow: creatives.filter((c) => c.fatigueLevel === 'yellow').length,
    orange: creatives.filter((c) => c.fatigueLevel === 'orange').length,
    red: creatives.filter((c) => c.fatigueLevel === 'red').length,
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Creative Fatigue Detection Engine</h1>
            <p className="text-gray-400">
              Neural network hunting ad blindness before the market feels it
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <button
              onClick={() => createAuditEntry('export_fatigue_report', {})}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Total Creatives Monitored</p>
          <p className="text-2xl font-bold text-white">{creatives.length}</p>
          <p className="text-xs text-status-live mt-1">
            {creatives.filter((c) => c.status === 'active').length} active
          </p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Fatigue Alerts</p>
          <p className="text-2xl font-bold text-status-degraded">
            {fatigueDistribution.orange + fatigueDistribution.red}
          </p>
          <p className="text-xs text-gray-500 mt-1">Orange: {fatigueDistribution.orange}, Red: {fatigueDistribution.red}</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Avg Fatigue Score</p>
          <p className="text-2xl font-bold text-white">
            {Math.round(
              creatives.reduce((sum, c) => sum + c.fatigueScore, 0) / creatives.length
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">/100 (lower is better)</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Auto-Actions (24h)</p>
          <p className="text-2xl font-bold text-white">{autoActions.length}</p>
          <p className="text-xs text-status-live mt-1">Creatives protected</p>
        </div>
      </div>

      {/* Fatigue Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-status-live/20 border border-status-live/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-status-live">Fresh</span>
            <span className="text-lg font-bold text-status-live">{fatigueDistribution.green}</span>
          </div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-400">Early Decay</span>
            <span className="text-lg font-bold text-yellow-400">{fatigueDistribution.yellow}</span>
          </div>
        </div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-400">Fatigue Onset</span>
            <span className="text-lg font-bold text-orange-400">{fatigueDistribution.orange}</span>
          </div>
        </div>
        <div className="bg-status-offline/20 border border-status-offline/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-status-offline">Creative Dead</span>
            <span className="text-lg font-bold text-status-offline">{fatigueDistribution.red}</span>
          </div>
        </div>
      </div>

      {/* Critical Fatigue Creatives */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Critical Fatigue Alert</h2>
        <div className="space-y-3">
          {creatives
            .filter((c) => c.fatigueLevel === 'red' || c.fatigueLevel === 'orange')
            .map((creative) => (
              <FatigueClassification
                key={creative.id}
                level={creative.fatigueLevel}
                creativeName={creative.name}
                platform={creative.platform}
                signals={creative.signals}
                score={creative.fatigueScore}
              />
            ))}
        </div>
      </div>

      {/* Creative Leaderboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Creative Performance Leaderboard</h2>
        <CreativeLeaderboard
          creatives={creatives}
          onPause={handlePauseCreative}
          onRotate={handleRotateCreative}
        />
      </div>

      {/* Gemini AI Analysis */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Gemini AI Fatigue Analysis</h2>
        <FatigueAnalysis analyses={analyses} />
      </div>

      {/* Fatigue Timeline Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">CTR Decay Curve</h3>
          <RealtimeChart
            dataKey="ctrDecay"
            color="#ef4444"
            type="line"
            height={250}
            initialValue={0.025}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Engagement Velocity Decay</h3>
          <RealtimeChart
            dataKey="engagementDecay"
            color="#f59e0b"
            type="area"
            height={250}
            initialValue={0.85}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Hook Retention Collapse (TikTok)</h3>
          <RealtimeChart
            dataKey="hookRetention"
            color="#ef4444"
            type="line"
            height={250}
            initialValue={0.78}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Frequency Inflation</h3>
          <RealtimeChart
            dataKey="frequency"
            color="#f59e0b"
            type="area"
            height={250}
            initialValue={2.5}
          />
        </div>
      </div>

      {/* Auto-Actions Log */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <h3 className="text-sm font-medium text-white mb-4">Auto-Actions Log (24h)</h3>
        <div className="space-y-3">
          {autoActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start justify-between p-3 bg-dark-accent border border-dark-border rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">{action.creativeName}</p>
                  <p className="text-xs text-gray-300">{action.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                  {action.action.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {action.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Action Settings */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Auto-Action Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Auto-Pause on Red Fatigue</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Pause creatives with fatigue score &gt; 80</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Auto-Rotate on Orange</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Rotate backup creative when fatigue score &gt; 60</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Alert on Yellow</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Send alert when fatigue score &gt; 40</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Protect CPA Ceilings</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Pause if CPA exceeds threshold by 20%</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Downgrade Budget on Fatigue</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Reduce budget allocation by 25% on orange fatigue</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300">Frequency Capping</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Cap frequency at 3x per user automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
}


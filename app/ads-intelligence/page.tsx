'use client'

import { useEffect, useState } from 'react'
import MetricWithSparkline from '@/components/MetricWithSparkline'
import PlatformPanel from '@/components/PlatformPanel'
import ConversionFunnel from '@/components/ConversionFunnel'
import AIAnalysisPanel from '@/components/AIAnalysisPanel'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  TrendingUp,
  AlertTriangle,
  Power,
  Pause,
  Settings,
  Download,
  Zap,
  RefreshCw,
  DollarSign,
  MousePointerClick,
  Target,
  BarChart3,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface Alert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'spend_spike' | 'cpa_deviation' | 'ctr_collapse' | 'conversion_drop' | 'pixel_fail' | 'revenue_decouple'
  title: string
  description: string
  impact: number
  timestamp: Date
}

export default function AdsIntelligencePage() {
  const [globalMetrics, setGlobalMetrics] = useState({
    impressions: 1247800,
    clicks: 34200,
    ctr: 0.0274,
    cpc: 2.45,
    cpa: 89,
    roas: 3.8,
    totalSpend: 83790,
    totalRevenue: 318400,
    netProfit: 234610,
  })

  const [googleMetrics, setGoogleMetrics] = useState({
    impressions: 678900,
    clicks: 18900,
    ctr: 0.0278,
    cpc: 2.12,
    cpa: 76,
    roas: 4.2,
    spend: 40100,
    revenue: 168400,
  })

  const [tiktokMetrics, setTiktokMetrics] = useState({
    impressions: 342100,
    clicks: 8900,
    ctr: 0.026,
    cpc: 2.89,
    cpa: 98,
    roas: 3.4,
    spend: 25700,
    revenue: 87400,
  })

  const [metaMetrics, setMetaMetrics] = useState({
    impressions: 226800,
    clicks: 6400,
    ctr: 0.0282,
    cpc: 2.81,
    cpa: 95,
    roas: 3.6,
    spend: 17990,
    revenue: 64700,
  })

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'high',
      type: 'cpa_deviation',
      title: 'TikTok CPA Increased 23%',
      description: 'CPA jumped from $79 to $98 over 24h. Creative fatigue detected.',
      impact: 18900,
      timestamp: new Date(),
    },
    {
      id: '2',
      severity: 'medium',
      type: 'ctr_collapse',
      title: 'Meta CTR Dropping',
      description: 'Instagram Reels CTR declined 15% vs 7d avg. Audience saturation possible.',
      impact: 3400,
      timestamp: new Date(Date.now() - 3600000),
    },
  ])

  const [funnelData] = useState([
    { name: 'Clicks', value: 34200, color: '#3b82f6' },
    { name: 'Landing Page Views', value: 28900, color: '#10b981' },
    { name: 'Assessment Started', value: 12400, color: '#f59e0b' },
    { name: 'Assessment Completed', value: 8900, color: '#ef4444' },
    { name: 'Clinic Lead', value: 3400, color: '#8b5cf6' },
    { name: 'Revenue', value: 2890, color: '#ec4899' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalMetrics((prev) => ({
        impressions: prev.impressions + Math.floor(Math.random() * 100),
        clicks: prev.clicks + Math.floor(Math.random() * 10),
        ctr: prev.ctr + (Math.random() - 0.5) * 0.001,
        cpc: prev.cpc + (Math.random() - 0.5) * 0.05,
        cpa: prev.cpa + (Math.random() - 0.5) * 2,
        roas: prev.roas + (Math.random() - 0.5) * 0.1,
        totalSpend: prev.totalSpend + Math.floor(Math.random() * 50),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 200),
        netProfit: prev.totalRevenue - prev.totalSpend,
      }))
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleControlAction = async (action: string, details: Record<string, any>) => {
    const auditEntry = await createAuditEntry(action, details, 'superadmin')
    console.log('Audit Entry Created:', auditEntry)
  }

  const googleInsights = [
    'Search campaigns outperforming Display by 2.3x ROAS',
    'Quality Score improved on 12 high-volume keywords',
    'Lost impression share due to budget: 8.2%',
    'Top converting query: "testosterone therapy near me" (3.8% conv rate)',
  ]

  const tiktokInsights = [
    'Creative #T-1247 showing viral signals (thumb-stop: 67%)',
    'CPM increased 12% - audience fatigue detected',
    'Hook retention curve declining on 3 creatives',
    'CPA trending up - recommend creative refresh',
  ]

  const metaInsights = [
    'Reels ads performing 1.8x better than Feed ads',
    'Ad frequency at 4.2 - approaching saturation',
    'Lookalike 1% audience showing 4.1x ROAS',
    'Creative decay detected on 5 ads - pause and refresh',
  ]

  const googleAIInsights = [
    {
      type: 'explanation' as const,
      title: 'CPA Rising',
      content:
        'CPA increased 12% over 7 days. Primary driver: increased competition in "men\'s health" keyword cluster. Quality Score remains stable. Recommendation: increase bid adjustments for top-performing ad groups.',
      confidence: 0.87,
    },
    {
      type: 'prediction' as const,
      title: '72h Forecast',
      content:
        'Projected spend: $42,300. Expected conversions: 556. Forecasted CPA: $76. Budget allocation optimal. No adjustments needed.',
      confidence: 0.82,
    },
    {
      type: 'recommendation' as const,
      title: 'Budget Reallocation',
      content:
        'Shift $2,400 from Display to Search. Search campaigns show 2.3x better ROAS with lower CPA. Expected impact: +$5,520 revenue, -$89 CPA.',
      confidence: 0.91,
    },
  ]

  const tiktokAIInsights = [
    {
      type: 'explanation' as const,
      title: 'Creative Fatigue',
      content:
        'CPM increased 12% with CTR declining 8%. Thumb-stop ratio dropping on 3 top performers. Audience seeing same creative 4.2x on average. Fatigue threshold reached.',
      confidence: 0.94,
    },
    {
      type: 'recommendation' as const,
      title: 'Creative Refresh',
      content:
        'Pause creatives #T-1247, #T-1345, #T-1521. Launch 3 new variants with different hooks. Expected impact: -15% CPM, +22% CTR, -$12 CPA.',
      confidence: 0.88,
    },
  ]

  const metaAIInsights = [
    {
      type: 'alert' as const,
      title: 'Audience Overlap',
      content:
        'Lookalike 1% and Interest targeting overlap at 34%. Efficiency loss detected. Recommendation: exclude lookalike audience from interest campaigns.',
      urgency: 'medium' as const,
      confidence: 0.92,
    },
    {
      type: 'recommendation' as const,
      title: 'Frequency Cap',
      content:
        'Ad frequency at 4.2x exceeds optimal 3.5x. Implement frequency cap of 3/day per user. Expected: -8% spend, +12% CTR, improved ad recall.',
      confidence: 0.85,
    },
  ]

  const googleCampaigns = [
    {
      id: '1',
      name: 'Search - TRT Keywords',
      impressions: 234000,
      clicks: 8900,
      spend: 18800,
      conversions: 247,
      cpa: 76,
      roas: 4.2,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Display - Retargeting',
      impressions: 445000,
      clicks: 10000,
      spend: 21300,
      conversions: 198,
      cpa: 108,
      roas: 2.1,
      status: 'active' as const,
    },
  ]

  const tiktokCampaigns = [
    {
      id: '3',
      name: 'Video Ads - Men\'s Health',
      impressions: 198000,
      clicks: 5100,
      spend: 14700,
      conversions: 150,
      cpa: 98,
      roas: 3.4,
      status: 'active' as const,
    },
    {
      id: '4',
      name: 'Spark Ads - Testimonials',
      impressions: 144100,
      clicks: 3800,
      spend: 11000,
      conversions: 112,
      cpa: 98,
      roas: 3.5,
      status: 'limited' as const,
    },
  ]

  const metaCampaigns = [
    {
      id: '5',
      name: 'Reels - Lookalike 1%',
      impressions: 124000,
      clicks: 3500,
      spend: 9800,
      conversions: 103,
      cpa: 95,
      roas: 3.8,
      status: 'active' as const,
    },
    {
      id: '6',
      name: 'Feed - Interest Targeting',
      impressions: 102800,
      clicks: 2900,
      spend: 8190,
      conversions: 86,
      cpa: 95,
      roas: 3.4,
      status: 'active' as const,
    },
  ]

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Ads Tracking & Traffic Intelligence
            </h1>
            <p className="text-gray-400">
              High-frequency trading terminal for paid traffic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <button
              onClick={() => handleControlAction('export_ads_report', { format: 'csv' })}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <MetricWithSparkline
          title="Total Impressions"
          value={formatNumber(globalMetrics.impressions)}
          delta1h={2.3}
          delta24h={8.7}
          delta7d={15.2}
          trend="up"
        />
        <MetricWithSparkline
          title="Total Clicks"
          value={formatNumber(globalMetrics.clicks)}
          delta1h={1.8}
          delta24h={7.2}
          delta7d={12.4}
          trend="up"
        />
        <MetricWithSparkline
          title="CTR"
          value={`${(globalMetrics.ctr * 100).toFixed(2)}%`}
          delta1h={-0.1}
          delta24h={0.3}
          delta7d={0.8}
          trend="up"
        />
        <MetricWithSparkline
          title="CPC"
          value={formatCurrency(globalMetrics.cpc)}
          delta1h={-1.2}
          delta24h={2.1}
          delta7d={-3.4}
          trend="down"
        />
        <MetricWithSparkline
          title="CPA"
          value={formatCurrency(globalMetrics.cpa)}
          delta1h={0.5}
          delta24h={3.2}
          delta7d={-2.1}
          trend="neutral"
        />
        <MetricWithSparkline
          title="ROAS"
          value={`${globalMetrics.roas.toFixed(2)}x`}
          delta1h={0.1}
          delta24h={0.4}
          delta7d={0.8}
          trend="up"
        />
        <MetricWithSparkline
          title="Total Spend (Today)"
          value={formatCurrency(globalMetrics.totalSpend)}
          delta1h={5.2}
          delta24h={18.7}
          delta7d={24.3}
          trend="up"
        />
        <MetricWithSparkline
          title="Revenue Attributed"
          value={formatCurrency(globalMetrics.totalRevenue)}
          delta1h={4.8}
          delta24h={19.2}
          delta7d={28.1}
          trend="up"
        />
        <MetricWithSparkline
          title="Net Profit"
          value={formatCurrency(globalMetrics.netProfit)}
          delta1h={4.5}
          delta24h={19.5}
          delta7d={31.2}
          trend="up"
        />
        <MetricWithSparkline
          title="Profit Margin"
          value={`${((globalMetrics.netProfit / globalMetrics.totalRevenue) * 100).toFixed(1)}%`}
          delta1h={0.2}
          delta24h={0.8}
          delta7d={2.1}
          trend="up"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Anomaly Detection Alerts</h2>
            <span className="text-sm text-gray-400">{alerts.length} active alerts</span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.severity === 'critical'
                    ? 'border-red-500 bg-red-500/10'
                    : alert.severity === 'high'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-yellow-500 bg-yellow-500/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical'
                          ? 'text-red-400'
                          : alert.severity === 'high'
                          ? 'text-orange-400'
                          : 'text-yellow-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full uppercase ${
                            alert.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400'
                              : alert.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-400">
                          Impact: <span className="text-red-400 font-medium">{formatCurrency(alert.impact)}</span>
                        </span>
                        <span className="text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:text-primary-light transition-colors">
                    Action Required
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Panels */}
      <div className="space-y-6 mb-8">
        <PlatformPanel
          platform="google"
          metrics={googleMetrics}
          campaigns={googleCampaigns}
          topInsights={googleInsights}
        />
        <PlatformPanel
          platform="tiktok"
          metrics={tiktokMetrics}
          campaigns={tiktokCampaigns}
          topInsights={tiktokInsights}
        />
        <PlatformPanel
          platform="meta"
          metrics={metaMetrics}
          campaigns={metaCampaigns}
          topInsights={metaInsights}
        />
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ConversionFunnel data={funnelData} title="Conversion Funnel Attribution" />
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Time-to-Convert Distribution</h3>
          <RealtimeChart
            dataKey="timeToConvert"
            color="#10b981"
            type="area"
            height={250}
            initialValue={1800}
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Avg Time</p>
              <p className="text-white font-medium">28 min</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Median</p>
              <p className="text-white font-medium">15 min</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">P95</p>
              <p className="text-white font-medium">2.3 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AIAnalysisPanel platform="google" insights={googleAIInsights} />
        <AIAnalysisPanel platform="tiktok" insights={tiktokAIInsights} />
        <AIAnalysisPanel platform="meta" insights={metaAIInsights} />
      </div>

      {/* Board-Level Views */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Board-Level Traffic Views</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Spend vs Revenue Curve</h3>
            <RealtimeChart
              dataKey="spendVsRevenue"
              color="#3b82f6"
              type="area"
              height={300}
              initialValue={85000}
            />
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Platform ROI Comparison</h3>
            <div className="space-y-4">
              {[
                { platform: 'Google Ads', roas: 4.2, revenue: 168400, spend: 40100 },
                { platform: 'TikTok Ads', roas: 3.4, revenue: 87400, spend: 25700 },
                { platform: 'Meta Ads', roas: 3.6, revenue: 64700, spend: 17990 },
              ].map((item) => (
                <div key={item.platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{item.platform}</span>
                    <span className="text-sm font-bold text-status-live">{item.roas.toFixed(2)}x</span>
                  </div>
                  <div className="w-full bg-dark-accent rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${(item.roas / 4.5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Superadmin Control Panel */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Superadmin Control Panel</h2>
          <button
            onClick={() => handleControlAction('refresh_all_data', {})}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleControlAction('global_kill_switch', { action: 'pause_all' })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            <Power className="w-4 h-4" />
            Global Kill Switch
          </button>
          <button
            onClick={() => handleControlAction('pause_google', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Pause className="w-4 h-4" />
            Pause Google Ads
          </button>
          <button
            onClick={() => handleControlAction('pause_tiktok', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Pause className="w-4 h-4" />
            Pause TikTok Ads
          </button>
          <button
            onClick={() => handleControlAction('pause_meta', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Pause className="w-4 h-4" />
            Pause Meta Ads
          </button>
          <button
            onClick={() => handleControlAction('set_daily_budget_cap', { amount: 100000 })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <DollarSign className="w-4 h-4" />
            Set Daily Budget Cap
          </button>
          <button
            onClick={() => handleControlAction('enable_auto_scaling', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Toggle Auto-Scaling
          </button>
          <button
            onClick={() => handleControlAction('emergency_spend_cap', { amount: 50000 })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-status-degraded/20 border border-status-degraded/30 text-status-degraded rounded-lg hover:bg-status-degraded/30 transition-colors text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Spend Cap
          </button>
          <button
            onClick={() => handleControlAction('export_audit_log', {})}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export Audit Log
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-gray-400">
            All actions are logged with SHA-256 signatures. Immutable audit trail maintained.
          </p>
        </div>
      </div>
    </div>
  )
}


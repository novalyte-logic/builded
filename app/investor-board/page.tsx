'use client'

import { useEffect, useState } from 'react'
import InvestorNarrative from '@/components/InvestorNarrative'
import MarketDominanceMap from '@/components/MarketDominanceMap'
import FunnelEconomics from '@/components/FunnelEconomics'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  BarChart3,
  Download,
  FileText,
  Presentation,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Target,
  AlertTriangle,
  MapPin,
  ShoppingBag,
  Building2,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

export default function InvestorBoardPage() {
  const [metrics, setMetrics] = useState({
    liveRevenueToday: 41567,
    revenue7d: 291469,
    revenue30d: 1247000,
    trafficVolume: 34200,
    profitMargin: 0.73,
    avgLTV: 3420,
    cac: 245,
    netProfitToday: 30344,
    forecastedRevenue30d: 1450000,
    burnVsProfit: -5000,
  })

  const [trafficByPlatform] = useState({
    google: 18900,
    tiktok: 8900,
    meta: 6400,
  })

  const [geoRevenue] = useState([
    { city: 'Los Angeles', state: 'CA', revenue: 342000, penetration: 12.4, growth: 15.2 },
    { city: 'New York', state: 'NY', revenue: 289000, penetration: 10.8, growth: 12.8 },
    { city: 'Chicago', state: 'IL', revenue: 198000, penetration: 8.2, growth: 8.5 },
    { city: 'Miami', state: 'FL', revenue: 124000, penetration: 6.1, growth: -2.1 },
  ])

  const [categoryRevenue] = useState([
    { category: 'TRT Treatment', revenue: 542000, dominance: 43.4, growth: 18.2 },
    { category: 'GLP-1 Programs', revenue: 289000, dominance: 23.1, growth: 45.3 },
    { category: 'Peptide Therapy', revenue: 156000, dominance: 12.5, growth: 12.1 },
    { category: 'Assessments', revenue: 260000, dominance: 20.8, growth: 8.7 },
  ])

  const [clinicRevenue] = useState([
    { category: 'Premium Clinics', revenue: 489000, dominance: 39.2, growth: 14.2 },
    { category: 'Standard Clinics', revenue: 342000, dominance: 27.4, growth: 8.5 },
    { category: 'Telehealth', revenue: 415000, dominance: 33.2, growth: 22.1 },
  ])

  const [marketplaceRevenue] = useState([
    { category: 'Supplements', revenue: 189000, dominance: 41.4, growth: 12.3 },
    { category: 'Treatment Kits', revenue: 156000, dominance: 34.2, growth: 18.7 },
    { category: 'Lab Tests', revenue: 111000, dominance: 24.3, growth: 8.9 },
  ])

  const [funnelSteps] = useState([
    {
      step: 'Visitor',
      visitors: 34200,
      cost: 2.45,
      revenue: 0,
      netProfit: -83790,
      conversionRate: 1.0,
    },
    {
      step: 'Assessment Started',
      visitors: 12400,
      cost: 6.76,
      revenue: 0,
      netProfit: -83840,
      conversionRate: 0.362,
    },
    {
      step: 'Assessment Completed',
      visitors: 8900,
      cost: 9.42,
      revenue: 0,
      netProfit: -83830,
      conversionRate: 0.260,
    },
    {
      step: 'Clinic Lead',
      visitors: 3400,
      cost: 24.64,
      revenue: 1156000,
      netProfit: 1071600,
      conversionRate: 0.099,
    },
    {
      step: 'Marketplace Purchase',
      visitors: 2890,
      cost: 29.00,
      revenue: 1243000,
      netProfit: 1160300,
      conversionRate: 0.084,
    },
  ])

  const [narratives] = useState([
    {
      id: '1',
      timestamp: new Date(),
      category: 'market_share' as const,
      headline: 'Market share in Miami up 22% QoQ',
      narrative:
        'Miami market penetration increased from 5.0% to 6.1% quarter-over-quarter, representing a 22% gain in market share. Revenue growth driven by telehealth expansion and GLP-1 program adoption. New clinic openings scheduled for Q2 expected to accelerate share gains.',
      metrics: [
        { label: 'Miami Revenue', value: 124000, change: -2.1 },
        { label: 'Market Penetration', value: '6.1%', change: 22 },
        { label: 'QoQ Growth', value: '22%' },
        { label: 'Clinics', value: 4 },
      ],
      context: 'Market share calculated vs. total addressable market for men\'s health services in Miami metro area.',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000),
      category: 'revenue_growth' as const,
      headline: 'Marketplace revenue outpaced clinics this week',
      narrative:
        'Marketplace revenue reached $456K, representing 37% of total revenue and outpacing clinic revenue growth by 18 percentage points. This shift reflects growing consumer preference for at-home treatment options and expanded product portfolio. Marketplace LTV increased 12% due to cross-sell improvements.',
      metrics: [
        { label: 'Marketplace Revenue', value: 456000, change: 18.5 },
        { label: 'Clinic Revenue', value: 748200, change: 8.2 },
        { label: 'Marketplace %', value: '37%', change: 5.2 },
        { label: 'LTV Increase', value: '12%' },
      ],
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000),
      category: 'traffic_quality' as const,
      headline: 'Highest ROI traffic originates from Google Search + Hormone Assessments',
      narrative:
        'Google Search campaigns targeting hormone-related queries show 4.2x ROAS with 3.8% conversion rate to clinic leads. Traffic quality score: 92/100. Hormone assessment funnel demonstrates highest LTV at $3,420 vs. platform average of $2,890. Recommendation: Increase Google Search budget allocation by 15%.',
      metrics: [
        { label: 'Google Search ROAS', value: '4.2x' },
        { label: 'Conversion Rate', value: '3.8%' },
        { label: 'Traffic Quality', value: '92/100' },
        { label: 'LTV', value: 3420 },
      ],
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        liveRevenueToday: prev.liveRevenueToday + Math.floor(Math.random() * 200),
        netProfitToday: prev.netProfitToday + Math.floor(Math.random() * 150),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleExport = async (type: string) => {
    await createAuditEntry('investor_board_export', {
      exportType: type,
      timestamp: new Date(),
    })
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Investor-Grade Traffic & Revenue Board</h1>
            <p className="text-gray-400">
              Bloomberg Terminal for Novalyte™ AI — Truth, not marketing optics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('weekly')}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Level KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Live Revenue (Today)</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.liveRevenueToday)}</p>
          <p className="text-xs text-gray-500 mt-1">Real-time</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Revenue (7d)</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.revenue7d)}</p>
          <p className="text-xs text-status-live mt-1">+12.4% vs prior week</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Revenue (30d)</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.revenue30d)}</p>
          <p className="text-xs text-status-live mt-1">+15.2% MoM</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Profit Margin</p>
          <p className="text-xl font-bold text-status-live">{(metrics.profitMargin * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Net margin</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Net Profit (Today)</p>
          <p className="text-xl font-bold text-status-live">{formatCurrency(metrics.netProfitToday)}</p>
          <p className="text-xs text-status-live mt-1">Live</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Average LTV</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.avgLTV)}</p>
          <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">CAC</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.cac)}</p>
          <p className="text-xs text-status-live mt-1">LTV:CAC = {(metrics.avgLTV / metrics.cac).toFixed(1)}x</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Forecasted Revenue (30d)</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.forecastedRevenue30d)}</p>
          <p className="text-xs text-status-live mt-1">Projected</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Traffic Volume</p>
          <p className="text-xl font-bold text-white">{formatNumber(metrics.trafficVolume)}</p>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Burn vs Profit Delta</p>
          <p className={`text-xl font-bold ${
            metrics.burnVsProfit >= 0 ? 'text-status-live' : 'text-status-offline'
          }`}>
            {formatCurrency(Math.abs(metrics.burnVsProfit))}
          </p>
          <p className={`text-xs mt-1 ${
            metrics.burnVsProfit >= 0 ? 'text-status-live' : 'text-status-offline'
          }`}>
            {metrics.burnVsProfit >= 0 ? 'Profit' : 'Burn'}
          </p>
        </div>
      </div>

      {/* Traffic Quality Board */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Traffic Quality Board</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Traffic by Platform</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Google</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(trafficByPlatform.google)}
                  </span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        (trafficByPlatform.google /
                          (trafficByPlatform.google +
                            trafficByPlatform.tiktok +
                            trafficByPlatform.meta)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">TikTok</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(trafficByPlatform.tiktok)}
                  </span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div
                    className="bg-status-live h-2 rounded-full"
                    style={{
                      width: `${
                        (trafficByPlatform.tiktok /
                          (trafficByPlatform.google +
                            trafficByPlatform.tiktok +
                            trafficByPlatform.meta)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Meta</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(trafficByPlatform.meta)}
                  </span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div
                    className="bg-f59e0b h-2 rounded-full"
                    style={{
                      width: `${
                        (trafficByPlatform.meta /
                          (trafficByPlatform.google +
                            trafficByPlatform.tiktok +
                            trafficByPlatform.meta)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Quality Scores</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Assessment Completion</span>
                  <span className="text-sm font-medium text-status-live">71.8%</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div className="bg-status-live h-2 rounded-full" style={{ width: '71.8%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Lead Quality Score</span>
                  <span className="text-sm font-medium text-status-live">87/100</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div className="bg-status-live h-2 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Bot & Fraud Filtered</span>
                  <span className="text-sm font-medium text-status-live">98.2%</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-2">
                  <div className="bg-status-live h-2 rounded-full" style={{ width: '98.2%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Intent Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">High Intent</span>
                  <span className="text-sm font-medium text-status-live">42%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Medium Intent</span>
                  <span className="text-sm font-medium text-yellow-400">38%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Low Intent</span>
                  <span className="text-sm font-medium text-gray-400">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Dominance Map */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Revenue Dominance Map</h2>
        <MarketDominanceMap
          geoRevenue={geoRevenue}
          categoryRevenue={categoryRevenue}
          clinicRevenue={clinicRevenue}
          marketplaceRevenue={marketplaceRevenue}
        />
      </div>

      {/* Funnel Economics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Funnel Economics Stack</h2>
        <FunnelEconomics steps={funnelSteps} />
      </div>

      {/* Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Revenue Velocity (30d)</h3>
          <RealtimeChart
            dataKey="revenue"
            color="#10b981"
            type="area"
            height={300}
            initialValue={40000}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-white mb-4">Profit Trend</h3>
          <RealtimeChart
            dataKey="profit"
            color="#3b82f6"
            type="line"
            height={300}
            initialValue={30000}
          />
        </div>
      </div>

      {/* Gemini Investor Narrator */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Automated Investor Summaries</h2>
        <InvestorNarrative narratives={narratives} />
      </div>

      {/* Export Modes */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Investor Export Modes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => handleExport('weekly')}
            className="flex flex-col items-center gap-2 px-4 py-4 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-medium">Weekly Update</span>
          </button>
          <button
            onClick={() => handleExport('monthly')}
            className="flex flex-col items-center gap-2 px-4 py-4 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-medium">Monthly Report</span>
          </button>
          <button
            onClick={() => handleExport('board')}
            className="flex flex-col items-center gap-2 px-4 py-4 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
          >
            <Presentation className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-medium">Board Slides</span>
          </button>
          <button
            onClick={() => handleExport('forecast')}
            className="flex flex-col items-center gap-2 px-4 py-4 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-medium">Growth Forecast</span>
          </button>
          <button
            onClick={() => handleExport('waterfall')}
            className="flex flex-col items-center gap-2 px-4 py-4 bg-dark-accent border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
          >
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-medium">Waterfall Tables</span>
          </button>
        </div>
      </div>
    </div>
  )
}


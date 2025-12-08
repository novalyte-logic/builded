'use client'

import { useEffect, useState } from 'react'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import ForecastCurve from '@/components/ForecastCurve'
import ScenarioSlider from '@/components/ScenarioSlider'
import ForecastNarrative from '@/components/ForecastNarrative'
import RevenueLeakAlert from '@/components/RevenueLeakAlert'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  Users,
  Building2,
  ShoppingBag,
  MapPin,
  Activity,
  Settings,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface RevenueLeak {
  id: string
  type: 'clinic' | 'vendor' | 'marketplace' | 'pricing' | 'geo' | 'abandonment'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: number
  fixSuggestion: string
}

export default function RevenuePage() {
  const [scenario, setScenario] = useState<0 | 1 | 2>(1) // 0: downside, 1: base, 2: optimistic
  const scenarioLabels = ['Downside', 'Base', 'Optimistic']
  const scenarioNames = ['downside', 'base', 'optimistic'] as const

  const [metrics, setMetrics] = useState({
    totalRevenue: 1247000,
    dailyRevenue: 41567,
    weeklyRevenue: 291469,
    monthlyRevenue: 1247000,
    revenueGrowth: 12.3,
    avgTransactionValue: 89,
    ltv: 3420,
    cac: 245,
    clinicRevenue: 748200,
    marketplaceRevenue: 456000,
    vendorRevenue: 42800,
    leakDetected: 3,
  })

  const [forecastData, setForecastData] = useState(() => {
    const base = 1300000
    const days = 90
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const trend = 1 + (i / days) * 0.15
      return {
        date: date.toISOString().split('T')[0],
        base: base * trend,
        optimistic: base * trend * 1.2,
        downside: base * trend * 0.85,
        actual: i < 7 ? base * (trend - 0.05) + Math.random() * 10000 : undefined,
      }
    })
  })

  const [revenueLeaks] = useState<RevenueLeak[]>([
    {
      id: '1',
      type: 'clinic',
      severity: 'high',
      title: 'Miami Beach Clinic Underperformance',
      description: 'Clinic revenue down 34% vs network average. Patient volume declining.',
      impact: 48900,
      fixSuggestion: 'Review clinic operations, consider provider rotation, increase marketing spend',
    },
    {
      id: '2',
      type: 'abandonment',
      severity: 'critical',
      title: 'High Cart Abandonment in Marketplace',
      description: '67% abandonment rate on TRT starter kits. Checkout flow issue detected.',
      impact: 124000,
      fixSuggestion: 'Simplify checkout process, add payment options, reduce form fields',
    },
    {
      id: '3',
      type: 'geo',
      severity: 'medium',
      title: 'Patient-Clinic Geographic Mismatch',
      description: '12,400 patients in Los Angeles but only 8 clinics. High wait times.',
      impact: 89200,
      fixSuggestion: 'Open 2-3 new clinics in LA metro or expand telehealth capacity',
    },
  ])

  const [forecastNarrative] = useState({
    revenue30d: 1320000,
    revenue60d: 1450000,
    revenue90d: 1620000,
    growthRate: 14.2,
    keyInsights: [
      'Marketplace growth accelerating (+18% MoM)',
      'Clinic network expansion on track for Q1',
      'GLP-1 category showing 45% growth',
    ],
    risks: [
      'Marketplace competition intensifying',
      'Regulatory uncertainty in 3 states',
    ],
    opportunities: [
      'Vendor partnerships could unlock $200K/month',
      'New clinic openings projected to add $150K/month',
      'Cross-sell rate improvement opportunity (+$80K/month)',
    ],
  })

  const [geographies] = useState([
    { location: 'Los Angeles, CA', revenue: 342000, growth: 15.2, clinics: 12 },
    { location: 'New York, NY', revenue: 289000, growth: 12.8, clinics: 8 },
    { location: 'Chicago, IL', revenue: 198000, growth: 8.5, clinics: 6 },
    { location: 'Miami, FL', revenue: 124000, growth: -2.1, clinics: 4 },
  ])

  const [productProfitability] = useState([
    { product: 'TRT Treatment', revenue: 542000, margin: 0.68, roi: 3.2 },
    { product: 'GLP-1 Programs', revenue: 289000, margin: 0.72, roi: 4.1 },
    { product: 'Peptide Therapy', revenue: 156000, margin: 0.64, roi: 2.8 },
    { product: 'Supplements', revenue: 89200, margin: 0.45, roi: 1.9 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 500),
        dailyRevenue: 40000 + Math.random() * 5000,
        weeklyRevenue: 280000 + Math.random() * 20000,
        revenueGrowth: 10 + Math.random() * 5,
        avgTransactionValue: 85 + Math.random() * 10,
      }))
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  const handleControlAction = async (action: string, details: Record<string, any>) => {
    const auditEntry = await createAuditEntry(action, details, 'superadmin')
    console.log('Audit Entry Created:', auditEntry)
    // In production, this would be sent to an audit log service
  }

  const selectedScenario = scenarioNames[scenario]
  const currentForecast = forecastData.map((d) => ({
    ...d,
    forecast: d[selectedScenario] || d.base,
  }))

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Revenue Intelligence & Forecasting</h1>
            <p className="text-gray-400">Hedge fund terminal fused with medical infrastructure HQ</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                handleControlAction('export_revenue_report', { format: 'csv', timestamp: new Date() })
              }
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Core Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue (MTD)"
          value={formatCurrency(metrics.monthlyRevenue)}
          change={metrics.revenueGrowth}
          subtitle="Month to date"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Daily Revenue"
          value={formatCurrency(metrics.dailyRevenue)}
          change={8.7}
          subtitle="Last 24 hours"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Weekly Revenue"
          value={formatCurrency(metrics.weeklyRevenue)}
          change={12.4}
          subtitle="Last 7 days"
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Revenue Growth"
          value={`+${metrics.revenueGrowth.toFixed(1)}%`}
          change={metrics.revenueGrowth - 10}
          subtitle="Month over month"
        />
      </div>

      {/* Category Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Clinic Revenue"
          value={formatCurrency(metrics.clinicRevenue)}
          change={15.2}
          subtitle="60% of total"
          icon={<Building2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Marketplace Revenue"
          value={formatCurrency(metrics.marketplaceRevenue)}
          change={18.5}
          subtitle="37% of total"
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <MetricCard
          title="Vendor Revenue Share"
          value={formatCurrency(metrics.vendorRevenue)}
          change={-2.1}
          subtitle="3% of total"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* LTV, CAC, Break-even */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Patient LTV"
          value={formatCurrency(metrics.ltv)}
          change={5.2}
          subtitle="Lifetime value"
        />
        <MetricCard
          title="CAC"
          value={formatCurrency(metrics.cac)}
          change={-3.1}
          subtitle="Customer acquisition cost"
        />
        <MetricCard
          title="LTV:CAC Ratio"
          value={`${(metrics.ltv / metrics.cac).toFixed(1)}x`}
          change={8.3}
          subtitle="Healthy if >3x"
        />
        <MetricCard
          title="Break-even Days"
          value="42"
          change={-5}
          subtitle="Days to recover CAC"
        />
      </div>

      {/* Revenue Leak Detection */}
      {revenueLeaks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Revenue Leak Detection</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Total Impact:</span>
              <span className="text-lg font-bold text-red-400">
                {formatCurrency(revenueLeaks.reduce((sum, leak) => sum + leak.impact, 0))}/mo
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {revenueLeaks.map((leak) => (
              <RevenueLeakAlert key={leak.id} leak={leak} />
            ))}
          </div>
        </div>
      )}

      {/* Forecasting Engine */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Forecasting Engine</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ForecastCurve
              data={currentForecast}
              title="90-Day Revenue Forecast"
              height={350}
            />
          </div>
          <div>
            <ScenarioSlider
              value={scenario}
              onChange={(val) => setScenario(val as 0 | 1 | 2)}
              labels={scenarioLabels}
            />
          </div>
        </div>
        <ForecastNarrative
          scenario={selectedScenario}
          forecast={forecastNarrative}
        />
      </div>

      {/* Category Growth Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Revenue Trends</h2>
          <RealtimeChart
            dataKey="revenue"
            color="#10b981"
            type="area"
            height={250}
            initialValue={45000}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly Revenue Curve</h2>
          <RealtimeChart
            dataKey="weekly"
            color="#3b82f6"
            type="line"
            height={250}
            initialValue={280000}
          />
        </div>
      </div>

      {/* Top Geographies */}
      <div className="bg-dark-surface border border-dark-border rounded-lg mb-8">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Top Earning Geographies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Revenue (Monthly)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Clinics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Revenue per Clinic
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {geographies.map((geo, idx) => (
                <tr key={idx} className="hover:bg-dark-hover transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">{geo.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(geo.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        geo.growth >= 0 ? 'text-status-live' : 'text-status-offline'
                      }`}
                    >
                      {geo.growth >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{geo.growth.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {geo.clinics}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(geo.revenue / geo.clinics)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Profitability */}
      <div className="bg-dark-surface border border-dark-border rounded-lg mb-8">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Product & Clinic Profitability</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productProfitability.map((product, idx) => (
              <div key={idx} className="bg-dark-accent border border-dark-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-white mb-4">{product.product}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Revenue</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Margin</span>
                      <span className="text-sm font-medium text-white">
                        {(product.margin * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${product.margin * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">ROI</span>
                      <span className="text-sm font-medium text-status-live">
                        {product.roi.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board-Level Visuals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Board-Level Visualizations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Growth vs Burn Score</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Revenue Growth</span>
                  <span className="text-sm font-medium text-status-live">+14.2%</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-3">
                  <div className="bg-status-live h-3 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Burn Rate</span>
                  <span className="text-sm font-medium text-status-degraded">$342K/mo</span>
                </div>
                <div className="w-full bg-dark-accent rounded-full h-3">
                  <div className="bg-status-degraded h-3 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="pt-4 border-t border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Runway</span>
                  <span className="text-sm font-bold text-white">18 months</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Cashflow Projections</h3>
            <RealtimeChart
              dataKey="cashflow"
              color="#10b981"
              type="area"
              height={200}
              initialValue={900000}
            />
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-4">Year-End Revenue Estimation</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Projected Annual Revenue</p>
                <p className="text-2xl font-bold text-white">$15.2M</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Confidence Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-accent rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <span className="text-xs text-white">87%</span>
                </div>
              </div>
              <div className="pt-4 border-t border-dark-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Q1 Target</span>
                  <span className="text-white">$3.85M</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Q2 Target</span>
                  <span className="text-white">$4.12M</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Q3 Target</span>
                  <span className="text-white">$3.98M</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Q4 Target</span>
                  <span className="text-white">$4.25M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Superadmin Control Layer */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Superadmin Control Layer</h2>
          <button
            onClick={() =>
              handleControlAction('instant_forecast_update', { timestamp: new Date() })
            }
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Instant Forecast Update
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Marketplace Controls</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Global Margin Rate
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    defaultValue="28"
                    onChange={(e) =>
                      handleControlAction('update_marketplace_margin', {
                        margin: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm text-white w-12 text-right">28%</span>
                </div>
              </div>
              <button
                onClick={() => handleControlAction('refresh_marketplace_data', {})}
                className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
              >
                Refresh Marketplace Data
              </button>
            </div>
          </div>

          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Partner Controls</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Partner Payout Rate
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="40"
                    step="1"
                    defaultValue="25"
                    onChange={(e) =>
                      handleControlAction('update_partner_payout', {
                        payout: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm text-white w-12 text-right">25%</span>
                </div>
              </div>
              <button
                onClick={() => handleControlAction('recalculate_payouts', {})}
                className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
              >
                Recalculate Payouts
              </button>
            </div>
          </div>

          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Product Controls</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                {['TRT Treatment', 'GLP-1 Programs', 'Peptide Therapy'].map((product) => (
                  <div key={product} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{product}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={(e) =>
                          handleControlAction('toggle_product', {
                            product,
                            enabled: e.target.checked,
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
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">All actions are logged with SHA-256 signatures</p>
              <p className="text-xs text-gray-500">Immutable audit trail maintained for compliance</p>
            </div>
            <button
              onClick={() => handleControlAction('export_audit_log', { format: 'json' })}
              className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

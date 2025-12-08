'use client'

import { useState } from 'react'
import {
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  DollarSign,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'

type DealflowServiceLine = 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'
type PriorityScore = 'high' | 'medium' | 'low'

interface DealflowClinic {
  clinic: {
    name: string
    website: string | null
    location: { city: string; state: string; country: string }
    category: string
    serviceLines: string[]
    phone?: string
    email?: string
  }
  enrichedProfile?: {
    servicesOffered: string[]
    pricingSignals: {
      hasPricingPage: boolean
      priceRange?: string
      freeConsultOffered: boolean
    }
    ctas: string[]
    telehealthAvailable: boolean
    funnelStyle: string
    keyMessaging: string[]
  }
  adsSnapshot: {
    isRunningAds: boolean
    platforms: Array<{ platform: string; activeCampaignCount: number }>
    regionsTargeted: Array<{ region: string; intensity: string }>
    creativeAngles: string[]
    offers: string[]
    ctaPatterns: string[]
    estimatedSpendBand: 'low' | 'medium' | 'high'
  }
  outreachPack: {
    priorityScore: PriorityScore
    priorityReason: string
    whyNow: string
    talkingPoints: string[]
    firstEmail: { subjectLine: string; body: string }
    firstLinkedInDM: string
    callScriptOpener: string
    estimatedValue: string
  }
  priorityScore: PriorityScore
  estimatedValue: string
  processedAt: string
}

interface DealflowBatch {
  clinics: DealflowClinic[]
  totalProcessed: number
  summary: {
    highPriority: number
    mediumPriority: number
    lowPriority: number
    withAds: number
    withoutAds: number
    estimatedTotalValue: string
  }
  region: string
  serviceLine?: string
  processedAt: string
}

interface TrendData {
  region: string
  interestScore: number
  trajectory: 'RISING' | 'STABLE' | 'FALLING'
  trendingQueries: Array<{ query: string; growthScore: number }>
  risingQueries: Array<{ query: string; growthScore: number }>
}

interface TrendBasedDealflowResult {
  serviceLine: string
  timestamp: string
  topRegions: Array<{ region: string; interestScore: number; trajectory: string }>
  clinics: any[]
  summary: {
    totalClinics: number
    goStrong: number
    warmLead: number
    avoid: number
  }
}

export default function DealFlowEngine() {
  const [region, setRegion] = useState('Texas')
  const [serviceLine, setServiceLine] = useState<DealflowServiceLine>('TRT')
  const [loading, setLoading] = useState(false)
  const [dealflowBatch, setDealflowBatch] = useState<DealflowBatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedClinic, setSelectedClinic] = useState<DealflowClinic | null>(null)
  
  // Trend analyzer state
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [trendBasedResult, setTrendBasedResult] = useState<TrendBasedDealflowResult | null>(null)
  const [showTrendAnalyzer, setShowTrendAnalyzer] = useState(false)

  const handleRunScan = async () => {
    setLoading(true)
    setError(null)
    setSelectedClinic(null)

    try {
      const response = await fetch('/api/admin/mcp/dealflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'export_dealflow_batch',
          params: {
            region,
            serviceLine,
            maxClinics: 30,
            includeEnrichment: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to run deal-flow scan')
      }

      const data = await response.json()
      setDealflowBatch(data.results)
    } catch (error) {
      console.error('Deal-flow scan error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateVariant = async () => {
    if (!selectedClinic) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/mcp/dealflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'vertex_outreach_brain',
          params: {
            clinic: selectedClinic.clinic,
            enrichedProfile: selectedClinic.enrichedProfile,
            adsSnapshot: selectedClinic.adsSnapshot,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newPack = data.results?.pack || data.results
        
        // Update selected clinic with new pack
        setSelectedClinic({
          ...selectedClinic,
          outreachPack: newPack,
        })
        
        // Update in batch if it exists
        if (dealflowBatch) {
          const updatedClinics = dealflowBatch.clinics.map(c =>
            c.clinic.name === selectedClinic.clinic.name
              ? { ...c, outreachPack: newPack }
              : c
          )
          setDealflowBatch({ ...dealflowBatch, clinics: updatedClinics })
        }
      }
    } catch (error) {
      console.error('Regenerate error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTrendBasedDealflow = async () => {
    setTrendLoading(true)
    setError(null)
    try {
      const serviceLineMap: Record<string, 'TRT' | 'Weight Loss' | 'IV Therapy'> = {
        'TRT': 'TRT',
        'WEIGHT_LOSS': 'Weight Loss',
        'IV_THERAPY': 'IV Therapy',
      }

      const response = await fetch('/api/admin/mcp/dealflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'trend_based_dealflow',
          params: {
            serviceLine: serviceLineMap[serviceLine] || 'TRT',
            maxClinics: 20,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate trend-based dealflow')
      }

      const data = await response.json()
      setTrendBasedResult(data.results)
      
      // Also update main dealflow batch if clinics are returned
      if (data.results?.clinics) {
        // Transform trend-based clinics to match DealflowClinic format
        const transformedClinics = data.results.clinics.map((c: any) => ({
          clinic: c.clinic,
          enrichedProfile: c.enrichedProfile,
          adsSnapshot: c.adsSnapshot,
          outreachPack: {
            priorityScore: c.marketStrength.recommendation === 'goStrong' ? 'high' : 
                          c.marketStrength.recommendation === 'warmLead' ? 'medium' : 'low',
            priorityReason: c.marketStrength.recommendationReason,
            whyNow: `Market strength score: ${c.marketStrength.marketStrengthScore}/100`,
            talkingPoints: [],
            firstEmail: { subjectLine: '', body: '' },
            firstLinkedInDM: '',
            callScriptOpener: '',
            estimatedValue: c.marketStrength.recommendation === 'goStrong' ? 'High - $50K+ annual potential' : 
                          c.marketStrength.recommendation === 'warmLead' ? 'Medium - $20-50K annual potential' : 
                          'Low - <$20K annual potential',
          },
          priorityScore: c.marketStrength.recommendation === 'goStrong' ? 'high' : 
                        c.marketStrength.recommendation === 'warmLead' ? 'medium' : 'low',
          estimatedValue: c.marketStrength.recommendation === 'goStrong' ? 'High - $50K+ annual potential' : 
                        c.marketStrength.recommendation === 'warmLead' ? 'Medium - $20-50K annual potential' : 
                        'Low - <$20K annual potential',
          processedAt: new Date().toISOString(),
        }))

        setDealflowBatch({
          clinics: transformedClinics,
          totalProcessed: transformedClinics.length,
          summary: {
            highPriority: data.results.summary.goStrong,
            mediumPriority: data.results.summary.warmLead,
            lowPriority: data.results.summary.avoid,
            withAds: transformedClinics.filter((c: any) => c.adsSnapshot.isRunningAds).length,
            withoutAds: transformedClinics.filter((c: any) => !c.adsSnapshot.isRunningAds).length,
            estimatedTotalValue: `$${data.results.summary.goStrong * 50 + data.results.summary.warmLead * 30}K+`,
          },
          region: data.results.topRegions.map((r: any) => r.region).join(', '),
          serviceLine,
          processedAt: data.results.timestamp,
        })
      }
    } catch (error) {
      console.error('Trend-based dealflow error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setTrendLoading(false)
    }
  }

  const handleScanTrends = async () => {
    setTrendLoading(true)
    setError(null)
    try {
      const topStates = ['Texas', 'Florida', 'California', 'New York', 'Arizona', 'Nevada']
      const serviceLineMap: Record<string, 'TRT' | 'Weight Loss' | 'IV Therapy'> = {
        'TRT': 'TRT',
        'WEIGHT_LOSS': 'Weight Loss',
        'IV_THERAPY': 'IV Therapy',
      }

      const scans = await Promise.all(
        topStates.slice(0, 6).map(async (state) => {
          try {
            const response = await fetch('/api/admin/mcp/dealflow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'google_trends_region_scan',
                params: {
                  region: state,
                  serviceLine: serviceLineMap[serviceLine] || 'TRT',
                },
              }),
            })

            if (response.ok) {
              const data = await response.json()
              return data.results
            }
            return null
          } catch (error) {
            console.error(`Error scanning ${state}:`, error)
            return null
          }
        })
      )

      const validScans = scans.filter(Boolean) as TrendData[]
      setTrendData(validScans.sort((a, b) => b.interestScore - a.interestScore))
    } catch (error) {
      console.error('Trend scan error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setTrendLoading(false)
    }
  }

  const detectFunnelWeaknesses = (clinic: DealflowClinic): string[] => {
    const weaknesses: string[] = []

    if (!clinic.adsSnapshot.isRunningAds) {
      weaknesses.push('No active ads detected - missing growth opportunity')
    }

    if (clinic.enrichedProfile) {
      if (!clinic.enrichedProfile.pricingSignals.hasPricingPage) {
        weaknesses.push('No clear pricing page - transparency issue')
      }
      if (!clinic.enrichedProfile.pricingSignals.freeConsultOffered) {
        weaknesses.push('No free consult offer - higher barrier to entry')
      }
      if (clinic.enrichedProfile.funnelStyle === 'contact_form') {
        weaknesses.push('Contact form only - no direct booking or assessment')
      }
      if (clinic.enrichedProfile.ctas.length === 0) {
        weaknesses.push('Weak or unclear CTAs - conversion opportunity')
      }
    }

    if (clinic.adsSnapshot.isRunningAds) {
      if (clinic.adsSnapshot.platforms.length === 1) {
        weaknesses.push('Single platform advertising - diversification opportunity')
      }
      if (clinic.adsSnapshot.estimatedSpendBand === 'high' && clinic.adsSnapshot.ctaPatterns.length === 0) {
        weaknesses.push('High spend but unclear CTAs - optimization opportunity')
      }
    }

    return weaknesses.length > 0 ? weaknesses : ['No major weaknesses detected']
  }

  return (
    <div className="page-container w-full bg-dark-bg p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8" />
              Deal Flow Engine
            </h1>
            <p className="text-gray-400 mt-2">
              Sales command center for signing clinics to Novalyte™ AI
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Market Trend Analyzer Panel */}
      <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Market Trend Analyzer</h2>
              <p className="text-sm text-gray-400">Real-time opportunity radar for fast-moving revenue pockets</p>
            </div>
          </div>
          <button
            onClick={() => setShowTrendAnalyzer(!showTrendAnalyzer)}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-sm text-purple-300 hover:bg-purple-500/30 transition-colors"
          >
            {showTrendAnalyzer ? 'Hide' : 'Show'} Analyzer
          </button>
        </div>

        {showTrendAnalyzer && (
          <div className="space-y-4">
            {/* State Heatmap */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">State Heatmap</h3>
              {trendData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trendData.map((trend, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        'p-3 rounded-lg border',
                        trend.trajectory === 'RISING' && 'bg-status-live/10 border-status-live/30',
                        trend.trajectory === 'STABLE' && 'bg-gray-500/10 border-gray-500/30',
                        trend.trajectory === 'FALLING' && 'bg-status-degraded/10 border-status-degraded/30'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{trend.region}</span>
                        <span className="text-xs text-gray-400">{trend.interestScore}/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp
                          className={clsx(
                            'w-3 h-3',
                            trend.trajectory === 'RISING' && 'text-status-live',
                            trend.trajectory === 'FALLING' && 'text-status-degraded rotate-180',
                            trend.trajectory === 'STABLE' && 'text-gray-400'
                          )}
                        />
                        <span className="text-xs text-gray-300 capitalize">{trend.trajectory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Click "Scan Trends" to load state heatmap</p>
              )}
            </div>

            {/* Top Rising Keywords */}
            {trendData.length > 0 && (
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Top Rising Keywords</h3>
                <div className="space-y-2">
                  {trendData
                    .flatMap(t => t.risingQueries)
                    .sort((a, b) => b.growthScore - a.growthScore)
                    .slice(0, 5)
                    .map((query, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-dark-accent rounded">
                        <span className="text-sm text-white">{query.query}</span>
                        <span className="text-xs text-status-live font-medium">+{query.growthScore}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recommended Regions */}
            {trendData.length > 0 && (
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Recommended Regions to Attack</h3>
                <div className="space-y-2">
                  {trendData
                    .filter(t => t.trajectory === 'RISING' && t.interestScore >= 70)
                    .slice(0, 3)
                    .map((trend, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded">
                        <div>
                          <span className="text-sm font-semibold text-white">{trend.region}</span>
                          <span className="text-xs text-gray-400 ml-2">Interest: {trend.interestScore}/100</span>
                        </div>
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleScanTrends}
                disabled={trendLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {trendLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Scan Trends
                  </>
                )}
              </button>
              <button
                onClick={handleGenerateTrendBasedDealflow}
                disabled={trendLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {trendLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Trend-Based Dealflow
                  </>
                )}
              </button>
              {trendBasedResult && (
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(trendBasedResult, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `trend-dealflow-${new Date().toISOString()}.json`
                    link.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-white rounded-lg hover:bg-dark-hover transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export Opportunities
                </button>
              )}
            </div>

            {/* Trend-Based Result Summary */}
            {trendBasedResult && (
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Trend-Based Dealflow Generated</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Total Clinics</div>
                    <div className="text-white font-semibold">{trendBasedResult.summary.totalClinics}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Go Strong</div>
                    <div className="text-status-live font-semibold">{trendBasedResult.summary.goStrong}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Warm Leads</div>
                    <div className="text-status-degraded font-semibold">{trendBasedResult.summary.warmLead}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Top Regions</div>
                    <div className="text-white font-semibold">
                      {trendBasedResult.topRegions.map(r => r.region).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 bg-dark-surface border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Texas, Florida, California..."
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Line
            </label>
            <select
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as DealflowServiceLine)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="TRT">TRT</option>
              <option value="WEIGHT_LOSS">Weight Loss / GLP-1</option>
              <option value="IV_THERAPY">IV Therapy</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Deal-Flow Scan</h2>
          <p className="text-sm text-gray-400">
            Run a comprehensive scan to identify, enrich, and generate outreach for target clinics
          </p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={loading || !region}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Scanning...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Deal-Flow Scan
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
          <p className="text-sm text-status-offline">{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {dealflowBatch && (
        <div className="mb-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Scan Complete</h3>
              <p className="text-sm text-gray-300">
                {dealflowBatch.totalProcessed} clinics processed • {dealflowBatch.region} • {dealflowBatch.serviceLine || 'All Services'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{dealflowBatch.summary.estimatedTotalValue}</div>
              <div className="text-xs text-gray-400">Estimated Annual Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Table + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Output */}
        <div className={clsx('lg:col-span-2', selectedClinic && 'lg:col-span-1')}>
          {dealflowBatch ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-dark-border">
                <h2 className="text-lg font-semibold text-white">Ranked Clinics</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {dealflowBatch.summary.highPriority} High • {dealflowBatch.summary.mediumPriority} Medium • {dealflowBatch.summary.lowPriority} Low
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-accent border-b border-dark-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Clinic Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Service Line</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Running Ads?</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {dealflowBatch.clinics.map((clinic, idx) => (
                      <tr
                        key={idx}
                        className={clsx(
                          'hover:bg-dark-hover transition-colors cursor-pointer',
                          selectedClinic?.clinic.name === clinic.clinic.name && 'bg-primary/10'
                        )}
                        onClick={() => setSelectedClinic(clinic)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{clinic.clinic.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {clinic.clinic.location.city}, {clinic.clinic.location.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {clinic.clinic.serviceLines.join(', ')}
                        </td>
                        <td className="px-4 py-3">
                          {clinic.adsSnapshot.isRunningAds ? (
                            <span className="text-xs text-status-live font-medium">Yes</span>
                          ) : (
                            <span className="text-xs text-gray-500">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-medium',
                              clinic.priorityScore === 'high' && 'bg-status-live/10 text-status-live',
                              clinic.priorityScore === 'medium' && 'bg-status-degraded/10 text-status-degraded',
                              clinic.priorityScore === 'low' && 'bg-gray-500/10 text-gray-400'
                            )}
                          >
                            {clinic.priorityScore.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedClinic(clinic)
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            View Pack →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Scan</h3>
              <p className="text-sm text-gray-400">
                Configure filters and click "Run Deal-Flow Scan" to identify target clinics
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Clinic Details */}
        {selectedClinic && (
          <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{selectedClinic.clinic.name}</h2>
                <p className="text-sm text-gray-400">
                  {selectedClinic.clinic.location.city}, {selectedClinic.clinic.location.state} • {selectedClinic.priorityScore.toUpperCase()} Priority
                </p>
              </div>
              <button
                onClick={() => setSelectedClinic(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Clinic Summary */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                Clinic Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Services:</span>{' '}
                  <span className="text-white">
                    {selectedClinic.enrichedProfile?.servicesOffered.join(', ') || selectedClinic.clinic.serviceLines.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Region:</span>{' '}
                  <span className="text-white">
                    {selectedClinic.clinic.location.city}, {selectedClinic.clinic.location.state}
                  </span>
                </div>
                {selectedClinic.enrichedProfile && (
                  <>
                    <div>
                      <span className="text-gray-400">Pricing:</span>{' '}
                      <span className="text-white">
                        {selectedClinic.enrichedProfile.pricingSignals.priceRange || 'Not disclosed'}
                        {selectedClinic.enrichedProfile.pricingSignals.freeConsultOffered && ' • Free consult offered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Telehealth:</span>{' '}
                      <span className="text-white">
                        {selectedClinic.enrichedProfile.telehealthAvailable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Funnel Style:</span>{' '}
                      <span className="text-white capitalize">
                        {selectedClinic.enrichedProfile.funnelStyle.replace('_', ' ')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ad Activity Snapshot */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                Ad Activity Snapshot
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Running Ads:</span>
                  <span className={clsx(
                    'px-2 py-1 rounded text-xs font-medium',
                    selectedClinic.adsSnapshot.isRunningAds
                      ? 'bg-status-live/10 text-status-live'
                      : 'bg-gray-500/10 text-gray-400'
                  )}>
                    {selectedClinic.adsSnapshot.isRunningAds ? 'Yes' : 'No'}
                  </span>
                </div>
                {selectedClinic.adsSnapshot.isRunningAds && (
                  <>
                    <div>
                      <span className="text-gray-400">Platforms:</span>{' '}
                      <span className="text-white">
                        {selectedClinic.adsSnapshot.platforms.map(p => p.platform).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Creative Angles:</span>{' '}
                      <span className="text-white">
                        {selectedClinic.adsSnapshot.creativeAngles.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Offers:</span>{' '}
                      <span className="text-white">
                        {selectedClinic.adsSnapshot.offers.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Estimated Spend:</span>{' '}
                      <span className="text-white capitalize">
                        {selectedClinic.adsSnapshot.estimatedSpendBand}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Funnel Weaknesses */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Funnel Weaknesses Detected
              </h3>
              <ul className="space-y-1.5">
                {detectFunnelWeaknesses(selectedClinic).map((weakness, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-status-degraded mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why This Clinic Is a Good Target */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                Why This Clinic Is a Good Target
              </h3>
              <p className="text-sm text-white mb-2">{selectedClinic.outreachPack.priorityReason}</p>
              <p className="text-sm text-gray-300">{selectedClinic.outreachPack.whyNow}</p>
              <div className="mt-3 pt-3 border-t border-primary/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{selectedClinic.estimatedValue}</span>
                </div>
              </div>
            </div>

            {/* AI-Generated Outreach */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                  AI-Generated Outreach
                </h3>
                <button
                  onClick={handleRegenerateVariant}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={clsx('w-3 h-3', loading && 'animate-spin')} />
                  Regenerate Variant
                </button>
              </div>

              {/* First Email */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-white">First Email</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedClinic.outreachPack.firstEmail.body)}
                    className="ml-auto px-2 py-1 bg-primary/20 border border-primary/40 rounded text-xs text-primary hover:bg-primary/30"
                  >
                    Copy
                  </button>
                </div>
                <div className="mb-2">
                  <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                  <div className="p-2 bg-dark-surface border border-dark-border rounded text-sm text-white font-medium">
                    {selectedClinic.outreachPack.firstEmail.subjectLine}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Body</label>
                  <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                    {selectedClinic.outreachPack.firstEmail.body}
                  </div>
                </div>
              </div>

              {/* First LinkedIn DM */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-white">First LinkedIn DM</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedClinic.outreachPack.firstLinkedInDM)}
                    className="ml-auto px-2 py-1 bg-primary/20 border border-primary/40 rounded text-xs text-primary hover:bg-primary/30"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans">
                  {selectedClinic.outreachPack.firstLinkedInDM}
                </div>
              </div>

              {/* Phone Call Opener */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-white">Phone Call Opener</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedClinic.outreachPack.callScriptOpener)}
                    className="ml-auto px-2 py-1 bg-primary/20 border border-primary/40 rounded text-xs text-primary hover:bg-primary/30"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans">
                  {selectedClinic.outreachPack.callScriptOpener}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


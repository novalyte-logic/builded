'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Search, Sparkles, Target, MapPin, AlertCircle, RefreshCw, Clock, ArrowRight, ExternalLink } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'
import { useMarketIntelTrends, useMarketIntelCompetitors, useDemandIntelOverview } from '@/lib/mcp/hooks'

interface RegionInsight {
  regionName: string
  serviceLine: 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'
  predictedDemandScore: number
  label: 'immediate_opportunity' | 'emerging' | 'watch_list' | 'cooling'
  reason: string
  suggestedAction: string
}

interface OpportunityMove {
  move: string
  priority: 'high' | 'medium' | 'low'
  region?: string
  serviceLine?: string
}

interface ClinicToInvestigate {
  name: string
  region: string
  serviceLine: string
  reason: string
}

interface PredictiveOutlook {
  region: string
  serviceLine: string
  label: 'immediate_opportunity' | 'emerging' | 'watch_list' | 'cooling'
  timeHorizon: '7d' | '14d' | '30d'
  explanation: string
}

const QUICK_ACTIONS = [
  "Where should we deploy TRT ads right now?",
  "Which regions are spiking in weight loss demand?",
  "List clinics in Texas likely needing TRT patients.",
  "Where is IV therapy demand growing but supply is weak?"
]

export default function MarketIntelligencePage() {
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize from URL params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const regionParam = params.get('region')
      const serviceLineParam = params.get('serviceLine')
      if (regionParam && serviceLineParam) {
        setQuery(`Where should we deploy ${serviceLineParam} ads in ${regionParam}?`)
        setSelectedRegion(regionParam)
        setSelectedTreatment([serviceLineParam])
      }
    }
  }, [])

  // Parse query to extract region and treatment
  useEffect(() => {
    if (query) {
      const isTRT = query.toLowerCase().includes('trt') || query.toLowerCase().includes('testosterone')
      const isWeightLoss = query.toLowerCase().includes('weight loss') || query.toLowerCase().includes('glp') || query.toLowerCase().includes('semaglutide')
      const isIV = query.toLowerCase().includes('iv therapy') || query.toLowerCase().includes('iv ')

      const treatment: string[] = []
      if (isTRT) treatment.push('TRT')
      if (isWeightLoss) treatment.push('GLP-1', 'Weight Loss')
      if (isIV) treatment.push('IV Therapy')
      if (treatment.length === 0) treatment.push('TRT', 'GLP-1', 'IV Therapy')

      // Extract region from query
      const regionMatch = query.match(/\b(Texas|Florida|California|Arizona|New York|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan|New Jersey|Virginia|Washington|Massachusetts|Tennessee|Indiana|Missouri|Maryland|Wisconsin|Colorado|Minnesota|South Carolina|Alabama|Louisiana|Kentucky|Oregon|Oklahoma|Connecticut|Utah|Iowa|Nevada|Arkansas|Mississippi|Kansas|New Mexico|Nebraska|West Virginia|Idaho|Hawaii|New Hampshire|Maine|Montana|Rhode Island|Delaware|South Dakota|North Dakota|Alaska|Vermont|Wyoming)\b/i)
      const region = regionMatch ? regionMatch[1] : null

      setSelectedRegion(region)
      setSelectedTreatment(treatment)
    }
  }, [query])

  // MCP Hooks
  const trendsParams = selectedTreatment.length > 0 ? {
    treatment: selectedTreatment,
    region: selectedRegion || undefined,
    days: 90,
    granularity: 'weekly' as const,
  } : null

  const { 
    data: trendsData, 
    error: trendsError, 
    isLoading: trendsLoading,
    refetch: refetchTrends 
  } = useMarketIntelTrends(trendsParams, selectedTreatment.length > 0)

  const competitorsParams = selectedRegion ? {
    region: selectedRegion,
    treatment: selectedTreatment.length > 0 ? selectedTreatment : undefined,
    radius: 50,
  } : null

  const { 
    data: competitorsData, 
    error: competitorsError, 
    isLoading: competitorsLoading,
    refetch: refetchCompetitors 
  } = useMarketIntelCompetitors(competitorsParams, !!selectedRegion)

  const demandOverviewParams = selectedTreatment.length > 0 ? {
    treatment: selectedTreatment,
    region: selectedRegion || undefined,
    days: 30,
  } : null

  const { 
    data: demandOverviewData, 
    error: demandOverviewError, 
    isLoading: demandOverviewLoading,
    refetch: refetchDemandOverview 
  } = useDemandIntelOverview(demandOverviewParams, false) // Disabled by default

  // Transform MCP data to UI format
  const regions: RegionInsight[] = trendsData?.trendMap 
    ? Array.from(new Set(trendsData.trendMap.map(t => t.region))).map(regionName => {
        const regionTrends = trendsData.trendMap.filter(t => t.region === regionName)
        const avgDemand = regionTrends.reduce((sum, t) => sum + t.metrics.demandIndex, 0) / regionTrends.length
        const avgGrowth = regionTrends.reduce((sum, t) => sum + (t.metrics.growthRate || 0), 0) / regionTrends.length
        
        return {
          regionName,
          serviceLine: (selectedTreatment[0] as any) || 'GENERAL',
          predictedDemandScore: Math.round(avgDemand),
          label: avgGrowth > 0.2 ? 'immediate_opportunity' : 
                 avgGrowth > 0.1 ? 'emerging' : 
                 avgGrowth > 0 ? 'watch_list' : 'cooling',
          reason: `Demand index: ${avgDemand.toFixed(1)}, Growth: ${(avgGrowth * 100).toFixed(1)}%`,
          suggestedAction: avgGrowth > 0.2 ? 'Deploy ads immediately' : 
                          avgGrowth > 0.1 ? 'Monitor and prepare' : 
                          'Watch for changes',
        }
      })
    : []

  const opportunities: OpportunityMove[] = [
    ...(trendsData?.trendMap 
      ? trendsData.trendMap
          .filter(t => t.metrics.trend === 'rising' && t.metrics.growthRate > 0.15)
          .slice(0, 10)
          .map(t => ({
            move: `Deploy ${t.treatment} campaigns in ${t.region} – ${t.metrics.growthRate > 0.2 ? 'high' : 'medium'} growth detected`,
            priority: (t.metrics.growthRate > 0.2 ? 'high' : t.metrics.growthRate > 0.15 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            region: t.region,
            serviceLine: t.treatment,
          }))
      : []),
    ...(competitorsData?.competitors
      ? competitorsData.competitors
          .filter(c => c.threatLevel === 'low' && c.adSpend === 'low')
          .slice(0, 5)
          .map(c => ({
            move: `Low competition in ${c.location.city}, ${c.location.state} – opportunity to capture market`,
            priority: 'medium' as const,
            region: `${c.location.city}, ${c.location.state}`,
          }))
      : []),
  ]

  const clinics: ClinicToInvestigate[] = competitorsData?.competitors
    ? competitorsData.competitors
        .filter(c => c.marketShare < 0.1)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          region: `${c.location.city}, ${c.location.state}`,
          serviceLine: selectedTreatment[0] || 'GENERAL',
          reason: `Low market share (${(c.marketShare * 100).toFixed(1)}%) - potential acquisition target`,
        }))
    : []

  const predictiveOutlook: PredictiveOutlook[] = demandOverviewData?.overview
    ? demandOverviewData.overview
        .filter(o => o.trend === 'rising')
        .slice(0, 5)
        .map(o => ({
          region: o.region,
          serviceLine: o.treatment,
          label: o.projectedDemand > o.currentDemand * 1.2 ? 'immediate_opportunity' :
                 o.projectedDemand > o.currentDemand * 1.1 ? 'emerging' : 'watch_list',
          timeHorizon: o.confidence > 0.8 ? '7d' : o.confidence > 0.6 ? '14d' : '30d',
          explanation: `Projected demand increase: ${((o.projectedDemand / o.currentDemand - 1) * 100).toFixed(1)}%`,
        }))
    : []

  const isLoading = trendsLoading || competitorsLoading
  const hasError = trendsError || competitorsError

  const handleRefresh = () => {
    refetchTrends()
    refetchCompetitors()
  }

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'immediate_opportunity':
        return 'bg-status-live/10 text-status-live border-status-live/30'
      case 'emerging':
        return 'bg-primary/10 text-primary border-primary/30'
      case 'watch_list':
        return 'bg-status-degraded/10 text-status-degraded border-status-degraded/30'
      case 'cooling':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default:
        return 'bg-dark-accent text-gray-400 border-dark-border'
    }
  }

  const getLabelText = (label: string) => {
    switch (label) {
      case 'immediate_opportunity':
        return 'Immediate Opportunity'
      case 'emerging':
        return 'Emerging'
      case 'watch_list':
        return 'Watch List'
      case 'cooling':
        return 'Cooling'
      default:
        return label
    }
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8" />
              Market Intelligence Console
            </h1>
            <p className="text-gray-400 text-lg mb-3">
              Ask the market a question and get a move, not a report.
            </p>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded border border-primary/30 font-medium">
                Source: Google Trends + BigQuery + Vertex AI
              </span>
              <a
                href="/admin/dealflow-drops"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                See how today&apos;s snapshot aligns with this scan →
              </a>
            </div>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Main Query Bar + Presets */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(e.target.value)}
              placeholder="Ask the market a question..."
              className="w-full bg-dark-accent border border-dark-border rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-lg"
            />
          </div>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(action)}
              disabled={isLoading}
              className="px-4 py-2 bg-dark-accent border border-dark-border rounded-full text-sm text-gray-300 hover:text-white hover:border-primary transition-colors disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="mb-6 p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-status-offline" />
            <span className="font-semibold text-status-offline">Error loading market intelligence</span>
          </div>
          <p className="text-sm text-status-offline">
            {trendsError?.message || competitorsError?.message || 'Unknown error'}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="mb-6 bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading market intelligence...</span>
          </div>
        </div>
      )}

      {/* Results - Three Column Layout */}
      {!isLoading && !hasError && (regions.length > 0 || opportunities.length > 0 || clinics.length > 0) && (
        <div className="space-y-6">
          {/* Refresh & Audit Controls */}
          <div className="flex items-center justify-between bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                Refresh Market Scan
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A) Regions Heatmap / List */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Regions Heatmap
              </h2>
              <div className="space-y-3">
                {regions.length > 0 ? (
                  regions.map((region, idx) => (
                    <div
                      key={idx}
                      className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-white">{region.regionName}</div>
                        <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getLabelColor(region.label))}>
                          {getLabelText(region.label)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {region.serviceLine}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Demand Score</span>
                        <span className="text-sm font-semibold text-primary">{region.predictedDemandScore}/100</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 line-clamp-2">{region.reason}</p>
                      <div className="mt-2">
                        <a
                          href={`/admin/dealflow?region=${encodeURIComponent(region.regionName)}&serviceLine=${region.serviceLine}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Open in Dealflow Console <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No regions found
                  </div>
                )}
              </div>
            </div>

            {/* B) Opportunities & Moves */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Opportunities & Moves
              </h2>
              <div className="space-y-3">
                {opportunities.length > 0 ? (
                  opportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        'border rounded-lg p-3',
                        opp.priority === 'high' && 'bg-status-live/5 border-status-live/30',
                        opp.priority === 'medium' && 'bg-primary/5 border-primary/30',
                        opp.priority === 'low' && 'bg-dark-accent border-dark-border'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={clsx(
                          'text-lg font-bold mt-0.5',
                          opp.priority === 'high' && 'text-status-live',
                          opp.priority === 'medium' && 'text-primary',
                          opp.priority === 'low' && 'text-gray-400'
                        )}>
                          •
                        </span>
                        <p className="text-sm text-gray-300 flex-1">{opp.move}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No opportunities identified
                  </div>
                )}
              </div>
            </div>

            {/* C) Clinics to Investigate */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Clinics to Investigate
              </h2>
              <div className="space-y-3">
                {clinics.length > 0 ? (
                  clinics.map((clinic, idx) => (
                    <div
                      key={idx}
                      className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="font-semibold text-white mb-1">{clinic.name}</div>
                      <div className="text-xs text-gray-400 mb-2">
                        {clinic.region} • {clinic.serviceLine}
                      </div>
                      <p className="text-xs text-gray-300 mb-3 line-clamp-2">{clinic.reason}</p>
                      <a
                        href={`/admin/dealflow?region=${encodeURIComponent(clinic.region)}&serviceLine=${clinic.serviceLine}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Open in Dealflow Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No clinics identified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Predictive Outlook (if applicable) */}
          {predictiveOutlook.length > 0 && (
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Predictive Outlook
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predictiveOutlook.map((outlook, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{outlook.region}</div>
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getLabelColor(outlook.label))}>
                        {getLabelText(outlook.label)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {outlook.serviceLine} • {outlook.timeHorizon}
                    </div>
                    <p className="text-sm text-gray-300">{outlook.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && regions.length === 0 && opportunities.length === 0 && clinics.length === 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Ask the market a question
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter a question above or click a preset to get actionable market intelligence.
            <br />
            Get moves, not reports.
          </p>
        </div>
      )}
    </div>
  )
}

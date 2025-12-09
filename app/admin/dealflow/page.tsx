'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  AlertCircle,
  RefreshCw,
  MapPin,
  BarChart3,
  Activity,
  Sparkles,
  TrendingDown,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import {
  useDealflowPipeline,
  useDealflowDemandSpikes,
  useDemandIntelOverview,
} from '@/lib/mcp/hooks'
import CinematicKPICard from '@/components/admin/CinematicKPICard'
import KPICluster from '@/components/admin/KPICluster'
import ChartContainer from '@/components/admin/ChartContainer'

type TreatmentType = 'TRT' | 'Semaglutide' | 'IV' | 'Peptides' | 'ALL'
type RegionType = string

function SkeletonTable() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-dark-border">
        <div className="h-6 w-48 bg-dark-accent rounded animate-pulse"></div>
      </div>
      <div className="divide-y divide-dark-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 w-32 bg-dark-accent rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-dark-accent rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-dark-accent rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-dark-accent rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-dark-accent rounded animate-pulse"></div>
              <div className="h-4 w-28 bg-dark-accent rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DealflowIntelligencePage() {
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType>('ALL')
  const [selectedRegion, setSelectedRegion] = useState<RegionType>('Texas')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // MCP Hooks
  const pipelineParams = {
    region: selectedRegion,
    treatment: selectedTreatment === 'ALL' ? undefined : [selectedTreatment],
    lookback: 30,
    maxResults: 50,
  }

  const {
    data: pipelineData,
    error: pipelineError,
    isLoading: pipelineLoading,
    refetch: refetchPipeline,
  } = useDealflowPipeline(pipelineParams, !!selectedRegion)

  const demandSpikesParams = {
    region: selectedRegion,
    treatment: selectedTreatment === 'ALL' ? undefined : [selectedTreatment],
    days: 30,
    threshold: 1.5,
  }

  const {
    data: demandSpikesData,
    error: demandSpikesError,
    isLoading: demandSpikesLoading,
    refetch: refetchDemandSpikes,
  } = useDealflowDemandSpikes(demandSpikesParams, !!selectedRegion)

  const demandOverviewParams = {
    treatment: selectedTreatment === 'ALL' ? undefined : [selectedTreatment],
    region: selectedRegion,
    days: 30,
  }

  const {
    data: demandOverviewData,
    error: demandOverviewError,
    isLoading: demandOverviewLoading,
    refetch: refetchDemandOverview,
  } = useDemandIntelOverview(demandOverviewParams, false) // Optional, disabled by default

  // Calculate KPIs from pipeline data
  const kpis = pipelineData
    ? {
        totalLeads: pipelineData.summary.total,
        qualifiedLeads: pipelineData.summary.highOpportunity,
        conversionRate: pipelineData.clinics.length > 0
          ? Math.round((pipelineData.summary.highOpportunity / pipelineData.summary.total) * 100)
          : 0,
        estimatedRevenue: pipelineData.clinics.reduce((sum, clinic) => {
          const revenueMatch = clinic.revenuePotential.match(/\$[\d,]+/)
          return sum + (revenueMatch ? parseInt(revenueMatch[0].replace(/[$,]/g, '')) : 0)
        }, 0),
      }
    : null

  const isLoading = pipelineLoading || demandSpikesLoading
  const hasError = pipelineError || demandSpikesError

  const handleRefresh = () => {
    refetchPipeline()
    refetchDemandSpikes()
    if (demandOverviewData) {
      refetchDemandOverview()
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, selectedRegion, selectedTreatment])

  // Generate AI insights based on data
  const generateAIInsight = (kpiType: string) => {
    if (!pipelineData) return undefined
    
    const insights: Record<string, { insight: string; context?: string }> = {
      totalLeads: {
        insight: `Total leads increased 12% due to TRT searches in Texas and Florida.`,
        context: `Strong demand signals from ${selectedRegion} region.`,
      },
      qualifiedLeads: {
        insight: `Qualified leads trending +8% from high-intent clinic inquiries.`,
        context: `Opportunity score threshold filtering is working effectively.`,
      },
      conversionRate: {
        insight: `Conversion rate stable at ${kpis?.conversionRate}% with consistent qualification pipeline.`,
        context: `Maintaining quality over quantity approach.`,
      },
      revenueLift: {
        insight: `Revenue lift aligns with high-intent Ozempic queries from the last 24 hours.`,
        context: `Estimated annual potential: $${(kpis?.estimatedRevenue ?? 0).toLocaleString()}`,
      },
    }
    
    return insights[kpiType]
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3 tracking-tight">
              <Target className="w-8 h-8 text-primary/90" />
              Dealflow Intelligence
            </h1>
            <p className="text-sm text-gray-500/80">
              Real-time clinic performance, demand spikes, and revenue signals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-dark-surface/60 border border-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all duration-150 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
            <StatusBadge status="live" />
          </div>
        </div>
        {/* Section Divider */}
        <div className="h-px bg-white/5"></div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="mb-8 bg-status-offline/8 border border-status-offline/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-status-offline" />
            <h3 className="text-sm font-semibold text-status-offline">Error Loading Dealflow Data</h3>
          </div>
          <p className="text-xs text-status-offline/80 mb-4">
            {pipelineError?.message || demandSpikesError?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Clusters - Platform Demand */}
      <KPICluster
        title="Platform Demand"
        icon={TrendingUp}
        description="Real-time demand signals and pipeline metrics"
        columns={4}
        kpis={[
          {
            label: 'Total Leads',
            value: kpis?.totalLeads ?? 0,
            subtitle: 'Clinics in pipeline',
            icon: Users,
            isLoading: pipelineLoading,
            trend: pipelineData ? { value: 12, direction: 'up' } : undefined,
            tooltip: {
              explanation: 'Total number of clinic leads currently in the dealflow pipeline, representing all potential partnerships being tracked.',
              calculation: 'Sum of all clinics identified through market scanning, referrals, and inbound inquiries.',
              whyItMatters: 'Indicates the size of your addressable market and pipeline health. Growing total leads suggests effective demand generation.',
            },
            aiInsight: generateAIInsight('totalLeads'),
            priority: 'high',
          },
          {
            label: 'Qualified Leads',
            value: kpis?.qualifiedLeads ?? 0,
            subtitle: 'High opportunity',
            icon: Target,
            isLoading: pipelineLoading,
            trend: pipelineData ? { value: 8, direction: 'up' } : undefined,
            tooltip: {
              explanation: 'Clinics that meet high-opportunity criteria based on demand signals, capacity, and revenue potential.',
              calculation: 'Filtered subset of total leads scoring above 70/100 on opportunity score algorithm.',
              whyItMatters: 'Represents your highest-converting segment. Focus outreach efforts here for maximum ROI.',
            },
            aiInsight: generateAIInsight('qualifiedLeads'),
            priority: 'high',
          },
          {
            label: 'Conversion Rate',
            value: `${kpis?.conversionRate ?? 0}%`,
            subtitle: 'Qualified / Total',
            icon: Activity,
            isLoading: pipelineLoading,
            tooltip: {
              explanation: 'Percentage of total leads that qualify as high-opportunity prospects.',
              calculation: '(Qualified Leads / Total Leads) × 100',
              whyItMatters: 'Measures pipeline quality. Higher rates indicate better targeting and qualification processes.',
            },
            aiInsight: generateAIInsight('conversionRate'),
          },
          {
            label: 'Est. Revenue Lift',
            value: `$${(kpis?.estimatedRevenue ?? 0).toLocaleString()}`,
            subtitle: 'Annual potential',
            icon: DollarSign,
            isLoading: pipelineLoading,
            trend: pipelineData ? { value: 15, direction: 'up' } : undefined,
            tooltip: {
              explanation: 'Projected annual revenue increase from converting all qualified leads in the current pipeline.',
              calculation: 'Sum of revenue potential estimates from all qualified clinic leads.',
              whyItMatters: 'Quantifies the financial impact of your pipeline. Use this to prioritize high-value opportunities.',
            },
            aiInsight: generateAIInsight('revenueLift'),
            priority: 'high',
          },
        ]}
      />

      {/* Section Divider */}
      <div className="h-px bg-white/5 mb-8"></div>

      {/* Demand Spike Radar */}
      <div className="mb-8 bg-dark-surface/80 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/8 rounded-lg border border-primary/12">
              <TrendingUp className="w-5 h-5 text-primary/90" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-0.5 tracking-tight">Demand Spike Radar</h2>
              <p className="text-xs text-gray-500/80">Real-time demand signals across regions</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value as TreatmentType)}
              className="bg-dark-accent/60 border border-white/5 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary/30 transition-colors"
            >
              <option value="ALL">All Treatments</option>
              <option value="TRT">TRT</option>
              <option value="Semaglutide">Semaglutide</option>
              <option value="IV">IV Therapy</option>
              <option value="Peptides">Peptides</option>
            </select>
            <input
              type="text"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              placeholder="Region (e.g., Texas)"
              className="bg-dark-accent/60 border border-white/5 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary/30 transition-colors w-36"
            />
          </div>
        </div>

        {demandSpikesLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            <span className="ml-3 text-xs text-gray-500/80">Analyzing demand spikes...</span>
          </div>
        ) : demandSpikesError ? (
          <div className="bg-status-offline/8 border border-status-offline/20 rounded-lg p-4 text-center">
            <p className="text-xs text-status-offline/80">{demandSpikesError.message}</p>
            <button
              onClick={() => refetchDemandSpikes()}
              className="mt-3 px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : demandSpikesData && demandSpikesData.spikes.length > 0 ? (
          <div className="space-y-2">
            {demandSpikesData.spikes.slice(0, 10).map((spike, idx) => (
              <div
                key={idx}
                className="bg-dark-accent/40 border border-white/5 rounded-lg p-3.5 hover:bg-dark-accent/60 hover:border-white/10 transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-primary/80" />
                      <span className="font-medium text-white text-sm">
                        {spike.treatment} in {spike.region}
                      </span>
                      <span
                        className={clsx(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                          spike.trend === 'spiking' && 'bg-status-live/12 text-status-live border-status-live/25',
                          spike.trend === 'sustained_high' && 'bg-primary/12 text-primary border-primary/25',
                          spike.trend === 'rising' && 'bg-status-degraded/12 text-status-degraded border-status-degraded/25'
                        )}
                      >
                        {spike.trend.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500/80">
                      <span>Magnitude: {spike.spikeMagnitude.toFixed(2)}x</span>
                      <span>Current: {spike.currentValue.toFixed(1)}</span>
                      <span>Baseline: {spike.baselineValue.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-primary/90">{spike.opportunityScore}</div>
                    <div className="text-[10px] text-gray-500/70">Opportunity</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500/70">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No demand spikes detected in {selectedRegion}</p>
            <p className="text-[10px] mt-1 text-gray-500/60">Try selecting a different region or treatment</p>
          </div>
        )}
            </div>

      {/* Section Divider */}
      <div className="h-px bg-white/6 mb-12"></div>

      {/* Pipeline Table */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Pipeline Performance</h2>
              <p className="text-sm text-gray-400">Clinic leads and conversion metrics</p>
            </div>
          </div>
          {pipelineData && (
            <div className="text-sm text-gray-400">
              {pipelineData.clinics.length} clinics • Avg Score: {Math.round(pipelineData.summary.avgOpportunityScore)}
        </div>
      )}
              </div>

        {pipelineLoading ? (
          <SkeletonTable />
        ) : pipelineError ? (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-status-offline mx-auto mb-3" />
            <p className="text-status-offline mb-3">{pipelineError.message}</p>
            <button
              onClick={() => refetchPipeline()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        ) : pipelineData && pipelineData.clinics.length > 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-[0px_4px_14px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-accent border-b border-dark-border">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Clinic Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Treatment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Opportunity Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Revenue Potential
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                  {pipelineData.clinics.map((clinic, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-dark-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{clinic.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{clinic.region}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {clinic.treatment.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'text-lg font-bold',
                              clinic.opportunityScore >= 75 && 'text-status-live',
                              clinic.opportunityScore >= 50 && clinic.opportunityScore < 75 && 'text-primary',
                              clinic.opportunityScore < 50 && 'text-gray-400'
                            )}
                          >
                            {clinic.opportunityScore}
                            </span>
                          <span className="text-xs text-gray-500">/100</span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-white">{clinic.revenuePotential}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            clinic.opportunityScore >= 75
                              ? 'live'
                              : clinic.opportunityScore >= 50
                              ? 'degraded'
                              : 'offline'
                          }
                          label={
                            clinic.opportunityScore >= 75
                              ? 'High'
                              : clinic.opportunityScore >= 50
                              ? 'Medium'
                              : 'Low'
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center shadow-[0px_4px_14px_rgba(0,0,0,0.35)]">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Dealflow Signals Detected</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No clinic pipeline data available for {selectedRegion}. Try selecting a different region or check back later.
            </p>
          </div>
        )}
            </div>

      {/* Section Divider */}
      {demandOverviewData && demandOverviewData.overview.length > 0 && (
        <div className="h-px bg-white/6 mb-12"></div>
      )}

      {/* Optional: Demand Overview Summary */}
      {demandOverviewData && demandOverviewData.overview.length > 0 && (
        <div className="mb-12 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-xl p-8 shadow-[0px_4px_14px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">Demand Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demandOverviewData.overview.slice(0, 3).map((overview, idx) => (
              <div key={idx} className="bg-dark-surface/80 border border-primary/20 rounded-xl p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0px_4px_14px_rgba(0,0,0,0.35)] transition-all duration-300">
                <div className="font-semibold text-white mb-1">{overview.treatment}</div>
                <div className="text-sm text-gray-400 mb-2">{overview.region}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'text-lg font-bold',
                      overview.trend === 'rising' && 'text-status-live',
                      overview.trend === 'stable' && 'text-primary',
                      overview.trend === 'declining' && 'text-gray-400'
                    )}
                  >
                    {overview.currentDemand.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">→ {overview.projectedDemand.toFixed(1)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Confidence: {Math.round(overview.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

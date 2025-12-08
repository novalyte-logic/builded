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
  ArrowUp,
  ArrowDown,
  Activity,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import {
  useDealflowPipeline,
  useDealflowDemandSpikes,
  useDemandIntelOverview,
} from '@/lib/mcp/hooks'

type TreatmentType = 'TRT' | 'Semaglutide' | 'IV' | 'Peptides' | 'ALL'
type RegionType = string

interface KPICardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  icon: React.ElementType
  isLoading?: boolean
}

function KPICard({ label, value, subtitle, trend, icon: Icon, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-dark-accent rounded"></div>
          <div className="h-8 w-8 bg-dark-accent rounded"></div>
        </div>
        <div className="h-8 w-24 bg-dark-accent rounded mb-2"></div>
        {subtitle && <div className="h-4 w-40 bg-dark-accent rounded"></div>}
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 text-sm font-medium',
            trend.direction === 'up' && 'text-status-live',
            trend.direction === 'down' && 'text-status-degraded',
            trend.direction === 'neutral' && 'text-gray-400'
          )}>
            {trend.direction === 'up' && <ArrowUp className="w-4 h-4" />}
            {trend.direction === 'down' && <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  )
}

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

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-primary" />
              Dealflow Intelligence
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time clinic performance, demand spikes, and revenue signals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-gray-300 hover:text-white hover:border-primary transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
            <StatusBadge status="live" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="mb-6 bg-status-offline/10 border border-status-offline/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-status-offline" />
            <h3 className="text-lg font-semibold text-status-offline">Error Loading Dealflow Data</h3>
          </div>
          <p className="text-sm text-status-offline mb-4">
            {pipelineError?.message || demandSpikesError?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Band */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          label="Total Leads"
          value={kpis?.totalLeads ?? 0}
          subtitle="Clinics in pipeline"
          icon={Users}
          isLoading={pipelineLoading}
          trend={
            pipelineData
              ? {
                  value: 12,
                  direction: 'up',
                }
              : undefined
          }
        />
        <KPICard
          label="Qualified Leads"
          value={kpis?.qualifiedLeads ?? 0}
          subtitle="High opportunity"
          icon={Target}
          isLoading={pipelineLoading}
          trend={
            pipelineData
              ? {
                  value: 8,
                  direction: 'up',
                }
              : undefined
          }
        />
        <KPICard
          label="Conversion Rate"
          value={`${kpis?.conversionRate ?? 0}%`}
          subtitle="Qualified / Total"
          icon={Activity}
          isLoading={pipelineLoading}
        />
        <KPICard
          label="Est. Revenue Lift"
          value={`$${(kpis?.estimatedRevenue ?? 0).toLocaleString()}`}
          subtitle="Annual potential"
          icon={DollarSign}
          isLoading={pipelineLoading}
          trend={
            pipelineData
              ? {
                  value: 15,
                  direction: 'up',
                }
              : undefined
          }
        />
      </div>

      {/* Demand Spike Radar */}
      <div className="mb-8 bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-white">Demand Spike Radar</h2>
              <p className="text-sm text-gray-400">Real-time demand signals across regions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value as TreatmentType)}
              className="bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
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
              className="bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary w-40"
            />
          </div>
        </div>

        {demandSpikesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Analyzing demand spikes...</span>
          </div>
        ) : demandSpikesError ? (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-4 text-center">
            <p className="text-sm text-status-offline">{demandSpikesError.message}</p>
            <button
              onClick={() => refetchDemandSpikes()}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        ) : demandSpikesData && demandSpikesData.spikes.length > 0 ? (
          <div className="space-y-3">
            {demandSpikesData.spikes.slice(0, 10).map((spike, idx) => (
              <div
                key={idx}
                className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-white">
                        {spike.treatment} in {spike.region}
                      </span>
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          spike.trend === 'spiking' && 'bg-status-live/10 text-status-live border border-status-live/30',
                          spike.trend === 'sustained_high' && 'bg-primary/10 text-primary border border-primary/30',
                          spike.trend === 'rising' && 'bg-status-degraded/10 text-status-degraded border border-status-degraded/30'
                        )}
                      >
                        {spike.trend.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Magnitude: {spike.spikeMagnitude.toFixed(2)}x baseline</span>
                      <span>Current: {spike.currentValue.toFixed(1)}</span>
                      <span>Baseline: {spike.baselineValue.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">{spike.opportunityScore}</div>
                    <div className="text-xs text-gray-400">Opportunity</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No demand spikes detected in {selectedRegion}</p>
            <p className="text-sm mt-1">Try selecting a different region or treatment</p>
          </div>
        )}
      </div>

      {/* Pipeline Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-white">Pipeline Performance</h2>
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
          <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
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
          <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Dealflow Signals Detected</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No clinic pipeline data available for {selectedRegion}. Try selecting a different region or check back later.
            </p>
          </div>
        )}
      </div>

      {/* Optional: Demand Overview Summary */}
      {demandOverviewData && demandOverviewData.overview.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-white">Demand Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demandOverviewData.overview.slice(0, 3).map((overview, idx) => (
              <div key={idx} className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
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

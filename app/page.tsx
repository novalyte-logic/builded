'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  Activity,
  Users,
  Building2,
  DollarSign,
  Brain,
  AlertTriangle,
  ArrowUpRight,
  Target,
  Briefcase,
  Flame,
  Code2,
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

type ServiceLineFilter = 'ALL' | 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY'
type DateRangeFilter = '24h' | '7d' | '30d' | '90d'

type ServiceStatus = 'LIVE' | 'DEGRADED' | 'DOWN'

type SystemOverviewResponse = {
  kpis: {
    totalPatients: { value: number; deltaPct: number; label: string }
    activeClinics: { value: number; deltaPct: number; label: string }
    monthlyRevenue: { value: number; deltaPct: number; label: string }
    aiQueries: { value: number; deltaPct: number; label: string }
    systemHealth: { value: number; deltaPct: number; label: string }
    activeAssessments: { value: number; deltaPct: number; label: string }
  }
  charts: {
    patientRegistrations24h: { timestamp: string; value: number }[]
    revenueStream24h: { timestamp: string; value: number }[]
  }
  services: {
    coreServices: {
      patientEngine: ServiceStatus
      clinicNetwork: ServiceStatus
      marketplaceApi: ServiceStatus
      aiReasoning: ServiceStatus
    }
    infra: {
      primaryDb: ServiceStatus
      cacheLayer: ServiceStatus
      searchIndex: ServiceStatus
      analyticsDb: ServiceStatus
    }
  }
  alerts: {
    id: string
    message: string
    createdAt: string
    severity: 'info' | 'warning' | 'critical'
  }[]
  meta: {
    lastUpdated: string
  }
  error?: string
}

function useSystemOverviewData(filters: {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeFilter
  region: string
}) {
  const [state, setState] = useState<{
    data?: SystemOverviewResponse
    error?: Error
    loading: boolean
  }>({ loading: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const params = new URLSearchParams({
          serviceLine: filters.serviceLine,
          dateRange: filters.dateRange,
          region: filters.region,
        })
        const res = await fetch(`/api/system/overview?${params.toString()}`)
        const json = (await res.json()) as SystemOverviewResponse
        if (!cancelled) {
          setState({ data: json, error: undefined, loading: false })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ data: undefined, error: err as Error, loading: false })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [filters.serviceLine, filters.dateRange, filters.region])

  return {
    data: state.data,
    error: state.error,
    isLoading: state.loading,
  }
}

function statusMap(status: ServiceStatus): 'live' | 'degraded' | 'offline' {
  if (status === 'LIVE') return 'live'
  if (status === 'DEGRADED') return 'degraded'
  return 'offline'
}

function SkeletonCard() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 animate-pulse">
      <div className="h-4 w-24 bg-dark-border rounded mb-3" />
      <div className="h-8 w-32 bg-dark-border rounded mb-2" />
      <div className="h-3 w-20 bg-dark-border rounded" />
    </div>
  )
}

export default function SystemOverview() {
  const [serviceLine, setServiceLine] = useState<ServiceLineFilter>('ALL')
  const [dateRange, setDateRange] = useState<DateRangeFilter>('24h')
  const [region, setRegion] = useState<string>('ALL')

  const { data, error, isLoading } = useSystemOverviewData({
    serviceLine,
    dateRange,
    region,
  })

  const filters = useMemo(() => ({ serviceLine, dateRange, region }), [serviceLine, dateRange, region])

  return (
    <div className="w-full bg-dark-bg">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">System Overview</h1>
          <StatusBadge status="live" />
        </div>
        <p className="text-gray-400">Mission Control for Novalyte™ AI Platform</p>
      </div>

      {/* Global Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Service Line</label>
            <select
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as ServiceLineFilter)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Service Lines</option>
              <option value="TRT">TRT</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="IV_THERAPY">IV Therapy</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All States</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border">
              <span className="w-2 h-2 rounded-full bg-status-live glow-pulse" />
              <span>Filters ready for future data wiring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
        {isLoading || !data ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="min-w-0">
              <MetricCard
                title="Total Patients"
                value={formatNumber(data.kpis.totalPatients.value)}
                change={data.kpis.totalPatients.deltaPct}
                subtitle={data.kpis.totalPatients.label}
                icon={<Users className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Active Clinics"
                value={data.kpis.activeClinics.value}
                change={data.kpis.activeClinics.deltaPct}
                subtitle={data.kpis.activeClinics.label}
                icon={<Building2 className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Monthly Revenue"
                value={formatCurrency(data.kpis.monthlyRevenue.value)}
                change={data.kpis.monthlyRevenue.deltaPct}
                subtitle={data.kpis.monthlyRevenue.label}
                icon={<DollarSign className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="AI Queries (24h)"
                value={formatNumber(data.kpis.aiQueries.value)}
                change={data.kpis.aiQueries.deltaPct}
                subtitle={data.kpis.aiQueries.label}
                icon={<Brain className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="System Health"
                value={`${data.kpis.systemHealth.value.toFixed(2)}%`}
                change={data.kpis.systemHealth.deltaPct}
                subtitle={data.kpis.systemHealth.label}
                status={statusMap(data.kpis.systemHealth.value >= 98 ? 'LIVE' : 'DEGRADED')}
                icon={<Activity className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
            <div className="min-w-0">
              <MetricCard
                title="Active Assessments"
                value={data.kpis.activeAssessments.value}
                change={data.kpis.activeAssessments.deltaPct}
                subtitle={data.kpis.activeAssessments.label}
                icon={<AlertTriangle className="w-6 h-6" />}
                filters={{ serviceLine, dateRange, region }}
              />
            </div>
          </>
        )}
      </div>

      {/* Action Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
        <Link
          href="/admin/insights/demand"
          className="bg-dark-surface border border-dark-border hover:border-primary/40 hover:bg-dark-hover transition-colors rounded-lg p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              Clinics Needing Patients
            </p>
            <p className="text-xs text-gray-500 mt-1">View clinics that need more patient volume.</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-500" />
        </Link>

        <Link
          href="/admin/workforce"
          className="bg-dark-surface border border-dark-border hover:border-primary/40 hover:bg-dark-hover transition-colors rounded-lg p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Workforce Gaps</p>
            <p className="text-xs text-gray-500 mt-1">See open staffing requests and top matches.</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-500" />
        </Link>

        <Link
          href="/revenue"
          className="bg-dark-surface border border-dark-border hover:border-primary/40 hover:bg-dark-hover transition-colors rounded-lg p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Revenue Hotspots</p>
            <p className="text-xs text-gray-500 mt-1">
              Jump to regions and clinics with the highest upside.
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-500" />
        </Link>

        <Link
          href="/admin/ai-console"
          className="bg-dark-surface border border-dark-border hover:border-primary/40 hover:bg-dark-hover transition-colors rounded-lg p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Data &amp; AI Console</p>
            <p className="text-xs text-gray-500 mt-1">
              Run BigQuery and Vertex AI experiments from mission control.
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-500" />
        </Link>
      </div>

      {/* Error state */}
      {(error || data?.error) && (
        <div className="bg-status-offline/10 border border-status-offline/30 text-status-offline text-sm rounded-lg px-4 py-3 mb-4">
          System overview data is temporarily unavailable. Showing last known safe values.
        </div>
      )}

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Patient Registrations (24h)</h2>
            {data?.meta?.lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {new Date(data.meta.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="w-full h-64 min-h-[250px]">
            {isLoading || !data ? (
              <div className="w-full h-full bg-dark-accent/50 border border-dark-border rounded-lg animate-pulse" />
            ) : (
              <RealtimeChart
                dataKey="registrations"
                color="#10b981"
                type="area"
                height={250}
                staticData={data.charts.patientRegistrations24h}
                filters={{ serviceLine, dateRange, region }}
              />
            )}
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Revenue Stream (24h)</h2>
            {data?.meta?.lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {new Date(data.meta.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="w-full h-64 min-h-[250px]">
            {isLoading || !data ? (
              <div className="w-full h-full bg-dark-accent/50 border border-dark-border rounded-lg animate-pulse" />
            ) : (
              <RealtimeChart
                dataKey="revenue"
                color="#3b82f6"
                type="area"
                height={250}
                staticData={data.charts.revenueStream24h}
                filters={{ serviceLine, dateRange, region }}
              />
            )}
          </div>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Core Services</h3>
          <div className="space-y-3">
            {isLoading || !data ? (
              <div className="h-24 bg-dark-accent/40 border border-dark-border rounded-lg animate-pulse" />
            ) : (
              [
                { name: 'Patient Engine', status: data.services.coreServices.patientEngine },
                { name: 'Clinic Network', status: data.services.coreServices.clinicNetwork },
                { name: 'Marketplace API', status: data.services.coreServices.marketplaceApi },
                { name: 'AI Reasoning', status: data.services.coreServices.aiReasoning },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{service.name}</span>
                  <StatusBadge status={statusMap(service.status)} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Data Infrastructure</h3>
          <div className="space-y-3">
            {isLoading || !data ? (
              <div className="h-24 bg-dark-accent/40 border border-dark-border rounded-lg animate-pulse" />
            ) : (
              [
                { name: 'Primary DB', status: data.services.infra.primaryDb },
                { name: 'Cache Layer', status: data.services.infra.cacheLayer },
                { name: 'Search Index', status: data.services.infra.searchIndex },
                { name: 'Analytics DB', status: data.services.infra.analyticsDb },
              ].map((service) => (
                <div
                  key={service.name}
                  className={`flex items-center justify-between ${
                    service.name === 'Analytics DB' && service.status === 'DEGRADED'
                      ? 'bg-status-degraded/10 border border-status-degraded/40 rounded-lg px-3 py-2'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{service.name}</span>
                    {service.name === 'Analytics DB' && service.status === 'DEGRADED' && (
                      <span className="text-[11px] text-status-degraded bg-status-degraded/15 border border-status-degraded/30 rounded-full px-2 py-0.5">
                        Needs attention
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={statusMap(service.status)}
                      label={service.name === 'Analytics DB' && service.status === 'DEGRADED' ? 'DEGRADED' : undefined}
                    />
                    {service.name === 'Analytics DB' && service.status === 'DEGRADED' && (
                      <Link
                        href="/logs"
                        className="text-xs text-status-degraded hover:text-status-degraded/80 underline underline-offset-2"
                      >
                        View in Logs
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Alerts</h3>
          <div className="space-y-3 text-sm">
            {isLoading || !data ? (
              <div className="h-20 bg-dark-accent/40 border border-dark-border rounded-lg animate-pulse" />
            ) : data.alerts.length === 0 ? (
              <p className="text-gray-400">No recent alerts</p>
            ) : (
              data.alerts.map((alert) => (
                <div key={alert.id} className="text-gray-300">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-status-offline'
                          : alert.severity === 'warning'
                          ? 'bg-status-degraded'
                          : 'bg-status-live'
                      }`}
                    />
                    <span>{alert.message}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


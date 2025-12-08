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
type DashboardFilters = {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeFilter
  region: string
}

export default function SystemOverview() {
  const [metrics, setMetrics] = useState({
    totalPatients: 47829,
    activeClinics: 127,
    monthlyRevenue: 1247000,
    aiQueries: 3421000,
    systemHealth: 99.8,
    activeAssessments: 892,
  })
  const [serviceLine, setServiceLine] = useState<ServiceLineFilter>('ALL')
  const [dateRange, setDateRange] = useState<DateRangeFilter>('24h')
  const [region, setRegion] = useState<string>('ALL')

  const filters: DashboardFilters = useMemo(
    () => ({ serviceLine, dateRange, region }),
    [serviceLine, dateRange, region]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 3),
        activeClinics: prev.activeClinics,
        monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 500),
        aiQueries: prev.aiQueries + Math.floor(Math.random() * 50),
        systemHealth: 99.5 + Math.random() * 0.5,
        activeAssessments: prev.activeAssessments + Math.floor(Math.random() * 5) - 2,
      }))
    }, 3500)

    return () => clearInterval(interval)
  }, [])

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
        <div className="min-w-0">
          <MetricCard
            title="Total Patients"
            value={formatNumber(metrics.totalPatients)}
            change={2.4}
            subtitle="Lifetime registrations"
            icon={<Users className="w-6 h-6" />}
            filters={filters}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="Active Clinics"
            value={metrics.activeClinics}
            change={0}
            subtitle="Nationwide network"
            icon={<Building2 className="w-6 h-6" />}
            filters={filters}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(metrics.monthlyRevenue)}
            change={12.3}
            subtitle="Current month"
            icon={<DollarSign className="w-6 h-6" />}
            filters={filters}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="AI Queries (24h)"
            value={formatNumber(metrics.aiQueries)}
            change={8.7}
            subtitle="Processing requests"
            icon={<Brain className="w-6 h-6" />}
            filters={filters}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="System Health"
            value={`${metrics.systemHealth.toFixed(2)}%`}
            change={0.1}
            subtitle="Uptime & performance"
            status="live"
            icon={<Activity className="w-6 h-6" />}
            filters={filters}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="Active Assessments"
            value={metrics.activeAssessments}
            change={-1.2}
            subtitle="In-progress evaluations"
            icon={<AlertTriangle className="w-6 h-6" />}
            filters={filters}
          />
        </div>
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

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h2 className="text-lg font-semibold text-white mb-4">Patient Registrations (24h)</h2>
          <div className="w-full h-64 min-h-[250px]">
            <RealtimeChart
              dataKey="registrations"
              color="#10b981"
              type="area"
              height={250}
              initialValue={120}
              filters={filters}
            />
          </div>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Stream (24h)</h2>
          <div className="w-full h-64 min-h-[250px]">
            <RealtimeChart
              dataKey="revenue"
              color="#3b82f6"
              type="area"
              height={250}
              initialValue={45000}
              filters={filters}
            />
          </div>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Core Services</h3>
          <div className="space-y-3">
            {[
              { name: 'Patient Engine', status: 'live' as const },
              { name: 'Clinic Network', status: 'live' as const },
              { name: 'Marketplace API', status: 'live' as const },
              { name: 'AI Reasoning', status: 'live' as const },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{service.name}</span>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Data Infrastructure</h3>
          <div className="space-y-3">
            {[
              { name: 'Primary DB', status: 'live' as const },
              { name: 'Cache Layer', status: 'live' as const },
              { name: 'Search Index', status: 'live' as const },
              { name: 'Analytics DB', status: 'degraded' as const },
            ].map((service) => (
              <div
                key={service.name}
                className={`flex items-center justify-between ${
                  service.name === 'Analytics DB'
                    ? 'bg-status-degraded/10 border border-status-degraded/40 rounded-lg px-3 py-2'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">{service.name}</span>
                  {service.name === 'Analytics DB' && (
                    <span className="text-[11px] text-status-degraded bg-status-degraded/15 border border-status-degraded/30 rounded-full px-2 py-0.5">
                      Needs attention
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={service.status} label={service.name === 'Analytics DB' ? 'DEGRADED' : undefined} />
                  {service.name === 'Analytics DB' && (
                    <Link
                      href="/logs"
                      className="text-xs text-status-degraded hover:text-status-degraded/80 underline underline-offset-2"
                    >
                      View in Logs
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 min-w-0">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Alerts</h3>
          <div className="space-y-3 text-sm">
            <div className="text-gray-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-status-live" />
                <span>All systems operational</span>
              </div>
              <span className="text-gray-500 text-xs">2 minutes ago</span>
            </div>
            <div className="text-gray-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-status-degraded" />
                <span>Analytics DB latency spike</span>
              </div>
              <span className="text-gray-500 text-xs">15 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


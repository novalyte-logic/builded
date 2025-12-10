'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Brain, AlertCircle, Target, Users, RefreshCw, MapPin, ExternalLink, Info } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import PageTransition from '@/components/admin/animation/PageTransition'
import AnimatedCard from '@/components/admin/animation/AnimatedCard'
import { WorkforceIntelligenceResponse, RegionStats } from '@/app/api/workforce-intelligence/route'

type RoleFilter = 'ALL' | 'RN' | 'NP' | 'PA' | 'LPN' | 'MA' | 'OTHER'
type EmploymentFilter = 'ALL' | 'TEMP' | 'PER_DIEM' | 'CONTRACT' | 'FULL_TIME'
type ServiceLineFilter = 'ALL' | 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'
type RangePreset = '7d' | '30d' | '90d'

function formatRatio(value: number) {
  return `${value.toFixed(1)} : 1`
}

function RegionCard({ region }: { region: RegionStats }) {
  return (
    <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          {region.region} ({region.stateCode})
        </div>
        <div className="text-sm text-gray-400">Ratio: {formatRatio(region.jobToCandidateRatio)}</div>
      </div>
      <div className="text-sm text-gray-400 mb-2">
        Open Jobs: {region.openJobs} • Active Candidates: {region.activeCandidates}
      </div>
      <div className="flex flex-wrap gap-2">
        {region.topServiceLines.map((line) => (
          <span
            key={line.serviceLine}
            className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
          >
            {line.serviceLine} ({line.jobCount})
          </span>
        ))}
      </div>
    </div>
  )
}

function RegionDetailDrawer({
  region,
  onClose,
}: {
  region: RegionStats | null
  onClose: () => void
}) {
  if (!region) return null
  const primaryLine = region.topServiceLines[0]?.serviceLine || 'TRT'
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-dark-surface border-l border-dark-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {region.region} ({region.stateCode})
            </h3>
            <p className="text-sm text-gray-400">Ratio: {formatRatio(region.jobToCandidateRatio)}</p>
          </div>
          <button className="text-gray-400 hover:text-white text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="text-sm text-gray-300 mb-3">
          Open Jobs: {region.openJobs} • Active Candidates: {region.activeCandidates}
        </div>
        <div className="text-xs text-gray-400 mb-2">Service line breakdown</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {region.topServiceLines.map((line) => (
            <span
              key={line.serviceLine}
              className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
            >
              {line.serviceLine} ({line.jobCount})
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-200 mb-4">
          AI insight: {region.region} is {region.jobToCandidateRatio > 1 ? 'job-heavy' : 'talent-heavy'} with emphasis on{' '}
          {primaryLine}. Prioritize contracts and recruiting aligned to this line to improve fill probability.
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          onClick={() => {
            window.location.href = `/workforce-exchange?region=${region.stateCode}`
          }}
        >
          Open in Workforce Exchange
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ModuleHelpDrawer({
  isOpen,
  onClose,
  moduleId,
}: {
  isOpen: boolean
  onClose: () => void
  moduleId: 'workforce-exchange' | 'workforce' | 'workforce-intelligence' | null
}) {
  if (!isOpen || !moduleId) return null
  const copy = {
    'workforce-exchange': {
      title: 'Workforce Exchange',
      desc: 'Live liquidity market to match clinic demand with available clinicians.',
      bullets: [
        'Filter by region/role to surface red-zone clinics first.',
        'Send offers to 90+ fit, high reliability candidates.',
        'Use shift alignment to minimize no-shows.',
      ],
    },
    workforce: {
      title: 'Workforce',
      desc: 'Operational console for staffing pipelines and credentialing.',
      bullets: [
        'Track onboarding and verification before confirming shifts.',
        'Monitor reliability trends and flag high-risk providers.',
        'Align pay bands to improve acceptance rates.',
      ],
    },
    'workforce-intelligence': {
      title: 'Workforce Intelligence',
      desc: 'Market view of job-to-candidate imbalance and launch-ready regions.',
      bullets: [
        'Use starving regions to deploy rapid recruiting and premium pay.',
        'Leverage talent-rich regions for travel/contract supply.',
        'Launch services in balanced, high-activity markets.',
      ],
    },
  }[moduleId]
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-dark-surface border-l border-dark-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{copy.title}</h3>
          <button className="text-gray-400 hover:text-white text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="text-sm text-gray-300 mb-3">{copy.desc}</p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
          {copy.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function WorkforceIntelligencePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [role, setRole] = useState<RoleFilter>((params.get('role') as RoleFilter) || 'ALL')
  const [employmentType, setEmploymentType] = useState<EmploymentFilter>(
    (params.get('employmentType') as EmploymentFilter) || 'ALL'
  )
  const [serviceLine, setServiceLine] = useState<ServiceLineFilter>(
    (params.get('serviceLine') as ServiceLineFilter) || 'ALL'
  )
  const [range, setRange] = useState<RangePreset>((params.get('range') as RangePreset) || '30d')
  const [selectedRegion, setSelectedRegion] = useState<RegionStats | null>(null)
  const [helpModule, setHelpModule] = useState<'workforce-exchange' | 'workforce' | 'workforce-intelligence' | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (role !== 'ALL') params.set('role', role)
    if (employmentType !== 'ALL') params.set('employmentType', employmentType)
    if (serviceLine !== 'ALL') params.set('serviceLine', serviceLine)
    params.set('range', range)
    return params.toString()
  }, [role, employmentType, serviceLine, range])

  const [data, setData] = useState<WorkforceIntelligenceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/workforce-intelligence?${queryString}`)
      if (!res.ok) throw new Error('Failed to load workforce intelligence')
      const json = (await res.json()) as WorkforceIntelligenceResponse
      setData(json)
      setLastRefresh(json.lastUpdated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    const search = queryString ? `/workforce-intelligence?${queryString}` : '/workforce-intelligence'
    router.replace(search)
  }, [queryString, router])

  useEffect(() => {
    const t = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <PageTransition>
      <div className="p-8 bg-dark-bg min-h-screen space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
              <Brain className="w-8 h-8 text-primary" />
              Workforce Intelligence
            </h1>
            <p className="text-gray-400 text-sm">
              Market view: regions starving for staff, talent-rich regions, and best places to launch workforce services.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  await fetch('/api/admin/workforce-intelligence/refresh', { method: 'POST' })
                  await load()
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
              {loading ? 'Refreshing...' : 'Refresh Analysis'}
            </button>
            <StatusBadge
              status={lastRefresh && Date.now() - new Date(lastRefresh).getTime() < 60 * 60 * 1000 ? 'live' : 'degraded'}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleFilter)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              {['ALL', 'RN', 'NP', 'PA', 'LPN', 'MA', 'OTHER'].map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All Roles' : r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentFilter)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              {['ALL', 'TEMP', 'PER_DIEM', 'CONTRACT', 'FULL_TIME'].map((eType) => (
                <option key={eType} value={eType}>
                  {eType === 'ALL' ? 'All Types' : eType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Service Line</label>
            <select
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as ServiceLineFilter)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              {['ALL', 'TRT', 'GLP-1', 'IV_THERAPY', 'GENERAL'].map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Service Lines' : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangePreset)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500">
          {data?.lastUpdated ? `Last updated: ${new Date(data.lastUpdated).toLocaleString()}` : null}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg text-sm text-status-offline">
            We couldn&apos;t load workforce intelligence right now. Try refreshing or check back later.
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Analyzing workforce markets...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatedCard>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-status-live" />
                  Regions Starving for Staff
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Where job postings significantly outnumber available talent (ratio &gt; 2:1)
                </p>
                {data?.starvingRegions?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.starvingRegions.map((region: RegionStats) => (
                      <div
                        key={region.stateCode}
                        title="Job-to-candidate ratio = open jobs / active candidates"
                        onClick={() => setSelectedRegion(region)}
                        className="cursor-pointer"
                      >
                        <RegionCard region={region} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No regions currently showing severe staffing shortages.</div>
                )}
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Talent-Rich Regions
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Where candidates significantly outnumber open jobs (ratio &lt; 0.5:1)
                </p>
                {data?.talentRichRegions?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.talentRichRegions.map((region: RegionStats) => (
                      <div
                        key={region.stateCode}
                        title="Job-to-candidate ratio = open jobs / active candidates"
                        onClick={() => setSelectedRegion(region)}
                        className="cursor-pointer"
                      >
                        <RegionCard region={region} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No regions currently showing excess talent supply.</div>
                )}
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Best Places to Launch Workforce Services
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Derived from job-to-candidate ratio + service line demand
                </p>
                {data?.bestLaunchRegions?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.bestLaunchRegions.map((region: RegionStats) => {
                      const ratio = region.jobToCandidateRatio
                      const summary =
                        ratio > 1.2
                          ? 'Leaning job-heavy - strong demand'
                          : ratio < 0.8
                          ? 'Leaning talent-heavy - strong supply'
                          : 'Balanced market - high activity'
                      return (
                        <div
                          key={region.stateCode}
                          className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-pointer"
                          title="Balanced, high-activity market"
                          onClick={() => setSelectedRegion(region)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-white">
                              {region.region} ({region.stateCode})
                            </div>
                            <div className="text-sm text-gray-400">
                              Score: {region.totalJobDemandScore.toFixed(1)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{summary}</p>
                          <div className="text-xs text-gray-400 mb-2">Ratio: {formatRatio(ratio)}</div>
                          <div className="flex flex-wrap gap-2">
                            {region.topServiceLines.map((line) => (
                              <span
                                key={line.serviceLine}
                                className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                              >
                                {line.serviceLine} ({line.jobCount})
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No regions surfaced for launch at this time.</div>
                )}
              </div>
            </AnimatedCard>
          </div>
        )}
      </div>
      <RegionDetailDrawer region={selectedRegion} onClose={() => setSelectedRegion(null)} />
      <ModuleHelpDrawer isOpen={helpModule !== null} onClose={() => setHelpModule(null)} moduleId={helpModule} />
    </PageTransition>
  )
}


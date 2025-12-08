'use client'

import { useState, useEffect } from 'react'
import { Brain, MapPin, TrendingUp, AlertCircle, Target, Users } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'

interface RegionStats {
  region: string
  jobCount: number
  candidateCount: number
  ratio: number // jobs / candidates
  serviceLines: string[]
}

interface WorkforceIntelligenceData {
  starvingRegions: RegionStats[]
  talentRichRegions: RegionStats[]
  bestLaunchRegions: Array<{
    region: string
    opportunityScore: number
    reasoning: string
    serviceLines: string[]
  }>
}

export default function WorkforceIntelligencePage() {
  const [loading, setLoading] = useState(false)
  const [intelligence, setIntelligence] = useState<WorkforceIntelligenceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadIntelligence = async () => {
    setLoading(true)
    setError(null)

    try {
      // Sample regions to analyze
      const regions = ['Texas', 'Florida', 'California', 'Arizona', 'New York', 'Colorado']

      // Fetch jobs and candidates for each region
      const regionStats: RegionStats[] = []

      for (const region of regions) {
        try {
          // Get jobs
          const jobsResponse = await fetch('/api/admin/mcp/workforce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'find_clinic_jobs_by_region',
              params: {
                region,
                roleType: 'NURSE',
                employmentType: 'TEMP',
              },
            }),
          })

          // Get candidates
          const candidatesResponse = await fetch('/api/admin/mcp/workforce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'find_nurses_seeking_temp_work',
              params: {
                region,
                roleType: 'RN',
                desiredEmploymentType: 'TEMP',
              },
            }),
          })

          if (jobsResponse.ok && candidatesResponse.ok) {
            const jobsData = await jobsResponse.json()
            const candidatesData = await candidatesResponse.json()

            const jobCount = jobsData.results?.totalFound || 0
            const candidateCount = candidatesData.results?.totalFound || 0
            const ratio = candidateCount > 0 ? jobCount / candidateCount : jobCount

            regionStats.push({
              region,
              jobCount,
              candidateCount,
              ratio,
              serviceLines: ['TRT', 'GLP-1', 'IV_THERAPY'],
            })
          }
        } catch (err) {
          console.error(`Error fetching data for ${region}:`, err)
        }
      }

      // Categorize regions
      const starvingRegions = regionStats
        .filter(r => r.ratio > 2) // More than 2 jobs per candidate
        .sort((a, b) => b.ratio - a.ratio)

      const talentRichRegions = regionStats
        .filter(r => r.ratio < 0.5) // Less than 0.5 jobs per candidate
        .sort((a, b) => a.ratio - b.ratio)

      // Calculate best launch regions (balanced opportunity)
      const bestLaunchRegions = regionStats
        .map(r => ({
          region: r.region,
          opportunityScore: Math.min(r.jobCount, r.candidateCount) * (1 / (1 + Math.abs(r.ratio - 1))),
          reasoning: r.ratio > 1.5
            ? `High demand (${r.jobCount} jobs) but limited supply (${r.candidateCount} candidates) - opportunity to recruit`
            : r.ratio < 0.7
            ? `Strong candidate pool (${r.candidateCount}) with moderate demand (${r.jobCount} jobs) - good for placement`
            : `Balanced market (${r.jobCount} jobs, ${r.candidateCount} candidates) - stable opportunity`,
          serviceLines: r.serviceLines,
        }))
        .sort((a, b) => b.opportunityScore - a.opportunityScore)
        .slice(0, 5)

      setIntelligence({
        starvingRegions,
        talentRichRegions,
        bestLaunchRegions,
      })
    } catch (error) {
      console.error('Error loading intelligence:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntelligence()
  }, [])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary" />
              Workforce Intelligence
            </h1>
            <p className="text-gray-400 text-lg">
              Market view: regions starving for staff, talent-rich regions, and best places to launch workforce services.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadIntelligence}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <TrendingUp className={clsx('w-4 h-4', loading && 'animate-spin')} />
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
            <StatusBadge status="live" />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
          <p className="text-sm text-status-offline">{error}</p>
        </div>
      )}

      {loading && !intelligence ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Analyzing workforce markets...</p>
          </div>
        </div>
      ) : intelligence ? (
        <div className="space-y-6">
          {/* Regions Starving for Staff */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-status-live" />
              Regions Starving for Staff
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Where job postings significantly outnumber available talent (ratio &gt; 2:1)
            </p>
            {intelligence.starvingRegions.length > 0 ? (
              <div className="space-y-3">
                {intelligence.starvingRegions.map((region, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-accent border border-status-live/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{region.region}</div>
                      <div className="text-sm text-gray-400">
                        Ratio: {region.ratio.toFixed(1)}:1 (jobs:candidates)
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Jobs</div>
                        <div className="text-white font-semibold">{region.jobCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Candidates</div>
                        <div className="text-white font-semibold">{region.candidateCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Service Lines</div>
                        <div className="text-white font-semibold">{region.serviceLines.join(', ')}</div>
                      </div>
            </div>
          </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No regions currently showing severe staffing shortages
              </div>
            )}
          </div>

          {/* Talent-Rich Regions */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Talent-Rich Regions
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Where candidates significantly outnumber open jobs (ratio &lt; 0.5:1)
            </p>
            {intelligence.talentRichRegions.length > 0 ? (
              <div className="space-y-3">
                {intelligence.talentRichRegions.map((region, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-accent border border-primary/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{region.region}</div>
                      <div className="text-sm text-gray-400">
                        Ratio: {region.ratio.toFixed(2)}:1 (jobs:candidates)
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Jobs</div>
                        <div className="text-white font-semibold">{region.jobCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Candidates</div>
                        <div className="text-white font-semibold">{region.candidateCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Service Lines</div>
                        <div className="text-white font-semibold">{region.serviceLines.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No regions currently showing excess talent supply
            </div>
            )}
          </div>

          {/* Best Places to Launch Workforce Services */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Best Places to Launch Workforce Services
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Derived from job-to-candidate ratio + service line demand
            </p>
            {intelligence.bestLaunchRegions.length > 0 ? (
              <div className="space-y-3">
                {intelligence.bestLaunchRegions.map((region, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{region.region}</div>
                      <div className="text-sm font-semibold text-primary">
                        Score: {region.opportunityScore.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{region.reasoning}</p>
                    <div className="flex flex-wrap gap-2">
                      {region.serviceLines.map((sl, sidx) => (
                        <span
                          key={sidx}
                          className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-xs text-primary"
                        >
                          {sl}
                        </span>
                      ))}
                    </div>
            </div>
                ))}
          </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No launch opportunities identified
            </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Workforce Intelligence
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Click "Refresh Analysis" to analyze workforce markets and identify opportunities.
          </p>
        </div>
      )}
    </div>
  )
}

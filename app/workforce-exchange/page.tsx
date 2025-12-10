'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Users, Search, Filter, Briefcase, Target, Mail, MessageSquare, Phone, XCircle, ArrowRight, ExternalLink } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'

type RoleType = 'RN' | 'NP' | 'PA' | 'LPN' | 'MA' | 'OTHER'
type EmploymentType = 'TEMP' | 'PER_DIEM' | 'CONTRACT'
type ServiceLineFilter = 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'

interface ClinicJob {
  jobId: string
  clinicName: string
  clinicWebsite: string | null
  jobTitle: string
  roleType: string
  employmentType: string
  location: { city: string; state: string }
  sourcePlatform: string
  postingUrl: string | null
  summary: string
  postedAt: string | null
  serviceLine?: string
  hiringUrgencySignal?: 'low' | 'medium' | 'high'
}

interface Candidate {
  candidateId: string
  displayName: string
  roleType: string
  yearsExperience: number
  primarySkills: string[]
  preferredShifts: string[]
  preferredRegions: string[]
  profileSource: string
  contactMethod: string
  summary: string
}

interface WorkforceMatch {
  clinicJob: {
    clinicName: string
    jobTitle: string
    employmentType: string
    serviceLines: string[]
    location: { city: string; state: string }
  }
  candidate: {
    displayName: string
    roleType: string
    yearsExperience: number
  }
  fitScore: number
  priority: 'high' | 'medium' | 'low'
  notes: string
  shiftCompatibility?: 'good' | 'partial' | 'poor'
  serviceLineAlignment?: 'good' | 'partial' | 'poor'
}

interface MatchDetail {
  match: WorkforceMatch
  clinicJob: ClinicJob
  candidate: Candidate
  outreachToClinic?: {
    emailSubject: string
    emailBody: string
    dmScript: string
    callOpener: string
    angleSummary?: string
    warningsOrCaveats?: string
  }
  outreachToCandidate?: {
    emailSubject: string
    emailBody: string
    dmScript: string
    callOpener: string
    angleSummary?: string
    warningsOrCaveats?: string
  }
}

interface DemandEntry {
  jobId: string
  jobTitle: string
  clinicName: string
  region: string
  employmentType: string
  urgency: 'low' | 'medium' | 'high'
  serviceLine: string
  shifts: string
  payBand: string
  fillProbability: number
  context: string
}

interface SupplyEntry {
  candidateId: string
  displayName: string
  roleType: string
  yearsExperience: number
  serviceLineMatchPct: number
  distanceMiles: number
  availability: string
  reliabilityScore: number
  fitScore: number
  riskFlags: string[]
  action: 'SEND_OFFER' | 'HOLD' | 'VERIFY'
}

export default function WorkforceExchangePage() {
  const searchParams = useSearchParams()
  const [region, setRegion] = useState('Texas')
  const [roleType, setRoleType] = useState<RoleType>('RN')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('TEMP')
  const [serviceLine, setServiceLine] = useState<ServiceLineFilter>('GENERAL')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<ClinicJob[]>([])
  const [matches, setMatches] = useState<WorkforceMatch[]>([])
  const [demand, setDemand] = useState<DemandEntry[]>([])
  const [supply, setSupply] = useState<SupplyEntry[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load region from URL params
  useEffect(() => {
    const urlRegion = searchParams.get('region')
    if (urlRegion) {
      setRegion(urlRegion)
    }
  }, [searchParams])

  const handleGenerateMatches = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/workforce/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, roleType, employmentType, serviceLine }),
      })
      if (!response.ok) throw new Error('Failed to generate matches')
      const data = await response.json()

      setDemand(data.demand || [])
      setSupply(data.supply || [])
      setInsights(data.insights || [])

      // Map demand into clinic jobs table for existing UI
      const jobsMapped: ClinicJob[] = (data.demand || []).map((d: DemandEntry, idx: number) => ({
        jobId: d.jobId || `job-${idx}`,
        clinicName: d.clinicName,
        clinicWebsite: null,
        jobTitle: d.jobTitle,
        roleType: roleType,
        employmentType: d.employmentType,
        location: { city: d.region.split('·')[1]?.trim() || '', state: d.region.split('·')[0]?.trim() || region },
        sourcePlatform: 'Workforce Exchange',
        postingUrl: null,
        summary: `${d.context} · Shifts: ${d.shifts} · Pay: ${d.payBand}`,
        postedAt: null,
        serviceLine: d.serviceLine,
        hiringUrgencySignal: d.urgency,
      }))
      setJobs(jobsMapped)

      // Map supply into matches for right panel
      const mappedMatches: WorkforceMatch[] = (data.supply || []).map((s: SupplyEntry, idx: number) => ({
        clinicJob: {
          clinicName: jobsMapped[idx % jobsMapped.length]?.clinicName || jobsMapped[0]?.clinicName || 'Clinic',
          jobTitle: jobsMapped[idx % jobsMapped.length]?.jobTitle || 'Role',
          employmentType: employmentType,
          serviceLines: [serviceLine],
          location: jobsMapped[idx % jobsMapped.length]?.location || { city: '', state: region },
        },
        candidate: {
          displayName: s.displayName,
          roleType: s.roleType,
          yearsExperience: s.yearsExperience,
        },
        fitScore: s.fitScore,
        priority: s.fitScore >= 90 ? 'high' : s.fitScore >= 80 ? 'medium' : 'low',
        notes: `Service-line match ${s.serviceLineMatchPct}%, reliability ${s.reliabilityScore}%. Action: ${s.action}`,
        shiftCompatibility: 'good',
        serviceLineAlignment: 'good',
      }))
      setMatches(mappedMatches)
    } catch (error) {
      console.error('Error generating matches:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMatch = async (match: WorkforceMatch) => {
    // Find the full job and candidate details
    const job = jobs.find(j => j.clinicName === match.clinicJob.clinicName && j.jobTitle === match.clinicJob.jobTitle)
    
    if (!job) return

    // Generate outreach packs
    try {
      const outreachResponse = await fetch('/api/admin/mcp/workforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'vertex_workforce_outreach_brain',
          params: {
            clinicJob: job,
            candidateProfile: {
              candidateId: match.candidate.displayName,
              displayName: match.candidate.displayName,
              roleType: match.candidate.roleType,
              yearsExperience: match.candidate.yearsExperience,
              primarySkills: [],
              preferredShifts: [],
              preferredRegions: [],
              profileSource: 'Workforce Exchange',
              contactMethod: 'email',
              summary: '',
            },
            direction: 'TO_CLINIC',
          },
        }),
      })

      const candidateOutreachResponse = await fetch('/api/admin/mcp/workforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'vertex_workforce_outreach_brain',
          params: {
            clinicJob: job,
            candidateProfile: {
              candidateId: match.candidate.displayName,
              displayName: match.candidate.displayName,
              roleType: match.candidate.roleType,
              yearsExperience: match.candidate.yearsExperience,
              primarySkills: [],
              preferredShifts: [],
              preferredRegions: [],
              profileSource: 'Workforce Exchange',
              contactMethod: 'email',
              summary: '',
            },
            direction: 'TO_CANDIDATE',
          },
        }),
      })

      const clinicOutreach = outreachResponse.ok ? (await outreachResponse.json()).results?.pack : null
      const candidateOutreach = candidateOutreachResponse.ok ? (await candidateOutreachResponse.json()).results?.pack : null

      setSelectedMatch({
        match,
        clinicJob: job,
        candidate: {
          candidateId: match.candidate.displayName,
          displayName: match.candidate.displayName,
          roleType: match.candidate.roleType,
          yearsExperience: match.candidate.yearsExperience,
          primarySkills: [],
          preferredShifts: [],
          preferredRegions: [],
          profileSource: 'Workforce Exchange',
          contactMethod: 'email',
          summary: '',
        },
        outreachToClinic: clinicOutreach,
        outreachToCandidate: candidateOutreach,
      })
    } catch (error) {
      console.error('Error loading match details:', error)
      setSelectedMatch({
        match,
        clinicJob: job,
        candidate: {
          candidateId: match.candidate.displayName,
          displayName: match.candidate.displayName,
          roleType: match.candidate.roleType,
          yearsExperience: match.candidate.yearsExperience,
          primarySkills: [],
          preferredShifts: [],
          preferredRegions: [],
          profileSource: 'Workforce Exchange',
          contactMethod: 'email',
          summary: '',
        },
      })
    }
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8" />
              Workforce Exchange
            </h1>
            <p className="text-gray-400 text-lg">
              Match clinics hiring temp/contract staff with nurses seeking flexible work.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Generate Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Texas"
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role Type</label>
            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value as RoleType)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="RN">RN</option>
              <option value="NP">NP</option>
              <option value="PA">PA</option>
              <option value="LPN">LPN</option>
              <option value="MA">MA</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="TEMP">TEMP</option>
              <option value="PER_DIEM">PER_DIEM</option>
              <option value="CONTRACT">CONTRACT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Service Line</label>
            <select
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as ServiceLineFilter)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="TRT">TRT</option>
              <option value="GLP-1">GLP-1</option>
              <option value="IV_THERAPY">IV Therapy</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateMatches}
          disabled={loading || !region}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Matches...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Generate Matches
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

      {/* Two Column Layout */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Clinic Jobs Table */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Clinic Jobs
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Clinic</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Urgency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Shifts / Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Fill Prob.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {jobs.map((job, idx) => (
                    <tr key={idx} className="hover:bg-dark-hover transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{job.jobTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{job.clinicName}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {job.location.city}, {job.location.state}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{job.employmentType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-medium',
                            job.hiringUrgencySignal === 'high' && 'bg-status-live/10 text-status-live',
                            job.hiringUrgencySignal === 'medium' && 'bg-status-degraded/10 text-status-degraded',
                            job.hiringUrgencySignal === 'low' && 'bg-gray-500/10 text-gray-400'
                          )}
                        >
                          {job.hiringUrgencySignal || 'Medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">{job.summary}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {demand[idx]?.fillProbability ? `${demand[idx].fillProbability}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Top Matches Table */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Top Matches
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Fit Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Reliability</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {matches.slice(0, 10).map((match, idx) => (
                    <tr
                      key={idx}
                      className={clsx(
                        'hover:bg-dark-hover transition-colors cursor-pointer',
                        selectedMatch?.match === match && 'bg-primary/10'
                      )}
                      onClick={() => handleSelectMatch(match)}
                    >
                      <td className="px-4 py-3 text-sm text-white font-medium">{match.candidate.displayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{match.candidate.roleType}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{match.candidate.yearsExperience} yrs</td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-medium',
                            match.fitScore >= 75 && 'bg-status-live/10 text-status-live',
                            match.fitScore >= 50 && 'bg-status-degraded/10 text-status-degraded',
                            match.fitScore < 50 && 'bg-gray-500/10 text-gray-400'
                          )}
                        >
                          {match.fitScore}/100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {supply[idx]?.reliabilityScore ? `${supply[idx].reliabilityScore}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectMatch(match)
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          View Match →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Match Detail Panel (Modal) */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Match Details</h2>
                  <p className="text-sm text-gray-400">
                    {selectedMatch.clinicJob.clinicName} × {selectedMatch.candidate.displayName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Fit Analysis */}
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Why They Fit
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Fit Score</div>
                    <div className="text-2xl font-bold text-primary">{selectedMatch.match.fitScore}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Priority</div>
                    <span
                      className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        selectedMatch.match.priority === 'high' && 'bg-status-live/10 text-status-live',
                        selectedMatch.match.priority === 'medium' && 'bg-status-degraded/10 text-status-degraded',
                        selectedMatch.match.priority === 'low' && 'bg-gray-500/10 text-gray-400'
                      )}
                    >
                      {selectedMatch.match.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{selectedMatch.match.notes}</p>
              </div>

              {/* Compatibility */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Shift Compatibility
                  </h4>
                  <span
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      selectedMatch.match.shiftCompatibility === 'good' && 'bg-status-live/10 text-status-live',
                      selectedMatch.match.shiftCompatibility === 'partial' && 'bg-status-degraded/10 text-status-degraded',
                      selectedMatch.match.shiftCompatibility === 'poor' && 'bg-gray-500/10 text-gray-400'
                    )}
                  >
                    {selectedMatch.match.shiftCompatibility || 'Partial'}
                  </span>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Service Line Alignment
                  </h4>
                  <span
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      selectedMatch.match.serviceLineAlignment === 'good' && 'bg-status-live/10 text-status-live',
                      selectedMatch.match.serviceLineAlignment === 'partial' && 'bg-status-degraded/10 text-status-degraded',
                      selectedMatch.match.serviceLineAlignment === 'poor' && 'bg-gray-500/10 text-gray-400'
                    )}
                  >
                    {selectedMatch.match.serviceLineAlignment || 'Partial'}
                  </span>
                </div>
              </div>

              {/* Outreach Scripts */}
              {selectedMatch.outreachToClinic && (
                <div>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                    Outreach Scripts
                  </h3>
                  
                  {/* Angle Summary */}
                  {selectedMatch.outreachToClinic.angleSummary && (
                    <div className="mb-4 bg-dark-accent border border-primary/30 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                        Core Angle
                      </h4>
                      <p className="text-sm text-gray-300">{selectedMatch.outreachToClinic.angleSummary}</p>
                    </div>
                  )}

                  {/* Warnings */}
                  {selectedMatch.outreachToClinic.warningsOrCaveats && (
                    <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                        Note
                      </h4>
                      <p className="text-sm text-yellow-300">{selectedMatch.outreachToClinic.warningsOrCaveats}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* To Clinic */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        To Clinic
                      </h4>
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                          Subject
                        </label>
                        <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-white font-medium">
                          {selectedMatch.outreachToClinic.emailSubject}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                          Email Body
                        </label>
                        <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300 whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">
                          {selectedMatch.outreachToClinic.emailBody}
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                          DM Script
                        </label>
                        <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300">
                          {selectedMatch.outreachToClinic.dmScript}
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                          Call Opener
                        </label>
                        <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300">
                          {selectedMatch.outreachToClinic.callOpener}
                        </div>
                      </div>
                    </div>

                    {/* To Candidate */}
                    {selectedMatch.outreachToCandidate && (
                      <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          To Candidate
                        </h4>
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                            Subject
                          </label>
                          <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-white font-medium">
                            {selectedMatch.outreachToCandidate.emailSubject}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                            Email Body
                          </label>
                          <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300 whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">
                            {selectedMatch.outreachToCandidate.emailBody}
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                            DM Script
                          </label>
                          <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300">
                            {selectedMatch.outreachToCandidate.dmScript}
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                            Call Opener
                          </label>
                          <div className="p-2 bg-dark-surface border border-dark-border rounded text-xs text-gray-300">
                            {selectedMatch.outreachToCandidate.callOpener}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Crosslink */}
              <div className="border-t border-dark-border pt-4">
                <a
                  href={`/clinics-control?clinic=${encodeURIComponent(selectedMatch.clinicJob.clinicName)}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Open clinic in Clinics Control <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 && !loading && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Generate matches to get started
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the controls above to find clinic jobs and match them with available talent.
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">AI Workforce Read</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

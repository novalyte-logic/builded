'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, Target, MapPin, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'
import { useWorkforceMatches, useWorkforceStaffAvailability } from '@/lib/mcp/hooks'

type RoleType = 'RN' | 'NP' | 'PA' | 'LPN' | 'MA' | 'OTHER'
type EmploymentType = 'TEMP' | 'PER_DIEM' | 'CONTRACT'
type MatchStatus = 'not_contacted' | 'clinic_contacted' | 'candidate_contacted' | 'in_conversation' | 'closed_filled'

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

interface NurseCandidate {
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

export default function WorkforcePage() {
  const [region, setRegion] = useState('Texas')
  const [roleType, setRoleType] = useState<RoleType>('RN')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('TEMP')
  const [matchStatuses, setMatchStatuses] = useState<Record<string, MatchStatus>>({})
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([])

  // Load saved statuses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workforce_match_statuses')
    if (saved) {
      setMatchStatuses(JSON.parse(saved))
    }
  }, [])

  // MCP Hooks
  const staffAvailabilityParams = {
    region,
    roleType: [roleType],
    serviceLine: undefined,
    minExperience: 0,
  }

  const { 
    data: staffData, 
    error: staffError, 
    isLoading: staffLoading,
    refetch: refetchStaff 
  } = useWorkforceStaffAvailability(staffAvailabilityParams, !!region)

  // For matches, we need shift IDs - in a real scenario, these would come from a jobs query
  // For now, we'll use empty array and show message
  const matchesParams = selectedShiftIds.length > 0 ? {
    shiftIds: selectedShiftIds,
    region,
    minScore: 50,
  } : null

  const { 
    data: matchesData, 
    error: matchesError, 
    isLoading: matchesLoading,
    refetch: refetchMatches 
  } = useWorkforceMatches(matchesParams, selectedShiftIds.length > 0)

  // Transform MCP data to UI format
  const jobs: ClinicJob[] = [] // Jobs would come from a separate query - keeping structure for future
  const candidates: NurseCandidate[] = staffData?.staff 
    ? staffData.staff.map(s => ({
        candidateId: s.id,
        displayName: s.displayName,
        roleType: s.roleType,
        yearsExperience: s.yearsExperience,
        primarySkills: s.skills,
        preferredShifts: [], // Not in current schema
        preferredRegions: s.preferredRegions,
        profileSource: 'MCP',
        contactMethod: 'Email',
        summary: `${s.roleType} with ${s.yearsExperience} years experience in ${s.skills.slice(0, 2).join(', ')}`,
      }))
    : []

  const matches = matchesData?.matches 
    ? matchesData.matches.map(m => ({
        clinicJob: {
          clinicName: m.shift.clinicName,
          jobTitle: m.shift.treatmentType || 'Clinical Staff',
          employmentType: 'TEMP',
          serviceLines: [m.shift.treatmentType],
          location: m.staff.location,
        },
        candidate: {
          displayName: m.staff.displayName,
          roleType: m.staff.roleType,
          yearsExperience: 0, // Not in match output
        },
        fitScore: m.compatibilityScore,
        priority: m.recommendation === 'strong_match' ? 'high' : 
                 m.recommendation === 'good_match' ? 'medium' : 'low',
        notes: m.notes,
      }))
    : []

  const isLoading = staffLoading || matchesLoading
  const hasError = staffError || matchesError

  const updateMatchStatus = (matchKey: string, status: MatchStatus) => {
    const updated = { ...matchStatuses, [matchKey]: status }
    setMatchStatuses(updated)
    localStorage.setItem('workforce_match_statuses', JSON.stringify(updated))
  }

  const handleRefresh = () => {
    refetchStaff()
    if (selectedShiftIds.length > 0) {
      refetchMatches()
    }
  }

  const getStatusColor = (status?: MatchStatus) => {
    switch (status) {
      case 'closed_filled':
        return 'bg-status-live/10 text-status-live border-status-live/30'
      case 'in_conversation':
        return 'bg-primary/10 text-primary border-primary/30'
      case 'clinic_contacted':
      case 'candidate_contacted':
        return 'bg-status-degraded/10 text-status-degraded border-status-degraded/30'
      default:
        return 'bg-dark-accent text-gray-500 border-dark-border'
    }
  }

  const getStatusLabel = (status?: MatchStatus) => {
    switch (status) {
      case 'closed_filled':
        return 'Closed / Filled'
      case 'in_conversation':
        return 'In Conversation'
      case 'clinic_contacted':
        return 'Clinic Contacted'
      case 'candidate_contacted':
        return 'Candidate Contacted'
      default:
        return 'Not Contacted'
    }
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Workforce Operations</h1>
          <p className="text-gray-400 mt-2">
            Manage clinic jobs, available talent, and high-priority matches.
          </p>
        </div>
        <StatusBadge status="live" />
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
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
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Employment Type</label>
          <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="TEMP">Temp</option>
              <option value="PER_DIEM">Per Diem</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-status-offline" />
            <span className="font-semibold text-status-offline">Error loading workforce data</span>
          </div>
          <p className="text-sm text-status-offline mb-3">
            {staffError?.message || matchesError?.message || 'Unknown error'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading workforce data...</span>
          </div>
        </div>
      )}

      {/* Available Talent */}
      {!isLoading && !hasError && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Available Talent
              {staffData && (
                <span className="text-sm text-gray-400 font-normal">
                  ({staffData.summary.total} available)
                </span>
              )}
            </h2>
          </div>
          {candidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Skills</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {candidates.map((candidate, idx) => (
                    <tr key={idx} className="hover:bg-dark-hover transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{candidate.displayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{candidate.roleType}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{candidate.yearsExperience} yrs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {candidate.primarySkills.slice(0, 3).join(', ')}
                        {candidate.primarySkills.length > 3 && '...'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {candidate.preferredRegions.slice(0, 2).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              {region ? `No available talent found in ${region}` : 'Select a region to view available talent'}
            </div>
          )}
        </div>
      )}

      {/* High-Priority Matches */}
      {!isLoading && !hasError && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              High-Priority Matches
              {matchesData && (
                <span className="text-sm text-gray-400 font-normal">
                  ({matchesData.summary.matchedShifts} matched)
                </span>
              )}
            </h2>
          </div>
          {matches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Clinic</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Fit Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {matches
                    .filter(m => m.priority === 'high')
                    .slice(0, 10)
                    .map((match, idx) => {
                      const matchKey = `${match.clinicJob.clinicName}-${match.candidate.displayName}`
                      const status = matchStatuses[matchKey] || 'not_contacted'
                      return (
                        <tr key={idx} className="hover:bg-dark-hover transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm text-white font-medium">{match.clinicJob.clinicName}</div>
                            <div className="text-xs text-gray-400">{match.clinicJob.jobTitle}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-white font-medium">{match.candidate.displayName}</div>
                            <div className="text-xs text-gray-400">{match.candidate.roleType}</div>
                          </td>
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
                          <td className="px-4 py-3">
                            <span
                              className={clsx(
                                'px-2 py-1 rounded text-xs font-medium',
                                match.priority === 'high' && 'bg-status-live/10 text-status-live',
                                match.priority === 'medium' && 'bg-status-degraded/10 text-status-degraded',
                                match.priority === 'low' && 'bg-gray-500/10 text-gray-400'
                              )}
                            >
                              {match.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getStatusColor(status))}>
                              {getStatusLabel(status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
          <select
            value={status}
                              onChange={(e) => updateMatchStatus(matchKey, e.target.value as MatchStatus)}
                              className="bg-dark-accent border border-dark-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                            >
                              <option value="not_contacted">Not Contacted</option>
                              <option value="clinic_contacted">Clinic Contacted</option>
                              <option value="candidate_contacted">Candidate Contacted</option>
                              <option value="in_conversation">In Conversation</option>
                              <option value="closed_filled">Closed / Filled</option>
          </select>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              {selectedShiftIds.length === 0 
                ? 'Select shift IDs to generate matches' 
                : 'No high-priority matches found'}
            </div>
          )}
        </div>
      )}

      {/* Empty State - No Data */}
      {!isLoading && !hasError && candidates.length === 0 && matches.length === 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No workforce data available
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a region and role type above to view available talent and matches.
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Calendar, Filter, Search, Eye, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Explainer from './Explainer'

interface Assessment {
  id: string
  created_at: string
  flow_type: string
  path: string // Legacy alias
  status: string
  risk_level: 'low' | 'moderate' | 'high' | null
  predicted_ltv_band: 'low' | 'medium' | 'high' | null
  city: string | null
  country: string | null
  acquisition_channel: string | null
  ai_summary_json: {
    summary: string
    keySymptoms: string[]
    riskFactors: string[]
    redFlags: string[]
    recommendedPath: string
    urgency: 'low' | 'medium' | 'high'
    highlights: string[]
  } | null
  lead: {
    id: string
    status: string
    priority: string
  } | null
}

interface AssessmentQueueProps {
  onSelectAssessment: (assessment: Assessment) => void
  selectedAssessmentId?: string | null
}

export default function AssessmentQueue({
  onSelectAssessment,
  selectedAssessmentId,
}: AssessmentQueueProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    flow_type: '',
    risk_level: '',
    predicted_ltv_band: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchAssessments()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAssessments, 30000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.flow_type) params.set('flow_type', filters.flow_type)
      if (filters.risk_level) params.set('risk_level', filters.risk_level)
      if (filters.predicted_ltv_band) params.set('predicted_ltv_band', filters.predicted_ltv_band)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)

      const response = await fetch(`/api/admin/assessments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch assessments')

      const data = await response.json()
      setAssessments(data.assessments || [])
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-status-live" />
      case 'unqualified':
        return <XCircle className="w-4 h-4 text-status-offline" />
      case 'needs_review':
        return <AlertCircle className="w-4 h-4 text-status-degraded" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }



  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      {/* Filters */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Explainer
            title="Status Filter"
            what="Filter assessments by their current status (in progress, completed, qualified, etc.)."
            why="Quickly find assessments that need attention or review."
            how={['Select status to see only matching assessments', 'Use "needs_review" to find items requiring admin attention']}
          >
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </Explainer>

          <Explainer
            title="Flow Type Filter"
            what="Filter by assessment flow type (TRT, GLP-1, Peptides, Recovery, Longevity)."
            why="Focus on specific treatment protocols to review relevant assessments."
            how={['Select a flow type to see only assessments for that protocol', 'Useful for protocol-specific analysis']}
          >
            <select
              value={filters.flow_type}
              onChange={(e) => setFilters({ ...filters, flow_type: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Flow Types</option>
              <option value="TRT">TRT</option>
              <option value="GLP1">GLP-1</option>
              <option value="PEPTIDES">Peptides</option>
              <option value="RECOVERY">Recovery</option>
              <option value="LONGEVITY">Longevity</option>
              <option value="GENERAL">General</option>
            </select>
          </Explainer>

          <Explainer
            title="Risk Level Filter"
            what="Filter by risk level (low, moderate, high) as determined by AI analysis."
            why="Prioritize high-risk assessments that may need immediate medical attention."
            how={['Select risk level to filter results', 'High risk assessments typically need urgent review', 'Useful for triage workflows']}
          >
            <select
              value={filters.risk_level}
              onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </Explainer>

          <Explainer
            title="LTV Band Filter"
            what="Filter by predicted lifetime value band (low, medium, high) from AI analysis."
            why="Focus on high-value leads that generate the most revenue potential."
            how={['Filter by LTV band to see highest-value assessments', 'High LTV typically means longer patient relationships', 'Useful for prioritizing follow-up']}
          >
            <select
              value={filters.predicted_ltv_band}
              onChange={(e) => setFilters({ ...filters, predicted_ltv_band: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All LTV Bands</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Explainer>

          <Explainer
            title="Start Date"
            what="Filter assessments created on or after this date."
            why="Review assessments from specific time periods."
            how={['Select start date to begin date range filter', 'Combine with end date for specific period']}
          >
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </Explainer>

          <Explainer
            title="End Date"
            what="Filter assessments created on or before this date."
            why="Review assessments from specific time periods."
            how={['Select end date to complete date range filter', 'Combine with start date for specific period']}
          >
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </Explainer>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created At
              </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Flow Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  LTV Band
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading assessments...
                </td>
              </tr>
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No assessments found
                </td>
              </tr>
            ) : (
              assessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  onClick={() => onSelectAssessment(assessment)}
                  className={`hover:bg-dark-hover cursor-pointer transition-colors ${
                    selectedAssessmentId === assessment.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(assessment.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                      {assessment.flow_type || assessment.path}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assessment.status)}
                      <span className="text-sm text-gray-300 capitalize">{assessment.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assessment.risk_level ? (
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        assessment.risk_level === 'high'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : assessment.risk_level === 'moderate'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {assessment.risk_level.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assessment.predicted_ltv_band ? (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          assessment.predicted_ltv_band === 'high'
                            ? 'bg-status-live/20 text-status-live border-status-live/30'
                            : assessment.predicted_ltv_band === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {assessment.predicted_ltv_band.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {assessment.acquisition_channel || 'Unknown'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


'use client'

import { useMemo, useState } from 'react'
import { Filter, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
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
  patient?: {
    age: number
    gender: string
    bmi?: number
    state?: string
    serviceInterest?: string
  }
  symptoms?: string[]
  goals?: string[]
  lifestyle?: string[]
  redFlags?: string[]
  triageSummary?: {
    clinicalRisk: 'low' | 'moderate' | 'high'
    conversionPotential: 'low' | 'moderate' | 'high'
    keySignals: string[]
    riskFactors: string[]
    recommendedAction: string
  }
}

interface AssessmentQueueProps {
  onSelectAssessment: (assessment: Assessment) => void
  selectedAssessmentId?: string | null
}

export default function AssessmentQueue({
  onSelectAssessment,
  selectedAssessmentId,
}: AssessmentQueueProps) {
  const [filters, setFilters] = useState({
    status: '',
    flow_type: '',
    risk_level: '',
    predicted_ltv_band: '',
    startDate: '',
    endDate: '',
  })

  const assessments: Assessment[] = useMemo(
    () => [
      {
        id: 'ASMT-889',
        created_at: '2024-05-08T14:20:00Z',
        updated_at: '2024-05-08T14:25:00Z',
        flow_type: 'TRT',
        path: 'TRT',
        status: 'in_progress',
        risk_level: 'moderate',
        predicted_ltv_band: 'high',
        city: 'Dallas',
        country: 'US',
        acquisition_channel: 'Meta',
        ai_summary_json: {
          summary: 'Patient reporting low energy, poor sleep; interested in TRT consult.',
          keySymptoms: ['Low energy', 'Poor sleep', 'Low libido'],
          riskFactors: ['Possible sleep apnea risk'],
          redFlags: [],
          recommendedPath: 'Route to TRT clinic with sleep screening',
          urgency: 'medium',
          highlights: ['Engaged in chat', 'Asked about pricing', 'Completed 70% of assessment'],
        },
        lead: { id: 'LD-001', status: 'in_review', priority: 'high' },
        patient: { age: 42, gender: 'Male', bmi: 29.5, state: 'TX', serviceInterest: 'TRT' },
        symptoms: ['Low energy', 'Low libido', 'Brain fog'],
        goals: ['Increase energy', 'Improve sleep'],
        lifestyle: ['Irregular sleep', 'Desk job', 'Moderate activity'],
        redFlags: ['Possible sleep apnea'],
        triageSummary: {
          clinicalRisk: 'moderate',
          conversionPotential: 'high',
          keySignals: ['High engagement', 'Clear TRT symptoms', 'High LTV band'],
          riskFactors: ['Sleep apnea screening needed'],
          recommendedAction: 'Route to TX TRT clinic and schedule consult with sleep screening',
        },
      },
      {
        id: 'ASMT-102',
        created_at: '2024-05-06T10:05:00Z',
        updated_at: '2024-05-06T10:20:00Z',
        flow_type: 'GLP-1',
        path: 'GLP1',
        status: 'completed',
        risk_level: 'low',
        predicted_ltv_band: 'medium',
        city: 'Phoenix',
        country: 'US',
        acquisition_channel: 'Google',
        ai_summary_json: {
          summary: 'Weight loss interest; no major red flags noted.',
          keySymptoms: ['Weight gain', 'Low activity'],
          riskFactors: ['Family history of diabetes'],
          redFlags: [],
          recommendedPath: 'GLP-1 coaching and nutrition consult',
          urgency: 'low',
          highlights: ['Completed assessment fully', 'Open to coaching'],
        },
        lead: { id: 'LD-004', status: 'contacted', priority: 'medium' },
        patient: { age: 38, gender: 'Female', bmi: 31.2, state: 'AZ', serviceInterest: 'GLP-1' },
        symptoms: ['Weight gain', 'Low energy'],
        goals: ['Lose 20 lbs', 'Improve activity'],
        lifestyle: ['Sedentary work', 'Low activity'],
        redFlags: [],
        triageSummary: {
          clinicalRisk: 'low',
          conversionPotential: 'moderate',
          keySignals: ['Completed flow', 'Open to coaching'],
          riskFactors: ['BMI 31.2, family diabetes risk'],
          recommendedAction: 'Offer GLP-1 program with nutrition kick-off',
        },
      },
      {
        id: 'ASMT-221',
        created_at: '2024-05-03T09:15:00Z',
        updated_at: '2024-05-03T09:25:00Z',
        flow_type: 'PEPTIDES',
        path: 'PEPTIDES',
        status: 'qualified',
        risk_level: 'low',
        predicted_ltv_band: 'high',
        city: 'Miami',
        country: 'US',
        acquisition_channel: 'TikTok',
        ai_summary_json: {
          summary: 'Interested in recovery peptides; athletic lifestyle.',
          keySymptoms: ['Recovery soreness'],
          riskFactors: ['None notable'],
          redFlags: [],
          recommendedPath: 'Route to peptide program consult',
          urgency: 'medium',
          highlights: ['Athletic profile', 'High LTV potential'],
        },
        lead: { id: 'LD-006', status: 'converted', priority: 'high' },
        patient: { age: 29, gender: 'Male', bmi: 24.1, state: 'FL', serviceInterest: 'Peptides' },
        symptoms: ['Recovery soreness'],
        goals: ['Faster recovery'],
        lifestyle: ['High activity', 'Regular training'],
        redFlags: [],
        triageSummary: {
          clinicalRisk: 'low',
          conversionPotential: 'high',
          keySignals: ['Athletic, clear use case', 'High engagement', 'High LTV band'],
          riskFactors: [],
          recommendedAction: 'Book peptide consult and fast-track intake',
        },
      },
      {
        id: 'ASMT-305',
        created_at: '2024-05-02T16:40:00Z',
        updated_at: '2024-05-02T16:50:00Z',
        flow_type: 'RECOVERY',
        path: 'RECOVERY',
        status: 'needs_review',
        risk_level: 'high',
        predicted_ltv_band: 'low',
        city: 'Denver',
        country: 'US',
        acquisition_channel: 'Referral',
        ai_summary_json: {
          summary: 'Reports chest discomfort during exercise. Needs medical review.',
          keySymptoms: ['Chest discomfort', 'Shortness of breath'],
          riskFactors: ['Potential cardiac risk'],
          redFlags: ['Chest discomfort on exertion'],
          recommendedPath: 'Escalate to medical review before any protocol',
          urgency: 'high',
          highlights: ['Referral from friend', 'High-risk red flag present'],
        },
        lead: { id: 'LD-010', status: 'new', priority: 'high' },
        patient: { age: 51, gender: 'Male', bmi: 28.4, state: 'CO', serviceInterest: 'Recovery' },
        symptoms: ['Chest discomfort', 'Shortness of breath'],
        goals: ['Improve endurance'],
        lifestyle: ['Moderate activity', 'Some cardio'],
        redFlags: ['Chest discomfort on exertion'],
        triageSummary: {
          clinicalRisk: 'high',
          conversionPotential: 'low',
          keySignals: ['Referral lead', 'Interested in recovery'],
          riskFactors: ['Cardiac red flag'],
          recommendedAction: 'Hold marketing; escalate to medical review immediately',
        },
      },
      {
        id: 'ASMT-412',
        created_at: '2024-05-01T11:00:00Z',
        updated_at: '2024-05-01T11:05:00Z',
        flow_type: 'GENERAL',
        path: 'GENERAL',
        status: 'completed',
        risk_level: 'moderate',
        predicted_ltv_band: 'medium',
        city: 'Austin',
        country: 'US',
        acquisition_channel: 'Direct',
        ai_summary_json: {
          summary: 'General wellness interest; wants better sleep and stress management.',
          keySymptoms: ['Poor sleep', 'Stress'],
          riskFactors: ['High stress job'],
          redFlags: [],
          recommendedPath: 'General wellness consult with sleep/stress focus',
          urgency: 'low',
          highlights: ['Direct inbound', 'Open to coaching'],
        },
        lead: { id: 'LD-011', status: 'contacted', priority: 'medium' },
        patient: { age: 35, gender: 'Male', bmi: 26.0, state: 'TX', serviceInterest: 'General' },
        symptoms: ['Poor sleep', 'Stress'],
        goals: ['Improve sleep', 'Reduce stress'],
        lifestyle: ['Desk job', 'Low activity'],
        redFlags: [],
        triageSummary: {
          clinicalRisk: 'moderate',
          conversionPotential: 'moderate',
          keySignals: ['Direct inbound', 'Clear goals'],
          riskFactors: ['High stress'],
          recommendedAction: 'Schedule consult; route to sleep/stress protocol',
        },
      },
    ],
    []
  )

  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (filters.status && a.status !== filters.status) return false
      if (filters.flow_type && a.flow_type !== filters.flow_type && a.path !== filters.flow_type)
        return false
      if (filters.risk_level && a.risk_level !== filters.risk_level) return false
      if (filters.predicted_ltv_band && a.predicted_ltv_band !== filters.predicted_ltv_band)
        return false

      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime()
        if (new Date(a.created_at).getTime() < start) return false
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime()
        if (new Date(a.created_at).getTime() > end) return false
      }
      return true
    })
  }, [assessments, filters])

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
            {filteredAssessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No assessments found
                </td>
              </tr>
            ) : (
              filteredAssessments.map((assessment) => (
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

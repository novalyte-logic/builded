'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, Edit, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Assessment {
  id: string
  created_at: string
  updated_at: string
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
    notes: string | null
  } | null
}

interface AssessmentDetailProps {
  assessmentId: string | null
  onClose: () => void
  onUpdateLead?: () => void
}

export default function AssessmentDetail({
  assessmentId,
  onClose,
  onUpdateLead,
}: AssessmentDetailProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment()
    }
  }, [assessmentId])

  const fetchAssessment = async () => {
    if (!assessmentId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/assessments/${assessmentId}`)
      if (!response.ok) throw new Error('Failed to fetch assessment')

      const data = await response.json()
      setAssessment(data.assessment)
    } catch (error) {
      console.error('Error fetching assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!assessmentId) return null

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading assessment details...</div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-red-400">Assessment not found</div>
      </div>
    )
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Assessment Details</h3>
            <p className="text-sm text-gray-400 mt-1">
              {assessment.flow_type || assessment.path} • {new Date(assessment.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status & Qualification */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <div className="flex items-center gap-2">
              {assessment.status === 'qualified' && (
                <CheckCircle className="w-4 h-4 text-status-live" />
              )}
              {assessment.status === 'unqualified' && (
                <XCircle className="w-4 h-4 text-status-offline" />
              )}
              {assessment.status === 'needs_review' && (
                <AlertTriangle className="w-4 h-4 text-status-degraded" />
              )}
              <span className="text-sm text-white capitalize">
                {assessment.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Predicted LTV Band</p>
            {assessment.predicted_ltv_band ? (
              <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${
                assessment.predicted_ltv_band === 'high'
                  ? 'bg-status-live/20 text-status-live border-status-live/30'
                  : assessment.predicted_ltv_band === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {assessment.predicted_ltv_band.toUpperCase()}
              </span>
            ) : (
              <span className="text-sm text-gray-400">Not calculated</span>
            )}
          </div>
          {assessment.risk_level && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Risk Level</p>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${
                assessment.risk_level === 'high'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : assessment.risk_level === 'moderate'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {assessment.risk_level.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {assessment.ai_summary_json && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">AI Summary</h4>
            
            {/* Plain English Summary */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Summary</p>
              <p className="text-sm text-gray-300 bg-dark-accent border border-dark-border rounded-lg p-3 leading-relaxed">
                {assessment.ai_summary_json.summary}
              </p>
            </div>

            <div className="space-y-4">
              {assessment.ai_summary_json.highlights.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Key Highlights</p>
                  <ul className="list-disc list-inside space-y-1">
                    {assessment.ai_summary_json.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-300">{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.ai_summary_json.keySymptoms.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Key Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.ai_summary_json.keySymptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assessment.ai_summary_json.riskFactors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Risk Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.ai_summary_json.riskFactors.map((risk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400"
                      >
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assessment.ai_summary_json.redFlags && assessment.ai_summary_json.redFlags.length > 0 && (
                <div>
                  <p className="text-xs text-red-400 mb-2 font-semibold">Red Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.ai_summary_json.redFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-medium"
                      >
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 mb-2">Urgency</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(
                    assessment.ai_summary_json.urgency
                  )}`}
                >
                  {assessment.ai_summary_json.urgency.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Linked Lead */}
          {assessment.lead ? (
            <div className="border-t border-dark-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white">Linked Lead</h4>
                <div className="flex items-center gap-2">
                  <a
                    href={`/leads/${assessment.lead.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Full Context
                  </a>
                {onUpdateLead && (
                  <button
                    onClick={onUpdateLead}
                    className="flex items-center gap-1 px-3 py-1.5 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-xs"
                  >
                    <Edit className="w-3 h-3" />
                    Update Status
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Lead Status</p>
                <span className="text-sm text-white capitalize">{assessment.lead.status.replace('_', ' ')}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <span className="text-sm text-white capitalize">{assessment.lead.priority}</span>
              </div>
              {assessment.lead.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-300">{assessment.lead.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-dark-border pt-6">
            <p className="text-sm text-gray-400">No linked lead record</p>
          </div>
        )}

        {/* Location */}
        {(assessment.city || assessment.country) && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Location</p>
            <p className="text-sm text-gray-300">
              {assessment.city || ''}
              {assessment.city && assessment.country && ', '}
              {assessment.country || ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


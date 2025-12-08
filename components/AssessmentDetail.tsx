'use client'

import { useState } from 'react'
import { X, ExternalLink, Edit, AlertTriangle, CheckCircle, XCircle, Stethoscope, Activity, BrainCircuit } from 'lucide-react'

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

interface AssessmentDetailProps {
  assessment: Assessment | null
  onClose: () => void
  onUpdateLead?: () => void
}

export default function AssessmentDetail({
  assessment,
  onClose,
  onUpdateLead,
}: AssessmentDetailProps) {
  const [showTriageModal, setShowTriageModal] = useState(false)

  if (!assessment) return null

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
    <div className="bg-dark-surface border border-dark-border rounded-lg relative">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Assessment Details</h3>
            <p className="text-sm text-gray-400 mt-1">
              {assessment.flow_type || assessment.path} • {new Date(assessment.created_at).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">ID: {assessment.id}</p>
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

          {/* Patient Snapshot */}
          {assessment.patient && (
            <div className="border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-white">Patient Snapshot</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
                <div>Age: {assessment.patient.age}</div>
                <div>Gender: {assessment.patient.gender}</div>
                <div>BMI: {assessment.patient.bmi ?? '—'}</div>
                <div>State: {assessment.patient.state ?? '—'}</div>
                <div>Service Interest: {assessment.patient.serviceInterest ?? '—'}</div>
              </div>
            </div>
          )}

          {/* Symptoms & Goals */}
          {(assessment.symptoms || assessment.goals) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-dark-border rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.symptoms?.map((s, idx) => (
                    <span key={idx} className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300">
                      {s}
                    </span>
                  )) || <span className="text-xs text-gray-500">No symptoms listed</span>}
                </div>
              </div>
              <div className="border border-dark-border rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.goals?.map((g, idx) => (
                    <span key={idx} className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300">
                      {g}
                    </span>
                  )) || <span className="text-xs text-gray-500">No goals listed</span>}
                </div>
              </div>
            </div>
          )}

          {/* Lifestyle & Risks */}
          {(assessment.lifestyle || assessment.redFlags) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-dark-border rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">Lifestyle Factors</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.lifestyle?.map((l, idx) => (
                    <span key={idx} className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300">
                      {l}
                    </span>
                  )) || <span className="text-xs text-gray-500">No lifestyle data</span>}
                </div>
              </div>
              <div className="border border-dark-border rounded-lg p-3">
                <p className="text-xs text-red-400 mb-2 font-semibold">Red Flags</p>
                <div className="flex flex-wrap gap-2">
                  {assessment.redFlags?.length
                    ? assessment.redFlags.map((flag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-medium">
                          ⚠ {flag}
                        </span>
                      ))
                    : <span className="text-xs text-gray-500">No red flags</span>}
                </div>
              </div>
            </div>
          )}

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

          {/* AI Triage Summary */}
          {assessment.triageSummary && (
            <div className="border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-white">AI Triage Summary</h4>
                <button
                  onClick={() => setShowTriageModal(true)}
                  className="ml-auto text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition"
                >
                  View Full AI Triage Reasoning
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-200 mb-3">
                <div>
                  Clinical Risk: <span className="font-semibold capitalize">{assessment.triageSummary.clinicalRisk}</span>
                </div>
                <div>
                  Conversion Potential:{' '}
                  <span className="font-semibold capitalize">{assessment.triageSummary.conversionPotential}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Opportunity Signals</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {assessment.triageSummary.keySignals.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Risk Factors</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {assessment.triageSummary.riskFactors.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Why this risk & potential</p>
                <p className="text-sm text-gray-300 mb-3">
                  {`Risk is ${assessment.triageSummary.clinicalRisk} due to ${
                    assessment.triageSummary.riskFactors?.[0] || 'available assessment signals'
                  }. Conversion potential is ${assessment.triageSummary.conversionPotential} because ${
                    assessment.triageSummary.keySignals?.[0] || 'engagement and fit indicators'
                  }.`}
                </p>
                <p className="text-xs text-gray-400 mb-1">Recommended Action</p>
                <p className="text-sm text-primary font-semibold">
                  {assessment.triageSummary.recommendedAction}
                </p>
              </div>
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
      {assessment.triageSummary && (
        <TriageModal
          open={showTriageModal}
          onClose={() => setShowTriageModal(false)}
          summary={assessment.triageSummary}
          flowType={assessment.flow_type || assessment.path}
        />
      )}
    </div>
  )
}

function TriageModal({
  open,
  onClose,
  summary,
  flowType,
}: {
  open: boolean
  onClose: () => void
  summary: NonNullable<Assessment['triageSummary']>
  flowType: string
}) {
  if (!open) return null

  const narrative = `
Based on the provided assessment, the AI classifies this case as ${summary.clinicalRisk} clinical risk and ${summary.conversionPotential} conversion potential.

Clinical reasoning:
- ${summary.riskFactors.join('\n- ') || 'No major risks detected.'}

Conversion reasoning:
- ${summary.keySignals.join('\n- ') || 'Limited positive signals.'}

Recommended action:
${summary.recommendedAction}

This triage is based on the ${flowType || 'protocol'} flow inputs, patient engagement, and observed symptoms/flags.`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg bg-dark-surface border border-dark-border shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-white">AI Triage Reasoning</h3>
              <p className="text-xs text-gray-400">Clinical risk and conversion analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-dark-hover hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
            <div>
              Clinical Risk:{' '}
              <span className="font-semibold capitalize">{summary.clinicalRisk}</span>
            </div>
            <div>
              Conversion Potential:{' '}
              <span className="font-semibold capitalize">{summary.conversionPotential}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase">Key Opportunity Signals</p>
            <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
              {summary.keySignals.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase">Risk / Contraindication Signals</p>
            <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
              {summary.riskFactors.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase">Narrative</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{narrative}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase">Recommended Next Step</p>
            <p className="text-sm text-primary font-semibold">{summary.recommendedAction}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

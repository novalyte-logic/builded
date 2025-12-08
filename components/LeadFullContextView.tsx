'use client'

import { useEffect, useState } from 'react'
import { 
  User, 
  FileText, 
  MessageSquare, 
  Brain, 
  MapPin, 
  Tag, 
  ExternalLink,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Explainer from './Explainer'

interface LeadFullContext {
  lead: {
    id: string
    assessment_id: string | null
    user_id: string | null
    created_at: string
    lead_type: string
    origin: string
    status: string
    priority: string
    tags: string[]
    notes: string | null
  }
  assessments: Array<{
    id: string
    created_at: string
    path: string
    status: string
    predicted_LTV: number | null
    summary: {
      keySymptoms: string[]
      riskFactors: string[]
      highlights: string[]
      urgency: string
    } | null
  }>
  threads: Array<{
    id: string
    subject: string
    channel: string
    last_activity_at: string
    message_count: number
  }>
  aiSummary: string | null
}

interface LeadFullContextViewProps {
  leadId: string
  onClose?: () => void
}

export default function LeadFullContextView({ leadId, onClose }: LeadFullContextViewProps) {
  const [context, setContext] = useState<LeadFullContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'messages'>('overview')

  useEffect(() => {
    fetchContext()
  }, [leadId])

  const fetchContext = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/leads/${leadId}/context`)
      if (!response.ok) throw new Error('Failed to fetch lead context')

      const data = await response.json()
      setContext(data)
    } catch (error) {
      console.error('Error fetching lead context:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-dark-accent rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!context) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-red-400">Failed to load lead context</div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified':
      case 'converted':
        return <CheckCircle className="w-4 h-4 text-status-live" />
      case 'unqualified':
      case 'closed':
        return <XCircle className="w-4 h-4 text-status-offline" />
      case 'needs_review':
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-status-degraded" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Lead Full Context</h2>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(context.lead.priority)}`}>
                {context.lead.priority.toUpperCase()} PRIORITY
              </span>
              <span className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-300 capitalize">
                {context.lead.lead_type}
              </span>
              <span className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-300 capitalize">
                {context.lead.origin}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-dark-border -mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assessments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Assessments ({context.assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Messages ({context.threads.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Summary */}
            {context.aiSummary && (
              <Explainer
                title="AI Context Summary"
                what="AI-generated narrative summary of this lead based on all available data (assessments, messages, lead attributes)."
                why="Quickly understand lead intent, characteristics, and recommended actions without reviewing each piece of data separately."
                how={[
                  'Use summary to prioritize follow-up actions',
                  'Reference key details mentioned in summary',
                  'Update lead notes if summary highlights important insights'
                ]}
              >
                <div className="bg-dark-accent border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-white">AI Insight</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{context.aiSummary}</p>
                </div>
              </Explainer>
            )}

            {/* Lead Snapshot */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Lead Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(context.lead.status)}
                    <span className="text-sm text-white capitalize">{context.lead.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <span className={`text-sm px-2 py-1 rounded-full border ${getPriorityColor(context.lead.priority)}`}>
                    {context.lead.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Type</p>
                  <span className="text-sm text-white capitalize">{context.lead.lead_type}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Origin</p>
                  <span className="text-sm text-white capitalize">{context.lead.origin.replace('_', ' ')}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Clock className="w-3 h-3" />
                    {new Date(context.lead.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Assessments</p>
                  <span className="text-sm text-white">{context.assessments.length}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Messages</p>
                  <span className="text-sm text-white">{context.threads.length}</span>
                </div>
                {context.assessments.length > 0 && context.assessments[0].predicted_LTV && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Predicted LTV</p>
                    <span className="text-sm font-semibold text-status-live">
                      {formatCurrency(context.assessments[0].predicted_LTV)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {context.lead.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {context.lead.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-dark-accent border border-dark-border rounded-full text-gray-300 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {context.lead.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Notes</p>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{context.lead.notes}</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/assessments`, '_blank')}
                  className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                >
                  View Assessment
                </button>
                {context.threads.length > 0 && (
                  <button
                    onClick={() => window.open(`/communication`, '_blank')}
                    className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
                  >
                    View Messages
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {context.assessments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No assessments linked to this lead</div>
            ) : (
              context.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="bg-dark-accent border border-dark-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(assessment.status)}
                        <span className="text-sm font-semibold text-white">{assessment.path}</span>
                        <span className="text-xs text-gray-400 capitalize">
                          {assessment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(assessment.created_at).toLocaleString()}
                      </div>
                    </div>
                    {assessment.predicted_LTV && (
                      <span className="text-sm font-semibold text-status-live">
                        {formatCurrency(assessment.predicted_LTV)}
                      </span>
                    )}
                  </div>

                  {assessment.summary && (
                    <div className="space-y-2">
                      {assessment.summary.highlights.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Key Highlights</p>
                          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            {assessment.summary.highlights.slice(0, 3).map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {assessment.summary.keySymptoms.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Symptoms</p>
                          <div className="flex flex-wrap gap-1">
                            {assessment.summary.keySymptoms.slice(0, 5).map((symptom, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-400"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => window.open(`/assessments?id=${assessment.id}`, '_blank')}
                    className="mt-3 w-full px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-xs flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Full Assessment
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            {context.threads.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No messages linked to this lead</div>
            ) : (
              context.threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:bg-dark-hover transition-colors cursor-pointer"
                  onClick={() => window.open(`/communication?thread=${thread.id}`, '_blank')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{thread.subject}</h4>
                    <span className="text-xs px-2 py-1 bg-dark-surface rounded-full text-gray-400 capitalize">
                      {thread.channel.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{thread.message_count} message(s)</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(thread.last_activity_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}


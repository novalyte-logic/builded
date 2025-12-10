'use client'

import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import { BrainCircuit } from 'lucide-react'
import { LeadRecord } from '@/lib/types/leads'

interface LeadDetailPanelProps {
  lead: LeadRecord | null
  loading: boolean
  error: string | null
}

export default function LeadDetailPanel({ lead, loading, error }: LeadDetailPanelProps) {
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 animate-pulse space-y-4">
        <div className="h-6 bg-dark-border rounded" />
        <div className="h-4 bg-dark-border rounded w-2/3" />
        <div className="h-4 bg-dark-border rounded w-1/2" />
        <div className="h-32 bg-dark-border rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 text-sm text-status-degraded">
        {error}
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 text-sm text-gray-400">
        Select a lead from the table to view full context.
      </div>
    )
  }

  const statusLabel = lead.status.replace('_', ' ')
  const priorityLabel = lead.priority

  return (
    <>
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Lead ID</p>
            <p className="text-lg font-semibold text-white">{lead.id}</p>
            <p className="text-sm text-gray-400 capitalize">{lead.type.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                lead.priority === 'high'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : lead.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              Priority: {priorityLabel}
            </span>
            <span className="text-xs px-2 py-1 rounded-full border bg-dark-accent border-dark-border text-gray-200">
              Created: {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status === 'new' ? 'live' : lead.status === 'closed' ? 'offline' : 'degraded'} />
          <span className="text-sm text-gray-300 capitalize">{statusLabel}</span>
        </div>

        {/* Contact */}
        <div className="border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase mb-2">Contact & Context</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-200">
            <div>
              <p className="text-gray-500 text-xs">Name</p>
              <p>{lead.name || lead.clinicOrVendorName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p>{lead.email || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Phone</p>
              <p>{lead.phone || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Clinic / Vendor</p>
              <p>{lead.clinicOrVendorName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Service Line</p>
              <p>{lead.serviceLine || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Region</p>
              <p>{lead.region || '—'}</p>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase mb-2">Attribution</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-200">
            <div>
              <p className="text-gray-500 text-xs">Channel</p>
              <p>{lead.channel || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Campaign</p>
              <p>{lead.campaign || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Ad Group</p>
              <p>{lead.adGroup || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Geo</p>
              <p>{lead.geo || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 text-xs">Source URL</p>
              <p className="break-all">{lead.sourceUrl || '—'}</p>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase mb-2">Assessment</p>
          {lead.assessmentId ? (
            <div className="space-y-1 text-sm text-gray-200">
              <p>
                <span className="text-gray-500">ID:</span> {lead.assessmentId}
              </p>
              <p>
                <span className="text-gray-500">Status:</span> {lead.assessmentStatus || '—'}
              </p>
              <p>
                <span className="text-gray-500">Last Updated:</span>{' '}
                {lead.assessmentUpdatedAt ? new Date(lead.assessmentUpdatedAt).toLocaleString() : '—'}
              </p>
              <p>
                <span className="text-gray-500">Primary Goals:</span>{' '}
                {lead.primaryGoals?.join(', ') || '—'}
              </p>
              <p>
                <span className="text-gray-500">Key Flags:</span>{' '}
                {lead.keyFlags?.join(', ') || '—'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No assessment started.</p>
          )}
        </div>

        {/* AI Insight */}
        <div className="border border-dark-border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase">AI Insight</p>
            <div className="flex items-center gap-2">
              {lead.aiRiskLevel && (
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    lead.aiRiskLevel === 'high'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : lead.aiRiskLevel === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-status-live/20 text-status-live border-status-live/30'
                  }`}
                >
                  {lead.aiRiskLevel} risk
                </span>
              )}
              <button
                onClick={() => setIsReasoningModalOpen(true)}
                className="px-2 py-1 text-xs text-blue-400 bg-blue-900/50 rounded-md hover:bg-blue-900"
              >
                <BrainCircuit size={16} className="inline mr-1" />
                AI Thoughts
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{lead.aiInsightSummary || '—'}</p>
          {lead.aiQualificationScore !== undefined && (
            <p className="text-xs text-gray-400">
              Qualified: {lead.aiQualificationScore} / 100
            </p>
          )}
        </div>

        {/* Activity */}
        <div className="border border-dark-border rounded-lg p-3 space-y-3">
          <p className="text-xs text-gray-500 uppercase">Activity Timeline</p>
          <div className="space-y-2">
            {lead.activity.map((evt) => (
              <div key={evt.id} className="text-sm text-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 text-xs">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500">{evt.kind.replace('_', ' ')}</span>
                </div>
                <p className="font-medium">{evt.summary}</p>
                <p className="text-xs text-gray-500 mt-1">Actor: {evt.actor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal notes */}
        <div className="border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase mb-2">Internal Notes</p>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-200 whitespace-pre-wrap">
            {lead.internalNotes || '—'}
          </div>
        </div>
      </div>
      {isReasoningModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setIsReasoningModalOpen(false)}
        >
          <div
            className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-lg w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-white">AI Thoughts — {lead.id}</h3>
              </div>
              <button
                onClick={() => setIsReasoningModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-200">
              <p>
                <span className="text-gray-500">Risk:</span> {lead.aiRiskLevel || '—'}
              </p>
              <p>
                <span className="text-gray-500">Qualification:</span>{' '}
                {lead.aiQualificationScore !== undefined ? `${lead.aiQualificationScore}/100` : '—'}
              </p>
              <p className="text-gray-300 whitespace-pre-wrap">
                {lead.aiInsightSummary ||
                  `This lead is a strong fit for ${lead.serviceLine || 'the service'}, coming from ${
                    lead.channel || 'the channel'
                  } with clear intent. Recommend quick follow-up within 24 hours.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


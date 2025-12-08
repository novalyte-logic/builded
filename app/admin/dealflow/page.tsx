'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  MapPin,
  Sparkles,
  Download,
  Send,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'

type DealflowServiceLine = 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'
type PriorityScore = 'high' | 'medium' | 'low'
type OutreachStatus = 'not_contacted' | 'email_sent' | 'linkedin_sent' | 'called' | 'responded' | 'meeting_scheduled' | 'closed' | 'lost'

interface DealflowClinic {
  clinic: {
    name: string
    website: string | null
    location: { city: string; state: string; country: string }
    category: string
    serviceLines: string[]
    phone?: string
    email?: string
  }
  enrichedProfile?: any
  adsSnapshot: {
    isRunningAds: boolean
    platforms: Array<{ platform: string; activeCampaignCount: number }>
    estimatedSpendBand: 'low' | 'medium' | 'high'
    creativeAngles: string[]
    offers: string[]
  }
  outreachPack: {
    priorityScore: PriorityScore
    priorityReason: string
    whyNow: string
    talkingPoints: string[]
    firstEmail: { subjectLine: string; body: string }
    firstLinkedInDM: string
    callScriptOpener: string
    estimatedValue: string
    nextSteps: string[]
  }
  priorityScore: PriorityScore
  estimatedValue: string
  processedAt: string
  outreachStatus?: OutreachStatus
  lastContacted?: string
  notes?: string
}

interface DealflowBatch {
  clinics: DealflowClinic[]
  totalProcessed: number
  summary: {
    highPriority: number
    mediumPriority: number
    lowPriority: number
    withAds: number
    withoutAds: number
    estimatedTotalValue: string
  }
  region: string
  serviceLine?: string
  processedAt: string
}

const HIGH_DEMAND_REGIONS = [
  { region: 'Texas', serviceLine: 'TRT', label: 'TRT in Texas' },
  { region: 'Florida', serviceLine: 'TRT', label: 'TRT in Florida' },
  { region: 'California', serviceLine: 'WEIGHT_LOSS', label: 'GLP-1 in California' },
  { region: 'Texas', serviceLine: 'WEIGHT_LOSS', label: 'GLP-1 in Texas' },
  { region: 'Florida', serviceLine: 'WEIGHT_LOSS', label: 'GLP-1 in Florida' },
  { region: 'Arizona', serviceLine: 'IV_THERAPY', label: 'IV Therapy in Arizona' },
]

export default function DealflowConsole() {
  const [region, setRegion] = useState('Texas')
  const [serviceLine, setServiceLine] = useState<DealflowServiceLine>('TRT')
  const [maxClinics, setMaxClinics] = useState(20)
  const [loading, setLoading] = useState(false)
  const [dealflowBatch, setDealflowBatch] = useState<DealflowBatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedClinic, setSelectedClinic] = useState<DealflowClinic | null>(null)
  const [outreachStatuses, setOutreachStatuses] = useState<Record<string, OutreachStatus>>({})

  // Load saved outreach statuses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dealflow_outreach_statuses')
    if (saved) {
      setOutreachStatuses(JSON.parse(saved))
    }
  }, [])

  // Save outreach statuses to localStorage
  const updateOutreachStatus = (clinicName: string, status: OutreachStatus) => {
    const updated = { ...outreachStatuses, [clinicName]: status }
    setOutreachStatuses(updated)
    localStorage.setItem('dealflow_outreach_statuses', JSON.stringify(updated))
    
    // Update last contacted timestamp
    if (status !== 'not_contacted') {
      const clinics = dealflowBatch?.clinics || []
      const clinic = clinics.find(c => c.clinic.name === clinicName)
      if (clinic) {
        clinic.lastContacted = new Date().toISOString()
      }
    }
  }

  const handleRunBatch = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/mcp/dealflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'export_dealflow_batch',
          params: {
            region,
            serviceLine,
            maxClinics,
            includeEnrichment: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to run dealflow batch')
      }

      const data = await response.json()
      setDealflowBatch(data.results)
    } catch (error) {
      console.error('Dealflow batch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStart = (region: string, serviceLine: DealflowServiceLine) => {
    setRegion(region)
    setServiceLine(serviceLine)
    handleRunBatch()
  }

  const getStatusColor = (status?: OutreachStatus) => {
    switch (status) {
      case 'closed':
        return 'bg-status-live/10 text-status-live border-status-live/30'
      case 'meeting_scheduled':
        return 'bg-primary/10 text-primary border-primary/30'
      case 'responded':
        return 'bg-status-degraded/10 text-status-degraded border-status-degraded/30'
      case 'email_sent':
      case 'linkedin_sent':
      case 'called':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default:
        return 'bg-dark-accent text-gray-500 border-dark-border'
    }
  }

  const getStatusLabel = (status?: OutreachStatus) => {
    switch (status) {
      case 'closed':
        return 'Closed'
      case 'meeting_scheduled':
        return 'Meeting Scheduled'
      case 'responded':
        return 'Responded'
      case 'email_sent':
        return 'Email Sent'
      case 'linkedin_sent':
        return 'LinkedIn Sent'
      case 'called':
        return 'Called'
      case 'lost':
        return 'Lost'
      default:
        return 'Not Contacted'
    }
  }

  const stats = dealflowBatch
    ? {
        total: dealflowBatch.totalProcessed,
        high: dealflowBatch.summary.highPriority,
        medium: dealflowBatch.summary.mediumPriority,
        low: dealflowBatch.summary.lowPriority,
        withAds: dealflowBatch.summary.withAds,
        contacted: Object.keys(outreachStatuses).filter(
          k => outreachStatuses[k] !== 'not_contacted'
        ).length,
        responded: Object.values(outreachStatuses).filter(s => s === 'responded' || s === 'meeting_scheduled').length,
        closed: Object.values(outreachStatuses).filter(s => s === 'closed').length,
      }
    : null

  return (
    <div className="w-full bg-dark-bg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8" />
              Dealflow Console
            </h1>
            <p className="text-gray-400 mt-2">
              Turn MCP intelligence into paying clients. Every day: targets + scripts → sales.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Quick Start - High Demand Regions */}
      {!dealflowBatch && (
        <div className="mb-8 bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Start: High Demand Regions
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Start with these high-opportunity regions. Each will generate 20-50 clinics with ready outreach scripts.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HIGH_DEMAND_REGIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickStart(item.region, item.serviceLine as DealflowServiceLine)}
                disabled={loading}
                className="p-4 bg-dark-accent border border-dark-border rounded-lg hover:border-primary transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-white">{item.label}</span>
                </div>
                <p className="text-xs text-gray-400">High demand • Ready to export</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Batch Configuration */}
      {!dealflowBatch && (
        <div className="mb-8 bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Custom Batch Export</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Texas, Florida, California..."
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service Line</label>
              <select
                value={serviceLine}
                onChange={(e) => setServiceLine(e.target.value as DealflowServiceLine)}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="TRT">TRT</option>
                <option value="WEIGHT_LOSS">Weight Loss / GLP-1</option>
                <option value="IV_THERAPY">IV Therapy</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Clinics</label>
              <input
                type="number"
                value={maxClinics}
                onChange={(e) => setMaxClinics(parseInt(e.target.value) || 20)}
                min={5}
                max={50}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={handleRunBatch}
            disabled={loading || !region}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting Dealflow...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Dealflow Batch
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
          <p className="text-sm text-status-offline">{error}</p>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">Total Clinics</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-status-live">{stats.high}</div>
            <div className="text-xs text-gray-400 mt-1">High Priority</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-status-degraded">{stats.medium}</div>
            <div className="text-xs text-gray-400 mt-1">Medium</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.low}</div>
            <div className="text-xs text-gray-400 mt-1">Low</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{stats.withAds}</div>
            <div className="text-xs text-gray-400 mt-1">Running Ads</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.contacted}</div>
            <div className="text-xs text-gray-400 mt-1">Contacted</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="text-2xl font-bold text-status-degraded">{stats.responded}</div>
            <div className="text-xs text-gray-400 mt-1">Responded</div>
          </div>
          <div className="bg-dark-surface border border-status-live/30 rounded-lg p-4 border-2">
            <div className="text-2xl font-bold text-status-live">{stats.closed}</div>
            <div className="text-xs text-gray-400 mt-1">Closed</div>
          </div>
        </div>
      )}

      {/* Dealflow Summary */}
      {dealflowBatch && (
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Dealflow Export Complete</h2>
              <p className="text-sm text-gray-300">
                {dealflowBatch.region} • {dealflowBatch.serviceLine || 'All Services'} • {dealflowBatch.totalProcessed} clinics processed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{dealflowBatch.summary.estimatedTotalValue}</div>
              <div className="text-xs text-gray-400">Estimated Annual Value</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-400">High Priority:</span>{' '}
              <span className="text-white font-semibold">{dealflowBatch.summary.highPriority}</span>
            </div>
            <div>
              <span className="text-gray-400">With Ads:</span>{' '}
              <span className="text-white font-semibold">{dealflowBatch.summary.withAds}</span>
            </div>
            <div>
              <span className="text-gray-400">Medium:</span>{' '}
              <span className="text-white font-semibold">{dealflowBatch.summary.mediumPriority}</span>
            </div>
            <div>
              <span className="text-gray-400">Low:</span>{' '}
              <span className="text-white font-semibold">{dealflowBatch.summary.lowPriority}</span>
            </div>
            <div>
              <span className="text-gray-400">No Ads:</span>{' '}
              <span className="text-white font-semibold">{dealflowBatch.summary.withoutAds}</span>
            </div>
          </div>
        </div>
      )}

      {/* Clinics Table */}
      {dealflowBatch && (
        <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-dark-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Ranked Clinics (by Money Potential)</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Goal: Close 1-2 clinics before December</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-accent border-b border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Clinic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Ads Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {dealflowBatch.clinics.map((clinic, idx) => {
                  const status = outreachStatuses[clinic.clinic.name] || 'not_contacted'
                  return (
                    <tr
                      key={idx}
                      className={clsx(
                        'hover:bg-dark-hover transition-colors',
                        selectedClinic?.clinic.name === clinic.clinic.name && 'bg-primary/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-medium',
                            clinic.priorityScore === 'high' && 'bg-status-live/10 text-status-live',
                            clinic.priorityScore === 'medium' && 'bg-status-degraded/10 text-status-degraded',
                            clinic.priorityScore === 'low' && 'bg-gray-500/10 text-gray-400'
                          )}
                        >
                          {clinic.priorityScore.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{clinic.clinic.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {clinic.clinic.serviceLines.join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {clinic.clinic.location.city}, {clinic.clinic.location.state}
                      </td>
                      <td className="px-4 py-3">
                        {clinic.adsSnapshot.isRunningAds ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-status-live">Running Ads</span>
                            <span className="text-xs text-gray-400">
                              {clinic.adsSnapshot.platforms.map(p => p.platform).join(', ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {clinic.adsSnapshot.estimatedSpendBand} spend
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No ads detected</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <DollarSign className="w-4 h-4" />
                          {clinic.estimatedValue}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-medium border',
                            getStatusColor(status)
                          )}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedClinic(clinic)}
                          className="text-xs text-primary hover:underline"
                        >
                          View Pack →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Outreach Pack Panel */}
      {selectedClinic && (
        <div className="mt-8 bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">{selectedClinic.clinic.name}</h2>
              <p className="text-sm text-gray-400">
                {selectedClinic.clinic.location.city}, {selectedClinic.clinic.location.state} •{' '}
                {selectedClinic.priorityScore.toUpperCase()} Priority • {selectedClinic.estimatedValue}
              </p>
            </div>
            <button
              onClick={() => setSelectedClinic(null)}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Priority & Why Now */}
          <div className="mb-6 space-y-4">
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                Priority Assessment
              </h3>
              <p className="text-sm text-white mb-2">{selectedClinic.outreachPack.priorityReason}</p>
              <p className="text-sm text-gray-300">{selectedClinic.outreachPack.whyNow}</p>
            </div>

            {/* Talking Points */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                Talking Points
              </h3>
              <ul className="space-y-2">
                {selectedClinic.outreachPack.talkingPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Outreach Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Email */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">First Email</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedClinic.outreachPack.firstEmail.body)
                    updateOutreachStatus(selectedClinic.clinic.name, 'email_sent')
                  }}
                  className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-colors"
                >
                  Copy & Mark Sent
                </button>
              </div>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Subject
                </label>
                <div className="p-2 bg-dark-surface border border-dark-border rounded text-sm text-white font-medium">
                  {selectedClinic.outreachPack.firstEmail.subjectLine}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Body
                </label>
                <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                  {selectedClinic.outreachPack.firstEmail.body}
                </div>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">LinkedIn DM</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedClinic.outreachPack.firstLinkedInDM)
                    updateOutreachStatus(selectedClinic.clinic.name, 'linkedin_sent')
                  }}
                  className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-colors"
                >
                  Copy & Mark Sent
                </button>
              </div>
              <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans">
                {selectedClinic.outreachPack.firstLinkedInDM}
              </div>
            </div>

            {/* Call Script */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">Call Script</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedClinic.outreachPack.callScriptOpener)
                    updateOutreachStatus(selectedClinic.clinic.name, 'called')
                  }}
                  className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-colors"
                >
                  Copy & Mark Called
                </button>
              </div>
              <div className="p-3 bg-dark-surface border border-dark-border rounded text-sm text-gray-300 whitespace-pre-wrap font-sans">
                {selectedClinic.outreachPack.callScriptOpener}
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="border-t border-dark-border pt-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateOutreachStatus(selectedClinic.clinic.name, 'responded')}
                className="px-3 py-1.5 bg-status-degraded/10 border border-status-degraded/30 rounded-lg text-xs text-status-degraded hover:bg-status-degraded/20 transition-colors"
              >
                Mark Responded
              </button>
              <button
                onClick={() => updateOutreachStatus(selectedClinic.clinic.name, 'meeting_scheduled')}
                className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary hover:bg-primary/20 transition-colors"
              >
                Meeting Scheduled
              </button>
              <button
                onClick={() => updateOutreachStatus(selectedClinic.clinic.name, 'closed')}
                className="px-3 py-1.5 bg-status-live/10 border border-status-live/30 rounded-lg text-xs text-status-live hover:bg-status-live/20 transition-colors"
              >
                Closed Deal
              </button>
              <button
                onClick={() => updateOutreachStatus(selectedClinic.clinic.name, 'lost')}
                className="px-3 py-1.5 bg-status-offline/10 border border-status-offline/30 rounded-lg text-xs text-status-offline hover:bg-status-offline/20 transition-colors"
              >
                Lost
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-6 border-t border-dark-border pt-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Recommended Next Steps
            </h3>
            <ol className="space-y-2">
              {selectedClinic.outreachPack.nextSteps.map((step, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Daily Action Plan */}
      {dealflowBatch && (
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Daily Action Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">Email Outreach</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Send 5-10 emails per day using the ready-to-send scripts above.
              </p>
              <p className="text-xs text-gray-400">
                Focus on HIGH priority clinics first. Track status as you send.
              </p>
            </div>
            <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">LinkedIn Outreach</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Send 2-3 LinkedIn DMs per day. Personalize slightly if possible.
              </p>
              <p className="text-xs text-gray-400">
                Connect with decision-makers first, then send DM.
              </p>
            </div>
            <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">Warm Calls</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Make 1-2 warm calls per day using the call script opener.
              </p>
              <p className="text-xs text-gray-400">
                Best for clinics that have responded or shown interest.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <h3 className="text-sm font-semibold text-white mb-2">Your Offer</h3>
            <p className="text-sm text-gray-300 mb-2">
              "We help {serviceLine === 'TRT' ? 'TRT' : serviceLine === 'WEIGHT_LOSS' ? 'GLP-1' : 'men\'s health'} clinics double qualified patient volume using data-driven routing + intelligence."
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-primary">
                Free audit
              </span>
              <span className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-primary">
                14-day pilot
              </span>
              <span className="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-primary">
                $500-1,500/mo starter
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <h3 className="text-sm font-semibold text-white mb-2">Goal: Close 1-2 Clinics Before December</h3>
            <p className="text-sm text-gray-300">
              One at $1K/mo validates the product. Two at $750-1K/mo creates instant revenue momentum.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


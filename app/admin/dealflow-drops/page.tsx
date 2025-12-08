'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Zap,
  MapPin,
  Clock,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Rocket,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'

interface HotClinic {
  name: string
  region: string
  category: string
  priorityScore: number
  whyHot: string
  outreachPack: {
    email: {
      subjectLine: string
      body: string
    }
    linkedInDM: string
    callOpener: string
  }
  revenuePotential: 'high' | 'medium' | 'low'
  funnelWeaknesses: string[]
  source?: 'Batch' | 'Trends' | 'Predictive'
}

interface MarketMove {
  region: string
  serviceLine: string
  moveType: 'deploy_ads' | 'increase_budget' | 'target_clinics' | 'prepare_supply'
  urgency: 'critical' | 'high' | 'medium'
  reasoning: string
  suggestedAction: string
  opportunityScore: number
}

interface PredictiveAlert {
  clinicName?: string
  region: string
  serviceLine: string
  predictiveScore: number
  timeframe: string
  predictedShortage: {
    type: 'patient_volume' | 'capacity_gap' | 'demand_spike'
    severity: 'critical' | 'high' | 'medium'
  }
  recommendation: string
  label?: 'immediate_opportunity' | 'emerging' | 'watch_list'
}

interface TemperatureLogEntry {
  timestamp: string
  note: string
  type: '6h' | '1h'
}

interface DailySnapshot {
  date: string
  timestamp: string
  hotClinics: HotClinic[]
  marketMoves: MarketMove[]
  predictiveAlerts: PredictiveAlert[]
  actionPlan: {
    immediateActions: string[]
    strategicMoves: string[]
    competitivePlays: string[]
    supplyPrep: string[]
  }
  executiveSummary?: {
    totalOpportunities: number
    criticalActions: number
    estimatedRevenuePotential: string
    confidenceLevel: 'high' | 'medium' | 'low'
  }
}

export default function DealflowDropsPage() {
  const [loading, setLoading] = useState(true)
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLogEntry[]>([])

  const loadSnapshot = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get latest snapshot from scheduler
      const snapshotResponse = await fetch('/api/admin/dealflow/scheduler?type=snapshot')
      if (snapshotResponse.ok) {
        const data = await snapshotResponse.json()
        if (data.snapshot) {
          setSnapshot({
            date: data.snapshot.date || new Date().toISOString().split('T')[0],
            timestamp: data.snapshot.timestamp || data.snapshot.date || new Date().toISOString(),
            hotClinics: data.snapshot.hotClinics || [],
            marketMoves: data.snapshot.marketMoves || [],
            predictiveAlerts: data.snapshot.predictiveAlerts || [],
            actionPlan: data.snapshot.actionPlan || {
              immediateActions: [],
              strategicMoves: [],
              competitivePlays: [],
              supplyPrep: [],
            },
            executiveSummary: data.snapshot.executiveSummary,
          })
        }
      }

      // Load temperature logs
      const tempResponse = await fetch('/api/admin/dealflow/scheduler?type=temperature')
      if (tempResponse.ok) {
        const tempData = await tempResponse.json()
        if (tempData.logs) {
          setTemperatureLogs(
            tempData.logs
              .slice(-10) // Last 10 entries
              .map((log: any) => ({
                timestamp: log.timestamp || log.time,
                note: log.note || log.summaryNote || 'Market update',
                type: log.type || '6h',
              }))
          )
        }
      }
    } catch (err) {
      console.error('Error loading snapshot:', err)
      setError(err instanceof Error ? err.message : 'Failed to load daily snapshot')
    } finally {
      setLoading(false)
    }
  }

  const handleRerunSnapshot = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/dealflow/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger',
          scheduleType: 'daily',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to re-run snapshot')
      }

      // Wait a moment for processing, then reload
      setTimeout(() => {
        loadSnapshot()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-run snapshot')
    } finally {
      setRefreshing(false)
    }
  }

  const handleGenerateAlternatePlan = async () => {
    setRegenerating(true)
    setError(null)

    try {
      // Call MCP to regenerate action plan with same snapshot data
      const response = await fetch('/api/admin/mcp/dealflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_daily_dealflow_snapshot',
          params: {
            regenerateActionPlan: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate alternate action plan')
      }

      const data = await response.json()
      if (data.results?.actionPlan && snapshot) {
        setSnapshot({
          ...snapshot,
          actionPlan: data.results.actionPlan,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate alternate plan')
    } finally {
      setRegenerating(false)
    }
  }

  useEffect(() => {
    loadSnapshot()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading daily dealflow intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !snapshot) {
    return (
      <div className="min-h-screen bg-dark-bg p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-dark-surface border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-white">Error Loading Dealflow Drop</h2>
            </div>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadSnapshot}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!snapshot) {
    return null
  }

  // Build narrative summary
  const getNarrativeSummary = () => {
    const topRegions = [...new Set(snapshot.hotClinics.map(c => c.region))].slice(0, 3)
    const topServiceLines = [...new Set(snapshot.hotClinics.map(c => c.category))].slice(0, 2)
    const highPriorityCount = snapshot.hotClinics.filter(c => c.priorityScore >= 75).length
    
    return `${topRegions.join(' and ')} ${topServiceLines.join(' and ')} are today's biggest opportunities. ${highPriorityCount} high-potential clinics surfaced. ${snapshot.predictiveAlerts.length > 0 ? `Watch ${snapshot.predictiveAlerts[0]?.serviceLine || 'demand'} in ${snapshot.predictiveAlerts[0]?.region || 'key regions'} over the next ${snapshot.predictiveAlerts[0]?.timeframe || '2 weeks'}.` : 'Monitor emerging regions for new opportunities.'}`
  }

  const getPriorityLabel = (score: number): 'H' | 'M' | 'L' => {
    if (score >= 75) return 'H'
    if (score >= 50) return 'M'
    return 'L'
  }

  const getLabelColor = (label?: string) => {
    switch (label) {
      case 'immediate_opportunity':
        return 'bg-status-live/10 text-status-live border-status-live/30'
      case 'emerging':
        return 'bg-primary/10 text-primary border-primary/30'
      case 'watch_list':
        return 'bg-status-degraded/10 text-status-degraded border-status-degraded/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getLabelText = (label?: string) => {
    switch (label) {
      case 'immediate_opportunity':
        return 'Immediate'
      case 'emerging':
        return 'Emerging'
      case 'watch_list':
        return 'Watch List'
      default:
        return 'Monitor'
    }
  }

  // Combine all action plan items
  const allActionItems = [
    ...snapshot.actionPlan.immediateActions,
    ...snapshot.actionPlan.strategicMoves,
    ...snapshot.actionPlan.competitivePlays,
    ...snapshot.actionPlan.supplyPrep,
  ]

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              Daily Dealflow Drops
            </h1>
            <p className="text-gray-400 text-lg mb-3">
              Daily leads + Market trends + Predictive demand = Today's moves.
            </p>
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded border border-primary/30 font-medium">
              Generated by Novalyte Admin Dealflow Brain
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRerunSnapshot}
              disabled={refreshing}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
              {refreshing ? 'Re-running...' : "Re-run Today's Brain Snapshot"}
            </button>
            <button
              onClick={handleGenerateAlternatePlan}
              disabled={regenerating}
              className="px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Zap className={clsx('w-4 h-4', regenerating && 'animate-spin')} />
              {regenerating ? 'Generating...' : 'Generate Alternate Action Plan'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-4">
            <p className="text-sm text-status-offline">{error}</p>
          </div>
        )}

        {/* A) Today's Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Today's Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-dark-surface/80 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-gray-400 mb-1">Date</div>
              <div className="text-lg font-semibold text-white">
                {new Date(snapshot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="bg-dark-surface/80 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-gray-400 mb-1">Hot Clinics</div>
              <div className="text-2xl font-bold text-primary">{snapshot.hotClinics.length}</div>
            </div>
            <div className="bg-dark-surface/80 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-gray-400 mb-1">Market Moves</div>
              <div className="text-2xl font-bold text-primary">{snapshot.marketMoves.length}</div>
            </div>
            <div className="bg-dark-surface/80 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-gray-400 mb-1">Predictive Alerts</div>
              <div className="text-2xl font-bold text-primary">{snapshot.predictiveAlerts.length}</div>
            </div>
          </div>
          <div className="bg-dark-surface/80 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-gray-300 leading-relaxed">{getNarrativeSummary()}</p>
          </div>
        </div>

        {/* B) Hot Clinics To Act On */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Hot Clinics To Act On
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-accent border-b border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Clinic Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Service Line</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {snapshot.hotClinics.map((clinic, idx) => (
                  <tr key={idx} className="hover:bg-dark-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{clinic.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{clinic.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{clinic.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getPriorityLabel(clinic.priorityScore) === 'H' && 'bg-status-live/10 text-status-live',
                          getPriorityLabel(clinic.priorityScore) === 'M' && 'bg-status-degraded/10 text-status-degraded',
                          getPriorityLabel(clinic.priorityScore) === 'L' && 'bg-gray-500/10 text-gray-400'
                        )}
                      >
                        {getPriorityLabel(clinic.priorityScore)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{clinic.source || 'Batch'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/dealflow?clinic=${encodeURIComponent(clinic.name)}&region=${encodeURIComponent(clinic.region)}`}
                        className="px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/30 transition-colors inline-flex items-center gap-1"
                      >
                        Open Outreach Pack <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* C) Market & Predictive Moves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Market Moves (Today) */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Market Moves (Today)
            </h2>
            <div className="space-y-3">
              {snapshot.marketMoves.length > 0 ? (
                snapshot.marketMoves.map((move, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white mb-1">
                          {move.region} • {move.serviceLine}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          {move.moveType === 'deploy_ads' ? 'Deploy' :
                           move.moveType === 'increase_budget' ? 'Increase Budget' :
                           move.moveType === 'target_clinics' ? 'Target Clinics' :
                           'Prepare Supply'}
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          move.urgency === 'critical' && 'bg-status-live/10 text-status-live',
                          move.urgency === 'high' && 'bg-primary/10 text-primary',
                          move.urgency === 'medium' && 'bg-status-degraded/10 text-status-degraded'
                        )}
                      >
                        {move.urgency.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{move.suggestedAction}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No market moves identified</div>
              )}
            </div>
          </div>

          {/* Right: Predictive Alerts (7-30d) */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-primary" />
              Predictive Alerts (7–30d)
            </h2>
            <div className="space-y-3">
              {snapshot.predictiveAlerts.length > 0 ? (
                snapshot.predictiveAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white mb-1">
                          {alert.clinicName || alert.region} • {alert.serviceLine}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">Horizon: {alert.timeframe}</div>
                      </div>
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getLabelColor(alert.label))}>
                        {getLabelText(alert.label)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{alert.recommendation}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No predictive alerts</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Plan For Today */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Action Plan For Today
          </h2>
          <div className="bg-dark-surface/80 rounded-lg p-6 border border-primary/20 mb-4">
            <ol className="space-y-3">
              {allActionItems.length > 0 ? (
                allActionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-primary font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">No action items available</li>
              )}
            </ol>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dealflow"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Open these clinics in Dealflow Console <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/admin/market-intelligence"
              className="px-4 py-2 bg-dark-surface border border-dark-border text-gray-300 rounded-lg hover:bg-dark-hover transition-colors flex items-center gap-2"
            >
              Open related intel in Market Intelligence <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Temperature Log (6H + 1H) */}
        {temperatureLogs.length > 0 && (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Trend Updates (Last 24h)
            </h2>
            <div className="space-y-2">
              {temperatureLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-dark-accent border border-dark-border rounded-lg p-3"
                >
                  <div className="flex-shrink-0">
                    <div className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{log.type}</div>
                  </div>
                  <p className="text-sm text-gray-300 flex-1">{log.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

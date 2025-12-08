'use client'

import { LeadAIReasoning } from '@/lib/types/leads'
import { clsx } from 'clsx'
import { Loader, AlertTriangle, X, TrendingUp, TrendingDown, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface LeadAIReasoningModalProps {
  open: boolean
  onClose: () => void
  leadId: string | null
  loading: boolean
  reasoning: LeadAIReasoning | null
  error: string | null
}

const Badge = ({ text, type }: { text: string; type: 'positive' | 'negative' }) => (
  <div
    className={clsx(
      'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
      {
        'bg-status-live/10 text-status-live': type === 'positive',
        'bg-status-offline/10 text-status-offline': type === 'negative',
      }
    )}
  >
    {type === 'positive' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
    <span>{text}</span>
  </div>
)

export function LeadAIReasoningModal({
  open,
  onClose,
  leadId,
  loading,
  reasoning,
  error,
}: LeadAIReasoningModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm',
        'transition-opacity duration-300 ease-in-out',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-lg bg-dark-surface border border-dark-border shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-dark-border">
          <div>
            <h2 className="text-xl font-bold text-white">AI Thoughts on Conversion</h2>
            {leadId && !loading && reasoning && (
              <p className="text-sm text-gray-400 mt-1">
                Analysis for Lead: <span className="font-semibold text-primary">{leadId}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-dark-hover hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 min-h-[450px] max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <Loader className="animate-spin text-primary" size={36} />
              <p className="text-lg font-semibold">Asking Vertex AI for its thoughts...</p>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                The AI is analyzing signals, risk factors, and historical data to generate a conversion forecast. This may take a moment.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-status-offline space-y-4">
              <AlertTriangle size={36} />
              <p className="text-lg font-semibold">AI Reasoning Unavailable</p>
              <p className="text-sm text-gray-400 max-w-sm text-center">{error}</p>
            </div>
          )}

          {!loading && !error && reasoning && (
            <div className="space-y-8">
              {/* Top Row: Probability & Confidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-center">
                <div className="bg-dark-bg border border-dark-border rounded-lg p-5">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Conversion Probability</p>
                  <p className="text-3xl font-bold text-status-live">
                    {(reasoning.conversionProbability * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">within {reasoning.horizonDays} days</p>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-5">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Model Confidence</p>
                  <p className="text-3xl font-bold text-primary">
                    {(reasoning.confidence * 100).toFixed(0)}%
                  </p>
                   <p className="text-sm text-gray-500 mt-1">in this assessment</p>
                </div>
              </div>
              
              {/* Signals & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-dark-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp size={20} className="text-status-live" />
                    <h3 className="text-lg font-semibold text-white">Key Signals</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reasoning.keySignals.map((signal, i) => (
                      <Badge key={i} text={signal} type="positive" />
                    ))}
                  </div>
                </div>
                 <div className="border border-dark-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown size={20} className="text-status-offline" />
                    <h3 className="text-lg font-semibold text-white">Risk Factors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reasoning.riskFactors.map((factor, i) => (
                      <Badge key={i} text={factor} type="negative" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="border border-dark-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-3">AI Rationale</h3>
                <div className="prose prose-sm prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {reasoning.rationale}
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recommended Next Actions</h3>
                <ul className="space-y-3">
                  {reasoning.recommendedActions.map((action, i) => (
                     <li key={i} className="flex items-start gap-3 p-3 bg-dark-accent rounded-md">
                        <ArrowRight size={16} className="text-primary mt-1 flex-shrink-0"/>
                        <span className="text-sm text-gray-300">{action}</span>
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

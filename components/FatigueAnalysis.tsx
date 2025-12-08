'use client'

import { Brain, AlertCircle, TrendingDown, Users } from 'lucide-react'

interface FatigueAnalysis {
  id: string
  creativeId: string
  creativeName: string
  platform: 'google' | 'tiktok' | 'meta'
  analysis: string
  rootCause: 'psychological_burnout' | 'targeting_problem' | 'message_exhaustion' | 'platform_saturation' | 'over_exposure'
  confidence: number
  recommendations: string[]
  urgency: 'high' | 'medium' | 'low'
}

interface FatigueAnalysisProps {
  analyses: FatigueAnalysis[]
}

export default function FatigueAnalysis({ analyses }: FatigueAnalysisProps) {
  const getRootCauseLabel = (cause: string) => {
    const labels: Record<string, string> = {
      psychological_burnout: 'Psychological Burnout',
      targeting_problem: 'Targeting Problem',
      message_exhaustion: 'Message Exhaustion',
      platform_saturation: 'Platform Saturation',
      over_exposure: 'Over-Exposure',
    }
    return labels[cause] || cause
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10'
      case 'medium':
        return 'border-orange-500/30 bg-orange-500/10'
      default:
        return 'border-yellow-500/30 bg-yellow-500/10'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">Gemini AI Fatigue Analysis</h3>
      </div>
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className={`border rounded-lg p-4 ${getUrgencyColor(analysis.urgency)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-white">{analysis.creativeName}</span>
                  <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300 uppercase">
                    {analysis.platform}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    analysis.urgency === 'high' ? 'text-red-400 bg-red-500/20' :
                    analysis.urgency === 'medium' ? 'text-orange-400 bg-orange-500/20' :
                    'text-yellow-400 bg-yellow-500/20'
                  }`}>
                    {analysis.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{analysis.analysis}</p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-status-degraded" />
                    <span className="text-gray-400">Root Cause: </span>
                    <span className="text-white font-medium">{getRootCauseLabel(analysis.rootCause)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence: </span>
                    <span className="text-white font-medium">{(analysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {analysis.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


'use client'

import { Brain, Eye, Mail, FileText, AlertTriangle } from 'lucide-react'

interface ClinicInsight {
  clinic_id: string
  clinic_name: string
  insight_type: 'underperforming' | 'opportunity' | 'warning'
  message: string
  suggestedAction: string
}

interface ClinicAIInsightsProps {
  insights: ClinicInsight[]
  onViewClinic?: (clinicId: string) => void
  onContactClinic?: (clinicId: string) => void
  onGenerateReport?: (clinicId: string) => void
}

export default function ClinicAIInsights({
  insights,
  onViewClinic,
  onContactClinic,
  onGenerateReport,
}: ClinicAIInsightsProps) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'underperforming':
        return 'bg-red-500/10 border-red-500/30'
      case 'opportunity':
        return 'bg-status-live/10 border-status-live/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'bg-dark-accent border-dark-border'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'underperforming':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'opportunity':
        return <Brain className="w-4 h-4 text-status-live" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">
          AI Insights on Clinic Performance (Last 30 Days)
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getInsightColor(insight.insight_type)}`}
          >
            <div className="flex items-start gap-3 mb-2">
              {getInsightIcon(insight.insight_type)}
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">{insight.clinic_name}</p>
                <p className="text-xs text-gray-300 mb-2">{insight.message}</p>
                <p className="text-xs text-gray-400 italic">Suggested: {insight.suggestedAction}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dark-border/50">
              <button
                onClick={() => onViewClinic?.(insight.clinic_id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-xs"
              >
                <Eye className="w-3 h-3" />
                View Profile
              </button>
              <button
                onClick={() => onContactClinic?.(insight.clinic_id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-xs"
              >
                <Mail className="w-3 h-3" />
                Contact
              </button>
              <button
                onClick={() => onGenerateReport?.(insight.clinic_id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-xs"
              >
                <FileText className="w-3 h-3" />
                Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


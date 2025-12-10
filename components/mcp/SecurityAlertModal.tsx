'use client'

import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { McpSecurityAlert } from '@/lib/mcp/types'

export interface SecurityAlertModalProps {
  alert: McpSecurityAlert | null
  isOpen: boolean
  onClose: () => void
}

export default function SecurityAlertModal({
  alert,
  isOpen,
  onClose,
}: SecurityAlertModalProps) {
  if (!isOpen || !alert) return null

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'HIGH':
        return <AlertTriangle className="w-6 h-6 text-status-offline" />
      case 'MEDIUM':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'LOW':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <Info className="w-6 h-6 text-gray-400" />
    }
  }

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'HIGH':
        return 'border-status-offline/30 bg-status-offline/10'
      case 'MEDIUM':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'LOW':
        return 'border-blue-500/30 bg-blue-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRecommendedAction = (): string => {
    // Stub implementation - in production, this would come from the API
    if (alert.message.includes('API key')) {
      return 'Review API key usage patterns and consider rotating credentials if unusual activity is confirmed.'
    } else if (alert.message.includes('authentication')) {
      return 'Investigate failed authentication attempts. Consider temporarily blocking the source IP if malicious activity is detected.'
    } else if (alert.message.includes('Credential rotation')) {
      return 'Schedule credential rotation within the next 7 days to maintain security best practices.'
    }
    return 'Review the alert details and take appropriate action based on your security policies.'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            {getSeverityIcon()}
            <h2 className="text-2xl font-semibold text-white">Security Alert</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Message */}
          <div className={`p-4 rounded-lg border ${getSeverityColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {alert.severity} SEVERITY
              </span>
            </div>
            <p className="text-white">{alert.message}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Timestamp
              </label>
              <p className="text-sm text-gray-300 mt-1">
                {formatTimestamp(alert.timestamp)}
              </p>
            </div>
            {alert.relatedServerId && (
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Related Server
                </label>
                <p className="text-sm text-gray-300 mt-1">{alert.relatedServerId}</p>
              </div>
            )}
            {alert.relatedToolId && (
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Related Tool
                </label>
                <p className="text-sm text-gray-300 mt-1">{alert.relatedToolId}</p>
              </div>
            )}
          </div>

          {/* Recommended Action */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
              Recommended Action
            </label>
            <div className="p-4 bg-dark-accent border border-dark-border rounded-lg">
              <p className="text-sm text-gray-300">{getRecommendedAction()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


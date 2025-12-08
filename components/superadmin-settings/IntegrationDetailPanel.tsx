'use client'

import { useState } from 'react'
import { X, Copy, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface IntegrationConfig {
  id: string
  name: string
  status: 'Connected' | 'Warning' | 'Disconnected'
  config: Record<string, any>
}

interface IntegrationDetailPanelProps {
  integration: IntegrationConfig | null
  onClose: () => void
}

export default function IntegrationDetailPanel({
  integration,
  onClose,
}: IntegrationDetailPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!integration) return null

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'Warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Disconnected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-[600px] bg-dark-surface border-l border-dark-border shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{integration.name}</h2>
            <span
              className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                integration.status
              )}`}
            >
              {integration.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuration Details */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Configuration</h3>
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4 space-y-3">
              {Object.entries(integration.config).map(([key, value]) => {
                const isSecret = key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')
                const displayValue = isSecret && typeof value === 'string' 
                  ? value.substring(0, 4) + '•'.repeat(Math.max(0, value.length - 8)) + value.substring(value.length - 4)
                  : value

                return (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">{key}</p>
                      <code className="text-sm text-gray-300 font-mono break-all">
                        {String(displayValue)}
                      </code>
                    </div>
                    {typeof value === 'string' && (
                      <button
                        onClick={() => copyToClipboard(String(value), key)}
                        className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copiedKey === key ? (
                          <CheckCircle className="w-4 h-4 text-status-live" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-dark-border">
            <button
              onClick={() => {
                // TODO: Implement test connection
                console.log('Test connection:', integration.id)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


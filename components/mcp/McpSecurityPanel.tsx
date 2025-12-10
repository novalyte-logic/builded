'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import clsx from 'clsx'
import { McpSecurityAlert, McpSecurityMetrics } from '@/lib/mcp/types'
import SecurityAlertModal from './SecurityAlertModal'

export interface McpSecurityPanelProps {
  alerts: McpSecurityAlert[]
  metrics: McpSecurityMetrics
}

export default function McpSecurityPanel({ alerts, metrics }: McpSecurityPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<McpSecurityAlert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (alert: McpSecurityAlert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  return (
    <>
    <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-white">Security & Access</h2>
        </div>
        <p className="text-sm text-gray-400">
          Credential scopes, key status, and recent security alerts.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Keys Active</div>
          <div className="text-2xl font-bold text-white">{metrics.keysActive}</div>
        </div>
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Keys Expiring (7d)</div>
          <div className="text-2xl font-bold text-yellow-400">{metrics.keysExpiring7d}</div>
        </div>
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Scopes in Use</div>
          <div className="text-2xl font-bold text-white">{metrics.scopesInUse}</div>
        </div>
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Blocked Tools</div>
          <div className="text-2xl font-bold text-red-400">{metrics.blockedTools}</div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Security Alerts</h3>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No security alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-dark-accent border border-dark-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      alert.severity === 'HIGH' && 'bg-red-400',
                      alert.severity === 'MEDIUM' && 'bg-yellow-400',
                      alert.severity === 'LOW' && 'bg-blue-400'
                    )}
                  />
                  <div>
                    <div className="text-sm text-white">{alert.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(alert)}
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <SecurityAlertModal
      alert={selectedAlert}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false)
        setSelectedAlert(null)
      }}
    />
    </>
  )
}


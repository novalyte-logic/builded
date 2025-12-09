'use client'

import { Cloud, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import { McpIntegrationStatus } from '@/lib/mcp/types'

export interface McpIntegrationsGridProps {
  integrations: McpIntegrationStatus[]
}

export default function McpIntegrationsGrid({
  integrations,
}: McpIntegrationsGridProps) {
  const statusMap = {
    LIVE: 'live' as const,
    DEGRADED: 'degraded' as const,
    OFFLINE: 'offline' as const,
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-white">External Integrations</h2>
        </div>
        <p className="text-sm text-gray-400">
          Status and quota usage for key upstream services.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
              <StatusBadge status={statusMap[integration.status]} />
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Requests (24h)</span>
                <span className="text-white font-medium">
                  {integration.requests24h.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quota Used</span>
                <span className="text-white font-medium">{integration.quotaUsedPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Provider</span>
                <span className="text-gray-300">{integration.provider}</span>
              </div>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2 mb-4">
              <div
                className={clsx(
                  'h-2 rounded-full',
                  integration.quotaUsedPercent < 50 && 'bg-status-live',
                  integration.quotaUsedPercent >= 50 &&
                    integration.quotaUsedPercent < 80 &&
                    'bg-yellow-400',
                  integration.quotaUsedPercent >= 80 && 'bg-red-400'
                )}
                style={{ width: `${integration.quotaUsedPercent}%` }}
              />
            </div>
            <button className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View in Provider
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


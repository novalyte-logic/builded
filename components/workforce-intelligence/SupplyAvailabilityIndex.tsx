'use client'

import { Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface SupplyData {
  role: string
  availableCount: number
  locationClusters: string[]
  underutilizedCount: number
  availabilityScore: number
  lastActiveDaysAgo: number
}

interface SupplyAvailabilityIndexProps {
  data: {
    roles: SupplyData[]
    totalAvailable: number
    totalUnderutilized: number
  } | null
}

export default function SupplyAvailabilityIndex({ data }: SupplyAvailabilityIndexProps) {
  if (!data || !data.roles) {
    return (
      <div className="text-center py-12 text-gray-400">
        No supply data available
      </div>
    )
  }

  const sortedRoles = [...data.roles].sort((a, b) => b.availableCount - a.availableCount)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-400">Total Available</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(data.totalAvailable)}</div>
          <div className="text-xs text-gray-400 mt-1">Practitioners</div>
        </div>

        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Underutilized</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(data.totalUnderutilized)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Not booked (30d)</div>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="space-y-3">
        {sortedRoles.map((role) => (
          <div
            key={role.role}
            className="bg-dark-accent border border-dark-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{role.role}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Available: {formatNumber(role.availableCount)}</span>
                  {role.underutilizedCount > 0 && (
                    <span className="text-yellow-400">
                      Underutilized: {formatNumber(role.underutilizedCount)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Availability Score</div>
                <div
                  className={`text-lg font-bold ${
                    role.availabilityScore >= 70
                      ? 'text-green-400'
                      : role.availabilityScore >= 40
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {role.availabilityScore}
                </div>
              </div>
            </div>

            {/* Location Clusters */}
            {role.locationClusters.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Top Location Clusters:</div>
                <div className="flex flex-wrap gap-1">
                  {role.locationClusters.slice(0, 4).map((cluster, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-300"
                    >
                      {cluster}
                    </span>
                  ))}
                  {role.locationClusters.length > 4 && (
                    <span className="text-xs px-2 py-0.5 text-gray-400">
                      +{role.locationClusters.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Availability Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Availability</span>
                <span className="text-xs text-gray-400">
                  Last active: {role.lastActiveDaysAgo}d ago
                </span>
              </div>
              <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${role.availabilityScore}%`,
                    backgroundColor:
                      role.availabilityScore >= 70
                        ? '#10b981'
                        : role.availabilityScore >= 40
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                />
              </div>
            </div>

            {/* Status Indicator */}
            {role.underutilizedCount > 0 && (
              <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">
                  {role.underutilizedCount} practitioners not booked in last 30 days
                </span>
              </div>
            )}
            {role.underutilizedCount === 0 && role.availabilityScore >= 70 && (
              <div className="mt-3 pt-3 border-t border-dark-border flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Optimal utilization</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


'use client'

import { AlertTriangle, TrendingUp, Users, Bell } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface Alert {
  id: string
  type: 'demand_spike' | 'high_value_opportunity' | 'idle_practitioners'
  severity: 'critical' | 'high' | 'medium'
  title: string
  message: string
  timestamp: string
  actionable: boolean
  actionItems?: string[]
}

interface AlertsPanelProps {
  alerts: Alert[]
  loading?: boolean
}

export default function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-white">Alerts & Notifications</h2>
        </div>
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-white">Alerts & Notifications</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active alerts</p>
          <p className="text-xs mt-1">All systems operating normally</p>
        </div>
      </div>
    )
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'demand_spike':
        return <TrendingUp className="w-5 h-5" />
      case 'high_value_opportunity':
        return <AlertTriangle className="w-5 h-5" />
      case 'idle_practitioners':
        return <Users className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10'
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10'
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Group alerts by severity
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical')
  const highAlerts = alerts.filter((a) => a.severity === 'high')
  const mediumAlerts = alerts.filter((a) => a.severity === 'medium')

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-white">Alerts & Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
              {criticalAlerts.length} Critical
            </span>
          )}
          <span className="text-xs text-gray-400">
            {alerts.length} total alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Critical Alerts */}
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-5 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-red-400 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">{alert.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{alert.message}</p>
                {alert.actionItems && alert.actionItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dark-border">
                    <div className="text-xs font-medium text-gray-400 mb-2">Recommended Actions:</div>
                    <ul className="space-y-1">
                      {alert.actionItems.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* High Alerts */}
        {highAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-orange-400 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white text-sm">{alert.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{alert.message}</p>
                {alert.actionItems && alert.actionItems.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Actions: {alert.actionItems.join(', ')}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Medium Alerts */}
        {mediumAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-2">
              <div className="text-yellow-400 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white text-sm">{alert.title}</h3>
                </div>
                <p className="text-xs text-gray-300">{alert.message}</p>
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Summary */}
      <div className="mt-6 pt-4 border-t border-dark-border text-xs text-gray-400">
        <p>
          Alerts are generated automatically based on demand patterns, opportunity scores, and
          practitioner utilization. Critical alerts are sent to superadmin email.
        </p>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { Clock, User, Download, AlertTriangle, MapPin, Shield } from 'lucide-react'

export type EventSeverity = 'Info' | 'Warning' | 'Critical'
export type EventType = 'login' | 'export' | 'failed_login' | 'suspicious_ip' | 'data_access' | 'policy_violation'

export interface SecurityEvent {
  id: string
  timestamp: Date
  type: EventType
  severity: EventSeverity
  title: string
  description: string
  user?: string
  ipAddress?: string
  location?: string
  component?: 'Patient' | 'Clinic' | 'Vendor'
  details?: Record<string, any>
}

interface ActivityTimelineProps {
  events: SecurityEvent[]
  onEventClick: (event: SecurityEvent) => void
  timeRange: '24h' | '7d' | '30d'
  eventTypeFilter?: string
  componentFilter?: string
}

export default function ActivityTimeline({
  events,
  onEventClick,
  timeRange,
  eventTypeFilter,
  componentFilter,
}: ActivityTimelineProps) {
  const getSeverityColor = (severity: EventSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4" />
      case 'export':
        return <Download className="w-4 h-4" />
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4" />
      case 'suspicious_ip':
        return <MapPin className="w-4 h-4" />
      case 'data_access':
        return <Shield className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Filter events
  let filteredEvents = events
  if (eventTypeFilter) {
    filteredEvents = filteredEvents.filter((e) => e.type === eventTypeFilter)
  }
  if (componentFilter) {
    filteredEvents = filteredEvents.filter((e) => e.component === componentFilter)
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-1">Activity Timeline</h3>
        <p className="text-xs text-gray-400">Recent security and access events</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No events found matching your filters</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-pointer hover:bg-dark-hover transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(event.timestamp)}</span>
                    </div>
                    {event.user && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{event.user}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.component && (
                      <span className="px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-300">
                        {event.component}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


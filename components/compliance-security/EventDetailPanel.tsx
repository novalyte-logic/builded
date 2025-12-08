'use client'

import { X, Clock, User, MapPin, Shield, FileText, AlertTriangle } from 'lucide-react'
import type { SecurityEvent } from './ActivityTimeline'

interface EventDetailPanelProps {
  event: SecurityEvent | null
  onClose: () => void
}

export default function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  if (!event) return null

  const getSeverityColor = (severity: string) => {
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

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-[600px] bg-dark-surface border-l border-dark-border shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Event Details</h2>
            <p className="text-sm text-gray-400 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Severity Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Severity</span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full border ${getSeverityColor(
                event.severity
              )}`}
            >
              {event.severity}
            </span>
          </div>

          {/* Event Information */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 mb-1">Timestamp</p>
                <p className="text-sm text-white">
                  {event.timestamp.toLocaleString()}
                </p>
              </div>
            </div>

            {event.user && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">User</p>
                  <p className="text-sm text-white">{event.user}</p>
                </div>
              </div>
            )}

            {event.ipAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">IP Address</p>
                  <p className="text-sm text-white">{event.ipAddress}</p>
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-1">{event.location}</p>
                  )}
                </div>
              </div>
            )}

            {event.component && (
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Component</p>
                  <p className="text-sm text-white">{event.component} Data</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {/* Additional Details */}
          {event.details && Object.keys(event.details).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Additional Details</h3>
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-dark-border">
            <p className="text-xs text-gray-400 mb-3">This is a read-only view for audit purposes.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // TODO: Implement export event
                  console.log('Export event:', event.id)
                }}
                className="flex-1 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
              >
                Export Event
              </button>
              <button
                onClick={() => {
                  // TODO: Implement flag for review
                  console.log('Flag event for review:', event.id)
                }}
                className="flex-1 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
              >
                Flag for Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


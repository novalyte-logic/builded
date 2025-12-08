'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, ChevronDown, ChevronRight, Clock } from 'lucide-react'

export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical'
export type LogComponent =
  | 'Patient App'
  | 'Admin Dashboard'
  | 'Marketplace'
  | 'AI Triage'
  | 'Stripe'
  | 'BigQuery'
  | 'Vertex'
  | 'EMRs'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  component: LogComponent
  message: string
  fullMessage?: string
  stackTrace?: string
  userId?: string
  clinicId?: string
  correlationId?: string
  traceId?: string
  requestId?: string
  metadata?: Record<string, any>
}

interface LogStreamProps {
  logs: LogEntry[]
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function LogStream({ logs, onLoadMore, hasMore = false }: LogStreamProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 23)
  }

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'Critical':
      case 'Error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current)
      }
    }
  }, [onLoadMore, hasMore])

  return (
    <div className="bg-dark-accent border border-dark-border rounded-lg flex flex-col h-full">
      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No logs found matching your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {logs.map((log) => {
              const isExpanded = expandedIds.has(log.id)
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-dark-hover transition-colors cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  {/* Compact Row */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getLevelColor(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-300">
                          {log.component}
                        </span>
                      </div>
                      <p className="text-sm text-white">{log.message}</p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pl-7 space-y-3 border-t border-dark-border pt-3">
                      {/* Full Message */}
                      {(log.fullMessage || log.message) && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Full Message:</p>
                          <pre className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
                            {log.fullMessage || log.message}
                          </pre>
                        </div>
                      )}

                      {/* Stack Trace */}
                      {log.stackTrace && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Stack Trace:</p>
                          <pre className="text-xs text-red-300 font-mono bg-dark-surface border border-dark-border rounded p-3 overflow-x-auto whitespace-pre-wrap">
                            {log.stackTrace}
                          </pre>
                        </div>
                      )}

                      {/* IDs */}
                      <div className="grid grid-cols-2 gap-3">
                        {log.correlationId && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Correlation ID:</p>
                            <code className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded px-2 py-1">
                              {log.correlationId}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(log.correlationId!, `corr-${log.id}`)
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === `corr-${log.id}` && (
                              <span className="text-xs text-green-400">Copied!</span>
                            )}
                          </div>
                        )}
                        {log.traceId && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Trace ID:</p>
                            <code className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded px-2 py-1">
                              {log.traceId}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(log.traceId!, `trace-${log.id}`)
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === `trace-${log.id}` && (
                              <span className="text-xs text-green-400">Copied!</span>
                            )}
                          </div>
                        )}
                        {log.requestId && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Request ID:</p>
                            <code className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded px-2 py-1">
                              {log.requestId}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(log.requestId!, `req-${log.id}`)
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === `req-${log.id}` && (
                              <span className="text-xs text-green-400">Copied!</span>
                            )}
                          </div>
                        )}
                        {log.id && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Log ID:</p>
                            <code className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded px-2 py-1">
                              {log.id}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(log.id, `log-${log.id}`)
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === `log-${log.id}` && (
                              <span className="text-xs text-green-400">Copied!</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Related IDs */}
                      {(log.userId || log.clinicId) && (
                        <div className="grid grid-cols-2 gap-3">
                          {log.userId && (
                            <div>
                              <p className="text-xs text-gray-400">User ID:</p>
                              <code className="text-xs text-gray-300 font-mono">{log.userId}</code>
                            </div>
                          )}
                          {log.clinicId && (
                            <div>
                              <p className="text-xs text-gray-400">Clinic ID:</p>
                              <code className="text-xs text-gray-300 font-mono">{log.clinicId}</code>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Metadata:</p>
                          <pre className="text-xs text-gray-300 font-mono bg-dark-surface border border-dark-border rounded p-3 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="p-4 text-center text-gray-400 text-sm">
          Loading more logs...
        </div>
      )}
    </div>
  )
}


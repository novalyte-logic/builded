'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface InferenceEntry {
  id: string
  timestamp: string
  model: string
  input: string
  output: string
  confidence: number
  latency: number
  safetyFlags: string[]
  onViewDetails?: (id: string) => void
}

interface InferenceLogProps {
  entries: InferenceEntry[]
  maxVisible?: number
  onLoadMore?: () => void
  remainingCount?: number
}

export default function InferenceLog({ entries, maxVisible = 10, onLoadMore, remainingCount }: InferenceLogProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(maxVisible)

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-sm font-medium text-white">AI Inference Logs (Real-time)</h3>
      </div>
      <div className="divide-y divide-dark-border max-h-[600px] overflow-y-auto">
        {entries.slice(0, visibleCount).map((entry) => (
          <div key={entry.id} className="p-4 hover:bg-dark-hover transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    {entry.model}
                  </span>
                  <span className="text-xs text-gray-400">{entry.latency}ms</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      entry.confidence > 0.9
                        ? 'bg-green-500/20 text-green-400'
                        : entry.confidence > 0.7
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {(entry.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <div className="text-sm text-white mb-1">
                  <span className="text-gray-500">Input:</span> {entry.input}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Output:</span> {entry.output}
                </div>
                {entry.safetyFlags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.safetyFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
                {expanded.has(entry.id) && (
                  <div className="mt-3 pt-3 border-t border-dark-border">
                  <div className="text-xs text-gray-400 space-y-1">
                      <div>
                        <span className="text-gray-500">ID:</span> {entry.id}
                      </div>
                      <div>
                        <span className="text-gray-500">Timestamp:</span>{' '}
                        {new Date(entry.timestamp).toISOString()}
                      </div>
                    <button
                      onClick={() => entry.onViewDetails?.(entry.id)}
                      className="text-primary hover:text-primary-light transition-colors text-xs"
                    >
                      View Details
                    </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleExpand(entry.id)}
                className="ml-4 p-1 hover:bg-dark-accent rounded transition-colors"
              >
                {expanded.has(entry.id) ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      {((entries.length > visibleCount) || (remainingCount && remainingCount > 0)) && (
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={() => {
              if (onLoadMore) {
                onLoadMore()
              } else {
                setVisibleCount((prev) => prev + maxVisible)
              }
            }}
            className="text-sm text-primary hover:text-primary-light transition-colors"
          >
            {onLoadMore
              ? `Load More (${remainingCount ?? Math.max(entries.length - visibleCount, 0)} remaining)`
              : `Load More (${entries.length - visibleCount} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}

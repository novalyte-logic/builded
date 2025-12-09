'use client'

import { useState } from 'react'
import { Clock, Check, X, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'

export interface SessionCall {
  id: string
  timestamp: Date
  serverId: string
  toolName: string
  input: Record<string, unknown>
  response?: {
    data?: unknown
    error?: Error
    latency?: number
  }
}

interface SessionHistoryProps {
  calls: SessionCall[]
  onSelectCall: (call: SessionCall) => void
  onClearHistory: () => void
}

export default function SessionHistory({ calls, onSelectCall, onClearHistory }: SessionHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (calls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500/60">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No calls in session history</p>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Recent Calls ({calls.length})</h3>
        <button
          onClick={onClearHistory}
          className="px-3 py-1.5 text-xs text-gray-500/80 hover:text-status-offline border border-white/5 rounded-lg hover:border-status-offline/30 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {calls.map((call) => {
          const isSuccess = call.response && !call.response.error
          const isSelected = selectedId === call.id

          return (
            <button
              key={call.id}
              onClick={() => {
                setSelectedId(call.id)
                onSelectCall(call)
              }}
              className={clsx(
                'w-full text-left p-3 rounded-lg border transition-all',
                isSelected
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-dark-accent/40 border-white/5 hover:border-white/10'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <Check className="w-3.5 h-3.5 text-status-live" />
                  ) : call.response?.error ? (
                    <X className="w-3.5 h-3.5 text-status-offline" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-gray-500/60" />
                  )}
                  <span className="text-xs font-mono text-gray-400">{call.toolName}</span>
                </div>
                <span className="text-[10px] text-gray-500/70">{formatTime(call.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-500/80 font-mono">{call.serverId}</span>
                {call.response?.latency !== undefined && (
                  <span className="text-[10px] text-gray-500/60">{call.response.latency}ms</span>
                )}
              </div>
              {call.response?.error && (
                <p className="text-[10px] text-status-offline/80 truncate mt-1">
                  {call.response.error.message}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


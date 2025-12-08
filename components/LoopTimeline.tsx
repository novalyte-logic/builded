'use client'

import { useEffect, useState } from 'react'
import { Activity, Brain, Zap, TrendingUp, Circle } from 'lucide-react'

interface LoopEvent {
  id: string
  timestamp: Date
  phase: 1 | 2 | 3 | 4
  action: string
  impact: string
  status: 'active' | 'complete'
}

interface LoopTimelineProps {
  events: LoopEvent[]
}

export default function LoopTimeline({ events }: LoopTimelineProps) {
  const getPhaseIcon = (phase: number) => {
    switch (phase) {
      case 1:
        return <Activity className="w-4 h-4 text-blue-400" />
      case 2:
        return <Brain className="w-4 h-4 text-purple-400" />
      case 3:
        return <Zap className="w-4 h-4 text-yellow-400" />
      case 4:
        return <TrendingUp className="w-4 h-4 text-green-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPhaseLabel = (phase: number) => {
    const labels = {
      1: 'Traffic',
      2: 'Data',
      3: 'Optimize',
      4: 'Scale',
    }
    return labels[phase as keyof typeof labels]
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Live Growth Loop Timeline</h3>
      <div className="space-y-4">
        {events.slice(0, 10).map((event, idx) => (
          <div key={event.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              {getPhaseIcon(event.phase)}
              {idx < events.length - 1 && (
                <div className="w-0.5 h-8 bg-dark-border mt-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-white">{event.action}</span>
                <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full text-gray-300">
                  Phase {event.phase}: {getPhaseLabel(event.phase)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.status === 'active'
                    ? 'bg-status-live/20 text-status-live'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-1">{event.impact}</p>
              <p className="text-xs text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


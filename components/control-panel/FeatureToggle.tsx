'use client'

import { useState } from 'react'
import { ToggleLeft, ToggleRight, HelpCircle } from 'lucide-react'
import Explainer from '../Explainer'

interface FeatureToggleProps {
  id: string
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  tooltip?: {
    title: string
    what: string
    why: string
    how: string[]
  }
  lastChanged?: {
    by: string
    at: Date
  }
}

export default function FeatureToggle({
  label,
  description,
  enabled,
  onChange,
  tooltip,
  lastChanged,
}: FeatureToggleProps) {
  const Toggle = enabled ? ToggleRight : ToggleLeft
  const content = (
    <div className="flex items-center justify-between p-4 bg-dark-accent border border-dark-border rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white">{label}</h3>
          {tooltip && (
            <Explainer title={tooltip.title} what={tooltip.what} why={tooltip.why} how={tooltip.how}>
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help" />
            </Explainer>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        {lastChanged && (
          <p className="text-xs text-gray-500">
            Last changed by {lastChanged.by} at {lastChanged.at.toLocaleString()}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`ml-4 transition-colors ${enabled ? 'text-status-live' : 'text-gray-500'}`}
        aria-label={`Toggle ${label}`}
      >
        <Toggle className="w-10 h-10" />
      </button>
    </div>
  )

  return content
}


'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import Explainer from '../Explainer'

interface NumericSettingProps {
  id: string
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  type?: 'input' | 'slider'
  min?: number
  max?: number
  step?: number
  unit?: string
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

export default function NumericSetting({
  label,
  description,
  value,
  onChange,
  type = 'input',
  min,
  max,
  step = 1,
  unit,
  tooltip,
  lastChanged,
}: NumericSettingProps) {
  const [localValue, setLocalValue] = useState(value.toString())

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      onChange(numValue)
    }
  }

  const displayValue = type === 'slider' ? value : localValue

  return (
    <div className="p-4 bg-dark-accent border border-dark-border rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        {tooltip && (
          <Explainer title={tooltip.title} what={tooltip.what} why={tooltip.why} how={tooltip.how}>
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help" />
          </Explainer>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3">{description}</p>

      {type === 'slider' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1 min-w-[80px]">
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-20 bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
              />
              {unit && <span className="text-sm text-gray-400">{unit}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          />
          {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </div>
      )}

      {lastChanged && (
        <p className="text-xs text-gray-500 mt-2">
          Last changed by {lastChanged.by} at {lastChanged.at.toLocaleString()}
        </p>
      )}
    </div>
  )
}


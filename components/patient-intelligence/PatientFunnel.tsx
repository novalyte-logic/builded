'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Eye, X } from 'lucide-react'

interface FunnelStep {
  step: string
  count: number
  dropoff?: number
  topReasons?: string[]
}

interface PatientFunnelProps {
  data: FunnelStep[]
  onStepClick?: (step: FunnelStep) => void
}

export default function PatientFunnel({ data, onStepClick }: PatientFunnelProps) {
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  const handleBarClick = (step: FunnelStep) => {
    setSelectedStep(step)
    setShowPanel(true)
    if (onStepClick) {
      onStepClick(step)
    }
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']

  const CustomBar = (props: any) => {
    const { payload, x, y, width, height } = props
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={colors[props.index % colors.length]}
          rx={4}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleBarClick(payload)}
        />
      </g>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis 
            type="number" 
            stroke="#666" 
            fontSize={11}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
              return value.toString()
            }}
          />
          <YAxis
            dataKey="step"
            type="category"
            stroke="#666"
            fontSize={11}
            width={110}
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Patients']}
          />
          <Bar dataKey="count" shape={<CustomBar />} />
        </BarChart>
      </ResponsiveContainer>

      {/* Side Panel */}
      {showPanel && selectedStep && (
        <div className="absolute top-0 right-0 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-xl z-20 max-h-[400px] overflow-y-auto">
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">{selectedStep.step}</h4>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Patients</p>
              <p className="text-lg font-semibold text-white">{selectedStep.count.toLocaleString()}</p>
            </div>
            {selectedStep.dropoff !== undefined && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Drop-off Rate</p>
                <p className="text-lg font-semibold text-red-400">{selectedStep.dropoff.toFixed(1)}%</p>
              </div>
            )}
            {selectedStep.topReasons && selectedStep.topReasons.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Top Reasons (AI Summary)</p>
                <ul className="space-y-1">
                  {selectedStep.topReasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 border-t border-dark-border space-y-2">
              <button className="w-full px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Patient Cohort
              </button>
              <button className="w-full px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Create Recovery Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


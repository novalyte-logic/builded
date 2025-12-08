'use client'

import { useEffect, useState } from 'react'
import { FunnelChart, Funnel, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts'

interface FunnelStep {
  name: string
  value: number
  color: string
  dropoff?: number
}

interface ConversionFunnelProps {
  data: FunnelStep[]
  title?: string
}

export default function ConversionFunnel({ data, title = 'Conversion Funnel' }: ConversionFunnelProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      {title && <h3 className="text-sm font-medium text-white mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((step, index) => {
          const previousValue = index > 0 ? data[index - 1].value : step.value
          const dropoff = index > 0 ? ((previousValue - step.value) / previousValue) * 100 : 0
          
          return (
            <div key={step.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-sm text-white">{step.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {dropoff > 0 && (
                    <span className="text-xs text-status-degraded">
                      -{dropoff.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-sm font-medium text-white">
                    {step.value.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(step.value / data[0].value) * 100}%`,
                    backgroundColor: step.color,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {((step.value / data[0].value) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


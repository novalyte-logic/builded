'use client'

import { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import Explainer from '../Explainer'

interface KPICardWithSparklineProps {
  title: string
  value: string | number
  sparklineData: Array<{ date: string; value: number }>
  tooltipWhat: string
  tooltipWhy: string
  tooltipHow: string[]
}

export default function KPICardWithSparkline({
  title,
  value,
  sparklineData,
  tooltipWhat,
  tooltipWhy,
  tooltipHow,
}: KPICardWithSparklineProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Explainer title={title} what={tooltipWhat} why={tooltipWhy} how={tooltipHow}>
      <div
        className="bg-dark-surface border border-dark-border rounded-lg p-4 cursor-help"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="h-12">
          <ResponsiveContainer width="100%" height={48}>
            <LineChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip
                content={() => null}
                cursor={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Explainer>
  )
}


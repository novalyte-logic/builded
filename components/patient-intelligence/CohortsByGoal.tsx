'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface CohortData {
  name: string
  value: number
  revenue: number
  churnRisk: number
}

interface CohortsByGoalProps {
  data: CohortData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export default function CohortsByGoal({ data }: CohortsByGoalProps) {
  const topByVolume = data.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  )

  const topByRevenue = data.reduce((prev, current) =>
    prev.revenue > current.revenue ? prev : current
  )

  const topByChurnRisk = data
    .filter((d) => d.churnRisk > 0)
    .reduce((prev, current) =>
      prev.churnRisk > current.churnRisk ? prev : current,
      data[0]
    )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-white mb-2">{data.name}</p>
          <p className="text-xs text-gray-400">
            Patients: <span className="text-white">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-400">
            Revenue: <span className="text-white">${data.revenue.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-400">
            Churn Risk: <span className="text-white">{data.churnRisk.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              if (percent < 0.05) return '' // Hide labels for very small slices
              return `${name} ${(percent * 100).toFixed(0)}%`
            }}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-3 pt-4 border-t border-dark-border">
        <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Top by Volume</p>
          <p className="text-sm font-semibold text-white">{topByVolume.name}</p>
          <p className="text-xs text-gray-500">{topByVolume.value.toLocaleString()} patients</p>
        </div>
        <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Top by Revenue</p>
          <p className="text-sm font-semibold text-white">{topByRevenue.name}</p>
          <p className="text-xs text-gray-500">${topByRevenue.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Highest Churn Risk</p>
          <p className="text-sm font-semibold text-white">{topByChurnRisk.name}</p>
          <p className="text-xs text-gray-500">{topByChurnRisk.churnRisk.toFixed(1)}% risk</p>
        </div>
      </div>
    </div>
  )
}


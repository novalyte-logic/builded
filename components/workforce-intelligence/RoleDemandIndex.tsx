'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatNumber } from '@/lib/utils'

interface RoleDemandData {
  role: string
  demandScore: number
  openRequests: number
  urgencyWeight: number
  trend: 'up' | 'down' | 'stable'
}

interface RoleDemandIndexProps {
  data: {
    roles: RoleDemandData[]
  } | null
}

export default function RoleDemandIndex({ data }: RoleDemandIndexProps) {
  if (!data || !data.roles) {
    return (
      <div className="text-center py-12 text-gray-400">
        No demand data available
      </div>
    )
  }

  // Sort by demand score descending
  const sortedRoles = [...data.roles].sort((a, b) => b.demandScore - a.demandScore)

  const chartData = sortedRoles.map((role) => ({
    name: role.role,
    score: role.demandScore,
    requests: role.openRequests,
    trend: role.trend,
  }))

  const getColor = (role: string, trend: string) => {
    if (trend === 'up') return '#ef4444' // red-500
    if (trend === 'down') return '#10b981' // green-500
    return '#6366f1' // indigo-500
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-dark-accent border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">
            Demand Score: <span className="text-white font-medium">{data.score}</span>
          </p>
          <p className="text-sm text-gray-300">
            Open Requests: <span className="text-white font-medium">{data.requests}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Trend: {data.trend}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name, entry.trend)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Role Details List */}
      <div className="space-y-2 mt-4">
        {sortedRoles.map((role) => (
          <div
            key={role.role}
            className="flex items-center justify-between bg-dark-accent border border-dark-border rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-24">
                <span className="text-sm font-medium text-white">{role.role}</span>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(role.demandScore / sortedRoles[0].demandScore) * 100}%`,
                      backgroundColor: getColor(role.role, role.trend),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <div className="text-gray-400">Score</div>
                <div className="text-white font-semibold">{role.demandScore}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400">Requests</div>
                <div className="text-white font-semibold">{role.openRequests}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


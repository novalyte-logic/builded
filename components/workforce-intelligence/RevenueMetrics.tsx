'use client'

import { DollarSign, TrendingUp, Clock, MapPin } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Explainer from '../Explainer'

interface RevenueMetricsProps {
  data: {
    monthlyRevenue: Array<{ month: string; revenue: number; mrr: number }>
    conversionFunnel: Array<{ stage: string; count: number; percentage: number }>
    avgFeePerRole: Array<{ role: string; fee: number; shiftCount: number }>
    timeToFill: Array<{ role: string; avgHours: number; metro?: string }>
    topMetros: Array<{ city: string; state: string; revenue: number; placements: number; margin: number }>
  } | null
}

export default function RevenueMetrics({ data }: RevenueMetricsProps) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No revenue data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Workforce Revenue */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Monthly Workforce Revenue</h3>
          </div>
          <Explainer
            title="Monthly Workforce Revenue"
            what="Total fees earned by Novalyte from workforce placements each month."
            why="Tracks MRR (Monthly Recurring Revenue) from staffing marketplace and identifies revenue trends."
            how={[
              'Calculated as: sum(fee_to_novalyte) per month',
              'Includes match fees, percentage fees, and priority fees',
              'MRR = average of last 3 months',
            ]}
          >
            <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
          </Explainer>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(v) => `$${v/1000}K`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 4 }}
              name="MRR (Avg)"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-400">Current MRR:</span>
            <span className="text-white font-semibold ml-2">
              {formatCurrency(data.monthlyRevenue[data.monthlyRevenue.length - 1]?.mrr || 0)}
            </span>
          </div>
          <div className="text-gray-400">
            Trend: {data.monthlyRevenue.length > 1 && 
              data.monthlyRevenue[data.monthlyRevenue.length - 1].revenue > 
              data.monthlyRevenue[data.monthlyRevenue.length - 2].revenue ? (
              <span className="text-green-400">↑ Growing</span>
            ) : (
              <span className="text-yellow-400">→ Stable</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Conversion Funnel */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Placement Conversion Funnel</h3>
            </div>
            <Explainer
              title="Placement Conversion Funnel"
              what="Shows how many requests progress through each stage of the placement process."
              why="Identifies bottlenecks and drop-off points to optimize conversion rates."
              how={[
                'Requests Created: Total staffing requests submitted',
                'Candidates Suggested: AI-matched practitioners',
                'Offers Sent: Formal offers extended',
                'Shifts Accepted: Practitioners accepted',
                'Shifts Completed: Finished placements',
              ]}
            >
              <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
            </Explainer>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.conversionFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${name === 'count' ? 'Count' : 'Percentage'})`,
                  name,
                ]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.conversionFunnel.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.percentage >= 80
                        ? '#10b981'
                        : entry.percentage >= 50
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.conversionFunnel.map((stage, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{stage.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{stage.count}</span>
                  <span className="text-gray-500">({stage.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Fee Per Role */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Average Fee Per Role</h3>
            </div>
            <Explainer
              title="Average Fee Per Role"
              what="Average placement fee earned per shift by practitioner role."
              why="Helps optimize pricing strategy and identify high-value role categories."
              how={[
                'Calculated as: total fees / number of shifts per role',
                'Includes match fees, percentage fees, and priority fees',
                'Higher fees = more revenue per placement',
              ]}
            >
              <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
            </Explainer>
          </div>
          <div className="space-y-4">
            {data.avgFeePerRole.map((role, idx) => (
              <div
                key={idx}
                className="bg-dark-accent border border-dark-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{role.role}</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(role.fee)}/shift
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatNumber(role.shiftCount)} shifts completed</span>
                  <span>
                    Total: {formatCurrency(role.fee * role.shiftCount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time-to-Fill Metric */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Time-to-Fill</h3>
            </div>
            <Explainer
              title="Time-to-Fill"
              what="Average time from request creation to practitioner acceptance."
              why="Faster fills improve clinic satisfaction and reduce missed opportunities."
              how={[
                'Measured in hours from request.created_at to booking.practitioner_accepted_at',
                'Lower is better',
                'Shown by role and metro for optimization',
              ]}
            >
              <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
            </Explainer>
          </div>
          <div className="space-y-3">
            {data.timeToFill.map((item, idx) => (
              <div
                key={idx}
                className="bg-dark-accent border border-dark-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.role}</span>
                  <span className="text-lg font-bold text-white">
                    {item.avgHours < 24
                      ? `${item.avgHours.toFixed(1)}h`
                      : `${(item.avgHours / 24).toFixed(1)}d`}
                  </span>
                </div>
                {item.metro && (
                  <div className="text-xs text-gray-400">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {item.metro}
                  </div>
                )}
                <div className="mt-2">
                  <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((item.avgHours / 72) * 100, 100)}%`,
                        backgroundColor:
                          item.avgHours < 24
                            ? '#10b981'
                            : item.avgHours < 48
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Metros */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Top Performing Metros</h3>
            </div>
            <Explainer
              title="Top Performing Metros"
              what="Highest revenue-generating metropolitan areas from workforce placements."
              why="Identifies which markets are most profitable for focusing deployment efforts."
              how={[
                'Ranked by workforce revenue (last 30 days)',
                'Includes placement count and average margin percentage',
                'Higher margin = more profitable placements',
              ]}
            >
              <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
            </Explainer>
          </div>
          <div className="space-y-3">
            {data.topMetros.map((metro, idx) => (
              <div
                key={idx}
                className="bg-dark-accent border border-dark-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-white">
                        {metro.city}, {metro.state}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(metro.revenue)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Placements:</span>
                    <span className="text-white font-medium ml-2">{metro.placements}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400">Margin:</span>
                    <span
                      className={`font-medium ml-2 ${
                        metro.margin >= 70 ? 'text-green-400' : metro.margin >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {metro.margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


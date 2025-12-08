'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ErrorDataPoint {
  time: string
  errors: number
}

interface ResponseTimeDataPoint {
  component: string
  p95: number
}

interface WebhookDataPoint {
  time: string
  success: number
  failure: number
}

interface LogMetricsProps {
  errorsOverTime: ErrorDataPoint[]
  responseTimes: ResponseTimeDataPoint[]
  webhookRates: WebhookDataPoint[]
}

export default function LogMetrics({
  errorsOverTime,
  responseTimes,
  webhookRates,
}: LogMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Errors Over Time (Last 24h) */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Errors Over Time (Last 24h)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={errorsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={11}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              }}
            />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* P95 Response Time by Component */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">P95 Response Time by Component</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={responseTimes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="component"
              stroke="#666"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" fontSize={11} tickFormatter={(value) => `${value}ms`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value}ms`, 'P95 Response Time']}
            />
            <Bar dataKey="p95" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Webhook Success vs Failure Rate */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Webhook Success vs Failure Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={webhookRates}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={11}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              }}
            />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="success"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Success"
            />
            <Line
              type="monotone"
              dataKey="failure"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Failure"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


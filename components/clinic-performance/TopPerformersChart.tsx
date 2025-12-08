'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ClinicPerformance {
  id: string
  name: string
  leadToConsultRate: number
  consultToProtocolRate: number
  revenue30d: number
}

interface TopPerformersChartProps {
  clinics: ClinicPerformance[]
  networkMedian: {
    leadToConsult: number
    consultToProtocol: number
  }
}

export default function TopPerformersChart({
  clinics,
  networkMedian,
}: TopPerformersChartProps) {
  // Get top 5 performers by revenue
  const topPerformers = [...clinics]
    .sort((a, b) => b.revenue30d - a.revenue30d)
    .slice(0, 5)

  const chartData = [
    ...topPerformers.map((clinic) => ({
      name: clinic.name.length > 20 ? clinic.name.substring(0, 20) + '...' : clinic.name,
      'Lead → Consult %': clinic.leadToConsultRate * 100,
      'Consult → Protocol %': clinic.consultToProtocolRate * 100,
    })),
    {
      name: 'Network Median',
      'Lead → Consult %': networkMedian.leadToConsult * 100,
      'Consult → Protocol %': networkMedian.consultToProtocol * 100,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          stroke="#666"
          fontSize={11}
        />
        <YAxis
          stroke="#666"
          fontSize={11}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111',
            border: '1px solid #1a1a1a',
            borderRadius: '6px',
            color: '#fff',
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
        />
        <Legend />
        <Bar dataKey="Lead → Consult %" fill="#3b82f6" />
        <Bar dataKey="Consult → Protocol %" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}


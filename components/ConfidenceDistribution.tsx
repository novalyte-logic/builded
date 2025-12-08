'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ConfidenceDistributionProps {
  data: { range: string; count: number }[]
}

export default function ConfidenceDistribution({ data }: ConfidenceDistributionProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-white mb-4">Confidence Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis dataKey="range" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


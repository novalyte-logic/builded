'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface VendorRadarData {
  vendor: string
  onTimeDelivery: number
  qualityScore: number // Inverted defect rate (100 - defectRate)
  margin: number
  clinicSatisfaction: number // Based on rating (rating / 5 * 100)
  color: string
}

interface SupplyStabilityRadarProps {
  vendors: VendorRadarData[]
}

export default function SupplyStabilityRadar({ vendors }: SupplyStabilityRadarProps) {
  // Prepare data for radar chart (top 3 vendors)
  const topVendors = vendors.slice(0, 3)

  // Build radar data - each object represents one axis/metric
  // Create vendor key mappings for consistent naming
  const vendorMap = topVendors.map((v) => ({
    key: v.vendor.length > 20 ? v.vendor.substring(0, 20) + '...' : v.vendor,
    original: v.vendor,
    color: v.color,
  }))

  const radarData = [
    {
      axis: 'On-Time Delivery',
      ...Object.fromEntries(vendorMap.map((v, idx) => [v.key, topVendors[idx].onTimeDelivery])),
    },
    {
      axis: 'Quality (Low Defects)',
      ...Object.fromEntries(vendorMap.map((v, idx) => [v.key, topVendors[idx].qualityScore])),
    },
    {
      axis: 'Margin',
      ...Object.fromEntries(vendorMap.map((v, idx) => [v.key, topVendors[idx].margin])),
    },
    {
      axis: 'Clinic Satisfaction',
      ...Object.fromEntries(vendorMap.map((v, idx) => [v.key, topVendors[idx].clinicSatisfaction])),
    },
  ]

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid stroke="#1a1a1a" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#999', fontSize: 11 }}
            stroke="#1a1a1a"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#666', fontSize: 10 }}
            stroke="#1a1a1a"
          />
          {vendorMap.map((v, idx) => (
            <Radar
              key={v.original}
              name={v.key}
              dataKey={v.key}
              stroke={v.color}
              fill={v.color}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '6px',
              color: '#fff',
            }}
            formatter={(value: number) => `${value.toFixed(1)}`}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#999', paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: '#999', fontSize: '11px' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}


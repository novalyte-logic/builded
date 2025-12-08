'use client'

import { useState, useEffect } from 'react'
import StatusBadge from '@/components/StatusBadge'
import VendorScorecardTable, { type VendorScorecard, type SupplyGrade } from '@/components/vendor-supply/VendorScorecardTable'
import SupplyStabilityRadar from '@/components/vendor-supply/SupplyStabilityRadar'
import VendorAIInsights from '@/components/vendor-supply/VendorAIInsights'
import VendorDetailPanel from '@/components/vendor-supply/VendorDetailPanel'

interface VendorRadarData {
  vendor: string
  onTimeDelivery: number
  qualityScore: number
  margin: number
  clinicSatisfaction: number
  color: string
}

interface VendorRecommendation {
  vendor_id: string
  vendor_name: string
  action_type: 'prioritize' | 'watch' | 'audit'
  recommendation: string
  suggested_action: string
}

export default function VendorsPage() {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Vendor scorecard data (mock - would come from BigQuery)
  const [vendors] = useState<VendorScorecard[]>([
    {
      id: '1',
      name: 'Vitality Labs',
      category: 'Supplements',
      onTimeDelivery: 96.5,
      defectReturnRate: 2.1,
      avgMargin: 42.3,
      avgRating: 4.7,
      supplyGrade: 'A',
      region: 'West Coast',
    },
    {
      id: '2',
      name: 'LabCorp Direct',
      category: 'Diagnostics',
      onTimeDelivery: 94.2,
      defectReturnRate: 1.8,
      avgMargin: 38.5,
      avgRating: 4.6,
      supplyGrade: 'A',
      region: 'Nationwide',
    },
    {
      id: '3',
      name: 'Health Tech Innovations',
      category: 'Devices',
      onTimeDelivery: 89.3,
      defectReturnRate: 4.2,
      avgMargin: 35.8,
      avgRating: 4.3,
      supplyGrade: 'B',
      region: 'Nationwide',
    },
    {
      id: '4',
      name: 'Recovery Equipment Co',
      category: 'Equipment',
      onTimeDelivery: 87.5,
      defectReturnRate: 6.8,
      avgMargin: 32.1,
      avgRating: 4.0,
      supplyGrade: 'B',
      region: 'East Coast',
    },
    {
      id: '5',
      name: 'Men\'s Health Pro',
      category: 'Supplements',
      onTimeDelivery: 92.1,
      defectReturnRate: 3.5,
      avgMargin: 40.2,
      avgRating: 4.4,
      supplyGrade: 'A',
      region: 'Nationwide',
    },
    {
      id: '6',
      name: 'Peptide Sciences',
      category: 'Supplements',
      onTimeDelivery: 91.8,
      defectReturnRate: 2.9,
      avgMargin: 41.5,
      avgRating: 4.5,
      supplyGrade: 'A',
      region: 'Nationwide',
    },
    {
      id: '7',
      name: 'HomeTest Labs',
      category: 'Diagnostics',
      onTimeDelivery: 85.2,
      defectReturnRate: 8.5,
      avgMargin: 28.9,
      avgRating: 3.8,
      supplyGrade: 'C',
      region: 'Nationwide',
    },
    {
      id: '8',
      name: 'Wellness Plus',
      category: 'Supplements',
      onTimeDelivery: 83.7,
      defectReturnRate: 12.3,
      avgMargin: 25.4,
      avgRating: 3.6,
      supplyGrade: 'Watch',
      region: 'Nationwide',
    },
    {
      id: '9',
      name: 'Performance Supplements',
      category: 'Supplements',
      onTimeDelivery: 88.9,
      defectReturnRate: 5.2,
      avgMargin: 33.7,
      avgRating: 4.1,
      supplyGrade: 'B',
      region: 'Nationwide',
    },
    {
      id: '10',
      name: 'Longevity Labs',
      category: 'Supplements',
      onTimeDelivery: 93.4,
      defectReturnRate: 2.7,
      avgMargin: 39.8,
      avgRating: 4.5,
      supplyGrade: 'A',
      region: 'Nationwide',
    },
  ])

  // Radar chart data (top 3 vendors)
  const [radarData] = useState<VendorRadarData[]>([
    {
      vendor: 'Vitality Labs',
      onTimeDelivery: 96.5,
      qualityScore: 97.9, // 100 - defectRate
      margin: 42.3,
      clinicSatisfaction: 94.0, // rating / 5 * 100
      color: '#10b981',
    },
    {
      vendor: 'LabCorp Direct',
      onTimeDelivery: 94.2,
      qualityScore: 98.2,
      margin: 38.5,
      clinicSatisfaction: 92.0,
      color: '#3b82f6',
    },
    {
      vendor: 'Men\'s Health Pro',
      onTimeDelivery: 92.1,
      qualityScore: 96.5,
      margin: 40.2,
      clinicSatisfaction: 88.0,
      color: '#8b5cf6',
    },
  ])

  // AI Recommendations (mock - would come from Gemini)
  const [recommendations] = useState<VendorRecommendation[]>([
    {
      vendor_id: '1',
      vendor_name: 'Vitality Labs',
      action_type: 'prioritize',
      recommendation: 'Exceptional performance across all metrics. Grade A supplier with 96.5% on-time delivery and 4.7/5 rating.',
      suggested_action: 'Offer top-tier vendor A home-page placement and feature in recommended stacks.',
    },
    {
      vendor_id: '2',
      vendor_name: 'LabCorp Direct',
      action_type: 'prioritize',
      recommendation: 'Strong diagnostics provider with consistent quality and high margins.',
      suggested_action: 'Increase visibility for diagnostics category recommendations.',
    },
    {
      vendor_id: '8',
      vendor_name: 'Wellness Plus',
      action_type: 'watch',
      recommendation: 'Defect rate at 12.3% and delivery reliability declining. Monitor closely.',
      suggested_action: 'Reduce exposure for vendor B until supply stabilizes. Schedule quality audit.',
    },
    {
      vendor_id: '7',
      vendor_name: 'HomeTest Labs',
      action_type: 'audit',
      recommendation: 'Multiple performance issues: 8.5% defect rate, below-average margins, declining ratings.',
      suggested_action: 'Schedule comprehensive vendor audit. Consider pausing new orders until resolved.',
    },
  ])

  useEffect(() => {
    fetchVendors()
    const interval = setInterval(fetchVendors, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchVendors = async () => {
    setLoading(true)
    // TODO: Replace with actual API call
    // const response = await fetch('/api/admin/vendors/supply-grade')
    // const data = await response.json()
    setTimeout(() => setLoading(false), 500)
  }

  const handleRowClick = (vendorId: string) => {
    setSelectedVendorId(vendorId)
  }

  const handleToggleFlag = (vendorId: string, flag: 'preferred' | 'watchlist') => {
    // TODO: Implement API call to toggle vendor flag
    console.log(`Toggle ${flag} for vendor ${vendorId}`)
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Vendor Supply Grade — Reliability & Margin Intelligence
            </h1>
            <p className="text-gray-400 mt-1">
              Which vendors are reliable, profitable, and safe to route more business to?
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* LEFT: Vendor Scorecard Table */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
              <p className="text-gray-400">Loading vendor data...</p>
            </div>
          ) : (
            <VendorScorecardTable vendors={vendors} onRowClick={handleRowClick} />
          )}
        </div>

        {/* RIGHT: Visuals + AI Insights */}
        <div className="space-y-6">
          {/* Supply Stability Radar */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Supply Stability Radar</h3>
            <SupplyStabilityRadar vendors={radarData} />
          </div>

          {/* AI Insights */}
          <VendorAIInsights recommendations={recommendations} />
        </div>
      </div>

      {/* Vendor Detail Side Panel */}
      {selectedVendorId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedVendorId(null)}
          />
          <VendorDetailPanel
            vendorId={selectedVendorId}
            onClose={() => setSelectedVendorId(null)}
            onToggleFlag={handleToggleFlag}
          />
        </>
      )}
    </div>
  )
}


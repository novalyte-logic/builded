'use client'

import { useState, useEffect } from 'react'
import { X, Star, TrendingUp, Package, DollarSign, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber, formatCurrency } from '@/lib/utils'
import type { VendorScorecard, SupplyGrade } from './VendorScorecardTable'

interface VendorDetailPanelProps {
  vendorId: string | null
  onClose: () => void
  onToggleFlag: (vendorId: string, flag: 'preferred' | 'watchlist') => void
}

export default function VendorDetailPanel({
  vendorId,
  onClose,
  onToggleFlag,
}: VendorDetailPanelProps) {
  const [vendor, setVendor] = useState<VendorScorecard | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPreferred, setIsPreferred] = useState(false)
  const [isWatchlist, setIsWatchlist] = useState(false)
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails()
    }
  }, [vendorId])

  const fetchVendorDetails = async () => {
    if (!vendorId) return
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/vendors/${vendorId}`)
      // const data = await response.json()

      // Mock data for now
      const mockVendor: VendorScorecard = {
        id: vendorId,
        name: 'Vitality Labs',
        category: 'Supplements',
        onTimeDelivery: 96.5,
        defectReturnRate: 2.1,
        avgMargin: 42.3,
        avgRating: 4.7,
        supplyGrade: 'A',
        region: 'West Coast',
      }

      setVendor(mockVendor)
      setIsPreferred(false) // TODO: Fetch from API
      setIsWatchlist(false) // TODO: Fetch from API

      // Mock historical data (last 6 months)
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      setHistoricalData(
        months.map((month) => ({
          month,
          onTimeDelivery: 90 + Math.random() * 10,
          defectRate: 1 + Math.random() * 4,
          margin: 35 + Math.random() * 10,
          rating: 4.0 + Math.random() * 1,
        }))
      )
    } catch (error) {
      console.error('Error fetching vendor details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!vendorId || !vendor) return null

  const handleTogglePreferred = () => {
    setIsPreferred(!isPreferred)
    onToggleFlag(vendorId, 'preferred')
  }

  const handleToggleWatchlist = () => {
    setIsWatchlist(!isWatchlist)
    onToggleFlag(vendorId, 'watchlist')
  }

  const getGradeColor = (grade: SupplyGrade) => {
    switch (grade) {
      case 'A':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'B':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'C':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'Watch':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-dark-surface border-l border-dark-border shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-bold text-white">{vendor.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{vendor.category}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Vendor Profile Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">On-Time Delivery</span>
            </div>
            <p className="text-2xl font-bold text-white">{vendor.onTimeDelivery.toFixed(1)}%</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Defect Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{vendor.defectReturnRate.toFixed(1)}%</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Avg Margin</span>
            </div>
            <p className="text-2xl font-bold text-white">{vendor.avgMargin.toFixed(1)}%</p>
          </div>
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Rating</span>
            </div>
            <p className="text-2xl font-bold text-white">{vendor.avgRating.toFixed(1)}</p>
          </div>
        </div>

        {/* Supply Grade */}
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Supply Grade</span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full border ${getGradeColor(
                vendor.supplyGrade
              )}`}
            >
              {vendor.supplyGrade}
            </span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex gap-3">
          <button
            onClick={handleTogglePreferred}
            className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              isPreferred
                ? 'bg-status-live/20 border-status-live/50 text-status-live'
                : 'bg-dark-accent border-dark-border text-gray-300 hover:bg-dark-hover'
            }`}
          >
            {isPreferred ? '✓ Preferred' : 'Mark as Preferred'}
          </button>
          <button
            onClick={handleToggleWatchlist}
            className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              isWatchlist
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-dark-accent border-dark-border text-gray-300 hover:bg-dark-hover'
            }`}
          >
            {isWatchlist ? '✓ On Watchlist' : 'Add to Watchlist'}
          </button>
        </div>

        {/* Historical Graphs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Historical Performance (6 Months)</h3>

          {/* On-Time Delivery Trend */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h4 className="text-xs text-gray-400 mb-3">On-Time Delivery %</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#666" fontSize={11} />
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
                  dataKey="onTimeDelivery"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Defect Rate Trend */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h4 className="text-xs text-gray-400 mb-3">Defect Rate %</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#666" fontSize={11} />
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
                  dataKey="defectRate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Margin Trend */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h4 className="text-xs text-gray-400 mb-3">Average Margin %</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis domain={[30, 50]} stroke="#666" fontSize={11} />
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
                  dataKey="margin"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Trend */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
            <h4 className="text-xs text-gray-400 mb-3">Average Rating</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis domain={[3.5, 5.0]} stroke="#666" fontSize={11} />
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
                  dataKey="rating"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}


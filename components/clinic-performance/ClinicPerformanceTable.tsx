'use client'

import { useState } from 'react'
import { Search, Filter, ArrowUpDown, Eye } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Explainer from '../Explainer'

interface ClinicPerformance {
  id: string
  name: string
  city: string
  state: string
  matchScore: number
  leadToConsultRate: number
  consultToProtocolRate: number
  noShowRate: number
  revenue30d: number
  patientNPS: number | null
  primaryFocus: string[]
}

interface ClinicPerformanceTableProps {
  clinics: ClinicPerformance[]
  onRowClick: (clinicId: string) => void
}

export default function ClinicPerformanceTable({
  clinics,
  onRowClick,
}: ClinicPerformanceTableProps) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [primaryFocus, setPrimaryFocus] = useState('')
  const [sortBy, setSortBy] = useState<'revenue' | 'conversion' | 'noShow' | 'matchScore'>('revenue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredClinics = clinics.filter((clinic) => {
    if (search && !clinic.name.toLowerCase().includes(search.toLowerCase())) return false
    if (region && clinic.state !== region) return false
    if (primaryFocus && !clinic.primaryFocus.includes(primaryFocus)) return false
    return true
  })

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'revenue':
        comparison = a.revenue30d - b.revenue30d
        break
      case 'conversion':
        comparison = a.leadToConsultRate - b.leadToConsultRate
        break
      case 'noShow':
        comparison = a.noShowRate - b.noShowRate
        break
      case 'matchScore':
        comparison = a.matchScore - b.matchScore
        break
    }
    return sortDirection === 'desc' ? -comparison : comparison
  })

  const getPerformanceBarColor = (rate: number, type: 'lead' | 'protocol') => {
    if (type === 'lead') {
      if (rate >= 0.6) return 'bg-status-live'
      if (rate >= 0.4) return 'bg-yellow-500'
      return 'bg-red-500'
    } else {
      if (rate >= 0.7) return 'bg-status-live'
      if (rate >= 0.5) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-dark-border space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clinics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Regions</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="IL">Illinois</option>
          </select>
          <select
            value={primaryFocus}
            onChange={(e) => setPrimaryFocus(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Focus Areas</option>
            <option value="TRT">TRT</option>
            <option value="GLP-1">GLP-1</option>
            <option value="Recovery">Recovery</option>
            <option value="Longevity">Longevity</option>
          </select>
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-')
              setSortBy(field as any)
              setSortDirection(dir as 'asc' | 'desc')
            }}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="revenue-desc">Sort: Revenue (High to Low)</option>
            <option value="revenue-asc">Sort: Revenue (Low to High)</option>
            <option value="conversion-desc">Sort: Conversion Rate (High to Low)</option>
            <option value="conversion-asc">Sort: Conversion Rate (Low to High)</option>
            <option value="noShow-asc">Sort: No-Show Rate (Low to High)</option>
            <option value="noShow-desc">Sort: No-Show Rate (High to Low)</option>
            <option value="matchScore-desc">Sort: Match Score (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Clinic Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Lead → Consult
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Consult → Protocol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                No-Show Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue (30d)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                NPS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {sortedClinics.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No clinics found matching your filters
                </td>
              </tr>
            ) : (
              sortedClinics.map((clinic) => (
              <tr
                key={clinic.id}
                onClick={() => onRowClick(clinic.id)}
                className="hover:bg-dark-hover cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{clinic.name}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {clinic.city}, {clinic.state}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-dark-accent rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          clinic.matchScore >= 80
                            ? 'bg-status-live'
                            : clinic.matchScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${clinic.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{clinic.matchScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Explainer
                    title="Lead → Consult Conversion"
                    what={`${(clinic.leadToConsultRate * 100).toFixed(1)}% of leads sent to this clinic result in booked consultations.`}
                    why="Higher conversion rates indicate better lead quality matching and clinic responsiveness."
                    how={['Calculated: Booked Consults / Leads Sent', 'Includes all lead types', 'Network median: ~65%']}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-dark-accent rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPerformanceBarColor(
                            clinic.leadToConsultRate,
                            'lead'
                          )}`}
                          style={{ width: `${clinic.leadToConsultRate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{(clinic.leadToConsultRate * 100).toFixed(1)}%</span>
                    </div>
                  </Explainer>
                </td>
                <td className="px-4 py-3">
                  <Explainer
                    title="Consult → Protocol Start"
                    what={`${(clinic.consultToProtocolRate * 100).toFixed(1)}% of consultations result in active protocol starts.`}
                    why="Measures clinic effectiveness at converting consultations to treatment starts."
                    how={['Calculated: Protocol Starts / Consults', 'Network median: ~72%', 'Higher = better clinic performance']}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-dark-accent rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPerformanceBarColor(
                            clinic.consultToProtocolRate,
                            'protocol'
                          )}`}
                          style={{ width: `${clinic.consultToProtocolRate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{(clinic.consultToProtocolRate * 100).toFixed(1)}%</span>
                    </div>
                  </Explainer>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      clinic.noShowRate < 0.1
                        ? 'bg-status-live/20 text-status-live border border-status-live/30'
                        : clinic.noShowRate < 0.2
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {(clinic.noShowRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white font-medium">
                  {formatCurrency(clinic.revenue30d)}
                </td>
                <td className="px-4 py-3">
                  {clinic.patientNPS !== null ? (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        clinic.patientNPS >= 50
                          ? 'bg-status-live/20 text-status-live border border-status-live/30'
                          : clinic.patientNPS >= 30
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {clinic.patientNPS}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


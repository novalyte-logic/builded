'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { ClinicProfile } from '@/lib/types/clinic'

interface ClinicListProps {
  onSelectClinic: (id: string) => void
  selectedClinicId?: string | null
}

export default function ClinicList({ onSelectClinic, selectedClinicId }: ClinicListProps) {
  const [clinics, setClinics] = useState<ClinicProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    verification_status: '',
    show_in_directory: '',
    specialty: '',
    price_band: '',
    search: '',
  })

  useEffect(() => {
    fetchClinics()
    const interval = setInterval(fetchClinics, 30000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.verification_status) params.set('verification_status', filters.verification_status)
      if (filters.show_in_directory) params.set('show_in_directory', filters.show_in_directory)
      if (filters.specialty) params.set('specialty', filters.specialty)
      if (filters.price_band) params.set('price_band', filters.price_band)
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/clinics?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch clinics')

      const data = await response.json()
      setClinics(data.clinics || [])
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-status-live" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-status-offline" />
      default:
        return <Clock className="w-4 h-4 text-status-degraded" />
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-dark-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clinics..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.verification_status}
            onChange={(e) => setFilters({ ...filters, verification_status: e.target.value })}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.price_band}
            onChange={(e) => setFilters({ ...filters, price_band: e.target.value })}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Price Bands</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading clinics...</div>
        ) : clinics.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No clinics found</div>
        ) : (
          <div className="divide-y divide-dark-border">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                onClick={() => onSelectClinic(clinic.id)}
                className={`p-4 hover:bg-dark-hover cursor-pointer transition-colors ${
                  selectedClinicId === clinic.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{clinic.name}</h4>
                  <div className="flex items-center gap-1">
                    {getVerificationIcon(clinic.verification_status)}
                    {clinic.is_featured && (
                      <span className="text-xs text-primary">★</span>
                    )}
                    {!clinic.show_in_directory && (
                      <Eye className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-2">
                  {clinic.city}{clinic.state ? `, ${clinic.state}` : ''}
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {clinic.specialties.slice(0, 3).map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{clinic.price_band}</span>
                  {clinic.match_score_override && (
                    <span className="text-primary">
                      Match: {clinic.match_score_override}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


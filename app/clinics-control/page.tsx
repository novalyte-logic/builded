'use client'

import { useState, useEffect, useMemo } from 'react'
import { Building2, Plus, AlertTriangle, ChevronUp, ChevronDown, Search } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import ClinicEditor from '@/components/clinics/ClinicEditor'
import { ClinicProfile } from '@/lib/types/clinic'

type SortField = 'name' | 'location' | 'status' | 'price_band' | 'updated_at'
type SortDirection = 'asc' | 'desc'

export default function ClinicsControlPage() {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [clinics, setClinics] = useState<ClinicProfile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priceBandFilter, setPriceBandFilter] = useState<string>('')
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetchClinics()
  }, [])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/clinics')
      if (!response.ok) throw new Error('Failed to fetch clinics')
      const data = await response.json()
      setClinics(data.clinics || [])
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Compute lead status from notes_internal
  const getLeadStatus = (clinic: ClinicProfile): string => {
    const notes = (clinic.notes_internal || '').toLowerCase()
    if (notes.includes('at capacity') || notes.includes('paused')) {
      return 'At capacity'
    }
    if (notes.includes('actively accepting') || notes.includes('accepting')) {
      return 'Actively accepting'
    }
    if (clinic.verification_status === 'pending') {
      return 'Pending verification'
    }
    if (clinic.verification_status === 'rejected' || !clinic.show_in_directory) {
      return 'Paused'
    }
    return 'Open'
  }

  // Filter and sort clinics
  const filteredAndSortedClinics = useMemo(() => {
    let filtered = [...clinics]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.state?.toLowerCase().includes(term) ||
          c.specialties.some((s) => s.toLowerCase().includes(term))
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((c) => c.verification_status === statusFilter)
    }

    // Price band filter
    if (priceBandFilter) {
      filtered = filtered.filter((c) => c.price_band === priceBandFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'location':
          aVal = `${a.city}${a.state || ''}`.toLowerCase()
          bVal = `${b.city}${b.state || ''}`.toLowerCase()
          break
        case 'status':
          aVal = a.verification_status
          bVal = b.verification_status
          break
        case 'price_band':
          const priceMap: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
          aVal = priceMap[a.price_band] || 0
          bVal = priceMap[b.price_band] || 0
          break
        case 'updated_at':
          aVal = new Date(a.updated_at).getTime()
          bVal = new Date(b.updated_at).getTime()
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [clinics, searchTerm, statusFilter, priceBandFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              Men's Clinics Control
            </h1>
            <p className="text-gray-400 mt-2">
              Full control panel for managing clinic profiles, SEO, and directory visibility
            </p>
          </div>
          <div className="flex items-center gap-4">
          <StatusBadge status="live" />
            <button
              onClick={() => {
                setShowCreate(true)
                setSelectedClinicId(null)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Clinic
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">
              You are editing LIVE production data
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Changes sync immediately to app.novalyte.io. All edits are logged with audit trail.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Clinic Table */}
        <div className="lg:col-span-3">
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            {/* Filters */}
            <div className="p-4 border-b border-dark-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or service line..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={priceBandFilter}
                  onChange={(e) => setPriceBandFilter(e.target.value)}
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Clinic Name
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('location')}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Location
                        <SortIcon field="location" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Service Lines
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('price_band')}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Price
                        <SortIcon field="price_band" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Lead Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th
                      onClick={() => handleSort('updated_at')}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Updated
                        <SortIcon field="updated_at" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        Loading clinics...
                      </td>
                    </tr>
                  ) : filteredAndSortedClinics.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No clinics found
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedClinics.map((clinic) => (
                      <tr
                        key={clinic.id}
              onClick={() => {
                          setSelectedClinicId(clinic.id)
                          setShowCreate(false)
                        }}
                        className={clsx(
                          'cursor-pointer transition-colors hover:bg-dark-hover',
                          selectedClinicId === clinic.id && 'bg-primary/10 border-l-4 border-primary'
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-white font-medium">
                          <div className="flex items-center gap-2">
                            {clinic.name}
                            {clinic.is_featured && (
                              <span className="text-xs text-primary">★</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {clinic.city}, {clinic.state || clinic.country}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {clinic.specialties.slice(0, 3).map((spec, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400"
                              >
                                {spec}
                              </span>
                            ))}
                            {clinic.specialties.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{clinic.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-medium',
                              clinic.verification_status === 'verified' &&
                                'bg-status-live/10 text-status-live',
                              clinic.verification_status === 'pending' &&
                                'bg-status-degraded/10 text-status-degraded',
                              clinic.verification_status === 'rejected' &&
                                'bg-status-offline/10 text-status-offline'
                            )}
                          >
                            {clinic.verification_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {clinic.price_band}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'text-xs',
                              getLeadStatus(clinic) === 'Actively accepting' && 'text-status-live',
                              getLeadStatus(clinic) === 'At capacity' && 'text-status-degraded',
                              getLeadStatus(clinic) === 'Paused' && 'text-status-offline',
                              getLeadStatus(clinic) === 'Open' && 'text-gray-400',
                              getLeadStatus(clinic) === 'Pending verification' && 'text-gray-500'
                            )}
                          >
                            {getLeadStatus(clinic)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs',
                              clinic.show_in_directory
                                ? 'bg-status-live/10 text-status-live'
                                : 'bg-gray-500/10 text-gray-500'
                            )}
                          >
                            {clinic.show_in_directory ? 'Shown' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(clinic.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-2">
          {showCreate ? (
            <ClinicEditor
              clinicId={null}
              onSave={() => {
                setShowCreate(false)
                setSelectedClinicId(null)
                fetchClinics()
              }}
              onCancel={() => setShowCreate(false)}
            />
          ) : selectedClinicId ? (
            <ClinicEditor
              clinicId={selectedClinicId}
              onSave={() => {
                fetchClinics()
              }}
              onCancel={() => setSelectedClinicId(null)}
            />
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a clinic to edit or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


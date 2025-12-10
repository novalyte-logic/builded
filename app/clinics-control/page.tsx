'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Plus,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Search,
  Sparkles,
  TrendingUp,
  Target,
  ExternalLink,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import {
  ClinicDirectoryRecord,
  ClinicDirectoryStatus,
  ClinicLeadStatus,
  ClinicPriceBand,
  ClinicVisibility,
  ClinicMarketIntelResponse,
} from '@/lib/types/clinicDirectory'

type SortField = 'name' | 'location' | 'status' | 'price_band' | 'updated_at'
type SortDirection = 'asc' | 'desc'

const QUICK_ACTIONS = [
  'Where are TRT clinics needing patients?',
  'Where are weight loss clinics needing patients?',
  'Which clinics in Texas should we send TRT leads to?',
  'Which regions are best for IV therapy ads this month?',
]

export default function ClinicsControlPage() {
  const [clinics, setClinics] = useState<ClinicDirectoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClinicDirectoryStatus>('ALL')
  const [priceBandFilter, setPriceBandFilter] = useState<'ALL' | ClinicPriceBand>('ALL')
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | ClinicVisibility>('ALL')
  
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const [pendingEdits, setPendingEdits] = useState<Partial<ClinicDirectoryRecord>>({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [runningRouting, setRunningRouting] = useState(false)

  const [marketQuery, setMarketQuery] = useState('')
  const [scanningMarket, setScanningMarket] = useState(false)
  const [marketIntelResult, setMarketIntelResult] = useState<ClinicMarketIntelResponse | null>(null)
  const [marketIntelError, setMarketIntelError] = useState<string | null>(null)
  const [showMarketIntel, setShowMarketIntel] = useState(true)

  const [createForm, setCreateForm] = useState({
    name: '',
    city: '',
    state: '',
    serviceLines: [] as string[],
    status: 'pending' as ClinicDirectoryStatus,
    priceBand: '$$' as ClinicPriceBand,
    leadStatus: 'pending_verification' as ClinicLeadStatus,
    visibility: 'shown' as ClinicVisibility,
  })

  const deriveRoutingForClinic = (clinic: ClinicDirectoryRecord) => {
    const includes = (key: string) => clinic.serviceLines.some((s) => s.toUpperCase() === key.toUpperCase())
    let emphasis: ClinicDirectoryRecord['marketplaceEmphasis'] = {
      supplements: 'medium',
      diagnostics: 'medium',
      peptides: 'low',
      equipment: 'medium',
      healthTech: 'medium',
    }

    if (includes('PEPTIDES')) {
      emphasis = {
        peptides: 'high',
        diagnostics: 'medium',
        equipment: 'medium',
        supplements: 'medium',
        healthTech: 'medium',
      }
    } else if (includes('TRT')) {
      emphasis = {
        diagnostics: 'high',
        supplements: 'high',
        equipment: 'medium',
        peptides: 'medium',
        healthTech: 'medium',
      }
    } else if (includes('RECOVERY')) {
      emphasis = {
        equipment: 'high',
        peptides: 'medium',
        supplements: 'medium',
        diagnostics: 'medium',
        healthTech: 'medium',
      }
    } else if (includes('GLP1')) {
      emphasis = {
        supplements: 'high',
        diagnostics: 'high',
        peptides: 'medium',
        equipment: 'low',
        healthTech: 'medium',
      }
    }

    let leadPriority: ClinicDirectoryRecord['leadPriority'] = 'backup'
    if (clinic.leadStatus === 'at_capacity') {
      leadPriority = 'overflow'
    } else if ((clinic.revenuePerPatient || 0) >= 500) {
      leadPriority = 'primary'
    }

    return {
      leadPriority,
      focusServiceLines: clinic.serviceLines,
      marketplaceEmphasis: emphasis,
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [searchTerm, statusFilter, priceBandFilter, visibilityFilter])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      params.set('status', statusFilter)
      params.set('priceBand', priceBandFilter)
      params.set('visibility', visibilityFilter)
      const res = await fetch(`/api/clinics-directory?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load clinics')
      setClinics(data.clinics || [])
      if (!selectedClinicId && data.clinics?.length) {
        setSelectedClinicId(data.clinics[0].id)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load clinics')
      setClinics([])
    } finally {
      setLoading(false)
    }
  }

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId) || null

  const filteredAndSortedClinics = useMemo(() => {
    let filtered = [...clinics]
    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(t) ||
          c.city.toLowerCase().includes(t) ||
          c.state.toLowerCase().includes(t) ||
          c.serviceLines.some((s) => s.toLowerCase().includes(t))
      )
    }
    if (statusFilter !== 'ALL') filtered = filtered.filter((c) => c.status === statusFilter)
    if (priceBandFilter !== 'ALL') filtered = filtered.filter((c) => c.priceBand === priceBandFilter)
    if (visibilityFilter !== 'ALL') filtered = filtered.filter((c) => c.visibility === visibilityFilter)

    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'location':
          aVal = `${a.city}${a.state}`.toLowerCase()
          bVal = `${b.city}${b.state}`.toLowerCase()
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'price_band': {
          const map: Record<string, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
          aVal = map[a.priceBand] || 0
          bVal = map[b.priceBand] || 0
          break
        }
        case 'updated_at':
          aVal = new Date(a.updatedAt).getTime()
          bVal = new Date(b.updatedAt).getTime()
          break
        default:
          aVal = 0
          bVal = 0
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [clinics, searchTerm, statusFilter, priceBandFilter, visibilityFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" /> : null

  const handleMarketScan = async (preset?: string) => {
    const question = (preset || marketQuery).trim()
    if (!question) {
      setMarketIntelError('Please enter a question')
      return
    }
    setScanningMarket(true)
    setMarketIntelError(null)
    try {
      const res = await fetch('/api/clinics-directory/market-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setMarketIntelResult(data)
      setMarketQuery(question)
    } catch (e: any) {
      setMarketIntelError(e.message || 'Scan failed')
      setMarketIntelResult(null)
    } finally {
      setScanningMarket(false)
    }
  }

  const handleSaveEdits = async () => {
    if (!selectedClinic) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/clinics-directory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedClinic.id, updates: pendingEdits }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setPendingEdits({})
      setSaveMessage('Saved')
      await fetchClinics()
    } catch (e: any) {
      setSaveMessage(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleRunTxRouting = async () => {
    if (!selectedClinic) return
    setRunningRouting(true)
    setSaveMessage(null)
    try {
      const updates = deriveRoutingForClinic(selectedClinic)
      const res = await fetch('/api/clinics-directory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedClinic.id, updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to run routing')
      setPendingEdits({})
      setSaveMessage('Routing applied')
      await fetchClinics()
    } catch (e: any) {
      setSaveMessage(e.message || 'Failed to run routing')
    } finally {
      setRunningRouting(false)
    }
  }

  const handleCreate = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)
      const res = await fetch('/api/clinics-directory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setShowCreate(false)
      await fetchClinics()
      setSelectedClinicId(data.clinic?.id || null)
    } catch (e: any) {
      setSaveMessage(e.message || 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full bg-dark-bg">
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

        {selectedClinic && (
          <div className="mt-4 bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-gray-300">
                  Open Market Intel for {selectedClinic.name} ({selectedClinic.city}, {selectedClinic.state})
                </p>
              </div>
              <Link
                href={`/admin/market-intelligence?clinic=${encodeURIComponent(selectedClinic.name)}&region=${encodeURIComponent(`${selectedClinic.city}, ${selectedClinic.state}`)}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Open Market Intel
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">You are editing LIVE production data</p>
            <p className="text-xs text-gray-400 mt-1">
              Changes sync immediately to app.novalyte.io. All edits are logged with audit trail.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-dark-surface border border-dark-border rounded-lg">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClinicDirectoryStatus | 'ALL')}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={priceBandFilter}
                  onChange={(e) => setPriceBandFilter(e.target.value as ClinicPriceBand | 'ALL')}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Price Bands</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as ClinicVisibility | 'ALL')}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Visibility</option>
                  <option value="shown">Shown</option>
                  <option value="hidden">Hidden</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                    setPriceBandFilter('ALL')
                    setVisibilityFilter('ALL')
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors text-left"
                >
                  Reset Filters
                </button>
              </div>
              {error && (
                <div className="px-3 py-2 text-sm text-status-offline bg-status-offline/10 border border-status-offline/30 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-1">
                        Clinic Name
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('location')} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-1">
                        Location
                        <SortIcon field="location" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Service Lines</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Lead Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Focus</th>
                    <th onClick={() => handleSort('status')} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-1">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('price_band')} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-1">
                        Price
                        <SortIcon field="price_band" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Lead Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Visibility</th>
                    <th onClick={() => handleSort('updated_at')} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center gap-1">
                        Updated
                        <SortIcon field="updated_at" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {loading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx}>
                          <td colSpan={8} className="px-4 py-4">
                            <div className="h-4 bg-dark-border/60 rounded animate-pulse" />
                      </td>
                    </tr>
                      ))
                    : filteredAndSortedClinics.length === 0
                    ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No clinics found
                      </td>
                    </tr>
                      )
                    : filteredAndSortedClinics.map((clinic) => (
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
                              {clinic.isFeatured && <span className="text-xs text-primary">★</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                            {clinic.city}, {clinic.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <div className="flex flex-wrap gap-1">
                              {clinic.serviceLines.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400">
                                  {s}
                              </span>
                            ))}
                              {clinic.serviceLines.length > 3 && (
                                <span className="text-xs text-gray-500">+{clinic.serviceLines.length - 3}</span>
                            )}
                          </div>
                        </td>
                          <td className="px-4 py-3 text-sm">
                            {clinic.leadPriority ? (
                              <span
                                className={clsx(
                                  'px-2 py-1 rounded-full text-xs font-medium border',
                                  clinic.leadPriority === 'primary' && 'bg-status-live/10 text-status-live border-status-live/30',
                                  clinic.leadPriority === 'backup' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
                                  clinic.leadPriority === 'overflow' && 'bg-status-offline/10 text-status-offline border-status-offline/30'
                                )}
                              >
                                {clinic.leadPriority}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            <div className="flex flex-wrap gap-1">
                              {(clinic.focusServiceLines || clinic.serviceLines).slice(0, 2).map((s) => (
                                <span key={s} className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400">
                                  {s}
                                </span>
                              ))}
                              {clinic.focusServiceLines && clinic.focusServiceLines.length > 2 && (
                                <span className="text-xs text-gray-500">+{clinic.focusServiceLines.length - 2}</span>
                              )}
                              {clinic.state === 'TX' && clinic.marketplaceEmphasis && (
                                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/30">
                                  TX Routing Active
                                </span>
                              )}
                            </div>
                          </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-medium',
                                clinic.status === 'verified' && 'bg-status-live/10 text-status-live',
                                clinic.status === 'pending' && 'bg-status-degraded/10 text-status-degraded',
                                clinic.status === 'rejected' && 'bg-status-offline/10 text-status-offline'
                              )}
                            >
                              {clinic.status}
                          </span>
                        </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{clinic.priceBand}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'text-xs',
                                clinic.leadStatus === 'actively_accepting' && 'text-status-live',
                                clinic.leadStatus === 'at_capacity' && 'text-status-degraded',
                                clinic.leadStatus === 'paused' && 'text-status-offline',
                                clinic.leadStatus === 'pending_verification' && 'text-gray-500'
                              )}
                            >
                              {clinic.leadStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs',
                                clinic.visibility === 'shown'
                                ? 'bg-status-live/10 text-status-live'
                                : 'bg-gray-500/10 text-gray-500'
                            )}
                          >
                              {clinic.visibility === 'shown' ? 'Shown' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(clinic.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!showCreate && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowMarketIntel(true)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  showMarketIntel ? 'bg-primary text-white' : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Market Intel
                </div>
              </button>
              {selectedClinicId && (
                <button
                  onClick={() => setShowMarketIntel(false)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    !showMarketIntel ? 'bg-primary text-white' : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Edit Clinic
                  </div>
                </button>
              )}
            </div>
          )}

          {showMarketIntel && !showCreate ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg">
              <div className="p-6 border-b border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-white">Clinic Market Intel</h2>
                </div>
                <p className="text-sm text-gray-400">Ask the market, not a spreadsheet.</p>
              </div>

              <div className="p-6 border-b border-dark-border">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={marketQuery}
                    onChange={(e) => setMarketQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMarketScan()}
                    placeholder="Where are weight loss clinics needing patients?"
                    className="flex-1 bg-dark-accent border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                  />
                  <button
                    onClick={() => handleMarketScan()}
                    disabled={scanningMarket}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scanningMarket ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Scan
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleMarketScan(action)}
                      className="px-3 py-1.5 bg-dark-accent border border-dark-border rounded-full text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {marketIntelError && (
                  <div className="p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
                    <p className="text-sm text-status-offline">{marketIntelError}</p>
                  </div>
                )}

                {!marketIntelResult && !scanningMarket && !marketIntelError && (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Select a clinic or ask a question</h3>
                    <p className="text-sm text-gray-400">
                      Get AI-powered market intelligence to see demand, target clinics, and recommended moves.
                    </p>
                  </div>
                )}

                {scanningMarket && (
                  <div className="space-y-4">
                    <div className="bg-dark-accent rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="bg-dark-accent rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                )}

                {marketIntelResult && (
                  <>
                    <div className="bg-gradient-to-r from-primary/10 to-purple/10 border border-primary/30 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-white">AI Market Briefing</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 italic">"{marketIntelResult.query}"</p>
                      <div className="space-y-3">
                        {marketIntelResult.insights.map((insight) => (
                          <div key={insight.id} className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-300 mb-2">{insight.summary}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                              {insight.regions?.map((r) => (
                                <span key={r} className="px-2 py-1 bg-dark-accent rounded border border-dark-border">
                                  {r}
                                </span>
                              ))}
                              {insight.treatments?.map((t) => (
                                <span key={t} className="px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                                  {t}
                          </span>
                              ))}
                              {insight.confidence !== undefined && (
                                <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/30">
                                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                    </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-dark-accent border border-dark-border rounded-lg">
                      <Link
                        href={`/admin/market-intelligence?q=${encodeURIComponent(marketQuery)}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Market Intelligence Console
                      </Link>
                    </div>
                  </>
                )}
              </div>
                    </div>
          ) : showCreate ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Clinic
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <input
                  placeholder="Clinic Name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                />
                <input
                  placeholder="City"
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                />
                <input
                  placeholder="State (e.g. TX)"
                  value={createForm.state}
                  onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                />
                <input
                  placeholder="Service lines (comma separated)"
                  value={createForm.serviceLines.join(', ')}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      serviceLines: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                />
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as ClinicDirectoryStatus })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={createForm.priceBand}
                  onChange={(e) => setCreateForm({ ...createForm, priceBand: e.target.value as ClinicPriceBand })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </select>
                <select
                  value={createForm.leadStatus}
                  onChange={(e) => setCreateForm({ ...createForm, leadStatus: e.target.value as ClinicLeadStatus })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending_verification">Pending verification</option>
                  <option value="actively_accepting">Actively accepting</option>
                  <option value="at_capacity">At capacity</option>
                  <option value="paused">Paused</option>
                </select>
                <select
                  value={createForm.visibility}
                  onChange={(e) => setCreateForm({ ...createForm, visibility: e.target.value as ClinicVisibility })}
                  className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                >
                  <option value="shown">Shown</option>
                  <option value="hidden">Hidden</option>
                </select>
                  </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Clinic'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                {saveMessage && <span className="text-xs text-status-offline">{saveMessage}</span>}
                        </div>
                      </div>
          ) : selectedClinic ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedClinic.name}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedClinic.city}, {selectedClinic.state}
                  </p>
                      </div>
                {saving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                            </div>
              {saveMessage && <div className="text-xs text-status-offline">{saveMessage}</div>}

              {/* Routing Map Card */}
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Routing Map · Clinic ↔ Marketplace</h4>
                    <p className="text-xs text-gray-500">State-aware routing powered by clinic_marketplace_link_v1</p>
                  </div>
                  {runningRouting && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                  <div>
                    <p className="text-gray-500 mb-1">State / Rev per Patient</p>
                    <p>
                      {selectedClinic.state || '—'} ·{' '}
                      {selectedClinic.revenuePerPatient ? `$${selectedClinic.revenuePerPatient}` : 'uses TX defaults'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Lead Routing Priority</p>
                    <p className="font-semibold text-white capitalize">{selectedClinic.leadPriority || 'not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Focus Service Lines</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedClinic.focusServiceLines || selectedClinic.serviceLines).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-dark-accent border border-dark-border rounded text-[11px] text-gray-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Marketplace Emphasis</p>
                    <div className="space-y-1">
                      {selectedClinic.marketplaceEmphasis ? (
                        Object.entries(selectedClinic.marketplaceEmphasis).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-300 capitalize">{k}</span>
                            <span className="text-primary font-semibold capitalize">{v}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[11px]">Not yet applied</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleRunTxRouting}
                    disabled={runningRouting}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    Run TX Routing Map
                  </button>
                  <Link
                    href={`/marketplace?state=TX&clinicId=${selectedClinic.id}`}
                    className="px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
                  >
                    Open Marketplace View
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <select
                    value={(pendingEdits.status as ClinicDirectoryStatus) || selectedClinic.status}
                    onChange={(e) => setPendingEdits({ ...pendingEdits, status: e.target.value as ClinicDirectoryStatus })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                                  </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price Band</p>
                  <select
                    value={(pendingEdits.priceBand as ClinicPriceBand) || selectedClinic.priceBand}
                    onChange={(e) => setPendingEdits({ ...pendingEdits, priceBand: e.target.value as ClinicPriceBand })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
                  </select>
                                </div>
                                <div>
                  <p className="text-xs text-gray-500 mb-1">Lead Status</p>
                  <select
                    value={(pendingEdits.leadStatus as ClinicLeadStatus) || selectedClinic.leadStatus}
                    onChange={(e) => setPendingEdits({ ...pendingEdits, leadStatus: e.target.value as ClinicLeadStatus })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value="actively_accepting">Actively accepting</option>
                    <option value="at_capacity">At capacity</option>
                    <option value="paused">Paused</option>
                    <option value="pending_verification">Pending verification</option>
                  </select>
                                  </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Visibility</p>
                  <select
                    value={(pendingEdits.visibility as ClinicVisibility) || selectedClinic.visibility}
                    onChange={(e) => setPendingEdits({ ...pendingEdits, visibility: e.target.value as ClinicVisibility })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value="shown">Shown</option>
                    <option value="hidden">Hidden</option>
                  </select>
                                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Service Lines</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.serviceLines.map((s) => (
                      <span key={s} className="px-2 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300">
                        {s}
                      </span>
                    ))}
                              </div>
                          </div>
                          </div>
              <div className="flex gap-3">
                            <button
                  disabled={saving}
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                            >
                  Save Changes
                            </button>
                            <button
                  onClick={() => setSelectedClinicId(null)}
                  className="px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white"
                >
                  Close
                            </button>
                          </div>
                            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


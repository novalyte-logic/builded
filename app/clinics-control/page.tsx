'use client'

import { useState, useEffect, useMemo } from 'react'
import { Building2, Plus, AlertTriangle, ChevronUp, ChevronDown, Search, Sparkles, TrendingUp, Target, ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import ClinicEditor from '@/components/clinics/ClinicEditor'
import { ClinicProfile } from '@/lib/types/clinic'

type SortField = 'name' | 'location' | 'status' | 'price_band' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface RegionDemand {
  region: string
  serviceLine: string
  demandIndex: number
  trend: 'Rising' | 'Stable' | 'Falling'
  sampleSize?: number
}

interface TargetClinic {
  clinic_id: string
  name: string
  city: string
  state: string
  serviceLines: string[]
  why_target: string
}

interface MarketIntelResult {
  interpretedQuestion: string
  topRegions: Array<{ region: string; reason: string; suggestedBudgetShare: number }>
  targetClinics: TargetClinic[]
  primaryMove: string
  secondaryMoves: string[]
  regionDemand: RegionDemand[]
  trendsData?: {
    serviceLine: string
    region: string
    timeRange: string
    trendDirection: 'RISING' | 'STABLE' | 'FALLING'
    trendStrength: number
    topRegions: Array<{ region: string; interestIndex: number }>
    risingQueries: Array<{ query: string; growthScore: number }>
  }
  trendsError?: string
  trendSummary?: string
  trendConfidence?: number
  firstMove?: string
  firstMoveReason?: string
}

const QUICK_ACTIONS = [
  "Where are TRT clinics needing patients?",
  "Where are weight loss clinics needing patients?",
  "Which clinics in Texas should we send TRT leads to?",
  "Which regions are best for IV therapy ads this month?"
]

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
  
  // Market Intel state
  const [showMarketIntel, setShowMarketIntel] = useState(true)
  const [marketQuery, setMarketQuery] = useState('')
  const [scanningMarket, setScanningMarket] = useState(false)
  const [marketIntelResult, setMarketIntelResult] = useState<MarketIntelResult | null>(null)
  const [marketIntelError, setMarketIntelError] = useState<string | null>(null)

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

  // Get selected clinic object
  const selectedClinic = clinics.find((c) => c.id === selectedClinicId) || null

  // Handle market intelligence scan
  const handleMarketScan = async (questionOverride?: string) => {
    let question = questionOverride || marketQuery.trim()
    
    // Auto-generate question if none provided and clinic is selected
    if (!question && selectedClinic) {
      const serviceText = selectedClinic.specialties.slice(0, 2).join(' and ')
      question = `Does ${selectedClinic.city}, ${selectedClinic.state} need more ${serviceText} ads right now for ${selectedClinic.name}?`
      setMarketQuery(question)
    }
    
    if (!question) {
      setMarketIntelError('Please enter a question or select a clinic')
      return
    }

    setScanningMarket(true)
    setMarketIntelError(null)

    try {
      // Infer service line and region from question and selected clinic
      const questionLower = question.toLowerCase()
      let serviceLine = ''
      let region = ''
      
      // Infer service line
      if (questionLower.includes('trt') || questionLower.includes('testosterone')) {
        serviceLine = 'TRT'
      } else if (questionLower.includes('weight loss') || questionLower.includes('glp')) {
        serviceLine = 'WEIGHT_LOSS'
      } else if (questionLower.includes('iv therapy') || questionLower.includes('iv ')) {
        serviceLine = 'IV_THERAPY'
      } else if (selectedClinic) {
        // Infer from selected clinic's service lines
        if (selectedClinic.specialties.includes('TRT')) serviceLine = 'TRT'
        else if (selectedClinic.specialties.includes('GLP-1')) serviceLine = 'WEIGHT_LOSS'
        else if (selectedClinic.specialties.includes('IV Therapy')) serviceLine = 'IV_THERAPY'
      }
      
      // Infer region
      if (questionLower.includes('texas') || questionLower.includes(' tx')) {
        region = 'TX'
      } else if (questionLower.includes('florida') || questionLower.includes(' fl')) {
        region = 'FL'
      } else if (questionLower.includes('california') || questionLower.includes(' ca')) {
        region = 'CA'
      } else if (selectedClinic && selectedClinic.state) {
        region = selectedClinic.state
      }

      // Call MCP orchestration
      const response = await fetch('/api/admin/mcp/market-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          tool: 'orchestrate',
          params: { serviceLine, region },
        }),
      })

      if (!response.ok) {
        throw new Error('Market intelligence scan failed')
      }

      const data = await response.json()
      
      // Map to result format
      const { regionDemand, clinicMatches, trendsData: trends, trendsError: trendsErr, analysis } = data
      
      const result: MarketIntelResult = {
        interpretedQuestion: analysis.interpretedQuestion,
        topRegions: analysis.topRegions,
        targetClinics: analysis.targetClinics.map((tc: any) => ({
          ...tc,
          city: clinicMatches.find((cm: any) => cm.clinic_id === tc.clinic_id)?.city || '',
          serviceLines: clinicMatches.find((cm: any) => cm.clinic_id === tc.clinic_id)?.service_lines || [],
        })),
        primaryMove: analysis.primaryMove,
        secondaryMoves: analysis.secondaryMoves,
        regionDemand: regionDemand.map((rd: any) => ({
          region: rd.region,
          serviceLine: rd.serviceLine,
          demandIndex: rd.demand_index,
          trend: rd.trend === 'RISING' ? 'Rising' : rd.trend === 'FALLING' ? 'Falling' : 'Stable',
          sampleSize: rd.sample_size,
        })),
        trendsData: trends || undefined,
        trendsError: trendsErr || undefined,
        trendSummary: analysis.trendSummary,
        trendConfidence: analysis.trendConfidence,
        firstMove: analysis.firstMove,
        firstMoveReason: analysis.firstMoveReason,
      }
      
      setMarketIntelResult(result)
    } catch (error) {
      console.error('Market scan error:', error)
      setMarketIntelError('Market scan failed. Try again or refine your question.')
    } finally {
      setScanningMarket(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setMarketQuery(action)
    handleMarketScan(action)
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

        {/* Right: Market Intel / Editor Toggle */}
        <div className="lg:col-span-2">
          {/* Tab Switcher */}
          {!showCreate && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowMarketIntel(true)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  showMarketIntel
                    ? 'bg-primary text-white'
                    : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white'
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
                    !showMarketIntel
                      ? 'bg-primary text-white'
                      : 'bg-dark-surface border border-dark-border text-gray-400 hover:text-white'
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

          {/* Market Intel Panel */}
          {showMarketIntel && !showCreate ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg">
              {/* Header */}
              <div className="p-6 border-b border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-white">Clinic Market Intel</h2>
                </div>
                <p className="text-sm text-gray-400">Ask the market, not a spreadsheet.</p>
                
                {selectedClinic && (
                  <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-xs text-gray-300">
                      <span className="font-semibold text-primary">Selected clinic:</span>{' '}
                      {selectedClinic.name} — Ask: "Does this clinic's region need more ads?"
                    </p>
                  </div>
                )}
              </div>

              {/* Question Bar */}
              <div className="p-6 border-b border-dark-border">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={marketQuery}
                    onChange={(e) => setMarketQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMarketScan()}
                    placeholder="Ask: 'Where are weight loss clinics needing patients?' or 'Which TRT clinics in Texas should we target?'"
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

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="px-3 py-1.5 bg-dark-accent border border-dark-border rounded-full text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {marketIntelError && (
                  <div className="p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
                    <p className="text-sm text-status-offline">{marketIntelError}</p>
                  </div>
                )}

                {!marketIntelResult && !scanningMarket && !marketIntelError && (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Select a clinic or ask a question
                    </h3>
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
                    {/* AI Market Briefing */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-white">AI Market Briefing</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 italic">"{marketIntelResult.interpretedQuestion}"</p>
                      <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-white leading-relaxed">
                          {marketIntelResult.primaryMove}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {marketIntelResult.secondaryMoves.map((move, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                            <span>{move}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Local Trends Signal */}
                    {marketIntelResult.trendsError && !marketIntelResult.trendsData && (
                      <div className="bg-dark-accent border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs text-gray-300">
                            Trends signal unavailable. BigQuery demand + clinics still loaded.
                          </p>
                        </div>
                      </div>
                    )}

                    {marketIntelResult.trendsData && (
                      <div className="bg-dark-accent border border-dark-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-semibold text-white">Local Trends Signal</h3>
                          </div>
                          <span
                            className={clsx(
                              'px-2.5 py-1 rounded-full text-xs font-medium',
                              marketIntelResult.trendsData.trendDirection === 'RISING' && 'bg-status-live/10 text-status-live',
                              marketIntelResult.trendsData.trendDirection === 'STABLE' && 'bg-gray-500/10 text-gray-400',
                              marketIntelResult.trendsData.trendDirection === 'FALLING' && 'bg-status-offline/10 text-status-offline'
                            )}
                          >
                            {marketIntelResult.trendsData.trendDirection}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-3">
                          Service Line: <span className="text-white font-medium">{marketIntelResult.trendsData.serviceLine}</span> in{' '}
                          <span className="text-white font-medium">{marketIntelResult.trendsData.region}</span>
                        </p>

                        {marketIntelResult.trendsData.risingQueries.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                              Top Rising Queries
                            </h4>
                            <div className="space-y-1">
                              {marketIntelResult.trendsData.risingQueries.slice(0, 3).map((q, idx) => (
                                <div key={idx} className="text-xs text-gray-300 flex items-start gap-1">
                                  <span className="text-primary">↗</span>
                                  <span>{q.query}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {marketIntelResult.trendSummary && (
                          <div className="pt-3 border-t border-dark-border">
                            <p className="text-xs text-gray-300 mb-2">
                              <span className="font-semibold text-gray-400">AI view:</span>{' '}
                              {marketIntelResult.trendSummary.slice(0, 150)}{marketIntelResult.trendSummary.length > 150 ? '...' : ''}
                            </p>
                          </div>
                        )}

                        {marketIntelResult.firstMove && (
                          <div className="mt-3 pt-3 border-t border-dark-border bg-primary/5 -m-5 mt-3 p-3 rounded-b-lg">
                            <p className="text-xs text-gray-400 mb-1">
                              <span className="font-semibold text-primary">First move:</span>
                            </p>
                            <p className="text-xs text-white leading-relaxed">
                              {marketIntelResult.firstMove}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Region Demand Snapshot */}
                    <div className="bg-dark-accent border border-dark-border rounded-lg">
                      <div className="p-4 border-b border-dark-border">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-white">Region Demand Snapshot</h3>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-dark-surface border-b border-dark-border">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Region</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Service</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Demand</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Trend</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dark-border">
                            {marketIntelResult.regionDemand.slice(0, 8).map((rd, idx) => {
                              const isTrendAligned = marketIntelResult.trendsData?.topRegions.some(
                                (tr) => tr.region === rd.region || tr.region.includes(rd.region)
                              )
                              const isSelectedRegion = selectedClinic?.state === rd.region
                              
                              return (
                              <tr
                                key={idx}
                                className={clsx(
                                  'hover:bg-dark-hover transition-colors',
                                  isSelectedRegion && 'bg-primary/10 border-l-4 border-primary'
                                )}
                              >
                                <td className="px-4 py-3 text-sm text-white font-medium">
                                  <div className="flex items-center gap-2">
                                    {rd.region}
                                    {isTrendAligned && (
                                      <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-xs text-purple-300">
                                        Trend-aligned
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{rd.serviceLine}</td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-dark-surface rounded-full h-2 max-w-[60px]">
                                      <div
                                        className={clsx(
                                          'h-2 rounded-full',
                                          rd.demandIndex >= 85 ? 'bg-status-live' : 
                                          rd.demandIndex >= 70 ? 'bg-status-degraded' : 'bg-gray-500'
                                        )}
                                        style={{ width: `${rd.demandIndex}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-white font-medium">{rd.demandIndex}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={clsx(
                                      'px-2 py-1 rounded text-xs font-medium',
                                      rd.trend === 'Rising' && 'bg-status-live/10 text-status-live',
                                      rd.trend === 'Stable' && 'bg-gray-500/10 text-gray-400',
                                      rd.trend === 'Falling' && 'bg-status-offline/10 text-status-offline'
                                    )}
                                  >
                                    {rd.trend}
                                  </span>
                                </td>
                              </tr>
                            )
                            }))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Target Clinics */}
                    <div className="bg-dark-accent border border-dark-border rounded-lg">
                      <div className="p-4 border-b border-dark-border">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-white">Target Clinics</h3>
                        </div>
                      </div>
                      <div className="divide-y divide-dark-border max-h-[400px] overflow-y-auto">
                        {marketIntelResult.targetClinics.map((tc, idx) => {
                          const isSelected = selectedClinic?.id === tc.clinic_id
                          return (
                            <div
                              key={idx}
                              className={clsx(
                                'p-4 hover:bg-dark-hover transition-colors',
                                isSelected && 'bg-primary/10 border-l-4 border-primary'
                              )}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-white">
                                    {tc.name}
                                    {isSelected && (
                                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 border border-primary/40 rounded-full text-primary">
                                        Your selected clinic
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {tc.city}, {tc.state}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {tc.serviceLines.map((service, sidx) => (
                                  <span
                                    key={sidx}
                                    className="text-xs px-1.5 py-0.5 bg-dark-surface rounded text-gray-400"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-primary">→ {tc.why_target}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Deep Link */}
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
          ) : null}
        </div>
      </div>
    </div>
  )
}


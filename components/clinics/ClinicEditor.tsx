'use client'

import { useEffect, useState } from 'react'
import { X, Save, History, Copy, Eye, ExternalLink, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { ClinicProfile } from '@/lib/types/clinic'
import VersionHistoryModal from '../VersionHistoryModal'
import { VersionHistory } from '@/lib/types/audit'

interface AIClinicInsights {
  fitSummary: string
  idealPatientProfile: string[]
  riskMismatchSignals: string[]
  seoSuggestions: string[]
  routingHint: string
}

interface ClinicEditorProps {
  clinicId: string | null
  onSave: () => void
  onCancel: () => void
}

type TabType = 'profile' | 'services' | 'capacity' | 'seo' | 'routing'

interface ServiceLineDetails {
  name: string
  enabled: boolean
  priceRange?: string
  consultRequired: boolean
  telehealthSupported: boolean
}

interface RoutingConfig {
  mode: 'send_all' | 'high_ltv_only' | 'manual_approval'
  destination: string
  integrationType: 'hubspot' | 'salesforce' | 'webhook' | 'none'
  sendFullAssessment: boolean
  sendMinimalOnly: boolean
  enableMarketplaceOptimization: boolean
}

export default function ClinicEditor({ clinicId, onSave, onCancel }: ClinicEditorProps) {
  const [clinic, setClinic] = useState<ClinicProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [formData, setFormData] = useState<Partial<ClinicProfile>>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  
  // Extended form fields
  const [serviceLines, setServiceLines] = useState<ServiceLineDetails[]>([
    { name: 'TRT', enabled: false, priceRange: '', consultRequired: true, telehealthSupported: false },
    { name: 'GLP-1', enabled: false, priceRange: '', consultRequired: true, telehealthSupported: false },
    { name: 'Peptides', enabled: false, priceRange: '', consultRequired: true, telehealthSupported: false },
    { name: 'IV Therapy', enabled: false, priceRange: '', consultRequired: false, telehealthSupported: false },
    { name: 'Recovery', enabled: false, priceRange: '', consultRequired: false, telehealthSupported: false },
    { name: 'Longevity', enabled: false, priceRange: '', consultRequired: true, telehealthSupported: false },
    { name: 'General', enabled: false, priceRange: '', consultRequired: false, telehealthSupported: false },
  ])
  const [offersFreeConsult, setOffersFreeConsult] = useState(false)
  const [acceptingPatients, setAcceptingPatients] = useState<'yes' | 'no' | 'limited'>('yes')
  const [leadCapacity, setLeadCapacity] = useState<number>(50)
  const [preferredPatients, setPreferredPatients] = useState('')
  const [patientExclusions, setPatientExclusions] = useState('')
  const [regionsCovered, setRegionsCovered] = useState('')
  const [intakePreferences, setIntakePreferences] = useState('')
  const [routingConfig, setRoutingConfig] = useState<RoutingConfig>({
    mode: 'send_all',
    destination: '',
    integrationType: 'none',
    sendFullAssessment: true,
    sendMinimalOnly: false,
    enableMarketplaceOptimization: true,
  })
  const [showAIHelper, setShowAIHelper] = useState(true)

  useEffect(() => {
    if (clinicId) {
      fetchClinic()
    } else {
      // Initialize new clinic
      setFormData({
        verification_status: 'pending',
        show_in_directory: true,
        is_featured: false,
        price_band: '$$',
        specialties: [],
        programs: [],
        tags: [],
        gallery_image_urls: [],
        city: '',
        country: 'USA',
      })
    }
  }, [clinicId])
  
  useEffect(() => {
    // Sync specialties to service lines when clinic is loaded
    if (clinic) {
      setServiceLines((prev) =>
        prev.map((sl) => ({
          ...sl,
          enabled: clinic.specialties.includes(sl.name),
        }))
      )
    }
  }, [clinic])

  const fetchClinic = async () => {
    if (!clinicId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/clinics/${clinicId}`)
      if (!response.ok) throw new Error('Failed to fetch clinic')
      const data = await response.json()
      setClinic(data.clinic)
      setFormData(data.clinic)
    } catch (error) {
      console.error('Error fetching clinic:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate AI insights based on clinic data (rule-based for now, can be replaced with Vertex AI)
  const generateAIInsights = (): AIClinicInsights => {
    const services = serviceLines.filter((s) => s.enabled).map((s) => s.name)
    const priceBand = formData.price_band || '$$'
    const city = formData.city || 'Unknown'
    const state = formData.state || ''
    const location = state ? `${city}, ${state}` : city
    const hasGLP1 = services.includes('GLP-1')
    const hasTRT = services.includes('TRT')
    const hasPeptides = services.includes('Peptides')
    const hasIV = services.includes('IV Therapy')
    
    // Determine price descriptor
    const priceDescriptor = {
      '$': 'budget-conscious',
      '$$': 'value-focused',
      '$$$': 'premium',
      '$$$$': 'luxury-tier'
    }[priceBand] || 'standard'
    
    // Determine service focus
    let serviceFocus = 'wellness'
    if (hasTRT && hasGLP1) {
      serviceFocus = 'comprehensive hormone optimization and metabolic health'
    } else if (hasTRT && hasPeptides) {
      serviceFocus = 'performance optimization and TRT'
    } else if (hasTRT) {
      serviceFocus = 'testosterone replacement therapy'
    } else if (hasGLP1) {
      serviceFocus = 'weight management'
    }
    
    // Generate fit summary
    const ageRange = priceBand === '$$$$' ? '35–60' : priceBand === '$$$' ? '30–55' : priceBand === '$$' ? '25–50' : '25–45'
    const patientType = priceBand === '$$$$' ? 'executives and high-net-worth individuals' : 
                        priceBand === '$$$' ? 'professionals and performance-focused men' :
                        priceBand === '$$' ? 'working professionals' : 'budget-conscious patients'
    
    const fitSummary = `Best fit: ${patientType} aged ${ageRange} in ${location} seeking ${serviceFocus}. ${
      acceptingPatients === 'yes' ? 'Actively accepting new patients.' : 
      acceptingPatients === 'limited' ? 'Limited availability—send only pre-qualified leads.' :
      'Currently at capacity—routing paused.'
    }`
    
    // Ideal patient profile
    const idealPatientProfile = [
      `Age: ${ageRange}`,
      `Income: ${priceBand === '$$$$' ? '$250K+' : priceBand === '$$$' ? '$150K–$300K' : priceBand === '$$' ? '$75K–$150K' : '$50K–$100K'} (${priceDescriptor})`,
      `Goals: ${hasTRT ? 'Energy, vitality, muscle retention' : ''}${hasGLP1 ? ', weight loss, metabolic health' : ''}${hasPeptides ? ', performance enhancement' : ''}${hasIV ? ', recovery and hydration' : ''}`.trim(),
      `Modality: ${serviceLines.some(s => s.enabled && s.telehealthSupported) ? 'Open to telehealth' : 'Prefers in-person care'}`
    ]
    
    // Risk/mismatch signals
    const riskMismatchSignals = []
    if (priceBand === '$$$$') {
      riskMismatchSignals.push('Avoid price-sensitive or budget-conscious leads')
      riskMismatchSignals.push('Not ideal for patients seeking basic care only')
    } else if (priceBand === '$') {
      riskMismatchSignals.push('Not suitable for patients expecting concierge-level service')
    }
    
    if (!hasGLP1) {
      riskMismatchSignals.push('Do not route GLP-1 / weight loss primary leads')
    }
    if (!hasPeptides) {
      riskMismatchSignals.push('Avoid routing performance athletes seeking peptide protocols')
    }
    if (acceptingPatients === 'no') {
      riskMismatchSignals.push('⚠️ Currently at capacity—do not route new leads')
    } else if (acceptingPatients === 'limited') {
      riskMismatchSignals.push('Send only high-intent, pre-qualified leads')
    }
    if (patientExclusions) {
      riskMismatchSignals.push(`Exclusions: ${patientExclusions}`)
    }
    
    // SEO suggestions
    const seoSuggestions = []
    if (hasTRT) {
      seoSuggestions.push(`"${location} TRT clinic for ${patientType}"`)
      seoSuggestions.push(`"Testosterone therapy in ${state || city}"`)
    }
    if (hasGLP1) {
      seoSuggestions.push(`"GLP-1 weight loss program ${location}"`)
    }
    if (priceBand === '$$$$') {
      seoSuggestions.push(`"Concierge men's health ${location}"`)
    }
    if (offersFreeConsult) {
      seoSuggestions.push(`"Free TRT consultation ${state || city}"`)
    }
    seoSuggestions.push(`"Same-week labs and consults in ${state || location}"`)
    
    // Routing hint
    let routingHint = ''
    if (acceptingPatients === 'yes' && (priceBand === '$$$' || priceBand === '$$$$')) {
      routingHint = `Use as Tier 1 destination for high-intent ${serviceFocus} leads in ${state || location}.`
    } else if (acceptingPatients === 'yes') {
      routingHint = `Use as primary destination for qualified ${serviceFocus} leads in ${state || location}.`
    } else if (acceptingPatients === 'limited') {
      routingHint = `Use as Tier 2 destination—send only high-LTV, pre-qualified leads when available.`
    } else {
      routingHint = `Currently at capacity. Route overflow to alternative clinics in ${state || location}.`
    }
    
    return {
      fitSummary,
      idealPatientProfile,
      riskMismatchSignals,
      seoSuggestions,
      routingHint
    }
  }
  
  const aiInsights = generateAIInsights()

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Compile enabled service lines
      const enabledServices = serviceLines.filter((sl) => sl.enabled).map((sl) => sl.name)
      
      const url = clinicId ? `/api/admin/clinics/${clinicId}` : '/api/admin/clinics'
      const method = clinicId ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        specialties: enabledServices,
        // Store extended data in notes_internal for now (until DB schema is updated)
        notes_internal: JSON.stringify({
          legacy_notes: formData.notes_internal,
          accepting_patients: acceptingPatients,
          lead_capacity: leadCapacity,
          preferred_patients: preferredPatients,
          patient_exclusions: patientExclusions,
          regions_covered: regionsCovered,
          intake_preferences: intakePreferences,
          service_lines_config: serviceLines,
          offers_free_consult: offersFreeConsult,
          routing_config: routingConfig,
        }),
        create_version_snapshot: true,
        version_label: 'Manual update',
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save clinic')

      onSave()
    } catch (error) {
      console.error('Error saving clinic:', error)
      alert('Failed to save clinic. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRevert = async (version: VersionHistory) => {
    try {
      // Restore from version snapshot
      const snapshot = version.snapshot_json as ClinicProfile
      setFormData(snapshot)

      // Save the reverted version
      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...snapshot,
          create_version_snapshot: true,
          version_label: `Reverted to version ${version.version_number}`,
          reason: `Reverted to version ${version.version_number}${version.label ? ` (${version.label})` : ''}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to revert clinic')

      await fetchClinic()
      alert(`Clinic reverted to version ${version.version_number}`)
    } catch (error) {
      console.error('Error reverting clinic:', error)
      alert('Failed to revert clinic. Please try again.')
    }
  }

  const handleClone = async () => {
    if (!clinic) return

    try {
      const cloned = {
        ...clinic,
        name: `${clinic.name} (Copy)`,
        slug: `${clinic.slug}-copy`,
        id: undefined,
      }

      const response = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloned),
      })

      if (!response.ok) throw new Error('Failed to clone clinic')

      alert('Clinic cloned successfully!')
      onSave() // Refresh list
    } catch (error) {
      console.error('Error cloning clinic:', error)
      alert('Failed to clone clinic. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading clinic...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {clinicId ? `Edit: ${clinic?.name || 'Clinic'}` : 'Create New Clinic'}
            </h2>
            {clinic && (
              <p className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(clinic.updated_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Helper Block */}
        {clinicId && (
          <div className="mt-4">
            <button
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-white">AI Clinic Profile</span>
                <span className="text-xs text-gray-400">
                  Smart routing & patient fit analysis
                </span>
              </div>
              {showAIHelper ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showAIHelper && (
              <div className="mt-3 bg-dark-accent/50 border border-dark-border rounded-lg p-5 space-y-5">
                {/* Fit Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Fit Summary
                    </h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {aiInsights.fitSummary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {/* Ideal Patient Profile */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-status-live"></div>
                      <h4 className="text-xs font-semibold text-status-live uppercase tracking-wide">
                        Ideal Patient Profile
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {aiInsights.idealPatientProfile.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-status-live mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk/Mismatch Signals */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-status-degraded"></div>
                      <h4 className="text-xs font-semibold text-status-degraded uppercase tracking-wide">
                        Risk / Mismatch Signals
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {aiInsights.riskMismatchSignals.length > 0 ? (
                        aiInsights.riskMismatchSignals.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-status-degraded mt-0.5">⚠</span>
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-gray-500 italic">No major risk signals detected</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* SEO Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                      SEO Suggestions
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.seoSuggestions.map((suggestion, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300"
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Routing Hint */}
                <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Routing Hint
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                    {aiInsights.routingHint}
                  </p>
                </div>

                {/* Footer Note */}
                <div className="pt-3 border-t border-dark-border">
                  <p className="text-xs text-gray-500 italic">
                    AI analysis generated from clinic profile, service lines, capacity, and regional data.
                    Insights update automatically as you edit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border -mb-px mt-4">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'services', label: 'Services & Pricing' },
            { id: 'capacity', label: 'Capacity & Preferences' },
            { id: 'seo', label: 'SEO & Discovery' },
            { id: 'routing', label: 'Routing & Integrations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Clinic Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Brand Name (if different)</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Optional brand name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={formData.booking_url || ''}
                    onChange={(e) => setFormData({ ...formData, booking_url: e.target.value || null })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Primary Contact Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value || null })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="contact@clinic.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, Suite 100"
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value || undefined })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">ZIP</label>
                    <input
                      type="text"
                      placeholder="78701"
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country || 'USA'}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              </div>
            </div>

            {/* Status & Visibility */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status & Visibility</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={formData.verification_status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, verification_status: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price Band</label>
                  <select
                    value={formData.price_band || '$$'}
                    onChange={(e) => setFormData({ ...formData, price_band: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="$">$ - Budget</option>
                    <option value="$$">$$ - Standard</option>
                    <option value="$$$">$$$ - Premium</option>
                    <option value="$$$$">$$$$ - Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Clinic Type</label>
                  <select
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="standalone">Standalone</option>
                    <option value="multi">Multi-location</option>
                    <option value="telehealth">Telehealth-first</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_directory ?? true}
                    onChange={(e) => setFormData({ ...formData, show_in_directory: e.target.checked })}
                    className="w-4 h-4 bg-dark-accent border-dark-border rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">Show in Directory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured ?? false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 bg-dark-accent border-dark-border rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-300">Featured Clinic</span>
                </label>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-300">
                    All changes logged with timestamp + admin
                  </p>
                </div>
                <button
                  onClick={() => setShowVersionHistory(true)}
                  className="text-xs text-primary hover:underline"
                >
                  View Audit Trail
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Services & Pricing */}
        {activeTab === 'services' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Service Lines</h3>
              <div className="space-y-3">
                {serviceLines.map((service, index) => (
                  <div
                    key={service.name}
                    className="bg-dark-accent border border-dark-border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={service.enabled}
                        onChange={(e) => {
                          const updated = [...serviceLines]
                          updated[index].enabled = e.target.checked
                          setServiceLines(updated)
                        }}
                        className="w-4 h-4 bg-dark-surface border-dark-border rounded text-primary focus:ring-primary"
                      />
                      <label className="text-sm font-medium text-white">{service.name}</label>
                    </div>
                    
                    {service.enabled && (
                      <div className="ml-7 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Price Range</label>
                            <input
                              type="text"
                              value={service.priceRange || ''}
                              onChange={(e) => {
                                const updated = [...serviceLines]
                                updated[index].priceRange = e.target.value
                                setServiceLines(updated)
                              }}
                              placeholder="$199-$399/mo"
                              className="w-full bg-dark-surface border border-dark-border rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={service.consultRequired}
                                onChange={(e) => {
                                  const updated = [...serviceLines]
                                  updated[index].consultRequired = e.target.checked
                                  setServiceLines(updated)
                                }}
                                className="w-3.5 h-3.5"
                              />
                              <span className="text-xs text-gray-300">Consult required</span>
                            </label>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={service.telehealthSupported}
                                onChange={(e) => {
                                  const updated = [...serviceLines]
                                  updated[index].telehealthSupported = e.target.checked
                                  setServiceLines(updated)
                                }}
                                className="w-3.5 h-3.5"
                              />
                              <span className="text-xs text-gray-300">Telehealth</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offersFreeConsult}
                  onChange={(e) => setOffersFreeConsult(e.target.checked)}
                  className="w-4 h-4 bg-dark-surface border-dark-border rounded text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-white">Offers free consult?</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Check if this clinic offers free initial consultations
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Capacity & Preferences */}
        {activeTab === 'capacity' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Patient Intake</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Accepting New Patients?</label>
                  <select
                    value={acceptingPatients}
                    onChange={(e) => setAcceptingPatients(e.target.value as any)}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="yes">Yes</option>
                    <option value="limited">Limited</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Daily/Weekly Lead Capacity</label>
                  <input
                    type="number"
                    value={leadCapacity}
                    onChange={(e) => setLeadCapacity(parseInt(e.target.value) || 0)}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Preferred Patient Profiles</label>
              <textarea
                value={preferredPatients}
                onChange={(e) => setPreferredPatients(e.target.value)}
                rows={4}
                placeholder="e.g., Men 30-55, high-performance professionals, prior TRT experience..."
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Patient Exclusions</label>
              <textarea
                value={patientExclusions}
                onChange={(e) => setPatientExclusions(e.target.value)}
                rows={3}
                placeholder="e.g., No patients under 25, no history of cardiovascular issues..."
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Regions Covered (for Telehealth)</label>
              <input
                type="text"
                value={regionsCovered}
                onChange={(e) => setRegionsCovered(e.target.value)}
                placeholder="TX, CA, FL, NY (comma-separated states or 'All USA')"
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Lead Intake Preferences</label>
              <textarea
                value={intakePreferences}
                onChange={(e) => setIntakePreferences(e.target.value)}
                rows={4}
                placeholder="e.g., Evening appointments only, prefer pre-qualified assessments with labs done, same-day consults available..."
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: SEO & Discovery */}
        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Marketplace Listing</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Short Tagline (1-2 sentences)</label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Premier Men's Wellness in Central Texas"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Long Description (SEO-friendly clinic story)</label>
                <textarea
                  value={formData.long_description || ''}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  rows={8}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Detailed clinic description highlighting unique value props, specialties, and what sets this clinic apart..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Featured Services</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bullet Points (comma-separated)</label>
                <textarea
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  rows={4}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Personalized TRT programs, GLP-1 weight management, Concierge service, Same-day labs"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">SEO Optimization</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.seo_title || ''}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value || null })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Best TRT Clinic in Austin TX | Men's Health Center"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Meta Description (150-160 characters)</label>
                <textarea
                  value={formData.seo_meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value || null })}
                  rows={3}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Expert TRT and men's wellness services in Austin, TX. Personalized care, experienced providers, and proven results."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Primary Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="TRT Austin, testosterone therapy Texas, men's health clinic"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">City/Region Targeting Notes</label>
              <textarea
                rows={3}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Target Austin metro area, serve Central Texas, telehealth available statewide"
              />
            </div>

            <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Eye className="w-4 h-4" />
                Preview in Marketplace
              </button>
              <p className="text-xs text-gray-400 mt-1">
                See how this clinic will appear in the public marketplace
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Routing & Integrations */}
        {activeTab === 'routing' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Lead Routing Mode</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="routing_mode"
                    value="send_all"
                    checked={routingConfig.mode === 'send_all'}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, mode: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Send all qualified leads</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Forward every lead that passes basic qualification filters
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="routing_mode"
                    value="high_ltv_only"
                    checked={routingConfig.mode === 'high_ltv_only'}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, mode: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Send only high-LTV leads</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Forward only leads predicted to have high lifetime value
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer bg-dark-accent border border-dark-border rounded-lg p-4 hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="routing_mode"
                    value="manual_approval"
                    checked={routingConfig.mode === 'manual_approval'}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, mode: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Manual approval per lead</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Clinic reviews each lead before accepting
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Destination</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Integration Type</label>
                  <select
                    value={routingConfig.integrationType}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, integrationType: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="none">None / Manual</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="webhook">Generic Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">CRM / Webhook URL</label>
                  <input
                    type="url"
                    value={routingConfig.destination}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, destination: e.target.value })}
                    placeholder="https://api.clinic.com/webhook"
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Options</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer bg-dark-accent border border-dark-border rounded-lg p-4">
                  <input
                    type="checkbox"
                    checked={routingConfig.sendFullAssessment}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, sendFullAssessment: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Send full assessment summary</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Include detailed health questionnaire responses, goals, and AI insights
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer bg-dark-accent border border-dark-border rounded-lg p-4">
                  <input
                    type="checkbox"
                    checked={routingConfig.sendMinimalOnly}
                    onChange={(e) => setRoutingConfig({ ...routingConfig, sendMinimalOnly: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Send only minimal contact info</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Name, email, phone only (for privacy/compliance requirements)
                  </p>
                </div>
                </label>
              </div>
            </div>

                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={routingConfig.enableMarketplaceOptimization}
                  onChange={(e) => setRoutingConfig({ ...routingConfig, enableMarketplaceOptimization: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-white">Enable Ads/Marketplace optimization data</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Share anonymized performance data to improve marketplace ranking and ad targeting
                  </p>
                </div>
              </label>
              </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-dark-border bg-dark-surface">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
              {clinicId && (
              <>
              <button
                onClick={() => setShowVersionHistory(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white hover:border-gray-600 transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                Version History
              </button>
              <button
                onClick={handleClone}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white hover:border-gray-600 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                  Clone Clinic
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
              className="px-5 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          </div>
        </div>
        
        {/* Warning */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Changes sync to LIVE production immediately. All edits are logged with audit trail.</span>
        </div>
      </div>

      {/* Version History Modal */}
      {clinicId && (
        <VersionHistoryModal
          entityType="ClinicProfile"
          entityId={clinicId}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRevert={handleRevert}
        />
      )}
    </div>
  )
}


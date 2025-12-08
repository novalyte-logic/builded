'use client'

import { useEffect, useState } from 'react'
import { X, Save, History, Copy, Eye, TrendingUp } from 'lucide-react'
import { ClinicProfile } from '@/lib/types/clinic'
import Explainer from '../Explainer'
import VersionHistoryModal from '../VersionHistoryModal'
import { VersionHistory } from '@/lib/types/audit'

interface ClinicEditorProps {
  clinicId: string | null
  onSave: () => void
  onCancel: () => void
}

export default function ClinicEditor({ clinicId, onSave, onCancel }: ClinicEditorProps) {
  const [clinic, setClinic] = useState<ClinicProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'seo' | 'performance'>('overview')
  const [formData, setFormData] = useState<Partial<ClinicProfile>>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)

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
      })
    }
  }, [clinicId])

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

  const handleSave = async () => {
    try {
      setSaving(true)
      const url = clinicId ? `/api/admin/clinics/${clinicId}` : '/api/admin/clinics'
      const method = clinicId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          create_version_snapshot: true,
          version_label: 'Manual update',
        }),
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border">
          {(['overview', 'programs', 'seo', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
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
                  <label className="block text-sm text-gray-400 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="auto-generated"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
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
                    onChange={(e) => setFormData({ ...formData, state: e.target.value || null })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
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

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Headline</label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Short, compelling headline..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Long Description</label>
                <textarea
                  value={formData.long_description || ''}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  rows={6}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Rich text description of the clinic..."
                />
              </div>
            </div>

            {/* Status Controls */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status & Visibility</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Verification Status</label>
                  <select
                    value={formData.verification_status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, verification_status: e.target.value as any })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
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
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                    <option value="$$$$">$$$$</option>
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
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>

            {/* Specialties & Tags */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Specialties & Tags</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.specialties || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="TRT, GLP-1, Peptides"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="premium, telehealth, concierge"
                />
              </div>
            </div>

            {/* Match Score Override */}
            <div>
              <Explainer
                title="Match Score Override"
                what="Manually override the AI-calculated match score for this clinic."
                why="Adjust clinic ranking in patient matching when AI score doesn't reflect business priorities."
                how={['Leave blank to use AI-calculated score', 'Set a number to override (higher = better match)', 'Useful for featuring specific clinics']}
              >
                <label className="block text-sm text-gray-400 mb-2">Match Score Override (optional)</label>
                <input
                  type="number"
                  value={formData.match_score_override || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    match_score_override: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Leave blank for AI-calculated"
                />
              </Explainer>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4">Programs & Services</h3>
            <p className="text-gray-400 text-sm">
              Programs configuration coming soon. This will allow you to configure detailed program offerings (TRT, GLP-1, Peptides, etc.)
            </p>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4">SEO & Discovery</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.seo_title || ''}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value || null })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Optimized page title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
              <textarea
                value={formData.seo_meta_description || ''}
                onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value || null })}
                rows={3}
                className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="SEO meta description (150-160 characters)"
              />
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </h3>
            {clinic?.performance_snapshot_json ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Profile Views</p>
                  <p className="text-xl font-semibold text-white">
                    {clinic.performance_snapshot_json.profile_views.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Matches to Clinic</p>
                  <p className="text-xl font-semibold text-white">
                    {clinic.performance_snapshot_json.matches_to_clinic.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Assessment Starts</p>
                  <p className="text-xl font-semibold text-white">
                    {clinic.performance_snapshot_json.assessment_starts_attributed.toLocaleString()}
                  </p>
                </div>
                <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Avg LTV Band</p>
                  <p className="text-xl font-semibold text-white">
                    {clinic.performance_snapshot_json.avg_predicted_ltv_band?.toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Performance data not available yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
              {clinicId && (
              <>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                Version History
              </button>
              <button
                onClick={handleClone}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Clone
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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


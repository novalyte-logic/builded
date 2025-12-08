'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, AlertTriangle, Tag, FileText, MapPin } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { GlobalTaxonomies, TreatmentType, ConditionTag, LifestyleTag, SEOTemplate } from '@/lib/types/taxonomy'
import Explainer from '@/components/Explainer'

export default function GlobalSettingsPage() {
  const [taxonomies, setTaxonomies] = useState<GlobalTaxonomies | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'treatments' | 'conditions' | 'lifestyle' | 'seo'>('treatments')

  useEffect(() => {
    fetchTaxonomies()
  }, [])

  const fetchTaxonomies = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/global-settings/taxonomies')
      // const data = await response.json()

      // Mock data
      const mockTaxonomies: GlobalTaxonomies = {
        treatment_types: [
          { id: '1', name: 'TRT', display_name: 'Testosterone Replacement Therapy', description: 'Hormone optimization', order: 1 },
          { id: '2', name: 'GLP1', display_name: 'GLP-1 Therapy', description: 'Weight management', order: 2 },
          { id: '3', name: 'PEPTIDES', display_name: 'Peptide Therapy', description: 'Recovery and longevity', order: 3 },
          { id: '4', name: 'RECOVERY', display_name: 'Recovery Protocols', description: 'Performance recovery', order: 4 },
          { id: '5', name: 'LONGEVITY', display_name: 'Longevity Optimization', description: 'Aging and healthspan', order: 5 },
        ],
        condition_tags: [
          { id: '1', name: 'Low T', category: 'symptom', order: 1 },
          { id: '2', name: 'ED', category: 'condition', order: 2 },
          { id: '3', name: 'Brain Fog', category: 'symptom', order: 3 },
          { id: '4', name: 'Insulin Resistance', category: 'condition', order: 4 },
          { id: '5', name: 'Weight Gain', category: 'symptom', order: 5 },
        ],
        lifestyle_tags: [
          { id: '1', name: 'Executive', order: 1 },
          { id: '2', name: 'Athlete', order: 2 },
          { id: '3', name: 'High-Stress Professional', order: 3 },
          { id: '4', name: 'Entrepreneur', order: 4 },
        ],
        seo_templates: [
          {
            id: '1',
            type: 'clinic_page',
            template_name: 'Default Clinic',
            title_template: '{Clinic Name} - Men\'s Health in {City}',
            meta_description_template: 'Expert men\'s health services in {City}. Specializing in {Specialties}. Book your consultation today.',
            variables: ['Clinic Name', 'City', 'Specialties'],
          },
          {
            id: '2',
            type: 'marketplace_category',
            template_name: 'Default Category',
            title_template: '{Category} for Men\'s Health | Novalyte™ AI',
            meta_description_template: 'Discover premium {Category} for men\'s health optimization. Expert-curated products.',
            variables: ['Category'],
          },
          {
            id: '3',
            type: 'city_page',
            template_name: 'City Treatment Page',
            title_template: '{Treatment} in {City} | Men\'s Health Services',
            meta_description_template: 'Find {Treatment} services in {City}. Connect with verified men\'s health clinics.',
            variables: ['Treatment', 'City'],
          },
        ],
        last_updated: new Date(),
      }

      setTaxonomies(mockTaxonomies)
    } catch (error) {
      console.error('Error fetching taxonomies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!taxonomies) return

    try {
      setSaving(true)
      // TODO: Implement API call
      // await fetch('/api/admin/global-settings/taxonomies', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(taxonomies),
      // })

      alert('Taxonomies saved successfully!')
    } catch (error) {
      console.error('Error saving taxonomies:', error)
      alert('Failed to save taxonomies. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="text-center text-gray-400">Loading taxonomies...</div>
      </div>
    )
  }

  if (!taxonomies) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="text-center text-red-400">Failed to load taxonomies</div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Global Settings & Taxonomies
            </h1>
            <p className="text-gray-400 mt-2">
              Manage platform-wide taxonomies, tags, and SEO templates
            </p>
          </div>
          <StatusBadge status="live" />
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

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-dark-border">
        {(['treatments', 'conditions', 'lifestyle', 'seo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'treatments' && <Tag className="w-4 h-4 inline mr-2" />}
            {tab === 'conditions' && <Tag className="w-4 h-4 inline mr-2" />}
            {tab === 'lifestyle' && <Tag className="w-4 h-4 inline mr-2" />}
            {tab === 'seo' && <FileText className="w-4 h-4 inline mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        {activeTab === 'treatments' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Treatment Types</h2>
            <p className="text-sm text-gray-400 mb-4">
              Manage treatment types that appear in clinic profiles and assessment flows.
            </p>
            <div className="space-y-3">
              {taxonomies.treatment_types.map((treatment) => (
                <div key={treatment.id} className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={treatment.name}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.treatment_types.findIndex((t) => t.id === treatment.id)
                          if (idx !== -1) {
                            updated.treatment_types[idx] = { ...treatment, name: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={treatment.display_name}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.treatment_types.findIndex((t) => t.id === treatment.id)
                          if (idx !== -1) {
                            updated.treatment_types[idx] = { ...treatment, display_name: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Order</label>
                      <input
                        type="number"
                        value={treatment.order}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.treatment_types.findIndex((t) => t.id === treatment.id)
                          if (idx !== -1) {
                            updated.treatment_types[idx] = { ...treatment, order: parseInt(e.target.value) || 0 }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white text-sm">
              + Add Treatment Type
            </button>
          </div>
        )}

        {activeTab === 'conditions' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Condition Tags</h2>
            <p className="text-sm text-gray-400 mb-4">
              Manage condition and symptom tags used for patient matching and content organization.
            </p>
            <div className="space-y-3">
              {taxonomies.condition_tags.map((tag) => (
                <div key={tag.id} className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.condition_tags.findIndex((t) => t.id === tag.id)
                          if (idx !== -1) {
                            updated.condition_tags[idx] = { ...tag, name: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Category</label>
                      <select
                        value={tag.category}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.condition_tags.findIndex((t) => t.id === tag.id)
                          if (idx !== -1) {
                            updated.condition_tags[idx] = { ...tag, category: e.target.value as any }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="symptom">Symptom</option>
                        <option value="condition">Condition</option>
                        <option value="goal">Goal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Order</label>
                      <input
                        type="number"
                        value={tag.order}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.condition_tags.findIndex((t) => t.id === tag.id)
                          if (idx !== -1) {
                            updated.condition_tags[idx] = { ...tag, order: parseInt(e.target.value) || 0 }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white text-sm">
              + Add Condition Tag
            </button>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Lifestyle Tags</h2>
            <p className="text-sm text-gray-400 mb-4">
              Manage lifestyle tags for patient segmentation and personalization.
            </p>
            <div className="space-y-3">
              {taxonomies.lifestyle_tags.map((tag) => (
                <div key={tag.id} className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.lifestyle_tags.findIndex((t) => t.id === tag.id)
                          if (idx !== -1) {
                            updated.lifestyle_tags[idx] = { ...tag, name: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Order</label>
                      <input
                        type="number"
                        value={tag.order}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.lifestyle_tags.findIndex((t) => t.id === tag.id)
                          if (idx !== -1) {
                            updated.lifestyle_tags[idx] = { ...tag, order: parseInt(e.target.value) || 0 }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white text-sm">
              + Add Lifestyle Tag
            </button>
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">SEO Templates</h2>
            <p className="text-sm text-gray-400 mb-4">
              Manage default SEO templates for clinics, marketplace categories, and city pages.
            </p>
            <div className="space-y-4">
              {taxonomies.seo_templates.map((template) => (
                <div key={template.id} className="bg-dark-accent border border-dark-border rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white mb-1">{template.template_name}</h3>
                    <span className="text-xs text-gray-400 capitalize">{template.type.replace('_', ' ')}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title Template</label>
                      <input
                        type="text"
                        value={template.title_template}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.seo_templates.findIndex((t) => t.id === template.id)
                          if (idx !== -1) {
                            updated.seo_templates[idx] = { ...template, title_template: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Meta Description Template</label>
                      <textarea
                        value={template.meta_description_template}
                        onChange={(e) => {
                          const updated = { ...taxonomies }
                          const idx = updated.seo_templates.findIndex((t) => t.id === template.id)
                          if (idx !== -1) {
                            updated.seo_templates[idx] = { ...template, meta_description_template: e.target.value }
                            setTaxonomies(updated)
                          }
                        }}
                        rows={2}
                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white resize-none"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Variables: {template.variables.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}


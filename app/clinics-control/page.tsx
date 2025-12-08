'use client'

import { useState } from 'react'
import { Building2, Plus, AlertTriangle, Edit, Eye } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import ClinicList from '@/components/clinics/ClinicList'
import ClinicEditor from '@/components/clinics/ClinicEditor'

export default function ClinicsControlPage() {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clinic List */}
        <div className="lg:col-span-1">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4">
            <button
              onClick={() => {
                setShowCreate(true)
                setSelectedClinicId(null)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Clinic
            </button>
          </div>
          <ClinicList
            onSelectClinic={(id) => {
              setSelectedClinicId(id)
              setShowCreate(false)
            }}
            selectedClinicId={selectedClinicId}
          />
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-2">
          {showCreate ? (
            <ClinicEditor
              clinicId={null}
              onSave={() => {
                setShowCreate(false)
                setSelectedClinicId(null)
              }}
              onCancel={() => setShowCreate(false)}
            />
          ) : selectedClinicId ? (
            <ClinicEditor
              clinicId={selectedClinicId}
              onSave={() => {
                // Refresh list
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


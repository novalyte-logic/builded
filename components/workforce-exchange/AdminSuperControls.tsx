'use client'

import { useState } from 'react'
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import ConfirmationModal from '../superadmin-settings/ConfirmationModal'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface AdminSuperControlsProps {
  practitioners: any[]
  clinics: any[]
  bookings: any[]
  feeSettings: {
    matchFee: number
    percentageFee: number
    priorityFee: number
    verificationFee: number
  }
  onUpdateFees: (fees: { matchFee: number; percentageFee: number; priorityFee: number; verificationFee: number }) => void
  onApprovePractitioner: (id: string) => void
  onBanPractitioner: (id: string) => void
  onApproveClinic: (id: string) => void
  onOverrideMatch: (matchId: string) => void
}

export default function AdminSuperControls({
  practitioners,
  clinics,
  bookings,
  feeSettings,
  onUpdateFees,
  onApprovePractitioner,
  onBanPractitioner,
  onApproveClinic,
  onOverrideMatch,
}: AdminSuperControlsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: string
    id: string
    title: string
    message: string
  } | null>(null)

  const handleAction = (type: string, id: string, title: string, message: string) => {
    setConfirmAction({ type, id, title, message })
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    if (!confirmAction) return

    switch (confirmAction.type) {
      case 'approve-practitioner':
        onApprovePractitioner(confirmAction.id)
        break
      case 'ban-practitioner':
        onBanPractitioner(confirmAction.id)
        break
      case 'approve-clinic':
        onApproveClinic(confirmAction.id)
        break
    }

    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  return (
    <div className="space-y-6">
      {/* Fee Settings */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Marketplace Fee Settings</h3>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Per-Match Fee ($)</label>
            <input
              type="number"
              value={feeSettings.matchFee}
              onChange={(e) =>
                onUpdateFees({ ...feeSettings, matchFee: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Percentage Fee (%)</label>
            <input
              type="number"
              value={feeSettings.percentageFee}
              onChange={(e) =>
                onUpdateFees({ ...feeSettings, percentageFee: parseFloat(e.target.value) || 0 })
              }
              step="0.1"
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Priority Fee ($)</label>
            <input
              type="number"
              value={feeSettings.priorityFee}
              onChange={(e) =>
                onUpdateFees({ ...feeSettings, priorityFee: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Verification Fee ($)</label>
            <input
              type="number"
              value={feeSettings.verificationFee}
              onChange={(e) =>
                onUpdateFees({ ...feeSettings, verificationFee: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Total Practitioners</p>
          </div>
          <p className="text-2xl font-bold text-white">{practitioners.length}</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Active Clinics</p>
          </div>
          <p className="text-2xl font-bold text-white">{clinics.length}</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Total Bookings</p>
          </div>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">Revenue (30d)</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(
              bookings.reduce((sum, b) => sum + (b.novalyteFee || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pending Approvals</h3>
        <div className="space-y-3">
          {practitioners
            .filter((p) => !p.verified)
            .slice(0, 5)
            .map((practitioner) => (
              <div
                key={practitioner.id}
                className="flex items-center justify-between p-3 bg-dark-accent border border-dark-border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {practitioner.firstName} {practitioner.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{practitioner.role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAction(
                        'approve-practitioner',
                        practitioner.id,
                        'Approve Practitioner',
                        `Approve ${practitioner.firstName} ${practitioner.lastName} for the Workforce Exchange?`
                      )
                    }
                    className="px-3 py-1.5 bg-status-live/20 border border-status-live/30 text-status-live rounded-lg hover:bg-status-live/30 transition-colors text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleAction(
                        'ban-practitioner',
                        practitioner.id,
                        'Ban Practitioner',
                        `Permanently ban ${practitioner.firstName} ${practitioner.lastName} from the Workforce Exchange?`
                      )
                    }
                    className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Ban
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setConfirmAction(null)
          }}
          onConfirm={handleConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          variant={confirmAction.type.includes('ban') ? 'danger' : 'default'}
        />
      )}
    </div>
  )
}


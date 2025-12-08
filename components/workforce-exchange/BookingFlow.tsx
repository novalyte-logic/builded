'use client'

import { useState } from 'react'
import { CheckCircle, X, Clock, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { WorkforceBooking, PractitionerProfile } from '@/lib/types/workforce'

interface BookingFlowProps {
  booking: WorkforceBooking & { practitioner: PractitionerProfile }
  onConfirm: () => void
  onCancel: () => void
}

export default function BookingFlow({ booking, onConfirm, onCancel }: BookingFlowProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    // TODO: API call to confirm booking
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsConfirming(false)
    onConfirm()
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Confirm Booking</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Practitioner Info */}
      <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Practitioner</h4>
        <p className="text-sm text-gray-300">
          {booking.practitioner.firstName} {booking.practitioner.lastName} — {booking.practitioner.role}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {booking.practitioner.location.city}, {booking.practitioner.location.state}
        </p>
      </div>

      {/* Booking Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Start Date</span>
          </div>
          <span className="text-sm text-white">
            {booking.confirmedStartDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">End Date</span>
          </div>
          <span className="text-sm text-white">
            {booking.confirmedEndDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Hours</span>
          </div>
          <span className="text-sm text-white">{booking.confirmedHours} hours</span>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Financial Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Practitioner Rate</span>
            <span className="text-white">{formatCurrency(booking.agreedRate)}/hr</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Cost ({booking.confirmedHours} hrs)</span>
            <span className="text-white">
              {formatCurrency(booking.agreedRate * booking.confirmedHours)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-dark-border">
            <span className="text-gray-400">Novalyte Fee</span>
            <span className="text-white">{formatCurrency(booking.novalyteFee)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-dark-border">
            <span className="text-white">Total Amount</span>
            <span className="text-white">
              {formatCurrency(booking.agreedRate * booking.confirmedHours + booking.novalyteFee)}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-dark-accent border border-dark-border rounded-lg">
        <span className="text-sm text-gray-400">Status</span>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            booking.status === 'Pending'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : booking.status === 'Accepted'
              ? 'bg-status-live/20 text-status-live border-status-live/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Actions */}
      {booking.status === 'Pending' && (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isConfirming ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  )
}


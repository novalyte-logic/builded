'use client'

import { useState } from 'react'
import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { WorkforceBooking } from '@/lib/types/workforce'

interface BookingHistoryProps {
  bookings: Array<WorkforceBooking & { practitioner: any; clinic: any }>
}

export default function BookingHistory({ bookings }: BookingHistoryProps) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true
    return b.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Declined':
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Booking History</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Clinic
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Practitioner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-dark-hover transition-colors">
                <td className="px-4 py-3 text-sm text-gray-300">
                  {booking.confirmedStartDate.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-white">{booking.clinic?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {booking.practitioner?.firstName} {booking.practitioner?.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{booking.confirmedHours} hrs</td>
                <td className="px-4 py-3 text-sm text-white font-medium">
                  {formatCurrency(booking.novalyteFee)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


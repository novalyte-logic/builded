'use client'

import { useState } from 'react'
import { MapPin, Star, Shield, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { PractitionerProfile } from '@/lib/types/workforce'

interface PractitionerDirectoryProps {
  practitioners: PractitionerProfile[]
  onSelectPractitioner: (practitioner: PractitionerProfile) => void
}

export default function PractitionerDirectory({
  practitioners,
  onSelectPractitioner,
}: PractitionerDirectoryProps) {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)

  const filtered = practitioners.filter((p) => {
    if (selectedRole && p.role !== selectedRole) return false
    if (minRating > 0 && p.rating < minRating) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Roles</option>
              <option value="NP">NP</option>
              <option value="PA">PA</option>
              <option value="RN">RN</option>
              <option value="IV_Nurse">IV Nurse</option>
              <option value="Phlebotomist">Phlebotomist</option>
              <option value="Hormone_Specialist">Hormone Specialist</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="0">Any Rating</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Practitioner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((practitioner) => (
          <div
            key={practitioner.id}
            onClick={() => onSelectPractitioner(practitioner)}
            className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {practitioner.firstName} {practitioner.lastName}
                </h3>
                <p className="text-xs text-gray-400">{practitioner.role}</p>
              </div>
              {practitioner.verified && (
                <div title="Verified Practitioner">
                  <Shield className="w-4 h-4 text-status-live" />
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-white">{practitioner.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">
                ({practitioner.reviewCount} reviews)
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mb-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>
                {practitioner.location.city}, {practitioner.location.state}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {practitioner.specialties.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-300"
                >
                  {skill.skill}
                </span>
              ))}
            </div>

            {/* Rates */}
            <div className="flex items-center justify-between pt-3 border-t border-dark-border">
              <div>
                <p className="text-xs text-gray-400">Hourly Rate</p>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(practitioner.hourlyRate)}/hr
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Daily Rate</p>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(practitioner.dailyRate)}
                </p>
              </div>
            </div>

            {/* Background Check Status */}
            <div className="mt-3 pt-3 border-t border-dark-border">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  practitioner.backgroundCheckStatus === 'Verified'
                    ? 'bg-status-live/20 text-status-live border-status-live/30'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {practitioner.backgroundCheckStatus === 'Verified'
                  ? 'Background Verified'
                  : practitioner.backgroundCheckStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


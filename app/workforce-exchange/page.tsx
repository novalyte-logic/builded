'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, DollarSign } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import AdminSuperControls from '@/components/workforce-exchange/AdminSuperControls'
import BookingHistory from '@/components/workforce-exchange/BookingHistory'
import PractitionerDirectory from '@/components/workforce-exchange/PractitionerDirectory'
import type { PractitionerProfile, WorkforceBooking } from '@/lib/types/workforce'

export default function WorkforceExchangePage() {
  const [activeView, setActiveView] = useState<'overview' | 'practitioners' | 'bookings'>('overview')
  const [practitioners, setPractitioners] = useState<PractitionerProfile[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [feeSettings, setFeeSettings] = useState({
    matchFee: 25,
    percentageFee: 15,
    priorityFee: 50,
    verificationFee: 99,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      // const [practitionersRes, bookingsRes] = await Promise.all([
      //   fetch('/api/admin/workforce/practitioners'),
      //   fetch('/api/admin/workforce/bookings'),
      // ])

      // Mock data for now
      const mockPractitioners: PractitionerProfile[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah.chen@example.com',
          phone: '555-0101',
          role: 'NP',
          credentials: ['FNP-C', 'RN-BSN'],
          specialties: [
            { skill: 'TRT', experience_years: 5, verified: true },
            { skill: 'GLP-1', experience_years: 3, verified: true },
          ],
          location: { city: 'Los Angeles', state: 'CA', zipCode: '90001' },
          hourlyRate: 125,
          dailyRate: 950,
          availability: {
            startDate: new Date(),
            endDate: null,
            daysOfWeek: [1, 2, 3, 4, 5],
            hoursPerDay: 8,
          },
          rating: 4.8,
          reviewCount: 42,
          backgroundCheckStatus: 'Verified',
          backgroundCheckExpiry: new Date(Date.now() + 365 * 24 * 3600000),
          verified: true,
          profileImageUrl: null,
          bio: 'Experienced Nurse Practitioner specializing in men\'s health and hormone optimization.',
          certifications: ['FNP-C', 'AANP'],
          languages: ['English', 'Mandarin'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      setPractitioners(mockPractitioners)
      setBookings([])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPractitioner = (practitioner: PractitionerProfile) => {
    // TODO: Open practitioner detail panel
    console.log('Selected practitioner:', practitioner.id)
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Clinical Workforce Exchange
            </h1>
            <p className="text-gray-400 mt-1">
              On-demand staffing marketplace for Men&apos;s Clinics. Match, book, and manage healthcare practitioners.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'overview'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-dark-accent border border-dark-border text-gray-400 hover:text-white'
          }`}
        >
          Overview & Controls
        </button>
        <button
          onClick={() => setActiveView('practitioners')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'practitioners'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-dark-accent border border-dark-border text-gray-400 hover:text-white'
          }`}
        >
          Practitioner Directory
        </button>
        <button
          onClick={() => setActiveView('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'bookings'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-dark-accent border border-dark-border text-gray-400 hover:text-white'
          }`}
        >
          Booking History
        </button>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <AdminSuperControls
          practitioners={practitioners}
          clinics={[]}
          bookings={bookings}
          feeSettings={feeSettings}
          onUpdateFees={setFeeSettings}
          onApprovePractitioner={(id) => {
            setPractitioners((prev) =>
              prev.map((p) => (p.id === id ? { ...p, verified: true } : p))
            )
          }}
          onBanPractitioner={(id) => {
            setPractitioners((prev) => prev.filter((p) => p.id !== id))
          }}
          onApproveClinic={(id) => console.log('Approve clinic:', id)}
          onOverrideMatch={(matchId) => console.log('Override match:', matchId)}
        />
      )}

      {activeView === 'practitioners' && (
        <PractitionerDirectory
          practitioners={practitioners}
          onSelectPractitioner={handleSelectPractitioner}
        />
      )}

      {activeView === 'bookings' && (
        <BookingHistory bookings={bookings as any} />
      )}
    </div>
  )
}


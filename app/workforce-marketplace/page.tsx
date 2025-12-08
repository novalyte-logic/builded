'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import ClinicRequestForm from '@/components/workforce-exchange/ClinicRequestForm'
import AIMatchingResults from '@/components/workforce-exchange/AIMatchingResults'
import BookingFlow from '@/components/workforce-exchange/BookingFlow'
import type {
  WorkforceRequest,
  WorkforceMatch,
  PractitionerProfile,
  WorkforceBooking,
} from '@/lib/types/workforce'

export default function WorkforceMarketplacePage() {
  const [step, setStep] = useState<'request' | 'matching' | 'booking'>('request')
  const [currentRequest, setCurrentRequest] = useState<WorkforceRequest | null>(null)
  const [matches, setMatches] = useState<Array<WorkforceMatch & { practitioner: PractitionerProfile }>>([])
  const [selectedMatch, setSelectedMatch] = useState<WorkforceMatch | null>(null)
  const [currentBooking, setCurrentBooking] = useState<WorkforceBooking & { practitioner: PractitionerProfile } | null>(null)

  // Mock clinic data (would come from authenticated session)
  const clinicId = 'clinic-1'
  const clinicLocation = {
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
  }

  const handleSubmitRequest = async (requestData: any) => {
    try {
      // TODO: API call to create request
      // const response = await fetch('/api/workforce/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestData),
      // })

      // Mock request creation
      const newRequest: WorkforceRequest = {
        id: `req-${Date.now()}`,
        clinicId,
        clinicName: 'Los Angeles Men\'s Health',
        clinicLocation,
        role: requestData.role as any,
        skills: requestData.skills,
        coverageType: requestData.coverageType as any,
        startDate: new Date(requestData.startDate),
        endDate: new Date(requestData.endDate),
        hoursNeeded: requestData.hoursNeeded,
        rateRange: requestData.rateRange,
        notes: requestData.notes,
        status: 'Matching',
        priority: requestData.priority as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setCurrentRequest(newRequest)

      // Generate AI matches
      await generateMatches(newRequest)
      
      setStep('matching')
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Failed to create request. Please try again.')
    }
  }

  const generateMatches = async (request: WorkforceRequest) => {
    try {
      // TODO: API call to generate matches
      // const response = await fetch(`/api/workforce/requests/${request.id}/matches`, {
      //   method: 'POST',
      // })

      // Mock matches
      const mockMatches: Array<WorkforceMatch & { practitioner: PractitionerProfile }> = [
        {
          id: 'match-1',
          requestId: request.id,
          practitionerId: 'prac-1',
          matchScore: 92,
          explanation: 'Sarah Chen is an excellent match with 5+ years of TRT experience, located in Los Angeles, and has a 4.8/5.0 rating from 42 reviews. Available for your requested dates.',
          compatibilityFactors: {
            skills: 28,
            location: 25,
            availability: 24,
            rating: 15,
          },
          estimatedCost: 1000,
          createdAt: new Date(),
          practitioner: {
            id: 'prac-1',
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'sarah@example.com',
            phone: '555-0101',
            role: 'NP',
            credentials: ['FNP-C'],
            specialties: [{ skill: 'TRT', experience_years: 5, verified: true }],
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
            backgroundCheckExpiry: null,
            verified: true,
            profileImageUrl: null,
            bio: '',
            certifications: [],
            languages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]

      setMatches(mockMatches)
    } catch (error) {
      console.error('Error generating matches:', error)
    }
  }

  const handleSelectMatch = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return

    setSelectedMatch(match)

    // Create booking
    const booking: WorkforceBooking & { practitioner: PractitionerProfile } = {
      id: `booking-${Date.now()}`,
      requestId: currentRequest!.id,
      matchId: match.id,
      practitionerId: match.practitionerId,
      clinicId: clinicId,
      status: 'Pending',
      confirmedStartDate: currentRequest!.startDate,
      confirmedEndDate: currentRequest!.endDate,
      confirmedHours: currentRequest!.hoursNeeded,
      agreedRate: match.practitioner.hourlyRate,
      novalyteFee: 175, // matchFee + percentage
      practitionerPayout: match.estimatedCost - 175,
      practitionerAcceptedAt: null,
      clinicConfirmedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      practitioner: match.practitioner,
    }

    setCurrentBooking(booking)
    setStep('booking')
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Clinical Workforce Exchange</h1>
            <p className="text-gray-400 mt-1">
              Request temporary healthcare practitioners for your clinic. AI-powered matching in minutes.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Request Form or Booking */}
        <div className="lg:col-span-2">
          {step === 'request' && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Create Staffing Request</h2>
              <ClinicRequestForm
                clinicId={clinicId}
                clinicLocation={clinicLocation}
                onSubmit={handleSubmitRequest}
              />
            </div>
          )}

          {step === 'matching' && currentRequest && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Finding Matches for Your Request...
              </h2>
              <AIMatchingResults matches={matches} onSelectMatch={handleSelectMatch} />
            </div>
          )}

          {step === 'booking' && currentBooking && (
            <BookingFlow
              booking={currentBooking}
              onConfirm={() => {
                alert('Booking confirmed! Practitioner will be notified.')
                setStep('request')
                setCurrentRequest(null)
                setMatches([])
                setCurrentBooking(null)
              }}
              onCancel={() => {
                setStep('matching')
                setCurrentBooking(null)
              }}
            />
          )}
        </div>

        {/* RIGHT: Info Panel */}
        <div className="lg:col-span-1">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div>
                <p className="font-medium text-white mb-1">1. Submit Request</p>
                <p>Fill out your staffing requirements (role, skills, dates, hours).</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">2. AI Matching</p>
                <p>Our AI matches you with top 5 practitioners in seconds.</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">3. Select & Book</p>
                <p>Choose your preferred match and confirm booking.</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">4. Practitioner Notified</p>
                <p>They receive request and can accept/decline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


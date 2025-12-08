/**
 * Clinical Workforce Exchange Data Models
 * 
 * On-demand staffing marketplace for Men's Clinics
 */

export type PractitionerRole = 'NP' | 'PA' | 'RN' | 'IV_Nurse' | 'Phlebotomist' | 'Hormone_Specialist'

export type CoverageType = 'Single_Shift' | 'Multi_Day' | 'Weekly' | 'Telemedicine'

export type RequestStatus = 'Pending' | 'Matching' | 'Matched' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed'

export type BookingStatus = 'Pending' | 'Accepted' | 'Declined' | 'Confirmed' | 'Cancelled' | 'Completed'

export interface PractitionerSkill {
  skill: 'TRT' | 'GLP-1' | 'Peptides' | 'Weight_Loss' | 'IV_Therapy' | 'Hormone_Optimization' | 'Longevity'
  experience_years: number
  verified: boolean
}

export interface PractitionerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: PractitionerRole
  credentials: string[] // e.g., ["FNP-C", "RN-BSN"]
  specialties: PractitionerSkill[]
  location: {
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
  }
  hourlyRate: number
  dailyRate: number
  availability: {
    startDate: Date
    endDate: Date | null
    daysOfWeek: number[] // 0-6 (Sunday-Saturday)
    hoursPerDay: number
  }
  rating: number // 1-5
  reviewCount: number
  backgroundCheckStatus: 'Pending' | 'Verified' | 'Failed' | 'Expired'
  backgroundCheckExpiry: Date | null
  verified: boolean
  profileImageUrl: string | null
  bio: string
  certifications: string[]
  languages: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkforceRequest {
  id: string
  clinicId: string
  clinicName: string
  clinicLocation: {
    city: string
    state: string
    zipCode: string
    address?: string
  }
  role: PractitionerRole
  skills: string[] // Required skills
  coverageType: CoverageType
  startDate: Date
  endDate: Date
  hoursNeeded: number
  rateRange?: {
    min: number
    max: number
  }
  notes?: string
  status: RequestStatus
  priority: 'Standard' | 'Priority' | 'Urgent'
  createdAt: Date
  updatedAt: Date
}

export interface WorkforceMatch {
  id: string
  requestId: string
  practitionerId: string
  matchScore: number // 0-100
  explanation: string // AI-generated explanation
  compatibilityFactors: {
    skills: number // 0-100
    location: number // 0-100
    availability: number // 0-100
    rating: number // 0-100
  }
  estimatedCost: number
  createdAt: Date
}

export interface WorkforceBooking {
  id: string
  requestId: string
  matchId: string
  practitionerId: string
  clinicId: string
  status: BookingStatus
  confirmedStartDate: Date
  confirmedEndDate: Date
  confirmedHours: number
  agreedRate: number
  novalyteFee: number
  practitionerPayout: number
  practitionerAcceptedAt: Date | null
  clinicConfirmedAt: Date | null
  cancellationReason?: string
  cancelledAt?: Date
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkforcePayout {
  id: string
  bookingId: string
  practitionerId: string
  amount: number
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
  processedAt: Date | null
  transactionId: string | null
  createdAt: Date
}

export interface WorkforceEvent {
  id: string
  event_type:
    | 'WORKFORCE_REQUEST_CREATED'
    | 'WORKFORCE_MATCH_SENT'
    | 'WORKFORCE_BOOKING_CONFIRMED'
    | 'WORKFORCE_PAYOUT_PROCESSED'
    | 'WORKFORCE_PROVIDER_ONBOARDED'
  entity_id: string
  entity_type: 'request' | 'match' | 'booking' | 'payout' | 'practitioner'
  metadata: Record<string, any>
  timestamp: Date
}


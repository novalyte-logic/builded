/**
 * MCP Tool: scrape_temp_shift_listings
 * 
 * Pull PRN/locum/contract nursing shifts from public temp marketplaces.
 */

export type ShiftType = 'PRN' | 'locum' | 'contract' | 'per_diem' | 'travel'
export type CredentialReq = 'RN' | 'LPN' | 'NP' | 'PA' | 'IV_Certified' | 'BLS' | 'ACLS'

export interface TempShiftListing {
  platform: string // e.g., 'nomad_health', 'aya_healthcare', 'trusted_health'
  shiftType: ShiftType
  hourlyRate: {
    min: number
    max: number
    currency: string
  }
  location: {
    city: string
    state: string
    country: string
  }
  clinicName?: string
  credentialReqs: CredentialReq[]
  shiftDetails: {
    startDate: string // ISO timestamp
    duration?: string // e.g., "8 hours", "12 hours", "ongoing"
    schedule?: string // e.g., "Monday-Friday", "Weekends"
  }
  serviceLines?: string[] // e.g., ['TRT', 'IV_THERAPY']
  postedDate: string // ISO timestamp
  expiresDate?: string // ISO timestamp
}

export interface ScrapeTempShiftsInput {
  region?: string // e.g., "Texas", "TX", "Dallas, TX"
  shiftType?: ShiftType
  minHourlyRate?: number
  maxResults?: number // Default: 30
}

export interface ScrapeTempShiftsOutput {
  listings: TempShiftListing[]
  totalFound: number
  region?: string
  platforms: string[]
  avgHourlyRate: {
    min: number
    max: number
  }
  scrapedAt: string
}

/**
 * Scrape temp shift listings from public marketplaces
 * 
 * NOTE: In production, this would integrate with:
 * - Nomad Health API
 * - Aya Healthcare API
 * - Trusted Health API
 * - Vivian Health API
 * - Web scraping of temp staffing platforms
 */
export async function scrapeTempShiftListings(
  input: ScrapeTempShiftsInput
): Promise<ScrapeTempShiftsOutput> {
  const { region, shiftType, minHourlyRate, maxResults = 30 } = input

  try {
    // TODO: Integrate with real temp marketplace APIs
    /*
    Example integration:
    
    const nomadShifts = await nomadHealthAPI.search({
      location: region,
      shiftType,
      minRate: minHourlyRate,
    })
    
    const ayaShifts = await ayaHealthcareAPI.search({
      region,
      specialty: 'IV Therapy',
    })
    */

    // Mock implementation
    return generateMockTempShifts(region, shiftType, minHourlyRate, maxResults)
  } catch (error) {
    console.error('Error scraping temp shifts:', error)
    throw new Error(`Failed to scrape temp shifts: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate mock temp shift listings
 */
function generateMockTempShifts(
  region?: string,
  shiftType?: ShiftType,
  minHourlyRate?: number,
  maxResults: number = 30
): ScrapeTempShiftsOutput {
  const state = region?.match(/\b([A-Z]{2})\b/)?.[1] || 
                region?.match(/Texas|TX/i) ? 'TX' :
                region?.match(/Florida|FL/i) ? 'FL' :
                region?.match(/California|CA/i) ? 'CA' :
                'TX'
  
  const city = region?.match(/([A-Z][a-z]+)/)?.[0] || 'Dallas'

  const platforms = ['nomad_health', 'aya_healthcare', 'trusted_health', 'vivian_health', 'shiftmed']
  const shiftTypes: ShiftType[] = shiftType 
    ? [shiftType] 
    : ['PRN', 'locum', 'contract', 'per_diem', 'travel']

  const credentialReqs: CredentialReq[][] = [
    ['RN', 'IV_Certified', 'BLS'],
    ['RN', 'BLS', 'ACLS'],
    ['LPN', 'IV_Certified'],
    ['NP', 'BLS'],
    ['PA', 'BLS', 'ACLS'],
  ]

  const listings: TempShiftListing[] = []

  for (let i = 0; i < Math.min(maxResults, 30); i++) {
    const selectedShiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)]
    const selectedPlatform = platforms[Math.floor(Math.random() * platforms.length)]
    
    // Hourly rates vary by shift type and platform
    const rateRanges = {
      PRN: { min: 45, max: 70 },
      locum: { min: 60, max: 90 },
      contract: { min: 50, max: 80 },
      per_diem: { min: 55, max: 85 },
      travel: { min: 70, max: 110 },
    }

    const rateRange = rateRanges[selectedShiftType]
    const minRate = minHourlyRate ? Math.max(minHourlyRate, rateRange.min) : rateRange.min
    const maxRate = rateRange.max

    const clinicNames = [
      `${city} Vitality Clinic`,
      `${city} Men's Health Center`,
      `Elite Wellness ${city}`,
      `Peak Performance ${city}`,
      null, // Some shifts may not have clinic name
    ]

    listings.push({
      platform: selectedPlatform,
      shiftType: selectedShiftType,
      hourlyRate: {
        min: minRate,
        max: maxRate,
        currency: 'USD',
      },
      location: {
        city,
        state,
        country: 'US',
      },
      clinicName: clinicNames[Math.floor(Math.random() * clinicNames.length)] || undefined,
      credentialReqs: credentialReqs[Math.floor(Math.random() * credentialReqs.length)],
      shiftDetails: {
        startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration: ['8 hours', '12 hours', 'ongoing'][Math.floor(Math.random() * 3)],
        schedule: ['Monday-Friday', 'Weekends', 'Flexible'][Math.floor(Math.random() * 3)],
      },
      serviceLines: ['TRT', 'IV_THERAPY', 'WEIGHT_LOSS'].slice(0, Math.floor(Math.random() * 2) + 1),
      postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiresDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  // Filter by shift type if specified
  const filteredListings = shiftType
    ? listings.filter(l => l.shiftType === shiftType)
    : listings

  // Filter by min hourly rate if specified
  const finalListings = minHourlyRate
    ? filteredListings.filter(l => l.hourlyRate.max >= minHourlyRate)
    : filteredListings

  // Calculate average rates
  const rates = finalListings.map(l => ({ min: l.hourlyRate.min, max: l.hourlyRate.max }))
  const avgMin = rates.length > 0 
    ? Math.round(rates.reduce((sum, r) => sum + r.min, 0) / rates.length)
    : 0
  const avgMax = rates.length > 0
    ? Math.round(rates.reduce((sum, r) => sum + r.max, 0) / rates.length)
    : 0

  const uniquePlatforms = [...new Set(finalListings.map(l => l.platform))]

  return {
    listings: finalListings.slice(0, maxResults),
    totalFound: finalListings.length,
    region,
    platforms: uniquePlatforms,
    avgHourlyRate: {
      min: avgMin,
      max: avgMax,
    },
    scrapedAt: new Date().toISOString(),
  }
}

/**
 * MCP Tool metadata
 */
export const scrapeTempShiftsToolMetadata = {
  name: 'scrape_temp_shift_listings',
  description: 'Pull PRN/locum/contract nursing shifts from public temp marketplaces',
  inputSchema: {
    type: 'object',
    properties: {
      region: {
        type: 'string',
        description: 'Region (state code, city+state, or full state name)',
      },
      shiftType: {
        type: 'string',
        enum: ['PRN', 'locum', 'contract', 'per_diem', 'travel'],
        description: 'Shift type filter (optional)',
      },
      minHourlyRate: {
        type: 'number',
        description: 'Minimum hourly rate filter (optional)',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (default: 30)',
      },
    },
  },
}


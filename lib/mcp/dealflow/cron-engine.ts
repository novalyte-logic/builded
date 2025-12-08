/**
 * Novalyte Dealflow MCP - Cron Engine Module
 *
 * Purpose: Generate daily pre-qualified outreach lists without manual intervention.
 * Every morning, the MCP drops 10–25 high-value clinics into the Dealflow Console.
 */

import { findMensClinicsByRegion, ClinicBasic } from './find-mens-clinics-by-region'
import { enrichClinicProfile, EnrichedClinicProfile } from './enrich-clinic-profile'
import { getAdsPresenceSnapshot, AdsPresenceSnapshot } from './ads-presence-snapshot'
import { generateOutreachPack, OutreachPack, RegionalDemandHint } from './vertex-outreach-brain'
import { queryRegionDemand } from '../market-intel/bigquery-region-demand'

// In-memory cache for delivery channel preference (replace with Redis/DB in production)
const deliveryChannelCache = new Map<string, DeliveryChannel>()

export type DeliveryChannel = 'dashboard' | 'email' | 'slack' | 'sms'

export type ClinicCategory = 'fast_wins' | 'medium_potential' | 'long_shot'

export interface DailyClinicDeal {
  summaryProfile: {
    clinic: ClinicBasic
    enrichedProfile?: EnrichedClinicProfile
  }
  adsSnapshot: AdsPresenceSnapshot
  priorityScore: number
  category: ClinicCategory
  firstEmailMsg: string
  recommendedAction: string
  outreachPack?: OutreachPack
}

export interface DailyDealflowRunResult {
  timestamp: string
  clinics: DailyClinicDeal[]
  summary: {
    fastWins: number
    mediumPotential: number
    longShot: number
    totalClinics: number
  }
}

export interface DeliveryChannelResult {
  message: string
  channel: DeliveryChannel
}

export interface FormattedDailyResults {
  timestamp: string
  digest: {
    fastWins: DailyClinicDeal[]
    mediumPotential: DailyClinicDeal[]
    longShot: DailyClinicDeal[]
  }
  summary: {
    totalClinics: number
    clinicsRunningAds: number
    clinicsWithWeakFunnels: number
    topRegions: string[]
  }
}

/**
 * Service line mapping for market-intel module
 */
const SERVICE_LINE_MAP: Record<string, 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY'> = {
  'TRT': 'TRT',
  'GLP-1': 'WEIGHT_LOSS',
  'IV Therapy': 'IV_THERAPY',
}

/**
 * Get top 3 high-demand states for a service line
 */
async function getTopDemandStates(serviceLine: string): Promise<string[]> {
  const mappedServiceLine = SERVICE_LINE_MAP[serviceLine]
  if (!mappedServiceLine) {
    // Fallback to hardcoded states if mapping fails
    const fallback: Record<string, string[]> = {
      'TRT': ['Texas', 'Florida', 'California'],
      'GLP-1': ['New York', 'California', 'Texas'],
      'IV Therapy': ['Florida', 'Nevada', 'Arizona'],
    }
    return fallback[serviceLine] || ['Texas', 'Florida', 'California']
  }

  try {
    const demandData = await queryRegionDemand({
      serviceLine: mappedServiceLine,
    })
    
    // Sort by demand_index descending and take top 3
    const topStates = demandData
      .sort((a, b) => b.demand_index - a.demand_index)
      .slice(0, 3)
      .map(d => d.region)
    
    return topStates.length > 0 ? topStates : ['Texas', 'Florida', 'California']
  } catch (error) {
    console.error('Error fetching demand states:', error)
    // Fallback to hardcoded states
    const fallback: Record<string, string[]> = {
      'TRT': ['Texas', 'Florida', 'California'],
      'GLP-1': ['New York', 'California', 'Texas'],
      'IV Therapy': ['Florida', 'Nevada', 'Arizona'],
    }
    return fallback[serviceLine] || ['Texas', 'Florida', 'California']
  }
}

/**
 * Calculate priority score for a clinic
 * Prioritizes:
 * - Clinics spending money (ads detected)
 * - Clinics with outdated funnels
 * - Clinics in hot regions
 * - Clinics showing growth momentum signals
 */
function calculatePriorityScore(
  clinic: ClinicBasic,
  enrichedProfile: EnrichedClinicProfile | undefined,
  adsSnapshot: AdsPresenceSnapshot,
  demandHints: RegionalDemandHint[]
): number {
  let score = 50 // Base score

  // Ads presence (highest weight)
  if (adsSnapshot.isRunningAds) {
    score += 30
    
    // Higher spend = higher priority
    if (adsSnapshot.estimatedSpendBand === 'high') {
      score += 15
    } else if (adsSnapshot.estimatedSpendBand === 'medium') {
      score += 10
    }
    
    // Multiple platforms = more serious
    if (adsSnapshot.platforms.length > 1) {
      score += 5
    }
  }

  // Funnel quality (outdated = opportunity)
  if (enrichedProfile) {
    const outdatedFunnels = ['contact_form', 'mixed']
    if (outdatedFunnels.includes(enrichedProfile.funnelStyle)) {
      score += 10 // Opportunity to improve
    }
    
    // No pricing page = potential gap
    if (!enrichedProfile.pricingSignals.hasPricingPage) {
      score += 5
    }
  }

  // Regional demand
  const regionDemand = demandHints.find(
    h => h.region === clinic.location.state || h.region === `US-${clinic.location.state}`
  )
  if (regionDemand) {
    if (regionDemand.demandIndex >= 80) {
      score += 15
    } else if (regionDemand.demandIndex >= 60) {
      score += 10
    }
    
    // Rising trend = momentum
    if (regionDemand.trend === 'RISING') {
      score += 5
    }
  }

  // Service line alignment
  if (clinic.serviceLines.length > 1) {
    score += 5 // Multi-service = more potential
  }

  return Math.min(100, score) // Cap at 100
}

/**
 * Categorize clinic into Fast Wins, Medium Potential, or Long Shot
 */
function categorizeClinic(
  adsSnapshot: AdsPresenceSnapshot,
  priorityScore: number,
  demandHints: RegionalDemandHint[]
): ClinicCategory {
  // Fast Wins: High intent + ads running
  if (adsSnapshot.isRunningAds && priorityScore >= 75) {
    return 'fast_wins'
  }
  
  // Fast Wins: High demand + no ads (perfect opportunity)
  const highDemand = demandHints.some(h => h.demandIndex >= 85 && !adsSnapshot.isRunningAds)
  if (highDemand && priorityScore >= 70) {
    return 'fast_wins'
  }

  // Medium Potential: Some signals but not strong enough
  if (priorityScore >= 60 || adsSnapshot.isRunningAds) {
    return 'medium_potential'
  }

  // Long Shot: Weak signals
  return 'long_shot'
}

/**
 * 1. cron_daily_dealflow_run
 * Full automation that runs once per day to generate the outreach list.
 */
export async function cronDailyDealflowRun(): Promise<DailyDealflowRunResult> {
  const serviceLines = ['TRT', 'GLP-1', 'IV Therapy']
  const allClinics: DailyClinicDeal[] = []

  // Process each service line
  for (const serviceLine of serviceLines) {
    // Get top 3 high-demand states for this service line
    const topStates = await getTopDemandStates(serviceLine)
    
    // Process each region
    for (const state of topStates) {
      try {
        // Find clinics in this region for this service line
        const serviceLineMap: Record<string, 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'> = {
          'TRT': 'TRT',
          'GLP-1': 'WEIGHT_LOSS',
          'IV Therapy': 'IV_THERAPY',
        }
        
        const findResult = await findMensClinicsByRegion({
          region: state,
          serviceLine: serviceLineMap[serviceLine] || 'GENERAL',
        })

        // Limit to 5 clinics per service line per region
        const clinicsToProcess = findResult.clinics.slice(0, 5)

        // Get demand hints for this region/service line
        const mappedServiceLine = SERVICE_LINE_MAP[serviceLine]
        let demandHints: RegionalDemandHint[] = []
        if (mappedServiceLine) {
          try {
            const demandData = await queryRegionDemand({ serviceLine: mappedServiceLine })
            demandHints = demandData
              .filter(d => d.region === state || d.region === `US-${state}`)
              .map(d => ({
                region: d.region,
                serviceLine: d.serviceLine,
                demandIndex: d.demand_index,
                trend: d.trend,
              }))
          } catch (error) {
            console.error('Error fetching demand hints:', error)
          }
        }

        // Process each clinic
        for (const clinic of clinicsToProcess) {
          try {
            // Enrich clinic profile
            let enrichedProfile: EnrichedClinicProfile | undefined
            if (clinic.website) {
              try {
                const enrichResult = await enrichClinicProfile({ websiteUrl: clinic.website })
                enrichedProfile = enrichResult.profile
              } catch (error) {
                console.error(`Error enriching clinic ${clinic.name}:`, error)
              }
            }

            // Get ads snapshot
            const adsSnapshotResult = await getAdsPresenceSnapshot({
              clinicName: clinic.name,
              websiteUrl: clinic.website || undefined,
              region: state,
            })
            const adsSnapshot = adsSnapshotResult.snapshot

            // Generate outreach pack
            let outreachPack: OutreachPack | undefined
            let firstEmailMsg = ''
            let recommendedAction = ''
            
            try {
              const outreachResult = await generateOutreachPack({
                clinic,
                enrichedProfile,
                adsSnapshot,
                demandHints,
              })
              outreachPack = outreachResult.pack
              firstEmailMsg = outreachResult.pack.firstEmail.body
              recommendedAction = outreachResult.pack.nextSteps[0] || 'Follow up with outreach pack'
            } catch (error) {
              console.error(`Error generating outreach for ${clinic.name}:`, error)
              firstEmailMsg = `Hi, I noticed ${clinic.name} and wanted to introduce Novalyte™ AI. We help men's health clinics scale patient acquisition efficiently.`
              recommendedAction = 'Send initial outreach email'
            }

            // Calculate priority score
            const priorityScore = calculatePriorityScore(
              clinic,
              enrichedProfile,
              adsSnapshot,
              demandHints
            )

            // Categorize clinic
            const category = categorizeClinic(adsSnapshot, priorityScore, demandHints)

            allClinics.push({
              summaryProfile: {
                clinic,
                enrichedProfile,
              },
              adsSnapshot,
              priorityScore,
              category,
              firstEmailMsg,
              recommendedAction,
              outreachPack,
            })
          } catch (error) {
            console.error(`Error processing clinic ${clinic.name}:`, error)
            // Continue with next clinic
          }
        }
      } catch (error) {
        console.error(`Error processing region ${state} for ${serviceLine}:`, error)
        // Continue with next region
      }
    }
  }

  // Rank clinics by priority score
  const rankedClinics = allClinics.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 25)

  // Count by category
  const fastWins = rankedClinics.filter(c => c.category === 'fast_wins').length
  const mediumPotential = rankedClinics.filter(c => c.category === 'medium_potential').length
  const longShot = rankedClinics.filter(c => c.category === 'long_shot').length

  return {
    timestamp: new Date().toISOString(),
    clinics: rankedClinics,
    summary: {
      fastWins,
      mediumPotential,
      longShot,
      totalClinics: rankedClinics.length,
    },
  }
}

/**
 * 2. cron_set_delivery_channel
 * Choose where the daily list gets sent.
 */
export async function cronSetDeliveryChannel(
  channel: DeliveryChannel,
  userId: string = 'default'
): Promise<DeliveryChannelResult> {
  // Store preference in cache (replace with Redis/DB in production)
  deliveryChannelCache.set(userId, channel)
  
  return {
    message: `Delivery channel set to ${channel}. Daily dealflow results will be delivered via ${channel}.`,
    channel,
  }
}

/**
 * Get current delivery channel preference
 */
export function getDeliveryChannel(userId: string = 'default'): DeliveryChannel {
  return deliveryChannelCache.get(userId) || 'dashboard'
}

/**
 * 3. cron_push_daily_results
 * Deliver the generated drop to the chosen channel.
 */
export async function cronPushDailyResults(
  results: DailyDealflowRunResult,
  userId: string = 'default'
): Promise<{ success: boolean; message: string; channel: DeliveryChannel }> {
  const channel = getDeliveryChannel(userId)
  const formatted = formatDailyResults(results)

  try {
    switch (channel) {
      case 'dashboard':
        // Results are already available via API, just return success
        return {
          success: true,
          message: 'Results available in Dealflow Console dashboard',
          channel: 'dashboard',
        }
      
      case 'email':
        // TODO: Implement email sending
        console.log('Email delivery (not implemented):', formatted)
        return {
          success: true,
          message: 'Email delivery not yet implemented. Results available in dashboard.',
          channel: 'email',
        }
      
      case 'slack':
        // TODO: Implement Slack webhook
        console.log('Slack delivery (not implemented):', formatted)
        return {
          success: true,
          message: 'Slack delivery not yet implemented. Results available in dashboard.',
          channel: 'slack',
        }
      
      case 'sms':
        // TODO: Implement SMS sending
        console.log('SMS delivery (not implemented):', formatted)
        return {
          success: true,
          message: 'SMS delivery not yet implemented. Results available in dashboard.',
          channel: 'sms',
        }
      
      default:
        return {
          success: false,
          message: `Unknown delivery channel: ${channel}`,
          channel,
        }
    }
  } catch (error) {
    console.error('Error pushing daily results:', error)
    return {
      success: false,
      message: `Failed to push results: ${error instanceof Error ? error.message : 'Unknown error'}`,
      channel,
    }
  }
}

/**
 * Format daily results into a clean digest
 */
function formatDailyResults(results: DailyDealflowRunResult): FormattedDailyResults {
  const fastWins = results.clinics.filter(c => c.category === 'fast_wins')
  const mediumPotential = results.clinics.filter(c => c.category === 'medium_potential')
  const longShot = results.clinics.filter(c => c.category === 'long_shot')

  const clinicsRunningAds = results.clinics.filter(c => c.adsSnapshot.isRunningAds).length
  
  const clinicsWithWeakFunnels = results.clinics.filter(c => {
    const funnel = c.summaryProfile.enrichedProfile?.funnelStyle
    return funnel === 'contact_form' || funnel === 'mixed'
  }).length

  const regions = new Set<string>()
  results.clinics.forEach(c => {
    regions.add(c.summaryProfile.clinic.location.state)
  })
  const topRegions = Array.from(regions).slice(0, 5)

  return {
    timestamp: results.timestamp,
    digest: {
      fastWins,
      mediumPotential,
      longShot,
    },
    summary: {
      totalClinics: results.clinics.length,
      clinicsRunningAds,
      clinicsWithWeakFunnels,
      topRegions,
    },
  }
}

/**
 * 4. cron_simulate
 * Test-run the cron system instantly (useful for debugging).
 */
export async function cronSimulate(): Promise<DailyDealflowRunResult> {
  console.log('Simulating daily dealflow run...')
  
  // Create 3 sample clinics with realistic data
  const sampleClinics: DailyClinicDeal[] = [
    {
      summaryProfile: {
        clinic: {
          name: 'Elite Men\'s Health Dallas',
          website: 'https://elitemenshealthdallas.com',
          location: {
            city: 'Dallas',
            state: 'TX',
            country: 'US',
          },
          category: 'mens_clinic',
          serviceLines: ['TRT'],
          phone: '+1-214-555-0100',
        },
        enrichedProfile: {
          website: 'https://elitemenshealthdallas.com',
          servicesOffered: ['TRT', 'Peptides', 'IV Therapy'],
          pricingSignals: {
            hasPricingPage: true,
            priceRange: '$$',
            freeConsultOffered: true,
          },
          ctas: ['Book Consultation', 'Schedule Free Consult'],
          telehealthAvailable: false,
          funnelStyle: 'consultation_first',
          keyMessaging: ['Energy & Vitality', 'Hormone Optimization'],
          targetAudience: ['Men 30-55'],
          lastUpdated: new Date().toISOString(),
        },
      },
      adsSnapshot: {
        isRunningAds: true,
        platforms: [
          {
            platform: 'Meta',
            activeCampaignCount: 5,
            primaryObjectives: ['Lead Generation'],
          },
          {
            platform: 'Google',
            activeCampaignCount: 3,
            primaryObjectives: ['Lead Generation'],
          },
        ],
        regionsTargeted: [{ region: 'US-TX', intensity: 'HIGH' }],
        creativeAngles: ['Low T symptoms relief', 'Energy & vitality boost'],
        offers: ['Free consultation', 'First month 50% off'],
        ctaPatterns: ['Book now', 'Schedule free consult'],
        estimatedSpendBand: 'high',
        lastSeenActive: new Date().toISOString(),
        confidence: 0.9,
      },
      priorityScore: 95,
      category: 'fast_wins',
      firstEmailMsg: 'Hi there,\n\nI noticed Elite Men\'s Health Dallas is actively running ads on Meta and Google for TRT services. Novalyte™ AI can help optimize your funnel and reduce cost per lead while improving lead quality.\n\nWould you be open to a brief 15-minute conversation?\n\nBest regards,\nNovalyte™ AI Team',
      recommendedAction: 'Send personalized email with outreach pack',
    },
    {
      summaryProfile: {
        clinic: {
          name: 'Vitality Wellness Miami',
          website: 'https://vitalitywellnessmiami.com',
          location: {
            city: 'Miami',
            state: 'FL',
            country: 'US',
          },
          category: 'wellness_center',
          serviceLines: ['WEIGHT_LOSS', 'IV_THERAPY'],
          phone: '+1-305-555-0200',
        },
        enrichedProfile: {
          website: 'https://vitalitywellnessmiami.com',
          servicesOffered: ['GLP-1 Weight Loss', 'IV Therapy', 'Peptides'],
          pricingSignals: {
            hasPricingPage: false,
            freeConsultOffered: true,
          },
          ctas: ['Contact Us', 'Get Started'],
          telehealthAvailable: true,
          funnelStyle: 'contact_form',
          keyMessaging: ['Medical Weight Loss', 'Performance Enhancement'],
          targetAudience: ['Men 30-55', 'High performers'],
          lastUpdated: new Date().toISOString(),
        },
      },
      adsSnapshot: {
        isRunningAds: false,
        platforms: [],
        regionsTargeted: [],
        creativeAngles: [],
        offers: [],
        ctaPatterns: [],
        estimatedSpendBand: 'low',
        lastSeenActive: null,
        confidence: 0.9,
      },
      priorityScore: 65,
      category: 'medium_potential',
      firstEmailMsg: 'Hi there,\n\nI noticed Vitality Wellness Miami focuses on GLP-1 weight loss and IV therapy in Miami, FL. Your region shows strong demand for these services. Novalyte™ AI can help you capture more of that demand efficiently.\n\nWould you be open to a brief conversation?\n\nBest regards,\nNovalyte™ AI Team',
      recommendedAction: 'Research their website and current positioning',
    },
    {
      summaryProfile: {
        clinic: {
          name: 'Peak Performance Las Vegas',
          website: 'https://peakperformancelv.com',
          location: {
            city: 'Las Vegas',
            state: 'NV',
            country: 'US',
          },
          category: 'mens_clinic',
          serviceLines: ['IV_THERAPY'],
          phone: '+1-702-555-0300',
        },
        enrichedProfile: {
          website: 'https://peakperformancelv.com',
          servicesOffered: ['IV Therapy', 'Recovery'],
          pricingSignals: {
            hasPricingPage: true,
            priceRange: '$$$',
            freeConsultOffered: false,
          },
          ctas: ['Book Appointment'],
          telehealthAvailable: false,
          funnelStyle: 'direct_booking',
          keyMessaging: ['Recovery', 'Performance'],
          targetAudience: ['Athletes'],
          lastUpdated: new Date().toISOString(),
        },
      },
      adsSnapshot: {
        isRunningAds: true,
        platforms: [
          {
            platform: 'Meta',
            activeCampaignCount: 2,
            primaryObjectives: ['Traffic'],
          },
        ],
        regionsTargeted: [{ region: 'US-NV', intensity: 'MEDIUM' }],
        creativeAngles: ['IV hydration & recovery'],
        offers: ['Free assessment'],
        ctaPatterns: ['Book now'],
        estimatedSpendBand: 'medium',
        lastSeenActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85,
      },
      priorityScore: 75,
      category: 'fast_wins',
      firstEmailMsg: 'Hi there,\n\nI noticed Peak Performance Las Vegas is running ads for IV therapy services. Novalyte™ AI can help optimize your funnel and improve lead quality.\n\nWould you be open to a brief conversation?\n\nBest regards,\nNovalyte™ AI Team',
      recommendedAction: 'Connect with decision-maker on LinkedIn',
    },
  ]

  return {
    timestamp: new Date().toISOString(),
    clinics: sampleClinics,
    summary: {
      fastWins: 2,
      mediumPotential: 1,
      longShot: 0,
      totalClinics: 3,
    },
  }
}


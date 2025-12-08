/**
 * MCP Tool: export_dealflow_batch
 * 
 * Batch process multiple clinics through the full dealflow pipeline
 */

import { findMensClinicsByRegion, ClinicBasic } from './find-mens-clinics-by-region'
import { enrichClinicProfile } from './enrich-clinic-profile'
import { getAdsPresenceSnapshot } from './ads-presence-snapshot'
import { generateOutreachPack, RegionalDemandHint } from './vertex-outreach-brain'

export interface DealflowClinic {
  clinic: ClinicBasic
  enrichedProfile?: any // EnrichedClinicProfile
  adsSnapshot: any // AdsPresenceSnapshot
  outreachPack: any // OutreachPack
  priorityScore: 'high' | 'medium' | 'low'
  estimatedValue: string
  processedAt: string
}

export interface DealflowBatchInput {
  region: string
  serviceLine?: 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'
  maxClinics?: number // Limit number of clinics to process (default: 20)
  includeEnrichment?: boolean // Whether to enrich profiles (slower but more data)
  demandHints?: RegionalDemandHint[] // Optional pre-fetched demand data
}

export interface DealflowBatchOutput {
  clinics: DealflowClinic[]
  totalProcessed: number
  summary: {
    highPriority: number
    mediumPriority: number
    lowPriority: number
    withAds: number
    withoutAds: number
    estimatedTotalValue: string // e.g., "$500K+ annual potential"
  }
  region: string
  serviceLine?: string
  processedAt: string
}

/**
 * Batch process clinics through full dealflow pipeline
 * 
 * Flow:
 * 1. Find clinics in region
 * 2. For each clinic:
 *    a. Enrich profile (if enabled)
 *    b. Get ads snapshot
 *    c. Generate outreach pack
 *    d. Rank by priority
 * 3. Return ranked list
 */
export async function exportDealflowBatch(input: DealflowBatchInput): Promise<DealflowBatchOutput> {
  const {
    region,
    serviceLine,
    maxClinics = 20,
    includeEnrichment = true,
    demandHints,
  } = input

  try {
    console.log(`[Dealflow] Starting batch export for ${region}${serviceLine ? ` (${serviceLine})` : ''}`)

    // Step 1: Find clinics
    console.log(`[Dealflow] Step 1: Finding clinics...`)
    const clinicsResult = await findMensClinicsByRegion({ region, serviceLine })
    const clinicsToProcess = clinicsResult.clinics.slice(0, maxClinics)

    console.log(`[Dealflow] Found ${clinicsToProcess.length} clinics to process`)

    // Step 2: Process each clinic
    const processedClinics: DealflowClinic[] = []

    for (let i = 0; i < clinicsToProcess.length; i++) {
      const clinic = clinicsToProcess[i]
      console.log(`[Dealflow] Processing ${i + 1}/${clinicsToProcess.length}: ${clinic.name}`)

      try {
        // Enrich profile (if enabled)
        let enrichedProfile = undefined
        if (includeEnrichment && clinic.website) {
          try {
            enrichedProfile = await enrichClinicProfile({ websiteUrl: clinic.website })
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (error) {
            console.warn(`[Dealflow] Failed to enrich ${clinic.name}:`, error)
          }
        }

        // Get ads snapshot
        const adsSnapshotResult = await getAdsPresenceSnapshot({
          clinicName: clinic.name,
          websiteUrl: clinic.website || undefined,
          region: clinic.location.state,
        })
        const adsSnapshot = adsSnapshotResult.snapshot

        // Generate outreach pack
        const outreachResult = await generateOutreachPack({
          clinic,
          enrichedProfile: enrichedProfile?.profile,
          adsSnapshot,
          demandHints,
        })
        const outreachPack = outreachResult.pack

        // Create dealflow clinic entry
        const dealflowClinic: DealflowClinic = {
          clinic,
          enrichedProfile: enrichedProfile?.profile,
          adsSnapshot,
          outreachPack,
          priorityScore: outreachPack.priorityScore,
          estimatedValue: outreachPack.estimatedValue,
          processedAt: new Date().toISOString(),
        }

        processedClinics.push(dealflowClinic)

        // Small delay between clinics to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`[Dealflow] Error processing ${clinic.name}:`, error)
        // Continue with next clinic
      }
    }

    // Step 3: Rank by priority
    processedClinics.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priorityScore] - priorityOrder[a.priorityScore]
    })

    // Step 4: Calculate summary
    const highPriority = processedClinics.filter(c => c.priorityScore === 'high').length
    const mediumPriority = processedClinics.filter(c => c.priorityScore === 'medium').length
    const lowPriority = processedClinics.filter(c => c.priorityScore === 'low').length
    const withAds = processedClinics.filter(c => c.adsSnapshot.isRunningAds).length
    const withoutAds = processedClinics.length - withAds

    // Estimate total value (rough calculation)
    const estimatedTotal = highPriority * 50 + mediumPriority * 30 + lowPriority * 15
    const estimatedTotalValue = estimatedTotal >= 500
      ? `$${estimatedTotal}K+ annual potential`
      : estimatedTotal >= 200
      ? `$${estimatedTotal}K annual potential`
      : `$${estimatedTotal}K annual potential`

    console.log(`[Dealflow] Batch complete: ${processedClinics.length} clinics processed`)

    return {
      clinics: processedClinics,
      totalProcessed: processedClinics.length,
      summary: {
        highPriority,
        mediumPriority,
        lowPriority,
        withAds,
        withoutAds,
        estimatedTotalValue,
      },
      region,
      serviceLine,
      processedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error in batch export:', error)
    throw new Error(`Batch export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * MCP Tool metadata
 */
export const batchExportToolMetadata = {
  name: 'export_dealflow_batch',
  description: 'Batch process multiple clinics through full dealflow pipeline and return ranked list with outreach packs',
  inputSchema: {
    type: 'object',
    properties: {
      region: {
        type: 'string',
        description: 'Region (state code, city+state, or full state name)',
      },
      serviceLine: {
        type: 'string',
        enum: ['TRT', 'WEIGHT_LOSS', 'IV_THERAPY', 'GENERAL'],
        description: 'Service line filter (optional)',
      },
      maxClinics: {
        type: 'number',
        description: 'Maximum number of clinics to process (default: 20)',
      },
      includeEnrichment: {
        type: 'boolean',
        description: 'Whether to enrich profiles (default: true)',
      },
      demandHints: {
        type: 'array',
        description: 'Pre-fetched regional demand data (optional)',
      },
    },
    required: ['region'],
  },
}


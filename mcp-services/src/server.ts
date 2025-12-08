/**
 * Novalyte MCP Services - Cloud Run Server
 * 
 * Provides REST API endpoints for:
 * - /dealflow/spikes - Regional demand spike detection
 * - /market-intel/trends - Treatment trend analysis
 * - /workforce/matches - Staff-shift matching
 * 
 * Authentication: Application Default Credentials (ADC)
 * Database: BigQuery (demand/intent) + PostgreSQL (operational data)
 */

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { BigQuery } from '@google-cloud/bigquery'
import { Pool } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json())

// Initialize BigQuery client (uses ADC)
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
})

// Initialize PostgreSQL pool
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'novalyte-mcp-services',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

/**
 * GET /dealflow/spikes
 * 
 * Get regional demand spikes for treatments
 * 
 * Query params:
 * - region: string (required) - Region to analyze
 * - treatment: string[] (optional) - Treatment types to filter
 * - days: number (optional, default: 30) - Lookback window
 * - threshold: number (optional, default: 1.5) - Spike threshold multiplier
 */
app.get('/dealflow/spikes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { region, treatment, days = 30, threshold = 1.5 } = req.query

    // Validate required params
    if (!region || typeof region !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid required parameter: region',
      })
    }

    // Validate and parse optional params
    const lookbackDays = parseInt(days as string, 10)
    if (isNaN(lookbackDays) || lookbackDays < 1 || lookbackDays > 365) {
      return res.status(400).json({
        error: 'Invalid days parameter. Must be between 1 and 365',
      })
    }

    const spikeThreshold = parseFloat(threshold as string)
    if (isNaN(spikeThreshold) || spikeThreshold < 1.0 || spikeThreshold > 10.0) {
      return res.status(400).json({
        error: 'Invalid threshold parameter. Must be between 1.0 and 10.0',
      })
    }

    const treatmentArray = treatment
      ? (Array.isArray(treatment) ? treatment : [treatment]).filter((t): t is string => typeof t === 'string')
      : []

    // Build BigQuery query
    const treatmentFilter = treatmentArray.length > 0
      ? `AND treatment IN (${treatmentArray.map(t => `'${t}'`).join(', ')})`
      : ''

    const query = `
      SELECT
        region,
        treatment,
        DATE(timestamp) as date,
        AVG(demand_index) as avg_demand,
        COUNT(*) as data_points
      FROM \`${process.env.BIGQUERY_DATASET || 'novalyte'}.demand_signals\`
      WHERE
        region = @region
        ${treatmentFilter}
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
      GROUP BY region, treatment, DATE(timestamp)
      ORDER BY date DESC, avg_demand DESC
      LIMIT 100
    `

    const options = {
      query,
      params: {
        region: region as string,
        days: lookbackDays,
      },
    }

    const [rows] = await bigquery.query(options)

    // Calculate spikes (simplified - in production, use more sophisticated detection)
    const spikes = rows
      .map((row: any) => {
        const baseline = rows
          .filter((r: any) => r.treatment === row.treatment)
          .slice(1)
          .reduce((sum: number, r: any) => sum + parseFloat(r.avg_demand), 0) / (rows.length - 1 || 1)

        const currentValue = parseFloat(row.avg_demand)
        const magnitude = baseline > 0 ? currentValue / baseline : 1

        if (magnitude >= spikeThreshold) {
          return {
            region: row.region,
            treatment: row.treatment,
            spikeMagnitude: parseFloat(magnitude.toFixed(2)),
            baselineValue: parseFloat(baseline.toFixed(2)),
            currentValue: parseFloat(currentValue.toFixed(2)),
            trend: magnitude > 2.0 ? 'spiking' : magnitude > 1.5 ? 'sustained_high' : 'rising',
            detectedAt: row.date,
            opportunityScore: Math.min(100, Math.round(magnitude * 30)),
          }
        }
        return null
      })
      .filter((spike: any) => spike !== null)

    res.json({
      spikes,
      summary: {
        totalSpikes: spikes.length,
        region: region as string,
        lookbackWindow: {
          days: lookbackDays,
          startDate: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /market-intel/trends
 * 
 * Get treatment trend map across regions
 * 
 * Query params:
 * - treatment: string[] (optional) - Treatment types to analyze
 * - region: string (optional, default: 'ALL') - Region filter
 * - days: number (optional, default: 90) - Lookback window
 * - granularity: 'daily' | 'weekly' | 'monthly' (optional, default: 'weekly')
 */
app.get('/market-intel/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treatment, region = 'ALL', days = 90, granularity = 'weekly' } = req.query

    // Validate params
    const lookbackDays = parseInt(days as string, 10)
    if (isNaN(lookbackDays) || lookbackDays < 1 || lookbackDays > 730) {
      return res.status(400).json({
        error: 'Invalid days parameter. Must be between 1 and 730',
      })
    }

    const validGranularities = ['daily', 'weekly', 'monthly']
    if (!validGranularities.includes(granularity as string)) {
      return res.status(400).json({
        error: `Invalid granularity. Must be one of: ${validGranularities.join(', ')}`,
      })
    }

    const treatmentArray = treatment
      ? (Array.isArray(treatment) ? treatment : [treatment]).filter((t): t is string => typeof t === 'string')
      : ['ALL']

    const regionFilter = region === 'ALL' ? '' : `AND region = @region`

    // Build BigQuery query based on granularity
    let dateGrouping = ''
    switch (granularity) {
      case 'daily':
        dateGrouping = 'DATE(timestamp)'
        break
      case 'weekly':
        dateGrouping = 'DATE_TRUNC(DATE(timestamp), WEEK)'
        break
      case 'monthly':
        dateGrouping = 'DATE_TRUNC(DATE(timestamp), MONTH)'
        break
    }

    const treatmentFilter = treatmentArray.includes('ALL')
      ? ''
      : `AND treatment IN (${treatmentArray.map(t => `'${t}'`).join(', ')})`

    const query = `
      SELECT
        treatment,
        region,
        ${dateGrouping} as time_point,
        AVG(search_volume) as avg_search_volume,
        AVG(demand_index) as avg_demand_index,
        COUNT(*) as data_points
      FROM \`${process.env.BIGQUERY_DATASET || 'novalyte'}.trend_data\`
      WHERE
        timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
        ${regionFilter}
        ${treatmentFilter}
      GROUP BY treatment, region, ${dateGrouping}
      ORDER BY time_point DESC, avg_demand_index DESC
      LIMIT 500
    `

    const options: any = {
      query,
      params: {
        days: lookbackDays,
      },
    }

    if (region !== 'ALL') {
      options.params.region = region as string
    }

    const [rows] = await bigquery.query(options)

    // Transform results
    const trendMap = rows.map((row: any) => ({
      treatment: row.treatment,
      region: row.region,
      timePoint: row.time_point.value || row.time_point,
      metrics: {
        searchVolume: parseFloat(row.avg_search_volume?.toFixed(2) || '0'),
        demandIndex: parseFloat(row.avg_demand_index?.toFixed(2) || '0'),
        growthRate: 0, // Calculate in production
        trend: 'stable' as const,
        marketShare: 0, // Calculate in production
      },
      signals: [],
    }))

    res.json({
      trendMap,
      summary: {
        totalDataPoints: trendMap.length,
        treatmentsAnalyzed: [...new Set(trendMap.map((t: any) => t.treatment))],
        regionsAnalyzed: [...new Set(trendMap.map((t: any) => t.region))],
        timeWindow: {
          startDate: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          days: lookbackDays,
        },
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /workforce/matches
 * 
 * Match available shifts to qualified staff
 * 
 * Query params:
 * - shiftIds: string[] (required) - Array of shift IDs to match
 * - region: string (optional) - Region filter for staff search
 * - minScore: number (optional, default: 50) - Minimum compatibility score
 */
app.get('/workforce/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shiftIds, region, minScore = 50 } = req.query

    // Validate required params
    if (!shiftIds) {
      return res.status(400).json({
        error: 'Missing required parameter: shiftIds',
      })
    }

    const shiftIdArray = Array.isArray(shiftIds) ? shiftIds : [shiftIds]
    if (shiftIdArray.length === 0) {
      return res.status(400).json({
        error: 'shiftIds must contain at least one shift ID',
      })
    }

    const minCompatibilityScore = parseFloat(minScore as string)
    if (isNaN(minCompatibilityScore) || minCompatibilityScore < 0 || minCompatibilityScore > 100) {
      return res.status(400).json({
        error: 'Invalid minScore parameter. Must be between 0 and 100',
      })
    }

    // Query shifts from PostgreSQL
    const shiftQuery = `
      SELECT
        s.id as shift_id,
        s.clinic_id,
        c.name as clinic_name,
        c.city,
        c.state,
        s.start_time,
        s.end_time,
        s.required_role_type,
        s.required_skills,
        s.treatment_type
      FROM shifts s
      JOIN clinics c ON s.clinic_id = c.id
      WHERE s.id = ANY($1::text[])
    `

    const shiftResult = await pgPool.query(shiftQuery, [shiftIdArray])
    const shifts = shiftResult.rows

    if (shifts.length === 0) {
      return res.status(404).json({
        error: 'No shifts found for provided shift IDs',
      })
    }

    // Query available staff
    let staffQuery = `
      SELECT
        id as staff_id,
        display_name,
        role_type,
        skills,
        preferred_regions,
        city,
        state,
        years_experience
      FROM staff
      WHERE
        availability_status = 'available'
        AND role_type = ANY($1::text[])
    `

    const requiredRoleTypes = [...new Set(shifts.map((s: any) => s.required_role_type))]
    const queryParams: any[] = [requiredRoleTypes]

    if (region) {
      staffQuery += ` AND (state = $2 OR city ILIKE $2 OR preferred_regions @> ARRAY[$2])`
      queryParams.push(region as string)
    }

    const staffResult = await pgPool.query(staffQuery, queryParams)
    const staff = staffResult.rows

    // Match shifts to staff (simplified matching logic)
    const matches: any[] = []
    const unmatchedShifts: any[] = []

    for (const shift of shifts) {
      const shiftSkills = shift.required_skills || []
      let bestMatch: any = null
      let bestScore = 0

      for (const staffMember of staff) {
        // Calculate compatibility score
        let score = 0

        // Role match (40 points)
        if (staffMember.role_type === shift.required_role_type) {
          score += 40
        }

        // Skills match (30 points)
        const staffSkills = staffMember.skills || []
        const matchingSkills = shiftSkills.filter((skill: string) => staffSkills.includes(skill))
        score += (matchingSkills.length / Math.max(shiftSkills.length, 1)) * 30

        // Location match (20 points)
        if (staffMember.state === shift.state) {
          score += 20
        } else if (staffMember.preferred_regions?.includes(shift.state)) {
          score += 10
        }

        // Experience bonus (10 points)
        if (staffMember.years_experience >= 3) {
          score += 10
        }

        if (score > bestScore && score >= minCompatibilityScore) {
          bestScore = score
          bestMatch = {
            shiftId: shift.shift_id,
            staffId: staffMember.staff_id,
            compatibilityScore: Math.round(score),
            scoreBreakdown: {
              roleMatch: staffMember.role_type === shift.required_role_type ? 40 : 0,
              skillsMatch: Math.round((matchingSkills.length / Math.max(shiftSkills.length, 1)) * 30),
              availabilityMatch: 50, // Simplified - check actual availability in production
              locationMatch: staffMember.state === shift.state ? 20 : staffMember.preferred_regions?.includes(shift.state) ? 10 : 0,
            },
            shift: {
              shiftId: shift.shift_id,
              clinicName: shift.clinic_name,
              startTime: shift.start_time,
              endTime: shift.end_time,
              treatmentType: shift.treatment_type,
            },
            staff: {
              staffId: staffMember.staff_id,
              displayName: staffMember.display_name,
              roleType: staffMember.role_type,
              location: {
                city: staffMember.city,
                state: staffMember.state,
              },
            },
            recommendation: score >= 80 ? 'strong_match' : score >= 65 ? 'good_match' : 'acceptable_match',
            notes: `Match score: ${Math.round(score)}/100`,
          }
        }
      }

      if (bestMatch) {
        matches.push(bestMatch)
      } else {
        unmatchedShifts.push({
          shiftId: shift.shift_id,
          clinicName: shift.clinic_name,
          reason: 'no_qualified_staff',
          suggestions: ['Expand search region', 'Lower minimum score threshold', 'Check staff availability'],
        })
      }
    }

    res.json({
      matches,
      unmatchedShifts,
      summary: {
        totalShifts: shifts.length,
        matchedShifts: matches.length,
        unmatchedShifts: unmatchedShifts.length,
        totalMatches: matches.length,
        averageCompatibilityScore: matches.length > 0
          ? Math.round(matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length)
          : 0,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred processing your request',
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Novalyte MCP Services running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`BigQuery Project: ${process.env.GOOGLE_CLOUD_PROJECT || 'not set'}`)
  console.log(`PostgreSQL: ${process.env.POSTGRES_CONNECTION_STRING ? 'configured' : 'not configured'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await pgPool.end()
  process.exit(0)
})


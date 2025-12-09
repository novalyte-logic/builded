/**
 * Novalyte Dealflow Scheduler
 * 
 * Backend scheduler for running Dealflow Brain cycles:
 * - Every 24 hours: Full daily drop
 * - Every 6 hours: Market temperature check
 * - Every 1 hour: Light refresh
 */

import { unifiedDealflowBrain } from './dealflow-brain'
import { googleTrendsRegionScan } from './trend-insights-engine'
import { queryRegionDemand } from '../market-intel/bigquery-region-demand'
import { VertexAI } from '@google-cloud/vertexai'

export type ScheduleType = 'daily' | 'temperature' | 'refresh' | 'manual'
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface DailySnapshot {
  date: string // YYYY-MM-DD
  timestamp: string // ISO timestamp
  runId: string
  scheduleType: ScheduleType
  status: RunStatus
  hotClinics: any[]
  marketMoves: any[]
  predictiveAlerts: any[]
  actionPlan: {
    immediateActions: string[]
    strategicMoves: string[]
    competitivePlays: string[]
    supplyPrep: string[]
  }
  executiveSummary: {
    totalOpportunities: number
    criticalActions: number
    estimatedRevenuePotential: string
    confidenceLevel: 'high' | 'medium' | 'low'
  }
  error?: string
  cached?: boolean
}

export interface TemperatureLog {
  timestamp: string
  runId: string
  regionChanges: Array<{
    region: string
    serviceLine: string
    previousStatus: string
    newStatus: string
    reason: string
  }>
  emergingRegions: Array<{
    region: string
    serviceLine: string
    searchVolume: number
    velocity: number
  }>
  quickMoves: string[]
}

export interface RefreshHeartbeat {
  timestamp: string
  runId: string
  updatedClinicScores: Array<{
    clinicName: string
    previousScore: number
    newScore: number
    reason: string
  }>
  summaryNote: string[]
  assessmentCounts: Record<string, number>
  leadConversions: number
}

// In-memory storage (replace with database in production)
const dailySnapshots = new Map<string, DailySnapshot>()
const temperatureLogs = new Map<string, TemperatureLog[]>()
const refreshHeartbeats = new Map<string, RefreshHeartbeat[]>()

/**
 * Generate unique run ID
 */
function generateRunId(scheduleType: ScheduleType): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${scheduleType}-${timestamp}-${random}`
}

/**
 * Check if snapshot already exists for timestamp
 */
function snapshotExists(date: string, scheduleType: ScheduleType): boolean {
  const key = `${date}-${scheduleType}`
  return dailySnapshots.has(key)
}

/**
 * Store daily snapshot
 */
function storeSnapshot(snapshot: DailySnapshot): void {
  const key = `${snapshot.date}-${snapshot.scheduleType}`
  dailySnapshots.set(key, snapshot)
  
  // Keep only last 7 days of snapshots
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 7)
  
  for (const [key, snap] of dailySnapshots.entries()) {
    const snapDate = new Date(snap.date)
    if (snapDate < cutoffDate) {
      dailySnapshots.delete(key)
    }
  }
}

/**
 * Get latest snapshot for a date
 */
export function getLatestSnapshot(date?: string): DailySnapshot | null {
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  // Try daily first, then temperature, then refresh
  const priorities: ScheduleType[] = ['daily', 'temperature', 'refresh']
  
  for (const type of priorities) {
    const key = `${targetDate}-${type}`
    const snapshot = dailySnapshots.get(key)
    if (snapshot && snapshot.status === 'completed') {
      return snapshot
    }
  }
  
  // Fallback: get most recent snapshot
  let latest: DailySnapshot | null = null
  for (const snapshot of dailySnapshots.values()) {
    if (!latest || new Date(snapshot.timestamp) > new Date(latest.timestamp)) {
      latest = snapshot
    }
  }
  
  return latest
}

/**
 * 24-HOUR CYCLE — Daily Dealflow Drop
 */
export async function runDailyCycle(): Promise<DailySnapshot> {
  const date = new Date().toISOString().split('T')[0]
  const runId = generateRunId('daily')
  
  // Check if already exists (idempotency)
  if (snapshotExists(date, 'daily')) {
    const existing = dailySnapshots.get(`${date}-daily`)
    if (existing && existing.status === 'completed') {
      console.log(`[Scheduler] Daily snapshot already exists for ${date}, skipping`)
      return existing
    }
  }
  
  const snapshot: DailySnapshot = {
    date,
    timestamp: new Date().toISOString(),
    runId,
    scheduleType: 'daily',
    status: 'running',
    hotClinics: [],
    marketMoves: [],
    predictiveAlerts: [],
    actionPlan: {
      immediateActions: [],
      strategicMoves: [],
      competitivePlays: [],
      supplyPrep: [],
    },
    executiveSummary: {
      totalOpportunities: 0,
      criticalActions: 0,
      estimatedRevenuePotential: '$0',
      confidenceLevel: 'low',
    },
  }
  
  storeSnapshot(snapshot)
  
  try {
    console.log(`[Scheduler] Starting daily cycle ${runId} for ${date}`)
    
    // Run unified dealflow brain
    const brainOutput = await unifiedDealflowBrain()
    
    // Update snapshot with results
    snapshot.hotClinics = brainOutput.hotClinics.clinics
    snapshot.marketMoves = brainOutput.marketMoves.topRegionsToDeployAds
    snapshot.predictiveAlerts = brainOutput.predictiveAlerts.alerts
    snapshot.actionPlan = brainOutput.actionPlan
    snapshot.executiveSummary = brainOutput.executiveSummary
    snapshot.status = 'completed'
    
    storeSnapshot(snapshot)
    
    console.log(`[Scheduler] Daily cycle ${runId} completed successfully`)
    return snapshot
  } catch (error) {
    console.error(`[Scheduler] Daily cycle ${runId} failed:`, error)
    snapshot.status = 'failed'
    snapshot.error = error instanceof Error ? error.message : 'Unknown error'
    
    // Try to use last known good snapshot
    const lastGood = getLatestSnapshot()
    if (lastGood && lastGood.status === 'completed') {
      snapshot.cached = true
      snapshot.hotClinics = lastGood.hotClinics
      snapshot.marketMoves = lastGood.marketMoves
      snapshot.predictiveAlerts = lastGood.predictiveAlerts
      snapshot.actionPlan = lastGood.actionPlan
      snapshot.executiveSummary = lastGood.executiveSummary
    }
    
    storeSnapshot(snapshot)
    return snapshot
  }
}

/**
 * 6-HOUR CYCLE — Market Temperature Check
 */
export async function runTemperatureCheck(): Promise<TemperatureLog> {
  const timestamp = new Date().toISOString()
  const runId = generateRunId('temperature')
  const date = new Date().toISOString().split('T')[0]
  
  const log: TemperatureLog = {
    timestamp,
    runId,
    regionChanges: [],
    emergingRegions: [],
    quickMoves: [],
  }
  
  try {
    console.log(`[Scheduler] Starting temperature check ${runId}`)
    
    // Get current snapshot for comparison
    const currentSnapshot = getLatestSnapshot(date)
    
    // Run lighter market trends scan
    const serviceLines = ['TRT', 'GLP-1', 'IV Therapy']
    const importantRegions = currentSnapshot?.marketMoves.map(m => m.region) || ['Texas', 'Florida', 'California']
    
    const regionChanges: TemperatureLog['regionChanges'] = []
    const emergingRegions: TemperatureLog['emergingRegions'] = []
    
    for (const serviceLine of serviceLines) {
      for (const region of importantRegions.slice(0, 5)) {
        try {
          // Google Trends scan
          const trendsData = await googleTrendsRegionScan({
            region,
            serviceLine: (serviceLine === 'GLP-1' ? 'Weight Loss' : serviceLine) as 'TRT' | 'Weight Loss' | 'IV Therapy',
          })
          
          // BigQuery demand check
          const mappedServiceLine = serviceLine === 'GLP-1' ? 'WEIGHT_LOSS' : 
                                   serviceLine === 'TRT' ? 'TRT' : 'IV_THERAPY'
          const demandData = await queryRegionDemand({
            serviceLine: mappedServiceLine,
          })
          
          const regionData = demandData.find(d => d.region === region)
          if (!regionData) continue
          
          // Check for status changes
          const previousStatus = currentSnapshot?.marketMoves.find(m => m.region === region && m.serviceLine === serviceLine)?.urgency || 'medium'
          
          let newStatus: 'critical' | 'high' | 'medium' = 'medium'
          if (trendsData.interestScore >= 85 && trendsData.trajectory30d.direction === 'RISING') {
            newStatus = 'critical'
          } else if (trendsData.interestScore >= 70) {
            newStatus = 'high'
          }
          
          if (previousStatus !== newStatus) {
            regionChanges.push({
              region,
              serviceLine,
              previousStatus,
              newStatus,
              reason: `Search interest ${trendsData.interestScore}/100, trend: ${trendsData.trajectory30d.direction}`,
            })
          }
          
          // Check for emerging regions
          if (trendsData.interestScore >= 75 && trendsData.trajectory30d.changePercent > 15) {
            const existing = emergingRegions.find(e => e.region === region && e.serviceLine === serviceLine)
            if (!existing) {
              emergingRegions.push({
                region,
                serviceLine,
                searchVolume: trendsData.interestScore,
                velocity: trendsData.trajectory30d.changePercent,
              })
            }
          }
        } catch (error) {
          console.error(`[Scheduler] Error scanning ${region} for ${serviceLine}:`, error)
        }
      }
    }
    
    log.regionChanges = regionChanges
    log.emergingRegions = emergingRegions
    
    // Generate quick moves
    const quickMoves: string[] = []
    for (const change of regionChanges) {
      if (change.newStatus === 'critical' && change.previousStatus !== 'critical') {
        quickMoves.push(`Deploy ${change.serviceLine} ads in ${change.region} - status upgraded to critical`)
      }
    }
    for (const emerging of emergingRegions) {
      quickMoves.push(`Watch ${emerging.region} for ${emerging.serviceLine} - emerging opportunity (${emerging.velocity}% growth)`)
    }
    
    log.quickMoves = quickMoves
    
    // Store log
    const dateKey = date
    if (!temperatureLogs.has(dateKey)) {
      temperatureLogs.set(dateKey, [])
    }
    temperatureLogs.get(dateKey)!.push(log)
    
    // Update daily snapshot with temperature changes
    const snapshot = getLatestSnapshot(date)
    if (snapshot) {
      snapshot.marketMoves = snapshot.marketMoves.map(move => {
        const change = regionChanges.find(c => c.region === move.region && c.serviceLine === move.serviceLine)
        if (change) {
          return { ...move, urgency: change.newStatus }
        }
        return move
      })
      storeSnapshot(snapshot)
    }
    
    console.log(`[Scheduler] Temperature check ${runId} completed`)
    return log
  } catch (error) {
    console.error(`[Scheduler] Temperature check ${runId} failed:`, error)
    return log
  }
}

/**
 * 1-HOUR CYCLE — Light Refresh
 */
export async function runLightRefresh(): Promise<RefreshHeartbeat> {
  const timestamp = new Date().toISOString()
  const runId = generateRunId('refresh')
  const date = new Date().toISOString().split('T')[0]
  
  const heartbeat: RefreshHeartbeat = {
    timestamp,
    runId,
    updatedClinicScores: [],
    summaryNote: [],
    assessmentCounts: {},
    leadConversions: 0,
  }
  
  try {
    console.log(`[Scheduler] Starting light refresh ${runId}`)
    
    // Get current snapshot
    const snapshot = getLatestSnapshot(date)
    if (!snapshot || snapshot.hotClinics.length === 0) {
      console.log(`[Scheduler] No snapshot available for refresh, skipping`)
      return heartbeat
    }
    
    // Update assessment counts (mock - replace with actual BigQuery in production)
    const serviceLines = ['TRT', 'WEIGHT_LOSS', 'IV_THERAPY']
    for (const serviceLine of serviceLines) {
      heartbeat.assessmentCounts[serviceLine] = Math.floor(Math.random() * 50) + 10
    }
    
    // Re-score top 20 clinics
    const topClinics = snapshot.hotClinics.slice(0, 20)
    const updatedScores: RefreshHeartbeat['updatedClinicScores'] = []
    
    for (const clinic of topClinics) {
      try {
        // Use Vertex AI to re-score (simplified - would use actual clinic data)
        const vertexAI = new VertexAI({
          project: process.env.GCP_PROJECT_ID || '',
          location: process.env.GCP_REGION || 'us-central1',
        })
        
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const prompt = `Re-score this clinic's priority based on recent activity:
Clinic: ${clinic.name}
Current Score: ${clinic.priorityScore}
Region: ${clinic.region}

Consider:
- Recent lead conversions
- Assessment velocity
- Market changes

Return only a number 0-100 for the new priority score.`
        
        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
        const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const newScore = parseInt(responseText.trim()) || clinic.priorityScore
        
        if (Math.abs(newScore - clinic.priorityScore) >= 5) {
          updatedScores.push({
            clinicName: clinic.name,
            previousScore: clinic.priorityScore,
            newScore,
            reason: newScore > clinic.priorityScore ? 'Increased activity detected' : 'Activity decreased',
          })
          
          // Update clinic in snapshot
          clinic.priorityScore = newScore
        }
      } catch (error) {
        console.error(`[Scheduler] Error re-scoring ${clinic.name}:`, error)
        // Continue with other clinics
      }
    }
    
    heartbeat.updatedClinicScores = updatedScores
    
    // Generate summary note
    const notes: string[] = []
    if (updatedScores.length > 0) {
      const upgraded = updatedScores.filter(s => s.newScore > s.previousScore).length
      const downgraded = updatedScores.filter(s => s.newScore < s.previousScore).length
      if (upgraded > 0) {
        notes.push(`${upgraded} clinic(s) upgraded priority`)
      }
      if (downgraded > 0) {
        notes.push(`${downgraded} clinic(s) downgraded priority`)
      }
    }
    
    const totalAssessments = Object.values(heartbeat.assessmentCounts).reduce((a, b) => a + b, 0)
    if (totalAssessments > 0) {
      notes.push(`${totalAssessments} new assessments in last hour`)
    }
    
    heartbeat.summaryNote = notes.length > 0 ? notes : ['No significant changes']
    
    // Store heartbeat
    const dateKey = date
    if (!refreshHeartbeats.has(dateKey)) {
      refreshHeartbeats.set(dateKey, [])
    }
    refreshHeartbeats.get(dateKey)!.push(heartbeat)
    
    // Update snapshot
    if (updatedScores.length > 0) {
      storeSnapshot(snapshot)
    }
    
    console.log(`[Scheduler] Light refresh ${runId} completed`)
    return heartbeat
  } catch (error) {
    console.error(`[Scheduler] Light refresh ${runId} failed:`, error)
    return heartbeat
  }
}

/**
 * Manual trigger wrapper
 */
export async function runManualTrigger(scheduleType: 'daily' | 'temperature' | 'refresh'): Promise<DailySnapshot | TemperatureLog | RefreshHeartbeat> {
  console.log(`[Scheduler] Manual trigger: ${scheduleType}`)
  
  switch (scheduleType) {
    case 'daily':
      return runDailyCycle()
    case 'temperature':
      return runTemperatureCheck()
    case 'refresh':
      return runLightRefresh()
  }
}

/**
 * Get temperature logs for a date
 */
export function getTemperatureLogs(date?: string): TemperatureLog[] {
  const targetDate = date || new Date().toISOString().split('T')[0]
  return temperatureLogs.get(targetDate) || []
}

/**
 * Get refresh heartbeats for a date
 */
export function getRefreshHeartbeats(date?: string): RefreshHeartbeat[] {
  const targetDate = date || new Date().toISOString().split('T')[0]
  return refreshHeartbeats.get(targetDate) || []
}


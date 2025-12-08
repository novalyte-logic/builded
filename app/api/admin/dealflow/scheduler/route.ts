/**
 * Dealflow Scheduler API
 * 
 * Endpoints for triggering scheduler cycles and retrieving snapshots
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  runDailyCycle,
  runTemperatureCheck,
  runLightRefresh,
  runManualTrigger,
  getLatestSnapshot,
  getTemperatureLogs,
  getRefreshHeartbeats,
} from '@/lib/mcp/dealflow/scheduler'

/**
 * GET - Retrieve latest snapshot or logs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'snapshot', 'temperature', 'refresh'
    const date = searchParams.get('date') || undefined

    switch (type) {
      case 'snapshot':
        const snapshot = getLatestSnapshot(date)
        if (!snapshot) {
          return NextResponse.json({ error: 'No snapshot found' }, { status: 404 })
        }
        return NextResponse.json({ snapshot })

      case 'temperature':
        const tempLogs = getTemperatureLogs(date)
        return NextResponse.json({ logs: tempLogs })

      case 'refresh':
        const heartbeats = getRefreshHeartbeats(date)
        return NextResponse.json({ heartbeats })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Scheduler GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Trigger scheduler cycles manually
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, scheduleType } = body

    if (action === 'trigger') {
      if (!scheduleType || !['daily', 'temperature', 'refresh'].includes(scheduleType)) {
        return NextResponse.json(
          { error: 'Invalid scheduleType. Must be: daily, temperature, or refresh' },
          { status: 400 }
        )
      }

      const result = await runManualTrigger(scheduleType)
      return NextResponse.json({
        success: true,
        scheduleType,
        result,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Scheduler POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


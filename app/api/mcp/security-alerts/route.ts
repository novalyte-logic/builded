/**
 * MCP Security Alerts API Route
 * 
 * GET /api/mcp/security-alerts
 * 
 * Returns recent security events for MCP usage.
 * 
 * Query Parameters:
 * - severity (optional): Filter by severity (LOW, MEDIUM, HIGH)
 * - serverId (optional): Filter by related server ID
 * - toolId (optional): Filter by related tool ID
 * - since (optional): ISO timestamp - only return alerts after this time
 * - limit (optional): Maximum number of alerts to return (default: 100, max: 500)
 * 
 * Future Integration:
 * - Pull from SIEM (Security Information and Event Management) system
 * - Query custom security alerts table in BigQuery
 * - Integrate with Cloud Security Command Center (SCC)
 * - Connect to custom alerting service for credential rotation warnings
 * - Support real-time alert streaming via webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_SECURITY_ALERTS } from '@/lib/mcp/mock-data'
import { McpSecurityAlert, McpSecuritySeverity } from '@/lib/mcp/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const severity = searchParams.get('severity') as McpSecuritySeverity | null
    const serverId = searchParams.get('serverId')
    const toolId = searchParams.get('toolId')
    const since = searchParams.get('since')
    const limitParam = searchParams.get('limit')

    // Validate limit
    let limit = 100
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10)
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { error: 'Invalid limit. Must be a positive integer' },
          { status: 400 }
        )
      }
      limit = Math.min(parsedLimit, 500) // Cap at 500
    }

    // Validate severity
    if (severity && !['LOW', 'MEDIUM', 'HIGH'].includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be LOW, MEDIUM, or HIGH' },
        { status: 400 }
      )
    }

    // Validate since timestamp
    let sinceDate: Date | null = null
    if (since) {
      sinceDate = new Date(since)
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid since parameter. Must be a valid ISO timestamp' },
          { status: 400 }
        )
      }
    }

    let alerts: McpSecurityAlert[] = MCP_SECURITY_ALERTS

    // Filter by severity
    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity)
    }

    // Filter by server ID
    if (serverId) {
      alerts = alerts.filter((a) => a.relatedServerId === serverId)
    }

    // Filter by tool ID
    if (toolId) {
      alerts = alerts.filter((a) => a.relatedToolId === toolId)
    }

    // Filter by timestamp
    if (sinceDate) {
      alerts = alerts.filter((a) => new Date(a.timestamp) >= sinceDate!)
    }

    // Sort by timestamp (newest first)
    alerts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply limit
    alerts = alerts.slice(0, limit)

    return NextResponse.json({
      alerts,
      count: alerts.length,
      limit,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching MCP security alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


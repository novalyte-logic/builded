/**
 * MCP Servers API Route
 * 
 * GET /api/mcp/servers
 * 
 * Returns current status for all MCP servers.
 * 
 * Query Parameters:
 * - id (optional): Filter by server ID
 * 
 * Future Integration:
 * - Fetch from Cloud Monitoring API for real-time metrics
 * - Query Cloud Run service status for each MCP server
 * - Pull uptime/error rates from BigQuery metrics table
 * - Integrate with Cloud Logging for error rate calculations
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_SERVERS } from '@/lib/mcp/mock-data'
import { McpServer } from '@/lib/mcp/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serverId = searchParams.get('id')

    let servers: McpServer[] = MCP_SERVERS

    // Filter by server ID if provided
    if (serverId) {
      servers = servers.filter((s) => s.id === serverId)
      if (servers.length === 0) {
        return NextResponse.json(
          { error: 'Server not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({
      servers,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching MCP servers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


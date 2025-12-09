/**
 * MCP Server Detail API Route
 * 
 * GET /api/mcp/servers/:id
 * 
 * Returns detailed information for a single MCP server, including:
 * - Current status and metrics
 * - Recent traces (last N calls)
 * - Error history
 * - Performance trends
 * 
 * Future Integration:
 * - Fetch detailed metrics from Cloud Monitoring API
 * - Query Cloud Logging for recent traces and errors
 * - Pull performance history from BigQuery time-series table
 * - Integrate with Cloud Run service logs for detailed diagnostics
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_SERVERS, MCP_TRACES } from '@/lib/mcp/mock-data'
import { McpServer, McpTraceEvent } from '@/lib/mcp/types'

interface ServerDetailResponse {
  server: McpServer
  recentTraces: McpTraceEvent[]
  errorCount24h: number
  totalCalls24h: number
  generatedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = params.id

    // Find server
    const server = MCP_SERVERS.find((s) => s.id === serverId)
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const traceLimit = parseInt(searchParams.get('traceLimit') || '10', 10)

    // Filter traces for this server (last 24 hours)
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000

    const serverTraces = MCP_TRACES.filter(
      (trace) =>
        trace.serverName === server.name &&
        new Date(trace.timestamp).getTime() > last24h
    )

    // Sort by timestamp (newest first) and limit
    const recentTraces = serverTraces
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, traceLimit)

    const errorCount24h = serverTraces.filter((t) => t.status === 'ERROR').length
    const totalCalls24h = serverTraces.length

    const response: ServerDetailResponse = {
      server,
      recentTraces,
      errorCount24h,
      totalCalls24h,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching MCP server detail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


/**
 * MCP Traces API Route
 * 
 * GET /api/mcp/traces
 * 
 * Returns queryable recent agent/tool traces.
 * 
 * Query Parameters:
 * - limit (optional): Maximum number of traces to return (default: 50, max: 500)
 * - status (optional): Filter by status (SUCCESS, ERROR)
 * - serverId (optional): Filter by server ID
 * - toolName (optional): Filter by tool name
 * - agentName (optional): Filter by agent name
 * - since (optional): ISO timestamp - only return traces after this time
 * 
 * Future Integration:
 * - Query from BigQuery table with LLM/agent trace logs
 * - Pull from Cloud Logging structured logs
 * - Integrate with OpenTelemetry trace collector
 * - Support pagination with cursor-based navigation
 * - Add real-time streaming via Server-Sent Events (SSE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_TRACES } from '@/lib/mcp/mock-data'
import { McpTraceEvent, McpTraceStatus } from '@/lib/mcp/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const status = searchParams.get('status') as McpTraceStatus | null
    const serverId = searchParams.get('serverId')
    const toolName = searchParams.get('toolName')
    const agentName = searchParams.get('agentName')
    const since = searchParams.get('since')

    // Validate limit
    let limit = 50
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

    // Validate status
    if (status && !['SUCCESS', 'ERROR'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be SUCCESS or ERROR' },
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

    let traces: McpTraceEvent[] = MCP_TRACES

    // Filter by status
    if (status) {
      traces = traces.filter((t) => t.status === status)
    }

    // Filter by server ID (match by server name)
    if (serverId) {
      traces = traces.filter((t) => t.serverName.includes(serverId))
    }

    // Filter by tool name
    if (toolName) {
      traces = traces.filter((t) =>
        t.toolName.toLowerCase().includes(toolName.toLowerCase())
      )
    }

    // Filter by agent name
    if (agentName) {
      traces = traces.filter((t) =>
        t.agentName.toLowerCase().includes(agentName.toLowerCase())
      )
    }

    // Filter by timestamp
    if (sinceDate) {
      traces = traces.filter((t) => new Date(t.timestamp) >= sinceDate!)
    }

    // Sort by timestamp (newest first)
    traces.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply limit
    traces = traces.slice(0, limit)

    return NextResponse.json({
      traces,
      count: traces.length,
      limit,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching MCP traces:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


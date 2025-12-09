/**
 * MCP Tools API Route
 * 
 * GET /api/mcp/tools
 * 
 * Returns list of all tools across all MCP servers.
 * 
 * Query Parameters:
 * - serverId (optional): Filter by server ID
 * - scope (optional): Filter by scope (read, write, admin)
 * - status (optional): Filter by status (ACTIVE, DISABLED)
 * - search (optional): Search by tool name or description
 * 
 * Future Integration:
 * - Query MCP registry database/table for tool definitions
 * - Pull usage metrics from BigQuery analytics table
 * - Integrate with MCP server discovery service
 * - Cache tool registry for performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_TOOLS } from '@/lib/mcp/mock-data'
import { McpTool } from '@/lib/mcp/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serverId = searchParams.get('serverId')
    const scope = searchParams.get('scope')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let tools: McpTool[] = MCP_TOOLS

    // Filter by server ID
    if (serverId) {
      tools = tools.filter((t) => t.serverId === serverId)
    }

    // Filter by scope
    if (scope) {
      const validScopes = ['read', 'write', 'admin']
      if (!validScopes.includes(scope)) {
        return NextResponse.json(
          { error: 'Invalid scope. Must be one of: read, write, admin' },
          { status: 400 }
        )
      }
      tools = tools.filter((t) => t.scope === scope)
    }

    // Filter by status
    if (status) {
      const validStatuses = ['ACTIVE', 'DISABLED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ACTIVE, DISABLED' },
          { status: 400 }
        )
      }
      tools = tools.filter((t) => t.status === status)
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase()
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      tools,
      count: tools.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching MCP tools:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


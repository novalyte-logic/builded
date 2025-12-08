/**
 * MCP Tool Proxy API Route
 * 
 * Proxies MCP tool calls from the frontend to the appropriate MCP server.
 * This abstraction allows us to swap transport layers (HTTP, stdio, WebSocket) later.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { serverId: string; toolName: string } }
) {
  const { serverId, toolName } = params

  try {
    const body = await request.json()

    // Route to the appropriate MCP server handler
    // For now, we'll use the existing API routes structure
    const mcpServerRoutes: Record<string, string> = {
      'novalyte-dealflow-mcp': '/api/admin/mcp/dealflow',
      'novalyte-market-intel-mcp': '/api/admin/mcp/market-intel',
      'novalyte-workforce-mcp': '/api/admin/mcp/workforce',
      'novalyte-demand-intel-mcp': '/api/admin/mcp/demand-intel',
    }

    const serverRoute = mcpServerRoutes[serverId]

    if (!serverRoute) {
      return NextResponse.json(
        { error: { code: 'UNKNOWN_SERVER', message: `Unknown MCP server: ${serverId}` } },
        { status: 400 }
      )
    }

    // Forward the request to the MCP server's API route
    // In a real implementation, this would call the MCP server directly
    // For now, we'll proxy to the existing API structure
    const baseUrl = request.nextUrl.origin
    const proxyUrl = `${baseUrl}${serverRoute}`

    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        params: body,
      }),
    })

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text()
      return NextResponse.json(
        { error: { code: 'MCP_ERROR', message: errorText } },
        { status: proxyResponse.status }
      )
    }

    const result = await proxyResponse.json()

    // Return in MCP response format
    return NextResponse.json({
      data: result.results || result,
    })
  } catch (error) {
    console.error(`[MCP Proxy] Error proxying ${serverId}/${toolName}:`, error)
    
    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}


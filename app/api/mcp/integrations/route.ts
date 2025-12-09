/**
 * MCP Integrations API Route
 * 
 * GET /api/mcp/integrations
 * 
 * Returns status of external providers (BigQuery, Vertex AI, Stripe, n8n, Firestore, etc.).
 * 
 * Query Parameters:
 * - provider (optional): Filter by provider name (e.g., "Google Cloud", "Stripe")
 * - status (optional): Filter by status (LIVE, DEGRADED, OFFLINE)
 * 
 * Future Integration:
 * - Query Cloud Monitoring for Google Cloud service status
 * - Pull quota usage from Cloud Billing API
 * - Integrate with third-party status pages (Stripe, n8n, etc.)
 * - Cache integration status with TTL for performance
 * - Support webhook-based real-time status updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { MCP_INTEGRATIONS } from '@/lib/mcp/mock-data'
import { McpIntegrationStatus, McpIntegrationStatusType } from '@/lib/mcp/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider')
    const status = searchParams.get('status') as McpIntegrationStatusType | null

    // Validate status
    if (status && !['LIVE', 'DEGRADED', 'OFFLINE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be LIVE, DEGRADED, or OFFLINE' },
        { status: 400 }
      )
    }

    let integrations: McpIntegrationStatus[] = MCP_INTEGRATIONS

    // Filter by provider
    if (provider) {
      integrations = integrations.filter((i) =>
        i.provider.toLowerCase().includes(provider.toLowerCase())
      )
    }

    // Filter by status
    if (status) {
      integrations = integrations.filter((i) => i.status === status)
    }

    return NextResponse.json({
      integrations,
      count: integrations.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching MCP integrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


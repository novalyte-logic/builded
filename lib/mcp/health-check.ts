/**
 * MCP Health Check Utility
 * 
 * Lightweight health checks for MCP servers using simple tool calls.
 */

import { callMcpTool } from './client'
import { McpServerConfig } from './registry'

export type McpHealthStatus = 'live' | 'error' | 'disconnected' | 'checking'

export interface McpHealthCheckResult {
  serverId: string
  status: McpHealthStatus
  lastChecked?: Date
  error?: string
}

/**
 * Find the simplest tool to use for health check
 * Prefers tools with minimal required inputs
 */
function findHealthCheckTool(server: McpServerConfig): { toolName: string; input: Record<string, unknown> } | null {
  const tools = Object.entries(server.tools)
  
  if (tools.length === 0) return null

  // Prefer tools with no required inputs or minimal inputs
  const simpleTools = tools.filter(([, tool]) => {
    const requiredParams = Object.entries(tool.inputSchema).filter(([, param]) => param.required)
    return requiredParams.length === 0
  })

  if (simpleTools.length > 0) {
    const [toolName, tool] = simpleTools[0]
    const input: Record<string, unknown> = {}
    
    // Use defaults for optional params
    Object.entries(tool.inputSchema).forEach(([paramName, param]) => {
      if (!param.required && param.default !== undefined) {
        input[paramName] = param.default
      }
    })
    
    return { toolName, input }
  }

  // Fallback: use first tool with minimal required inputs
  const [toolName, tool] = tools[0]
  const input: Record<string, unknown> = {}
  
  // Build minimal input from required fields
  Object.entries(tool.inputSchema).forEach(([paramName, param]) => {
    if (param.required) {
      // Provide sensible defaults based on type
      if (param.type === 'string') {
        // Try to infer a reasonable default from description
        const desc = param.description?.toLowerCase() || ''
        if (desc.includes('region')) {
          input[paramName] = 'Texas'
        } else if (desc.includes('treatment') || desc.includes('service')) {
          input[paramName] = 'TRT'
        } else {
          input[paramName] = 'test'
        }
      } else if (param.type === 'string[]') {
        input[paramName] = []
      } else if (param.type === 'number') {
        input[paramName] = param.default || 1
      } else if (param.type === 'boolean') {
        input[paramName] = false
      } else {
        input[paramName] = {}
      }
    } else if (param.default !== undefined) {
      input[paramName] = param.default
    }
  })

  return { toolName, input }
}

/**
 * Perform a health check on an MCP server
 * 
 * @param server - MCP server configuration
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Health check result
 */
export async function checkMcpServerHealth(
  server: McpServerConfig,
  timeoutMs: number = 5000
): Promise<McpHealthCheckResult> {
  const healthCheckTool = findHealthCheckTool(server)
  
  if (!healthCheckTool) {
    return {
      serverId: server.id,
      status: 'error',
      lastChecked: new Date(),
      error: 'No tools available for health check',
    }
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
    })

    // Create the health check promise
    const healthCheckPromise = callMcpTool(
      server.id,
      healthCheckTool.toolName,
      healthCheckTool.input
    )

    // Race between health check and timeout
    await Promise.race([healthCheckPromise, timeoutPromise])

    return {
      serverId: server.id,
      status: 'live',
      lastChecked: new Date(),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Determine if it's a connection error or a tool error
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      return {
        serverId: server.id,
        status: 'disconnected',
        lastChecked: new Date(),
        error: errorMessage,
      }
    }

    // Other errors (tool errors, validation errors, etc.) still mean server is reachable
    return {
      serverId: server.id,
      status: 'error',
      lastChecked: new Date(),
      error: errorMessage,
    }
  }
}

/**
 * Batch health check for multiple servers
 * 
 * @param servers - Array of MCP server configurations
 * @param timeoutMs - Timeout per server in milliseconds
 * @returns Array of health check results
 */
export async function checkMcpServersHealth(
  servers: McpServerConfig[],
  timeoutMs: number = 5000
): Promise<McpHealthCheckResult[]> {
  // Run health checks in parallel but limit concurrency
  const results = await Promise.allSettled(
    servers.map((server) => checkMcpServerHealth(server, timeoutMs))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    
    return {
      serverId: servers[index].id,
      status: 'error' as McpHealthStatus,
      lastChecked: new Date(),
      error: result.reason?.message || 'Unknown error',
    }
  })
}


/**
 * MCP Client Utility
 * 
 * Type-safe client for calling MCP (Model Context Protocol) tools.
 * Abstracts over transport layer (currently HTTP, can be swapped for stdio/WebSocket later).
 */

export interface McpError {
  code: string
  message: string
  details?: unknown
}

export interface McpResponse<TOutput> {
  data?: TOutput
  error?: McpError
}

/**
 * Call an MCP tool on a specific server
 * 
 * @param serverId - MCP server identifier (e.g., "novalyte-dealflow-mcp")
 * @param toolName - Tool name (e.g., "get_clinic_pipeline")
 * @param input - Typed input object matching the MCP tool schema
 * @returns Promise resolving to the tool output, or throws on transport error
 * 
 * @example
 * ```ts
 * const result = await callMcpTool(
 *   'novalyte-dealflow-mcp',
 *   'get_clinic_pipeline',
 *   { region: 'Texas', treatment: ['TRT'] }
 * )
 * ```
 */
export async function callMcpTool<TInput, TOutput>(
  serverId: string,
  toolName: string,
  input: TInput
): Promise<TOutput> {
  const url = `/api/mcp/${serverId}/${toolName}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: McpError
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = {
          code: `HTTP_${response.status}`,
          message: errorText || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      throw new Error(`MCP Error [${serverId}/${toolName}]: ${errorData.message}`)
    }

    const result: McpResponse<TOutput> = await response.json()

    if (result.error) {
      throw new Error(`MCP Tool Error [${serverId}/${toolName}]: ${result.error.message}`)
    }

    if (!result.data) {
      throw new Error(`MCP Tool [${serverId}/${toolName}] returned no data`)
    }

    return result.data
  } catch (error) {
    // Log error for debugging but don't expose internals to UI
    console.error(`[MCP Client] Error calling ${serverId}/${toolName}:`, error)
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Failed to call MCP tool: ${serverId}/${toolName}`)
  }
}

/**
 * Batch call multiple MCP tools
 * 
 * @param calls - Array of { serverId, toolName, input } objects
 * @returns Promise resolving to array of results in same order
 */
export async function callMcpToolsBatch<TResults extends unknown[]>(
  calls: Array<{
    serverId: string
    toolName: string
    input: unknown
  }>
): Promise<TResults> {
  const results = await Promise.allSettled(
    calls.map((call) => callMcpTool(call.serverId, call.toolName, call.input))
  )

  return results.map((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[MCP Batch] Failed call ${index}:`, result.reason)
      throw result.reason
    }
    return result.value
  }) as TResults
}


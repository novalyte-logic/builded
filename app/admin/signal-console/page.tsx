'use client'

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Terminal, Server, Wrench, Copy, Check } from 'lucide-react'
import clsx from 'clsx'
import { mcpRegistry, McpServerConfig, McpToolConfig } from '@/lib/mcp/registry'
import { callMcpTool } from '@/lib/mcp/client'
import McpFormBuilder from '@/components/admin/signal-console/McpFormBuilder'
import McpResponseViewer from '@/components/admin/signal-console/McpResponseViewer'
import SessionHistory, { SessionCall } from '@/components/admin/signal-console/SessionHistory'
import PageTransition from '@/components/admin/animation/PageTransition'
import AnimatedCard from '@/components/admin/animation/AnimatedCard'

function SignalConsoleContent() {
  const searchParams = useSearchParams()
  const [selectedServerId, setSelectedServerId] = useState<string>('')
  const [selectedToolName, setSelectedToolName] = useState<string>('')
  const [formInput, setFormInput] = useState<Record<string, unknown>>({})

  // Handle URL parameters for preloading
  useEffect(() => {
    const serverParam = searchParams.get('server')
    const toolParam = searchParams.get('tool')
    const inputParam = searchParams.get('input')

    if (serverParam) {
      setSelectedServerId(serverParam)
    }
    if (toolParam) {
      setSelectedToolName(toolParam)
    }
    if (inputParam) {
      try {
        const parsed = JSON.parse(inputParam)
        if (typeof parsed === 'object' && parsed !== null) {
          setFormInput(parsed)
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [searchParams])
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResponse, setLastResponse] = useState<{
    data?: unknown
    error?: Error
    latency?: number
  }>()
  const [sessionHistory, setSessionHistory] = useState<SessionCall[]>([])

  // Get selected server and tool
  const selectedServer = useMemo(() => {
    return selectedServerId ? mcpRegistry[selectedServerId] : null
  }, [selectedServerId])

  const selectedTool = useMemo(() => {
    if (!selectedServer || !selectedToolName) return null
    return selectedServer.tools[selectedToolName] || null
  }, [selectedServer, selectedToolName])

  // Reset tool selection when server changes
  const handleServerChange = (serverId: string) => {
    setSelectedServerId(serverId)
    setSelectedToolName('')
    setFormInput({})
    setLastResponse(undefined)
  }

  // Reset form when tool changes
  const handleToolChange = (toolName: string) => {
    setSelectedToolName(toolName)
    setFormInput({})
    setLastResponse(undefined)
  }

  // Execute MCP tool
  const handleExecute = useCallback(
    async (input: Record<string, unknown>) => {
      if (!selectedServerId || !selectedToolName) return

      setIsExecuting(true)
      const startTime = Date.now()

      try {
        const data = await callMcpTool(selectedServerId, selectedToolName, input)
        const latency = Date.now() - startTime

        const response = { data, latency }
        setLastResponse(response)

        // Add to session history
        const call: SessionCall = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          serverId: selectedServerId,
          toolName: selectedToolName,
          input,
          response,
        }
        setSessionHistory((prev) => [call, ...prev].slice(0, 50)) // Keep last 50
      } catch (error) {
        const latency = Date.now() - startTime
        const err = error instanceof Error ? error : new Error(String(error))
        const response = { error: err, latency }
        setLastResponse(response)

        // Add to session history even on error
        const call: SessionCall = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          serverId: selectedServerId,
          toolName: selectedToolName,
          input,
          response,
        }
        setSessionHistory((prev) => [call, ...prev].slice(0, 50))
      } finally {
        setIsExecuting(false)
      }
    },
    [selectedServerId, selectedToolName]
  )

  // Handle history selection
  const handleSelectHistoryCall = (call: SessionCall) => {
    setSelectedServerId(call.serverId)
    setSelectedToolName(call.toolName)
    setFormInput(call.input)
    setLastResponse(call.response)
  }

  // Clear history
  const handleClearHistory = () => {
    setSessionHistory([])
  }

  // Generate Claude prompt
  const generateClaudePrompt = useCallback(() => {
    if (!selectedServerId || !selectedToolName || !lastResponse) return ''

    const request = {
      serverId: selectedServerId,
      toolName: selectedToolName,
      input: formInput,
    }

    const prompt = `Claude, I'm debugging an MCP tool call. Here's the context:

**Server:** ${selectedServerId}
**Tool:** ${selectedToolName}
**Input:** ${JSON.stringify(formInput, null, 2)}

**Response:**
${lastResponse.error ? `Error: ${lastResponse.error.message}` : JSON.stringify(lastResponse.data, null, 2)}

**Latency:** ${lastResponse.latency}ms

Please help me understand:
1. What this tool is supposed to do
2. Whether the response is correct
3. Any potential issues or improvements
4. How to interpret the results`

    return prompt
  }, [selectedServerId, selectedToolName, formInput, lastResponse])

  const handleCopyPrompt = () => {
    const prompt = generateClaudePrompt()
    if (prompt) {
      navigator.clipboard.writeText(prompt)
    }
  }

  const servers = Object.values(mcpRegistry)

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Terminal className="w-8 h-8 text-primary" />
                Signal Console
              </h1>
              <p className="text-gray-400/90 text-base mt-1">
                Real-time MCP debug console for testing and debugging tools
              </p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
        </div>

        {/* Main Content: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Server/Tool Selector + Form */}
          <AnimatedCard delay={0.1}>
            <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg h-full flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-6">Tool Configuration</h2>

              {/* Server Selector */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-gray-400/90 mb-2 block flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    MCP Server
                  </label>
                  <select
                    value={selectedServerId}
                    onChange={(e) => handleServerChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Select a server...</option>
                    {servers.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.label} ({server.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tool Selector */}
                {selectedServer && (
                  <div>
                    <label className="text-xs font-medium text-gray-400/90 mb-2 block flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Tool
                    </label>
                    <select
                      value={selectedToolName}
                      onChange={(e) => handleToolChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="">Select a tool...</option>
                      {Object.entries(selectedServer.tools).map(([toolName, tool]) => (
                        <option key={toolName} value={toolName}>
                          {toolName} - {tool.description}
                        </option>
                      ))}
                    </select>
                    {selectedTool && (
                      <p className="text-xs text-gray-500/70 mt-2 leading-relaxed">{selectedTool.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Form Builder */}
              <div className="flex-1 overflow-auto">
                <McpFormBuilder
                  tool={selectedTool}
                  onSubmit={handleExecute}
                  isLoading={isExecuting}
                  initialValues={formInput}
                />
              </div>
            </div>
          </AnimatedCard>

          {/* Right Panel: Response Viewer */}
          <AnimatedCard delay={0.15}>
            <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg h-full flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-6">Response</h2>
              <div className="flex-1 min-h-0">
                <McpResponseViewer
                  request={
                    selectedServerId && selectedToolName
                      ? {
                          serverId: selectedServerId,
                          toolName: selectedToolName,
                          input: formInput,
                        }
                      : undefined
                  }
                  response={lastResponse}
                  onCopyPrompt={lastResponse ? handleCopyPrompt : undefined}
                />
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Bottom Panel: Session History */}
        <AnimatedCard delay={0.2}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <SessionHistory
              calls={sessionHistory}
              onSelectCall={handleSelectHistoryCall}
              onClearHistory={handleClearHistory}
            />
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}

export default function SignalConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-bg p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Signal Console...</p>
          </div>
        </div>
      }
    >
      <SignalConsoleContent />
    </Suspense>
  )
}


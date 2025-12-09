'use client'

import { notFound } from 'next/navigation'
import { Code2, Copy, Check, Terminal, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { mcpRegistry, McpServerConfig, McpServerDomain } from '@/lib/mcp/registry'
import SchemaRenderer from '@/components/admin/mcp-docs/SchemaRenderer'
import Breadcrumbs from '@/components/admin/mcp-docs/Breadcrumbs'
import PageTransition from '@/components/admin/animation/PageTransition'
import AnimatedCard from '@/components/admin/animation/AnimatedCard'
import StatusBadge from '@/components/StatusBadge'

// Domain labels and colors
const domainConfig: Record<McpServerDomain, { label: string; color: string }> = {
  dealflow: {
    label: 'Dealflow',
    color: 'bg-primary/12 text-primary border-primary/20',
  },
  marketIntel: {
    label: 'Market Intelligence',
    color: 'bg-status-live/12 text-status-live border-status-live/20',
  },
  workforce: {
    label: 'Workforce',
    color: 'bg-status-degraded/12 text-status-degraded border-status-degraded/20',
  },
  demandIntel: {
    label: 'Demand Intelligence',
    color: 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  },
  infra: {
    label: 'Infrastructure',
    color: 'bg-gray-500/12 text-gray-400 border-gray-500/20',
  },
}

interface ToolDocPageProps {
  params: {
    serverId: string
    toolName: string
  }
}

export default function ToolDocPage({ params }: ToolDocPageProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const server = mcpRegistry[params.serverId]
  if (!server) {
    notFound()
  }

  const tool = server.tools[params.toolName]
  if (!tool) {
    notFound()
  }

  const domainInfo = domainConfig[server.domain]

  // Infer scope from tool name/description
  const inferScope = (toolName: string, description: string): 'read' | 'write' | 'admin' => {
    const nameLower = toolName.toLowerCase()
    const descLower = description.toLowerCase()
    
    // Admin tools
    if (nameLower.includes('admin') || nameLower.includes('config') || nameLower.includes('setup')) {
      return 'admin'
    }
    
    // Write tools (modify/create/update/send)
    if (
      nameLower.includes('send') ||
      nameLower.includes('create') ||
      nameLower.includes('update') ||
      nameLower.includes('delete') ||
      nameLower.includes('export') ||
      nameLower.includes('push') ||
      nameLower.includes('set') ||
      descLower.includes('send') ||
      descLower.includes('create') ||
      descLower.includes('update')
    ) {
      return 'write'
    }
    
    // Default to read for query/get/find tools
    return 'read'
  }

  const toolScope = inferScope(params.toolName, tool.description)

  // Generate example input
  const generateExampleInput = () => {
    const example: Record<string, unknown> = {}
    Object.entries(tool.inputSchema).forEach(([key, param]) => {
      if (param.required) {
        if (param.type === 'string') {
          const desc = param.description?.toLowerCase() || ''
          if (desc.includes('region')) {
            example[key] = 'Texas'
          } else if (desc.includes('treatment') || desc.includes('service')) {
            example[key] = 'TRT'
          } else {
            example[key] = 'example_value'
          }
        } else if (param.type === 'number') {
          example[key] = param.default || 30
        } else if (param.type === 'boolean') {
          example[key] = false
        } else if (param.type === 'string[]' || param.type === 'array') {
          example[key] = ['TRT']
        } else if (param.type === 'object') {
          example[key] = {}
        }
      } else if (param.default !== undefined) {
        example[key] = param.default
      }
    })
    return example
  }

  const exampleInput = generateExampleInput()

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Generate Claude prompt
  const claudePrompt = `Claude, call the MCP tool \`${params.toolName}\` on server \`${params.serverId}\` with the following parameters:

${JSON.stringify(exampleInput, null, 2)}

Please execute this tool and explain the results.`

  // Generate callMcpTool code
  const callMcpToolCode = `import { callMcpTool } from '@/lib/mcp/client'

const result = await callMcpTool(
  '${params.serverId}',
  '${params.toolName}',
  ${JSON.stringify(exampleInput, null, 2)}
)

console.log(result)`

  // Generate useMcpTool hook code
  const useMcpToolCode = `import { useMcpTool } from '@/lib/mcp/hooks'

const { data, isLoading, error } = useMcpTool(
  '${params.serverId}',
  '${params.toolName}',
  ${JSON.stringify(exampleInput, null, 2)}
)`

  // Signal Console URL with preloaded values
  const signalConsoleUrl = `/admin/signal-console?server=${encodeURIComponent(params.serverId)}&tool=${encodeURIComponent(params.toolName)}&input=${encodeURIComponent(JSON.stringify(exampleInput))}`

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: server.label, href: `/admin/mcp-docs/${params.serverId}` },
            { label: params.toolName },
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{params.toolName}</h1>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    domainInfo.color
                  )}
                >
                  {domainInfo.label}
                </span>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    toolScope === 'read' && 'bg-blue-500/12 text-blue-400 border-blue-500/20',
                    toolScope === 'write' && 'bg-orange-500/12 text-orange-400 border-orange-500/20',
                    toolScope === 'admin' && 'bg-red-500/12 text-red-400 border-red-500/20'
                  )}
                >
                  {toolScope.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400/90 text-base mt-1">{tool.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500/80">
              <span className="font-medium">Server:</span>{' '}
              <Link
                href={`/admin/mcp-docs/${params.serverId}`}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                {server.label}
              </Link>
            </div>
            <StatusBadge status="live" />
          </div>
          <div className="h-px bg-white/10 mt-4" />
        </div>

        {/* Purpose Section */}
        <AnimatedCard delay={0.1}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Purpose</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">{tool.description}</p>
              <div>
                <h3 className="text-sm font-medium text-gray-400/90 mb-2">When to use this tool:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300/90">
                  <li>When you need to {tool.description.toLowerCase()}</li>
                  <li>For {server.domain} operations requiring {params.toolName}</li>
                  <li>As part of automated workflows in the {server.label} pipeline</li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Inputs Section */}
        <AnimatedCard delay={0.15}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Inputs</h2>
            <SchemaRenderer schema={tool.inputSchema} type="input" />
          </div>
        </AnimatedCard>

        {/* Outputs Section */}
        <AnimatedCard delay={0.2}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Outputs</h2>
            {tool.outputSchema ? (
              <SchemaRenderer schema={tool.outputSchema} type="output" />
            ) : (
              <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400/90">
                  Output schema not defined. The tool returns data based on its implementation.
                </p>
              </div>
            )}
            <div className="mt-4 bg-dark-accent/40 border border-white/5 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400/90 mb-2">Example Output:</h3>
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                {JSON.stringify({ example: 'response_data', status: 'success' }, null, 2)}
              </pre>
            </div>
          </div>
        </AnimatedCard>

        {/* Usage Examples Section */}
        <AnimatedCard delay={0.25}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Usage Examples</h2>
            <div className="space-y-4">
              {/* Claude Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400/90">Claude Prompt</h3>
                  <button
                    onClick={() => handleCopy(claudePrompt, 'claude')}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    title="Copy prompt"
                  >
                    {copiedText === 'claude' ? (
                      <Check className="w-4 h-4 text-status-live" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {claudePrompt}
                  </pre>
                </div>
              </div>

              {/* Example Input */}
              <div>
                <h3 className="text-sm font-medium text-gray-400/90 mb-2">Example Input</h3>
                <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                    {JSON.stringify(exampleInput, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Integration Code Section */}
        <AnimatedCard delay={0.3}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Integration Code</h2>
            <div className="space-y-4">
              {/* callMcpTool */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400/90">Using callMcpTool</h3>
                  <button
                    onClick={() => handleCopy(callMcpToolCode, 'callMcpTool')}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedText === 'callMcpTool' ? (
                      <Check className="w-4 h-4 text-status-live" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                    {callMcpToolCode}
                  </pre>
                </div>
              </div>

              {/* useMcpTool Hook */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400/90">Using useMcpTool Hook</h3>
                  <button
                    onClick={() => handleCopy(useMcpToolCode, 'useMcpTool')}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedText === 'useMcpTool' ? (
                      <Check className="w-4 h-4 text-status-live" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                    {useMcpToolCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Try Live Section */}
        <AnimatedCard delay={0.35}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Try Live in Signal Console</h2>
            <p className="text-sm text-gray-400/90 mb-4">
              Test this tool in real-time with the Signal Console. The form will be preloaded with example values.
            </p>
            <Link
              href={signalConsoleUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Open in Signal Console
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}


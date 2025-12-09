'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Code2, MessageSquare, BookOpen, Wrench, ChevronDown, Rocket } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import { McpServerConfig, McpServerDomain } from '@/lib/mcp/registry'
import { prefersReducedMotion } from '@/lib/motion/utils'
import { motionDurations, motionEasing } from '@/lib/motion/config'
import { McpHealthStatus } from '@/lib/mcp/health-check'

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

export interface McpServerUsageModalProps {
  server: McpServerConfig | null
  isOpen: boolean
  onClose: () => void
  healthStatus?: McpHealthStatus
}

/**
 * McpServerUsageModal - Comprehensive usage guide for MCP servers
 * 
 * Shows server details, usage instructions, tool reference, prompts, and code examples
 */
export default function McpServerUsageModal({
  server,
  isOpen,
  onClose,
  healthStatus = 'checking',
}: McpServerUsageModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [isQuickstartOpen, setIsQuickstartOpen] = useState(true)

  if (!server) return null

  const reducedMotion = prefersReducedMotion()
  const toolCount = Object.keys(server.tools).length
  const domainInfo = domainConfig[server.domain]

  // Generate usage scenarios based on domain
  const getUsageScenarios = (domain: McpServerDomain): string[] => {
    const scenarios: Record<McpServerDomain, string[]> = {
      dealflow: [
        'Identifying high-opportunity clinics in target regions',
        'Ranking clinics by revenue potential and demand signals',
        'Detecting regional demand spikes for specific treatments',
        'Generating dealflow batches for sales outreach',
      ],
      marketIntel: [
        'Analyzing treatment trends across regions',
        'Identifying competitor density and market saturation',
        'Finding underserved markets for expansion',
        'Monitoring market share and competitive positioning',
      ],
      workforce: [
        'Finding available staff for clinic shifts',
        'Matching practitioners to open positions',
        'Identifying staffing gaps and coverage needs',
        'Optimizing workforce deployment across regions',
      ],
      demandIntel: [
        'Forecasting demand for treatments by region',
        'Detecting intent signals from search trends',
        'Identifying emerging demand opportunities',
        'Analyzing regional demand vs supply gaps',
      ],
      infra: [
        'Querying BigQuery for analytics data',
        'Sending notifications via Slack or Gmail',
        'Performing web searches for research',
        'Accessing shared infrastructure services',
      ],
    }
    return scenarios[domain] || []
  }

  // Generate example tool call based on first tool
  const getExampleToolCall = () => {
    const firstTool = Object.entries(server.tools)[0]
    if (!firstTool) return null

    const [toolName, tool] = firstTool
    const exampleInput: Record<string, unknown> = {}

    // Build example input from required fields
    Object.entries(tool.inputSchema).forEach(([paramName, param]) => {
      if (param.required) {
        if (param.type === 'string') {
          exampleInput[paramName] = param.description?.includes('region') ? 'Texas' : 'example'
        } else if (param.type === 'string[]') {
          exampleInput[paramName] = ['TRT']
        } else if (param.type === 'number') {
          exampleInput[paramName] = param.default || 30
        } else {
          exampleInput[paramName] = param.default || null
        }
      }
    })

    return { toolName, exampleInput }
  }

  // Generate quickstart content based on domain
  const getQuickstartContent = () => {
    const exampleCall = getExampleToolCall()
    if (!exampleCall) return null

    const firstTool = Object.entries(server.tools)[0]
    if (!firstTool) return null

    const [toolName, tool] = firstTool
    const requiredParams = Object.entries(tool.inputSchema).filter(([, param]) => param.required)

    const content: Record<McpServerDomain, {
      whatItDoes: string
      whenToUse: string[]
      dashboardFeeds: string[]
    }> = {
      dealflow: {
        whatItDoes: `The ${server.label} server helps you discover and rank clinics based on opportunity scores, revenue potential, and demand signals. It scans market data to identify high-value clinic partnerships and generates actionable dealflow for your sales team.`,
        whenToUse: [
          'You need to identify high-opportunity clinics in a specific region for TRT, Weight Loss, or IV Therapy',
          'You want to rank clinics by revenue potential and demand signals to prioritize outreach',
          'You need to detect regional demand spikes that indicate new clinic opportunities',
        ],
        dashboardFeeds: [
          '/admin/dealflow — Dealflow Intelligence dashboard',
          '/admin/market-intelligence — Market Intelligence console',
        ],
      },
      marketIntel: {
        whatItDoes: `The ${server.label} server analyzes treatment trends, competitor density, and market saturation across regions. It helps you identify underserved markets, monitor competitive positioning, and make data-driven expansion decisions.`,
        whenToUse: [
          'You need to analyze treatment demand trends across different regions',
          'You want to identify competitor density and find underserved markets',
          'You need market saturation intelligence to guide expansion strategy',
        ],
        dashboardFeeds: [
          '/admin/market-intelligence — Market Intelligence dashboard',
          '/admin/dealflow — Dealflow Intelligence (for clinic targeting)',
        ],
      },
      workforce: {
        whatItDoes: `The ${server.label} server matches available practitioners to clinic shifts, identifies staffing gaps, and optimizes workforce deployment. It helps ensure clinics have the right staff at the right time.`,
        whenToUse: [
          'You need to find available staff for specific clinic shifts or positions',
          'You want to match practitioners to open positions based on qualifications and availability',
          'You need to identify staffing gaps and coverage needs across regions',
        ],
        dashboardFeeds: [
          '/admin/workforce — Workforce Intelligence dashboard',
          '/admin/workforce-exchange — Workforce Exchange marketplace',
        ],
      },
      demandIntel: {
        whatItDoes: `The ${server.label} server forecasts demand for treatments by region, detects intent signals from search trends, and identifies emerging demand opportunities. It helps you anticipate market needs and allocate resources effectively.`,
        whenToUse: [
          'You need to forecast demand for specific treatments in target regions',
          'You want to detect intent signals from search trends and online behavior',
          'You need to identify emerging demand opportunities before competitors',
        ],
        dashboardFeeds: [
          '/admin/market-intelligence — Market Intelligence dashboard',
          '/admin/dealflow — Dealflow Intelligence (for opportunity scoring)',
        ],
      },
      infra: {
        whatItDoes: `The ${server.label} server provides access to shared infrastructure services like data warehouses, email, messaging, and web search. It enables integration with external systems and data sources.`,
        whenToUse: [
          'You need to query BigQuery for analytics data or custom reports',
          'You want to send notifications via Slack or Gmail',
          'You need to perform web searches for research or data gathering',
        ],
        dashboardFeeds: [
          'Various admin dashboards — Used as infrastructure layer',
          '/admin/ai-console — AI Console for data queries',
        ],
      },
    }

    return {
      ...content[server.domain],
      toolName,
      requiredParams,
      exampleInput: exampleCall.exampleInput,
    }
  }

  const exampleCall = getExampleToolCall()

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const modalVariants = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      }

  const transition = reducedMotion
    ? { duration: 0 }
    : {
        duration: motionDurations.medium / 1000,
        ease: motionEasing.entrance,
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            onClick={onClose}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="bg-dark-surface/95 border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden backdrop-blur-md pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      {server.label}
                    </h2>
                    {(() => {
                      const statusMap: Record<McpHealthStatus, 'live' | 'degraded' | 'offline'> = {
                        live: 'live',
                        error: 'degraded',
                        disconnected: 'offline',
                        checking: 'degraded',
                      }
                      return (
                        <StatusBadge
                          status={statusMap[healthStatus]}
                          label={
                            healthStatus === 'checking'
                              ? 'CHECKING'
                              : healthStatus === 'live'
                              ? 'LIVE'
                              : healthStatus === 'error'
                              ? 'ERROR'
                              : 'DISCONNECTED'
                          }
                        />
                      )
                    })()}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs text-gray-500/70 font-mono">{server.id}</code>
                    <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium border', domainInfo.color)}>
                      {domainInfo.label}
                    </span>
                    <span className="text-xs text-gray-500/60">
                      {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mt-2">{server.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors ml-4 flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
                {/* Quickstart Guide */}
                {getQuickstartContent() && (
                  <section>
                    <button
                      onClick={() => setIsQuickstartOpen(!isQuickstartOpen)}
                      className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-primary/80" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                          Quickstart Guide
                        </h3>
                      </div>
                      <ChevronDown
                        className={clsx(
                          'w-4 h-4 text-gray-500 transition-transform duration-200',
                          isQuickstartOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {isQuickstartOpen && (
                      <motion.div
                        initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
                        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
                        className="bg-dark-accent/40 border border-white/5 rounded-lg p-5 space-y-6"
                      >
                        {(() => {
                          const quickstart = getQuickstartContent()!
                          return (
                            <>
                              {/* What This Server Does */}
                              <div>
                                <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-3">
                                  What This Server Does
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {quickstart.whatItDoes}
                                </p>
                              </div>

                              {/* When to Use It */}
                              <div>
                                <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-3">
                                  When to Use It
                                </h4>
                                <ul className="space-y-2">
                                  {quickstart.whenToUse.map((useCase, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                      <span className="text-primary/70 mt-1">•</span>
                                      <span>{useCase}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Step-by-Step How to Execute */}
                              <div>
                                <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-3">
                                  Step-by-Step How to Execute
                                </h4>
                                <div className="space-y-4">
                                  {/* Step 1 */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold text-primary/80">Step 1</span>
                                      <span className="text-xs text-gray-400">Identify the tool</span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      Select the <code className="text-primary/80 font-mono">{quickstart.toolName}</code> tool
                                      from the {server.label} server. This tool: {Object.entries(server.tools).find(([name]) => name === quickstart.toolName)?.[1].description}
                                    </p>
                                  </div>

                                  {/* Step 2 */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-primary/80">Step 2</span>
                                        <span className="text-xs text-gray-400">Provide required input JSON</span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleCopy(JSON.stringify(quickstart.exampleInput, null, 2), 'step2')
                                        }
                                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                        title="Copy JSON"
                                      >
                                        {copiedText === 'step2' ? (
                                          <Check className="w-3 h-3 text-status-live" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="bg-dark-bg/60 rounded p-2 mt-2 overflow-x-auto">
                                      <pre className="text-[11px] text-gray-400 font-mono whitespace-pre">
                                        {JSON.stringify(quickstart.exampleInput, null, 2)}
                                      </pre>
                                    </div>
                                    {quickstart.requiredParams.length > 0 && (
                                      <p className="text-[10px] text-gray-500/70 mt-2">
                                        Required fields:{' '}
                                        {quickstart.requiredParams.map(([name]) => name).join(', ')}
                                      </p>
                                    )}
                                  </div>

                                  {/* Step 3 */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-primary/80">Step 3</span>
                                        <span className="text-xs text-gray-400">Call the tool</span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleCopy(
                                            `const result = await callMcpTool('${server.id}', '${quickstart.toolName}', ${JSON.stringify(quickstart.exampleInput, null, 2)})`,
                                            'step3'
                                          )
                                        }
                                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                        title="Copy code"
                                      >
                                        {copiedText === 'step3' ? (
                                          <Check className="w-3 h-3 text-status-live" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="bg-dark-bg/60 rounded p-2 mt-2 overflow-x-auto">
                                      <pre className="text-[11px] text-gray-300 font-mono whitespace-pre">
{`const result = await callMcpTool(
  '${server.id}',
  '${quickstart.toolName}',
  ${JSON.stringify(quickstart.exampleInput, null, 2)}
)`}
                                      </pre>
                                    </div>
                                  </div>

                                  {/* Step 4 */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold text-primary/80">Step 4</span>
                                      <span className="text-xs text-gray-400">Interpret the response</span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      The tool returns structured data based on the output schema. Check the response
                                      for{' '}
                                      {(() => {
                                        const tool = server.tools[quickstart.toolName]
                                        return tool?.outputSchema && Object.keys(tool.outputSchema).length > 0
                                          ? Object.keys(tool.outputSchema).join(', ')
                                          : 'the expected data structure'
                                      })()}
                                      . Use this data to inform your decision-making or feed it into downstream processes.
                                    </p>
                                  </div>

                                  {/* Step 5 */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold text-primary/80">Step 5</span>
                                      <span className="text-xs text-gray-400">Where this feeds into admin dashboards</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                      {quickstart.dashboardFeeds.map((feed, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                          <span className="text-primary/70 mt-0.5">→</span>
                                          <code className="text-primary/80 font-mono">{feed}</code>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Copy-Ready Prompts */}
                              <div>
                                <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-3">
                                  Copy-Ready Prompts
                                </h4>
                                <div className="space-y-3">
                                  {/* Engineering Prompt */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-400/80">Engineering Prompt</span>
                                      <button
                                        onClick={() =>
                                          handleCopy(
                                            `Generate code to call the MCP tool \`${quickstart.toolName}\` on server \`${server.id}\` with the following parameters: ${JSON.stringify(quickstart.exampleInput, null, 2)}. Include error handling and type safety.`,
                                            'eng-prompt'
                                          )
                                        }
                                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                        title="Copy prompt"
                                      >
                                        {copiedText === 'eng-prompt' ? (
                                          <Check className="w-3 h-3 text-status-live" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      <span className="font-medium">Generate code</span> to call the MCP tool{' '}
                                      <code className="text-primary/80 font-mono">`{quickstart.toolName}`</code> on server{' '}
                                      <code className="text-primary/80 font-mono">`{server.id}`</code> with the following
                                      parameters: <code className="text-gray-400 font-mono">{JSON.stringify(quickstart.exampleInput)}</code>.
                                      Include error handling and type safety.
                                    </p>
                                  </div>

                                  {/* Analyst Prompt */}
                                  <div className="bg-white/5 rounded p-3 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-400/80">Analyst Prompt</span>
                                      <button
                                        onClick={() =>
                                          handleCopy(
                                            `Explain the ${quickstart.toolName.replace(/_/g, ' ')} pattern returned by the ${server.label} server. What insights can we derive from this data, and how should we act on it?`,
                                            'analyst-prompt'
                                          )
                                        }
                                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                        title="Copy prompt"
                                      >
                                        {copiedText === 'analyst-prompt' ? (
                                          <Check className="w-3 h-3 text-status-live" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      <span className="font-medium">Explain</span> the{' '}
                                      <code className="text-primary/80 font-mono">{quickstart.toolName.replace(/_/g, ' ')}</code> pattern
                                      returned by the {server.label} server. What insights can we derive from this data,
                                      and how should we act on it?
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </motion.div>
                    )}
                  </section>
                )}

                {/* How to Use This MCP Server */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-primary/80" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                      How to Use This MCP Server
                    </h3>
                  </div>
                  <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-2">
                        What This Server Is For
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{server.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-2">
                        When to Use It
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Use this server when you need to {server.description.toLowerCase()}. It provides
                        {toolCount > 1 ? ` ${toolCount} specialized tools` : ' a specialized tool'} for
                        {server.domain === 'dealflow' && ' clinic discovery and opportunity ranking'}
                        {server.domain === 'marketIntel' && ' market analysis and competitive intelligence'}
                        {server.domain === 'workforce' && ' staff matching and workforce optimization'}
                        {server.domain === 'demandIntel' && ' demand forecasting and intent signal detection'}
                        {server.domain === 'infra' && ' infrastructure and shared service access'}
                        .
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider mb-2">
                        Example Scenarios
                      </h4>
                      <ul className="space-y-2">
                        {getUsageScenarios(server.domain).map((scenario, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-primary/70 mt-1">•</span>
                            <span>{scenario}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Tool Reference */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Wrench className="w-4 h-4 text-primary/80" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                      Tool Reference ({toolCount})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(server.tools).map(([toolName, tool]) => {
                      const requiredParams = Object.entries(tool.inputSchema).filter(
                        ([, param]) => param.required
                      )
                      const optionalParams = Object.entries(tool.inputSchema).filter(
                        ([, param]) => !param.required
                      )

                      return (
                        <div
                          key={toolName}
                          className="bg-dark-accent/40 border border-white/5 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <code className="text-sm font-mono text-primary/90">{toolName}</code>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-4">{tool.description}</p>

                          {/* Inputs */}
                          {Object.keys(tool.inputSchema).length > 0 && (
                            <div className="space-y-3">
                              {requiredParams.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-medium text-gray-500/80 uppercase tracking-wider mb-2">
                                    Required Inputs
                                  </h5>
                                  <div className="space-y-2">
                                    {requiredParams.map(([paramName, param]) => (
                                      <div
                                        key={paramName}
                                        className="bg-white/5 rounded p-2 border border-white/5"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <code className="text-xs font-mono text-primary/80">{paramName}</code>
                                          <span className="text-[10px] text-status-offline/80">*</span>
                                          <span className="text-[10px] text-gray-500/60 font-mono">
                                            {param.type}
                                          </span>
                                        </div>
                                        {param.description && (
                                          <p className="text-[11px] text-gray-500/70 leading-relaxed">
                                            {param.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {optionalParams.length > 0 && (
                                <div>
                                  <h5 className="text-[10px] font-medium text-gray-500/80 uppercase tracking-wider mb-2">
                                    Optional Inputs
                                  </h5>
                                  <div className="space-y-2">
                                    {optionalParams.map(([paramName, param]) => (
                                      <div
                                        key={paramName}
                                        className="bg-white/5 rounded p-2 border border-white/5"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <code className="text-xs font-mono text-gray-400">{paramName}</code>
                                          <span className="text-[10px] text-gray-500/60 font-mono">
                                            {param.type}
                                          </span>
                                          {param.default !== undefined && (
                                            <span className="text-[10px] text-gray-500/50">
                                              (default: {String(param.default)})
                                            </span>
                                          )}
                                        </div>
                                        {param.description && (
                                          <p className="text-[11px] text-gray-500/70 leading-relaxed">
                                            {param.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Outputs */}
                          {tool.outputSchema && Object.keys(tool.outputSchema).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <h5 className="text-[10px] font-medium text-gray-500/80 uppercase tracking-wider mb-2">
                                Outputs
                              </h5>
                              <div className="space-y-1.5">
                                {Object.entries(tool.outputSchema).map(([outputName, output]) => (
                                  <div key={outputName} className="flex items-start gap-2">
                                    <code className="text-xs font-mono text-status-live/80">{outputName}</code>
                                    <span className="text-[10px] text-gray-500/60 font-mono">
                                      {output.type}
                                    </span>
                                    {output.description && (
                                      <span className="text-[11px] text-gray-500/70">— {output.description}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Step-by-Step Usage Prompts */}
                {exampleCall && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-primary/80" />
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Step-by-Step Usage Prompts
                      </h3>
                    </div>
                    <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-5 space-y-4">
                      {/* Cursor Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider">
                            For Cursor / AI Assistant
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                `Call the MCP tool \`${exampleCall.toolName}\` on server \`${server.id}\` with parameters: ${JSON.stringify(exampleCall.exampleInput, null, 2)}`,
                                'cursor'
                              )
                            }
                            className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                            title="Copy prompt"
                          >
                            {copiedText === 'cursor' ? (
                              <Check className="w-3.5 h-3.5 text-status-live" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-dark-bg/60 border border-white/5 rounded p-3">
                          <p className="text-xs text-gray-300 font-mono leading-relaxed">
                            Call the MCP tool <code className="text-primary/80">`{exampleCall.toolName}`</code> on
                            server <code className="text-primary/80">`{server.id}`</code> with parameters:
                          </p>
                          <pre className="text-[11px] text-gray-400 mt-2 overflow-x-auto">
                            {JSON.stringify(exampleCall.exampleInput, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Claude Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider">
                            For Claude Desktop
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                `Claude, call the MCP tool \`${exampleCall.toolName}\` on server \`${server.id}\` with: ${JSON.stringify(exampleCall.exampleInput)}`,
                                'claude'
                              )
                            }
                            className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                            title="Copy prompt"
                          >
                            {copiedText === 'claude' ? (
                              <Check className="w-3.5 h-3.5 text-status-live" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-dark-bg/60 border border-white/5 rounded p-3">
                          <p className="text-xs text-gray-300 leading-relaxed">
                            <span className="font-medium">Claude,</span> call the MCP tool{' '}
                            <code className="text-primary/80 font-mono">`{exampleCall.toolName}`</code> on server{' '}
                            <code className="text-primary/80 font-mono">`{server.id}`</code> with:{' '}
                            <code className="text-gray-400 font-mono">
                              {JSON.stringify(exampleCall.exampleInput)}
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Code Snippets */}
                {exampleCall && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="w-4 h-4 text-primary/80" />
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Code Snippets
                      </h3>
                    </div>
                    <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-5 space-y-4">
                      {/* callMcpTool Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider">
                            Using callMcpTool
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                `import { callMcpTool } from '@/lib/mcp/client'\n\nconst result = await callMcpTool(\n  '${server.id}',\n  '${exampleCall.toolName}',\n  ${JSON.stringify(exampleCall.exampleInput, null, 2)}\n)`,
                                'callMcpTool'
                              )
                            }
                            className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedText === 'callMcpTool' ? (
                              <Check className="w-3.5 h-3.5 text-status-live" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-dark-bg/60 border border-white/5 rounded p-3 overflow-x-auto">
                          <pre className="text-[11px] text-gray-300 font-mono leading-relaxed whitespace-pre">
{`import { callMcpTool } from '@/lib/mcp/client'

const result = await callMcpTool(
  '${server.id}',
  '${exampleCall.toolName}',
  ${JSON.stringify(exampleCall.exampleInput, null, 2)}
)`}
                          </pre>
                        </div>
                      </div>

                      {/* React Hook Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-400/80 uppercase tracking-wider">
                            Using React Hook (useMcpTool)
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                `import { useMcpTool } from '@/lib/mcp/hooks'\n\nconst { data, error, isLoading } = useMcpTool(\n  '${server.id}',\n  '${exampleCall.toolName}',\n  ${JSON.stringify(exampleCall.exampleInput, null, 2)},\n  true // enabled\n)`,
                                'useMcpTool'
                              )
                            }
                            className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedText === 'useMcpTool' ? (
                              <Check className="w-3.5 h-3.5 text-status-live" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-dark-bg/60 border border-white/5 rounded p-3 overflow-x-auto">
                          <pre className="text-[11px] text-gray-300 font-mono leading-relaxed whitespace-pre">
{`import { useMcpTool } from '@/lib/mcp/hooks'

const { data, error, isLoading } = useMcpTool(
  '${server.id}',
  '${exampleCall.toolName}',
  ${JSON.stringify(exampleCall.exampleInput, null, 2)},
  true // enabled
)`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


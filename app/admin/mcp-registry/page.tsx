'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Code2, Server, Wrench } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'
import AnimatedCard from '@/components/admin/animation/AnimatedCard'
import McpServerUsageModal from '@/components/admin/McpServerUsageModal'
import { mcpRegistry, McpServerConfig, McpServerDomain } from '@/lib/mcp/registry'
import { checkMcpServersHealth, McpHealthStatus, McpHealthCheckResult } from '@/lib/mcp/health-check'

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

export default function MCPRegistryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServer, setSelectedServer] = useState<McpServerConfig | null>(null)
  const [healthStatuses, setHealthStatuses] = useState<Record<string, McpHealthCheckResult>>({})

  // Group servers by domain
  const serversByDomain = useMemo(() => {
    const grouped: Record<McpServerDomain, McpServerConfig[]> = {
      dealflow: [],
      marketIntel: [],
      workforce: [],
      demandIntel: [],
      infra: [],
    }

    Object.values(mcpRegistry).forEach((server) => {
      grouped[server.domain].push(server)
    })

    return grouped
  }, [])

  // Filter servers based on search query
  const filteredServersByDomain = useMemo(() => {
    if (!searchQuery.trim()) {
      return serversByDomain
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered: Record<McpServerDomain, McpServerConfig[]> = {
      dealflow: [],
      marketIntel: [],
      workforce: [],
      demandIntel: [],
      infra: [],
    }

    Object.entries(serversByDomain).forEach(([domain, servers]) => {
      filtered[domain as McpServerDomain] = servers.filter((server) => {
        const labelMatch = server.label.toLowerCase().includes(query)
        const idMatch = server.id.toLowerCase().includes(query)
        const domainMatch = domainConfig[domain as McpServerDomain].label.toLowerCase().includes(query)
        const descriptionMatch = server.description.toLowerCase().includes(query)
        const toolMatch = Object.keys(server.tools).some((toolName) =>
          toolName.toLowerCase().includes(query)
        )

        return labelMatch || idMatch || domainMatch || descriptionMatch || toolMatch
      })
    })

    return filtered
  }, [searchQuery, serversByDomain])

  // Get total counts
  const totalServers = Object.values(mcpRegistry).length
  const totalTools = Object.values(mcpRegistry).reduce(
    (sum, server) => sum + Object.keys(server.tools).length,
    0
  )

  const handleServerClick = (server: McpServerConfig) => {
    setSelectedServer(server)
  }

  const handleCloseModal = () => {
    setSelectedServer(null)
  }

  // Run health checks on mount and periodically
  useEffect(() => {
    const servers = Object.values(mcpRegistry)
    
    // Set initial state to 'checking' for all servers
    const initialStatuses: Record<string, McpHealthCheckResult> = {}
    servers.forEach((server) => {
      initialStatuses[server.id] = {
        serverId: server.id,
        status: 'checking',
      }
    })
    setHealthStatuses(initialStatuses)
    
    // Initial health check
    const runHealthChecks = async () => {
      // Update all to 'checking' before running checks
      const checkingStatuses: Record<string, McpHealthCheckResult> = {}
      servers.forEach((server) => {
        checkingStatuses[server.id] = {
          serverId: server.id,
          status: 'checking',
        }
      })
      setHealthStatuses(checkingStatuses)
      
      // Run checks in parallel
      const results = await checkMcpServersHealth(servers, 5000)
      const statusMap: Record<string, McpHealthCheckResult> = {}
      results.forEach((result) => {
        statusMap[result.serverId] = result
      })
      setHealthStatuses(statusMap)
    }

    // Small delay before first check to allow render
    const timeoutId = setTimeout(runHealthChecks, 100)

    // Refresh health checks every 30 seconds
    const interval = setInterval(runHealthChecks, 30000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [])

  // Helper to get health status for a server
  const getServerHealthStatus = (serverId: string): McpHealthStatus => {
    return healthStatuses[serverId]?.status || 'checking'
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3 tracking-tight">
              <Code2 className="w-8 h-8 text-primary/90" />
              MCP Registry
            </h1>
            <p className="text-sm text-gray-500/80">
              All intelligence servers powering Novalyte™ AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" label="LIVE · Connected to mcpRegistry" />
          </div>
        </div>
        {/* Section Divider */}
        <div className="h-px bg-white/5"></div>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-surface/60 border border-white/5 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/8 rounded-lg border border-primary/12">
              <Server className="w-4 h-4 text-primary/90" />
            </div>
            <div>
              <p className="text-xs text-gray-500/80 uppercase tracking-wider">Total Servers</p>
              <p className="text-2xl font-bold text-white mt-0.5">{totalServers}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface/60 border border-white/5 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/8 rounded-lg border border-primary/12">
              <Wrench className="w-4 h-4 text-primary/90" />
            </div>
            <div>
              <p className="text-xs text-gray-500/80 uppercase tracking-wider">Total Tools</p>
              <p className="text-2xl font-bold text-white mt-0.5">{totalTools}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface/60 border border-white/5 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-status-live/8 rounded-lg border border-status-live/12">
              <Code2 className="w-4 h-4 text-status-live/90" />
            </div>
            <div>
              <p className="text-xs text-gray-500/80 uppercase tracking-wider">Domains</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {Object.keys(serversByDomain).filter((d) => serversByDomain[d as McpServerDomain].length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by server, tool, domain, or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-surface/60 border border-white/5 rounded-lg text-white text-sm placeholder:text-gray-500/60 focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>
      </div>

      {/* Server Grid by Domain */}
      <div className="space-y-8">
        {Object.entries(filteredServersByDomain).map(([domain, servers]) => {
          if (servers.length === 0) return null

          const domainInfo = domainConfig[domain as McpServerDomain]

          return (
            <div key={domain}>
              {/* Domain Header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    domainInfo.color
                  )}
                >
                  {domainInfo.label}
                </span>
                <span className="text-xs text-gray-500/60">
                  {servers.length} {servers.length === 1 ? 'server' : 'servers'}
                </span>
              </div>

              {/* Server Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server, index) => {
                  const toolCount = Object.keys(server.tools).length

                  return (
                    <AnimatedCard
                      key={server.id}
                      delay={index * 0.05}
                      className="cursor-pointer"
                      onClick={() => handleServerClick(server)}
                    >
                      <div className="bg-dark-surface/80 border border-white/5 rounded-xl p-5 backdrop-blur-sm hover:border-white/10 transition-all duration-150">
                        {/* Server Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-white mb-1 tracking-tight truncate">
                              {server.label}
                            </h3>
                            <p className="text-xs text-gray-500/70 font-mono truncate">
                              {server.id}
                            </p>
                          </div>
                          {(() => {
                            const healthStatus = getServerHealthStatus(server.id)
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

                        {/* Domain Chip */}
                        <div className="mb-3">
                          <span
                            className={clsx(
                              'inline-flex px-2 py-0.5 rounded text-[10px] font-medium border',
                              domainInfo.color
                            )}
                          >
                            {domainInfo.label}
                          </span>
                        </div>

                        {/* Tool Count */}
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="w-3.5 h-3.5 text-gray-500/60" />
                          <span className="text-xs text-gray-500/80">
                            {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500/80 leading-relaxed line-clamp-2">
                          {server.description}
                        </p>
                      </div>
                    </AnimatedCard>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {Object.values(filteredServersByDomain).every((servers) => servers.length === 0) && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-500/40" />
          <p className="text-sm text-gray-500/80 mb-1">No servers found</p>
          <p className="text-xs text-gray-500/60">Try adjusting your search query</p>
        </div>
      )}

      {/* Server Usage Modal */}
      <McpServerUsageModal
        server={selectedServer}
        isOpen={!!selectedServer}
        onClose={handleCloseModal}
        healthStatus={selectedServer ? getServerHealthStatus(selectedServer.id) : 'checking'}
      />
    </div>
  )
}


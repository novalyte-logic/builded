'use client'

import { useState, useMemo } from 'react'
import { Search, Code2, Server, Wrench, BookOpen } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { mcpRegistry, McpServerConfig, McpServerDomain } from '@/lib/mcp/registry'
import PageTransition from '@/components/admin/animation/PageTransition'
import AnimatedCard from '@/components/admin/animation/AnimatedCard'

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

export default function MCPDocsIndexPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Flatten all servers and tools for search
  const allTools = useMemo(() => {
    const tools: Array<{
      server: McpServerConfig
      toolName: string
      tool: { name: string; description: string }
    }> = []

    Object.values(mcpRegistry).forEach((server) => {
      Object.entries(server.tools).forEach(([toolName, tool]) => {
        tools.push({
          server,
          toolName,
          tool: {
            name: tool.name,
            description: tool.description,
          },
        })
      })
    })

    return tools
  }, [])

  // Filter tools based on search
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allTools

    const query = searchQuery.toLowerCase().trim()
    return allTools.filter(({ server, toolName, tool }) => {
      const serverMatch = server.label.toLowerCase().includes(query) ||
        server.id.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        domainConfig[server.domain].label.toLowerCase().includes(query)
      
      const toolMatch = toolName.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)

      return serverMatch || toolMatch
    })
  }, [searchQuery, allTools])

  // Group by server
  const toolsByServer = useMemo(() => {
    const grouped: Record<string, typeof filteredTools> = {}
    filteredTools.forEach((item) => {
      if (!grouped[item.server.id]) {
        grouped[item.server.id] = []
      }
      grouped[item.server.id].push(item)
    })
    return grouped
  }, [filteredTools])

  const totalServers = Object.keys(mcpRegistry).length
  const totalTools = allTools.length

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                MCP Documentation
              </h1>
              <p className="text-gray-400/90 text-base mt-1">
                Complete reference for all MCP servers and tools
              </p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AnimatedCard delay={0.1}>
            <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/12 rounded-lg border border-primary/15">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500/80 uppercase tracking-wider">Total Servers</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{totalServers}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
          <AnimatedCard delay={0.15}>
            <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/12 rounded-lg border border-primary/15">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500/80 uppercase tracking-wider">Total Tools</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{totalTools}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Search */}
        <AnimatedCard delay={0.2}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-4 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search servers, tools, descriptions..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Tools Table */}
        <AnimatedCard delay={0.25}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                All Tools ({filteredTools.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent/40 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                      Server
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(toolsByServer).map(([serverId, tools]) => {
                    const server = mcpRegistry[serverId]
                    if (!server) return null

                    return tools.map((item, index) => (
                      <tr
                        key={`${serverId}-${item.toolName}`}
                        className="hover:bg-dark-hover/50 transition-colors"
                      >
                        {index === 0 && (
                          <td
                            rowSpan={tools.length}
                            className="px-6 py-4 align-top"
                          >
                            <div className="space-y-1">
                              <Link
                                href={`/admin/mcp-docs/${serverId}`}
                                className="text-sm font-semibold text-white hover:text-primary transition-colors"
                              >
                                {server.label}
                              </Link>
                              <p className="text-xs text-gray-500/70 font-mono">{server.id}</p>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/mcp-docs/${serverId}/${item.toolName}`}
                            className="text-sm font-mono text-primary/90 hover:text-primary transition-colors"
                          >
                            {item.toolName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-400/90 line-clamp-2">{item.tool.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              'inline-flex px-2 py-0.5 rounded text-xs font-medium border',
                              domainConfig[server.domain].color
                            )}
                          >
                            {domainConfig[server.domain].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/mcp-docs/${serverId}/${item.toolName}`}
                            className="text-xs text-primary hover:text-primary-dark transition-colors"
                          >
                            View Docs →
                          </Link>
                        </td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-500/40" />
                <p className="text-sm text-gray-500/80 mb-1">No tools found</p>
                <p className="text-xs text-gray-500/60">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}


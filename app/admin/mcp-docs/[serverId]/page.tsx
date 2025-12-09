'use client'

import { notFound } from 'next/navigation'
import { Server, Wrench, BookOpen } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { mcpRegistry, McpServerConfig, McpServerDomain } from '@/lib/mcp/registry'
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

interface ServerDocPageProps {
  params: {
    serverId: string
  }
}

export default function ServerDocPage({ params }: ServerDocPageProps) {
  const server = mcpRegistry[params.serverId]
  if (!server) {
    notFound()
  }

  const domainInfo = domainConfig[server.domain]
  const tools = Object.entries(server.tools)

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: server.label }]} />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{server.label}</h1>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    domainInfo.color
                  )}
                >
                  {domainInfo.label}
                </span>
                <StatusBadge status="live" />
              </div>
              <p className="text-gray-400/90 text-base mt-1">{server.description}</p>
              <p className="text-sm text-gray-500/70 font-mono mt-2">{server.id}</p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
        </div>

        {/* Server Info */}
        <AnimatedCard delay={0.1}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Server Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500/80 uppercase tracking-wider mb-1">Domain</p>
                <p className="text-sm text-white">{domainInfo.label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500/80 uppercase tracking-wider mb-1">Tool Count</p>
                <p className="text-sm text-white">{tools.length}</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Tools List */}
        <AnimatedCard delay={0.15}>
          <div className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Available Tools</h2>
            <div className="space-y-3">
              {tools.map(([toolName, tool], index) => (
                <Link
                  key={toolName}
                  href={`/admin/mcp-docs/${params.serverId}/${toolName}`}
                  className="block p-4 bg-dark-accent/40 border border-white/5 rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono text-primary/90">{toolName}</code>
                      </div>
                      <p className="text-sm text-gray-400/90 leading-relaxed">{tool.description}</p>
                    </div>
                    <BookOpen className="w-4 h-4 text-gray-500/60 flex-shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}


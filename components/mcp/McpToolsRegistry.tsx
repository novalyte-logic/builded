'use client'

import { useState } from 'react'
import { Code2, Search } from 'lucide-react'
import clsx from 'clsx'
import { McpTool as McpToolType } from '@/lib/mcp/types'
import { McpTool, getPromptTemplatesByTool } from '@/lib/mcpRegistry'
import ToolRunnerDrawer from './ToolRunnerDrawer'
import PromptTemplatesModal from './PromptTemplatesModal'

export interface McpToolsRegistryProps {
  tools: McpToolType[]
  servers: { id: string; name: string }[]
}

export default function McpToolsRegistry({ tools, servers }: McpToolsRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedScope, setSelectedScope] = useState<string>('')
  const [selectedTool, setSelectedTool] = useState<McpToolType | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [promptToolName, setPromptToolName] = useState<string | null>(null)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesServer = !selectedServer || tool.serverId === selectedServer
    const matchesScope = !selectedScope || tool.scope === selectedScope
    return matchesSearch && matchesServer && matchesScope
  })

  const handleTryTool = (tool: McpToolType) => {
    setSelectedTool(tool)
    setIsDrawerOpen(true)
  }

  const handleViewPrompts = (toolName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPromptToolName(toolName)
    setIsPromptModalOpen(true)
  }

  const getServerName = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId)
    return server?.name || serverId
  }

  // Get registry tool data for prompt templates
  const getRegistryTool = (toolName: string): McpTool | undefined => {
    return tools.find((t) => t.name === toolName) as McpTool | undefined
  }

  return (
    <>
      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
        <div className="mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-white">Registered Tools</h2>
          </div>
          <p className="text-sm text-gray-400">
            Searchable registry of all MCP-exposed tools and their usage.
          </p>
        </div>
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Servers</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Scopes</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Tool Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Calls (24h)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Avg Latency
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {filteredTools.map((tool) => (
                <tr
                  key={tool.id}
                  className="hover:bg-dark-hover transition-colors cursor-pointer"
                  onClick={() => handleTryTool(tool)}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-white">{tool.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{tool.description}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-400">{tool.serverId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{tool.calls24h.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-white">{tool.avgLatencyMs}ms</td>
                  <td className="px-6 py-4 text-sm text-white">{tool.errorRate}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        tool.scope === 'read' &&
                          'bg-blue-500/10 text-blue-400 border border-blue-500/30',
                        tool.scope === 'write' &&
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
                        tool.scope === 'admin' &&
                          'bg-red-500/10 text-red-400 border border-red-500/30'
                      )}
                    >
                      {tool.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewPrompts(tool.name, e)
                        }}
                        className="px-3 py-1 bg-dark-accent border border-dark-border rounded text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
                      >
                        View Prompts
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTryTool(tool)
                        }}
                        className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded text-xs hover:bg-primary/20 transition-colors"
                      >
                        Try Tool
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ToolRunnerDrawer
        tool={selectedTool}
        serverName={selectedTool ? getServerName(selectedTool.serverId) : ''}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedTool(null)
        }}
      />
      {promptToolName && (
        <PromptTemplatesModal
          toolName={promptToolName}
          templates={getPromptTemplatesByTool(promptToolName)}
          isOpen={isPromptModalOpen}
          onClose={() => {
            setIsPromptModalOpen(false)
            setPromptToolName(null)
          }}
        />
      )}
    </>
  )
}


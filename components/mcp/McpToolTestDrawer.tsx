'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'
import { executeMcpTool } from '@/lib/mcp/api-client'
import { McpTool } from '@/lib/mcp/types'

export interface McpToolTestDrawerProps {
  tool: McpTool | null
  isOpen: boolean
  onClose: () => void
}

export default function McpToolTestDrawer({
  tool,
  isOpen,
  onClose,
}: McpToolTestDrawerProps) {
  const [payload, setPayload] = useState('{}')
  const [response, setResponse] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  if (!isOpen || !tool) return null

  const handleExecute = async () => {
    setIsExecuting(true)
    setResponse(null)

    try {
      let parsedPayload
      try {
        parsedPayload = JSON.parse(payload)
      } catch (e) {
        setResponse(JSON.stringify({ error: 'Invalid JSON payload' }, null, 2))
        setIsExecuting(false)
        return
      }

      const result = await executeMcpTool(tool.name, tool.serverId, parsedPayload)
      setResponse(JSON.stringify(result, null, 2))
    } catch (error) {
      setResponse(
        JSON.stringify(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          null,
          2
        )
      )
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClose = () => {
    setPayload('{}')
    setResponse(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h3 className="text-xl font-semibold text-white">Try Tool: {tool.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">Server: {tool.serverId}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JSON Payload
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full h-48 bg-dark-accent border border-dark-border rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-primary"
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Executing...' : 'Execute (Stub)'}
            </button>
            <button
              onClick={() => {
                setPayload('{}')
                setResponse(null)
              }}
              className="px-6 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white hover:border-primary transition-colors"
            >
              Clear
            </button>
          </div>
          {response && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Response</label>
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                  {response}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


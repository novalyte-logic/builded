'use client'

import { McpToolConfig } from '@/lib/mcp/registry'
import clsx from 'clsx'

interface SchemaRendererProps {
  schema: McpToolConfig['inputSchema'] | McpToolConfig['outputSchema']
  type: 'input' | 'output'
}

/**
 * Renders input or output schema in a formatted, readable way
 */
export default function SchemaRenderer({ schema, type }: SchemaRendererProps) {
  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div className="text-sm text-gray-500/70 italic">
        {type === 'input' ? 'No inputs required' : 'No output schema defined'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, param]) => {
        const isRequired = 'required' in param && param.required
        const paramType = param.type || 'unknown'
        const description = 'description' in param ? param.description : undefined
        const defaultValue = 'default' in param ? param.default : undefined

        return (
          <div
            key={key}
            className="bg-dark-accent/40 border border-white/5 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-primary/90">{key}</code>
                <span className="text-xs text-gray-500/70 font-mono px-1.5 py-0.5 bg-white/5 rounded">
                  {paramType}
                </span>
                {isRequired && (
                  <span className="text-xs text-status-offline/80 px-1.5 py-0.5 bg-status-offline/10 rounded border border-status-offline/20">
                    required
                  </span>
                )}
                {!isRequired && (
                  <span className="text-xs text-gray-500/60 px-1.5 py-0.5 bg-white/5 rounded">
                    optional
                  </span>
                )}
              </div>
            </div>
            {description && (
              <p className="text-sm text-gray-400/90 leading-relaxed mb-2">{description}</p>
            )}
            {defaultValue !== undefined && (
              <div className="mt-2">
                <span className="text-xs text-gray-500/70">Default: </span>
                <code className="text-xs font-mono text-gray-400 bg-black/20 px-1.5 py-0.5 rounded">
                  {typeof defaultValue === 'object' ? JSON.stringify(defaultValue) : String(defaultValue)}
                </code>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


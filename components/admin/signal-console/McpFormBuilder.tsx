'use client'

import { useState, useEffect } from 'react'
import { McpToolConfig } from '@/lib/mcp/registry'
import clsx from 'clsx'

interface McpFormBuilderProps {
  tool: McpToolConfig | null
  onSubmit: (values: Record<string, unknown>) => void
  isLoading?: boolean
  initialValues?: Record<string, unknown>
}

/**
 * Auto-generates a form from MCP tool input schema
 */
export default function McpFormBuilder({ tool, onSubmit, isLoading, initialValues }: McpFormBuilderProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})

  // Initialize form with defaults when tool changes or initialValues provided
  useEffect(() => {
    if (!tool) {
      setFormValues({})
      return
    }

    // Use provided initial values if available, otherwise generate defaults
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormValues(initialValues)
      return
    }

    const defaultValues: Record<string, unknown> = {}
    Object.entries(tool.inputSchema).forEach(([key, param]) => {
      if (param.default !== undefined) {
        defaultValues[key] = param.default
      } else if (!param.required) {
        // Set empty defaults for optional fields
        if (param.type === 'string') {
          defaultValues[key] = ''
        } else if (param.type === 'number') {
          defaultValues[key] = undefined
        } else if (param.type === 'boolean') {
          defaultValues[key] = false
        } else if (param.type === 'string[]' || param.type === 'array') {
          defaultValues[key] = []
        } else if (param.type === 'object') {
          defaultValues[key] = {}
        }
      } else {
        // Required fields get sensible defaults
        if (param.type === 'string') {
          defaultValues[key] = ''
        } else if (param.type === 'number') {
          defaultValues[key] = 0
        } else if (param.type === 'boolean') {
          defaultValues[key] = false
        } else if (param.type === 'string[]' || param.type === 'array') {
          defaultValues[key] = []
        } else if (param.type === 'object') {
          defaultValues[key] = {}
        }
      }
    })
    setFormValues(defaultValues)
  }, [tool, initialValues])

  const handleChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out empty optional fields
    const filteredValues: Record<string, unknown> = {}
    if (tool) {
      Object.entries(formValues).forEach(([key, value]) => {
        const param = tool.inputSchema[key]
        if (param?.required || (value !== '' && value !== undefined && value !== null)) {
          // Handle empty arrays/objects for optional fields
          if (!param?.required && (Array.isArray(value) && value.length === 0)) {
            return
          }
          if (!param?.required && (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
            return
          }
          filteredValues[key] = value
        }
      })
    }
    
    onSubmit(filteredValues)
  }

  const renderField = (key: string, param: { type: string; required?: boolean; description?: string; default?: unknown }) => {
    const value = formValues[key]
    const isRequired = param.required

    switch (param.type) {
      case 'string':
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400/90 flex items-center gap-1.5">
              {key}
              {isRequired && <span className="text-status-offline/80">*</span>}
            </label>
            <input
              type="text"
              value={String(value || '')}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={param.description || `Enter ${key}`}
              required={isRequired}
              className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed">{param.description}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400/90 flex items-center gap-1.5">
              {key}
              {isRequired && <span className="text-status-offline/80">*</span>}
            </label>
            <input
              type="number"
              value={value !== undefined ? Number(value) : ''}
              onChange={(e) => handleChange(key, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={param.description || `Enter ${key}`}
              required={isRequired}
              className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed">{param.description}</p>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div key={key} className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-dark-accent/40 text-primary focus:ring-primary/50"
              />
              <span className="text-xs font-medium text-gray-400/90">
                {key}
                {isRequired && <span className="text-status-offline/80 ml-1">*</span>}
              </span>
            </label>
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed ml-6">{param.description}</p>
            )}
          </div>
        )

      case 'string[]':
      case 'array':
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400/90 flex items-center gap-1.5">
              {key}
              {isRequired && <span className="text-status-offline/80">*</span>}
            </label>
            <textarea
              value={Array.isArray(value) ? JSON.stringify(value, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (Array.isArray(parsed)) {
                    handleChange(key, parsed)
                  }
                } catch {
                  // Invalid JSON, keep as string for now
                }
              }}
              placeholder='["item1", "item2"]'
              required={isRequired}
              rows={3}
              className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed">{param.description}</p>
            )}
            <p className="text-[10px] text-gray-500/50">Enter as JSON array</p>
          </div>
        )

      case 'object':
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400/90 flex items-center gap-1.5">
              {key}
              {isRequired && <span className="text-status-offline/80">*</span>}
            </label>
            <textarea
              value={typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (typeof parsed === 'object' && parsed !== null) {
                    handleChange(key, parsed)
                  }
                } catch {
                  // Invalid JSON
                }
              }}
              placeholder='{"key": "value"}'
              required={isRequired}
              rows={4}
              className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed">{param.description}</p>
            )}
            <p className="text-[10px] text-gray-500/50">Enter as JSON object</p>
          </div>
        )

      default:
        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400/90 flex items-center gap-1.5">
              {key}
              {isRequired && <span className="text-status-offline/80">*</span>}
            </label>
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleChange(key, parsed)
                } catch {
                  handleChange(key, e.target.value)
                }
              }}
              placeholder={param.description || `Enter ${key}`}
              required={isRequired}
              rows={3}
              className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {param.description && (
              <p className="text-[10px] text-gray-500/70 leading-relaxed">{param.description}</p>
            )}
          </div>
        )
    }
  }

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500/60">
        <p className="text-sm">Select a tool to generate form</p>
      </div>
    )
  }

  const requiredFields = Object.entries(tool.inputSchema).filter(([, param]) => param.required)
  const hasRequiredFields = requiredFields.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {Object.entries(tool.inputSchema).map(([key, param]) => renderField(key, param))}
      </div>

      <button
        type="submit"
        disabled={isLoading || (hasRequiredFields && requiredFields.some(([key]) => !formValues[key]))}
        className={clsx(
          'w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm',
          'hover:bg-primary-dark transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Executing...</span>
          </>
        ) : (
          <span>Execute Tool</span>
        )}
      </button>
    </form>
  )
}


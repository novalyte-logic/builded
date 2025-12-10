'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { McpPromptTemplate } from '@/lib/mcpRegistry'

export interface PromptTemplatesModalProps {
  toolName: string
  templates: McpPromptTemplate[]
  isOpen: boolean
  onClose: () => void
}

export default function PromptTemplatesModal({
  toolName,
  templates,
  isOpen,
  onClose,
}: PromptTemplatesModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] bg-dark-surface border border-dark-border rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h2 className="text-2xl font-semibold text-white">Prompt Templates</h2>
            <p className="text-sm text-gray-400 mt-1 font-mono">{toolName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No prompt templates available for this tool.</p>
            </div>
          ) : (
            templates.map((template, index) => (
              <div
                key={index}
                className="bg-dark-accent border border-dark-border rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold text-white">{template.label}</h3>
                  <button
                    onClick={() => handleCopy(template.prompt, index)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary transition-colors"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 text-status-live" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {template.prompt}
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-dark-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


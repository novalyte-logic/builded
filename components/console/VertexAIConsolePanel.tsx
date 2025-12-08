'use client'

import { useCallback, useState, useMemo } from 'react'
import { Loader2, RotateCw, Send } from 'lucide-react'
import { useVertexAIConsole, type VertexMode } from '@/hooks/useVertexAIConsole'
import { VERTEX_MACROS } from '@/lib/console/presets'

const MODES: { value: VertexMode; label: string; hint: string }[] = [
  { value: 'DATA_ANALYST', label: 'Data Analyst', hint: 'Interpret metrics and cohorts' },
  { value: 'GROWTH_STRATEGIST', label: 'Growth Strategist', hint: 'Acquisition and retention strategy' },
  { value: 'EXPERIMENT_BUILDER', label: 'Experiment Builder', hint: 'Design tests and measurement plans' },
]

export default function VertexAIConsolePanel() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<VertexMode>('DATA_ANALYST')
  const [selectedMacroId, setSelectedMacroId] = useState<string>('none')
  const { messages, loading, error, sendPrompt, clear } = useVertexAIConsole(mode)

  const selectedMacro = useMemo(
    () => (selectedMacroId === 'none' ? undefined : VERTEX_MACROS.find((m) => m.id === selectedMacroId)),
    [selectedMacroId]
  )

  const handleSend = useCallback(() => {
    if (prompt.trim()) {
      sendPrompt({ mode, prompt })
      setPrompt('')
    }
  }, [prompt, mode, sendPrompt])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as VertexMode)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">{MODES.find((m) => m.value === mode)?.hint}</p>
        </div>
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-xs uppercase text-gray-500 tracking-wide">AI Macro</label>
          <select
            value={selectedMacroId}
            onChange={(e) => {
              const id = e.target.value
              setSelectedMacroId(id)
              const macro = VERTEX_MACROS.find((m) => m.id === id)
              if (macro) {
                setMode(macro.mode)
                setPrompt(
                  `{{data}} -> Paste/auto-insert data\n${macro.userTemplate.replace('{{data}}', '{{data}}').slice(0, 180)}...`
                )
              }
            }}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            <option value="none">None</option>
            {VERTEX_MACROS.map((macro) => (
              <option key={macro.id} value={macro.id}>
                {macro.name}
              </option>
            ))}
          </select>
          {selectedMacro && <p className="text-xs text-gray-500">{selectedMacro.description}</p>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={clear}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-sm text-gray-300 hover:bg-dark-hover transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="border border-dark-border rounded-lg">
        <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Conversation</p>
            <p className="text-xs text-gray-500">Chat with Vertex AI (Gemini) via the admin console.</p>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-dark-border">
          {messages.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">
              No messages yet. Send a prompt to start the conversation.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={`${msg.timestamp}-${idx}`} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Vertex AI' : 'System'}
                </p>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-100 font-sans leading-relaxed">
                {msg.content}
              </pre>
            </div>
          ))}
        </div>

        {error && (
          <div className="px-4 py-2 text-xs text-status-degraded bg-status-degraded/10 border-t border-status-degraded/40">
            Vertex AI error: {error}
          </div>
        )}

        <div className="p-4 border-t border-dark-border space-y-3">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-100 focus:border-primary focus:outline-none"
            placeholder="Ask Vertex AI for insights, summarize data, or draft operational actions..."
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Keep sensitive data internal. Responses are for admins only. Ctrl/Cmd + Enter to send.
            </p>
            <button
              onClick={handleSend}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


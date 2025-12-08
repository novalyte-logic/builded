'use client'

import { useCallback, useState } from 'react'

export type VertexRole = 'user' | 'assistant' | 'system'

export type VertexMode = 'DATA_ANALYST' | 'GROWTH_STRATEGIST' | 'EXPERIMENT_BUILDER'

export interface VertexMessage {
  role: VertexRole
  content: string
  timestamp: string
}

interface HookResult {
  messages: VertexMessage[]
  loading: boolean
  error: string | null
  sendPrompt: (params: { mode: VertexMode; prompt: string }) => Promise<void>
  clear: () => void
}

export function useVertexAIConsole(initialMode: VertexMode = 'DATA_ANALYST'): HookResult {
  const [messages, setMessages] = useState<VertexMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendPrompt = useCallback(
    async ({ mode: currentMode, prompt }: { mode: VertexMode; prompt: string }) => {
      const trimmed = prompt.trim()
      if (!trimmed) {
        setError('Prompt is required')
        return
      }

      const now = new Date().toISOString()

      const userMessage: VertexMessage = {
        role: 'user',
        content: trimmed,
        timestamp: now,
      }

      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/admin/mcp/vertex/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: currentMode,
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        if (!res.ok) {
          let message = `Vertex AI request failed with status ${res.status}`
          try {
            const err = await res.json()
            if (err?.error) {
              message = err.error
            }
          } catch {
            // ignore parse errors
          }
          throw new Error(message)
        }

        const json = (await res.json()) as { reply: string }
        const assistantMessage: VertexMessage = {
          role: 'assistant',
          content: json.reply || 'No response returned.',
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        setError((err as Error).message || 'Failed to send prompt')
      } finally {
        setLoading(false)
      }
    },
    [messages]
  )

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, sendPrompt, clear }
}


'use client'

import { useEffect, useState } from 'react'
import { X, Send, ExternalLink, User, Bot, Shield, Tag, MessageSquare } from 'lucide-react'
import Explainer from './Explainer'

interface Message {
  id: string
  created_at: string
  sender_type: 'user' | 'admin' | 'ai'
  sender_display: string | null
  body: string
  metadata?: Record<string, any>
}

interface Thread {
  id: string
  subject: string
  channel: string
  status: string
  participant_type: string
  related_lead_id: string | null
  created_at: string
  tags: string[]
  messages: Message[]
}

interface ThreadViewerProps {
  threadId: string | null
  onClose: () => void
  onUpdateThread?: () => void
}

export default function ThreadViewer({ threadId, onClose, onUpdateThread }: ThreadViewerProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (threadId) {
      fetchThread()
    }
  }, [threadId])

  const fetchThread = async () => {
    if (!threadId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/messages/${threadId}`)
      if (!response.ok) throw new Error('Failed to fetch thread')

      const data = await response.json()
      setThread(data.thread)
    } catch (error) {
      console.error('Error fetching thread:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!threadId || !replyText.trim()) return

    try {
      setSending(true)
      const response = await fetch(`/api/admin/messages/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_body: replyText,
          sender_display: 'Superadmin',
        }),
      })

      if (!response.ok) throw new Error('Failed to send reply')

      setReplyText('')
      await fetchThread()
      if (onUpdateThread) onUpdateThread()
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!threadId) return

    try {
      const response = await fetch(`/api/admin/messages/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      await fetchThread()
      if (onUpdateThread) onUpdateThread()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (!threadId) return null

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading thread...</div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-red-400">Thread not found</div>
      </div>
    )
  }

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'user':
        return <User className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'ai':
        return <Bot className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getSenderColor = (senderType: string) => {
    switch (senderType) {
      case 'user':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'admin':
        return 'bg-primary/20 border-primary/30 text-primary'
      case 'ai':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-400'
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{thread.subject}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-300 capitalize">
                {thread.channel.replace('_', ' ')}
              </span>
              <span className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-300 capitalize">
                {thread.participant_type}
              </span>
              {thread.tags.map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {thread.related_lead_id && (
            <Explainer
              title="Linked Lead"
              what="This thread is linked to a LeadRecord in the system."
              why="Quickly access complete lead context including assessments, messages, and AI insights."
              how={['Click to view full lead context', 'See all assessments and messages in one place', 'Use AI summary for quick understanding']}
            >
              <a
                href={`/leads/${thread.related_lead_id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                View Full Context
              </a>
            </Explainer>
          )}

          <Explainer
            title="Thread Status"
            what="Update thread status to track workflow (open, pending, closed)."
            why="Organize threads and track which conversations need attention."
            how={['Set to "closed" when resolved', 'Use "pending" when awaiting response', 'Keep "open" for active conversations']}
          >
            <select
              value={thread.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </Explainer>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender_type === 'admin' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getSenderColor(
                message.sender_type
              )}`}
            >
              {getSenderIcon(message.sender_type)}
            </div>
            <div className={`flex-1 ${message.sender_type === 'admin' ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-300">
                  {message.sender_display || message.sender_type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.sender_type === 'admin'
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-dark-accent border border-dark-border'
                }`}
              >
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      <div className="p-6 border-t border-dark-border">
        <Explainer
          title="Send Reply"
          what="Send a message to the user through this thread. Your reply will be delivered via email or in-app notification."
          why="Respond directly to inquiries and provide support through the unified communication hub."
          how={['Type your message', 'Click Send to deliver', 'Your reply appears in the thread', 'User receives notification']}
        >
          <div className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleUpdateStatus('closed')}
                className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
              >
                Mark Closed
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </Explainer>
      </div>
    </div>
  )
}


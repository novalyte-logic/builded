'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Clock, Link as LinkIcon } from 'lucide-react'
import Explainer from './Explainer'

interface ThreadPreview {
  id: string
  subject: string
  channel: string
  status: string
  participant_type: string
  related_lead_id: string | null
  last_activity_at: string
  last_message: {
    body: string
    sender_type: string
  } | null
  message_count: number
  tags: string[]
}

interface MessageThreadListProps {
  onSelectThread: (threadId: string) => void
  selectedThreadId?: string | null
}

export default function MessageThreadList({
  onSelectThread,
  selectedThreadId,
}: MessageThreadListProps) {
  const [threads, setThreads] = useState<ThreadPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    channel: '',
    status: '',
    participant_type: '',
    search: '',
  })

  useEffect(() => {
    fetchThreads()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchThreads, 30000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.channel) params.set('channel', filters.channel)
      if (filters.status) params.set('status', filters.status)
      if (filters.participant_type) params.set('participant_type', filters.participant_type)
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/messages?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch threads')

      const data = await response.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      contact: 'Contact',
      contact_form: 'Contact', // Legacy
      patient_help: 'Patient Help',
      mens_clinic_partnership: 'Clinic',
      clinic_partnership: 'Clinic', // Legacy
      vendor_network: 'Vendor',
      tech_support: 'Tech',
      ai_chat: 'AI Chat',
    }
    return labels[channel] || channel
  }

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      contact: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contact_form: 'bg-blue-500/20 text-blue-400 border-blue-500/30', // Legacy
      patient_help: 'bg-green-500/20 text-green-400 border-green-500/30',
      mens_clinic_partnership: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      clinic_partnership: 'bg-purple-500/20 text-purple-400 border-purple-500/30', // Legacy
      vendor_network: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      tech_support: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ai_chat: 'bg-primary/20 text-primary border-primary/30',
    }
    return colors[channel] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b border-dark-border space-y-3">
        <Explainer
          title="Search Messages"
          what="Search across thread subjects, lead names, and tags to quickly find specific conversations."
          why="Efficiently locate threads when you have many messages to manage."
          how={['Type keywords to search', 'Search matches subject, lead name, and tags', 'Combine with filters for precise results']}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search threads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
        </Explainer>

        <div className="grid grid-cols-3 gap-2">
          <Explainer
            title="Channel Filter"
            what="Filter threads by communication channel (Contact, Patient Help, Clinic, Vendor, Tech, AI Chat)."
            why="Focus on specific types of inquiries or support requests."
            how={['Select a channel to see only that type', 'Useful for routing to specific teams', 'Combine with status filter for workflow management']}
          >
            <select
              value={filters.channel}
              onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Channels</option>
              <option value="contact">Contact</option>
              <option value="patient_help">Patient Help</option>
              <option value="mens_clinic_partnership">Clinic Partnership</option>
              <option value="vendor_network">Vendor</option>
              <option value="tech_support">Tech Support</option>
              <option value="ai_chat">AI Chat</option>
            </select>
          </Explainer>

          <Explainer
            title="Status Filter"
            what="Filter threads by status (open, pending, closed)."
            why="Quickly find threads that need attention or track resolved issues."
            how={['Select "open" to see active threads', 'Use "pending" for items awaiting response', 'Use "closed" to review resolved threads']}
          >
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </Explainer>

          <Explainer
            title="Participant Type Filter"
            what="Filter by participant type (patient, mens_clinic, vendor, unknown)."
            why="Focus on specific customer segments or partner inquiries."
            how={['Select participant type to narrow results', 'Useful for business development vs patient support', 'Combine with channel for precise filtering']}
          >
            <select
              value={filters.participant_type}
              onChange={(e) => setFilters({ ...filters, participant_type: e.target.value })}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="patient">Patient</option>
              <option value="mens_clinic">Men's Clinic</option>
              <option value="vendor">Vendor</option>
              <option value="unknown">Unknown</option>
            </select>
          </Explainer>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No threads found</div>
        ) : (
          <div className="divide-y divide-dark-border">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`p-4 hover:bg-dark-hover cursor-pointer transition-colors ${
                  selectedThreadId === thread.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{thread.subject}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getChannelColor(thread.channel)}`}>
                    {getChannelLabel(thread.channel)}
                  </span>
                </div>

                {thread.last_message && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                    {thread.last_message.body}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(thread.status)}`}>
                      {thread.status}
                    </span>
                    {thread.related_lead_id && (
                      <span className="text-xs text-primary flex items-center gap-1" title="Linked to Lead">
                        <LinkIcon className="w-3 h-3" />
                      </span>
                    )}
                    {thread.message_count > 1 && (
                      <span className="text-xs text-gray-500">{thread.message_count} messages</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(thread.last_activity_at)}
                  </div>
                </div>

                {thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {thread.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


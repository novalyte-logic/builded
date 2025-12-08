'use client'

import { useState } from 'react'
import MessageThreadList from '@/components/MessageThreadList'
import ThreadViewer from '@/components/ThreadViewer'
import StatusBadge from '@/components/StatusBadge'
import { MessageSquare } from 'lucide-react'

export default function CommunicationPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Communication Hub</h1>
            <p className="text-gray-400">All inbound messages and conversations from app.novalyte.io</p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Left: Thread List */}
        <div>
          <MessageThreadList
            onSelectThread={(threadId) => setSelectedThreadId(threadId)}
            selectedThreadId={selectedThreadId}
          />
        </div>

        {/* Right: Thread Viewer */}
        <div>
          {selectedThreadId ? (
            <ThreadViewer
              threadId={selectedThreadId}
              onClose={() => setSelectedThreadId(null)}
              onUpdateThread={() => {
                // Refresh thread list if needed
              }}
            />
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a thread to view conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


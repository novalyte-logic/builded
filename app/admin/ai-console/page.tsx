'use client'

import { useState } from 'react'
import BigQueryConsolePanel from '@/components/console/BigQueryConsolePanel'
import VertexAIConsolePanel from '@/components/console/VertexAIConsolePanel'
import PlaybooksPanel from '@/components/console/PlaybooksPanel'

type TabKey = 'bigquery' | 'vertex' | 'playbooks'

export default function DataAIConsolePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('bigquery')

  return (
    <div className="w-full max-w-full bg-dark-bg min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Data &amp; AI Console</h1>
        <p className="text-gray-400 mt-1">
          Internal MCP-style interface to query Novalyte data and experiment with Vertex AI.
        </p>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-lg mb-6">
        <div className="flex">
          {[
            { key: 'bigquery' as TabKey, label: 'BigQuery' },
            { key: 'vertex' as TabKey, label: 'Vertex AI' },
            { key: 'playbooks' as TabKey, label: 'Playbooks' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b ${
                activeTab === tab.key
                  ? 'text-primary border-primary'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-dark-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'bigquery' && <BigQueryConsolePanel />}
      {activeTab === 'vertex' && <VertexAIConsolePanel />}
      {activeTab === 'playbooks' && <PlaybooksPanel />}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BigQueryConsolePanel from '@/components/console/BigQueryConsolePanel'
import VertexAIConsolePanel from '@/components/console/VertexAIConsolePanel'
import PlaybooksPanel from '@/components/console/PlaybooksPanel'
import { LogOut, Download } from 'lucide-react'

type TabKey = 'bigquery' | 'vertex' | 'playbooks'

export default function DataAIConsolePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('bigquery')
  const router = useRouter()

  useEffect(() => {
    // Check auth - only authenticated superadmin can access
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!data.authenticated || data.role !== 'SUPERADMIN') {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    router.push('/login')
  }

  const handleExportReport = () => {
    window.open('/api/admin/ai-console/export-report', '_blank')
  }

  return (
    <div className="w-full max-w-full bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Data & AI Console</h1>
            <p className="text-gray-400 mt-1">
              Internal MCP-style interface to query Novalyte data and experiment with Vertex AI.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-400">Superadmin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:bg-dark-hover transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
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


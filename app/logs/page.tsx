'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Calendar, Filter, RefreshCw } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import LogStream, { type LogEntry, type LogLevel, type LogComponent } from '@/components/system-logs/LogStream'
import LogMetrics from '@/components/system-logs/LogMetrics'

export default function LogsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [componentFilter, setComponentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Mock metrics data (would come from API)
  const [errorsOverTime] = useState(() => {
    const now = new Date()
    const data = []
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000)
      data.push({
        time: time.toISOString(),
        errors: Math.floor(Math.random() * 10),
      })
    }
    return data
  })

  const [responseTimes] = useState([
    { component: 'Patient App', p95: 245 },
    { component: 'Admin Dashboard', p95: 189 },
    { component: 'Marketplace', p95: 312 },
    { component: 'AI Triage', p95: 456 },
    { component: 'Stripe', p95: 234 },
    { component: 'BigQuery', p95: 678 },
    { component: 'Vertex', p95: 892 },
    { component: 'EMRs', p95: 1234 },
  ])

  const [webhookRates] = useState(() => {
    const now = new Date()
    const data = []
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000)
      data.push({
        time: time.toISOString(),
        success: Math.floor(Math.random() * 50) + 40,
        failure: Math.floor(Math.random() * 5),
      })
    }
    return data
  })

  // Generate mock log entries
  const generateMockLogs = useCallback((count: number = 50): LogEntry[] => {
    const levels: LogLevel[] = ['Info', 'Warning', 'Error', 'Critical']
    const components: LogComponent[] = [
      'Patient App',
      'Admin Dashboard',
      'Marketplace',
      'AI Triage',
      'Stripe',
      'BigQuery',
      'Vertex',
      'EMRs',
    ]

    const entries: LogEntry[] = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)]
      const component = components[Math.floor(Math.random() * components.length)]
      const timestamp = new Date(now - i * 60000 - Math.random() * 3600000)

      const baseEntry: LogEntry = {
        id: `log-${Date.now()}-${i}`,
        timestamp,
        level,
        component,
        message: `${component}: ${getMessageForLevel(level, component)}`,
        correlationId: `corr-${Math.random().toString(36).substring(7)}`,
        traceId: `trace-${Math.random().toString(36).substring(7)}`,
        requestId: `req-${Math.random().toString(36).substring(7)}`,
      }

      // Add extra details for errors
      if (level === 'Error' || level === 'Critical') {
        baseEntry.fullMessage = `Error occurred in ${component}: ${baseEntry.message}`
        baseEntry.stackTrace = `Error: ${baseEntry.message}\n    at Function.handleRequest (${component}.ts:42:15)\n    at async processRequest (handler.ts:123:8)\n    at async main (index.ts:89:12)`
      }

      // Add user/clinic IDs sometimes
      if (Math.random() > 0.5) {
        baseEntry.userId = `user-${Math.floor(Math.random() * 1000)}`
      }
      if (component === 'Patient App' && Math.random() > 0.7) {
        baseEntry.clinicId = `clinic-${Math.floor(Math.random() * 100)}`
      }

      entries.push(baseEntry)
    }

    return entries
  }, [])

  function getMessageForLevel(level: LogLevel, component: LogComponent): string {
    const messages: Record<LogLevel, string[]> = {
      Info: [
        'Request processed successfully',
        'Cache updated',
        'Data synchronized',
        'Job completed',
        'User session created',
      ],
      Warning: [
        'Rate limit approaching',
        'Cache miss detected',
        'Slow query detected',
        'Retry attempt failed',
        'Deprecated API endpoint used',
      ],
      Error: [
        'Database connection failed',
        'External API timeout',
        'Validation error',
        'Authentication failed',
        'Resource not found',
      ],
      Critical: [
        'System failure detected',
        'Data corruption possible',
        'Security breach attempt',
        'Service unavailable',
        'Critical dependency failure',
      ],
    }

    const componentMessages: Record<string, string[]> = {
      'Patient App': [
        'Assessment submission failed',
        'Patient data sync error',
        'Payment processing error',
      ],
      'Admin Dashboard': [
        'Permission denied',
        'Report generation failed',
        'Data export error',
      ],
      Marketplace: [
        'Product sync failed',
        'Order processing error',
        'Vendor API timeout',
      ],
      'AI Triage': [
        'Model inference failed',
        'Confidence score below threshold',
        'Safety flag triggered',
      ],
      Stripe: [
        'Payment webhook failed',
        'Subscription update error',
        'Refund processing failed',
      ],
      BigQuery: [
        'Query timeout',
        'Data warehouse connection lost',
        'Schema validation error',
      ],
      Vertex: [
        'AI service unavailable',
        'Model deployment failed',
        'Prediction service error',
      ],
      EMRs: [
        'EMR integration timeout',
        'Patient record sync failed',
        'HL7 message parsing error',
      ],
    }

    const allMessages = [
      ...messages[level],
      ...(componentMessages[component] || []),
    ]

    return allMessages[Math.floor(Math.random() * allMessages.length)]
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange, levelFilter, componentFilter, searchQuery])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/logs?timeRange=${timeRange}&level=${levelFilter}&component=${componentFilter}&search=${searchQuery}`)
      // const data = await response.json()

      // Mock data for now
      const mockLogs = generateMockLogs(50)
      
      // Apply filters
      let filtered = mockLogs

      if (levelFilter !== 'all') {
        filtered = filtered.filter((log) => log.level === levelFilter)
      }

      if (componentFilter !== 'all') {
        filtered = filtered.filter((log) => log.component === componentFilter)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (log) =>
            log.message.toLowerCase().includes(query) ||
            log.correlationId?.toLowerCase().includes(query) ||
            log.traceId?.toLowerCase().includes(query) ||
            log.requestId?.toLowerCase().includes(query)
        )
      }

      setLogs(filtered)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = useCallback(() => {
    // TODO: Implement pagination
    console.log('Load more logs')
  }, [])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              System Logs — Platform Activity Stream
            </h1>
            <p className="text-gray-400 mt-1">
              Engineering + ops black box recorder. Errors, jobs, webhooks, deploys.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        {/* TOP: Filter Bar */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by keyword or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Levels</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Components</option>
              <option value="Patient App">Patient App</option>
              <option value="Admin Dashboard">Admin Dashboard</option>
              <option value="Marketplace">Marketplace</option>
              <option value="AI Triage">AI Triage</option>
              <option value="Stripe">Stripe</option>
              <option value="BigQuery">BigQuery</option>
              <option value="Vertex">Vertex</option>
              <option value="EMRs">EMRs</option>
            </select>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
              Refresh
            </button>
          </div>
        </div>

        {/* MIDDLE + BOTTOM: Log Stream + Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Log Stream (Left 3 columns) */}
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              {loading && logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Loading logs...
                </div>
              ) : (
                <LogStream logs={logs} onLoadMore={handleLoadMore} hasMore={hasMore} />
              )}
            </div>
          </div>

          {/* Metrics Snapshot (Right 1 column) */}
          <div className="lg:col-span-1">
            <LogMetrics
              errorsOverTime={errorsOverTime}
              responseTimes={responseTimes}
              webhookRates={webhookRates}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

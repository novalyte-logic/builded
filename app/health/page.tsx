'use client'

import { useEffect, useState } from 'react'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import { Activity, Server, Database, Zap, Globe, AlertTriangle } from 'lucide-react'

interface SystemComponent {
  id: string
  name: string
  status: 'live' | 'degraded' | 'offline'
  uptime: number
  latency: number
  cpu: number
  memory: number
}

export default function HealthPage() {
  const [metrics, setMetrics] = useState({
    overallUptime: 99.8,
    avgLatency: 124,
    totalRequests: 3421000,
    errorRate: 0.02,
    activeServers: 24,
    dbConnections: 456,
  })

  const [components] = useState<SystemComponent[]>([
    {
      id: '1',
      name: 'API Gateway',
      status: 'live',
      uptime: 99.9,
      latency: 45,
      cpu: 32,
      memory: 48,
    },
    {
      id: '2',
      name: 'Patient Service',
      status: 'live',
      uptime: 99.8,
      latency: 89,
      cpu: 45,
      memory: 62,
    },
    {
      id: '3',
      name: 'Clinic Service',
      status: 'live',
      uptime: 99.7,
      latency: 112,
      cpu: 38,
      memory: 54,
    },
    {
      id: '4',
      name: 'AI Service',
      status: 'live',
      uptime: 99.6,
      latency: 178,
      cpu: 72,
      memory: 81,
    },
    {
      id: '5',
      name: 'Primary Database',
      status: 'live',
      uptime: 99.9,
      latency: 12,
      cpu: 56,
      memory: 68,
    },
    {
      id: '6',
      name: 'Analytics DB',
      status: 'degraded',
      uptime: 98.5,
      latency: 450,
      cpu: 89,
      memory: 92,
    },
    {
      id: '7',
      name: 'Cache Layer',
      status: 'live',
      uptime: 99.9,
      latency: 3,
      cpu: 28,
      memory: 42,
    },
    {
      id: '8',
      name: 'Search Index',
      status: 'live',
      uptime: 99.8,
      latency: 34,
      cpu: 35,
      memory: 51,
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        overallUptime: 99.5 + Math.random() * 0.5,
        avgLatency: 100 + Math.random() * 100,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50),
        errorRate: Math.random() * 0.05,
        activeServers: prev.activeServers,
        dbConnections: 400 + Math.random() * 100,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Infrastructure Health Monitoring</h1>
        <p className="text-gray-400">System logs, latency graphs, and uptime monitors</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Overall Uptime"
          value={`${metrics.overallUptime.toFixed(2)}%`}
          change={0.1}
          subtitle="30-day average"
          status="live"
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Latency"
          value={`${Math.round(metrics.avgLatency)}ms`}
          change={-2.3}
          subtitle="Global average"
          icon={<Zap className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Requests (24h)"
          value={metrics.totalRequests.toLocaleString()}
          change={8.7}
          icon={<Globe className="w-5 h-5" />}
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          change={-0.01}
          subtitle="Last 24 hours"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Servers"
          value={metrics.activeServers}
          change={0}
          icon={<Server className="w-5 h-5" />}
        />
        <MetricCard
          title="DB Connections"
          value={Math.round(metrics.dbConnections)}
          change={2.1}
          subtitle="Active connections"
          icon={<Database className="w-5 h-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latency Distribution (24h)</h2>
          <RealtimeChart
            dataKey="latency"
            color="#3b82f6"
            type="area"
            height={300}
            initialValue={120}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Request Volume (24h)</h2>
          <RealtimeChart
            dataKey="requests"
            color="#10b981"
            type="line"
            height={300}
            initialValue={15000}
          />
        </div>
      </div>

      {/* System Components */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">Component Health Status</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {components.map((component) => (
                <tr key={component.id} className="hover:bg-dark-hover transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{component.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={component.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {component.uptime.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{component.latency}ms</span>
                      {component.latency > 300 && (
                        <span className="text-xs text-status-degraded">High</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-dark-accent rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            component.cpu > 80 ? 'bg-red-500' : component.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${component.cpu}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-10">{component.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-dark-accent rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            component.memory > 80 ? 'bg-red-500' : component.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${component.memory}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-10">{component.memory}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-primary hover:text-primary-light transition-colors">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter, Shield } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import RiskStatusStrip from '@/components/compliance-security/RiskStatusStrip'
import ActivityTimeline, { type SecurityEvent } from '@/components/compliance-security/ActivityTimeline'
import AIRiskSummary from '@/components/compliance-security/AIRiskSummary'
import EventDetailPanel from '@/components/compliance-security/EventDetailPanel'

interface RiskInsight {
  insight: string
  severity: 'Low' | 'Moderate' | 'High'
  recommendedAction?: string
}

export default function CompliancePage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('')
  const [componentFilter, setComponentFilter] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [loading, setLoading] = useState(true)

  // Risk status data (mock - would come from API)
  const [riskStatus] = useState({
    overallStatus: 'Low' as 'Low' | 'Moderate' | 'Elevated',
    securityEvents24h: 12,
    anomalousAccess7d: 3,
    phiExports30d: 47,
  })

  // Security events (mock - would come from API)
  const [events] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      type: 'login',
      severity: 'Info',
      title: 'Admin login from new location',
      description: 'Superadmin logged in from IP 192.168.1.100 in New York, NY. First login from this location in 90 days.',
      user: 'superadmin@novalyte.io',
      ipAddress: '192.168.1.100',
      location: 'New York, NY',
      component: 'Patient',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
      type: 'export',
      severity: 'Warning',
      title: 'Large PHI export by clinic staff',
      description: 'Clinic Y exported 1,247 patient records via CSV. Export size exceeds normal threshold (typical: 50-200 records).',
      user: 'clinic.staff@example.com',
      component: 'Clinic',
      details: {
        recordCount: 1247,
        exportType: 'CSV',
        authorizedBy: 'clinic.admin@example.com',
      },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 12 * 3600000), // 12 hours ago
      type: 'failed_login',
      severity: 'Warning',
      title: 'Failed login spike detected',
      description: '15 failed login attempts from IP 203.0.113.42 in the last hour. Pattern suggests brute force attack attempt.',
      ipAddress: '203.0.113.42',
      location: 'Unknown',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 18 * 3600000), // 18 hours ago
      type: 'suspicious_ip',
      severity: 'Critical',
      title: 'Suspicious IP access from restricted region',
      description: 'Access attempt from IP 198.51.100.5 (Eastern Europe) flagged by geolocation filter. Account access blocked.',
      ipAddress: '198.51.100.5',
      location: 'Eastern Europe',
      details: {
        country: 'Unknown',
        isBlocked: true,
        riskScore: 0.92,
      },
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
      type: 'data_access',
      severity: 'Info',
      title: 'Bulk data query executed',
      description: 'API query accessed 5,432 patient records in single request. Query authorized and within policy limits.',
      user: 'api-service@novalyte.io',
      component: 'Patient',
      details: {
        queryType: 'API',
        recordCount: 5432,
        authorized: true,
      },
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000), // 2 days ago
      type: 'policy_violation',
      severity: 'Warning',
      title: 'Vendor data access outside business hours',
      description: 'Vendor account accessed marketplace vendor data at 03:15 UTC (outside normal business hours). Review required.',
      user: 'vendor.user@example.com',
      component: 'Vendor',
      details: {
        accessTime: '03:15 UTC',
        normalHours: '09:00-17:00 UTC',
      },
    },
  ])

  // AI Risk Insights (mock - would come from Gemini)
  const [insights] = useState<RiskInsight[]>([
    {
      insight: 'Unusual login pattern from region Eastern Europe detected. All access blocked automatically. No patient data exposed.',
      severity: 'High',
      recommendedAction: 'Review blocked IP addresses and consider adding to permanent blocklist.',
    },
    {
      insight: 'Large PHI export by Clinic Y (1,247 records) – review access policy. Export was authorized but exceeds typical volume.',
      severity: 'Moderate',
      recommendedAction: 'Contact clinic administrator to confirm export purpose and verify authorization chain.',
    },
    {
      insight: 'Failed login spike from IP 203.0.113.42 suggests brute force attempt. Account protection activated. No successful breach.',
      severity: 'Moderate',
      recommendedAction: 'Monitor for additional suspicious activity. Consider IP blocking if pattern continues.',
    },
    {
      insight: 'All security events in last 7 days have been handled automatically. System protection functioning normally.',
      severity: 'Low',
    },
  ])

  useEffect(() => {
    fetchComplianceData()
    const interval = setInterval(fetchComplianceData, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchComplianceData = async () => {
    setLoading(true)
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/admin/compliance?timeRange=${timeRange}`)
    // const data = await response.json()
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Compliance & Security Operations Center
            </h1>
            <p className="text-gray-400 mt-1">
              HIPAA / PHI access patterns, security events, and data governance monitoring
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Event Types</option>
              <option value="login">Logins</option>
              <option value="export">Data Exports</option>
              <option value="failed_login">Failed Logins</option>
              <option value="suspicious_ip">Suspicious IP</option>
              <option value="data_access">Data Access</option>
              <option value="policy_violation">Policy Violations</option>
            </select>
          </div>
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Components</option>
            <option value="Patient">Patient Data</option>
            <option value="Clinic">Clinic Data</option>
            <option value="Vendor">Vendor Data</option>
          </select>
        </div>
      </div>

      {/* PANEL 1: Risk Status Strip (TOP) */}
      <div className="mb-6">
        <RiskStatusStrip
          overallStatus={riskStatus.overallStatus}
          securityEvents24h={riskStatus.securityEvents24h}
          anomalousAccess7d={riskStatus.anomalousAccess7d}
          phiExports30d={riskStatus.phiExports30d}
        />
      </div>

      {/* PANEL 2 & 3: Activity Timeline (LEFT) + AI Risk Summary (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Activity Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline
            events={events}
            onEventClick={setSelectedEvent}
            timeRange={timeRange}
            eventTypeFilter={eventTypeFilter || undefined}
            componentFilter={componentFilter || undefined}
          />
        </div>

        {/* RIGHT: AI Risk Summary */}
        <div className="lg:col-span-1">
          <AIRiskSummary
            insights={insights}
            timeRange={timeRange}
            onViewDetailedLog={() => {
              // TODO: Navigate to detailed log view
              console.log('View detailed log')
            }}
            onExportReport={() => {
              // TODO: Generate and download compliance report
              console.log('Export compliance report')
            }}
            onFlagForLegal={() => {
              // TODO: Flag selected events for legal review
              console.log('Flag for legal review')
            }}
          />
        </div>
      </div>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}


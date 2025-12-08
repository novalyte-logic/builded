'use client'

import { Shield, Lock, AlertTriangle, Download, Activity } from 'lucide-react'
import Explainer from '../Explainer'

interface RiskStatusStripProps {
  overallStatus: 'Low' | 'Moderate' | 'Elevated'
  securityEvents24h: number
  anomalousAccess7d: number
  phiExports30d: number
}

export default function RiskStatusStrip({
  overallStatus,
  securityEvents24h,
  anomalousAccess7d,
  phiExports30d,
}: RiskStatusStripProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Low':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Elevated':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Risk Status Overview</h3>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
            overallStatus
          )}`}
        >
          {overallStatus} Risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Events (24h) */}
        <Explainer
          title="Security Events (Last 24h)"
          what={`${securityEvents24h} security-related events have been detected in the last 24 hours. Includes failed logins, suspicious access patterns, and system alerts.`}
          why="Monitoring security events helps identify potential threats early and ensures HIPAA compliance. A sudden spike may indicate an attack or breach attempt."
          how={[
            'Includes: Failed logins, suspicious IP access, unauthorized access attempts',
            'Real-time monitoring with automated alerts',
            'All events are logged for audit purposes',
          ]}
        >
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-help">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-gray-400">Security Events (24h)</span>
            </div>
            <p className="text-2xl font-bold text-white">{securityEvents24h}</p>
          </div>
        </Explainer>

        {/* Anomalous Access (7d) */}
        <Explainer
          title="Anomalous Access Events (Last 7 Days)"
          what={`${anomalousAccess7d} access events have been flagged as unusual or anomalous in the last 7 days. These may include access from new locations, unusual times, or unexpected data queries.`}
          why="Anomalous access patterns can indicate compromised accounts, insider threats, or policy violations. Early detection protects patient data and ensures compliance."
          how={[
            'Detected using AI-powered behavioral analysis',
            'Flags: New locations, unusual hours, bulk data access',
            'Each event is reviewed for false positives',
          ]}
        >
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-help">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Anomalous Access (7d)</span>
            </div>
            <p className="text-2xl font-bold text-white">{anomalousAccess7d}</p>
          </div>
        </Explainer>

        {/* PHI Exports (30d) */}
        <Explainer
          title="PHI Exports (Last 30 Days)"
          what={`${phiExports30d} instances of Protected Health Information (PHI) have been exported or accessed for download in the last 30 days. All exports are logged and monitored for compliance.`}
          why="PHI exports must be tracked to comply with HIPAA requirements. Monitoring ensures all data access is authorized and properly documented for audits."
          how={[
            'Tracks: CSV exports, API data pulls, bulk downloads',
            'All exports require authorization and logging',
            'Automatic flagging of unusual export volumes',
          ]}
        >
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4 cursor-help">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">PHI Exports (30d)</span>
            </div>
            <p className="text-2xl font-bold text-white">{phiExports30d}</p>
          </div>
        </Explainer>
      </div>
    </div>
  )
}


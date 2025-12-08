'use client'

import { AlertTriangle, TrendingDown, MapPin, DollarSign, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RevenueLeak {
  id: string
  type: 'clinic' | 'vendor' | 'marketplace' | 'pricing' | 'geo' | 'abandonment'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: number
  fixSuggestion: string
}

interface RevenueLeakAlertProps {
  leak: RevenueLeak
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'border-red-500 bg-red-500/10'
    case 'high':
      return 'border-orange-500 bg-orange-500/10'
    case 'medium':
      return 'border-yellow-500 bg-yellow-500/10'
    default:
      return 'border-blue-500 bg-blue-500/10'
  }
}

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-400'
    case 'high':
      return 'text-orange-400'
    case 'medium':
      return 'text-yellow-400'
    default:
      return 'text-blue-400'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'clinic':
      return <MapPin className="w-5 h-5" />
    case 'vendor':
      return <Package className="w-5 h-5" />
    case 'geo':
      return <MapPin className="w-5 h-5" />
    default:
      return <DollarSign className="w-5 h-5" />
  }
}

export default function RevenueLeakAlert({ leak }: RevenueLeakAlertProps) {
  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(leak.severity)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`${getSeverityText(leak.severity)} mt-0.5`}>
            {getIcon(leak.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white">{leak.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${getSeverityColor(leak.severity)} ${getSeverityText(leak.severity)}`}>
                {leak.severity}
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-2">{leak.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-400">Impact: </span>
                <span className="text-red-400 font-medium">{formatCurrency(leak.impact)}/mo</span>
              </div>
              <div>
                <span className="text-gray-400">Type: </span>
                <span className="text-gray-300 capitalize">{leak.type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-dark-border">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-status-degraded mt-0.5" />
          <div>
            <p className="text-xs font-medium text-status-degraded mb-1">Fix This:</p>
            <p className="text-xs text-gray-300">{leak.fixSuggestion}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


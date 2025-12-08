'use client'

import { TrendingUp, MapPin, DollarSign, Clock, AlertTriangle, Target } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import StatusBadge from './StatusBadge'

interface MarketOpportunity {
  id: string
  city: string
  state: string
  serviceType: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  profitMultiplier: number
  speedToMarket: number // days
  killThreshold: number
  marketSize: number
  revenue30d: number
  revenue60d: number
  revenue90d: number
  competitionIntensity: 'none' | 'low' | 'medium' | 'high'
  regulatoryFriction: 'low' | 'medium' | 'high'
  clinicSupply: number
  clinicDemand: number
  marketplaceReadiness: number
  requiredCapital: number
  timeToCompetition: number // days until competitors notice
  insights: string[]
}

interface MarketOpportunityProps {
  opportunity: MarketOpportunity
  onApprove?: (id: string) => void
  onDelay?: (id: string) => void
  onKill?: (id: string) => void
}

export default function MarketOpportunity({
  opportunity,
  onApprove,
  onDelay,
  onKill,
}: MarketOpportunityProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'border-status-live/30 bg-status-live/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'high':
        return 'border-red-500/30 bg-red-500/10'
    }
  }

  const getCompetitionColor = (intensity: string) => {
    switch (intensity) {
      case 'none':
        return 'text-status-live'
      case 'low':
        return 'text-yellow-400'
      case 'medium':
        return 'text-orange-400'
      case 'high':
        return 'text-red-400'
    }
  }

  return (
    <div className={`border rounded-lg p-6 ${getRiskColor(opportunity.riskLevel)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">
              {opportunity.city}, {opportunity.state}
            </h3>
            <span className="text-xs px-2 py-1 bg-dark-accent rounded-full text-gray-300">
              {opportunity.serviceType}
            </span>
            <StatusBadge
              status={opportunity.riskLevel === 'low' ? 'live' : opportunity.riskLevel === 'medium' ? 'degraded' : 'offline'}
              label={opportunity.riskLevel.toUpperCase()}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Confidence</p>
              <p className="text-sm font-bold text-white">{(opportunity.confidence * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Profit Multiplier</p>
              <p className="text-sm font-bold text-status-live">{opportunity.profitMultiplier.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Speed to Market</p>
              <p className="text-sm font-bold text-white">{opportunity.speedToMarket} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Time to Competition</p>
              <p className={`text-sm font-bold ${
                opportunity.timeToCompetition < 60 ? 'text-red-400' : 'text-status-live'
              }`}>
                {opportunity.timeToCompetition} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-dark-accent rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">30-Day Revenue</p>
          <p className="text-sm font-bold text-status-live">{formatCurrency(opportunity.revenue30d)}</p>
        </div>
        <div className="bg-dark-accent rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">60-Day Revenue</p>
          <p className="text-sm font-bold text-status-live">{formatCurrency(opportunity.revenue60d)}</p>
        </div>
        <div className="bg-dark-accent rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">90-Day Revenue</p>
          <p className="text-sm font-bold text-status-live">{formatCurrency(opportunity.revenue90d)}</p>
        </div>
      </div>

      {/* Market Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Market Size</p>
          <p className="text-sm font-medium text-white">{formatCurrency(opportunity.marketSize)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Competition</p>
          <p className={`text-sm font-medium capitalize ${getCompetitionColor(opportunity.competitionIntensity)}`}>
            {opportunity.competitionIntensity}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Regulatory</p>
          <p className="text-sm font-medium text-white capitalize">{opportunity.regulatoryFriction}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Required Capital</p>
          <p className="text-sm font-medium text-white">{formatCurrency(opportunity.requiredCapital)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Clinic Supply</p>
          <p className="text-sm font-medium text-white">{opportunity.clinicSupply}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Clinic Demand</p>
          <p className="text-sm font-medium text-status-live">{opportunity.clinicDemand}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Supply Gap</p>
          <p className="text-sm font-medium text-status-degraded">
            {opportunity.clinicDemand - opportunity.clinicSupply > 0 ? '+' : ''}
            {opportunity.clinicDemand - opportunity.clinicSupply}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Marketplace Ready</p>
          <p className="text-sm font-medium text-white">{(opportunity.marketplaceReadiness * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">Key Insights:</p>
        <ul className="space-y-1">
          {opportunity.insights.map((insight, idx) => (
            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
              <TrendingUp className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      {(onApprove || onDelay || onKill) && (
        <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
          {onApprove && (
            <button
              onClick={() => onApprove(opportunity.id)}
              className="flex-1 px-4 py-2 bg-status-live text-white rounded-lg hover:bg-status-live/80 transition-colors text-sm font-medium"
            >
              Approve Expansion
            </button>
          )}
          {onDelay && (
            <button
              onClick={() => onDelay(opportunity.id)}
              className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
            >
              Delay Launch
            </button>
          )}
          {onKill && (
            <button
              onClick={() => onKill(opportunity.id)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              Kill Vertical
            </button>
          )}
        </div>
      )}
    </div>
  )
}


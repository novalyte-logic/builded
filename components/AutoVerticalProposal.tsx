'use client'

import { Zap, FileText, ShoppingBag, Building2, Target, Activity } from 'lucide-react'

interface VerticalComponent {
  type: 'service_category' | 'marketplace_category' | 'city_page' | 'seo_cluster' | 'assessment_routing' | 'ad_funnel'
  name: string
  description: string
  readyState: 'ready' | 'pending' | 'requires_setup'
}

interface AutoVerticalProposal {
  id: string
  name: string
  marketOpportunityId: string
  components: VerticalComponent[]
  estimatedRevenue: number
  setupTime: number // days
  confidence: number
}

interface AutoVerticalProposalProps {
  proposal: AutoVerticalProposal
  onApprove?: (id: string) => void
  onModify?: (id: string) => void
}

export default function AutoVerticalProposal({
  proposal,
  onApprove,
  onModify,
}: AutoVerticalProposalProps) {
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'service_category':
        return <Activity className="w-4 h-4" />
      case 'marketplace_category':
        return <ShoppingBag className="w-4 h-4" />
      case 'city_page':
        return <Building2 className="w-4 h-4" />
      case 'seo_cluster':
        return <FileText className="w-4 h-4" />
      case 'assessment_routing':
        return <Target className="w-4 h-4" />
      case 'ad_funnel':
        return <Zap className="w-4 h-4" />
      default:
        return null
    }
  }

  const getReadyStateColor = (state: string) => {
    switch (state) {
      case 'ready':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{proposal.name}</h3>
          <p className="text-xs text-gray-400">Auto-proposed vertical creation</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Confidence</p>
          <p className="text-sm font-bold text-white">{(proposal.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-dark-accent rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Estimated Revenue</p>
          <p className="text-sm font-bold text-status-live">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(proposal.estimatedRevenue)}
          </p>
        </div>
        <div className="bg-dark-accent rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Setup Time</p>
          <p className="text-sm font-bold text-white">{proposal.setupTime} days</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-400 mb-3">Proposed Components:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {proposal.components.map((component, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-3 ${getReadyStateColor(component.readyState)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getComponentIcon(component.type)}
                <span className="text-xs font-medium capitalize">
                  {component.type.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full ml-auto">
                  {component.readyState}
                </span>
              </div>
              <p className="text-xs font-semibold mb-1">{component.name}</p>
              <p className="text-xs opacity-75">{component.description}</p>
            </div>
          ))}
        </div>
      </div>

      {(onApprove || onModify) && (
        <div className="flex items-center gap-2 pt-4 border-t border-dark-border">
          {onApprove && (
            <button
              onClick={() => onApprove(proposal.id)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              Approve & Deploy
            </button>
          )}
          {onModify && (
            <button
              onClick={() => onModify(proposal.id)}
              className="px-4 py-2 bg-dark-accent border border-dark-border text-gray-300 rounded-lg hover:text-white transition-colors text-sm"
            >
              Modify Components
            </button>
          )}
        </div>
      )}
    </div>
  )
}


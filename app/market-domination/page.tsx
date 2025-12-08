'use client'

import { useEffect, useState } from 'react'
import MarketOpportunity from '@/components/MarketOpportunity'
import MarketRadarMap from '@/components/MarketRadarMap'
import AutoVerticalProposal from '@/components/AutoVerticalProposal'
import GeminiStrategicReasoning from '@/components/GeminiStrategicReasoning'
import RealtimeChart from '@/components/RealtimeChart'
import StatusBadge from '@/components/StatusBadge'
import {
  Target,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Zap,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { createAuditEntry } from '@/lib/audit'

interface MarketOpportunityType {
  id: string
  city: string
  state: string
  serviceType: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  profitMultiplier: number
  speedToMarket: number
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
  timeToCompetition: number
  insights: string[]
}

interface CitySignal {
  city: string
  state: string
  lat: number
  lng: number
  demand: number
  supply: number
  opportunity: number
  status: 'emerging' | 'primed' | 'saturated' | 'dominated'
  signals: {
    searchVelocity: number
    cpcUnderpriced: boolean
    clinicOverloaded: boolean
    marketplaceGap: boolean
  }
}

interface AutoVerticalProposalType {
  id: string
  name: string
  marketOpportunityId: string
  components: Array<{
    type: string
    name: string
    description: string
    readyState: string
  }>
  estimatedRevenue: number
  setupTime: number
  confidence: number
}

interface StrategicDecision {
  id: string
  timestamp: Date
  question: string
  answer: string
  marketDetails: {
    marketSize: number
    speedToProfit: number
    competitionIntensity: string
    regulatoryFriction: string
    clinicalSupply: number
    marketplaceReadiness: number
    requiredCapital: number
    revenue30d: number
    revenue60d: number
    revenue90d: number
  }
  confidence: number
  recommendation: string
}

export default function MarketDominationPage() {
  const [opportunities] = useState<MarketOpportunityType[]>([
    {
      id: '1',
      city: 'Phoenix',
      state: 'AZ',
      serviceType: 'GLP-1 Programs',
      confidence: 0.91,
      riskLevel: 'low',
      profitMultiplier: 3.2,
      speedToMarket: 14,
      killThreshold: 60,
      marketSize: 1240000,
      revenue30d: 89000,
      revenue60d: 189000,
      revenue90d: 342000,
      competitionIntensity: 'low',
      regulatoryFriction: 'low',
      clinicSupply: 3,
      clinicDemand: 12,
      marketplaceReadiness: 0.87,
      requiredCapital: 125000,
      timeToCompetition: 67,
      insights: [
        'Phoenix demand for GLP-1 is up 212% with only 3 verified men\'s clinics',
        'Search velocity +189% over 30 days, CPC remains under $2.10',
        'Clinic supply gap: 9 clinics needed to meet demand',
        'Marketplace inventory ready, product-message fit confirmed',
      ],
    },
    {
      id: '2',
      city: 'Chicago',
      state: 'IL',
      serviceType: 'Peptide Recovery',
      confidence: 0.87,
      riskLevel: 'low',
      profitMultiplier: 2.8,
      speedToMarket: 21,
      killThreshold: 75,
      marketSize: 890000,
      revenue30d: 67000,
      revenue60d: 145000,
      revenue90d: 267000,
      competitionIntensity: 'none',
      regulatoryFriction: 'low',
      clinicSupply: 6,
      clinicDemand: 15,
      marketplaceReadiness: 0.92,
      requiredCapital: 98000,
      timeToCompetition: 82,
      insights: [
        'Chicago peptide recovery searches up 4.3x while CPC remains under $1.90',
        'Zero competition in peptide recovery vertical',
        'High-income professional demographic showing strong intent signals',
        'Assessment routing logic ready, clinic network can absorb demand',
      ],
    },
    {
      id: '3',
      city: 'Austin',
      state: 'TX',
      serviceType: 'Testosterone Optimization',
      confidence: 0.84,
      riskLevel: 'medium',
      profitMultiplier: 2.5,
      speedToMarket: 18,
      killThreshold: 55,
      marketSize: 1560000,
      revenue30d: 112000,
      revenue60d: 245000,
      revenue90d: 489000,
      competitionIntensity: 'low',
      regulatoryFriction: 'low',
      clinicSupply: 8,
      clinicDemand: 18,
      marketplaceReadiness: 0.78,
      requiredCapital: 145000,
      timeToCompetition: 52,
      insights: [
        'Austin testosterone content CTR rising but clinic supply lagging 37%',
        'Tech-executive demographic showing high LTV potential',
        'Competitive saturation warning: market will be overrun in 52 days',
        'SEO cluster content ready, ad funnel templates prepared',
      ],
    },
    {
      id: '4',
      city: 'San Diego',
      state: 'CA',
      serviceType: 'Biohacking Executives',
      confidence: 0.89,
      riskLevel: 'low',
      profitMultiplier: 4.1,
      speedToMarket: 28,
      killThreshold: 90,
      marketSize: 2340000,
      revenue30d: 189000,
      revenue60d: 412000,
      revenue90d: 789000,
      competitionIntensity: 'none',
      regulatoryFriction: 'low',
      clinicSupply: 4,
      clinicDemand: 22,
      marketplaceReadiness: 0.85,
      requiredCapital: 198000,
      timeToCompetition: 94,
      insights: [
        'San Diego "biohacking executives" vertical completely uncontested',
        'High-income demographic with average LTV $4,200',
        '94-day competitive moat - sufficient time to establish dominance',
        'Custom assessment routing required for executive wellness profile',
      ],
    },
  ])

  const [citySignals] = useState<CitySignal[]>([
    {
      city: 'Phoenix',
      state: 'AZ',
      lat: 33.4484,
      lng: -112.0740,
      demand: 12,
      supply: 3,
      opportunity: 9,
      status: 'primed',
      signals: {
        searchVelocity: 189,
        cpcUnderpriced: true,
        clinicOverloaded: true,
        marketplaceGap: false,
      },
    },
    {
      city: 'Chicago',
      state: 'IL',
      lat: 41.8781,
      lng: -87.6298,
      demand: 15,
      supply: 6,
      opportunity: 9,
      status: 'primed',
      signals: {
        searchVelocity: 156,
        cpcUnderpriced: true,
        clinicOverloaded: false,
        marketplaceGap: true,
      },
    },
    {
      city: 'Austin',
      state: 'TX',
      lat: 30.2672,
      lng: -97.7431,
      demand: 18,
      supply: 8,
      opportunity: 10,
      status: 'emerging',
      signals: {
        searchVelocity: 124,
        cpcUnderpriced: false,
        clinicOverloaded: true,
        marketplaceGap: false,
      },
    },
    {
      city: 'San Diego',
      state: 'CA',
      lat: 32.7157,
      lng: -117.1611,
      demand: 22,
      supply: 4,
      opportunity: 18,
      status: 'primed',
      signals: {
        searchVelocity: 98,
        cpcUnderpriced: false,
        clinicOverloaded: true,
        marketplaceGap: true,
      },
    },
    {
      city: 'Denver',
      state: 'CO',
      lat: 39.7392,
      lng: -104.9903,
      demand: 8,
      supply: 2,
      opportunity: 6,
      status: 'emerging',
      signals: {
        searchVelocity: 145,
        cpcUnderpriced: true,
        clinicOverloaded: false,
        marketplaceGap: true,
      },
    },
    {
      city: 'Seattle',
      state: 'WA',
      lat: 47.6062,
      lng: -122.3321,
      demand: 11,
      supply: 5,
      opportunity: 6,
      status: 'emerging',
      signals: {
        searchVelocity: 112,
        cpcUnderpriced: true,
        clinicOverloaded: false,
        marketplaceGap: false,
      },
    },
  ])

  const [verticalProposals] = useState<AutoVerticalProposalType[]>([
    {
      id: '1',
      name: 'Post-Glow Up Hormone Reset',
      marketOpportunityId: '1',
      components: [
        {
          type: 'service_category',
          name: 'Post-Glow Up Hormone Reset Service',
          description: 'New service category targeting post-weight loss hormone optimization',
          readyState: 'ready',
        },
        {
          type: 'marketplace_category',
          name: 'Maintenance Supplements',
          description: 'Marketplace category for post-treatment maintenance products',
          readyState: 'ready',
        },
        {
          type: 'city_page',
          name: 'Phoenix Post-Glow Up Services',
          description: 'Dedicated landing page for Phoenix market',
          readyState: 'ready',
        },
        {
          type: 'seo_cluster',
          name: 'Post-Weight Loss Hormone SEO',
          description: '15-article SEO cluster targeting post-GLP-1 hormone topics',
          readyState: 'pending',
        },
        {
          type: 'assessment_routing',
          name: 'Post-GLP-1 Assessment Flow',
          description: 'Custom routing logic for post-weight loss patients',
          readyState: 'ready',
        },
        {
          type: 'ad_funnel',
          name: 'Phoenix GLP-1 Retargeting',
          description: 'Ad funnel structure for Phoenix market',
          readyState: 'ready',
        },
      ],
      estimatedRevenue: 342000,
      setupTime: 14,
      confidence: 0.91,
    },
    {
      id: '2',
      name: 'Biohacking Executives Vertical',
      marketOpportunityId: '4',
      components: [
        {
          type: 'service_category',
          name: 'Executive Biohacking Programs',
          description: 'Premium service tier for high-income executives',
          readyState: 'ready',
        },
        {
          type: 'marketplace_category',
          name: 'Biohacking Devices & Supplements',
          description: 'Premium marketplace category for executives',
          readyState: 'pending',
        },
        {
          type: 'city_page',
          name: 'San Diego Executive Biohacking',
          description: 'High-end landing page for San Diego executives',
          readyState: 'ready',
        },
        {
          type: 'seo_cluster',
          name: 'Executive Wellness SEO',
          description: '20-article cluster on executive biohacking topics',
          readyState: 'requires_setup',
        },
        {
          type: 'assessment_routing',
          name: 'Executive Wellness Profile',
          description: 'Custom assessment for executive demographic',
          readyState: 'ready',
        },
        {
          type: 'ad_funnel',
          name: 'San Diego Executive Funnel',
          description: 'Premium ad funnel for executive audience',
          readyState: 'ready',
        },
      ],
      estimatedRevenue: 789000,
      setupTime: 28,
      confidence: 0.89,
    },
  ])

  const [strategicDecisions] = useState<StrategicDecision[]>([
    {
      id: '1',
      timestamp: new Date(),
      question: 'Where is the next $100k market?',
      answer:
        'Phoenix GLP-1 Programs represents a $100k+ opportunity within 30 days. Market demand up 212% with only 3 clinics serving the need. Clinic supply gap of 9 creates immediate expansion opportunity. Search velocity accelerating, CPC underpriced at $2.10. Marketplace inventory ready. Estimated 90-day revenue: $342K with $125K capital deployment.',
      marketDetails: {
        marketSize: 1240000,
        speedToProfit: 14,
        competitionIntensity: 'low',
        regulatoryFriction: 'low',
        clinicalSupply: 3,
        marketplaceReadiness: 0.87,
        requiredCapital: 125000,
        revenue30d: 89000,
        revenue60d: 189000,
        revenue90d: 342000,
      },
      confidence: 0.91,
      recommendation:
        'Launch Phoenix GLP-1 vertical immediately. Deploy clinic partnerships, activate marketplace inventory, trigger SEO cluster, and scale ad funnel. Target 14-day speed to profit.',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000),
      question: 'What city is primed for domination?',
      answer:
        'San Diego is primed for "Biohacking Executives" vertical domination. Zero competition, high-income demographic (avg LTV $4,200), 94-day competitive moat. Clinic supply gap: 18. Search signals accelerating. Regulatory friction: low. Can establish market dominance uncontested for 90+ days.',
      marketDetails: {
        marketSize: 2340000,
        speedToProfit: 28,
        competitionIntensity: 'none',
        regulatoryFriction: 'low',
        clinicalSupply: 4,
        marketplaceReadiness: 0.85,
        requiredCapital: 198000,
        revenue30d: 189000,
        revenue60d: 412000,
        revenue90d: 789000,
      },
      confidence: 0.89,
      recommendation:
        'Deploy Biohacking Executives vertical in San Diego. Premium positioning, high-margin services, executive wellness assessment routing. Estimated 90-day revenue: $789K.',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000),
      question: 'What service is under-supplied?',
      answer:
        'Peptide Recovery therapy is severely under-supplied in Chicago. Demand: 15 clinics. Supply: 6 clinics. Gap: 9 clinics. Search velocity up 4.3x, CPC remains under $1.90 (highly underpriced). Zero competition in this vertical. Assessment routing logic ready. Marketplace products available. High-margin opportunity with low regulatory friction.',
      marketDetails: {
        marketSize: 890000,
        speedToProfit: 21,
        competitionIntensity: 'none',
        regulatoryFriction: 'low',
        clinicalSupply: 6,
        marketplaceReadiness: 0.92,
        requiredCapital: 98000,
        revenue30d: 67000,
        revenue60d: 145000,
        revenue90d: 267000,
      },
      confidence: 0.87,
      recommendation:
        'Launch Peptide Recovery vertical in Chicago. Fill clinic supply gap, activate marketplace, deploy SEO content, scale traffic immediately. 82-day competitive window.',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 10800000),
      question: 'Where can Novalyte win uncontested for 90 days?',
      answer:
        'San Diego Biohacking Executives: 94-day competitive moat. Zero competition. High barriers to entry (executive assessment routing, premium positioning). Denver Peptide Recovery: 78-day window. Phoenix GLP-1 Post-Care: 67-day window. All three markets show strong demand signals with minimal competitive pressure.',
      marketDetails: {
        marketSize: 1560000,
        speedToProfit: 18,
        competitionIntensity: 'low',
        regulatoryFriction: 'low',
        clinicalSupply: 8,
        marketplaceReadiness: 0.82,
        requiredCapital: 145000,
        revenue30d: 112000,
        revenue60d: 245000,
        revenue90d: 489000,
      },
      confidence: 0.92,
      recommendation:
        'Prioritize San Diego Biohacking Executives for 90-day uncontested run. Deploy all vertical components immediately. Establish market leadership before competitors notice.',
    },
  ])

  const [metrics, setMetrics] = useState({
    activeOpportunities: 4,
    marketsDiscovered: 12,
    verticalsDeployed: 8,
    revenueFromNewMarkets: 2340000,
    competitiveMoats: 3,
  })

  const handleApproveOpportunity = async (id: string) => {
    const opportunity = opportunities.find((o) => o.id === id)
    await createAuditEntry('approve_market_expansion', {
      opportunityId: id,
      city: opportunity?.city,
      serviceType: opportunity?.serviceType,
      requiredCapital: opportunity?.requiredCapital,
      forecastedRevenue: opportunity?.revenue90d,
    })
  }

  const handleKillOpportunity = async (id: string) => {
    const opportunity = opportunities.find((o) => o.id === id)
    await createAuditEntry('kill_market_opportunity', {
      opportunityId: id,
      city: opportunity?.city,
      reason: 'Superadmin override',
    })
  }

  const handleApproveVertical = async (id: string) => {
    const proposal = verticalProposals.find((v) => v.id === id)
    await createAuditEntry('approve_vertical_deployment', {
      proposalId: id,
      verticalName: proposal?.name,
      estimatedRevenue: proposal?.estimatedRevenue,
    })
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Market Domination Engine</h1>
            <p className="text-gray-400">
              Military-grade market intelligence engine that builds new revenue territories on command
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <button
              onClick={() => createAuditEntry('export_market_report', {})}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Active Opportunities</p>
          <p className="text-2xl font-bold text-white">{metrics.activeOpportunities}</p>
          <p className="text-xs text-status-live mt-1">Ready to deploy</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Markets Discovered</p>
          <p className="text-2xl font-bold text-white">{metrics.marketsDiscovered}</p>
          <p className="text-xs text-gray-500 mt-1">Total tracked</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Verticals Deployed</p>
          <p className="text-2xl font-bold text-white">{metrics.verticalsDeployed}</p>
          <p className="text-xs text-status-live mt-1">Live in market</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Revenue from New Markets</p>
          <p className="text-2xl font-bold text-status-live">
            {formatCurrency(metrics.revenueFromNewMarkets)}
          </p>
          <p className="text-xs text-gray-500 mt-1">90-day total</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Competitive Moats</p>
          <p className="text-2xl font-bold text-white">{metrics.competitiveMoats}</p>
          <p className="text-xs text-status-live mt-1">90+ day protection</p>
        </div>
      </div>

      {/* Market Radar Map */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Live Market Radar Map</h2>
        <MarketRadarMap cities={citySignals} />
      </div>

      {/* Gemini Strategic Reasoning */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Gemini Strategic Reasoning Core</h2>
        <GeminiStrategicReasoning decisions={strategicDecisions} />
      </div>

      {/* Market Opportunities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Market Domination Opportunities</h2>
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <MarketOpportunity
              key={opportunity.id}
              opportunity={opportunity}
              onApprove={handleApproveOpportunity}
              onKill={handleKillOpportunity}
            />
          ))}
        </div>
      </div>

      {/* Auto-Vertical Proposals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Auto-Vertical Creation Proposals</h2>
        <div className="space-y-4">
          {verticalProposals.map((proposal) => (
            <AutoVerticalProposal
              key={proposal.id}
              proposal={proposal}
              onApprove={handleApproveVertical}
            />
          ))}
        </div>
      </div>

      {/* Expansion Forecast Timeline */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Expansion Forecast Timeline</h3>
        <RealtimeChart
          dataKey="expansion"
          color="#10b981"
          type="area"
          height={300}
          initialValue={1200000}
        />
        <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-gray-400 mb-1">Q1 Forecast</p>
            <p className="text-white font-medium">$3.2M</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Q2 Forecast</p>
            <p className="text-white font-medium">$4.8M</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Q3 Forecast</p>
            <p className="text-white font-medium">$6.4M</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Q4 Forecast</p>
            <p className="text-white font-medium">$8.9M</p>
          </div>
        </div>
      </div>

      {/* Competitive Saturation Warnings */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-status-degraded" />
          <h3 className="text-lg font-semibold text-white">Competitive Saturation Warnings</h3>
        </div>
        <div className="space-y-3">
          {[
            {
              city: 'Austin, TX',
              service: 'Testosterone Optimization',
              warning: 'This market will be overrun in 46 days',
              daysRemaining: 46,
              action: 'Accelerate launch to establish dominance',
            },
            {
              city: 'Miami, FL',
              service: 'TRT Programs',
              warning: 'Competitive saturation detected. Market share declining',
              daysRemaining: 12,
              action: 'Consider market exit or pivot to adjacent vertical',
            },
          ].map((warning, idx) => (
            <div
              key={idx}
              className="border border-red-500/30 bg-red-500/10 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {warning.city} - {warning.service}
                  </p>
                  <p className="text-xs text-red-400">{warning.warning}</p>
                </div>
                <span className="text-xs text-red-400 font-medium">{warning.daysRemaining} days</span>
              </div>
              <p className="text-xs text-gray-300 mt-2">{warning.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* High-Margin Vertical Leaderboard */}
      <div className="bg-dark-surface border border-dark-border rounded-lg mb-8">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-white">High-Margin Vertical Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vertical
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Profit Multiplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Revenue (90d)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Competition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Competitive Window
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-dark-hover transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">{opp.serviceType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {opp.city}, {opp.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-status-live">
                      {opp.profitMultiplier.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(opp.revenue90d)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      opp.competitionIntensity === 'none'
                        ? 'bg-status-live/20 text-status-live'
                        : opp.competitionIntensity === 'low'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {opp.competitionIntensity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        opp.timeToCompetition < 60 ? 'text-red-400' : 'text-status-live'
                      }`}
                    >
                      {opp.timeToCompetition} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs px-2 py-1 bg-status-live/20 text-status-live rounded-full">
                      Ready
                    </span>
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


'use client'

import { useState } from 'react'
import { TrendingUp, Search, Sparkles, Target, MapPin, AlertCircle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'

interface DemandRegion {
  region: string
  serviceLine: string
  demandIndex: number
  trend: 'Rising' | 'Stable' | 'Falling'
}

interface TargetClinic {
  name: string
  city: string
  state: string
  serviceLines: string[]
  needsPatients: 'Yes' | 'No' | 'At Capacity'
  suggestedAction: string
}

interface MarketBrief {
  question: string
  topRegions: string[]
  reasoning: string
  recommendedMove: string
}

const QUICK_ACTIONS = [
  "Where should we deploy TRT ads right now?",
  "Which regions are spiking in weight loss demand?",
  "List clinics in Texas likely needing TRT patients.",
  "Where is IV therapy demand growing but supply is weak?"
]

export default function MarketIntelligencePage() {
  const [query, setQuery] = useState('')
  const [hasScanned, setHasScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  
  // Mock data states
  const [marketBrief, setMarketBrief] = useState<MarketBrief | null>(null)
  const [demandData, setDemandData] = useState<DemandRegion[]>([])
  const [targetClinics, setTargetClinics] = useState<TargetClinic[]>([])
  const [actionRecommendations, setActionRecommendations] = useState<string[]>([])

  const generateMockResponse = (question: string) => {
    // Determine service line from query
    const isTRT = question.toLowerCase().includes('trt') || question.toLowerCase().includes('testosterone')
    const isWeightLoss = question.toLowerCase().includes('weight loss') || question.toLowerCase().includes('glp')
    const isIV = question.toLowerCase().includes('iv therapy') || question.toLowerCase().includes('iv ')
    
    let serviceLine = 'TRT'
    if (isWeightLoss) serviceLine = 'Weight Loss'
    if (isIV) serviceLine = 'IV Therapy'

    // Generate market brief
    const brief: MarketBrief = {
      question: question,
      topRegions: isTRT ? ['Texas', 'Florida', 'California'] : 
                  isWeightLoss ? ['California', 'New York', 'Florida'] :
                  ['Texas', 'Arizona', 'Colorado'],
      reasoning: isTRT 
        ? 'Texas, Florida, and California show highest search volume for testosterone therapy, strong male demographic aged 35-55, and increasing assessment starts. Search intent is up 34% QoQ in Texas.'
        : isWeightLoss
        ? 'California, New York, and Florida lead in GLP-1 search volume and weight loss clinic searches. High disposable income markets with strong health consciousness and rising obesity awareness.'
        : 'Texas, Arizona, and Colorado show emerging IV therapy demand driven by wellness trends, athletic populations, and recovery culture. Supply remains limited, creating opportunity.',
      recommendedMove: isTRT
        ? 'Deploy TRT ads in Texas, Florida, and California with budget split 40/35/25. Target men 35-55, professionals, emphasizing energy and vitality. Prioritize Dallas, Austin, Miami, and San Diego metro areas.'
        : isWeightLoss
        ? 'Launch GLP-1 campaigns in California (Los Angeles, San Diego) and New York City with 50/30 budget split. Target affluent professionals 30-50. Emphasize medical supervision and personalized plans.'
        : 'Test IV therapy ads in Austin, Phoenix, and Denver with focus on athletic recovery and executive wellness. Budget: $15K test across all three markets. Target 25-45, active lifestyle.',
    }

    // Generate demand data
    const demand: DemandRegion[] = isTRT ? [
      { region: 'Texas', serviceLine: 'TRT', demandIndex: 92, trend: 'Rising' },
      { region: 'Florida', serviceLine: 'TRT', demandIndex: 87, trend: 'Rising' },
      { region: 'California', serviceLine: 'TRT', demandIndex: 84, trend: 'Stable' },
      { region: 'Arizona', serviceLine: 'TRT', demandIndex: 78, trend: 'Rising' },
      { region: 'Colorado', serviceLine: 'TRT', demandIndex: 71, trend: 'Stable' },
      { region: 'New York', serviceLine: 'TRT', demandIndex: 68, trend: 'Falling' },
    ] : isWeightLoss ? [
      { region: 'California', serviceLine: 'Weight Loss', demandIndex: 95, trend: 'Rising' },
      { region: 'New York', serviceLine: 'Weight Loss', demandIndex: 88, trend: 'Rising' },
      { region: 'Florida', serviceLine: 'Weight Loss', demandIndex: 82, trend: 'Stable' },
      { region: 'Texas', serviceLine: 'Weight Loss', demandIndex: 76, trend: 'Rising' },
      { region: 'Illinois', serviceLine: 'Weight Loss', demandIndex: 71, trend: 'Stable' },
      { region: 'Washington', serviceLine: 'Weight Loss', demandIndex: 65, trend: 'Falling' },
    ] : [
      { region: 'Texas', serviceLine: 'IV Therapy', demandIndex: 89, trend: 'Rising' },
      { region: 'Arizona', serviceLine: 'IV Therapy', demandIndex: 83, trend: 'Rising' },
      { region: 'Colorado', serviceLine: 'IV Therapy', demandIndex: 79, trend: 'Rising' },
      { region: 'California', serviceLine: 'IV Therapy', demandIndex: 74, trend: 'Stable' },
      { region: 'Florida', serviceLine: 'IV Therapy', demandIndex: 68, trend: 'Stable' },
    ]

    // Generate target clinics
    const clinics: TargetClinic[] = isTRT ? [
      { name: 'Austin Men\'s Health Center', city: 'Austin', state: 'TX', serviceLines: ['TRT', 'GLP-1', 'Peptides'], needsPatients: 'Yes', suggestedAction: 'Pitch 50 high-intent TRT leads' },
      { name: 'Dallas Vitality Clinic', city: 'Dallas', state: 'TX', serviceLines: ['TRT', 'IV Therapy'], needsPatients: 'At Capacity', suggestedAction: 'Offer overflow routing' },
      { name: 'Miami Optimal Health', city: 'Miami', state: 'FL', serviceLines: ['TRT', 'GLP-1', 'Peptides'], needsPatients: 'Yes', suggestedAction: 'Launch intro campaign' },
      { name: 'Phoenix Men\'s Clinic', city: 'Phoenix', state: 'AZ', serviceLines: ['TRT'], needsPatients: 'Yes', suggestedAction: 'Pitch lead bundle + onboarding' },
      { name: 'San Diego Wellness Group', city: 'San Diego', state: 'CA', serviceLines: ['TRT', 'GLP-1'], needsPatients: 'Yes', suggestedAction: 'Offer premium lead tier' },
    ] : isWeightLoss ? [
      { name: 'LA Weight & Wellness', city: 'Los Angeles', state: 'CA', serviceLines: ['GLP-1', 'Weight Loss'], needsPatients: 'Yes', suggestedAction: 'Pitch GLP-1 lead package' },
      { name: 'NYC Metabolic Health', city: 'New York', state: 'NY', serviceLines: ['GLP-1', 'TRT'], needsPatients: 'Yes', suggestedAction: 'Launch premium campaign' },
      { name: 'Miami Optimal Health', city: 'Miami', state: 'FL', serviceLines: ['TRT', 'GLP-1', 'Peptides'], needsPatients: 'Yes', suggestedAction: 'Cross-sell GLP-1 to TRT patients' },
      { name: 'San Diego Wellness Group', city: 'San Diego', state: 'CA', serviceLines: ['TRT', 'GLP-1'], needsPatients: 'Yes', suggestedAction: 'Offer intro campaign' },
    ] : [
      { name: 'Austin Recovery Center', city: 'Austin', state: 'TX', serviceLines: ['IV Therapy', 'TRT'], needsPatients: 'Yes', suggestedAction: 'Launch IV therapy test campaign' },
      { name: 'Phoenix Wellness Lounge', city: 'Phoenix', state: 'AZ', serviceLines: ['IV Therapy', 'Peptides'], needsPatients: 'Yes', suggestedAction: 'Pitch athletic recovery leads' },
      { name: 'Denver Peak Performance', city: 'Denver', state: 'CO', serviceLines: ['TRT', 'Peptides'], needsPatients: 'Yes', suggestedAction: 'Add IV therapy service line' },
    ]

    // Generate action recommendations
    const actions: string[] = isTRT ? [
      'Launch TRT campaign in Texas targeting ages 35-55 with $25K initial budget.',
      'Reach out to Austin Men\'s Health Center with 50 high-intent TRT leads.',
      'Deploy retargeting ads in Florida for assessment abandoners.',
      'Offer Dallas Vitality Clinic overflow routing partnership.',
      'Test video ad creative emphasizing energy and vitality in top 3 markets.',
    ] : isWeightLoss ? [
      'Launch GLP-1 campaign in California (LA & San Diego) with $40K budget.',
      'Partner with NYC Metabolic Health for premium patient referrals.',
      'Create educational content series about GLP-1 safety and efficacy.',
      'Offer LA Weight & Wellness exclusive lead bundle at launch pricing.',
      'Test influencer partnerships in high-income ZIP codes.',
    ] : [
      'Test IV therapy ads in Austin, Phoenix, Denver with $15K total budget.',
      'Reach out to Austin Recovery Center with partnership proposal.',
      'Create "Athletic Recovery" content targeting fitness enthusiasts.',
      'Offer Phoenix Wellness Lounge athlete lead package.',
      'Survey existing TRT patients for IV therapy interest in all markets.',
    ]

    return { brief, demand, clinics, actions }
  }

  const handleRunScan = () => {
    if (!query.trim()) return
    
    setScanning(true)
    
    // Simulate API delay
    setTimeout(() => {
      const response = generateMockResponse(query)
      setMarketBrief(response.brief)
      setDemandData(response.demand)
      setTargetClinics(response.clinics)
      setActionRecommendations(response.actions)
      setHasScanned(true)
      setScanning(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {
    setQuery(action)
    setTimeout(() => {
      const response = generateMockResponse(action)
      setMarketBrief(response.brief)
      setDemandData(response.demand)
      setTargetClinics(response.clinics)
      setActionRecommendations(response.actions)
      setHasScanned(true)
    }, 1500)
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Market Intelligence Console
            </h1>
            <p className="text-gray-400 mt-2">
              Ask the market a question and get a move, not a report.
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunScan()}
              placeholder="Ask anything: 'Where are GLP-1 clinics needing patients this month?'"
              className="w-full bg-dark-accent border border-dark-border rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-lg"
            />
          </div>
          <button
            onClick={handleRunScan}
            disabled={scanning || !query.trim()}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Run Market Scan
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action)}
              className="px-3 py-1.5 bg-dark-accent border border-dark-border rounded-full text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {hasScanned && marketBrief && (
        <div className="space-y-6">
          {/* AI Market Briefing */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">AI Market Briefing</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4 italic">
              "{marketBrief.question}"
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  Top Regions to Target
                </h3>
                <div className="flex flex-wrap gap-2">
                  {marketBrief.topRegions.map((region, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm text-white font-medium"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-status-live uppercase tracking-wide mb-2">
                  Why These Regions
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {marketBrief.reasoning}
                </p>
              </div>

              <div className="bg-dark-surface/80 border border-primary/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  Recommended Move
                </h3>
                <p className="text-sm text-white leading-relaxed font-medium">
                  {marketBrief.recommendedMove}
                </p>
              </div>
            </div>
          </div>

          {/* Demand Heat & Clinics List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand by Region */}
            <div className="bg-dark-surface border border-dark-border rounded-lg">
              <div className="p-4 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-white">Demand by Region</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-accent border-b border-dark-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Demand</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {demandData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-dark-hover transition-colors">
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.region}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.serviceLine}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-dark-accent rounded-full h-2 max-w-[80px]">
                              <div
                                className={clsx(
                                  'h-2 rounded-full',
                                  item.demandIndex >= 85 ? 'bg-status-live' : 
                                  item.demandIndex >= 70 ? 'bg-status-degraded' : 'bg-gray-500'
                                )}
                                style={{ width: `${item.demandIndex}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-medium">{item.demandIndex}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-medium',
                              item.trend === 'Rising' && 'bg-status-live/10 text-status-live',
                              item.trend === 'Stable' && 'bg-gray-500/10 text-gray-400',
                              item.trend === 'Falling' && 'bg-status-offline/10 text-status-offline'
                            )}
                          >
                            {item.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinics to Target */}
            <div className="bg-dark-surface border border-dark-border rounded-lg">
              <div className="p-4 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-white">Clinics to Target</h3>
                </div>
              </div>
              <div className="divide-y divide-dark-border max-h-[400px] overflow-y-auto">
                {targetClinics.map((clinic, idx) => (
                  <div key={idx} className="p-4 hover:bg-dark-hover transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{clinic.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {clinic.city}, {clinic.state}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                          clinic.needsPatients === 'Yes' && 'bg-status-live/10 text-status-live',
                          clinic.needsPatients === 'No' && 'bg-gray-500/10 text-gray-400',
                          clinic.needsPatients === 'At Capacity' && 'bg-status-degraded/10 text-status-degraded'
                        )}
                      >
                        {clinic.needsPatients === 'Yes' ? 'Needs Patients' : clinic.needsPatients}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {clinic.serviceLines.map((service, sidx) => (
                        <span
                          key={sidx}
                          className="text-xs px-1.5 py-0.5 bg-dark-accent rounded text-gray-400"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-primary font-medium">
                      → {clinic.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Recommended Moves</h3>
            </div>
            <ul className="space-y-3">
              {actionRecommendations.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                  <span className="text-sm text-gray-300 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasScanned && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Ask the market a question
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the query bar above to ask about demand, clinics, or where to deploy ads. 
            Get actionable intelligence in seconds.
          </p>
        </div>
      )}
    </div>
  )
}


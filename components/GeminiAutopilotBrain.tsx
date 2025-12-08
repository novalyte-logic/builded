'use client'

import { Brain, TrendingUp, AlertCircle, Target, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AutopilotDecision {
  id: string
  timestamp: Date
  decision: string
  reasoning: string
  causality: {
    attribution: string
    revenuePath: string
    expectedOutcome: string
  }
  simulation: {
    scenario: string
    projectedRevenue: number
    projectedSpend: number
    projectedNetProfit: number
    confidence: number
  }
  risks: string[]
  opportunities: string[]
  recommendation: string
}

interface GeminiAutopilotBrainProps {
  decisions: AutopilotDecision[]
}

export default function GeminiAutopilotBrain({ decisions }: GeminiAutopilotBrainProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Gemini Autopilot Brain</h3>
      </div>
      <div className="space-y-4">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-2">{decision.decision}</p>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{decision.reasoning}</p>
              </div>
              <span className="text-xs text-gray-500">
                {decision.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {/* Revenue Causality */}
            <div className="mt-3 pt-3 border-t border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-gray-400">Revenue Causality Reasoning</span>
              </div>
              <div className="space-y-2 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">Attribution: </span>
                  <span>{decision.causality.attribution}</span>
                </div>
                <div>
                  <span className="text-gray-500">Revenue Path: </span>
                  <span>{decision.causality.revenuePath}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expected Outcome: </span>
                  <span className="text-status-live">{decision.causality.expectedOutcome}</span>
                </div>
              </div>
            </div>

            {/* Simulation */}
            <div className="mt-3 pt-3 border-t border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-status-live" />
                <span className="text-xs font-medium text-gray-400">Predictive Scaling Simulation</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Projected Revenue</p>
                  <p className="text-status-live font-medium">
                    {formatCurrency(decision.simulation.projectedRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Projected Spend</p>
                  <p className="text-white font-medium">
                    {formatCurrency(decision.simulation.projectedSpend)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Net Profit</p>
                  <p className="text-status-live font-medium">
                    {formatCurrency(decision.simulation.projectedNetProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Confidence</p>
                  <p className="text-white font-medium">
                    {(decision.simulation.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{decision.simulation.scenario}</p>
            </div>

            {/* Risks & Opportunities */}
            <div className="mt-3 pt-3 border-t border-dark-border grid grid-cols-1 md:grid-cols-2 gap-4">
              {decision.risks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3 h-3 text-status-degraded" />
                    <span className="text-xs font-medium text-gray-400">Risks</span>
                  </div>
                  <ul className="space-y-1">
                    {decision.risks.map((risk, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-status-degraded mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {decision.opportunities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-gray-400">Opportunities</span>
                  </div>
                  <ul className="space-y-1">
                    {decision.opportunities.map((opp, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div className="mt-3 pt-3 border-t border-dark-border">
              <p className="text-xs font-medium text-gray-400 mb-1">Recommendation:</p>
              <p className="text-sm text-white font-medium">{decision.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


'use client'

interface FeatureWeight {
  name: string
  weight: number
  impact: 'positive' | 'negative' | 'neutral'
  value: number | string
}

interface FeatureWeightsProps {
  features: FeatureWeight[]
  title?: string
}

export default function FeatureWeights({ features, title = 'Top Influencing Factors' }: FeatureWeightsProps) {
  const sortedFeatures = [...features].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {sortedFeatures.map((feature, index) => {
          const weightPercent = Math.abs(feature.weight * 100)
          const isPositive = feature.impact === 'positive'
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">#{index + 1}</span>
                  <span className="text-sm text-white">{feature.name}</span>
                  {feature.value && (
                    <span className="text-xs text-gray-500">({feature.value})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? 'text-status-live' : 'text-status-offline'
                    }`}
                  >
                    {isPositive ? '+' : '-'}{weightPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-dark-accent rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isPositive ? 'bg-status-live' : 'bg-status-offline'
                  }`}
                  style={{ width: `${weightPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


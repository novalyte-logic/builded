'use client'

import { MapPin, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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

interface MarketRadarMapProps {
  cities: CitySignal[]
}

export default function MarketRadarMap({ cities }: MarketRadarMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerging':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      case 'primed':
        return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'saturated':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400'
      case 'dominated':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Live Market Radar Map</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getStatusColor(city.status)}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {city.city}, {city.state}
              </span>
              <span className="text-xs px-2 py-0.5 bg-dark-accent rounded-full uppercase">
                {city.status}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="opacity-75">Demand</span>
                <span className="font-medium">{city.demand}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Supply</span>
                <span className="font-medium">{city.supply}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Opportunity</span>
                <span className="font-medium">{city.opportunity > 0 ? '+' : ''}{city.opportunity}</span>
              </div>
              <div className="pt-2 border-t border-dark-border space-y-1">
                {city.signals.searchVelocity > 50 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Search +{city.signals.searchVelocity}%</span>
                  </div>
                )}
                {city.signals.cpcUnderpriced && (
                  <div className="flex items-center gap-1">
                    <span className="text-status-live">•</span>
                    <span>Underpriced CPC</span>
                  </div>
                )}
                {city.signals.clinicOverloaded && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Clinic Overload</span>
                  </div>
                )}
                {city.signals.marketplaceGap && (
                  <div className="flex items-center gap-1">
                    <span className="text-primary">•</span>
                    <span>Marketplace Gap</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


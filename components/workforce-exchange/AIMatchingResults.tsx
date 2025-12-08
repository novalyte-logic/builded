'use client'

import { Brain, CheckCircle, MapPin, Star, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { WorkforceMatch, PractitionerProfile } from '@/lib/types/workforce'

interface AIMatchingResultsProps {
  matches: Array<WorkforceMatch & { practitioner: PractitionerProfile }>
  onSelectMatch: (matchId: string) => void
}

export default function AIMatchingResults({ matches, onSelectMatch }: AIMatchingResultsProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-status-live/20 text-status-live border-status-live/30'
    if (score >= 75) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">AI Matching Results — Top 5 Matches</h3>
      </div>

      <div className="space-y-3">
        {matches.map((match, idx) => (
          <div
            key={match.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-5 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => onSelectMatch(match.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-400">#{idx + 1} Match</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getMatchScoreColor(
                      match.matchScore
                    )}`}
                  >
                    {match.matchScore}% Match
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {match.practitioner.firstName} {match.practitioner.lastName} — {match.practitioner.role}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">{match.explanation}</p>
              </div>
            </div>

            {/* Compatibility Factors */}
            <div className="grid grid-cols-4 gap-3 mb-3 pt-3 border-t border-dark-border">
              <div>
                <p className="text-xs text-gray-400 mb-1">Skills</p>
                <div className="w-full bg-dark-surface rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.skills}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{match.compatibilityFactors.skills}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <div className="w-full bg-dark-surface rounded-full h-2">
                  <div
                    className="bg-status-live h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.location}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{match.compatibilityFactors.location}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Availability</p>
                <div className="w-full bg-dark-surface rounded-full h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.availability}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{match.compatibilityFactors.availability}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Rating</p>
                <div className="w-full bg-dark-surface rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.rating}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{match.compatibilityFactors.rating}%</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{match.practitioner.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {match.practitioner.location.city}, {match.practitioner.location.state}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-white font-medium">
                  Est. Cost: {formatCurrency(match.estimatedCost)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-dark-border">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                Request This Practitioner
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


'use client'

import { Eye, Lightbulb, UserCog, Rocket, AlertTriangle } from 'lucide-react'

export type AutopilotMode = 'observe' | 'assist' | 'copilot' | 'full'

interface AutopilotModeSelectorProps {
  mode: AutopilotMode
  onChange: (mode: AutopilotMode) => void
}

export default function AutopilotModeSelector({ mode, onChange }: AutopilotModeSelectorProps) {
  const modes = [
    {
      id: 'observe' as const,
      name: 'OBSERVE',
      description: 'No automation, data only',
      icon: Eye,
      color: 'border-gray-500/30 bg-gray-500/10',
      textColor: 'text-gray-400',
      hoverColor: 'hover:bg-gray-500/20',
    },
    {
      id: 'assist' as const,
      name: 'ASSIST',
      description: 'AI recommends, Superadmin approves',
      icon: Lightbulb,
      color: 'border-blue-500/30 bg-blue-500/10',
      textColor: 'text-blue-400',
      hoverColor: 'hover:bg-blue-500/20',
    },
    {
      id: 'copilot' as const,
      name: 'CO-PILOT',
      description: 'AI executes under guardrails',
      icon: UserCog,
      color: 'border-yellow-500/30 bg-yellow-500/10',
      textColor: 'text-yellow-400',
      hoverColor: 'hover:bg-yellow-500/20',
    },
    {
      id: 'full' as const,
      name: 'FULL AUTOPILOT',
      description: 'AI deploys capital autonomously',
      icon: Rocket,
      color: 'border-green-500/30 bg-green-500/10',
      textColor: 'text-green-400',
      hoverColor: 'hover:bg-green-500/20',
    },
  ]

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Autopilot Mode</h3>
        {mode === 'full' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-status-offline/20 border border-status-offline/30 rounded-full">
            <AlertTriangle className="w-3 h-3 text-status-offline" />
            <span className="text-xs text-status-offline font-medium">LIVE</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon
          const isActive = mode === modeOption.id
          
          return (
            <button
              key={modeOption.id}
              onClick={() => onChange(modeOption.id)}
              className={`border rounded-lg p-4 text-left transition-all ${
                isActive
                  ? `${modeOption.color} ${modeOption.textColor} ring-2 ring-primary`
                  : 'border-dark-border bg-dark-accent text-gray-400 hover:border-dark-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{modeOption.name}</span>
              </div>
              <p className="text-xs opacity-75">{modeOption.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}


'use client'

interface NoShowHeatmapProps {
  data: Array<{
    dayOfWeek: string
    noShowRate: number
    count: number
  }>
}

export default function NoShowHeatmap({ data }: NoShowHeatmapProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const getHeatmapColor = (rate: number) => {
    if (rate >= 0.25) return 'bg-red-500/80'
    if (rate >= 0.15) return 'bg-orange-500/70'
    if (rate >= 0.10) return 'bg-yellow-500/60'
    if (rate >= 0.05) return 'bg-yellow-500/40'
    return 'bg-status-live/40'
  }

  const getTextColor = (rate: number) => {
    if (rate >= 0.15) return 'text-white'
    return 'text-gray-300'
  }

  // Fill in missing days with zero rate
  const filledData = days.map((day) => {
    const existing = data.find((d) => d.dayOfWeek === day)
    return existing || { dayOfWeek: day, noShowRate: 0, count: 0 }
  })

  const maxRate = Math.max(...filledData.map((d) => d.noShowRate))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">No-Show Rate by Day of Week</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-status-live/40 rounded" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500/60 rounded" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500/80 rounded" />
            <span>High</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {filledData.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`${getHeatmapColor(day.noShowRate)} rounded-lg p-3 text-center border border-dark-border`}
          >
            <p className={`text-xs font-medium mb-1 ${getTextColor(day.noShowRate)}`}>
              {day.dayOfWeek.substring(0, 3)}
            </p>
            <p className={`text-sm font-bold ${getTextColor(day.noShowRate)}`}>
              {(day.noShowRate * 100).toFixed(0)}%
            </p>
            <p className={`text-xs ${getTextColor(day.noShowRate)} opacity-75`}>
              {day.count} shows
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

